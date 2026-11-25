---
title: "Claude Ship 与代理编码的最后一英里"
description: "Claude Ship 把拉取请求拆成三种权力：Code Review 找问题、PR Steward 修问题、Claude Approvals 做决定。真正有趣的是策略边界，不是补丁。"
pubDate: 2026-11-25
category: "AI"
tags: ["Claude Ship", "代码审查", "AI 代理", "CI", "治理"]
featured: false
author: "Alex.Hsiao"
readTime: "12 分钟"
---

# Claude Ship 与代理编码的最后一英里

## 审查瓶颈

代理开一个拉取请求的速度，比人读完它还快。这个不对称，就是问题的新形状。

当写代码是慢的那一端，审查可以是工作结束时的检查点。当生成变便宜，审查就成了吞吐量的上限，拉取请求则变成一条队列。队列不只是延迟。每一项都要付一次上下文切换的代价：重新加载 diff、重建意图、检查测试、想起服务在边界上做什么。代理写的 PR 还多一种劣势：审查者不是作者，所以第一次读就是唯一一次读。

Anthropic 的说法很直接：在 Claude Code 团队，大多数代码由 Claude 写，PR 之后的每一件事都必须用同样的速度前进。这就是 Claude Ship 的产品主张。它在 2026 年 11 月 23 日发布，beta，在 Claude Team 与 Enterprise 方案提供，支持 GitHub 上的仓库。真正的问题不是它能不能审 diff，而是团队怎么处理紧接在后的那个决定。

多数对 PR 循环的描述，把三件不同的事压在一个人身上：找问题、修问题、决定合并。这三件事的失败方式不同。审查者可以很彻底但很慢。修复者可以很快但很乐观。批准者可以很小心，却仍然判断错。把它们绑在一起，就代表那个希望补丁过关的人，同时也是审批的人；这是我们在人类身上容忍的利益冲突，因为责任有名字可以追。

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">CLAUDE SHIP // 00</span>
    <p class="mfig-lead-kicker">Claude Ship 把拉取请求拆成三种权力。真正值得治理的是合并决定。</p>
    <h3 class="mfig-lead-title">审查找问题。Steward 修问题。Approvals 做决定。</h3>
    <p class="mfig-lead-sub">一个循环、三个角色，和一份能说不的策略文件。</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
      <div class="mfig-tag">CODE REVIEW // 找问题</div>
      <h4>发现问题，不是下判决</h4>
      <p>多角度审查、对抗式验证，把分类后的发现贴回 PR。</p>
      <div class="mfig-meta">QUICK · STANDARD · DEEP</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 1 1 7.94-7.94l-3.76 3.76z"/></svg></div>
      <div class="mfig-tag">PR STEWARD // 修问题</div>
      <h4>修复，但不拿钥匙</h4>
      <p>CI、冲突与反馈。每次推送都说明改了什么、怎么还原。</p>
      <div class="mfig-meta">CI · 冲突 · @CLAUDE STOP</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div>
      <div class="mfig-tag">CLAUDE APPROVALS // 做决定</div>
      <h4>有纪录的决定</h4>
      <p>仓库的策略读取发现与分类器，然后放行、要求人工，或阻止。</p>
      <div class="mfig-meta">策略文件 · 信号 · 观察</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 128" role="img" aria-labelledby="ship-lead-title ship-lead-desc">
    <title id="ship-lead-title">Claude Ship 的循环</title>
    <desc id="ship-lead-desc">拉取请求打开后，Code Review 找问题，PR Steward 修问题，仓库策略被评估，然后变更合并。没有角色同时握有两种权力。</desc>
    <defs>
      <marker id="ship-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="16" class="f" font-size="7.5" letter-spacing="1.2">循环 // 从 PR 到合并</text>
    <text x="816" y="16" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一份策略</text>
    <line x1="24" y1="24" x2="816" y2="24" class="rule"/>
    <rect x="32" y="38" width="128" height="50" class="term"/>
    <text x="44" y="52" class="f" font-size="6" letter-spacing="0.6">01</text>
    <text x="44" y="66" class="t" font-size="9.5" font-weight="800">PR</text>
    <text x="44" y="78" class="m" font-size="6.2">已打开</text>
    <line x1="160" y1="63" x2="192" y2="63" class="arrow" marker-end="url(#ship-arrow)"/>
    <rect x="196" y="38" width="128" height="50" class="box"/>
    <text x="208" y="52" class="f" font-size="6" letter-spacing="0.6">02</text>
    <text x="208" y="66" class="t" font-size="9.5" font-weight="800">REVIEW</text>
    <text x="208" y="78" class="m" font-size="6.2">找问题</text>
    <line x1="324" y1="63" x2="356" y2="63" class="arrow" marker-end="url(#ship-arrow)"/>
    <rect x="360" y="38" width="128" height="50" class="box"/>
    <text x="372" y="52" class="f" font-size="6" letter-spacing="0.6">03</text>
    <text x="372" y="66" class="t" font-size="9.5" font-weight="800">FIX</text>
    <text x="372" y="78" class="m" font-size="6.2">STEWARD</text>
    <line x1="488" y1="63" x2="520" y2="63" class="arrow" marker-end="url(#ship-arrow)"/>
    <rect x="524" y="38" width="128" height="50" class="codebox"/>
    <text x="536" y="52" class="f" font-size="6" letter-spacing="0.6">04</text>
    <text x="536" y="66" class="t" font-size="9.5" font-weight="800">POLICY</text>
    <text x="536" y="78" class="m" font-size="6.2">文件</text>
    <line x1="652" y1="63" x2="684" y2="63" class="arrow" marker-end="url(#ship-arrow)"/>
    <rect x="688" y="38" width="128" height="50" class="term"/>
    <text x="700" y="52" class="f" font-size="6" letter-spacing="0.6">05</text>
    <text x="700" y="66" class="t" font-size="9.5" font-weight="800">MERGE</text>
    <text x="700" y="78" class="m" font-size="6.2">决定</text>
    <text x="420" y="108" class="f" font-size="6.4" text-anchor="middle" letter-spacing="0.6">没有角色同时握有两种权力</text>
    <text x="420" y="120" class="f" font-size="6.2" text-anchor="middle">STEWARD 不能批准 · APPROVALS 不能改代码</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>分工才是重点。</b>修 PR 的代理，明确不被允许批准或合并 PR。</p>
