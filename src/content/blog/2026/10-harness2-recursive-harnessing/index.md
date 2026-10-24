---
title: "Harness²: When the Harness Learns How to Rewrite Harnesses"
description: "A close reading of Harness2 (arXiv:2610.14224): eight editable harness components, a contrastive Propose–Probe–Compose loop that works without ground-truth verifiers, and a second recursion that teaches the improver itself."
pubDate: 2026-10-24
category: "AI"
tags: ["Agent", "Harness", "RSI", "LLM", "PaperNotes"]
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

**An LLM agent is not a model.** It is a model plus everything wrapped around it: the instructions it starts with, the constraints it cannot cross, the memory it carries into a domain, the skills it may load, the guidance on how to use its tools, the scripts it can execute, the workers it can delegate to, and the hooks that run underneath its judgement. That wrapper is the **harness**, and in production it is frequently the difference between a demo and a product.

Harness2 ([arXiv:2610.14224](https://arxiv.org/abs/2610.14224), Google Cloud AI Research and Northwestern, 9 October 2026) begins from a question that is easy to state and hard to answer honestly:

> Can recursive self-improvement improve both the current harness and how future harnesses are improved?
>
> — *Harness2*, §1

Most self-improving agent work answers only the first half: rewrite the harness for the task in front of you. Harness2 runs a second loop on top — one that rewrites *the way rewriting happens* — and it does so in the open world, where tasks arrive without labels, without unit tests, and without a verifier to tell you whether the deliverable is any good.

<div class="hx-kpis">
  <div class="hx-kpi"><b>+11.5</b><i>WorkBuddy-Bench · GLM-5 · OpenCode</i><span>One improvement step, from 64.2 to 75.7 average.</span></div>
  <div class="hx-kpi"><b>+4.5</b><i>JobBench · Gemini 3.5 Flash · OpenCode</i><span>Same step, a different professional domain.</span></div>
  <div class="hx-kpi"><b>+11.8</b><i>LAB Partial · GLM-5 · OpenCode</i><span>Legal work, scored per criterion.</span></div>
</div>

The setup is deliberately stingy. Model weights are frozen. The harness is executed through off-the-shelf runners (OpenCode and Codex) across Gemini 3.5 Flash and GLM-5, and the same improvement step is applied to all four configurations. Three benchmarks stand in for professional work: WorkBuddy-Bench (Code, Web, Office), JobBench (long end-to-end job tasks), and Harvey's Legal Agent Benchmark, reported as *Partial*, the per-criterion pass rate.

## The unit of work is eight files

A harness is written as $\mathcal{H} = (c^{1}, \ldots, c^{K})$, a tuple of $K$ editable components that compose with a frozen model $\mathcal{M}$ to form an agent $\mathcal{A}(\cdot; \mathcal{M}, \mathcal{H})$. Harness2 adopts the file-level decomposition of prior work and extends it by one component, so $K = 8$ and **every component is a file**. That single decision is what makes the rest of the paper possible: if a component is a file, an edit is a diff, and a diff is something you can propose, probe, review, and store.

<div class="hx-grid">
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-prompt"></use></svg></span></span>
      <span class="hx-cnum">C1</span>
    </div>
    <div class="hx-name">System prompt</div>
    <div class="hx-def">Persona and top-level procedure, followed on all tasks.</div>
    <div class="hx-file">systemprompt.md</div>
    <div class="hx-when">Context · every call</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-guard"></use></svg></span></span>
      <span class="hx-cnum">C2</span>
    </div>
    <div class="hx-name">Guardrails</div>
    <div class="hx-def">Hard constraints that hold regardless of task or tool.</div>
    <div class="hx-file">guardrails.md</div>
    <div class="hx-when">Context · every call</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-memory"></use></svg></span></span>
      <span class="hx-cnum">C3</span>
    </div>
    <div class="hx-name">Memory</div>
    <div class="hx-def">Durable domain facts persisted across tasks in a domain.</div>
    <div class="hx-file">LongTermMEMORY.md</div>
    <div class="hx-when">Context · every call</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-tool"></use></svg></span></span>
      <span class="hx-cnum">C4</span>
    </div>
    <div class="hx-name">Tool guidance</div>
    <div class="hx-def">When and how each existing tool should be used.</div>
    <div class="hx-file">tool_descriptions/tool_guidance.md</div>
    <div class="hx-when">Tool · every call</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-subagent"></use></svg></span></span>
      <span class="hx-cnum">C5</span>
    </div>
    <div class="hx-name">Subagents</div>
    <div class="hx-def">A delegated worker in its own context window that returns only its result.</div>
    <div class="hx-file">sub_agents/&lt;n&gt;/AGENT.md</div>
    <div class="hx-when">Orchestration · task tool</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-skills"></use></svg></span></span>
      <span class="hx-cnum">C6</span>
    </div>
    <div class="hx-name">Skills</div>
    <div class="hx-def">A specialist procedure loaded only when invoked, so it costs nothing when unused.</div>
    <div class="hx-file">skills/&lt;n&gt;/SKILL.md</div>
    <div class="hx-when">Context · on invoke</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-script"></use></svg></span></span>
      <span class="hx-cnum">C7</span>
    </div>
    <div class="hx-name">Scripts</div>
    <div class="hx-def">A new deterministic capability, executed instead of reasoned through token by token.</div>
    <div class="hx-file">scripts/&lt;name&gt;.py</div>
    <div class="hx-when">Tool · via bash</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-plugin"></use></svg></span></span>
      <span class="hx-cnum">C8</span>
    </div>
    <div class="hx-name">Middleware plugin</div>
    <div class="hx-def">A hook around tool calls and turn boundaries: it enforces a behaviour rather than instructing it.</div>
    <div class="hx-file">plugin/&lt;name&gt;.ts</div>
    <div class="hx-when">Middleware · inside tool loop</div>
  </div>
</div>

Three of the eight behave differently enough to explain much of what follows. **C5 is the only component that adds an inference context** — it is the one edit that multiplies cost rather than shape it. **C6 costs nothing until it is invoked**, which makes it the cheapest place to put long specialist procedure. **C8 is the only component the model cannot ignore**, because a plugin runs in the tool loop rather than in the prompt. When the ablations arrive later, the two components that add *capability* (skills, scripts) turn out to be worth more than the group that adds *instruction* — a result that is easier to believe once you have seen the activation column.

<figure class="fig">
  <img src="/images/harness2/fig02-harness-components.png" alt="Diagram of the eight harness components grouped by runtime role around a frozen model" loading="lazy" />
  <figcaption><b>Fig. 2</b> — The eight components grouped by the part of the runtime they modify. The icon grid above is this plate redrawn in the journal's mono palette; the original is worth reading once for how the plugin sits between the model and the tool interface. Source: <a href="https://arxiv.org/html/2610.14224v1/components.png">arxiv.org/html/2610.14224v1/components.png</a></figcaption>
</figure>

## Two loops, one system

The paper separates two objects that are usually conflated.

- The **execution harness** $\mathcal{H}$ is what runs the task. It is edited during a task and discarded as a specific artifact once the task ends.
- The **improvement harness** $\mathcal{R}_{t}$ is what edits harnesses. It contains the improvement procedure plus a *harness improvement library*, and it is frozen for the duration of a task.

Task-level recursion changes $\mathcal{H}$. Harnessing-level recursion changes $\mathcal{R}_{t}$, using what the first loop learned. Neither touches the weights, and the paper's definition is worth quoting for its precision: the execution harness is the system being improved, and the improvement harness is the mechanism that improves it.

<div class="hx-loop">
  <div class="hx-loop-head">
    <span class="hx-lvl">Level 02 // continual improvement harness ℛt</span>
    <span class="hx-lvl-note">frozen while a task runs · updated after it</span>
  </div>
  <div class="hx-loop-inner">
    <div class="hx-loop-head">
      <span class="hx-lvl">Level 01 // execution harness ℋ</span>
      <span class="hx-lvl-note">one task · resets to ℋ0</span>
    </div>
    <div class="hx-row">
      <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-plan"></use></svg><div><b>Propose</b><span>Two candidate edits: invariant and domain-specific.</span></div></div>
      <div class="hx-arrow">→</div>
      <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-up"></use></svg><div><b>Probe</b><span>Each candidate runs on the same task, matched conditions.</span></div></div>
      <div class="hx-arrow">→</div>
      <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-merge"></use></svg><div><b>Compose</b><span>Merge, revise, adopt or keep — then execute ℋ′.</span></div></div>
    </div>
  </div>
  <div class="hx-row">
    <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-reflect"></use></svg><div><b>Reflect on 𝓓t</b><span>Which edits addressed which deficiency, under what conditions.</span></div></div>
    <div class="hx-arrow">→</div>
    <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-facts"></use></svg><div><b>Update the library</b><span>ℛt+1 = Update(ℛt, ℋ⋆t, 𝓓t): adopted harness plus EXPERIENCE.md.</span></div></div>
    <div class="hx-arrow">→</div>
    <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-task"></use></svg><div><b>Guide the next task</b><span>Reuse is selective: components become proposal material, not inherited defaults.</span></div></div>
    <div class="hx-arrow">↺</div>
  </div>
</div>

Why insist on two loops? Because the obvious one-level design fails in two directions at once. A harness tuned for yesterday's task is often *worse* than the starting harness on today's; and carrying a heavily tailored harness forward produces noisy improvement as the task distribution shifts. What does carry over, reliably, is the record of the refinement itself: how a weakness was diagnosed, which change was tried, and what the execution revealed.

<figure class="fig">
  <img src="/images/harness2/fig03-pipeline.png" alt="Pipeline diagram showing task-level recursion on the left and harnessing-level recursion on the right" loading="lazy" />
  <figcaption><b>Fig. 3</b> — The pipeline. The inner box is the execution harness being refined on Task <em>t</em>; the outer arc is the improvement harness, which absorbs the refinement record and hands it to the next task. Source: <a href="https://arxiv.org/html/2610.14224v1/harness2_main_new.png">arxiv.org/html/2610.14224v1/harness2_main_new.png</a></figcaption>
</figure>

## Task-level recursion: Propose, Probe, Compose

The contrastive improvement step is a single operation applied to the current harness, the task, and all task-local history:

$$\left(\mathcal{H}^{\prime}, e^{\prime}, \xi\right) = \Phi\left(q_{t}, \mathcal{H}, \mathcal{E}; \mathcal{R}_{t}\right)$$

It returns three things: a successor harness $\mathcal{H}^{\prime}$, **its execution record** $e^{\prime}$, and a step record $\xi$ holding the reference executions, the candidate harnesses and probes, the composition decisions, and the successor execution. That third return value matters more than it looks — the paper is not just optimising a harness, it is producing an audit trail for the second loop to read.

### Propose: one candidate for the pattern, one for the place

Everything starts from a reference execution $e^{0} \sim \mathcal{A}(q_{t}; \mathcal{M}, \mathcal{H})$. The paper is careful about what this reference is: it reveals **how the harness behaves, not whether its deliverable is correct**. With that as the baseline, the pipeline drafts exactly two candidates, and the split between them is the most opinionated design choice in the paper.

<div class="hx-split">
  <div class="hx-panel">
    <span class="hx-panel-tag">Candidate A // scope: anywhere</span>
    <h5>Invariant</h5>
    <p>Targets agentic deficiencies that may recur across domains. Fix it once, and it should still be true next month, on a different benchmark, in a different job.</p>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-plan"></use></svg><div><b>Planning</b><span>Decomposing before acting; keeping a plan across turns.</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-tooluse"></use></svg><div><b>Tool use</b><span>Choosing a tool, and recovering when it fails.</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-context"></use></svg><div><b>Context management</b><span>What stays in view, what gets written down, what is dropped.</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-deleg"></use></svg><div><b>Delegation</b><span>When a subtask deserves its own context window.</span></div></div>
  </div>
  <div class="hx-panel alt">
    <span class="hx-panel-tag">Candidate B // scope: this environment</span>
    <h5>Domain-specific</h5>
    <p>Targets the knowledge, procedures and constraints of the current domain. Valuable here, and expected to expire the moment the work changes.</p>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-facts"></use></svg><div><b>Domain facts</b><span>Figures, filenames, definitions — checked against this task's evidence.</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-proc"></use></svg><div><b>Procedures</b><span>The order of operations this kind of work actually follows.</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-limits"></use></svg><div><b>Constraints</b><span>What the domain forbids, and the formats it will not accept.</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-env"></use></svg><div><b>Environment</b><span>What is actually installed, mounted and reachable here.</span></div></div>
  </div>
</div>

Both candidates are *executable harnesses*, produced by editing the current harness's files — not descriptions of edits. Proposals may reuse or adapt components from the library, but task-specific facts must be checked against the current task's evidence, which is the paper's way of saying: reuse the shape of a fix, re-derive the numbers.

The split is a hedge. Fixing only the pattern overfits to a generic weakness that may not be where the score is lost. Fixing only the place memorises a benchmark. Drafting one of each spends the proposal budget on the two failure modes that actually compete.

### Probe: the only signal is a behavioural contrast

Each candidate is executed on the same task under matched model and environment settings. Comparing its trajectory and deliverable against the reference yields a **behavioural contrast**: evidence about whether the edit addressed the deficiency it claimed to address.

<div class="hx-tri">
  <div class="hx-tri-item"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-up"></use></svg><b>Mitigated</b><span>The targeted behaviour changed in the intended direction.</span></div>
  <div class="hx-tri-item"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-flat"></use></svg><b>Unchanged</b><span>The edit landed but the behaviour did not move.</span></div>
  <div class="hx-tri-item"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-down"></use></svg><b>Regressed</b><span>Something else broke on the way to the fix.</span></div>
</div>

The paper is unusually candid about the limits of this signal: execution stochasticity and shared model biases mean the contrast informs composition **without verifying task correctness**. This is the trade at the centre of the whole design. A verifier would be stronger; in the open world there isn't one, so the pipeline settles for directional evidence and pushes the uncertainty into the next stage rather than hiding it behind a score.

### Compose: merge what is supported, keep what is not

Composition reads the reference, both candidate harnesses, their diffs against the current harness, and every piece of task-local execution evidence. Then it makes one of four moves.

<div class="hx-ladder">
  <div class="hx-ladder-row"><b>Merge</b><span>Combine changes each supported by its own contrast, when they do not touch the same behaviour.</span></div>
  <div class="hx-ladder-row"><b>Revise</b><span>Rewrite edits that conflict with each other or overshoot the evidence.</span></div>
  <div class="hx-ladder-row"><b>Adopt one</b><span>Take a single candidate when only one of them moved anything.</span></div>
  <div class="hx-ladder-row"><b>Preserve</b><span>Keep the current harness unchanged. Composition is allowed to conclude that nothing helped.</span></div>
</div>

The important discipline is stated in one sentence: each decision is tied to a concrete observation rather than a presumed score gain. And then $\mathcal{H}^{\prime}$ is **executed** before the step returns. Compose does not select a winner and stop; it hands back a harness that has already run, with the evidence that justified it. That is what keeps the next proposal honest.

## Parallel and sequential recursion

One contrastive step is a single sample. The paper scales it in two directions controlled by a budget $k$: $k$ candidates per scope and $k$ compositions in parallel, or $k$ chained steps in sequence.

<figure class="fig">
  <img src="/images/harness2/fig04-scaling.png" alt="Two diagrams contrasting parallel recursion, where candidates are proposed independently, with sequential recursion, where each step feeds the next" loading="lazy" />
  <figcaption><b>Fig. 4</b> — Two forms of task-level recursion. (a) Parallel: k references, k invariant and k domain candidates, and k independent composition sessions that each see the whole pool. (b) Sequential: each refined harness and its accumulated execution history become the input to the next step. Source: <a href="https://arxiv.org/html/2610.14224v1/scaling.png">arxiv.org/html/2610.14224v1/scaling.png</a></figcaption>
</figure>

**Parallel recursion** collects $k$ reference executions, proposes $k$ invariant and $k$ domain-specific candidates, probes them all, and then runs $k$ composition sessions that each receive the full pool:

$$\mathcal{H}^{\prime}_{j} = \mathrm{Compose}_{j}\left(q_{t}, \mathcal{H}, \mathcal{B}, \mathcal{P}; \mathcal{R}_{t}\right), \qquad j = 1, \ldots, k$$

It is one population update — $k$ controls the *width* of the search, not its depth. The analogy the paper draws is to aggregation over independent samples, except the samples are executable harnesses and their behavioural consequences rather than reasoning traces.

**Sequential recursion** starts from $\mathcal{H}^{(0)} = \mathcal{H}_{0}$ and chains $k$ contrastive steps, each conditioned on the previous harness and the accumulated history $\mathcal{E}^{(r-1)}$:

$$\left(\mathcal{H}^{(r)}, e^{(r)}, \xi^{(r)}\right) = \Phi\left(q_{t}, \mathcal{H}^{(r-1)}, \mathcal{E}^{(r-1)}; \mathcal{R}_{t}\right), \qquad r = 1, \ldots, k$$

Here later steps can retain, revise, or *correct* earlier changes, because they see both current and previous evidence. When $k > 1$, an agentic selector compares anonymised deliverables against the task request and source materials. It cannot see which harness produced which output, cannot synthesise new content, and simply returns an existing deliverable. The adopted harness is written $\mathcal{H}^{\star}_{t}$ — the star means adopted, not verified optimal. At $k = 1$ both forms collapse to the basic step and skip selection.

The distinction that matters is not "more thinking". Parallel buys **decorrelated evidence**: different proposals against the same task, composed independently. Sequential buys **correction**: a later step can undo an earlier edit that looked good and wasn't. Neither produces a correctness signal, which is why the results behave the way they do.

On WB-code, parallel recursion lifts the score from 76.5 at $k = 1$ to 80.8 at $k = 5$; on WB-office, from 79.5 to 83.4. Both rise monotonically. The baselines do not: Harness Scaling regresses from $k = 2$ to $k = 3$ on both domains, and ReasoningBank fluctuates. The paper's own conclusion is the sharpest line in the section — *increasing test-time exploration alone does not ensure better performance* — and the supporting fact is stronger than the caveat: both Harness2 forms at $k = 2$ beat every plotted baseline at $k = 5$, on both domains.

## Harnessing-level recursion: teaching the improver

After the deliverable is returned, the pipeline reflects on the complete improvement record $\mathcal{D}_{t}$ — reference executions, candidates and probes, composition decisions, the selected result. The reflection is not free-form. It extracts lessons about *which changes addressed which deficiencies, under what conditions, and with what consequences*, and it keeps a lesson only when an execution contrast supports it. Selecting an output is not evidence that the insight behind it transfers.

Those lessons, plus the adopted harness itself, go into the library:

$$\mathcal{R}_{t+1} = \mathrm{Update}\left(\mathcal{R}_{t}, \mathcal{H}^{\star}_{t}, \mathcal{D}_{t}\right)$$

Each entry pairs an executable harness with an `EXPERIENCE.md` recording the applicable situation, the lessons, and the supporting evidence; an index lets a later session pull relevant entries on demand. The next task still begins from the common harness $\mathcal{H}_{0}$ — earlier components are reused or adapted through Propose, never inherited by default. Model weights, stage instructions and the decision rule stay fixed. Only the library evolves.

The evidence for this loop is the part of the paper I find most convincing, because it includes the negative case. Refining the base harness **directly**, with no reference executions, no probes and no library, does not improve it: Code falls from 73.4 to 63.2 and Web from 69.9 to 65.0. A library accumulated at $k = 1$ restores base performance. A library accumulated at $k = 5$ turns the same direct refinement into gains of 0.9, 4.4 and 5.1 points on Code, Web and Office. More task-level exploration produces a better improver, without any additional probing at the next task.

The library also travels. A library derived from JobBench improves one-step refinement on WorkBuddy-Bench by 0.6, 0.5 and 2.9 points across the three domains. A leave-one-out re-run, where each task is repeated with its own library entry removed, moves WorkBuddy-Bench from 77.5 to 79.4 and JobBench from 36.0 to 37.7 — an offline reuse measurement that can see later entries, not an estimate of online gain.

What is actually being stored is worth naming precisely. Comparing modified files against the library snapshot available during refinement, library provenance appears in 22% of modified files on LAB and WB-office and 47% on JobBench; but only 2–10% of files retain at least half their lines from an entry. Skills and scripts account for roughly half of all edits. In other words, the library is closer to a **diff prior with an experience note** than to a checkpoint: it tells the improver what a fix for this kind of weakness tends to look like, and when it tends to work — and then the improver rewrites it for the task at hand.

## Results: one step is already a lot

A single improvement step ($k = 1$) improves every one of the twelve benchmark–configuration pairs. The table below reports the base harness and the Harness2 number after one step.

| Executor · initial harness | WorkBuddy-Bench avg. | JobBench | LAB (Partial) |
| :-- | --: | --: | --: |
| Gemini 3.5 Flash · OpenCode | 72.4 → **77.5** (+5.1) | 31.5 → **36.0** (+4.5) | 79.9 → **81.9** (+2.0) |
| Gemini 3.5 Flash · Codex | 74.5 → **77.5** (+3.0) | 33.9 → **35.3** (+1.4) | 71.6 → **75.6** (+4.0) |
| GLM-5 · OpenCode | 64.2 → **75.7** (+11.5) | 20.6 → **24.2** (+3.6) | 59.6 → **71.4** (+11.8) |
| GLM-5 · Codex | 64.4 → **75.3** (+10.9) | 23.6 → **24.8** (+1.2) | 58.1 → **65.9** (+7.8) |

Two patterns are worth more than the averages.

The first is that **the weaker executor gains more** on WorkBuddy-Bench and LAB. After a single step, GLM-5 reaches 75.7 and 75.3 — above the base harness scores of Gemini 3.5 Flash, the stronger model, at 72.4 and 74.5. A weaker model with an improved harness can beat a stronger model with its original one. JobBench reverses the ordering, where Gemini gains 4.5 against GLM-5's 3.6, which is a useful reminder that "harness dominates model" is not a universal law but a domain-dependent one.

The second is that **recursion extends the gain rather than rescuing it**. Parallel recursion at $k = 5$ adds 2.9–3.9 points on WorkBuddy-Bench, 3.0–4.2 on JobBench, and 2.6–6.7 percentage points in LAB Partial. It also narrows some gaps between initial harnesses — JobBench's OpenCode–Codex gap shrinks from 2.4 to 0.5 for Gemini and from 3.0 to 0.5 for GLM-5 — but not uniformly: on WorkBuddy-Bench, GLM-5's gap widens from 0.2 to 1.3.

<figure class="fig">
  <img src="/images/harness2/fig01-overall-performance.png" alt="Bar chart of WorkBuddy-Bench scores by domain and a line chart of score against scaling budget" loading="lazy" />
  <figcaption><b>Fig. 1</b> — Left: WorkBuddy-Bench by domain for Gemini 3.5 Flash under OpenCode, with parallel recursion at k = 5; the number above each bar is the gain over the base harness, which is included as the grey bar. Right: score against the recursion budget k on WB-code — Harness2 climbs monotonically while the two baselines stall or wobble. Source: <a href="https://arxiv.org/html/2610.14224v1/intro_teaser.png">arxiv.org/html/2610.14224v1/intro_teaser.png</a></figcaption>
</figure>

The compute accounting is honest about the bill. Counting every token spent before the final deliverable — execution *and* improvement — both Harness2 configurations sit on the empirical Pareto frontier of the JobBench and WorkBuddy-Bench plots. With Gemini 3.5 Flash under OpenCode, moving from $k = 1$ to $k = 5$ raises the gain over base from 4.5 to 7.5 points on JobBench and from 5.1 to 8.4 on WorkBuddy-Bench, while Meta-Harness spends more compute than Harness2 at $k = 5$ for less score. This is not a free lunch; it is a better exchange rate.

Two further results tighten the claim that the gain is about the harness, not about hidden model capability. Using **the same model as executor and editor**, all five models from GLM-5 to Claude Opus 5 improve on every benchmark — Opus 5 by 3.3, 5.5 and 3.0 points, GLM-5 by 13.7 points on LAB alone — so refinement does not require a stronger editor. And a harness refined for Gemini 3.5 Flash transfers **unchanged** to other executors: GLM-5 gains 17.3 points on Code (58.5 → 75.8), Gemini 3.7 Flash gains 0.3 and 6.4, Opus 4.8 gains 2.6 and 1.1. The benefit varies a lot by executor and domain, but it does not vanish.

Against production harnesses the comparison is more mundane and more persuasive: on WorkBuddy-Bench, no fixed harness wins every domain — Claude Code leads Code and Office, Codex leads Web — and Harness2, starting from OpenCode, beats the strongest fixed alternative by 4.6, 5.8 and 4.9 points, and its own starting harness by 7.4, 8.4 and 9.4.

## Ablation: which parts carry the gain

The ablations are run at $k = 1$ with Gemini 3.5 Flash under OpenCode, so each component is isolated from the test-time budget. The first removes whole mechanisms: the library, the scoped editor roles, and composition.

| Configuration | WorkBuddy-Bench | JobBench |
| :-- | --: | --: |
| Harness2 | 77.5 | 36.0 |
| w/o library | 74.4 (−3.1) | 34.2 (−1.8) |
| w/o scoping | 74.6 (−2.9) | 32.3 (−3.7) |
| w/o composition | 75.9 (−1.6) | 34.1 (−1.9) |

Removing **scoping** — replacing the invariant and domain editors with two generic ones that draft the same number of candidates from the same evidence — costs 2.9 and 3.7 points. That is more than removing composition (1.6 and 1.9), which surprised me: the *split* into two proposal scopes is worth more than the merge step that follows it. The library is worth 3.1 and 1.8, which is consistent with the direct-refinement experiment above: without memory of past refinements, the improver keeps rediscovering, and sometimes re-breaking, the same ground.

The second ablation deletes component *groups* from an already improved harness, without rerunning improvement. This measures what the retained components are worth, not the pipeline's ability to compensate for their absence.

<div class="tufte-live-card hx-chart">
  <div class="chart-header">
    <span class="card-tag">EXHIBIT // ABLATION LADDER</span>
    <h4 class="chart-title">Skills are the most expensive component to delete</h4>
    <p class="chart-sub">WorkBuddy-Bench average · Gemini 3.5 Flash under OpenCode · parallel recursion at k = 5 · the dashed line is the base harness, not zero</p>
  </div>
  <svg class="hx-svg" viewBox="0 0 820 330" role="img" aria-labelledby="abl-title abl-desc">
    <title id="abl-title">Ablation ladder on WorkBuddy-Bench</title>
    <desc id="abl-desc">Dot plot. Base harness 72.4, without skills 75.5, without scripts 77.1, without prompt-related components 79.3, full Harness2 80.8. Every ablated harness stays above the base harness.</desc>
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
    <text x="150" y="32" font-family="'JetBrains Mono',monospace" font-size="6.5" letter-spacing="0.08em" fill="#8F8E88">SCORE · WB AVG (%)</text>
    <text x="276" y="32" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="6.5" letter-spacing="0.08em" fill="#8F8E88">BASE 72.4</text>
    <text x="800" y="32" text-anchor="end" font-family="'JetBrains Mono',monospace" font-size="6.5" letter-spacing="0.08em" fill="#8F8E88">Δ VS FULL</text>
    <g stroke="#E4E3DC" stroke-width="0.5">
      <line x1="40" y1="96" x2="790" y2="96"></line>
      <line x1="40" y1="152" x2="790" y2="152"></line>
      <line x1="40" y1="208" x2="790" y2="208"></line>
      <line x1="40" y1="264" x2="790" y2="264"></line>
    </g>
    <g font-family="Inter,sans-serif" font-size="9.5" font-weight="600" fill="#4A4944" text-anchor="end">
      <text x="140" y="64">BASE HARNESS</text>
      <text x="140" y="120">W/O SKILLS</text>
      <text x="140" y="176">W/O SCRIPTS</text>
      <text x="140" y="232">W/O PROMPTS*</text>
      <text x="140" y="288">HARNESS² · FULL</text>
    </g>
    <g font-family="'JetBrains Mono',monospace" font-size="6.5" fill="#8F8E88" text-anchor="end">
      <text x="140" y="76">unchanged H0</text>
      <text x="140" y="132">skills/&lt;n&gt;/SKILL.md</text>
      <text x="140" y="188">scripts/&lt;n&gt;.py</text>
      <text x="140" y="244">prompt-related group</text>
      <text x="140" y="300">all components</text>
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
  <div class="chart-footer">ABLATION LADDER · HARNESS2 TABLE 6 · GEMINI 3.5 FLASH / OPENCODE · K=5 · MEAN OF 3 RUNS</div>
</div>

The shape of that ladder is the paper's most practical finding. Full Harness2 averages 80.8. Delete the prompt-related group and you keep 79.3 — a loss of 1.5. Delete the scripts and you keep 77.1, a loss of 3.7, concentrated in Office (−7.4), where deterministic handling of numbers and files is most of the job. Delete the skills and you keep 75.5, a loss of 5.3, concentrated in Code (−3.6) and Web (−6.9). The two components that add *capability* — a script that computes, a skill that knows a procedure — carry more weight than the group that adds *instruction*.

Two honest caveats come with the table. Every ablated harness still clears the base harness at 72.4, so nothing here is a single point of failure; and the paper explicitly declines to claim additive effects. The components support each other, which is exactly what you would expect from a system where a skill can call a script and a plugin can enforce what a prompt merely requests.

## Nine regressions: what still breaks

The failure analysis is small — nine results that scored below their reference — and it is more useful than the wins, because it names the three ways the loop can hurt you.

1. **Selection can prefer a weaker candidate.** On WB-code, an output scoring 55 was chosen over one scoring 95. On LAB, wider but shallower coverage dropped a case from 54 to 26. The selector judges anonymised deliverables without knowing which harness produced them, which is the right design for fairness and the wrong one for picking the better of two similar outputs.
2. **An incorrect premise propagates across candidates.** A literal-key requirement, or an unchecked assumption about a cache, cost 2–11 points. Both proposals inherited it from the same reading of the task, and probing could not distinguish "the edit is wrong" from "the environment disagrees".
3. **Outcome variance and unaddressed criteria** absorb the rest. Missing judge verdicts and edits that never touched the evaluated criteria make attribution difficult, which is why the paper asks for repeated executions before believing an effect.

Read together, these suggest where the next improvement should go: selection that balances coverage against precision, probes designed to challenge shared assumptions rather than confirm them, and repetition as a first-class part of the evidence.

## What to take away

Three things survive a sceptical reading.

**Make the harness a file tree.** The recursion is only tractable because every change is a diff against a named file. That gives proposals a bounded surface, gives composition something concrete to merge, and gives the library an entry format that is executable rather than descriptive. If your harness is a thousand-line prompt builder, none of this paper applies to you yet.

**A contrast is a weak signal that is still worth having.** The pipeline never claims to know the answer is right; it only knows that behaviour moved, or did not, relative to a reference run. That is enough to choose between edits when no verifier exists — and it is the honest version of what most "self-improving agent" systems quietly assume they have.

**The asset is the improvement record, not the harness.** The strongest evidence in the paper is that direct refinement without the library *degrades* performance (73.4 → 63.2 on Code), while the same improver with a library accumulated at $k = 5$ improves it. A harness you keep is worth less than a habitable memory of how it was changed and why.

The limits are real. Test-time compute multiplies by roughly $k$; selection is a soft spot; premise errors can be shared by every candidate; and the benchmarks, while professional, are three domains out of an open world. The paper says as much, which is part of why I trust the numbers.

Still, the framing has shifted. For years the harness was the thing you tuned before deployment, and the model was the thing that improved. Harness2 treats the harness as the thing you teach — and the teaching, not the artifact, as the thing that compounds.

## Reference

- **Paper** — Xu, Chen, CuiZhu, Dalvi Mishra, Ming, Yu, Han, Lee, Pfister. *Harness2: Recursive Agent Harnessing for an Open World.* arXiv:2610.14224v1, 9 October 2026. [arxiv.org/abs/2610.14224](https://arxiv.org/abs/2610.14224) · [HTML edition](https://arxiv.org/html/2610.14224v1)
- **Code and project page** — [github.com/google-research/harness2](https://github.com/google-research/harness2) · [harness2.github.io](https://harness2.github.io/)
- **Figures** — all four plates are reproduced from the HTML edition in their original colour and recompressed for the web; the files live under `/images/harness2/`. Original URLs: [components.png](https://arxiv.org/html/2610.14224v1/components.png), [intro_teaser.png](https://arxiv.org/html/2610.14224v1/intro_teaser.png), [harness2_main_new.png](https://arxiv.org/html/2610.14224v1/harness2_main_new.png), [scaling.png](https://arxiv.org/html/2610.14224v1/scaling.png).
