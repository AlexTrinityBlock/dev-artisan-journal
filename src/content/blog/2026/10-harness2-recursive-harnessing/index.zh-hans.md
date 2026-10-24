---
title: "Harness²：当 Harness 学会改写 Harness"
description: "细读 Harness2（arXiv:2610.14224）：八个可编辑的 harness 组件、在没有标准答案验证器时仍能运转的对比式 Propose–Probe–Compose 循环，以及教会「改进者」本身的第二层递归。"
pubDate: 2026-10-24
category: "AI"
tags: ["Agent", "Harness", "RSI", "LLM", "论文笔记"]
featured: true
author: "Alex.Hsiao"
readTime: "16 min read"
---

<svg class="hx-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
<defs>
<symbol id="h2-prompt" viewBox="0 0 24 24"><path d="m7 11 2-2-2-2"/><path d="M11 13h4"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></symbol>
<symbol id="h2-guard" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></symbol>
<symbol id="h2-memory" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></symbol>
<symbol id="h2-tool" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></symbol>
<symbol id="h2-skills" viewBox="0 0 24 24"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol>
<symbol id="h2-script" viewBox="0 0 24 24"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></symbol>
<symbol id="h2-subagent" viewBox="0 0 24 24"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/></symbol>
<symbol id="h2-plugin" viewBox="0 0 24 24"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></symbol>
<symbol id="h2-plan" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></symbol>
<symbol id="h2-tooluse" viewBox="0 0 24 24"><path d="M12.586 12.586 19 19"/><path d="M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z"/></symbol>
<symbol id="h2-context" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></symbol>
<symbol id="h2-deleg" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></symbol>
<symbol id="h2-facts" viewBox="0 0 24 24"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></symbol>
<symbol id="h2-proc" viewBox="0 0 24 24"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></symbol>
<symbol id="h2-limits" viewBox="0 0 24 24"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></symbol>
<symbol id="h2-env" viewBox="0 0 24 24"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></symbol>
<symbol id="h2-up" viewBox="0 0 24 24"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></symbol>
<symbol id="h2-flat" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
<symbol id="h2-down" viewBox="0 0 24 24"><path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/></symbol>
<symbol id="h2-merge" viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></symbol>
<symbol id="h2-revise" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/><path d="m15 5 3 3"/></symbol>
<symbol id="h2-adopt" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></symbol>
<symbol id="h2-keep" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></symbol>
<symbol id="h2-reflect" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></symbol>
<symbol id="h2-task" viewBox="0 0 24 24"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol>
</defs>
</svg>

**LLM agent 不是一个模型。** 它是模型再加上外面那一整圈东西：开场给出的指令、不可越过的护栏、带进某个领域的记忆、可以加载的技能、工具该怎么用的指引、能执行的脚本、可以派活的 worker，以及在你眼皮底下、模型无法否决的 hook。那一圈就是 **harness**，而在真实部署里，它经常就是「demo」与「产品」之间的差别。