</section>

<p class="mfig-bridge">接下来要谈的就是这个分工：它为什么存在、权限边界在哪里、策略文件该有什么内容，以及 Anthropic 自家团队的数字证明了什么、又没证明什么。</p>

## Claude Ship 是什么：一个循环，三种角色

Claude Ship 不是新模型，也不是新编辑器。它是三个代理围着拉取请求组起来的系统。Code Review 已经正式可用（GA）。PR Steward 与 Claude Approvals 是两个 beta 代理。三者一起卖，挂在 Claude Team 与 Enterprise 方案，只支持 GitHub 上的仓库。

**Code Review 找问题。** 它会拿 PR 对照代码库，用多个视角做深入审查。它收集发现、对抗式地验证、分类，然后贴到 PR 上。每个仓库可以选 Quick、Standard 或 Deep 审查等级。对抗式验证这一步很重要：一个在被试图推翻后仍站得住的发现，比一串看似合理的疑虑有用。

**PR Steward 修问题。** 它想办法让 PR 维持绿灯，而且被设计成不能批准或合并。它处理失败的 CI 检查、合并冲突，以及来自 Code Review、其他审查工具或团队成员的审查反馈。每次推送后，它会留言说明改了什么、怎么还原。开发者可以留言 `@claude` 下指令来调整方向，或 `@claude stop` 让它停手。

**Claude Approvals 做决定。** 它套用一份写在仓库里的批准策略，Anthropic 形容它像「更聪明的 CODEOWNERS 文件」。若策略允许，它可以自行批准例行变更；若策略要求，它也可以针对特定情境要求更深的人工审批。信号可以包含 Code Review 的发现，或团队用自然语言写的自订分类器。Anthropic 建议先开观察模式，再让分支保护要求它的绿灯。

把三个角色当成系统来看，它们不是一条管线，而是一个带闸门的循环。Steward 的推送改变 diff，diff 改变发现，发现再改变策略是否放行。循环里唯一稳定的对象是策略，所以它放在仓库，而不是某个设置页面。

