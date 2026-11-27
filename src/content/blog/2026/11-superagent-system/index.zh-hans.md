---
title: "Super-agent 是一个系统，不是一个 Session"
description: "细读 DeepSeek Harness 的 Super-agent 设计与 dsh-superagent-prototype：常驻 Router、隔离 Worker、事件驱动 Trigger、全双工 ReAct，以及计算、状态与环境的分离。"
pubDate: 2026-11-26
category: "AI"
tags: ["AI Agents", "DeepSeek", "Harness", "Architecture", "RepoNotes"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分钟"
cardImage: "./cover.webp"
cardImageAlt: "dsh-superagent 原型的架构图：来源与工具进入 Engine，Engine 协调 Store、Policy、Executor 与 Effects"
---

> **article.md** — [agent-readable file](/blog/2026/11-superagent-system/article.md)
>
> **English description.** `dsh-superagent` is a proactive coding agent for one GitHub repository, packaged as a bundle for DeepSeek Harness. It listens to GitHub and, optionally, Feishu. When an authorized person asks for work, it opens a work item, works on it in its own agent session and directory, and answers in the original conversation, for example with a pull request. ([source](https://github.com/deepseek-ai/dsh-superagent-prototype))
>
> **Original article.** [Super-agent 设计探索：迈向更自主的 Agent 系统](https://zhuanlan.zhihu.com/p/2099987320443237060)
>
> **Rendering.** Plain Markdown in the site's normal body font; no display face, image-only text, or decorative substitution.

多数 agent 展示仍然长得一样：一个聊天窗口、一个模型、一个任务。你输入需求，模型调用几个工具，结果出现。真正有趣的工程在循环里面——模型怎么规划、工具怎么描述、错误怎么重试。

DeepSeek Harness 团队的文章〈Super-agent 设计探索：迈向更自主的 Agent 系统〉从别的地方开始。它主张下一个瓶颈不是模型完成单一任务的能力，而是**一个人同时监督多个任务的能力**。作者观察到，一个人通常只能同时跟进三到五个活跃 Session；再多的话，人就成了调度器：切换窗口、重述上下文、记住哪个 thread 要了什么。

如果瓶颈在这里，更好的聊天窗口解决不了问题，需要的是系统。文章提出的设计——以及随附的开源原型——把 session 管理、事件路由、授权、执行与恢复，从人的脑中移到 agent runtime 里。模型仍然是引擎；产品是引擎外面的组织方式。

这篇是对设计文章与 `dsh-superagent-prototype` repo 的细读。短版结论是：**在自主 agent 里，最重要的代码可能是决定「什么时候不要行动」的那一段。**

## 四个性质，五个模块

文章用四个性质定义 Super-agent：

- **连续（Continuous）。** 用户可以在 IM thread、GitHub pull request 或 email 串里跟它说话，它表现得像同一个 agent，而不是每个频道各自一个 session。
- **高效（Efficient）。** 长指令还在跑时，它可以接受新指令，也能并行推进多个独立任务。
- **主动（Proactive）。** 它会观察环境，在规则允许时主动开始工作，不必每次都被点名。
- **持久（Persistent）。** 它持续在线、接得到用户真实的工作环境，并在长期运行中从异常恢复。

这些是形容词。真正让它们成立的是架构。文章把四个性质对应到五个模块：

| 模块 | 服务的性质 | 实际做的事 |
| --- | --- | --- |
| 双层架构 | 连续 + 高效 | 常驻 Router 保留全局上下文；隔离的 Worker 执行任务 |
| 事件驱动 intake | 主动 | Trigger 经过滤、串成 Thread、路由到 Worker |
| 面向人的交互 | 连续 + 高效 | 全双工 ReAct；按频道调整输出 |
| 计算／状态／环境分离 | 持久 | 无状态云端循环、持久 session 状态、本地执行 daemon |
| Watchdog | 持久 | 外部控制循环，检查进展而不只是 process 活着 |

关键不是哪一个模块新。每一项在操作系统、分布式系统或队列设计里都有对应。关键是把 agent 当成一个**有可调度工作、持久状态、准入控制与故障恢复的系统**，而不是一个附带对话的模型。

这也解释了为什么文章花很少篇幅谈 prompt。Prompt 重要，但它不是架构。架构决定哪个事件会进到哪个 context、谁有权开始工作、worker 死掉时怎么办，以及人什么时候才需要被拉回来做决定。

## 五个对象

五个模块描述系统的形状；domain model 则命名真正在系统里流动的东西。所有工作都由五个对象承载，而这五个对象只有一个写入者：Engine。

| 对象 | 它是什么 | 它拥有什么／如何变化 |
| --- | --- | --- |
| **Trigger**（触发） | 来自 Source 的单个不可变事件，带着 Source 自己的 metadata，例如 actor。 | 属于一条或多条 Thread。它是审计与 idempotence 的单位：同一个 Trigger 被接受两次，仍然只创建一个 Ticket。 |
| **Thread**（线程） | 按时间顺序排列的 Triggers。哪些 Triggers 构成同一条 Thread，由 Source 决定。 | 持有它的 Subscriptions、当前运行的 Eval（同一时间最多一个），以及 Decision 历史。 |
| **Decision**（决策） | Eval 的结果：`accept`、`stop`、`ignore` 或 `unavailable`，并记录理由。 | `accept` 创建 Ticket；其余结果结束这次评估，只留在 Thread 上作为记录。 |
| **Ticket**（工单） | 授权工作的单位。 | 只有 Eval 能创建。它引用一个 Mandate，持有自己的 Channels 与 Inputs，状态从 open → ended；除非人已将它停止，否则人在它某条 Thread 上的消息可以让它恢复。执行与报告归它所有。 |
| **Assignment**（派工） | 把一张 Ticket 绑定到一个 Executor 实例。 | 一张 Ticket 先后会有多个 Assignment。Assignment 独立于 Ticket，从 pending → running → ended 变化；只有它的最终报告能从 Executor 这一侧结束 Ticket。 |

另外两个词不是对象。**Source** 是产生 Triggers 的事件流，决定什么算一个事件；**Eval** 是把一批 Triggers 变成一个 Decision 的判断，本身不保留状态。人的消息走哪条路，正好由这两者决定。

### 人的消息从哪里进来

一个人在 GitHub 或 Feishu 写下消息。Source plugin 把它规范化成一个 Trigger，调用 Engine 的 `receive`。这个调用是事件进入 domain 的唯一入口。

1. **Source → Trigger。** Source 判定这条消息是一个事件，附上自己的 metadata（例如 actor 的身份），交给 Engine。Engine 只存储 Trigger 一次；重复送来会直接回答，不会产生第二次效果。
2. **扇出到订阅的 Tickets。** Engine 把 Trigger 送到每一张订阅了它其中一条 Thread 的 live Ticket。人的消息这样抵达 Ticket 时，会成为一笔 **Input** 并留在该 Ticket；它不进入 Eval。
3. **否则，在 primary Thread 上进入 Eval。** Trigger 排进该 Thread 的队列；一条 Thread 同一时间最多运行一个 Eval。deterministic gate 先判断谁有权发起工作、强度为何；主 Session 再按 Policy 评估候选。
4. **Decision。** Eval 以 `accept`、`stop`、`ignore` 或 `unavailable` 结束，并记下理由。`accept` 创建 Ticket；`stop` 停止它所指的工作；`ignore` 与 `unavailable` 不会开始任何工作。
5. **Ticket、Mandate 与第一个 Assignment。** 一次 accept 在同一个事务里创建 Ticket、它所引用的 Mandate，以及这张 Ticket 的第一个 Assignment。Assignment 把 Ticket 绑定到一个 Executor 实例，后者在自己的 Session 与目录里执行它。

不是每个人类动作都走这条路。**stop、retry、attach、unsubscribe 是控制命令**，不是事件：它们从主 Session 的工具或面板进来，直接调用 Engine 的命令。所以人在 Thread 里打「stop」只是普通 Trigger，要由 Eval 判断；在面板按 stop 则立刻作用于 Ticket。而 Ticket 一旦有了 Executor，人也可以直接在它的 Executor Session 里写消息；这一轮直接交给 Executor，不需要任何 Trigger。

## Router 不干活；Worker 不对外说话

第一个模块是整篇文章里最干净的想法。

单一 agent session 提供最好的连续性：所有东西都在同一个 context。但它提供最差的吞吐量：一个 ReAct 循环一次跑一步，每个新消息都要排在当前 tool call 后面。每个事件开一个新 session 则相反：吞吐量最好，连续性最差，用户又开始在 context 之间切换。

Super-agent 把差别拆成两层。

**Router** 是常驻 session，拥有全局对话。它接收人类消息、维持跨任务的全貌、决定哪些事值得开 Worker，并把结果说回给用户。它是 sequence point 与记忆，不是执行者。文章说它甚至可以设置成没有 Bash 工具；它的工作是路由与对话，不是跑命令。较轻量的模型往往就够。

**Worker** 是隔离的 session，各自拥有 context 与目录。Worker 拿到完整执行工具、通常是最强的模型，以及一个任务。它不直接跟用户说话，只向 Router 汇报，由 Router 决定用户看到什么。

```text
GitHub / Feishu / mail
          │
          ▼
     [ Source ] ──► Trigger ──► Thread
          │                        │
          │ new work               │ follow-up
          ▼                        ▼
     [ Router ] ◄──────────► [ Worker ]
          │                        │
          └──── human reply ◄──────┘
```

结果很微妙但重要：**session 不再是用户的问题。** 用户看到的是一个 agent；系统底下可能同时跑五个 Worker。文章说得很直接：session 应该是系统的实现细节，而不是用户的认知负担。

Router 这一侧还有第二个结果。因为 Router 是单一常驻 session，它理论上会是吞吐瓶颈。但实务上它会批处理。Router 在思考时，新的 Trigger 会排队；下一次模型调用时，整批一起送进去。输入很长、输出很短，prefill 会把批次并行算掉。在 context 上限之内，积压越多，每个决策分摊到的推理时间反而可能越少。

原型直接把这个分离写进代码。`src/core/engine.ts` 是 Trigger、Thread、Decision、Ticket 与 Assignment 的唯一写入者。`src/executor/dsh.ts` 让每个 Ticket 拥有一个 Executor session 与一个目录。Router 是主 session；Worker 是 `worker-<ticket id>` session。这条界线由代码强制，不是靠 prompt 请模型配合。

## 事件不是 prompt

第二个模块改变的是输入。

一般 agent 等 prompt。Super-agent 听事件流：GitHub 留言、pull request review、CI 结果、IM 提及、email。文章把这些事件叫 **Trigger**。同一个 pull request、IM 话题或邮件串上的一连串 Trigger，构成一条 **Thread**。

原始事件流大多是噪音。如果每个事件都送进模型，系统又慢又贵。设计借用操作系统的 fast path / slow path，做两层过滤：

1. **程序层（fast path）。** 用来源、群组、sender、bot 白名单、mention 规则等确定性条件，在调用模型前先滤掉大部分事件。
2. **语义层（slow path）。** 通过的候选事件进 Router，由它读团队 policy，判断是否值得工作。

同样的拆分也用在路由。新 Thread 走 slow path：Router 评估它、建立 Worker。Worker 订阅该 Thread 之后，后续事件走 fast path：Source 直接送给 Worker，不必每条都经 Router 转发。Router 仍然观察全部事件以掌握全局状态，但只决定还没被认领的事。

订阅是多对多。一个 Worker 可以追多条 Thread；一条 Thread 也可以被多个 Worker 追踪。当两个 Worker 碰到同一个 pull request，新的 review comment 会同时送到两边，不需要点对点通信。它们有机会看到彼此的工作，并在共享环境里自行解决冲突。Router 仍然是唯一对用户说话的人。

接着是 context 问题。Worker 的窗口有限，事件流没有。文章从 cache 设计借了两个操作：

- **Inline** 现在很可能用到的信息：当前对象的 ID、短摘要、相邻消息、上层 review comment。
- **Spill** 太长或太罕用的内容：窗口里只留引用与截断点，模型需要时再用工具读。

一致地套用之后，就得到 **Chain of Recall**：每个被召回的对象都 inline 下一跳对象的 ID，模型可以从一条消息走到它的 Thread、从 Thread 走到 Worker session、再从 session 走到相关的 review，一次一跳。Context 不是倒垃圾，而是一张模型可以走的图。

事件驱动的最后一个想法是**投机执行（speculative execution）**。Agent 可以在还不确定结果会不会被采用时，就先在后台开始做。在 DeepSeek Harness 的内部用户群里，有一条「静默复现并修复」规则：有人在群里报告问题时，agent 先在后台尝试复现、准备 patch；只有确认问题且找到合理修法时才出声，否则全程安静。成本是后台算力，好处是人的下一条消息可以是批准，而不是又重新描述一次需求。

这跟聊天机器人是不同的经济学。你不是为每个答案付费，而是**为节省注意力付费**。

## 全双工，或者不会卡住的对话

第三个模块关乎人机界面，起点是一个小观察：经典 ReAct 循环是半双工的。

模型调用 `run()`，工具执行，循环阻塞到结果回来。这段时间 session 不能接受新指令。如果命令跑十分钟，用户只能等，或再开一个 session。这正是 Super-agent 想消除的行为。

文章把阻塞调用换成异步的一对：

- `start()` 立刻返回「Started」通知；工具在后台继续跑。
- 后台工作完成后，结果会当成一条新事件送回 session。
- `stop()` 让模型取消跑太久的命令。

循环现在是全双工：模型下一步就能收到新的人类消息，不必等长命令。对话不必等 shell。

文章说这个异步机制已经在 DeepSeek Harness 里，但默认没开。原型在 Worker session 里采用同样的模式：前台 shell 命令五秒后移到后台 job，Worker 可以接收 follow-up，而不是卡在长 build 上。

还有一条按频道调整输出的规则，听起来小，其实很重要。Worker 的推理与 tool call 留在 Worker 里。Router 对用户说话，而回复的形状取决于频道：

- **IM：** 低干扰、简短、面向决策。团队的硬规则是每次回复不超过 100 词（words）。
- **GitHub、email、文档：** 结构化、高信息密度、异步。Pull request 要有完整的问题背景、改动说明与验证结果。

这不是礼貌，而是带宽匹配。群聊吃不下推理轨迹；pull request 也不该被压成 100 字摘要。同一个 agent 必须在不同地方用不同方式说话，而这个翻译由系统拥有，不是用户。

## 计算、状态、环境是三件不同的事

第四个模块让「持久」变成字面意思。

本地 agent 把三件事绑在一台机器上：跑循环的**计算**、必须活下来的**状态**，以及工具操作的**环境**。合上笔记本，三件事一起停。换一台机器，环境就没了。

文章分两步拆开。

**计算与状态。** Agent 循环跑在无状态的弹性容器里；Session、Ticket、消息、决策存在数据库。容器可以重启、扩容、替换，session 从持久状态继续。这是把普通 Web 服务架构套到 agent 上。

**计算与环境。** 更难的是环境。真实工作躺在一个有未提交修改、本地凭证、内网服务与特定 toolchain 的 checkout 里。把这些复制到云端沙箱又贵又容易漏；要求用户搬到云端更糟。所以环境留在原地。用户机器上跑一个轻量 daemon，只负责执行命令与返回结果。云端循环通过 daemon 读环境；daemon 不保存 session 状态。

文章把这叫 **BYOM — Bring Your Own Machine**。它和 Anthropic 的「脑手分离」形状相同，但对象是偶尔离线的个人机器，而不是托管云端沙箱。机器可以消失再回来；云端 agent 可以在它回来后接续任务。

安全问题也从这里开始，文章知道。若云端循环被入侵或被 prompt injection 攻破，所有连上的机器都在范围内。凭证不能进到模型 context；agent 应该能在不读取凭证本身的情况下使用它。原型对自己的姿态很坦白：Worker session 以 operator 的 OS 用户身份、带 `danger-full-access` 执行；wrapper 与目录是默认值，不是安全边界，绝对路径可以绕过 blocked command 清单。建议的隔离方式是专用 OS 账号。设计很诚实地说明它是研究原型，不是 hardened product。

## Watchdog 也是一个 agent

第五个模块是多数 agent framework 会漏掉的：**Watchdog**。

长期运行的分布式系统不能只靠主 process 发现自己故障，它们需要外部控制循环。Agent 系统也需要，而且还多一件事：很多故障不是 crash。模型可能陷入循环、偏离目标，或在每个 process 都健康时一直做错的事。

所以 Super-agent 用定时消息驱动一个独立的 Watchdog session。它检查基础设施错误、状态恢复失败，更有趣的是检查每个 Worker 是否真的有进展、方向是否仍对准目标。发现异常时它可以介入、重试，或在 runtime 改系统行为。因为 Watchdog 本身是有完整工具能力的 agent session，operator 可以问它故障原因，也可以让它在线修改 prompt 或规则。

这是一个小而关键的设计选择。监控 agent 的不是 dashboard，而是另一个 context 不同、工作也不同的 agent。监控变成 first-class workload。

## 授权才是产品

如果你只读架构段，可能会以为最难的是路由。Repo 暗示更难的是**权限**。

一个能替整个团队行动的 agent，也能浪费整个团队的注意力，或用团队的名义做错事。原型的 `docs/000-philosophy.md` 写下原则：尽可能少占用人类注意力，尽可能提供价值。后半句容易说，前半句是授权问题。

原型把工作分两种：

- **Explicit。** 白名单上的人点名 agent，要求某件事。
- **Inferred。** Agent 看到可能值得工作的事件——bug 报告、review comment、CI 失败——但没有人点名它。

Inferred 工作由 **Policy** 把关。Policy 包含规则、各 Source 的 allowlist，以及 accept mode：

| 模式 | 行为 |
| --- | --- |
| `off` | 不考虑 inferred 候选 |
| `observe` | 评估候选；正面结果记为「would accept」，但不执行 |
| `auto` | 正面评估可以创建 Ticket 并开始工作 |

默认是 `observe`。这是自主 agent 该有的默认：先证明判断力，再取得行动权。面板会记录决策，团队可以先看 agent「本来会做什么」，再切到 `auto`。

请求被接受后，会变成一个 **Ticket**，带着 **Mandate**：它是用什么依据被准入的、符合哪些规则、谁提出的、当时的 policy 版本。Ticket 在暂停或结束后要恢复时，Mandate 会重新验证。如果提出者已不在名单、规则已不适用，或系统已不接受主动工作，Ticket 就维持结束。人说「stop」是普通 Trigger；在面板按 stop 是命令。这个区别很重要，因为一个是对话，另一个是覆写。

这是我就算不建 Super-agent 也想偷走的部分。Agent 循环正在变成 commodity；**准入契约**——谁可以要求、依据哪条规则、带着什么证据、有效到什么时候——才是让自主系统可被忍受的东西。

## 原型实际交付了什么

Repo 是 `deepseek-ai/dsh-superagent-prototype`，MIT，TypeScript，包成 DeepSeek Harness bundle。它不是 mock：有真的 Engine、SQLite store、持久 effect queue、GitHub 与 Feishu sources、Web panel，以及 setup flow。

README 难得地坦白：

> Research prototype for reference only, not an official DeepSeek product. ... It may still contain bugs, and its coding style and engineering practices may be inconsistent. ... We have adapted it for publication, so it is not identical to our internal version or the implementation described in *Exploring Super-agent Design*.

这个落差是故事的一部分。文章描述的是设计空间；repo 实现其中一部分，其他想法留给未来。两者一起读，比只读其中一个有用。

发布形状也是故事的一部分。这是一个只有一个 commit 的快照：没有 release、issues 关闭、写作时约 24,600 stars。在 Node 22.23.5 上跑 `pnpm check`，结果是 1,196 个测试通过、1 个 Feishu health 测试失败。这不是丢掉代码的理由，而是把它当研究 artifact、而不是 dependency 来读的理由。

粗略的地图：

| 层 | 位置 | 做什么 |
| --- | --- | --- |
| Engine | `src/core/engine.ts` | Trigger、Thread、Decision、Ticket、Assignment 的唯一写入者 |
| Store | `src/app/store.ts` | 一个 SQLite 数据库、repositories、read queries、settings versions |
| Effects | `src/app/effects.ts` | 持久 side-effect queue：assessment、launch、delivery、relay、notice、reply |
| Executor | `src/executor/dsh.ts` | 每个 Ticket 一个 session 与目录；worker slots；重启恢复 |
| Sources | `src/sources/github*`、`src/sources/feishu*` | 事件 intake、thread reads、回复 |
| Policy | `src/policy.ts` | 授权、评估、revalidation、policy effects |
| Panel | `src/client` | 需要人的事、决策、设置、健康状态 |
| Setup | `SETUP.md` | 给 coding agent 读的安装脚本 |

<figure class="fig">
  <img src="/images/superagent-system/dsh-superagent-architecture.webp" alt="由仓库 Mermaid 源码渲染的 dsh-superagent 官方架构图：来源插件、Session 工具与管理路由进入 Engine，Engine 协调 Store、Policy、SourceRegistry、MasterAssessor、DshExecutor、Outbox 与 Effects" width="1600" height="1165" loading="lazy" />
  <figcaption><b>官方图示</b> — 原型的核心类与胶水层，由仓库的 Mermaid 源码渲染：来源插件、Session 工具与管理路由进入 Engine；Engine 协调 Store、Policy、SourceRegistry、MasterAssessor、DshExecutor 与 Outbox；异步工作经由 Effects 排队。下方表格逐一说明每个组件的职责。来源：<a href="https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/007-architecture.md">dsh-superagent-prototype，docs/007-architecture.md</a> · MIT</figcaption>
</figure>

### 每个组件做什么

| 组件 | 功能 |
| --- | --- |
| **Source plugins** | 把 GitHub 与 Feishu 事件转成 Trigger 与 Thread 事实、读取 thread context，并通过 Source 的 channel 送回消息。它们只通过 `SourceHost` / `SourceContext` 接触核心。 |
| **Session tools** | 主 Session 与 Executor Session 的工具适配层。把模型的工具调用转成 Engine 命令（candidate、decide、attach、note、status、assignment/report），返回精简卡片或读取结果。 |
| **Management routes** | 面板背后的 same-origin `/orchestrator/api` HTTP 路由。验证请求与限制，再调用 Engine 或读取 Store。 |
| **Engine** | Trigger、Thread、Decision、Ticket 与 Assignment（及其 Mandate）的唯一写入者。它拥有每个命令的事务，并委派给 Intake、Evals、Tickets、Assignments 与 Replies。 |
| **Store** | 一个 SQLite 数据库：domain repositories、read queries、Source metadata、settings 与 history、outbox receipts 与 typed KV。它只存状态，不做策略判断。 |
| **Policy** | 团队规则：admission gate、Mandate revalidation、assessment outcome、pause 与 timeout 状态，以及 policy version 变更对 live Tickets 的影响。 |
| **SourceRegistry** | 管理已注册的 Source kinds 与 instances，实现 `SourceScope`，提供 channel send/link、thread context、search、health claims 与 configuration validation。 |
| **MasterAssessor** | 执行主 Session 对主动候选的评估：提供有界的 Thread 与 repository 上下文、读取模型判断，并把 Decision 返回给 Engine。 |
| **DshExecutor** | Executor port：每个 Ticket 一个 Session 与目录；准备 launch、投递 Inputs、管理工作槽、重试与取消，并把 assignment 生命周期回报 Engine。 |
| **Outbox** | 消息 receipt 的唯一写入者。它在同一个事务保存消息与 reply effect，通过 Source channel 发送；Source 关闭时等待，对话消失或未被监听时丢弃。 |
| **Settings** | 版本化设置块、pause 状态、setup 字段、policy version 变更与 Source policy sync。保存会声明来源是 panel、tool 或 sync。 |
| **Sessions** | 管理主 Session 与 worker 的 DeepSeek Harness Sessions：创建、prompt/skills/tools 注册、prompt versions、relay、notice 与 model-retry 状态。 |
| **Effects** | 持久 side-effect 队列：每个 kind/key 一行；assessment、launch、delivery、relay、notice、reply 的 handler；由旧到新执行、并发上限、指数退避、pause/drain 与 health。 |
| **Runtime** *(图中未画)* | Composition root：锁定 state 目录、打开 Store、用各自的 ports 构建 parts、注册 routes 与 Source host，并负责 startup/shutdown。 |
| **Panel** *(图中未画)* | 管理 UI：overview、stage 页、Threads 与 Tickets、settings、prompts 与 health。它调用 management routes，本身不持有 domain rules。 |

Setup 文件是个好细节。它是写给 coding agent 的，不是给人：一次问一个问题、收集答案、显示一份计划、再执行。这和 Super-agent 自己的哲学一样——把 operator 的注意力降到最低——只是套在安装上。

## 12.4 分钟的结果，以及它量了什么

文章有一个初步实验，值得仔细读，因为数字很容易被误解。

设置：每次约 300 条消息，其中约 20 条是工作请求；其余是闲聊、follow-up、停止、CI 消息。写代码的工作用一个只消耗时间的工具代替。实验量的是**调度与协作**，不是写代码质量。每种设置跑五次，消息间隔与工作时间缩成四分之一。

四种设置：

- Super-agent。
- 去掉订阅直通的 Super-agent。
- 单一 session + subagent 工具，中性 prompt。
- 单一 session + subagent 工具，偏好委派的 prompt。

结果比标题更有意思：

| 设置 | p50 | p95 | Cache-read token | 发生了什么 |
| --- | --- | --- | --- | --- |
| Super-agent | 12.4 分 | 15.7 分 | 2,323 万 | Router + Worker + 直通 |
| Super-agent，去掉直通 | 12.6 分 | 15.5 分 | 3,177 万 | 速度相同；Router 决策 +30% |
| 单一 session，中性 prompt | 20.4 分 | 29.5 分 | 605 万 | 五次实验中，模型一次都没调用 subagent |
| 单一 session，委派 prompt | 13.8 分 | 29.0 分 | 1,082 万 | 五次有四次委派；一次长尾 |

仔细看表。对上**偏好委派**的 baseline，中位数差距只有约 10%——12.4 对 13.8 分。真正的差别在尾部：15.7 对 29.0 分。架构赢的不是「平均快一倍」，而是**方差更小**：比较少任务卡在打断或错误的委派决策后面。对上**中性** baseline，中位数与尾部都差很多，因为模型根本没有委派。

Token 的交换写得很明白。Super-agent 用 2,323 万 cache-read token，约是中性 baseline 605 万的 3.8 倍、委派 baseline 1,082 万的 2.1 倍。它用更多 context 读取换更短、更稳定的完成时间。这是交换，不是免费午餐。

把 Super-agent 的直通路径拿掉，完成时间没什么变（12.6／15.5 对 12.4／15.7），但 Router 的工作量变了：决策数增加约 30%，read-cache token 增加到 3,177 万，约 37%。直通不是质量功能，是卸载功能。

Router 批处理测试是另一组：Trigger 到达率从每分钟约 1 条升到约 40 条。平均 batch 从 1.0 升到 2.8；单次请求从 2.5 秒升到 3.9 秒，远慢于 batch 增长；每个决策分摊的推理时间从 6.4 秒降到 1.6 秒。在这个负载下，单一 Router 还有余量。

但 caveat 是真的：合成负载、只用时间的 coding tool、五次、时间缩放。这是调度 sanity check，不是产品 benchmark。但方向和架构一致：赢来自让全局 context 保持连续，同时让执行并行。

## 哪些是借的，哪些是新的

Super-agent 几乎每个 primitive 都有先例：

- Fast path / slow path：操作系统与网络栈。
- Inline / spill 与 locality：cache 与 compiler。
- Speculative execution：CPU 与数据库。
- 计算／存储分离：分布式系统。
- Durable outbox 与 idempotent effects：message queue 与事务系统。
- Watchdog：硬件与分布式控制平面。

文章自己说了：它没有提出新理论，而是把经典系统思想套到 agent 上。这不是缺点。新意在组合，以及愿意把**系统**而不是模型当成设计单位。

多数 agent framework 优化循环：更好的 tool schema、更好的 planning prompt、更好的 retry。Super-agent 优化循环外面的组织：谁可以开始工作、哪个 context 看到哪个事件、执行住在哪里、worker 卡住时怎么办。这是 stack 的不同层，而且长期被忽略。

最接近的类比不是「有工具的聊天机器人」，而是**注意力的操作系统**。Router 是 scheduler 与 shell；Worker 是 process；Thread 是对话的 file descriptor；Mandate 是 capability；Watchdog 是 kernel 的健康监控。类比不完美，但它解释了为什么系统工程师觉得这个设计熟悉，而 prompt 工程师觉得陌生。

## 真正重要的开放问题

文章对没解决的事很诚实。四个问题特别突出。

**1. Router 的扩展。** 单一常驻 Router 简单，而且保留全局 context。什么时候需要 shard？Shard 会用连续性换吞吐量，文章没有说已经有答案。实验显示每分钟 40 个 Trigger 还有余量，不是组织规模的答案。

**2. 跨月的记忆。** Chain of Recall 处理近期任务与 session 历史。长期记忆——agent 半年后应该记得项目、人物或决策的什么——仍是开放问题。原型的 SQLite store 是 substrate，不是 memory policy。

**3. Agent 对 agent 协作。** 设计假设一个 Super-agent instance 拥有一个 context 边界。当组织跑多个权限不同的 instance，跨边界的 A2A 协作还没解。文章把问题命名出来，没有藏。

**4. 安全与隐私。** BYOM 把云端循环接到有凭证与私有程序的个人机器。Prompt injection、凭证外泄、云端循环被攻破，都是真实风险。原型的 wrapper 是便利，不是 sandbox。任何团队要上 production，都需要更强的隔离故事。

还有一个比较软的问题：如果 agent 接手更多工作，人的注意力真的会空出来，还是会转移到审查更多 agent 输出？文章的回答是：审查是新的瓶颈，系统应该只在需要决策时才找人。这有可能，但它是设计目标，不是已量测的保证。

## 怎么试，但不要把整栋楼的钥匙给它

原型不是 one-click install，这大概也合理。README 建议的路径是请 coding agent 读 `SETUP.md`，跟你一起设置。Setup flow 一次问一个问题、显示计划、再安装。

合理的第一次运行：

1. 给 agent 一个专用 GitHub 账号，不要用你自己的。它写的所有东西都会挂在那名字下。
2. 从一个 repository 与很短的白名单开始——最好只有你。
3. Accept mode 保持 `observe`。读 agent 本来会做的决策。
4. 给它一个窄的 execution root 与会创建 checkout 的 prepare command。不要指向塞满凭证的目录。
5. 等观察到的决策看起来很无聊，再切到 `auto`。
6. 看 panel 与 Watchdog health entry。安静的 agent 不一定是在工作的 agent。

Prerequisites 是真的：Node.js 22.19+ 或 24+、pnpm、git、tmux、Python、GitHub CLI，以及一个装好 model provider 的 DeepSeek Harness。Setup 设计成由 coding agent 驱动，但账号与权限仍然属于 operator。

## 位移

读这个项目最有用的方式，不是「DeepSeek 做了一个 coding agent」，而是它对「困难搬到哪里了」的声明。

单任务 agent 正在变好。模型会调用工具、从错误恢复、在比一年前更少监督下完成范围明确的任务。当这件事变好，限制就往外移：从循环移到队列，从 prompt 移到 policy，从 session 移到系统。

Super-agent 的贡献，是对外面那一层长什么样给出一个具体答案：常驻 Router、隔离 Worker、事件驱动 intake、全双工循环、持久状态、本地执行平面，以及 Watchdog。没有一个是魔法，全部是工程。而让它可以被放着跑的东西，不是模型的智力，是那个决定 agent 什么时候可以行动、什么时候该安静的准入契约。

这是整篇设计里我会留下的一句话：**一个能替团队行动的 agent，首先必须是一个知道什么时候不要行动的 agent。**

## 参考资料

- [Super-agent 设计探索：迈向更自主的 Agent 系统](https://zhuanlan.zhihu.com/p/2099987320443237060) — DeepSeek Harness 团队，知乎，2026 年 10 月 31 日（11 月 1 日编辑）；英文标题为 "Exploring Super-agent Design: Towards a More Autonomous Agent System"。
- [deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype) — MIT 研究原型，源码与文档。
- [DeepSeek Harness](https://www.deepseek.com/en/harness) — host runtime。
- [dsh-superagent philosophy](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/000-philosophy.md) — 注意力最小化原则。
- [dsh-superagent architecture](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/007-architecture.md) — Engine、Store、Effects、Sources、Executor。
- [dsh-superagent execution](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/003-execution.md) — Ticket、stage、worker slot、恢复。
- [dsh-superagent authorization](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/002-authorization.md) — accept mode、规则、Mandate、revalidation。
- [SETUP.md](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/SETUP.md) — 给 coding agent 读的安装流程。
