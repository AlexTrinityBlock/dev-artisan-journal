---
title: "LangChain 如何通过 ISO/IEC 42001 人工智能治理认证"
description: "LangChain 如何用 agent lake 与 LangSmith 通过 ISO/IEC 42001，以及 trace 单独仍然证明不了什么。"
pubDate: 2026-11-25
category: "AI"
tags: ["代理治理", "ISO 42001", "可观测性", "LangSmith", "AI 管理"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分钟"
---

# LangChain 如何通过 ISO/IEC 42001 人工智能治理认证

代理可以把每件事都做对，却仍旧没有留下任何证明。这正是 AI 管理体系应该补上的缺口，也是 agent lake 能缩小、却无法独自填平的缺口。

2026 年 11 月，LangChain 发表了两篇通常被分开阅读的文章。一篇谈 [agent lake](https://www.langchain.com/blog/the-agent-lake)：为代理 trace 与 outcome 设计的存储与计算。另一篇谈 [How We Achieved ISO 42001 with LangSmith](https://www.langchain.com/blog/ai-governance-iso-iec-42001-langsmith)。合在一起读，它们的主张比各自单独读时更大：工程师调试代理所用的产物，正是审核员可以用来治理代理的产物。本文认真看待这个主张，再追问它到哪里为止。

<p class="mfig-source-note"><span class="mfig-source-label">原文 // LANGCHAIN</span> <a href="https://www.langchain.com/blog/ai-governance-iso-iec-42001-langsmith">How We Achieved ISO 42001 with LangSmith</a> <em>与</em> <a href="https://www.langchain.com/blog/the-agent-lake">The Agent Lake</a></p>

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">AGENT LAKE // 00</span>
    <p class="mfig-lead-kicker">Trace 不是一套合规计划，而是可以拿来构建合规计划的原料。</p>
    <h3 class="mfig-lead-title">Lake 负责保存证据，管理体系负责决定证据的意义。</h3>
    <p class="mfig-lead-sub">LangChain 的 agent lake 与它的 ISO/IEC 42001 审核指向同一套架构，也指向同一个极限。</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16h8"/><path d="M7 11h12"/><path d="M7 6h3"/></svg></div>
      <div class="mfig-tag">TRACE // 记录</div>
      <h4>每一步，一条记录</h4>
      <p>输入、模型调用、工具调用、输出、错误、审批，全部收进可整段阅读的 thread。</p>
      <div class="mfig-meta">TRACE · THREAD · SPAN</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
      <div class="mfig-tag">EVAL // 证明</div>
      <h4>可以重复的分数</h4>
      <p>锁定数据集、固定评测器，让一次发布成为可检验的主张，而不是轶事。</p>
      <div class="mfig-meta">DATASET · EVALUATOR · RELEASE</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/><path d="M9 12l2 2 4-4"/></svg></div>
      <div class="mfig-tag">AIMS // 循环</div>
      <h4>留下可追溯记录的治理</h4>
      <p>政策、角色、风险评估、纠正措施，围绕在代理外层，而不是只做代理内部的观测。</p>
      <div class="mfig-meta">POLICY · RISK · AUDIT</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 780 138" role="img" aria-labelledby="lake-lead-title lake-lead-desc">
    <title id="lake-lead-title">从一次代理执行，到一件证据</title>
    <desc id="lake-lead-desc">Trace 记录发生了什么，outcome 记录它是否重要，评测记录它是否通过，issue 记录什么在重复，修正记录改了什么，合起来的记录则成为审核证据。</desc>
    <defs>
      <marker id="lake-lead-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="16" class="f" font-size="9" letter-spacing="1.1">一次执行 // 六件产物</text>
    <text x="756" y="16" class="f" font-size="9" text-anchor="end" letter-spacing="1">证据链</text>
    <line x1="24" y1="25" x2="756" y2="25" class="rule"/>
    <rect x="24" y="40" width="114" height="44" class="term"/>
    <text x="81" y="62" class="t mono" font-size="11.5" font-weight="800" text-anchor="middle">TRACE</text>
    <text x="81" y="100" class="m" font-size="9" text-anchor="middle">发生了什么</text>
    <line x1="140" y1="62" x2="146" y2="62" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="148" y="40" width="114" height="44" class="box"/>
    <text x="205" y="62" class="t mono" font-size="11.5" font-weight="800" text-anchor="middle">OUTCOME</text>
    <text x="205" y="100" class="m" font-size="9" text-anchor="middle">是否重要</text>
    <line x1="264" y1="62" x2="270" y2="62" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="272" y="40" width="114" height="44" class="term"/>
    <text x="329" y="62" class="t mono" font-size="11.5" font-weight="800" text-anchor="middle">EVAL</text>
    <text x="329" y="100" class="m" font-size="9" text-anchor="middle">是否通过</text>
    <line x1="388" y1="62" x2="394" y2="62" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="396" y="40" width="114" height="44" class="box"/>
    <text x="453" y="62" class="t mono" font-size="11.5" font-weight="800" text-anchor="middle">ISSUE</text>
    <text x="453" y="100" class="m" font-size="9" text-anchor="middle">什么在重复</text>
    <line x1="512" y1="62" x2="518" y2="62" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="520" y="40" width="114" height="44" class="term"/>
    <text x="577" y="62" class="t mono" font-size="11.5" font-weight="800" text-anchor="middle">FIX</text>
    <text x="577" y="100" class="m" font-size="9" text-anchor="middle">改了什么</text>
    <line x1="636" y1="62" x2="642" y2="62" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="644" y="40" width="114" height="44" class="codebox"/>
    <text x="701" y="62" class="t mono" font-size="11.5" font-weight="800" text-anchor="middle">EVIDENCE</text>
    <text x="701" y="100" class="m" font-size="9" text-anchor="middle">证明了什么</text>
    <text x="390" y="126" class="f" font-size="9" text-anchor="middle" letter-spacing="0.5">每一步都写下一笔记录 // 记录只有在 SCHEMA 站得住时才有用</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>证据不等于合规。</b>Lake 为四个审核问题提供证据；管理体系决定这些答案是否可被接受。</p>
</section>

<p class="mfig-bridge">这个区别就是本文的论点：lake 存了什么、审核员能向它追问什么，以及还有什么必须留在 lake 之外。</p>

## 政策与一次执行之间的落差

多数 AI 治理一开始都是一份文件。它点名系统、指派负责人、禁止某些动作、要求另一些动作必须经过审查，并承诺持续监控。文件是必要的。但从证据的角度看，它只是一份意图声明。

代理不像服务那样有固定的契约。同样的输入，可能产生不同的计划、不同的工具顺序、不同的副作用。一次执行可以在错误的任务上成功，也可以在失败时留下一条被改过的客户记录。传统监控能捕捉延迟、错误率、可用性，却捕捉不到真正致命的那句话：代理正确地把信寄给了错误等级的客户。

审核问题比「代理好不好？」更窄，也更难：代理被允许做什么、你怎么知道它有效、它实际做了什么、它失败之后改了什么？这四个问题需要四种证据。其中只有一种是仪表盘。

可观测性提供执行记录。治理提供权限、风险决定与纠正。Agent lake 有趣的地方，在于它站在两者之间：它让执行记录与对这次执行的判断，可以用同一组标识符放在一起。

商业框架是 LangChain 的。架构论证则更广，而且经得起营销语言的检验：任何让代理握有真实权限的组织，都需要一套方法，重建发生过什么，并把它连回「这件事该不该发生」。

## Agent lake 实际上存了什么

LangChain 把 agent lake 定义为「结合为代理 trace 优化的存储，以及智能计算，用来查询、分析、从中学习，推动代理持续改进」的平台。

拿掉营销语言，这个定义有三个部分。存储是为 trace 优化的，不是为数据行优化的。计算是设计来从非结构化推理里找出意义，不只是汇总数字。目的则是一个循环：生产数据变成评测数据，评测数据变成一次变更，变更再回到生产。

一条 trace 记录一次执行的每一步：用户输入、每一次模型调用、每一次工具调用、最后输出。多轮互动会收进 thread，让一整段对话可以被当成一个单位阅读，而不是一堆互不相干的请求。这很重要，因为真正有意思的失败通常是一串序列：一次看似合理的检索、一次自信的工具调用、一个安静的错误、一句流畅的道歉。

Lake 也存 outcome。Outcome 是工作造成的影响，可以跟 trace 或 thread 一对一，也可以多对多。一个点踩属于某一次回复；一个合并的 PR 可能由一个 thread 开启、由好几个 thread 共同贡献；一段被复制的代码，可能是答案有用的唯一信号。Outcome 来自四种来源：用户、对代理实际作用的系统进行直接观察、以 LLM-as-a-judge 产生的替代指标，以及人工标注。

配对本身就是设计。没有 outcome 的 trace 是轶事。没有 trace 的 outcome 是没有人能据以行动的数字。把两者放进同一个存储、用稳定的 join 连起来，问题就从「我们的成功率是多少？」变成「哪些轨迹会带来成功、对哪些用户、在哪些权限之下？」

每一种 outcome 来源都有不同的偏差。用户报告的是什么惹恼了他们。系统报告的是完成了什么。裁判报告的是看起来正确的结果。标注者报告的是他们被付钱去找的东西。只记录一种来源的证据层，一定会对它过拟合。当 outcome 表被允许彼此矛盾，lake 反而更可信。

LangChain 的规模说法很大：SmithDB 是它为 trace 专门打造的数据库；LangSmith 每月接收数十亿次代理执行的 trace；客户 Clay 每天送来数亿个事件。我没有独立核实这些数字，它们是 LangChain 公布的主张，不是审计测量结果。规模有意义，理由很实际：在数十亿次执行里，没有人会逐条读 trace，大家靠查询。计算层不是便利功能，而是人类找到关键那一条执行的唯一方法。

这也是传统数据湖不够用的原因。通用数据湖可以存 JSON。它不能以低成本回答 trace 形状的问题：重建父子 span 树、切出一个 thread 的时间窗、把 feedback join 到某个步骤、语义筛选「用户感到挫折的 thread」或「含有 PII 的 trace」，并且对提示词、输出、工具 payload 套用不同的保留规则。你可以在 Snowflake 或 Databricks 上全部自己搭，很多团队也真的这样做。但你是在通用数据湖里建一个 trace 数据库，而最难的是 schema。

LangChain 的计算层，最容易理解成四种工作。在线评测器与 AI Search 负责找出有意思的 trace；决策模型让这件事成本低到可以持续运行。Insights 把流量聚类，让新的使用情境与正在转移的失败模式浮现。Engine 把重复失败变成 issue、追查根因、提出 PR。SmithTune 用最好的轨迹微调模型，再跟基础模型比较。厂商表示，Engine 已经分析超过六千万条生产 trace；一个用 Engine 轨迹微调的 Kimi K3，在内部 IssueBench 子集上得到 96 分，基础 Kimi K3 是 90 分，GPT-5.6 Sol 是 87 分。这些是厂商在自家内部基准上的数字，不是对任何其他人任务的保证。

真正重要的主张，不是每家公司都需要这五种工具，而是存储与计算共用同一套 schema。Lake 不是更大的日志存储。它是一套结构，把运营的废气变成证据。

<figure class="mfig-fig mfig-fig-arch">
  <figcaption>
    <span class="card-tag">THE ARCHITECTURE // 01</span>
    <h3 class="mfig-fig-title">Lake 是一条管线，旁边有一道治理侧栏</h3>
    <p class="mfig-fig-sub">代理、工具、用户与 outcome 经过写入层；SmithDB 把执行记录与判断放在一起；计算把它们变成 issue、修正与测试。侧栏不在 lake 里，但每一个阶段都依赖它。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 780 500" role="img" aria-labelledby="lake-f1-title lake-f1-desc">
    <title id="lake-f1-title">Agent lake 与治理侧栏的架构</title>
    <desc id="lake-f1-desc">代理、工具、用户与 outcome 进入写入层，经过批处理、流式、脱敏、抽样、schema 检查与保留策略。SmithDB 持有 trace、thread、span、feedback 与 outcome。智能计算在存储之上运行在线评测、AI Search、Insights、Engine 与 SmithTune。结果变成有标签的部署，生产执行再经由反馈回路成为新证据。右侧的垂直治理侧栏列出政策、角色、风险登记册、数据溯源、人工监督与纠正措施，这些元素在 lake 之外、审核之内。</desc>
    <defs>
      <marker id="lake-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="9" letter-spacing="1.1">AGENT LAKE // TRACE + OUTCOME + 计算</text>
    <text x="600" y="18" class="f" font-size="9" text-anchor="end" letter-spacing="1">是证据，不是合规</text>
    <line x1="24" y1="27" x2="600" y2="27" class="rule"/>
    <line x1="616" y1="27" x2="756" y2="27" class="rule"/>
    <text x="24" y="48" class="f" font-size="8.5" letter-spacing="0.8">来源</text>
    <rect x="24" y="56" width="138" height="58" class="box"/>
    <text x="34" y="74" class="f" font-size="8.5" letter-spacing="0.5">代理</text>
    <text x="34" y="93" class="t" font-size="12.5" font-weight="800">执行</text>
    <text x="34" y="107" class="m" font-size="9.5">计划 · thread</text>
    <rect x="170" y="56" width="138" height="58" class="term"/>
    <text x="180" y="74" class="f" font-size="8.5" letter-spacing="0.5">工具</text>
    <text x="180" y="93" class="t" font-size="12.5" font-weight="800">调用</text>
    <text x="180" y="107" class="m" font-size="9.5">副作用</text>
    <rect x="316" y="56" width="138" height="58" class="box"/>
    <text x="326" y="74" class="f" font-size="8.5" letter-spacing="0.5">用户</text>
    <text x="326" y="93" class="t" font-size="12.5" font-weight="800">反馈</text>
    <text x="326" y="107" class="m" font-size="9.5">审批</text>
    <rect x="462" y="56" width="138" height="58" class="term"/>
    <text x="472" y="74" class="f" font-size="8.5" letter-spacing="0.5">OUTCOME</text>
    <text x="472" y="93" class="t" font-size="12.5" font-weight="800">影响</text>
    <text x="472" y="107" class="m" font-size="9.5">PR · 分数 · 标注</text>
    <line x1="93" y1="114" x2="93" y2="121" class="rule-soft"/>
    <line x1="239" y1="114" x2="239" y2="121" class="rule-soft"/>
    <line x1="385" y1="114" x2="385" y2="121" class="rule-soft"/>
    <line x1="531" y1="114" x2="531" y2="121" class="rule-soft"/>
    <line x1="93" y1="121" x2="531" y2="121" class="rule-soft"/>
    <line x1="312" y1="121" x2="312" y2="130" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="24" y="130" width="576" height="64" class="codebox"/>
    <text x="36" y="148" class="f" font-size="9" letter-spacing="0.6">写入 // 单一入口</text>
    <text x="36" y="171" class="t" font-size="11" font-weight="600">批处理 · 流式 · 脱敏 · 抽样 · SCHEMA 检查 · 保留策略</text>
    <line x1="312" y1="194" x2="312" y2="202" class="rule-soft"/>
    <line x1="139" y1="202" x2="383" y2="202" class="rule-soft"/>
    <line x1="139" y1="202" x2="139" y2="210" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <line x1="383" y1="202" x2="383" y2="210" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="24" y="210" width="230" height="182" class="term"/>
    <text x="36" y="230" class="f" font-size="9" letter-spacing="0.6">TRACE + OUTCOME 存储</text>
    <text x="36" y="256" class="t mono" font-size="16" font-weight="800">SmithDB</text>
    <line x1="36" y1="266" x2="242" y2="266" class="rule-soft"/>
    <text x="36" y="286" class="m" font-size="11">trace</text>
    <text x="36" y="306" class="m" font-size="11">thread</text>
    <text x="36" y="326" class="m" font-size="11">span</text>
    <text x="142" y="286" class="m" font-size="11">feedback</text>
    <text x="142" y="306" class="m" font-size="11">outcome</text>
    <line x1="36" y1="340" x2="242" y2="340" class="rule-soft"/>
    <text x="36" y="356" class="m" font-size="9.5">仅附加 · 高基数</text>
    <text x="36" y="370" class="m" font-size="9.5">trace 形状的 schema</text>
    <text x="36" y="383" class="f" font-size="8.5">每月数十亿次执行 · LANGCHAIN 说法</text>
    <rect x="266" y="210" width="226" height="182" class="box"/>
    <text x="278" y="230" class="f" font-size="9" letter-spacing="0.6">智能计算</text>
    <text x="278" y="252" class="t" font-size="11" font-weight="800">在线评测</text>
    <text x="278" y="264" class="m" font-size="9.5">幻觉 · 毒性</text>
    <text x="278" y="282" class="t" font-size="11" font-weight="800">AI SEARCH</text>
    <text x="278" y="294" class="m" font-size="9.5">自然语言查询</text>
    <text x="278" y="312" class="t" font-size="11" font-weight="800">INSIGHTS</text>
    <text x="278" y="324" class="m" font-size="9.5">流量聚类</text>
    <text x="278" y="342" class="t" font-size="11" font-weight="800">ENGINE</text>
    <text x="278" y="354" class="m" font-size="9.5">issue → 根因 → PR</text>
    <text x="278" y="372" class="t" font-size="11" font-weight="800">SMITHTUNE</text>
    <text x="278" y="384" class="m" font-size="9.5">最佳轨迹</text>
    <line x1="256" y1="300" x2="264" y2="300" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <line x1="494" y1="300" x2="502" y2="300" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="504" y="210" width="96" height="102" class="codebox"/>
    <text x="524" y="230" class="f" font-size="9" letter-spacing="0.6">部署</text>
    <text x="524" y="254" class="t" font-size="15" font-weight="800">v+1</text>
    <text x="524" y="270" class="m" font-size="9.5">已标记</text>
    <text x="524" y="282" class="m" font-size="9.5">已审查</text>
    <text x="524" y="294" class="m" font-size="9.5">可回滚</text>
    <text x="524" y="306" class="m" font-size="8.5">审批关卡</text>
    <line x1="552" y1="312" x2="552" y2="322" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="504" y="322" width="96" height="70" class="box"/>
    <text x="524" y="340" class="f" font-size="9" letter-spacing="0.6">生产环境</text>
    <text x="524" y="362" class="t" font-size="11" font-weight="800">新执行</text>
    <text x="524" y="376" class="m" font-size="9.5">新 trace</text>
    <text x="524" y="388" class="m" font-size="9.5">新 outcome</text>
    <path d="M552 392 V412 H139 V394" class="arrow" fill="none" marker-end="url(#lake-f1-arrow)"/>
    <text x="340" y="428" class="f" font-size="9.5" text-anchor="middle" letter-spacing="0.6">新的执行会变成新的证据</text>
    <rect x="616" y="40" width="140" height="372" class="dash"/>
    <text x="628" y="60" class="f" font-size="8.5" letter-spacing="0.8">治理</text>
    <text x="628" y="78" class="t mono" font-size="11" font-weight="800">证据侧栏</text>
    <line x1="628" y1="86" x2="744" y2="86" class="rule-soft"/>
    <text x="628" y="102" class="f" font-size="8.5">在 LAKE 之外</text>
    <text x="628" y="114" class="f" font-size="8.5">在审核之内</text>
    <text x="628" y="140" class="m" font-size="10.5">政策</text>
    <text x="628" y="176" class="m" font-size="10.5">角色</text>
    <text x="628" y="212" class="m" font-size="10.5">风险登记册</text>
    <text x="628" y="248" class="m" font-size="10.5">数据溯源</text>
    <text x="628" y="284" class="m" font-size="10.5">人工监督</text>
    <text x="628" y="320" class="m" font-size="10.5">纠正措施</text>
    <line x1="628" y1="338" x2="744" y2="338" class="rule-soft"/>
    <text x="628" y="358" class="f" font-size="8.5">适用于每一个阶段</text>
    <text x="628" y="370" class="f" font-size="8.5">不存在 trace 存储里</text>
    <line x1="24" y1="440" x2="756" y2="440" class="rule"/>
    <text x="24" y="458" class="f" font-size="8.5" letter-spacing="0.8">LAKE 证明什么</text>
    <text x="24" y="474" class="t" font-size="11" font-weight="800">执行 + outcome</text>
    <text x="24" y="488" class="m" font-size="9.5">以稳定 ID 关联</text>
    <text x="280" y="458" class="f" font-size="8.5" letter-spacing="0.8">侧栏补上什么</text>
    <text x="280" y="474" class="t" font-size="11" font-weight="800">权限 + 风险 + 纠正</text>
    <text x="280" y="488" class="m" font-size="9.5">lake 无法做的决定</text>
    <text x="536" y="458" class="f" font-size="8.5" letter-spacing="0.8">审核问什么</text>
    <text x="536" y="474" class="t" font-size="11" font-weight="800">允许 · 有效 · 做了什么 · 改进</text>
    <text x="536" y="488" class="m" font-size="9.5">四个问题，四种证据</text>
  </svg>
  </div>
  <p class="mfig-fig-src">TRACE + OUTCOME · SMITHDB · 计算 · 部署 · 治理侧栏</p>
</figure>

## 审核员会问的四个问题

LangChain 说，它的 ISO/IEC 42001 审核，对每个纳入范围的 AI 系统都收敛成四个问题：代理被允许做什么？你怎么证明代理有效？你怎么证明代理做了什么？你怎么改进代理？我在这里沿用这四个问题，因为不论你是否追求认证，它们都是一份好用的、与供应商无关的清单。

| 问题 | 证据产物 | 能证明什么 | 还缺什么 |
| :--- | :--- | :--- | :--- |
| 允许 | 工作区权限、凭证模型、工具 Auto/Ask、提示词标签 | 边界已被定义，并在示范的执行中实际执行 | 边界是否符合风险评估，以及谁接受了剩余风险 |
| 有效 | 版本化数据集、固定评测器、发布实验、数据溯源 | 这次发布是依照可复现的正确定义受测 | 测试分布是否符合生产，以及评测器本身是否正确 |
| 做了什么 | 含工具调用、错误、审批、评测反馈的 trace | 存在执行记录，且可以重建一次执行 | 记录是否完整、是否可检测篡改、是否为真 |
| 改进 | Issue、根因分析、PR、回归测试 | 失败被检测到，并被送进变更流程 | 变更是否处理了根因，以及修正是否持久 |

**允许。** 在 LangSmith Fleet 里，LangChain 演示三层控制：工作区权限决定有哪些集成、谁能新增能力；代理配置决定代理使用谁的凭证、谁能调用它，而「共用凭证」或「调用者 OAuth 凭证」的选择在创建时就固定；工具配置决定每个工具是自动执行，还是停下来等人审查。审核演示用的是一个设为 Ask 的 Slack 工具。执行暂停，审查者附上理由拒绝，代理报告拒绝，没有重试。

重点不是「有审批」这件事，而是 trace 记下了暂停、拒绝、理由，以及没有重试。配置截图证明的是意图；trace 证明的是执行。提示词与上下文的版本控制，对指令也提供同样的区分：commit 与可移动的标签，显示改了什么、谁改的、当时生产环境是哪个版本。

**有效。** 代理评测的可复现性，不是输出的可复现性，而是测试的可复现性。LangChain 把数据集与评测器固定住，让分数的变化可以归因于代理，而不是考卷。它配套的控制值得借鉴：评测数据只来自 LangChain 自己运营的系统，绝不来自客户工作区；每个评测测试都记录示例来源，并附上评分代码；变更走 code review；空白答案也能通过的测试会被丢弃；每个评分器都用一个已知正确的答案检查过。

每一项控制都在回答不同的失败。溯源回答「数据从哪里来？」Code review 回答「谁改了测试？」丢掉空白测试回答「这个测试到底量到了什么？」评分器校准回答「裁判本身对吗？」合在一起，它们才把一个评测分数从数字变成可辩护的测量。

**做了什么。** Trace 是最强的证据类别，也是最脆弱的。它在同一条记录里显示输入与输出、工具调用与错误，以及一次审批的暂停与恢复。发布前用的评测，也可以套用在生产 trace 上，把反馈挂回该次执行，让审查者打开被标记的答案，看见导致它的动作。跟着 trace 一起存下的更正，可以用于下一次评测。

这就是审核员说的活动记录。它不是一行写着「请求成功」的日志，而是一条可重建的系统路径，决策点清楚可见。

**改进。** Engine 把重复失败分组成 issue，在代理源代码里追根因，提交一个 PR，并可在人看到之前先用评测集测试修正。审核员跟着一条变更走过审查、进到代码库，再看到那些 trace 变成回归数据集里的示例。最后这一步，多数团队会跳过。合并的 PR 是一条变更记录；只有当它关联到一个 finding，并且后面跟着有效性检查，它才成为纠正措施。

「还缺什么」那一栏，就是本文的论点。每一件产物都把自己的问题回答得够好，好到有用；也回答得够差，差到若被当成全部答案就很危险。

## ISO/IEC 42001 在这里的角色

ISO/IEC 42001 是 AI 管理体系的国际标准。它可以获得认证，建立在 ISO 各项标准共用的协调一致管理体系结构上，并以规划－执行－检查－行动（PDCA）循环组织。附录 A 把控制措施依政策、内部组织、资源、影响评估、AI 系统生命周期、数据、给利害关系人的信息、AI 系统的使用，以及第三方关系分组。

认证不是产品审查。它从管理体系的内部审核开始。接着由经认可的外部审核员检查系统是否照文件所述运作。监督审核每年重复一次。LangChain 表示，其范围涵盖所有在 LangChain 管理的模型上执行推理的 GA LangSmith 功能背后的管理体系，而新推出的 AI 功能每年会加入范围。

看任何证书，先看范围。狭窄的范围可以完全诚实，却对范围外的产品部分几乎什么都没说。「我们治理我们自己运行的东西」是一条站得住脚的边界，但它不等于「我们治理客户用我们建立的一切」。

PDCA 循环是证据与管理交汇的地方。规划涵盖范围、政策、角色、风险与影响评估、目标。执行涵盖生命周期控制、数据处理、运营。检查涵盖监控、测量、内部审核、管理评审。行动涵盖不符合项、纠正措施、持续改进。证据流入每一个阶段，但不取代任何阶段。一条 trace 可以满足记录控制，却不能满足政策控制、角色控制或影响评估控制。

LangChain 附录里的控制对照，是把控制连到产物的好例子：Fleet 配置对应 A.6.2.2，工具审批对应 A.6.2.3 与 A.9.3，数据集版本与溯源对应 A.7.2 与 A.7.5，实验对应 A.6.2.4，trace 对应 A.6.2.8，在线评测与告警对应 A.6.2.6 与条文 9.1，Engine 对应条文 10.1 与 10.2。这张对照表是 LangChain 的，不是审核员的。产物是否真的满足一项控制，由审核员判定。博客里的一张表，是关于适用性的主张，不是适用性的证明。但小心使用的话，这张表显示了一个真正的证据计划的形状：每一项控制都应该指向一件产物、一位负责人、一个测试。

<figure class="mfig-fig mfig-fig-arch">
  <figcaption>
    <span class="card-tag">证据地图 // 02</span>
    <h3 class="mfig-fig-title">四个问题、一个管理循环，以及夹在中间的产物</h3>
    <p class="mfig-fig-sub">每个审核问题对应一种证据类别，也对应规划－执行－检查－行动循环的一个阶段。产物来自 lake；政策、角色、影响评估、风险接受与管理评审则不是。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 780 524" role="img" aria-labelledby="lake-f2-title lake-f2-desc">
    <title id="lake-f2-title">ISO/IEC 42001 证据地图</title>
    <desc id="lake-f2-desc">四个审核问题——允许、有效、做了什么、改进——分别对应权限与提示词标签、版本化评测与溯源、trace 与审批，以及 issue 与回归测试。每一列也对应规划、执行、检查或行动阶段，以及附录 A 条文。政策、角色、影响评估、风险接受、内部审核与管理评审，位在 lake 之外、管理体系之内。</desc>
    <defs>
      <marker id="lake-f2-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="9" letter-spacing="1.1">ISO/IEC 42001 // 证据地图</text>
    <text x="756" y="18" class="f" font-size="9" text-anchor="end" letter-spacing="1">四个问题 // 一个循环</text>
    <line x1="24" y1="27" x2="756" y2="27" class="rule"/>
    <rect x="24" y="40" width="210" height="70" class="term"/>
    <text x="36" y="56" class="f" font-size="8.5" letter-spacing="0.6">Q1 // 允许</text>
    <text x="36" y="78" class="t" font-size="12.5" font-weight="800">它可以做什么？</text>
    <text x="36" y="94" class="m" font-size="9.5">权限与监督</text>
    <rect x="242" y="40" width="308" height="70" class="box"/>
    <text x="256" y="56" class="f" font-size="8.5" letter-spacing="0.6">证据</text>
    <text x="256" y="74" class="m" font-size="10.5">工作区权限</text>
    <text x="256" y="89" class="m" font-size="10.5">凭证模型 · Auto / Ask</text>
    <text x="256" y="104" class="m" font-size="10.5">提示词标签 · 审批者</text>
    <rect x="558" y="40" width="104" height="70" class="codebox"/>
    <text x="570" y="56" class="f" font-size="8.5" letter-spacing="0.6">附录 A</text>
    <text x="570" y="78" class="t mono" font-size="10.5">A.6.2.2</text>
    <text x="570" y="94" class="t mono" font-size="10.5">A.6.2.3</text>
    <rect x="670" y="40" width="86" height="70" class="box"/>
    <text x="682" y="56" class="f" font-size="8.5" letter-spacing="0.6">阶段</text>
    <text x="682" y="86" class="t mono" font-size="11.5" font-weight="800">规划</text>
    <rect x="24" y="118" width="210" height="70" class="box"/>
    <text x="36" y="134" class="f" font-size="8.5" letter-spacing="0.6">Q2 // 有效</text>
    <text x="36" y="156" class="t" font-size="12.5" font-weight="800">如何证明它有效？</text>
    <text x="36" y="172" class="m" font-size="9.5">验证与确认</text>
    <rect x="242" y="118" width="308" height="70" class="term"/>
    <text x="256" y="134" class="f" font-size="8.5" letter-spacing="0.6">证据</text>
    <text x="256" y="152" class="m" font-size="10.5">版本化数据集 · 固定评测器</text>
    <text x="256" y="167" class="m" font-size="10.5">发布实验</text>
    <text x="256" y="182" class="m" font-size="10.5">数据溯源 · 来源血缘</text>
    <rect x="558" y="118" width="104" height="70" class="codebox"/>
    <text x="570" y="134" class="f" font-size="8.5" letter-spacing="0.6">附录 A</text>
    <text x="570" y="156" class="t mono" font-size="10.5">A.6.2.4</text>
    <text x="570" y="172" class="t mono" font-size="10.5">A.7.2 · A.7.5</text>
    <rect x="670" y="118" width="86" height="70" class="term"/>
    <text x="682" y="134" class="f" font-size="8.5" letter-spacing="0.6">阶段</text>
    <text x="682" y="164" class="t mono" font-size="11.5" font-weight="800">执行 · 检查</text>
    <rect x="24" y="196" width="210" height="70" class="term"/>
    <text x="36" y="212" class="f" font-size="8.5" letter-spacing="0.6">Q3 // 做了什么</text>
    <text x="36" y="234" class="t" font-size="12.5" font-weight="800">它做了什么？</text>
    <text x="36" y="250" class="m" font-size="9.5">记录与监控</text>
    <rect x="242" y="196" width="308" height="70" class="box"/>
    <text x="256" y="212" class="f" font-size="8.5" letter-spacing="0.6">证据</text>
    <text x="256" y="230" class="m" font-size="10.5">trace · 工具调用 · 错误</text>
    <text x="256" y="245" class="m" font-size="10.5">审批 · 暂停 / 恢复</text>
    <text x="256" y="260" class="m" font-size="10.5">评测反馈 · 更正</text>
    <rect x="558" y="196" width="104" height="70" class="codebox"/>
    <text x="570" y="212" class="f" font-size="8.5" letter-spacing="0.6">附录 A</text>
    <text x="570" y="234" class="t mono" font-size="10.5">A.6.2.8</text>
    <text x="570" y="250" class="t mono" font-size="10.5">条文 9.1</text>
    <rect x="670" y="196" width="86" height="70" class="box"/>
    <text x="682" y="212" class="f" font-size="8.5" letter-spacing="0.6">阶段</text>
    <text x="682" y="242" class="t mono" font-size="11.5" font-weight="800">检查</text>
    <rect x="24" y="274" width="210" height="70" class="box"/>
    <text x="36" y="290" class="f" font-size="8.5" letter-spacing="0.6">Q4 // 改进</text>
    <text x="36" y="312" class="t" font-size="12.5" font-weight="800">如何改进它？</text>
    <text x="36" y="328" class="m" font-size="9.5">纠正措施</text>
    <rect x="242" y="274" width="308" height="70" class="term"/>
    <text x="256" y="290" class="f" font-size="8.5" letter-spacing="0.6">证据</text>
    <text x="256" y="308" class="m" font-size="10.5">issue · 根因分析</text>
    <text x="256" y="323" class="m" font-size="10.5">PR · 回归测试</text>
    <text x="256" y="338" class="m" font-size="10.5">有效性检查</text>
    <rect x="558" y="274" width="104" height="70" class="codebox"/>
    <text x="570" y="290" class="f" font-size="8.5" letter-spacing="0.6">附录 A</text>
    <text x="570" y="312" class="t mono" font-size="10.5">10.1</text>
    <text x="570" y="328" class="t mono" font-size="10.5">10.2</text>
    <rect x="670" y="274" width="86" height="70" class="term"/>
    <text x="682" y="290" class="f" font-size="8.5" letter-spacing="0.6">阶段</text>
    <text x="682" y="320" class="t mono" font-size="11.5" font-weight="800">行动</text>
    <text x="24" y="364" class="f" font-size="9" letter-spacing="0.6">管理体系 // PDCA</text>
    <rect x="24" y="372" width="177" height="72" class="box"/>
    <text x="36" y="392" class="f" font-size="9" letter-spacing="0.6">规划</text>
    <text x="36" y="412" class="m" font-size="9.5">范围 · 政策 · 角色</text>
    <text x="36" y="428" class="m" font-size="9.5">风险 + 影响 · 目标</text>
    <rect x="209" y="372" width="177" height="72" class="term"/>
    <text x="221" y="392" class="f" font-size="9" letter-spacing="0.6">执行</text>
    <text x="221" y="412" class="m" font-size="9.5">生命周期 · 数据处理</text>
    <text x="221" y="428" class="m" font-size="9.5">运营 · 控制</text>
    <rect x="394" y="372" width="177" height="72" class="box"/>
    <text x="406" y="392" class="f" font-size="9" letter-spacing="0.6">检查</text>
    <text x="406" y="412" class="m" font-size="9.5">监控 · 测量</text>
    <text x="406" y="428" class="m" font-size="9.5">内部审核 · 管理评审</text>
    <rect x="579" y="372" width="177" height="72" class="term"/>
    <text x="591" y="392" class="f" font-size="9" letter-spacing="0.6">行动</text>
    <text x="591" y="412" class="m" font-size="9.5">不符合项</text>
    <text x="591" y="428" class="m" font-size="9.5">纠正措施 · 有效性</text>
    <line x1="24" y1="460" x2="756" y2="460" class="rule"/>
    <text x="24" y="478" class="f" font-size="9.5">LAKE 之外，AIMS 之内：政策 · 角色 · 问责 · 影响评估</text>
    <text x="24" y="492" class="f" font-size="9.5">风险接受 · 适用性声明 · 内部审核 · 管理评审</text>
    <text x="24" y="510" class="t" font-size="10.5" font-weight="800">TRACE 回答发生了什么。AIMS 回答谁有权做决定。</text>
  </svg>
  </div>
  <p class="mfig-fig-src">允许 · 有效 · 做了什么 · 改进 · 规划 · 执行 · 检查 · 行动</p>
</figure>

案例研究里最有意思的是 Security Agent。LangChain 用 Deep Agents 建它、在 LangSmith 上运行它、用它把两人治理团队的产能放大，并且让它自己的执行也留下 trace，工具使用和其他代理一样的审批配置。政策、评估、审核答复都经过这个代理；它对环境、盘点、代码与过去决定的知识，每运行一次就累积一次。

递归本身就是重点。如果治理职能自己也是代理，它的执行、权限、审批就必须位在同一层证据里。否则系统里权力最大的代理，会是证据最少的那一个。LangChain 的答案是人工审查，以及把更正反馈给代理。这是合理的控制，但它需要自己的记录：谁审查、改了什么、怎么知道改对了。

这个案例不是模板。两人团队、范围狭窄，可以把很多文件工作自动化。大型企业有遗留系统、产业监管机关、职工代表大会，面对的是不同的问题，也有不同的风险偏好。可以转移的是证据的架构，不是组织图。

## 改进循环就是一项控制

改进循环常被描述成一条功能链：在线评测、AI Search、Insights、Engine、SmithTune。把它读成一条控制链更有用：每一环都把一个信号转换成另一种记录。

在线评测器定义失败。幻觉、毒性、用户满意度不是中性的测量，而是用分数表达的政策选择。你定义评测器的那一刻，就定义了什么算缺陷。这是包装成指标的治理决定，应该放进风险评估，而不是只放在可观测性仪表盘。

AI Search 与 Insights 定义总体。AI Search 让人用自然语言问问题，再由决策模型对结果套语义筛选。Insights 把近期 trace 分组，并持续把新对话归进类别。聚类告诉你哪些失败常见，不会告诉你哪些失败严重。严重性是风险判断，必须从聚类之外进来。

Engine 定义修正。它定期扫描 trace、把重复失败分成 issue、追查根因、提交 PR；从第二版起，还能在人看到之前先用评测集测试修正。控制不是自动化，控制是审核关卡：有人确认 issue 是真的、根因说得通、修正是可接受的。少了这道关卡的自动化，只会产生更快的未经审核的变更队列。

PR 与回归测试定义记忆。没有被写成测试的修正，是组织会丢失的修正。LangChain 的循环把失败背后的 trace 变成评测数据集里的示例，失败于是成为后续版本的回归测试。这就是修好代理与改进代理的差别。

SmithTune 定义模型。用最佳轨迹微调很吸引人，因为 lake 里已经有语料。LangChain 公布的结果——微调后的 Kimi K3 在内部 IssueBench 子集上 96 分，基础模型 90 分，GPT-5.6 Sol 87 分——是厂商在厂商任务上的基准。它证明方法可能可行，不证明在你的流量上可行。微调后的模型也是一次新发布，需要和其他变更一样的评测、审批、回滚路径，而不是一场庆功。

人工审批与提示词版本控制是控制，不是功能。Auto 与 Ask 只有在审批被记录、审批者有权、拒绝被尊重、记录被保留时才有意义。版本控制只有在发布有标签、diff 被审核、可以回滚时才有意义。一个写着「需要审批」的按钮是配置；一条被拒绝动作的 trace，才是控制确实运作的证据。

条文 10.1 与 10.2 在这里变得具体。持续改进需要 finding、根因、行动、有效性评审。不符合项与纠正措施需要同一条链，再加上一个决定：已经出错的输出要怎么处理。没有 finding 的 PR 是维护。没有有效性检查的 finding 是祈祷。

## 不导入 LangSmith 也能复制的事

你不需要 SmithDB 才能建证据层。你需要 schema、保留策略，以及把证据当成有用户的产品来经营的纪律。下面这份清单刻意与供应商无关。每一项的测试不是「我们有没有工具？」而是「有人提出要求时，我们拿不拿得出产物？」

1. **Trace schema。** Span 要有父子链接、thread 标识符、模型与工具版本、开始与结束时间、状态、审批事件，以及明确的脱敏标记。测试：你能不能只用一次查询重建一次执行，不必 join 五份应用程序日志？
2. **Outcome 链接。** 从 trace 或 thread 到 outcome 的稳定标识符、宣告的基数、来源、时间戳，以及负面结果。测试：你能不能算出每个版本、每个使用情境的成功率，并解释分母？
3. **不可变保留。** 仅附加存储、每条记录的哈希或签名、可信时钟，以及区分到期与法定留存的删除政策。测试：管理员能不能悄悄修改一条 trace？答案应该是不行。
4. **评测版本控制。** 数据集的内容哈希、评测器与裁判模型的版本、执行配置，以及把三者固定的 CI 工作。测试：分数改变时，你能分辨是代理、数据，还是裁判变了？
5. **审批记录。** 谁审批或拒绝、实际看到什么、何时、依据哪条政策、理由是什么。把记录绑到它授权的工具调用。测试：你能不能拿出一条被拒绝的动作，并证明它没有执行？
6. **数据溯源。** 来源系统、同意或授权、转换过程，以及客户数据是否被排除。血缘要追到单一评测示例。测试：你能不能把每个测试用例追到一个被允许的来源？
7. **访问控制。** 证据存储采用最小权限，因为 trace 含提示词、输出，有时还有个人信息。读取也要记录，不是只记写入。测试：谁能读含 PII 的 trace，那次访问有被审核吗？
8. **风险登记册。** 代理盘点、使用情境、自主程度、数据类别、受影响对象、负责人，以及剩余风险的接受。测试：每个生产代理是否都有具名负责人与当前评估？
9. **纠正措施。** Finding、根因、行动、负责人、期限、有效性检查、结案记录。测试：你能不能拿出一条修好之后又复发的失败，并说明后来怎么处理？

最小记录可以很小。重点是那些字段在审核提出要求之前就存在：

```json
{
  "trace_id": "tr_example",
  "thread_id": "th_example",
  "agent": "release-triage@2026.11.3",
  "spans": [
    {"span_id": "s1", "type": "model", "prompt_ref": "commit:9f3c2a"},
    {"span_id": "s2", "type": "tool", "tool": "github.open_pr", "approval": "ask", "decision": "approved", "approver": "u_example"}
  ],
  "outcome": {"type": "merged_pr", "ref": "PR-example", "source": "system"},
  "retention": {"policy": "evidence-7y", "legal_hold": false}
}
```

如果你只建两件事，先建 trace schema 与 outcome 链接。其他事情在它们存在之后都比较容易，因为后续每一件产物——评测示例、issue、PR、回归测试——都可以挂在同一组标识符上。

组织面的项目不是选配。Lake 不能指派责任、不能决定剩余风险、不能主持管理评审。那些是管理体系的职能，也正是 ISO/IEC 42001 认证的东西。

## 证据会在哪些地方失效

证据有失效模式。只列好处的文章是销售文件。严重的失效是结构性的。

**Trace 不是真相。** 一条 trace 是代理对自身行为的说法，经过 SDK 与 instrumentation 中介。Span 可能缺失、抽样可能掩盖有问题的那次执行、payload 可能被截断、脱敏可能删除真正重要的细节，而工具可能报告成功却做了别的事。Trace 证明系统记录了一个事件；它不证明事件真的照记录发生。

**PII 与保留。** 你需要的证据，和你根本不该留下的数据，往往是同一批字节。保留越久，审核价值与隐私风险一起上升。法定留存、删除请求、跨境传输、角色权限，全都适用于 lake。脱敏保护人，但也摧毁证据。政策必须逐字段选择要接受哪一种风险。

**评测器漂移。** LLM 裁判是一台测量仪器，会随着模型、提示词或校准改变。三月的分数与十一月的同一个分数，可能不是同一件事。把裁判版本化、用已知答案重新校准，并保留一份人工标注的样本当参考。否则改进循环是在对着一个会移动的「好」的定义做优化。

**过度自动化。** Engine 提交 PR 的速度，可能快过团队审查的速度。审批疲劳会把控制变成一个按钮。一个永远不会拒绝任何东西的审查队列，和没有审查没有两样。解法不是减少自动化，而是抽样、升级门槛，以及定期测试控制本身，包括刻意拒绝。

**审计轨迹完整性。** 谁能删除一条 trace？谁能改保留规则？谁能在发布前关闭评测器？如果答案是「管理员，而且无声无息」，证据层就有内部人风险。把管理平面与证据平面分开，让删除成为一条被记录的事件，并为审核导出签名副本。

**涵盖范围。** Lake 只持有被 instrument 的东西。平台外构建的代理、代理调用之间的人工作业、通过 MCP 访问的第三方代理，以及有人拿来记录真正决定的那张电子表格，全都在 schema 之外。审核范围是一条边界，而边界是管理决定，不是技术默认。

**成本。** 全保真 trace 的存储与查询成本都很高。抽样降低成本，也削弱证据。分层有帮助，但前提是保留策略在数据量涌入之前就设计好。最便宜的证据，是你决定留下来的证据。

**供应商锁定。** 一组认证证据的生命周期，可能比供应商合同更长。要求开放格式导出、schema 文件、兼容于 OpenTelemetry 的 trace，以及清楚的删除条款。证书不是数据可移植性的保证。

还有一个四个问题没问的第五题：这个代理该不该存在？四个问题检验代理是否被治理，不检验它是否正当、谁受益、谁承担风险、出错时会怎么样。那是影响评估，也是治理真正开始的地方。效率不是授权。

## 审核就是一项查询

如果 schema 对了，审核大部分只是一项查询。拿出接触过那个系统的代理的权限与审批记录。拿出数据集、评测器版本与发布实验。拿出客户投诉那一次执行的 trace。拿出后续的 issue、PR 与回归测试。审核员要的不是一个故事，而是那些数据行。

但查询只有在有人在审核之前设计好 schema 时才成立。这是 agent lake 的实践教训，而它比 LangChain 更大。把决策点 instrument 起来，不要只记输出。把 outcome 存在 trace 旁边，把变更存在 finding 旁边。让管理体系保持权威：lake 是传感器，不是宪法。政策、风险接受、角色、纠正措施都存在于它之外，再多的 trace 也替代不了。

LangChain 的认证是一个有用的存在性证明。它显示审核证据可以来自工程师本来就在用来调试的 trace，也显示一个小型治理团队可以把自己的一部分文件工作自动化，而不失去让自动化安全的人工审查。它没有显示一个 lake 就能让公司合规，也没有显示厂商的范围涵盖你的范围。

Lake 可以告诉你发生过什么。只有管理体系能告诉你，那件事是否被允许。