角色是依权限切的，不是依任务切的。审查产生主张。Steward 产生 commit。Approvals 产生决定。只有一个角色能说 yes，而它不能写代码。每个角色都可能出错，但没办法把错误藏进另一个角色的输出里。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">三角色循环 // 01</span>
    <h3 class="mfig-fig-title">一个循环、三个角色、两道禁令</h3>
    <p class="mfig-fig-sub">Code Review 产生发现，PR Steward 推修复，Claude Approvals 读策略与信号。修复者不能批准；批准者不能改代码。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 400" role="img" aria-labelledby="ship-f1-title ship-f1-desc">
    <title id="ship-f1-title">三角色循环</title>
    <desc id="ship-f1-desc">拉取请求打开后由 Code Review 审查，发现交给 PR Steward，由它修复 CI 失败、冲突与反馈，并把 commit 推回 PR。Claude Approvals 评估策略文件与来自审查和仓库的信号，然后合并或要求人工审批。PR Steward 不能批准或合并；Claude Approvals 不能改代码。</desc>
    <defs>
      <marker id="ship-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">三种角色 // 三种权力</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一个合并决定</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="54" width="136" height="78" class="term"/>
    <text x="36" y="72" class="f" font-size="6.4" letter-spacing="0.7">输入</text>
    <text x="36" y="92" class="t" font-size="9.2" font-weight="800">PR 已打开</text>
    <text x="36" y="106" class="m" font-size="6.2">diff · 意图 · 测试</text>
    <text x="36" y="118" class="f" font-size="6">开发者或 /ship</text>
    <line x1="160" y1="93" x2="192" y2="93" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <rect x="196" y="54" width="198" height="78" class="box"/>
    <text x="208" y="72" class="f" font-size="6.4" letter-spacing="0.7">CODE REVIEW // 找问题</text>
    <text x="208" y="92" class="t" font-size="9.2" font-weight="800">多角度审查</text>
    <text x="208" y="106" class="m" font-size="6.2">收集 · 验证 · 分类</text>
    <text x="208" y="118" class="f" font-size="6">把发现贴回 PR</text>
    <line x1="394" y1="93" x2="516" y2="93" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <text x="455" y="84" class="f" font-size="6" text-anchor="middle">发现</text>
    <rect x="520" y="54" width="182" height="78" class="term"/>
    <text x="532" y="72" class="f" font-size="6.4" letter-spacing="0.7">CLAUDE APPROVALS // 做决定</text>
    <text x="532" y="92" class="t" font-size="9.2" font-weight="800">策略 + 信号</text>
    <text x="532" y="106" class="m" font-size="6.2">放行 · 询问 · 阻止</text>
    <text x="532" y="118" class="f" font-size="6">不能改代码</text>
    <line x1="702" y1="93" x2="726" y2="93" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <rect x="730" y="54" width="86" height="78" class="codebox"/>
    <text x="773" y="86" class="t" font-size="9" font-weight="800" text-anchor="middle">MERGE</text>
    <text x="773" y="100" class="m" font-size="6" text-anchor="middle">或人工</text>
    <text x="773" y="112" class="f" font-size="6" text-anchor="middle">审批</text>
    <line x1="295" y1="132" x2="295" y2="244" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <text x="303" y="176" class="f" font-size="6.2">发现</text>
    <text x="303" y="188" class="f" font-size="6.2">+ 反馈</text>
    <rect x="196" y="248" width="198" height="92" class="box"/>
    <text x="208" y="266" class="f" font-size="6.4" letter-spacing="0.7">PR STEWARD // 修问题</text>
    <text x="208" y="286" class="t" font-size="9.2" font-weight="800">让 PR 维持绿灯</text>
    <text x="208" y="300" class="m" font-size="6.2">CI · 冲突 · 审查反馈</text>
    <text x="208" y="312" class="f" font-size="6">每次推送后留言</text>
    <text x="208" y="324" class="f" font-size="6">改了什么 · 怎么还原</text>
    <path d="M196 292 H176 V120 H160" class="dash" fill="none" marker-end="url(#ship-f1-arrow)"/>
    <text x="84" y="156" class="f" font-size="6">推送 + 还原说明</text>
    <text x="84" y="168" class="f" font-size="6">@claude / @claude stop</text>
    <path d="M394 292 H462 V112 H516" class="arrow" fill="none" marker-end="url(#ship-f1-arrow)"/>
    <text x="470" y="196" class="f" font-size="6">绿灯</text>
    <text x="470" y="208" class="f" font-size="6">+ DIFF</text>
    <line x1="611" y1="132" x2="611" y2="196" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <rect x="520" y="200" width="182" height="64" class="box"/>
    <text x="532" y="218" class="f" font-size="6.4" letter-spacing="0.7">策略要求时</text>
    <text x="532" y="238" class="t" font-size="8.6" font-weight="800">人工审批</text>
    <text x="532" y="252" class="m" font-size="6.2">由人决定</text>
    <line x1="196" y1="356" x2="816" y2="356" class="rule-soft"/>
    <text x="196" y="372" class="f" font-size="6.4">✕ PR STEWARD 不能批准或合并</text>
    <text x="520" y="372" class="f" font-size="6.4">✕ CLAUDE APPROVALS 不能改代码</text>
  </svg>
  </div>
  <p class="mfig-fig-src">审查找问题 · STEWARD 修问题 · APPROVALS 做决定 · 没有角色同时握有两种权力</p>
