---
title: "Harness²：當 Harness 學會改寫 Harness"
description: "細讀 Harness2（arXiv:2610.14224）：八個可編輯的 harness 組件、在沒有標準答案驗證器時仍能運作的對比式 Propose–Probe–Compose 迴圈，以及教會「改進者」本身的第二層遞迴。"
pubDate: 2026-10-24
category: "AI"
tags: ["Agent", "Harness", "RSI", "LLM", "論文筆記"]
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

**LLM agent 不是一個模型。** 它是模型再加上外面那一整圈東西：開場的指示、不可跨越的護欄、帶進某個領域的記憶、可載入的技能、工具怎麼用的指引、能執行的腳本、可以派工的 worker，以及在你眼皮底下、模型無法否決的 hook。那一圈就是 **harness**，而在正式環境裡，它經常就是「demo」與「產品」之間的差別。

Harness2（[arXiv:2610.14224](https://arxiv.org/abs/2610.14224)，Google Cloud AI Research 與 Northwestern，2026 年 10 月 9 日）從一個講起來很簡單、答起來很難誠實的問題出發：

> Can recursive self-improvement improve both the current harness and how future harnesses are improved?
>
> — *Harness2*, §1

多數自我改進的 agent 研究只回答了前半段：針對眼前這個任務改寫 harness。Harness2 在上面再跑一層迴圈——改寫「改寫這件事本身怎麼發生」——而且是在開放世界裡做：任務來的時候沒有標籤、沒有單元測試、也沒有驗證器告訴你交付物到底好不好。

<div class="hx-kpis">
  <div class="hx-kpi"><b>+11.5</b><i>WorkBuddy-Bench · GLM-5 · OpenCode</i><span>一次改進步驟，平均從 64.2 升到 75.7。</span></div>
  <div class="hx-kpi"><b>+4.5</b><i>JobBench · Gemini 3.5 Flash · OpenCode</i><span>同樣一步，換一個專業領域。</span></div>
  <div class="hx-kpi"><b>+11.8</b><i>LAB Partial · GLM-5 · OpenCode</i><span>法律工作，逐項標準計分。</span></div>
</div>

實驗設定刻意摳門。模型權重凍結；harness 透過現成的 runner（OpenCode 與 Codex）在 Gemini 3.5 Flash 與 GLM-5 上執行，四種組合套用同一個改進步驟。三個 benchmark 代表專業工作：WorkBuddy-Bench（Code、Web、Office）、JobBench（長流程的端到端工作任務），以及 Harvey 的 Legal Agent Benchmark，以 *Partial*（逐項標準通過率）呈現。

## 工作單位是八個檔案

harness 寫成 $\mathcal{H} = (c^{1}, \ldots, c^{K})$，是 $K$ 個可編輯組成的 tuple，與凍結的模型 $\mathcal{M}$ 組合成 agent $\mathcal{A}(\cdot; \mathcal{M}, \mathcal{H})$。Harness2 沿用前作的檔案層級拆解，並多加一個組件，於是 $K = 8$，而且**每個組件都是一個檔案**。這個決定撐起了整篇論文：組件是檔案，編輯就是 diff；而 diff 是可以被提案、被探測、被審閱、被存放的東西。

<div class="hx-grid">
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-prompt"></use></svg></span></span>
      <span class="hx-cnum">C1</span>
    </div>
    <div class="hx-name">系統提示（System prompt）</div>
    <div class="hx-def">人格設定與最高層級流程，所有任務都遵循。</div>
    <div class="hx-file">systemprompt.md</div>
    <div class="hx-when">Context · 每次呼叫</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-guard"></use></svg></span></span>
      <span class="hx-cnum">C2</span>
    </div>
    <div class="hx-name">護欄（Guardrails）</div>
    <div class="hx-def">不論任務或工具，一律成立的硬性限制。</div>
    <div class="hx-file">guardrails.md</div>
    <div class="hx-when">Context · 每次呼叫</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-memory"></use></svg></span></span>
      <span class="hx-cnum">C3</span>
    </div>
    <div class="hx-name">記憶（Memory）</div>
    <div class="hx-def">在同一領域中跨任務留存的持久事實。</div>
    <div class="hx-file">LongTermMEMORY.md</div>
    <div class="hx-when">Context · 每次呼叫</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-tool"></use></svg></span></span>
      <span class="hx-cnum">C4</span>
    </div>
    <div class="hx-name">工具指引（Tool guidance）</div>
    <div class="hx-def">每個既有工具該在何時、如何被使用。</div>
    <div class="hx-file">tool_descriptions/tool_guidance.md</div>
    <div class="hx-when">Tool · 每次呼叫</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-subagent"></use></svg></span></span>
      <span class="hx-cnum">C5</span>
    </div>
    <div class="hx-name">子代理（Subagents）</div>
    <div class="hx-def">在獨立 context window 中工作、只回傳結果的受派 worker。</div>
    <div class="hx-file">sub_agents/&lt;n&gt;/AGENT.md</div>
    <div class="hx-when">Orchestration · task tool</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-skills"></use></svg></span></span>
      <span class="hx-cnum">C6</span>
    </div>
    <div class="hx-name">技能（Skills）</div>
    <div class="hx-def">只在被呼叫時載入的專家流程，用不到時完全不佔成本。</div>
    <div class="hx-file">skills/&lt;n&gt;/SKILL.md</div>
    <div class="hx-when">Context · 呼叫時</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-script"></use></svg></span></span>
      <span class="hx-cnum">C7</span>
    </div>
    <div class="hx-name">腳本（Scripts）</div>
    <div class="hx-def">新增的確定性能力：直接執行，而不是逐 token 推理出來。</div>
    <div class="hx-file">scripts/&lt;name&gt;.py</div>
    <div class="hx-when">Tool · 經由 bash</div>
  </div>
  <div class="hx-card">
    <div class="hx-card-top">
      <span class="hx-frame"><span class="hx-frame-in"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-plugin"></use></svg></span></span>
      <span class="hx-cnum">C8</span>
    </div>
    <div class="hx-name">中介層外掛（Plugin）</div>
    <div class="hx-def">掛在工具呼叫與回合邊界上的 hook：它是「強制」某種行為，而不是「指示」。</div>
    <div class="hx-file">plugin/&lt;name&gt;.ts</div>
    <div class="hx-when">Middleware · 工具迴圈內</div>
  </div>
</div>

這八個裡有三個的行為方式足以解釋後面的多數結果。**C5 是唯一會增加一條推理 context 的組件**——它是唯一「乘上成本」而非「塑形」的編輯。**C6 在被呼叫之前不花任何成本**，所以它是放長篇專家流程最便宜的位置。**C8 是唯一模型無法忽略的組件**，因為外掛跑在工具迴圈裡，而不是寫在提示裡。等到消融實驗出現時，你會看到真正貢獻「能力」的兩個組件（技能、腳本）比貢獻「指示」的那一組更值錢——看過啟動時機那一欄之後，這個結果就不那麼意外了。

<figure class="fig">
  <img src="/images/harness2/fig02-harness-components.png" alt="八個 harness 組件依執行期角色分組、圍繞凍結模型的示意圖" loading="lazy" />
  <figcaption><b>圖 2</b> — 八個組件依「它們改動執行期的哪一部分」分組。上方那張 icon 圖是這張原始圖版在本站單色語彙下的重繪；原圖值得看一次，特別是外掛如何夾在模型與工具介面之間。來源：<a href="https://arxiv.org/html/2610.14224v1/components.png">arxiv.org/html/2610.14224v1/components.png</a></figcaption>
</figure>

## 兩層迴圈，同一套系統

論文把兩件常被混為一談的東西分開。

- **執行用 harness** $\mathcal{H}$ 是真正跑任務的那一層。它在任務中被編輯，任務結束後就作為「某個特定產物」被放下。
- **改進用 harness** $\mathcal{R}_{t}$ 是負責編輯 harness 的那一層。它包含改進流程與一座 *harness 改進函式庫*，並且在一個任務的時間內凍結不動。

任務層級遞迴改動 $\mathcal{H}$；harness 層級遞迴改動 $\mathcal{R}_{t}$，用的就是第一層學到的東西。兩者都不碰權重。論文那句定義值得逐字引用：執行用 harness 是「被改進的系統」，改進用 harness 是「改進它的機制」。

<div class="hx-loop">
  <div class="hx-loop-head">
    <span class="hx-lvl">層級 02 // 持續改進 harness ℛt</span>
    <span class="hx-lvl-note">任務進行中凍結 · 任務結束後更新</span>
  </div>
  <div class="hx-loop-inner">
    <div class="hx-loop-head">
      <span class="hx-lvl">層級 01 // 執行用 harness ℋ</span>
      <span class="hx-lvl-note">一次任務 · 回到 ℋ0</span>
    </div>
    <div class="hx-row">
      <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-plan"></use></svg><div><b>Propose 提案</b><span>兩個候選編輯：不變型與領域特定。</span></div></div>
      <div class="hx-arrow">→</div>
      <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-up"></use></svg><div><b>Probe 探測</b><span>兩個候選在同一個任務、相同條件下各跑一次。</span></div></div>
      <div class="hx-arrow">→</div>
      <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-merge"></use></svg><div><b>Compose 組合</b><span>合併、修訂、採用或保留——然後執行 ℋ′。</span></div></div>
    </div>
  </div>
  <div class="hx-row">
    <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-reflect"></use></svg><div><b>回顧 𝓓t</b><span>哪些編輯解決了哪個缺陷、在什麼條件下。</span></div></div>
    <div class="hx-arrow">→</div>
    <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-facts"></use></svg><div><b>更新函式庫</b><span>ℛt+1 = Update(ℛt, ℋ⋆t, 𝓓t)：採用的 harness 加 EXPERIENCE.md。</span></div></div>
    <div class="hx-arrow">→</div>
    <div class="hx-node"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-task"></use></svg><div><b>引導下一個任務</b><span>重用是選擇性的：組件成為提案素材，不會自動繼承。</span></div></div>
    <div class="hx-arrow">↺</div>
  </div>
</div>

為什麼非要兩層？因為顯而易見的單層設計會同時在兩個方向失敗。為昨天那個任務調好的 harness，在今天的任務上常常比起始 harness 更差；而把一個高度特製化的 harness 一路帶下去，隨著任務分布漂移，改進會變得充滿雜訊。真正能可靠帶走的，是改進過程本身的紀錄：缺陷怎麼被診斷、試了哪個改動、執行結果又揭露了什麼。

<figure class="fig">
  <img src="/images/harness2/fig03-pipeline.png" alt="pipeline 示意圖：左側為任務層級遞迴，右側為 harnessing 層級遞迴" loading="lazy" />
  <figcaption><b>圖 3</b> — 整條 pipeline。內框是在任務 t 上被精修的執行用 harness；外圈是改進用 harness，它吸收整份精修紀錄，再交給下一個任務。來源：<a href="https://arxiv.org/html/2610.14224v1/harness2_main_new.png">arxiv.org/html/2610.14224v1/harness2_main_new.png</a></figcaption>
</figure>

## 任務層級遞迴：Propose、Probe、Compose

對比式改進步驟是一個操作，套用在當前 harness、任務、以及所有任務內歷史上：

$$\left(\mathcal{H}^{\prime}, e^{\prime}, \xi\right) = \Phi\left(q_{t}, \mathcal{H}, \mathcal{E}; \mathcal{R}_{t}\right)$$

它回傳三樣東西：後繼 harness $\mathcal{H}^{\prime}$、**它的執行紀錄** $e^{\prime}$，以及一份步驟紀錄 $\xi$，裡頭有參考執行、候選 harness 與探測、組合決策、以及後繼執行結果。第三個回傳值比它看起來重要得多——論文不只是在最佳化一個 harness，它同時在替第二層產生一份可稽核的軌跡。

### Propose：一個候選管「模式」，一個候選管「現場」

一切從參考執行 $e^{0} \sim \mathcal{A}(q_{t}; \mathcal{M}, \mathcal{H})$ 開始。論文對這個參考說得很小心：它揭露的是 **harness 的行為長什麼樣，而不是它的交付物對不對**。以此為基準，pipeline 只起草兩個候選，而這個切分是整篇論文最有主見的設計選擇。

<div class="hx-split">
  <div class="hx-panel">
    <span class="hx-panel-tag">候選 A // 作用範圍：任何地方</span>
    <h5>不變型（Invariant）</h5>
    <p>針對可能跨領域重複出現的 agent 缺陷。修一次，下個月換一個 benchmark、換一份工作，它應該還是對的。</p>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-plan"></use></svg><div><b>規劃</b><span>先拆解再動手；讓計畫跨回合存活。</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-tooluse"></use></svg><div><b>工具使用</b><span>選對工具，以及工具失敗後怎麼補救。</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-context"></use></svg><div><b>context 管理</b><span>什麼留在視野內、什麼寫下來、什麼被丟掉。</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-deleg"></use></svg><div><b>派工</b><span>什麼時候一個子任務值得擁有自己的 context window。</span></div></div>
  </div>
  <div class="hx-panel alt">
    <span class="hx-panel-tag">候選 B // 作用範圍：這個環境</span>
    <h5>領域特定（Domain-specific）</h5>
    <p>針對當前領域的知識、流程與限制。在這裡很值錢，但工作一換就預期會過期。</p>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-facts"></use></svg><div><b>領域事實</b><span>數字、檔名、定義——對著這個任務的證據核對過。</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-proc"></use></svg><div><b>流程</b><span>這類工作實際上遵循的操作順序。</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-limits"></use></svg><div><b>限制</b><span>這個領域禁止什麼、不接受哪些格式。</span></div></div>
    <div class="hx-item"><svg class="hx-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-env"></use></svg><div><b>環境</b><span>這裡實際裝了什麼、掛載了什麼、能連到什麼。</span></div></div>
  </div>
</div>

兩個候選都是**可執行的 harness**，由改動當前 harness 的檔案產生——不是「改動的描述」。提案可以重用或改寫函式庫裡的組件，但任務特定的事實必須對著當前任務的證據核對；用論文的話說：重複使用修正的形狀，但要重新推導數字。

這個切分是一種對沖。只修模式，會過擬合到一個可能根本不是失分點的通用弱點；只修現場，則是把 benchmark 背下來。各起草一個，等於把提案預算花在兩個真正互相競爭的失敗模式上。

### Probe：唯一的訊號是行為對比

每個候選都在同一個任務、相同的模型與環境設定下執行一次。把它的軌跡與交付物和參考執行相比，得到一個**行為對比**：關於「這個編輯是否處理了它宣稱要處理的缺陷」的證據。

<div class="hx-tri">
  <div class="hx-tri-item"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-up"></use></svg><b>改善了</b><span>被針對的行為朝預期方向改變。</span></div>
  <div class="hx-tri-item"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-flat"></use></svg><b>沒動</b><span>編輯確實落地了，但行為沒有移動。</span></div>
  <div class="hx-tri-item"><svg class="hx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#h2-down"></use></svg><b>退步了</b><span>在修好之前，別的地方先壞了。</span></div>
</div>

論文對這個訊號的極限說得異常坦白：執行的隨機性與模型共享的偏誤，意味著對比能**提供組合的依據，卻不能驗證任務是否正確**。這就是整個設計的核心交換。有驗證器會更強；開放世界裡沒有，於是 pipeline 接受方向性的證據，把不確定性推到下一階段，而不是藏在一個分數後面。

### Compose：有證據的就合併，沒有的就保留

組合會讀參考執行、兩個候選 harness、它們對當前 harness 的 diff，以及所有任務內的執行證據，然後做四種動作之一。

<div class="hx-ladder">
  <div class="hx-ladder-row"><b>合併</b><span>當多個改動各自有對比支持、且不碰同一種行為時，把它們疊起來。</span></div>
  <div class="hx-ladder-row"><b>修訂</b><span>把彼此衝突、或超出證據範圍的編輯改寫掉。</span></div>
  <div class="hx-ladder-row"><b>擇一</b><span>只有一個候選真的推動了什麼時，就採用那一個。</span></div>
  <div class="hx-ladder-row"><b>保留</b><span>維持當前 harness 不變。組合被允許得出「什麼都沒幫上忙」的結論。</span></div>
</div>

這裡的紀律只有一句話：每個決策都要綁在一個具體觀察上，而不是假設的分數漲幅。而且 $\mathcal{H}^{\prime}$ 在步驟回傳之前**會被執行**。組合不是選出贏家就停手；它交回一個已經跑過的 harness，附上支持它的證據。這正是下一個提案之所以誠實的原因。

## 並行與序列

一次對比步驟只是一個樣本。論文用預算 $k$ 往兩個方向放大：每個範圍 $k$ 個候選、$k$ 個平行組合，或者 $k$ 個串接的步驟。

<figure class="fig">
  <img src="/images/harness2/fig04-scaling.png" alt="兩張圖對比並行遞迴（候選各自獨立提案）與序列遞迴（每一步餵給下一步）" loading="lazy" />
  <figcaption><b>圖 4</b> — 任務層級遞迴的兩種形式。(a) 並行：$k$ 個參考、$k$ 個不變型候選與 $k$ 個領域候選，再由 $k$ 個各自獨立、但都看到整個候選池的組合 session 產出後繼 harness。(b) 序列：每個被精修的 harness 與其累積的執行歷史，成為下一步的輸入。來源：<a href="https://arxiv.org/html/2610.14224v1/scaling.png">arxiv.org/html/2610.14224v1/scaling.png</a></figcaption>
</figure>

**並行遞迴**先收集 $k$ 次參考執行，提案 $k$ 個不變型與 $k$ 個領域特定候選，全部探測，再跑 $k$ 個各自拿到完整候選池的組合 session：

$$\mathcal{H}^{\prime}_{j} = \mathrm{Compose}_{j}\left(q_{t}, \mathcal{H}, \mathcal{B}, \mathcal{P}; \mathcal{R}_{t}\right), \qquad j = 1, \ldots, k$$

這是「一次族群更新」——$k$ 控制的是搜尋的*寬度*，不是深度。論文類比的是對獨立樣本做聚合，差別在於樣本是可執行的 harness 及其行為後果，而不是推理痕跡。

**序列遞迴**從 $\mathcal{H}^{(0)} = \mathcal{H}_{0}$ 出發，串接 $k$ 個對比步驟，每一個都以先前的 harness 與累積歷史 $\mathcal{E}^{(r-1)}$ 為條件：

$$\left(\mathcal{H}^{(r)}, e^{(r)}, \xi^{(r)}\right) = \Phi\left(q_{t}, \mathcal{H}^{(r-1)}, \mathcal{E}^{(r-1)}; \mathcal{R}_{t}\right), \qquad r = 1, \ldots, k$$

於是後面的步驟可以保留、修訂，或**修正**前面的改動，因為它同時看到當前與先前的證據。當 $k > 1$，會有一個 agentic selector 把匿名化的交付物與任務需求、來源材料比對；它看不到哪個輸出出自哪個 harness，也不能合成新內容，只能回傳既有的交付物。被採用的 harness 記為 $\mathcal{H}^{\star}_{t}$——星號代表「被採用」，不代表「已驗證最佳」。$k = 1$ 時兩種形式都退化成基本步驟，並跳過選擇。

真正的差別不是「想得更多」。並行買到的是**去相關的證據**：不同的提案面對同一個任務，各自獨立組合。序列買到的是**修正**：後面的步驟可以撤銷一個當時看起來很好、其實不好的編輯。兩者都不會生出正確性訊號——這也解釋了結果為什麼長這樣。

在 WB-code 上，並行遞迴把分數從 $k{=}1$ 的 76.5 拉到 $k{=}5$ 的 80.8；WB-office 從 79.5 到 83.4，兩者都單調上升。baseline 不是這樣：Harness Scaling 在兩個領域都從 $k{=}2$ 退步到 $k{=}3$，ReasoningBank 則是上下震盪。論文自己下的結論是這一節最銳利的一句——*單純增加 test-time 探索，並不保證更好的表現*——而支撐它的事實比保留語氣更強：Harness2 的兩種形式在 $k{=}2$ 時，就已經贏過圖上所有 baseline 在 $k{=}5$ 的成績，兩個領域都成立。

## Harnessing 層級遞迴：教會「改進者」

交付物回傳之後，pipeline 會回顧完整的改進紀錄 $\mathcal{D}_{t}$：參考執行、候選與探測、組合決策、被選中的結果。這個回顧不是自由發揮。它萃取出「哪些改動解決了哪些缺陷、在什麼條件下、帶來什麼後果」的教訓，而且只在有執行對比支持時才留下一條教訓。選出一個輸出，本身不構成「背後那個洞見可以轉移」的證據。

這些教訓加上被採用的 harness，一起進到函式庫：

$$\mathcal{R}_{t+1} = \mathrm{Update}\left(\mathcal{R}_{t}, \mathcal{H}^{\star}_{t}, \mathcal{D}_{t}\right)$$

每一筆條目都是一個可執行的 harness 配上一份 `EXPERIENCE.md`，記載適用情境、教訓與支持證據；另有一份索引，讓後續 session 按需調閱相關條目。下一個任務仍然從共用的 $\mathcal{H}_{0}$ 開始——先前的組件是透過 Propose 選擇性重用或改寫，不會預設繼承。模型權重、階段指令與決策規則固定不變，演化的只有函式庫。

這一層的證據，是我認為整篇論文最有說服力的部分，因為它包含了反例。**直接**精修基礎 harness——沒有參考執行、沒有探測、沒有函式庫——並不會讓它變好：Code 從 73.4 掉到 63.2，Web 從 69.9 掉到 65.0。而以 $k{=}1$ 累積的函式庫能把表現拉回基準；以 $k{=}5$ 累積的函式庫，則讓同一個直接精修變成 Code、Web、Office 上 +0.9、+4.4、+5.1 的進步。更多的任務層級探索，餵出一個更好的改進者，而且在下一輪完全不需要額外的探測。

函式庫也會旅行。一份從 JobBench 長出來的函式庫，讓 WorkBuddy-Bench 的一次性精修在三個領域分別進步 0.6、0.5、2.9 分。把每個任務自己的條目從函式庫移除後重跑（leave-one-out），WorkBuddy-Bench 從 77.5 升到 79.4、JobBench 從 36.0 升到 37.7——這是離線的重用測量，看得到後面的任務，不是線上增益的估計。

值得把「到底存了什麼」講精確。把被改動的檔案與精修當下可用的函式庫快照相比，函式庫的來源痕跡出現在 LAB 與 WB-office 的 22%、JobBench 的 47% 的改動檔案中；但只有 2–10% 的檔案保留了至少一半的行數。技能與腳本合計約佔所有編輯的一半。換句話說，這座函式庫更接近**一份帶經驗註記的 diff 先驗**，而不是 checkpoint：它告訴改進者「這類弱點的修法通常長什麼樣、通常在什麼時候有效」，然後讓改進者針對手上的任務重寫一次。

## 結果：一步就已經很多

單一改進步驟（$k{=}1$）讓十二組 benchmark–設定配對全部進步。下表是基準 harness 與 Harness2 走完一步之後的數字。

| 執行模型 · 起始 harness | WorkBuddy-Bench 平均 | JobBench | LAB（Partial） |
| :-- | --: | --: | --: |
| Gemini 3.5 Flash · OpenCode | 72.4 → **77.5**（+5.1） | 31.5 → **36.0**（+4.5） | 79.9 → **81.9**（+2.0） |
| Gemini 3.5 Flash · Codex | 74.5 → **77.5**（+3.0） | 33.9 → **35.3**（+1.4） | 71.6 → **75.6**（+4.0） |
| GLM-5 · OpenCode | 64.2 → **75.7**（+11.5） | 20.6 → **24.2**（+3.6） | 59.6 → **71.4**（+11.8） |
| GLM-5 · Codex | 64.4 → **75.3**（+10.9） | 23.6 → **24.8**（+1.2） | 58.1 → **65.9**（+7.8） |

兩個模式比平均值更值得看。

第一，**較弱的執行模型在 WorkBuddy-Bench 與 LAB 上受益更多**。一步之後，GLM-5 來到 75.7 與 75.3——高於較強的 Gemini 3.5 Flash 在基準 harness 下的 72.4 與 74.5。換句話說，弱模型配上更好的 harness，可以贏過強模型配原廠 harness。JobBench 的排序反了過來：Gemini 進步 4.5，GLM-5 只有 3.6。這提醒我們「harness 決定一切」不是通則，而是看領域。

第二，**遞迴是把增益往外延伸，而不是補救**。$k{=}5$ 的並行遞迴在 WorkBuddy-Bench 再多加 2.9–3.9 分、JobBench 3.0–4.2 分、LAB Partial 2.6–6.7 個百分點。它也縮小了一些起始 harness 之間的落差——JobBench 的 OpenCode–Codex 差距，Gemini 從 2.4 縮到 0.5、GLM-5 從 3.0 縮到 0.5——但不一致：在 WorkBuddy-Bench 上，GLM-5 的差距反而從 0.2 擴大到 1.3。

<figure class="fig">
  <img src="/images/harness2/fig01-overall-performance.png" alt="WorkBuddy-Bench 各領域分數的長條圖，以及分數對遞迴預算的折線圖" loading="lazy" />
  <figcaption><b>圖 1</b> — 左：Gemini 3.5 Flash 在 OpenCode 下、以 $k = 5$ 並行遞迴的 WorkBuddy-Bench 各領域成績；每根長條上方的數字是相對基準 harness 的增益，基準本身以灰色長條呈現。右：WB-code 上分數對遞迴預算 $k$ 的關係——Harness2 單調上升，兩條 baseline 則停滯或搖擺。來源：<a href="https://arxiv.org/html/2610.14224v1/intro_teaser.png">arxiv.org/html/2610.14224v1/intro_teaser.png</a></figcaption>
</figure>

算力帳也老實。把交出最終交付物之前的所有 token 都算進去——執行*加上*改進——Harness2 的兩種設定都落在 JobBench 與 WorkBuddy-Bench 圖上的實證柏拉圖前沿。以 Gemini 3.5 Flash 搭 OpenCode 來說，$k$ 從 1 到 5，相對基準的增益從 JobBench 的 4.5 升到 7.5 分、WorkBuddy-Bench 的 5.1 升到 8.4 分；而 Meta-Harness 在 $k{=}5$ 時用了比 Harness2 更多的算力，換到更低的分數。這不是免費午餐，是更好的匯率。

另外兩個結果把「增益來自 harness，而不是模型藏了什麼能力」這件事收得更緊。**同一個模型同時當執行者與編輯者**時，從 GLM-5 到 Claude Opus 5 五個模型在每個 benchmark 上都進步——Opus 5 分別 +3.3、+5.5、+3.0，GLM-5 單在 LAB 就 +13.7——所以精修並不需要更強的編輯者。而一個為 Gemini 3.5 Flash 精修出來的 harness，**原封不動**轉到別的執行模型也有效：GLM-5 在 Code 上 +17.3（58.5 → 75.8）、Gemini 3.7 Flash +0.3 與 +6.4、Opus 4.8 +2.6 與 +1.1。幅度因執行模型與領域而異，但不會消失。

對上正式產品級的 harness，比較更樸素也更有說服力：在 WorkBuddy-Bench 上，沒有任何一個固定 harness 能在每個領域都贏——Claude Code 在 Code 與 Office 領先，Codex 在 Web 領先——而從 OpenCode 出發的 Harness2，贏過最強的固定對手 4.6、5.8、4.9 分，贏過自己的起點 7.4、8.4、9.4 分。

## 消融實驗：增益到底掛在哪些零件上

消融在 $k{=}1$、Gemini 3.5 Flash 搭 OpenCode 下執行，讓每個組件與 test-time 預算隔離開。第一組拆的是整個機制：函式庫、有範圍設定的編輯角色、以及組合。

| 設定 | WorkBuddy-Bench | JobBench |
| :-- | --: | --: |
| Harness2 | 77.5 | 36.0 |
| 移除函式庫 | 74.4（−3.1） | 34.2（−1.8） |
| 移除範圍設定 | 74.6（−2.9） | 32.3（−3.7） |
| 移除組合 | 75.9（−1.6） | 34.1（−1.9） |

拿掉**範圍設定**——把不變型與領域型編輯者換成兩個泛用編輯者，候選數量與證據都一樣——會掉 2.9 與 3.7 分。這比拿掉組合（1.6 與 1.9）還多，讓我有點意外：把提案拆成兩個範圍，比後面那個合併步驟更值錢。函式庫值 3.1 與 1.8 分，這和前面「直接精修會退步」的實驗一致：沒有過去精修的記憶，改進者會不停重新發現、有時重新弄壞同一件事。

第二組消融是從「已經改好的」harness 裡刪掉整個組件群，不再重跑改進。這量的是留存組件的價值，而不是 pipeline 補償缺席組件的能力。

<div class="tufte-live-card hx-chart">
  <div class="chart-header">
    <span class="card-tag">EXHIBIT // 消融階梯</span>
    <h4 class="chart-title">技能是最貴的刪除項</h4>
    <p class="chart-sub">WorkBuddy-Bench 平均 · Gemini 3.5 Flash 搭 OpenCode · 並行遞迴 k = 5 · 虛線是基準 harness，不是零</p>
  </div>
  <svg class="hx-svg" viewBox="0 0 820 330" role="img" aria-labelledby="abl-title abl-desc">
    <title id="abl-title">WorkBuddy-Bench 上的消融階梯</title>
    <desc id="abl-desc">點圖。基準 harness 72.4、移除技能 75.5、移除腳本 77.1、移除提示相關組件 79.3、完整 Harness2 80.8。每一個消融後的 harness 都仍在基準之上。</desc>
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
    <text x="150" y="32" font-family="'JetBrains Mono',monospace" font-size="6.5" letter-spacing="0.08em" fill="#8F8E88">分數 · WB 平均（%）</text>
    <text x="276" y="32" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="6.5" letter-spacing="0.08em" fill="#8F8E88">基準 72.4</text>
    <text x="800" y="32" text-anchor="end" font-family="'JetBrains Mono',monospace" font-size="6.5" letter-spacing="0.08em" fill="#8F8E88">相對完整</text>
    <g stroke="#E4E3DC" stroke-width="0.5">
      <line x1="40" y1="96" x2="790" y2="96"></line>
      <line x1="40" y1="152" x2="790" y2="152"></line>
      <line x1="40" y1="208" x2="790" y2="208"></line>
      <line x1="40" y1="264" x2="790" y2="264"></line>
    </g>
    <g font-family="Inter,sans-serif" font-size="9.5" font-weight="600" fill="#4A4944" text-anchor="end">
      <text x="140" y="64">基準 HARNESS</text>
      <text x="140" y="120">移除技能</text>
      <text x="140" y="176">移除腳本</text>
      <text x="140" y="232">移除提示群組</text>
      <text x="140" y="288">HARNESS² · 完整</text>
    </g>
    <g font-family="'JetBrains Mono',monospace" font-size="6.5" fill="#8F8E88" text-anchor="end">
      <text x="140" y="76">未改動的 H0</text>
      <text x="140" y="132">skills/&lt;n&gt;/SKILL.md</text>
      <text x="140" y="188">scripts/&lt;n&gt;.py</text>
      <text x="140" y="244">prompt 相關群組</text>
      <text x="140" y="300">全部組件</text>
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
  <div class="chart-footer">消融階梯 · HARNESS2 表 6 · GEMINI 3.5 FLASH / OPENCODE · K=5 · 三次執行平均</div>
</div>

階梯的形狀是這篇論文最實用的發現。完整 Harness2 平均 80.8。拿掉提示相關群組，還剩 79.3——掉 1.5。拿掉腳本，剩 77.1，掉 3.7，而且集中在 Office（−7.4），那裡多數工作就是確定性地處理數字與檔案。拿掉技能，剩 75.5，掉 5.3，集中在 Code（−3.6）與 Web（−6.9）。真正貢獻「能力」的兩個組件——會計算的腳本、懂流程的技能——比貢獻「指示」的那一組更重。

表格還附帶兩個誠實的保留。每個被消融的 harness 都仍在基準 72.4 之上，所以這裡沒有單一致命點；而論文也明確拒絕宣稱「可加性」。組件之間會互相支撐——技能可以呼叫腳本、外掛可以強制提示只能請求的事——這正是系統該有的樣子。

## 九次退步：還會壞在哪裡

失敗分析規模很小——九個得分低於參考的結果——但比勝利更有用，因為它點名了迴圈會傷人的三種方式。

1. **選擇器可能偏好較弱的候選。** 在 WB-code 上，一個 55 分的輸出被選中，而另一個是 95 分。在 LAB 上，覆蓋面變寬但變淺，讓某個案例從 54 掉到 26。選擇器只判斷匿名化的交付物，不知道它出自哪個 harness；這對公平是對的設計，對「在兩個相似輸出中挑好的那一個」卻是錯的。
2. **錯誤的前提會沿著候選擴散。** 一個字面 key 的要求，或一個沒查證的快取假設，代價是 2–11 分。兩個提案都從同一種任務理解繼承了它，而探測無法分辨「編輯錯了」與「環境不同意」。
3. **結果變異與沒被處理的標準**吃掉剩下的部分。缺漏的評審判定、以及根本沒碰到評分標準的編輯，讓歸因變得困難——這也是論文要求在相信某個效果之前先重複執行的原因。

合起來看，這指出了下一步該改哪裡：選擇要能平衡覆蓋率與精確度、探測要設計成挑戰共同假設而不是確認它、而重複執行應該被當成證據的一級公民。

## 帶走什麼

三個東西經得起懷疑的閱讀。

**把 harness 做成檔案樹。** 這套遞迴之所以可行，是因為每個改動都是對一個具名檔案的 diff。它讓提案有邊界、讓組合有具體的東西可併、讓函式庫有可執行（而非描述性）的條目格式。如果你的 harness 是一個上千行的 prompt builder，這篇論文還不適用於你。

**對比是弱訊號，但仍然值得擁有。** 這條 pipeline 從不宣稱知道答案是對的；它只知道行為相對參考執行移動了、或沒移動。在沒有驗證器的情況下，這樣就足以在編輯之間做選擇——而這正是多數「自我改進 agent」系統默默假設自己已經握有的東西的誠實版本。

**資產是改進紀錄，不是 harness。** 論文最強的證據是：沒有函式庫的直接精修會讓表現*退步*（Code 從 73.4 到 63.2），而同一個改進者在 $k{=}5$ 累積的函式庫幫助下，卻能讓它進步。留下一個 harness，價值低於留下一座可居住的記憶：它曾被怎麼改、以及為什麼。

限制是真的。test-time 算力大約以 $k$ 倍膨脹；選擇是軟肋；前提錯誤會被所有候選共享；而這些 benchmark 雖然專業，也只是開放世界裡的三個領域。論文自己把這些寫了出來，這也是我願意相信那些數字的理由之一。

儘管如此，框架已經移動了。長久以來，harness 是部署前要調的東西，模型才是會變強的東西。Harness2 把 harness 當成要教的對象——而會複利的，是那份教導，不是那個成品。

## 參考資料

- **論文** — Xu, Chen, CuiZhu, Dalvi Mishra, Ming, Yu, Han, Lee, Pfister. *Harness2: Recursive Agent Harnessing for an Open World.* arXiv:2610.14224v1, 2026 年 10 月 9 日。[arxiv.org/abs/2610.14224](https://arxiv.org/abs/2610.14224) · [HTML 版](https://arxiv.org/html/2610.14224v1)
- **程式碼與專案頁** — [github.com/google-research/harness2](https://github.com/google-research/harness2) · [harness2.github.io](https://harness2.github.io/)
- **圖片** — 四張圖版皆取自 HTML 版，保留原色並重新壓縮；檔案位於 `/images/harness2/`。原始網址：[components.png](https://arxiv.org/html/2610.14224v1/components.png)、[intro_teaser.png](https://arxiv.org/html/2610.14224v1/intro_teaser.png)、[harness2_main_new.png](https://arxiv.org/html/2610.14224v1/harness2_main_new.png)、[scaling.png](https://arxiv.org/html/2610.14224v1/scaling.png)。