Harness2（[arXiv:2610.14224](https://arxiv.org/abs/2610.14224)，Google Cloud AI Research 与 Northwestern，2026 年 10 月 9 日）从一个说起来简单、答起来很难诚实的问题出发：

> Can recursive self-improvement improve both the current harness and how future harnesses are improved?
>
> — *Harness2*, §1

多数自我改进的 agent 研究只回答了前半段：针对眼前这个任务改写 harness。Harness2 在上面再跑一层循环——改写「改写这件事本身是怎么发生的」——而且是在开放世界里做：任务来的时候没有标签、没有单元测试、也没有验证器告诉你交付物到底好不好。

<div class="hx-kpis">
  <div class="hx-kpi"><b>+11.5</b><i>WorkBuddy-Bench · GLM-5 · OpenCode</i><span>一次改进步骤，平均从 64.2 升到 75.7。</span></div>
  <div class="hx-kpi"><b>+4.5</b><i>JobBench · Gemini 3.5 Flash · OpenCode</i><span>同样一步，换一个专业领域。</span></div>
  <div class="hx-kpi"><b>+11.8</b><i>LAB Partial · GLM-5 · OpenCode</i><span>法律工作，逐项标准计分。</span></div>
</div>

实验设定刻意吝啬。模型权重冻结；harness 通过现成的 runner（OpenCode 与 Codex）在 Gemini 3.5 Flash 与 GLM-5 上执行，四种组合套用同一个改进步骤。三个 benchmark 代表专业工作：WorkBuddy-Bench（Code、Web、Office）、JobBench（长流程的端到端工作任务），以及 Harvey 的 Legal Agent Benchmark，以 *Partial*（逐项标准通过率）呈现。

## 工作单位是八个文件

harness 写成 $\mathcal{H} = (c^{1}, \ldots, c^{K})$，是 $K$ 个可编辑组件的 tuple，与冻结的模型 $\mathcal{M}$ 组合成 agent $\mathcal{A}(\cdot; \mathcal{M}, \mathcal{H})$。Harness2 沿用前作的文件级拆解，并多加一个组件，于是 $K = 8$，而且**每个组件都是一个文件**。这个决定撑起了整篇论文：组件是文件，编辑就是 diff；而 diff 是可以被提案、被探测、被审阅、被存放的东西。

<div class="hx-grid">
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-prompt"></use></svg></span></span>
      <span class="hx-cnum">C1</span>
    </div>
    <div class="hx-name">系统提示（System prompt）</div>
    <div class="hx-def">人格设定与最高层流程，所有任务都遵循。</div>
    <div class="hx-file">systemprompt.md</div>
    <div class="hx-when">Context · 每次调用</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-guard"></use></svg></span></span>
      <span class="hx-cnum">C2</span>
    </div>
    <div class="hx-name">护栏（Guardrails）</div>
    <div class="hx-def">不论任务或工具，一律成立的硬性限制。</div>
    <div class="hx-file">guardrails.md</div>
    <div class="hx-when">Context · 每次调用</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-memory"></use></svg></span></span>
      <span class="hx-cnum">C3</span>
    </div>
    <div class="hx-name">记忆（Memory）</div>
    <div class="hx-def">在同一领域中跨任务留存的持久事实。</div>
    <div class="hx-file">LongTermMEMORY.md</div>
    <div class="hx-when">Context · 每次调用</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-tool"></use></svg></span></span>
      <span class="hx-cnum">C4</span>
    </div>
    <div class="hx-name">工具指引（Tool guidance）</div>
    <div class="hx-def">每个既有工具该在何时、如何被使用。</div>
    <div class="hx-file">tool_descriptions/tool_guidance.md</div>
    <div class="hx-when">Tool · 每次调用</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-subagent"></use></svg></span></span>
      <span class="hx-cnum">C5</span>
    </div>
    <div class="hx-name">子代理（Subagents）</div>
    <div class="hx-def">在独立 context window 里工作、只返回结果的受派 worker。</div>
    <div class="hx-file">sub_agents/&lt;n&gt;/AGENT.md</div>
    <div class="hx-when">Orchestration · task tool</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-skills"></use></svg></span></span>
      <span class="hx-cnum">C6</span>
    </div>
    <div class="hx-name">技能（Skills）</div>
    <div class="hx-def">只在被调用时加载的专家流程，用不到时完全不占成本。</div>
    <div class="hx-file">skills/&lt;n&gt;/SKILL.md</div>
    <div class="hx-when">Context · 调用时</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-script"></use></svg></span></span>
      <span class="hx-cnum">C7</span>
    </div>
    <div class="hx-name">脚本（Scripts）</div>
    <div class="hx-def">新增的确定性能力：直接执行，而不是逐 token 推理出来。</div>
    <div class="hx-file">scripts/&lt;name&gt;.py</div>
    <div class="hx-when">Tool · 经由 bash</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-plugin"></use></svg></span></span>
      <span class="hx-cnum">C8</span>
    </div>
    <div class="hx-name">中间件插件（Plugin）</div>
    <div class="hx-def">挂在工具调用与回合边界上的 hook：它是「强制」某种行为，而不是「指示」。</div>
    <div class="hx-file">plugin/&lt;name&gt;.ts</div>
    <div class="hx-when">Middleware · 工具循环内</div>
  </div>
</div>

这八个里有三个的行为方式足以解释后面的大多数结果。**C5 是唯一会增加一条推理 context 的组件**——它是唯一「乘上成本」而非「塑形」的编辑。**C6 在被调用之前不花任何成本**，所以它是放长篇专家流程最便宜的位置。**C8 是唯一模型无法忽略的组件**，因为插件跑在工具循环里，而不是写在提示里。等消融实验出现时，你会看到真正贡献「能力」的两个组件（技能、脚本）比贡献「指示」的那一组更值钱——看过启动时机那一栏之后，这个结果就没那么意外了。

<figure class="fig">
  <img src="/images/harness2/fig02-harness-components.png" alt="八个 harness 组件按运行期角色分组、围绕冻结模型的示意图" loading="lazy" />
  <figcaption><b>图 2</b> — 八个组件按「它们改动运行期的哪一部分」分组。上方那张 icon 图是这张原始图版在本站单色语汇下的重绘；原图值得看一次，特别是插件如何夹在模型与工具接口之间。来源：<a href="https://arxiv.org/html/2610.14224v1/components.png">arxiv.org/html/2610.14224v1/components.png</a></figcaption>
</figure>

## 两层循环，同一套系统

论文把两件常被混为一谈的东西分开。

- **执行用 harness** $\mathcal{H}$ 是真正跑任务的那一层。它在任务中被编辑，任务结束后就作为「某个特定产物」被放下。
- **改进用 harness** $\mathcal{R}_{t}$ 是负责编辑 harness 的那一层。它包含改进流程与一座 *harness 改进函数库*，并且在一个任务的时间内冻结不动。

任务级递归改动 $\mathcal{H}$；harness 级递归改动 $\mathcal{R}_{t}$，用的就是第一层学到的东西。两者都不碰权重。论文那句定义值得逐字引用：执行用 harness 是「被改进的系统」，改进用 harness 是「改进它的机制」。

<div class="hx-loop">
  <div class="hx-loop-head">
    <span class="hx-lvl">层级 02 // 持续改进 harness ℛt</span>
    <span class="hx-lvl-note">任务进行中冻结 · 任务结束后更新</span>
  </div>
  <div class="hx-loop-inner">
    <div class="hx-loop-head">
      <span class="hx-lvl">层级 01 // 执行用 harness ℋ</span>
      <span class="hx-lvl-note">一次任务 · 回到 ℋ0</span>
    </div>
    <div class="hx-row">
      <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-plan"></use></svg><div><b>Propose 提案</b><span>两个候选编辑：不变型与领域特定。</span></div></div>
      <div class="hx-arrow">→</div>
      <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-up"></use></svg><div><b>Probe 探测</b><span>两个候选在同一个任务、相同条件下各跑一次。</span></div></div>
      <div class="hx-arrow">→</div>
      <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-merge"></use></svg><div><b>Compose 组合</b><span>合并、修订、采用或保留——然后执行 ℋ′。</span></div></div>
    </div>
  </div>
  <div class="hx-row">
    <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-reflect"></use></svg><div><b>回顾 𝓓t</b><span>哪些编辑解决了哪个缺陷、在什么条件下。</span></div></div>
    <div class="hx-arrow">→</div>
    <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-facts"></use></svg><div><b>更新函数库</b><span>ℛt+1 = Update(ℛt, ℋ⋆t, 𝓓t)：采用的 harness 加 EXPERIENCE.md。</span></div></div>
    <div class="hx-arrow">→</div>
    <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-task"></use></svg><div><b>引导下一个任务</b><span>复用是选择性的：组件成为提案素材，不会自动继承。</span></div></div>
    <div class="hx-arrow">↺</div>
  </div>
</div>

为什么非要两层？因为显而易见的单层设计会同时在两个方向失败。为昨天那个任务调好的 harness，在今天的任务上常常比起始 harness 更差；而把一个高度特化的 harness 一路带下去，随着任务分布漂移，改进会变得充满噪声。真正能可靠带走的，是改进过程本身的记录：缺陷怎么被诊断、试了哪个改动、执行结果又揭露了什么。

<figure class="fig">
  <img src="/images/harness2/fig03-pipeline.png" alt="pipeline 示意图：左侧为任务级递归，右侧为 harnessing 级递归" loading="lazy" />
  <figcaption><b>图 3</b> — 整条 pipeline。内框是在任务 t 上被精修的执行用 harness；外圈是改进用 harness，它吸收整份精修记录，再交给下一个任务。来源：<a href="https://arxiv.org/html/2610.14224v1/harness2_main_new.png">arxiv.org/html/2610.14224v1/harness2_main_new.png</a></figcaption>
</figure>

## 任务级递归：Propose、Probe、Compose

对比式改进步骤是一个操作，套用在当前 harness、任务、以及所有任务内历史上：

$$\left(\mathcal{H}^{\prime}, e^{\prime}, \xi\right) = \Phi\left(q_{t}, \mathcal{H}, \mathcal{E}; \mathcal{R}_{t}\right)$$

它返回三样东西：后继 harness $\mathcal{H}^{\prime}$、**它的执行记录** $e^{\prime}$，以及一份步骤记录 $\xi$，里头有参考执行、候选 harness 与探测、组合决策，以及后继执行结果。第三个返回值比它看起来重要得多——论文不只是在优化一个 harness，它同时在替第二层生成一份可审计的轨迹。

### Propose：一个候选管「模式」，一个候选管「现场」

一切从参考执行 $e^{0} \sim \mathcal{A}(q_{t}; \mathcal{M}, \mathcal{H})$ 开始。论文对这个参考说得很小心：它揭露的是 **harness 的行为长什么样，而不是它的交付物对不对**。以此为基准，pipeline 只起草两个候选，而这个切分是整篇论文最有主见的设计选择。

<div class="hx-split">
  <div class="hx-panel">
    <span class="hx-panel-tag">候选 A // 作用范围：任何地方</span>
    <h5>不变型（Invariant）</h5>
    <p>针对可能跨领域重复出现的 agent 缺陷。修一次，下个月换一个 benchmark、换一份工作，它应该还是对的。</p>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-plan"></use></svg><div><b>规划</b><span>先拆解再动手；让计划跨回合存活。</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-tooluse"></use></svg><div><b>工具使用</b><span>选对工具，以及工具失败后怎么补救。</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-context"></use></svg><div><b>context 管理</b><span>什么留在视野里、什么写下来、什么被丢掉。</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-deleg"></use></svg><div><b>派活</b><span>什么时候一个子任务值得拥有自己的 context window。</span></div></div>
  </div>
  <div class="hx-panel alt">
    <span class="hx-panel-tag">候选 B // 作用范围：这个环境</span>
    <h5>领域特定（Domain-specific）</h5>
    <p>针对当前领域的知识、流程与限制。在这里很值钱，但工作一换就预期会过期。</p>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-facts"></use></svg><div><b>领域事实</b><span>数字、文件名、定义——对着这个任务的证据核对过。</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-proc"></use></svg><div><b>流程</b><span>这类工作实际上遵循的操作顺序。</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-limits"></use></svg><div><b>限制</b><span>这个领域禁止什么、不接受哪些格式。</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-env"></use></svg><div><b>环境</b><span>这里实际装了什么、挂载了什么、能连到什么。</span></div></div>
  </div>
</div>

两个候选都是**可执行的 harness**，由改动当前 harness 的文件产生——不是「改动的描述」。提案可以复用或改写函数库里的组件，但任务特定的事实必须对着当前任务的证据核对；用论文的话说：复用修正的形状，但要重新推导数字。

这个切分是一种对冲。只修模式，会过拟合到一个可能根本不是失分点的通用弱点；只修现场，则是把 benchmark 背下来。各起草一个，等于把提案预算花在两种真正互相竞争的失败模式上。

### Probe：唯一的信号是行为对比

每个候选都在同一个任务、相同的模型与环境设定下执行一次。把它的轨迹与交付物和参考执行相比，得到一个**行为对比**：关于「这个编辑是否处理了它宣称要处理的缺陷」的证据。

<div class="hx-tri">
  <div class="hx-tri-item"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-up"></use></svg><b>改善了</b><span>被针对的行为朝预期方向改变。</span></div>
  <div class="hx-tri-item"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-flat"></use></svg><b>没动</b><span>编辑确实落地了，但行为没有移动。</span></div>
  <div class="hx-tri-item"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-down"></use></svg><b>退步了</b><span>在修好之前，别的地方先坏了。</span></div>
</div>

论文对这个信号的极限说得异常坦白：执行的随机性与模型共享的偏差，意味着对比能**提供组合的依据，却不能验证任务是否正确**。这就是整个设计的核心交换。有验证器会更强；开放世界里没有，于是 pipeline 接受方向性的证据，把不确定性推到下一阶段，而不是藏在一个分数后面。

### Compose：有证据的就合并，没有的就保留

组合会读参考执行、两个候选 harness、它们对当前 harness 的 diff，以及所有任务内的执行证据，然后做四种动作之一。

<div class="hx-ladder">
  <div class="hx-ladder-row"><b>合并</b><span>当多个改动各自有对比支持、且不碰同一种行为时，把它们叠起来。</span></div>
  <div class="hx-ladder-row"><b>修订</b><span>把彼此冲突、或超出证据范围的编辑改写掉。</span></div>
  <div class="hx-ladder-row"><b>择一</b><span>只有一个候选真的推动了什么时，就采用那一个。</span></div>
  <div class="hx-ladder-row"><b>保留</b><span>维持当前 harness 不变。组合被允许得出「什么都没帮上忙」的结论。</span></div>
</div>

这里的纪律只有一句话：每个决策都要绑在一个具体观察上，而不是假设的分数涨幅。而且 $\mathcal{H}^{\prime}$ 在步骤返回之前**会被执行**。组合不是选出赢家就停手；它交回一个已经跑过的 harness，附上支持它的证据。这正是下一个提案之所以诚实的原因。

## 并行与串行

一次对比步骤只是一个样本。论文用预算 $k$ 往两个方向放大：每个范围 $k$ 个候选、$k$ 个并行组合，或者 $k$ 个串接的步骤。

<figure class="fig">
  <img src="/images/harness2/fig04-scaling.png" alt="两张图对比并行递归（候选各自独立提案）与串行递归（每一步喂给下一步）" loading="lazy" />
  <figcaption><b>图 4</b> — 任务级递归的两种形式。(a) 并行：$k$ 个参考、$k$ 个不变型候选与 $k$ 个领域候选，再由 $k$ 个各自独立、但都看到整个候选池的组合 session 产出后继 harness。(b) 串行：每个被精修的 harness 及其累积的执行历史，成为下一步的输入。来源：<a href="https://arxiv.org/html/2610.14224v1/scaling.png">arxiv.org/html/2610.14224v1/scaling.png</a></figcaption>
</figure>

**并行递归**先收集 $k$ 次参考执行，提案 $k$ 个不变型与 $k$ 个领域特定候选，全部探测，再跑 $k$ 个各自拿到完整候选池的组合 session：

$$\mathcal{H}^{\prime}_{j} = \mathrm{Compose}_{j}\left(q_{t}, \mathcal{H}, \mathcal{B}, \mathcal{P}; \mathcal{R}_{t}\right), \qquad j = 1, \ldots, k$$

这是「一次种群更新」——$k$ 控制的是搜索的*宽度*，不是深度。论文类比的是对独立样本做聚合，差别在于样本是可执行的 harness 及其行为后果，而不是推理痕迹。

**串行递归**从 $\mathcal{H}^{(0)} = \mathcal{H}_{0}$ 出发，串接 $k$ 个对比步骤，每一个都以先前的 harness 与累积历史 $\mathcal{E}^{(r-1)}$ 为条件：

$$\left(\mathcal{H}^{(r)}, e^{(r)}, \xi^{(r)}\right) = \Phi\left(q_{t}, \mathcal{H}^{(r-1)}, \mathcal{E}^{(r-1)}; \mathcal{R}_{t}\right), \qquad r = 1, \ldots, k$$

于是后面的步骤可以保留、修订，或**修正**前面的改动，因为它同时看到当前与先前的证据。当 $k > 1$，会有一个 agentic selector 把匿名化的交付物与任务需求、来源材料比对；它看不到哪个输出出自哪个 harness，也不能合成新内容，只能返回既有的交付物。被采用的 harness 记为 $\mathcal{H}^{\star}_{t}$——星号代表「被采用」，不代表「已验证最佳」。$k = 1$ 时两种形式都退化成基本步骤，并跳过选择。

真正的差别不是「想得更多」。并行买到的是**去相关的证据**：不同的提案面对同一个任务，各自独立组合。串行买到的是**修正**：后面的步骤可以撤销一个当时看起来很好、其实不好的编辑。两者都不会生出正确性信号——这也解释了结果为什么长这样。

在 WB-code 上，并行递归把分数从 $k = 1$ 的 76.5 拉到 $k = 5$ 的 80.8；WB-office 从 79.5 到 83.4，两者都单调上升。baseline 不是这样：Harness Scaling 在两个领域都从 $k = 2$ 退步到 $k = 3$，ReasoningBank 则是上下震荡。论文自己下的结论是这一节最锐利的一句——*单纯增加 test-time 探索，并不保证更好的表现*——而支撑它的事实比保留语气更强：Harness2 的两种形式在 $k = 2$ 时，就已经赢过图上所有 baseline 在 $k = 5$ 的成绩，两个领域都成立。

## Harnessing 级递归：教会「改进者」

交付物返回之后，pipeline 会回顾完整的改进记录 $\mathcal{D}_{t}$：参考执行、候选与探测、组合决策、被选中的结果。这个回顾不是自由发挥。它萃取出「哪些改动解决了哪些缺陷、在什么条件下、带来什么后果」的教训，而且只在有执行对比支持时才留下一条教训。选出一个输出，本身不构成「背后那个洞见可以迁移」的论据。

这些教训加上被采用的 harness，一起进到函数库：

$$\mathcal{R}_{t+1} = \mathrm{Update}\left(\mathcal{R}_{t}, \mathcal{H}^{\star}_{t}, \mathcal{D}_{t}\right)$$

每一条条目都是一个可执行的 harness 配上一份 `EXPERIENCE.md`，记载适用情境、教训与支持证据；另有一份索引，让后续 session 按需调阅相关条目。下一个任务仍然从共用的 $\mathcal{H}_{0}$ 开始——先前的组件是通过 Propose 选择性复用或改写，不会默认继承。模型权重、阶段指令与决策规则固定不变，演化的只有函数库。

这一层的证据，是我认为整篇论文最有说服力的部分，因为它包含了反例。**直接**精修基础 harness——没有参考执行、没有探测、没有函数库——并不会让它变好：Code 从 73.4 掉到 63.2，Web 从 69.9 掉到 65.0。而以 $k = 1$ 累积的函数库能把表现拉回基准；以 $k = 5$ 累积的函数库，则让同一个直接精修变成 Code、Web、Office 上 +0.9、+4.4、+5.1 的进步。更多的任务级探索，喂出一个更好的改进者，而且在下一轮完全不需要额外的探测。

函数库也会旅行。一份从 JobBench 长出来的函数库，让 WorkBuddy-Bench 的一次性精修在三个领域分别进步 0.6、0.5、2.9 分。把每个任务自己的条目从函数库移除后重跑（leave-one-out），WorkBuddy-Bench 从 77.5 升到 79.4、JobBench 从 36.0 升到 37.7——这是离线的复用测量，看得到后面的任务，不是线上增益的估计。

值得把「到底存了什么」讲精确。把被改动的文件与精修当下可用的函数库快照相比，函数库的来源痕迹出现在 LAB 与 WB-office 的 22%、JobBench 的 47% 的改动文件中；但只有 2–10% 的文件保留了至少一半的行数。技能与脚本合计约占所有编辑的一半。换句话说，这座函数库更接近**一份带经验注释的 diff 先验**，而不是 checkpoint：它告诉改进者「这类弱点的修法通常长什么样、通常在什么时候有效」，然后让改进者针对手上的任务重写一次。

## 结果：一步就已经很多

单一改进步骤（$k = 1$）让十二组 benchmark–配置配对全部进步。下表是基准 harness 与 Harness2 走完一步之后的数字。

| 执行模型 · 起始 harness | WorkBuddy-Bench 平均 | JobBench | LAB（Partial） |
| :-- | --: | --: | --: |
| Gemini 3.5 Flash · OpenCode | 72.4 → **77.5**（+5.1） | 31.5 → **36.0**（+4.5） | 79.9 → **81.9**（+2.0） |
| Gemini 3.5 Flash · Codex | 74.5 → **77.5**（+3.0） | 33.9 → **35.3**（+1.4） | 71.6 → **75.6**（+4.0） |
| GLM-5 · OpenCode | 64.2 → **75.7**（+11.5） | 20.6 → **24.2**（+3.6） | 59.6 → **71.4**（+11.8） |
| GLM-5 · Codex | 64.4 → **75.3**（+10.9） | 23.6 → **24.8**（+1.2） | 58.1 → **65.9**（+7.8） |

两个模式比平均值更值得看。

第一，**较弱的执行模型在 WorkBuddy-Bench 与 LAB 上受益更多**。一步之后，GLM-5 来到 75.7 与 75.3——高于较强的 Gemini 3.5 Flash 在基准 harness 下的 72.4 与 74.5。换句话说，弱模型配上更好的 harness，可以赢过强模型配原厂 harness。JobBench 的排序反了过来：Gemini 进步 4.5，GLM-5 只有 3.6。这提醒我们「harness 决定一切」不是通则，而是看领域。

第二，**递归是把增益往外延伸，而不是补救**。$k = 5$ 的并行递归在 WorkBuddy-Bench 再多加 2.9–3.9 分、JobBench 3.0–4.2 分、LAB Partial 2.6–6.7 个百分点。它也缩小了一些起始 harness 之间的落差——JobBench 的 OpenCode–Codex 差距，Gemini 从 2.4 缩到 0.5、GLM-5 从 3.0 缩到 0.5——但不一致：在 WorkBuddy-Bench 上，GLM-5 的差距反而从 0.2 扩大到 1.3。

<figure class="fig">
  <img src="/images/harness2/fig01-overall-performance.png" alt="WorkBuddy-Bench 各领域分数的柱状图，以及分数对递归预算的折线图" loading="lazy" />
  <figcaption><b>图 1</b> — 左：Gemini 3.5 Flash 在 OpenCode 下、以 $k = 5$ 并行递归的 WorkBuddy-Bench 各领域成绩；每根柱子上方的数字是相对基准 harness 的增益，基准本身以灰色柱子呈现。右：WB-code 上分数对递归预算 $k$ 的关系——Harness2 单调上升，两条 baseline 则停滞或摇摆。来源：<a href="https://arxiv.org/html/2610.14224v1/intro_teaser.png">arxiv.org/html/2610.14224v1/intro_teaser.png</a></figcaption>
</figure>

算力账也老实。把交出最终交付物之前的所有 token 都算进去——执行*加上*改进——Harness2 的两种设定都落在 JobBench 与 WorkBuddy-Bench 图上的实证帕累托前沿。以 Gemini 3.5 Flash 搭 OpenCode 来说，$k$ 从 1 到 5，相对基准的增益从 JobBench 的 4.5 升到 7.5 分、WorkBuddy-Bench 的 5.1 升到 8.4 分；而 Meta-Harness 在 $k = 5$ 时用了比 Harness2 更多的算力，换到更低的分数。这不是免费午餐，是更好的汇率。

另外两个结果把「增益来自 harness，而不是模型藏了什么能力」这件事收得更紧。**同一个模型同时当执行者与编辑者**时，从 GLM-5 到 Claude Opus 5 五个模型在每个 benchmark 上都进步——Opus 5 分别 +3.3、+5.5、+3.0，GLM-5 单在 LAB 就 +13.7——所以精修并不需要更强的编辑者。而一个为 Gemini 3.5 Flash 精修出来的 harness，**原封不动**转到别的执行模型也有效：GLM-5 在 Code 上 +17.3（58.5 → 75.8）、Gemini 3.7 Flash +0.3 与 +6.4、Opus 4.8 +2.6 与 +1.1。幅度因执行模型与领域而异，但不会消失。

对上正式产品级的 harness，比较更朴素也更有说服力：在 WorkBuddy-Bench 上，没有任何一个固定 harness 能在每个领域都赢——Claude Code 在 Code 与 Office 领先，Codex 在 Web 领先——而从 OpenCode 出发的 Harness2，赢过最强的固定对手 4.6、5.8、4.9 分，赢过自己的起点 7.4、8.4、9.4 分。

## 消融实验：增益到底挂在哪些零件上

消融在 $k = 1$、Gemini 3.5 Flash 搭 OpenCode 下执行，让每个组件与 test-time 预算隔离开。第一组拆的是整个机制：函数库、带范围设定的编辑角色、以及组合。

| 设定 | WorkBuddy-Bench | JobBench |
| :-- | --: | --: |
| Harness2 | 77.5 | 36.0 |
| 移除函数库 | 74.4（−3.1） | 34.2（−1.8） |
| 移除范围设定 | 74.6（−2.9） | 32.3（−3.7） |
| 移除组合 | 75.9（−1.6） | 34.1（−1.9） |

拿掉**范围设定**——把不变型与领域型编辑者换成两个通用编辑者，候选数量与证据都一样——会掉 2.9 与 3.7 分。这比拿掉组合（1.6 与 1.9）还多，让我有点意外：把提案拆成两个范围，比后面那个合并步骤更值钱。函数库值 3.1 与 1.8 分，这和前面「直接精修会退步」的实验一致：没有过去精修的记忆，改进者会不停重新发现、有时重新弄坏同一件事。

第二组消融是从「已经改好的」harness 里删掉整个组件群，不再重跑改进。这量的是留存组件的价值，而不是 pipeline 补偿缺席组件的能力。

<div class="tufte-live-card hx-chart">
  <div class="chart-header">
    <span class="card-tag">EXHIBIT // 消融阶梯</span>
    <h4 class="chart-title">技能是最贵的删除项</h4>
    <p class="chart-sub">WorkBuddy-Bench 平均 · Gemini 3.5 Flash 搭 OpenCode · 并行递归 k = 5 · 虚线是基准 harness，不是零</p>
  </div>
  <svg class="hx-svg" viewBox="0 0 820 330" role="img" aria-labelledby="abl-title abl-desc">
    <title id="abl-title">WorkBuddy-Bench 上的消融阶梯</title>
    <desc id="abl-desc">点图。基准 harness 72.4、移除技能 75.5、移除脚本 77.1、移除提示相关组件 79.3、完整 Harness2 80.8。每一个消融后的 harness 都仍在基准之上。</desc>
    <g stroke="#DEDDD6" stroke-width="0.7">
      <line x1="150" y1="40" x2="150" y2="296"></line>
      <line x1="255" y1="40" x2="255" y2="296"></line>
      <line x1="360" y1="40" x2="360" y2="296"></line>
      <line x1="465" y1="40" x2="465" y2="296"></line>
      <line x1="570" y1="40" x2="570" y2="296"></line>
      <line x1="675" y1="40" x2="675" y2="296"></line>
      <line x1="780" y1="40" x2="780" y2="296"></line>
    </g>
    <line x1="276" y1="40" x2="276" y2="296" stroke="#B0AFA9" stroke-width="0.7" stroke-dasharray="3 3"></line>
    <text x="150" y="32" font-family="'JetBrains Mono',monospace" font-size="6.5" letter-spacing="0.08em" fill="#8F8E88">分数 · WB 平均（%）</text>
    <text x="276" y="32" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="6.5" letter-spacing="0.08em" fill="#8F8E88">基准 72.4</text>
    <text x="800" y="32" text-anchor="end" font-family="'JetBrains Mono',monospace" font-size="6.5" letter-spacing="0.08em" fill="#8F8E88">相对完整</text>
    <g stroke="#E4E3DC" stroke-width="0.5">
      <line x1="40" y1="96" x2="790" y2="96"></line>
      <line x1="40" y1="152" x2="790" y2="152"></line>
      <line x1="40" y1="208" x2="790" y2="208"></line>
      <line x1="40" y1="264" x2="790" y2="264"></line>
    </g>
    <g font-family="Inter,sans-serif" font-size="9.5" font-weight="600" fill="#4A4944" text-anchor="end">
      <text x="140" y="64">基准 HARNESS</text>
      <text x="140" y="120">移除技能</text>
      <text x="140" y="176">移除脚本</text>
      <text x="140" y="232">移除提示组</text>
      <text x="140" y="288">HARNESS² · 完整</text>
    </g>
    <g font-family="'JetBrains Mono',monospace" font-size="6.5" fill="#8F8E88" text-anchor="end">
      <text x="140" y="76">未改动的 H0</text>
      <text x="140" y="132">skills/&lt;n&gt;/SKILL.md</text>
      <text x="140" y="188">scripts/&lt;n&gt;.py</text>
      <text x="140" y="244">prompt 相关组</text>
      <text x="140" y="300">全部组件</text>
    </g>
    <g stroke="#B0AFA9" stroke-width="1.1">
      <line x1="276" y1="122" x2="438.8" y2="122"></line>
      <line x1="276" y1="178" x2="522.8" y2="178"></line>
      <line x1="276" y1="234" x2="638.3" y2="234"></line>
    </g>
    <line x1="276" y1="290" x2="717" y2="290" stroke="#1C1C1A" stroke-width="1.1"></line>
    <circle cx="276" cy="66" r="4" fill="#F0EFEB" stroke="#8F8E88" stroke-width="1.1"></circle>
    <circle cx="438.8" cy="122" r="2.7" fill="#4A4944"></circle>
    <circle cx="522.8" cy="178" r="2.7" fill="#4A4944"></circle>
    <circle cx="638.3" cy="234" r="2.7" fill="#4A4944"></circle>
    <circle cx="717" cy="290" r="8.2" fill="none" stroke="#1C1C1A" stroke-width="0.7"></circle>
    <circle cx="717" cy="290" r="4.6" fill="#1C1C1A"></circle>
    <g font-family="Inter,sans-serif" font-size="9.5" font-weight="800" fill="#1C1C1A">
      <text x="288" y="69.4">72.4</text>
      <text x="449.8" y="125.4">75.5</text>
      <text x="533.8" y="181.4">77.1</text>
      <text x="649.3" y="237.4">79.3</text>
      <text x="728" y="293.4">80.8</text>
    </g>
    <g font-family="'JetBrains Mono',monospace" font-size="9" fill="#6A6963" text-anchor="end">
      <text x="800" y="69">−8.4</text>
      <text x="800" y="125">−5.3</text>
      <text x="800" y="181">−3.7</text>
      <text x="800" y="237">−1.5</text>
      <text x="800" y="293">—</text>
    </g>
    <g font-family="'JetBrains Mono',monospace" font-size="7" fill="#8F8E88" text-anchor="middle">
      <text x="150" y="314">70</text>
      <text x="255" y="314">72</text>
      <text x="360" y="314">74</text>
      <text x="465" y="314">76</text>
      <text x="570" y="314">78</text>
      <text x="675" y="314">80</text>
      <text x="780" y="314">82</text>
    </g>
  </svg>
  <div class="chart-footer">消融阶梯 · HARNESS2 表 6 · GEMINI 3.5 FLASH / OPENCODE · K=5 · 三次执行平均</div>
</div>

阶梯的形状是这篇论文最实用的发现。完整 Harness2 平均 80.8。拿掉提示相关组，还剩 79.3——掉 1.5。拿掉脚本，剩 77.1，掉 3.7，而且集中在 Office（−7.4），那里多数工作就是确定性地处理数字与文件。拿掉技能，剩 75.5，掉 5.3，集中在 Code（−3.6）与 Web（−6.9）。真正贡献「能力」的两个组件——会计算的脚本、懂流程的技能——比贡献「指示」的那一组更重。

表格还附带两个诚实的保留。每个被消融的 harness 都仍在基准 72.4 之上，所以这里没有单一致命点；而论文也明确拒绝宣称「可加性」。组件之间会互相支撑——技能可以调用脚本、插件可以强制提示只能请求的事——这正是系统该有的样子。

## 九次退步：还会坏在哪里

失败分析规模很小——九个得分低于参考的结果——但比胜利更有用，因为它点名了循环会伤人的三种方式。

1. **选择器可能偏好较弱的候选。** 在 WB-code 上，一个 55 分的输出被选中，而另一个是 95 分。在 LAB 上，覆盖面变宽但变浅，让某个案例从 54 掉到 26。选择器只判断匿名化的交付物，不知道它出自哪个 harness；这对公平是对的，对「在两个相似输出中挑好的那一个」却是错的。
2. **错误的前提会沿着候选扩散。** 一个字面 key 的要求，或一个没验证的缓存假设，代价是 2–11 分。两个提案都从同一种任务理解继承了它，而探测无法分辨「编辑错了」与「环境不同意」。
3. **结果波动与没被处理的标准**吃掉剩下的部分。缺漏的评审判定、以及根本没碰到评分标准的编辑，让归因变得困难——这也是论文要求在相信某个效果之前先重复执行的原因。

合起来看，这指出了下一步该改哪里：选择要能平衡覆盖率与精确度、探测要设计成挑战共同假设而不是确认它、而重复执行应该被当成证据的一等公民。

## 带走什么

三个东西经得起怀疑的阅读。

**把 harness 做成文件树。** 这套递归之所以可行，是因为每个改动都是对一个具名文件的 diff。它让提案有边界、让组合有具体的东西可并、让函数库有可执行（而非描述性）的条目格式。如果你的 harness 是一个上千行的 prompt builder，这篇论文还不适用于你。

**对比是弱信号，但仍然值得拥有。** 这条 pipeline 从不宣称知道答案是对的；它只知道行为相对参考执行移动了、或没移动。在没有验证器的情况下，这样就足以在编辑之间做选择——而这正是多数「自我改进 agent」系统默默假设自己已经握有的东西的诚实版本。

**资产是改进记录，不是 harness。** 论文最强的证据是：没有函数库的直接精修会让表现*退步*（Code 从 73.4 到 63.2），而同一个改进者在 $k = 5$ 累积的函数库帮助下，却能让它进步。留下一个 harness，价值低于留下一座可居住的记忆：它曾被怎么改、以及为什么。

限制是真的。test-time 算力大约以 $k$ 倍膨胀；选择是软肋；前提错误会被所有候选共享；而这些 benchmark 虽然专业，也只是开放世界里的三个领域。论文自己把这些写了出来，这也是我愿意相信那些数字的理由之一。

尽管如此，框架已经移动了。长久以来，harness 是部署前要调的东西，模型才是会变强的东西。Harness2 把 harness 当成要教的对象——而会复利的，是那份教导，不是那个成品。

## 参考资料

- **论文** — Xu, Chen, CuiZhu, Dalvi Mishra, Ming, Yu, Han, Lee, Pfister. *Harness2: Recursive Agent Harnessing for an Open World.* arXiv:2610.14224v1, 2026 年 10 月 9 日。[arxiv.org/abs/2610.14224](https://arxiv.org/abs/2610.14224) · [HTML 版](https://arxiv.org/html/2610.14224v1)
- **代码与项目页** — [github.com/google-research/harness2](https://github.com/google-research/harness2) · [harness2.github.io](https://harness2.github.io/)
- **图片** — 四张图版皆取自 HTML 版，保留原色并重新压缩；文件位于 `/images/harness2/`。原始网址：[components.png](https://arxiv.org/html/2610.14224v1/components.png)、[intro_teaser.png](https://arxiv.org/html/2610.14224v1/intro_teaser.png)、[harness2_main_new.png](https://arxiv.org/html/2610.14224v1/harness2_main_new.png)、[scaling.png](https://arxiv.org/html/2610.14224v1/scaling.png)。