</figure>

## 权力分立

PR Steward 的禁令，是这份公告里最有趣的一行。修复代理被优化成让检查通过。那是一个替代目标，对修复者来说是好的目标；对批准者来说，这是错的目标。批准者要问的不是「能不能让它变绿」，而是「这个改变该不该存在于 main」。当变更越危险，这两个问题的分歧就越大。

还有一个认识论上的理由。如果同一个模型既找问题又修问题，「没有发现」就会变得暧昧。它可能代表代码干净，也可能代表找问题的人和修问题的人有同一个盲点。把决定分开，不会消除盲点，但它会强迫决定对着一条规则做，而不是对着模型自己「做完了」的信心做。

策略是仓库里的一个文件。这个选择承载了大部分的治理价值：

- **有版本。** 每一次规则变动都是一个有作者、有日期的 diff。
- **可审查。** 策略可以走它自己管辖的那套 PR 流程。
- **有范围。** 一个仓库可以比隔壁严格，不需要中央批准的例外。
- **可读。** 开发者可以读到一个变更为什么被放行或被留住。

Anthropic 说它像「更聪明的 CODEOWNERS 文件」。这个比喻有用，但你要保留正确的那一半。CODEOWNERS 回答一个狭窄的问题：这条路径谁必须审？它是确定性的、依路径的，而且失败时默认拒绝。如果所有者不存在，或文件格式损坏，审查要求就无法满足，合并只能等。Claude Approvals 的策略回答更大的问题：这个变更能不能不经人工就合并？它看内容、看发现、看分类器，不只路径。「更聪明」的部分是条件判断；真正该保留的是失败模式：当策略不存在、语义不清或失效时，结果应该是人工，而不是合并。

这就是为什么递归很重要。策略管 PR，而改策略本身也是一个 PR。原则上这很优雅：规则通过它约束的流程来改变。实务上这创造了一个明显的攻击面。能改策略的代理，就能替自己扩权。没有被保护的策略文件不是控制，只是建议。不管文件叫什么名字，它都需要一个所有者、一项人工审查要求，以及一条明确规则：对它的变更永远不能自动批准。

最后一个性质，才让这个设计成为治理模式，而不只是工作流：策略能说不。它可以放行例行变更、要求人工处理有后果的变更，或直接阻止。只能说 yes 的策略，是一枚盖了 schema 的橡皮图章。

## 两个入口，同一条权限边界

Claude Ship 有两个入口，针对不同的人。

对开发者，是 Claude Code 里的 `/ship`。变更准备好时，开发者运行指令。Claude 推送变更、开 PR、审查，并处理反馈与失败的检查，帮它走到可合并的状态。实际能不能合并，取决于开发者的权限与仓库的分支规则。

对管理员或工程主管，是整个仓库的自动化。替一个仓库打开 Claude Ship，它就会在团队的 PR 上自动工作，不需要任何人手动调用 `/ship`。管理员可以逐仓库打开 Code Review 与 PR Steward。当连接的仓库在默认分支上有策略文件时，Claude Approvals 就会启动，管理员也可以把它关掉。每个仓库有自己的审查等级、审查时机与支出上限。系统与既有的分支保护和必要检查一起运作。

最值得注意的一致之处是：指令是方便，不是权限。`/ship` 不会给代理开发者原本没有的权限。它只是缩短「变更准备好了」到「循环开始跑」之间的距离。仓库层级的路径也不是另一套比较宽松的系统；它只是让每个开发者不必记得要打这个指令。

底下有两层授权，不该混在一起。开发者授权的是推送与修复的动作，边界是自己的权限。管理员授权的是批准的动作，边界是策略与分支保护。`/ship` 属于第一层。Claude Approvals 属于第二层。开发者不能靠运行指令扩大第二层，管理员也不能靠写策略扩大第一层。这就是权限边界，两个入口都一样。

## 策略即代码

Anthropic 的建议是从观察模式开始，这个建议有理，但理由很容易被忽略。策略是一个关于「哪些变更算例行」的假设。在你拿真实 PR 跑过之前，你不会知道假设对不对。观察模式就是实验：Claude Approvals 评估每个 PR，记下它「本来会怎么做」，分支保护不变，人还是要合并。

