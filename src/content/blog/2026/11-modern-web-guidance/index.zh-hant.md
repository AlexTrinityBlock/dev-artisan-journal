---
title: "Modern Web Guidance：讓編碼代理不再錯過現代網頁平台"
description: "實測開源的 Modern Web Guidance 技能與 CLI：用本地搜尋、Baseline 感知的回退方案與公開評測，引導編碼代理採用現代 HTML、CSS 與瀏覽器 API。"
pubDate: 2026-11-22
category: "Web"
tags: ["網頁平台", "Baseline", "編碼代理", "工具鏈", "Chrome"]
featured: false
author: "Alex.Hsiao"
readTime: "9 分鐘"
---

# Modern Web Guidance：讓編碼代理不再錯過現代網頁平台

編碼代理能寫出可運作的程式碼，也能寫出開發者在 2016 年才會寫的程式碼：一個帶有 `role="dialog"` 的 `<div>`、一個掛在 document 上的 Escape 監聽器、一段鎖住頁面捲動的程式，還有一個手工打造的焦點陷阱。

這不是偷懶。訓練資料裡充滿舊有程式碼；即使模型知道較新的 API，也往往缺乏讓 API 真正可用的生產環境模式。代理還會複製周遭儲存庫的慣例。

[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance) 會在代理動手建構的那一刻，把專家撰寫的指南放進它的上下文。它是一組技能加上一個本地 CLI，由 Google Chrome、Microsoft Edge、Mozilla Firefox 與 MDN 團隊共同維護。1.0 版於 [2026 年 11 月 10 日](https://developer.chrome.com/blog/modern-web-guidance-v1) 發布。

## 是技能，不是模型

Modern Web Guidance 不生成程式碼，也不取代你的代理。它給代理一個查詢工具。

[原始碼儲存庫](https://github.com/GoogleChrome/modern-web-guidance-src) 包含指南、CLI、評測框架與校準程式碼。可安裝的技能則放在隔壁的 [`modern-web-guidance`](https://github.com/GoogleChrome/modern-web-guidance) 儲存庫；如果你想貢獻或查證某個說法，這個區別很重要。

技能告訴代理何時該尋求指引。CLI 回傳一份有針對性的 Markdown 檔，裡面有程式模式、瀏覽器支援註記、容易踩的坑與回退方案。這裡沒有微調，程式碼仍然由代理撰寫。

任何支援技能的代理都能使用，包括 Claude Code、Codex 與 Copilot。

## 一行指令安裝

CLI 需要 Node.js 22 或更新版本。在專案目錄中執行：

```bash
npx modern-web-guidance@latest install
```

安裝程式是互動式的，會把技能寫到代理找得到的位置。若你要開發 Chrome 擴充功能，或想自己挑選技能包：

```bash
npx modern-web-guidance@latest install --choose
```

之後用 `npx modern-web-guidance@latest update` 更新。

不安裝也能先瀏覽目錄：

```bash
# Find guides by plain-English query
npx modern-web-guidance@latest search "animate a dialog modal backdrop"

# Print a guide by ID
npx modern-web-guidance@latest retrieve dialog

# Scan a codebase for legacy patterns
npx modern-web-guidance@latest legacy-scan .
```

`search` 會回傳 JSON。以下是精簡後的結果：

```json
[
  {
    "id": "animate-to-from-top-layer",
    "description": "Animate elements such as dialogs, popovers, and tooltips as they're entering/exiting the top layer."
  },
  {
    "id": "dialog",
    "description": "Build a modal or non-modal dialog component that is accessible, manages focus appropriately, and can be dismissed the way users expect on each platform."
  }
]
```

實際指令會回傳十筆。`retrieve` 會印出一份指南，並接受以逗號分隔的清單。

`legacy-scan` 會解析 HTML、CSS、JavaScript、TypeScript、框架元件與 `package.json`。以下是一個小型示範：

```text
Modern Web Guidance Analyzer — .
Found 2 modernization opportunities across 2 guides (scanned 38 guides with deterministic rules; ~20% of the guidance corpus)
Note: Static analysis results are provisional — verify against the Keep/Drop criteria below.

* declarative-dialog-popover-control (1 finding)
  - legacy.html:4
    openBtn.addEventListener('click', () => menu.showPopover());

* form-fields-automatically-fit-contents (1 finding)
  - legacy.html:7
    textarea.style.height = `${textarea.scrollHeight}px`;
```

這是預篩，不是自動修復器。CLI 刻意沒有 `--fix` 旗標。每個發現都附有 `keepWhen` 與 `dropWhen` 準則，代理必須檢查周遭程式碼。

## 檢索迴圈怎麼運作

流程如下：

1. **觸發。** 代理辨識出網頁任務，技能告訴它去查 CLI。
2. **搜尋。** `search` 在本地用離線嵌入模型加 BM25 比對查詢與指南目錄。沒有搜尋 API、沒有 API key，也沒有網路往返。
3. **取用。** 代理呼叫 `retrieve <guide-id>`，得到一份聚焦的指南，而不是一個文件網站。
4. **套用。** 指南只在相關時進入上下文視窗。代理寫程式、跑測試，並對結果負責。

這個套件是自包含的，沒有執行期相依，快取後可用 `npx --offline` 運作。當它要在每個代理工作階段中執行時，低延遲與較小的供應鏈攻擊面很重要。

指南也顧及 token 效率。專案會刪掉模型已經會遵循的建議，讓取回的檔案把 token 花在真正的落差上，而不是一份通用 CSS 教學。

## Modal 實測：自製覆蓋層，還是九行 HTML？

[`dialog` 指南](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/guides/ui-components/dialog.md) 是個好測試：幾乎每個應用都有 modal，而幾乎每個自製 modal 都漏掉同樣的細節。下面的舊有版本有開啟與關閉函式、會還原焦點，也會鎖住頁面。它仍然需要 Escape 處理、焦點陷阱、背景遮罩，以及讓背景 inert。

```html
<div id="confirm" class="modal" role="dialog" aria-modal="true"
     aria-labelledby="confirm-title" hidden>
  <h2 id="confirm-title">Delete this item?</h2>
  <button id="cancel">Cancel</button>
  <button id="delete">Delete</button>
</div>

<script>
  const modal = document.querySelector('#confirm');
  let lastFocused;

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('button').focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    lastFocused?.focus();
  }

  // Wiring omitted. Still missing: Escape, focus trap, inert background, backdrop.
</script>
```

現代版本：

```html
<button type="button" commandfor="confirm" command="show-modal">Delete</button>

<dialog id="confirm" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Delete this item?</h2>
  <form method="dialog">
    <button value="cancel" autofocus>Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
```

在支援 Invoker Commands 的瀏覽器上，這樣就是完整實作：沒有 JavaScript、不用手動還原焦點，也沒有 z-index 或背景遮罩程式碼。再用兩條 CSS 規則完成捲動鎖定：

```css
dialog:modal {
  overscroll-behavior: contain;
}

dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
}
```

瀏覽器會處理自製 modal 常做錯的事：

- 背後的頁面會變成 inert。
- 焦點會留在裡面，並在關閉時回到觸發元素。
- 它會渲染在頂層，並帶有真正的 `::backdrop`。
- Escape、行動裝置返回手勢與對話框語意都由瀏覽器提供。

指南在這裡很明確：不要對原生 modal 加上 `role="dialog"`、`aria-modal`、焦點陷阱、`inert` 切換或 Escape 處理器。重複實作瀏覽器行為，反而可能讓對話框更糟。

它還抓到一個更細微的坑。舊建議是在 `body` 上設 `overflow: hidden`，這會移除根捲軸並造成版面位移。指南用上面兩條規則取代它。Safari 目前尚未強制執行 `overscroll-behavior`，但 modal 仍會困住自己的捲動，頁面也仍然是 inert。

Invoker Commands 於 2025 年 12 月 12 日成為 Baseline 新近可用。如果你的目標瀏覽器更舊，請保留相同標記，並只在 `HTMLButtonElement.prototype` 缺少 `commandForElement` 時載入 [`invokers-polyfill`](https://github.com/keithamus/invokers-polyfill)。

這就是「事實」與「指南」的差別：回退方案、無障礙規則，以及那個捲動 bug。

## 裡面有什麼

截至 2026 年 11 月，README 列出 **262 項現代網頁功能** 與 **204 個使用案例**。六大核心領域是使用者體驗、CSS 版面、效能、表單與 UI、無障礙，以及內建 AI。目錄也涵蓋安全、隱私、passkey、web component、PWA 與 WebMCP。

使用案例很具體：把 dialog 動畫送進頂層、做一張會回應自身寬度的卡片、只在使用者互動後驗證欄位，或加入 passkey 登入。每份指南都是 Markdown，附有可執行片段與限制條件。

掃描器的範圍較窄。我在 2026 年 11 月執行 CLI 1.0.1 時，它回報 **38 份指南** 具有確定性規則，約占整個語料的 20%。一個什麼都標記的掃描器會被忽略，所以規則必須在未見過的儲存庫上通過精確度門檻。

[現代化文件](https://developer.chrome.com/docs/modern-web-guidance/modernization-workflow) 展示了涵蓋範圍：

| 舊有模式 | 現代替代方案 |
| :--- | :--- |
| 用 JavaScript 依 `scrollHeight` 調整 textarea 高度 | CSS `field-sizing: content` |
| 只為了呼叫 `showPopover()` 的點擊監聽器 | `popovertarget` 屬性 |
| `max-height: 9999px` 的手風琴動畫 | `interpolate-size: allow-keywords` 與 `calc-size()` |
| 沒有完整性中繼資料的 CDN script 標籤 | `integrity` 與 `crossorigin="anonymous"` |

技能包有兩個。核心的 `modern-web-guidance` 約 205 個 token，`chrome-extensions` 約 175 個。這些是技能定義的大小，不是每份指南的長度，所以技能可以待在上下文裡，又不會擠掉手上的任務。

## 安全採用是產品的一部分

Modern Web Guidance 具備 Baseline 感知，但 Baseline 不是「到處都能用」的同義詞。

- **設定目標。** 如果 `AGENTS.md` 或 `CLAUDE.md` 沒有指定，工具會預設為 Baseline Widely available。宣告目標會改變代理收到的建議。
- **區分增強與關鍵行為。** 推測性預載可以無聲失敗；對話框控制不行。只有在行為不可或缺時才需要寫回退方案。
- **偏好小型回退。** 少於 50 行、針對個案的回退，或條件式載入的 polyfill，勝過肥大的打包檔。
- **管制不穩定功能。** Origin Trial 與 volatile 指南仍可搜尋，但在你選擇加入之前，`retrieve` 會被擋下。

選擇加入的設定放在專案根目錄的選用檔案 `.mwgrc`，或以 `~/.mwgrc` 作為使用者層級的備援。例如，只允許 Origin Trial 指南：

```bash
npx modern-web-guidance@latest set-allow-origin-trials
```

CLI 會寫入一個小到可以提交進版本控制的 JSON 檔：

```json
{
  "allowOriginTrials": true,
  "allowVolatileFeatures": false
}
```

如果你也想要單一引擎的指南，再執行 `set-allow-volatile-features`。Volatile 指的是在過去三個月內只在一個引擎推出、或仍在穩定的功能。它仍會出現在搜尋中，所以你可以閱讀，但不會被自動採用。代理不該因為找到一份看起來有希望的檔案，就伸手去用單一引擎 API。

## 評測數據撐得住嗎？

專案公開了 [評測儀表板](https://googlechrome.github.io/modern-web-guidance-src/)，並執行每晚 A/B 測試。每個任務都會在啟用與未啟用技能的情況下各跑一次，然後在真實瀏覽器中用 Playwright 評分。評分器檢查行為、樣式、原始碼模式與無障礙狀態，而不是某一種特定實作。

以下是儀表板上每個模型最新的每晚測試結果，日期為 **2026 年 11 月 20 日**：

| 代理與模型 | 配對任務／檢查 | 未引導 → 有引導 | 提升 | 自動無障礙檢查 |
| :--- | :---: | :---: | :---: | :---: |
| Antigravity CLI, Gemini 4 Argon | 228 / 1,955 | 56% → 97% | +41 pp | 54% → 95% |
| Claude Code, Claude Opus 5.5 | 229 / 1,961 | 54% → 94% | +40 pp | 60% → 96% |
| Codex CLI, GPT-6.1 Sol | 229 / 1,961 | 49% → 85% | +36 pp | 60% → 92% |

未引導的代理大約通過一半檢查；有引導的代理通過大多數檢查。無障礙欄位從 54–60% 提升到 92–96%。

幾點提醒：

- 這個基準由專案團隊設計並執行。任務與評分器是開源的，但這是團隊自行執行的評測，不是獨立稽核。
- 提示從來沒有提到 Modern Web Guidance。代理必須自己發現技能適用，所以有引導的一側不是 100%。
- 未引導的基準是 49–56%，所以改善空間很大。你的程式碼庫缺口可能不同。
- 無障礙欄位涵蓋鍵盤、焦點與 `inert`、動態效果與對比、ARIA，以及表單標籤的自動檢查。它不是 WCAG 稽核。

在一個精選的基準上提升 36 到 41 個百分點，說明指南補上了真實缺口。它不保證你下一個 PR 也會進步 40 分。

## 它做不到的地方

Modern Web Guidance 很有用，但不能取代判斷。

**它是精選的，不是完整的。** 兩百個使用案例是很廣的目錄，不是全部；`legacy-scan` 也只涵蓋約 20% 的指南。如果你的問題不在裡面，代理會退回自己的知識。信任它之前，先讀那份指南。

**撰寫指引不等於執行期驗證。** 指南可以解釋 `<dialog>`，但無法證明焦點順序在你的應用裡正常。跑測試，並在瀏覽器中檢查互動。

**Baseline 是互通性，不是普遍支援。** 新近可用代表主要引擎最近都推出了，不保證使用者的瀏覽器已經有。設定目標，並閱讀回退章節。

**代理可能忽略建議。** 檢索只是把指南放進上下文，並不強制執行。評測衡量的是遵循程度，答案是「大多數時候」，不是「總是」。

## 隱私與關閉開關

CLI 預設會傳送匿名遙測：安裝次數、呼叫的代理、指南檢索 ID，以及代理的搜尋查詢。原始使用者提示不會被收集。程式碼在 [`modern-web.ts`](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/src/cli/modern-web.ts)。

若要選擇退出，在 shell 設定檔設定一個環境變數：

```bash
export DISABLE_TELEMETRY=1
```

CLI 快取後仍可離線運作，所以封閉環境可以在第一次安裝後使用 `npx --offline`。

## 這帶來的改變

真正的轉變不是代理會寫 modal，而是平台知識變成一個可以檢查、版本控制、按需取用的檔案；這比微調或把整個文件網站貼進提示，是更小的介入。

對開發者來說，實用流程很短：

1. 安裝技能，並在 `AGENTS.md` 或 `CLAUDE.md` 設定 Baseline 目標。
2. 對一個資料夾執行 `legacy-scan`，不要對整個儲存庫跑。
3. 在接受 diff 之前，讀它取回的指南。
4. 在瀏覽器中驗證結果。

教訓是：撰寫指引與執行期驗證是兩份不同的工作。這裡處理前者；測試、DevTools 與真人審查處理後者。

原始碼在 [GitHub](https://github.com/GoogleChrome/modern-web-guidance-src)。軟體採用 [Apache 2.0](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/LICENSE)，指南採用 [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)。文件：[developer.chrome.com/docs/modern-web-guidance](https://developer.chrome.com/docs/modern-web-guidance)。儀表板：[googlechrome.github.io/modern-web-guidance-src](https://googlechrome.github.io/modern-web-guidance-src/)。

網頁平台已經往前走。這是一個讓代理跟上的實用方法。