策略可用的信号分成不同种类。Code Review 的发现是结构化证据：严重度、类别、位置、验证状态。自订分类器是由模型评估的自然语言规则。分支保护与必要检查是强制层，不是判断。好的策略会把这些类别分开。能用确定的路径与大小规则时就用；发现可靠时就用发现；只有当规则无法写成谓词时，才用模型分类器。

分类器最诱人，也最容易用过头。「会改变发票金额、税或退款的变更需要人工」是有用的分类器。「判断这个变更安不安全」不是；它把整个判断交回给模型，没有规则可以审计。分类器是一次模型调用，所以要花 token，也会随着模型改变而漂移。把分类器写窄、给例子，并让未知情况落到人工，而不是落到放行。

成本结构也是同一个形状。Claude Ship 以 token 计费。管理员可以为 Code Review 与 PR Steward 设支出上限。Claude Approvals 没有基本费，但策略里的分类器依使用的 token 计费；而一个会用到 Claude 审查的策略，即使在观察模式，也会触发一次计费的 Code Review。所以观察模式是强制上的折扣，不是免费层。打开之前，先把策略自己会产生的审查费用编进预算。

审计轨迹有两半。PR Steward 在每次推送后留言，说明改了什么、怎么还原。那不是状态更新，而是还原协定。另一半是批准决定：哪一条策略生效、当时有哪些信号、是谁或什么说 yes。如果你无法从 PR 重建这些，策略就只是装饰。策略文件的 git 历史解释规则；PR 时间轴解释决定。两者合起来，才能回答事故后唯一重要的问题：这个东西为什么被合并？

好的策略文件该有什么？不是一份最大的条件清单，而是一份简短、默认拒绝的文档：

1. **默认人工审批。** 自动批准是例外，而且要具名。
2. **敏感路径永远人工。** 认证、付款、迁移、基础设施、CI 配置，以及策略文件本身。
3. **便宜可评估的风险触发。** 大小、依赖变更、schema 变更、公开行为变更。
4. **发现规则。** 阻止级发现永远不自动批准；未验证的发现视为未结案。
5. **窄分类器与例子。** 每个都有所有者与理由，未知情况向上呈报。
6. **简短的例行工作允许清单。** 文档、测试、patch 级依赖升级是常见候选。
7. **观察开关与审查节奏。** 策略要定期重读，每次事故后也要重读。

下面的语法只是示意形状，不是 Anthropic 官方公布的 schema。重点是结构：默认、例外、信号，以及一个让整套东西维持观察模式的开关，直到有人真的信任它。

```yaml
# 示意形状，不是 Anthropic 官方公布的 schema。
default: require_human

paths:                           # 这些永远不自动批准
  "src/auth/**": human
  "db/migrations/**": human
  ".github/workflows/**": human
  "**/approval-policy*": human   # 策略管自己

findings:
  blocking: human                # 任何未结案的阻止级发现
  unverified: human              # 审查无法确认也无法驳回

classifiers:
  - name: billing-behavior
    rule: "会改变发票金额、税或退款的变更"
    action: human
  - name: dependency-major
    rule: "主版本的依赖升级"
    action: human

limits:
  max_files: 40                  # 更大的变更需要人工
  max_added_lines: 800

allow:
  - "docs/**"
  - "**/*.test.ts"
  - "检查全绿的 patch 级依赖升级"

observe: true                    # 记下决定，还不要挡
```

两个反模式值得点名。第一个是「Code Review 没标记的就批准」。这会让 Code Review 成为唯一的闸门，也让权力分立崩塌：找问题的人因为「没说话」而变成决定的人。没有发现不是安全的证据，只是「这位审查者、这一次运行，什么都没找到」的证据。第二个是策略长到没人读。没有人审的策略，只是多几步的配置文件。把它控制在一个新工程师能坐下来读完、并向审查者解释的长度。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">策略决定 // 02</span>
    <h3 class="mfig-fig-title">策略文件就是决定接口</h3>
    <p class="mfig-fig-sub">默认分支上的策略读取审查发现、自然语言分类器与仓库脉络，然后放行、要求人工或阻止。观察模式会记下同一个决定，但不运行它。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 400" role="img" aria-labelledby="ship-f2-title ship-f2-desc">
    <title id="ship-f2-title">批准策略如何做决定</title>
    <desc id="ship-f2-desc">策略文件定义默认人工审批、敏感路径、发现规则、分类器、大小限制与例行允许清单。Claude Approvals 把它与审查发现、自订分类器、仓库脉络结合。结果是放行、要求人工或阻止。观察模式下决定会被记录，但分支保护不变。</desc>
    <defs>
      <marker id="ship-f2-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">策略 // 信号 // 决定</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">默认：人工</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="224" height="152" class="term"/>
    <text x="36" y="62" class="f" font-size="6.4" letter-spacing="0.7">策略文件 // 默认分支</text>
    <line x1="36" y1="70" x2="236" y2="70" class="rule-soft"/>
    <text x="36" y="86" class="mono t" font-size="6.6" font-weight="700">default: require_human</text>
    <text x="36" y="100" class="mono m" font-size="6.4">paths.auth: human</text>
    <text x="36" y="112" class="mono m" font-size="6.4">paths.migrations: human</text>
    <text x="36" y="124" class="mono m" font-size="6.4">findings.blocking: human</text>
    <text x="36" y="136" class="mono m" font-size="6.4">classifiers: billing → human</text>
    <text x="36" y="148" class="mono m" font-size="6.4">allow: docs, tests, bumps</text>
    <line x1="36" y1="158" x2="236" y2="158" class="rule-soft"/>
    <text x="36" y="176" class="mono t" font-size="6.6" font-weight="700">observe: true</text>
    <text x="132" y="176" class="f" font-size="6">← 从这里开始</text>
    <path d="M136 196 V232" class="dash" fill="none" marker-end="url(#ship-f2-arrow)"/>
    <rect x="24" y="236" width="224" height="74" class="codebox"/>
    <text x="36" y="254" class="f" font-size="6.4" letter-spacing="0.7">观察模式</text>
    <text x="36" y="274" class="t" font-size="8.4" font-weight="800">记录，不设闸门</text>
    <text x="36" y="288" class="m" font-size="6.2">决定会被记下</text>
    <text x="36" y="300" class="f" font-size="6">分支保护不变</text>
    <rect x="592" y="44" width="224" height="152" class="box"/>
    <text x="604" y="62" class="f" font-size="6.4" letter-spacing="0.7">信号 // 每个 PR</text>
    <line x1="604" y1="70" x2="804" y2="70" class="rule-soft"/>
    <text x="604" y="88" class="t" font-size="7.6" font-weight="800">审查发现</text>
    <text x="604" y="100" class="m" font-size="6.2">严重度 · 类别 · 未结案</text>
    <line x1="604" y1="110" x2="804" y2="110" class="rule-soft"/>
    <text x="604" y="128" class="t" font-size="7.6" font-weight="800">自订分类器</text>
    <text x="604" y="140" class="m" font-size="6.2">自然语言规则</text>
    <line x1="604" y1="150" x2="804" y2="150" class="rule-soft"/>
    <text x="604" y="168" class="t" font-size="7.6" font-weight="800">仓库脉络</text>
    <text x="604" y="180" class="m" font-size="6.2">分支保护 · 检查</text>
    <rect x="316" y="70" width="204" height="92" class="term"/>
    <text x="328" y="88" class="f" font-size="6.4" letter-spacing="0.7">CLAUDE APPROVALS</text>
    <text x="328" y="110" class="t" font-size="9" font-weight="800">评估</text>
    <text x="328" y="124" class="m" font-size="6.2">策略 + 信号</text>
    <text x="328" y="136" class="f" font-size="6">每个 PR 一个决定</text>
    <text x="328" y="150" class="f" font-size="6">可以说不</text>
    <line x1="248" y1="120" x2="312" y2="120" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <line x1="588" y1="120" x2="524" y2="120" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <line x1="418" y1="162" x2="418" y2="204" class="rule"/>
    <line x1="370" y1="204" x2="733" y2="204" class="rule"/>
    <line x1="370" y1="204" x2="370" y2="232" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <line x1="550" y1="204" x2="550" y2="232" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <line x1="733" y1="204" x2="733" y2="232" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <rect x="290" y="236" width="160" height="70" class="box"/>
    <text x="302" y="254" class="f" font-size="6.4" letter-spacing="0.7">结果 01</text>
    <text x="302" y="274" class="t" font-size="9" font-weight="800">放行</text>
    <text x="302" y="288" class="m" font-size="6.2">例行变更</text>
    <text x="302" y="300" class="f" font-size="6">Claude 批准</text>
    <rect x="470" y="236" width="160" height="70" class="box"/>
    <text x="482" y="254" class="f" font-size="6.4" letter-spacing="0.7">结果 02</text>
    <text x="482" y="274" class="t" font-size="9" font-weight="800">要求人工</text>
    <text x="482" y="288" class="m" font-size="6.2">有后果的变更</text>
    <text x="482" y="300" class="f" font-size="6">由人审批</text>
    <rect x="650" y="236" width="166" height="70" class="box"/>
    <text x="662" y="254" class="f" font-size="6.4" letter-spacing="0.7">结果 03</text>
    <text x="662" y="274" class="t" font-size="9" font-weight="800">阻止</text>
    <text x="662" y="288" class="m" font-size="6.2">策略禁止</text>
    <text x="662" y="300" class="f" font-size="6">不得合并</text>
    <line x1="24" y1="330" x2="816" y2="330" class="rule-soft"/>
    <text x="420" y="348" class="f" font-size="6.4" text-anchor="middle" letter-spacing="0.6">分支保护贯彻结果 · 观察模式不改变它</text>
    <text x="420" y="366" class="f" font-size="6.2" text-anchor="middle">只能说 yes 的策略是橡皮图章</text>
  </svg>
  </div>
  <p class="mfig-fig-src">策略文件 · 审查发现 · 分类器 · 分支保护 · 先观察</p>
</figure>

## Claude Code 团队报告的结果

Anthropic 报告，在 Claude Code 团队，2026 年 6 月到 9 月之间，合并的 PR 增加超过一倍，而被回滚的 PR 占比下降超过 40%。同一段也注明，Claude 的审查只是更大流程里的其中一层。这个提醒很重要。这是来自一个大量用工具写代码的团队的内部结果，不是跨公司控制的基准测试。

两个数字放在一起，比单看任何一个有趣。合并量上升可能只因为开的 PR 变多。合并数上升、回滚占比持平，代表团队用同样的质量变快了。回滚占比下降则是质量的反向指标。Anthropic 描述的是两件事同时发生：更多合并、更少重工，而且是在一个本来就大量使用代理的团队上。如果数字站得住，移动的瓶颈是协调，不是代码生产。

这些数字不能证明全部都是 Claude Ship 造成的。这段期间还包含 Claude Code 的更广泛采用、团队流程的改变，以及工作构成的变化。「增加超过一倍」是相对变化，基期没有公布。「下降超过 40%」是回滚占比的相对下降，不是下降 40 个百分点，而且取决于回滚怎么计数。没有对照组、没有公开的同期群定义、没有独立审计。诚实的读法比较窄：至少有一个高流量的团队报告，这个循环吸收了更多 PR，而回滚占比没有变大。这是存在性证明，不是你可以直接套进预测的基准。

TELUS 的工程总监说，Code Review 在人工审查者看到 PR 之前就抓到真实问题，PR Steward 帮贡献者修好，而人的时间现在留给真正需要它的变更。这是在说注意力移动了，不是说人离开了。队列变短，判断留着。

## 限制与成本

免责声明不是套话，应该直接引用而不是改写：「Claude Ship uses AI and may miss bugs, security vulnerabilities, or other issues.」绿灯是对策略的陈述，不是对代码的证明。策略只能为它的信号看得到的东西背书，而信号是由可能朝同一个方向出错的模型产生的。

几个限制是结构性的：

- **还是 beta。** PR Steward 与 Claude Approvals 可能改变。不要在没有备用方案的情况下，把合规依赖建立在当前的语义上。
- **只支持 GitHub。** 其他平台上的仓库暂时不在范围内。
- **只限 Team 与 Enterprise。** 小团队与个人开发者无法直接采用。
- **部分组织被排除。** 不支持 Zero Data Retention、HIPAA 配置或客户自管加密密钥的组织。对这些团队，治理模式仍可移植，但这个实现不行。
- **要花 token。** 金额取决于 PR 的数量与大小、审查等级、审查频率，以及 PR Steward 的工作量。一个会用到 Claude 审查的策略，即使在观察模式也会触发计费的 Code Review。
- **它审查，不证明。** 人工审批不是可以省略的程序，而是兜住模型遗漏之处的控制点。

成本讨论通常停在账单。更重要的成本是注意力。一个把 5% 变更送给人工的策略，会得到仔细的审查，因为审查者知道队列很小、案例是被选过的。一个把 60% 送给人工的策略，会得到橡皮图章，因为没有人在自身工作之外，能长期维持那样的审查密度。策略的门槛不只分配工作，也决定人工审查还算不算数。这是设计决策，不是账务细节。

策略本身还有一条安全边界。策略文件是特权配置，比较像生产环境的 IAM，而不是 README。如果代理能改它，代理就能替自己扩权。如果开发者能在改代码的同一个 PR 里改它，策略就变成它应该判断的那个 diff 的一部分。用你最严格的审查要求保护这个文件，并把它的变更排除在自动批准路径之外。

## 实际导入路径

符合这个设计的导入路径是渐进且可衡量的。它不从最关键的仓库开始，也不从强制运行开始。

1. **选一个仓库。** 挑有真实 PR 流量、影响范围有限的。有良好测试与明确所有者的服务，比所有人都害怕的 monorepo 更适合当第一个。
2. **先开 Code Review。** 用 Quick 或 Standard。读两周的发现，确认误报率，再加入任何能阻止合并的东西。
3. **加上 PR Steward，但要看还原说明。** 每次推送后的留言就是审计轨迹。如果写得含糊，这个自动化还没准备好拿更多权限。
4. **用观察模式写策略。** 默认维持人工审批。只加入你有把握的路径与发现。在第一个分类器运行之前，先设好每月支出上限。
5. **衡量的是循环，不是 demo。** 追踪审查延迟、合并率、回滚占比、每个 PR 的人工分钟数，以及策略推翻率。推翻率高，代表策略错了，或审查者不信任它；两者都能修，但前提是你看得到。
6. **窄范围强制。** 当观察纪录与你的判断一致，才在分支保护里要求 Claude Approvals，而且只限允许清单。敏感路径留给人工。一次扩大一种变更类别。
7. **定期审查策略。** 每季一次，每次事故后一次。给文件一个所有者。把策略变更当代码变更处理，因为它就是。

| 信号 | 它告诉你什么 | 它怎么误导你 |
| :--- | :--- | :--- |
| 审查延迟 | 队列有没有在动 | 坏代码快速合并，看起来像成功 |
| 回滚占比 | 重工在上升还是下降 | 团队可以停止回滚，然后说是进步 |
| 每个 PR 的人工分钟数 | 审查是移动了，还是消失了 | 数字低可能是信任，也可能是忽视 |
| 策略推翻率 | 策略符不符合现实 | 默默推翻会藏住失效的策略 |
| 逃逸到生产环境的缺陷 | 真正重要的结果 | 杂讯大、落后，需要长窗口 |

在打开强制之前，先定义停用条件。如果回滚占比上升、如果审查者说不出一个变更为什么被批准，或如果推翻变成常态，就关掉闸门，回到观察模式。不能回退的治理系统不是控制，是承诺。

符合资格的 Claude Enterprise 组织，可以取得至少 10,000 美元的 Claude Ship 额度，额度需在领取后 30 天内使用，领取期限是 2027 年 1 月 15 日，适用相关条款。额度是拿来做实验的理由，不是跳过衡量的理由。

## 结语：合并决定是最后一英里

写补丁从来不是交付最难的部分。最难的是判断这个补丁安不安全、可以合并，而且事后还能解释这个判断。

Claude Ship 有趣，是因为它把这个判断当成一种独立的权力。Code Review 找问题。PR Steward 修问题，而且明确被禁止批准或合并。Claude Approvals 对着一份放在仓库里的策略文件做决定，可以要求人工，也可以说不。这个设计不是功能清单，而是一套权力分立，用在一个否则会把太多判断集中在「想把事情做完」的代理身上的循环。

beta 的警告不会削弱这个模式，反而定义了导入路径：先观察、窄范围强制、让人在真正重要的变更上把关，并用看待合并数一样的认真程度看待回滚占比。Anthropic 自己的免责声明就是正确的框架。系统可能会漏东西。这正是为什么策略必须能说不，也为什么必须有一个人拥有那个说不的文件。

能修任何东西的代理，仍然不该是决定它有没有上线的那一个。

## 参考资料

- [Anthropic：Introducing Claude Ship](https://claude.com/resources/articles/introducing-claude-ship) — 2026 年 11 月 23 日的发布公告。
- [Claude Ship 文档](https://code.claude.com/docs/en/claude-ship) — 设置与管理。
- [Code Review 设置指南](https://code.claude.com/docs/en/code-review-setup) — 连接 GitHub 并启用仓库。
- [Anthropic：Code Review is now generally available](https://claude.com/resources/articles/code-review-is-now-generally-available) — 审查层。
- [Anthropic：Solving code review at Anthropic](https://claude.dev/blog/solving-code-review-at-anthropic/) — 团队报告的结果。
- [GitHub：About CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) — Claude Approvals 被拿来比较的文件。
- [GitHub：About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) — 强制层。
- [Claude Enterprise：Code Review promotional credits](https://support.claude.com/en/articles/17603594-free-code-review-promotional-credits-for-claude-enterprise) — 资格与条款。
