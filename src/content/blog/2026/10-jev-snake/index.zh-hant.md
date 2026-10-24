---
title: "Jev 玩貪食蛇：兩個給決策模型的小介面"
description: "TypeSafe Jev 實作示範：自動播放的檔案櫃、102 步的結構化貪食蛇重播，以及 System One schema 與 OpenAI Decisions API 的並排比較。"
pubDate: 2026-10-18
category: "AI"
tags: ["TypeSafe", "Jev", "OpenAI", "AI", "JavaScript", "Interaction"]
featured: false
author: "Alex.Hsiao"
readTime: "17 min read"
---
# Jev 玩貪食蛇：兩個給決策模型的小介面

**Jev** 是 TypeSafe 的 System One 模型：你送出一個*狀態*與一組具型別的*問題*，它回傳你的程式可以直接分支處理的結構化答案與機率——沒有生成的散文、沒有 JSON 解析，也不必「祈禱 prompt 有用」。

這句話聽起來很容易點頭，卻很難真正體會。所以這篇文章做了兩個小介面，讓那份契約變得看得見。第一個把文件歸檔到資料夾；第二個讓 Jev 操作一局 10 × 9 的貪食蛇，一次一個具型別的移動。兩者都在瀏覽器裡用你自己的 TypeSafe 金鑰執行。

---

## 決策模型，不是聊天機器人

聊天模型產出給人閱讀的文字；Jev 產出給程式消費的決策。這個差別聽起來很哲學，直到你看到回傳的形狀：

| 原語 | 它回答的問題 | 回傳內容 |
| :-- | :-- | :-- |
| **Choice** | 這幾個選項中的哪一個？ | `choice`、`probabilities`、`confidence` |
| **Score** | 這份評分量表的哪一級？ | `score`、`legend`、`probabilities`、`confidence` |
| **Noul** | 這個陳述是否為真？ | `noul`（0–1） |

每個答案都被限制在你提供的選項或等級之內。模型不可能自己發明第六個資料夾，或格線以外的方向。你的程式永遠不需要從一句話裡挖出一個值。

契約的另一半是架構層面的：**流程由程式掌握。** Jev 只在流程中的某一個點提供判斷；要做什麼由程式決定。下面兩個展品正是這個形狀。

> TypeSafe 的文件說得很好：每個問題只請求一個當下的判斷，然後在程式裡組合這些答案。若一個判斷需要多個因素，就把它拆開，自己加權。

## 你的金鑰、你的瀏覽器、你的帳單

這個頁面沒有後端。兩個展品都以 **replay 模式** 開啟：檔案櫃會循環播放預先錄好的結構化答案，貪食蛇棋盤則播放一段用 Jev 錄下的 102 步軌跡。兩者都不需要金鑰或 Worker。

金鑰只用於 **live 模式**。加入之後，它會存在 `localStorage` 的 `jev.key.v1` 底下，且只會送到你選擇的端點。這很方便，同時也是一道真實的安全邊界：任何在此來源上執行的腳本都能讀取 `localStorage`。請使用有消費上限的專用金鑰，實驗結束後就撤銷它。

<div class="chamfer-card-wrapper jev-shell" id="jev-auth">
  <div class="chamfer-card-content jev-shell-inner">
    <div class="jev-ex-head">
      <div>
        <span class="card-tag">OPTIONAL // LIVE MODE</span>
        <h4 class="jev-h4">帶上你自己的 Jev 金鑰</h4>
        <p class="jev-p">下方的 demo 不需要金鑰就能執行。只有當你把某個展品切換到 live 模式時才需要加入。金鑰只留在這個瀏覽器裡；不會提交到 repo，也不會送到本網站的托管端。</p>
      </div>
      <div class="jev-status" id="jev-key-status" data-state="empty" role="status" aria-live="polite">
        <span class="jev-dot" aria-hidden="true"></span>
        <span data-status-text>未設定金鑰</span>
      </div>
    </div>
    <div class="jev-key-row">
      <div class="jev-input-wrap">
        <svg class="jev-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>
        <input class="jev-input" id="jev-key-input" type="password" autocomplete="off" spellcheck="false" placeholder="apikey_..." aria-label="TypeSafe API key" />
        <button class="jev-icon-btn" id="jev-key-toggle" type="button" aria-label="Show key">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
      <button class="mono-btn-chamfer" id="jev-key-save" type="button">
        <span class="chamfer-inner"><span class="btn-tag">AUTH //</span><span class="btn-label">儲存金鑰</span></span>
      </button>
      <button class="jev-text-btn" id="jev-key-test" type="button" disabled>測試連線</button>
      <button class="jev-text-btn" id="jev-key-clear" type="button">忘記金鑰</button>
    </div>
    <div class="jev-transport">
      <label class="jev-label" for="jev-relay-input">RELAY BASE URL</label>
      <input class="jev-input" id="jev-relay-input" type="url" autocomplete="off" spellcheck="false" placeholder="https://your-worker.workers.dev" aria-label="Relay base URL" />
      <span class="jev-hint" id="jev-relay-hint">貼上你的 Cloudflare Worker 的 HTTPS base URL。它會存在這個瀏覽器中。</span>
    </div>
    <div class="jev-endpoint" id="jev-endpoint">ADD A RELAY URL</div>
  </div>
</div>

<div class="jev-error" id="jev-error" hidden role="alert">
  <svg class="jev-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  <div class="jev-error-body">
    <p class="jev-error-title" id="jev-error-title">請求失敗。</p>
    <p class="jev-error-detail" id="jev-error-detail"></p>
    <div class="jev-error-actions">
      <button class="jev-text-btn" id="jev-error-relay" type="button" hidden>Relay URL</button>
    </div>
  </div>
  <button class="jev-error-close" id="jev-error-close" type="button" aria-label="Dismiss error">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </button>
</div>

<p><strong>CORS 的現實檢查。</strong>撰寫本文時，TypeSafe 的 API 只對 <code>https://console.typesafe.ai</code> 回傳 <code>Access-Control-Allow-Origin</code>。位於其他來源的靜態網站無論金鑰多正確，都讀不到直接回應。因此這個 demo 只提供 <strong>Relay</strong> 傳輸：一個由你控制的小型代理。頁面依然是純前端；relay 是傳輸轉接層，不是後端。金鑰從你的瀏覽器送到該 relay，再送到 TypeSafe；它永遠不會經過公開的 CORS proxy。下一節有一個 30 行的 Cloudflare Worker，可以免費部署。若 TypeSafe 日後把你的來源加入白名單，你可以讓 <code>baseUrl()</code> 直接指向 API 並移除 relay。</p>

## 展品 01 — 檔案櫃

第一個展品刻意做得平淡：一份檔案落進共用磁碟，而有人必須選擇資料夾。有趣的地方在於模型需要知道的資訊有多麼少，而程式仍然掌握多少控制權。

它以 **auto demo** 開啟：五個用 `jev-1.13.0` 錄下的答案會在起始資料夾之間循環，其中包含一個 Unknown 案例，且不會呼叫任何 API。想輸入自己的檔案並實際執行時，按 **接手操作**。只要你編輯任何欄位或送出表單，auto demo 就會停止。

狀態是檔名加上選填的摘錄。問題則是對資料夾集合的一個 **Choice**——五個起始資料夾、你新增的自訂資料夾，以及 **Unknown**——再加上一個針對敏感內容的 **Noul**。兩者都在同一次請求中、針對同一個狀態提出，並各自獨立評估。

資料夾管理器是展品的一部分。新增一個資料夾並給它一行描述，那段描述就會成為 `criteria` 評分依據的一部分。自訂資料夾存在 `localStorage`，所以重新載入後仍在；**Reset** 會還原五個起始資料夾。**Unknown** 永遠存在且無法移除。它是誠實的「以上皆非」，讓 Jev 可以拒絕把檔案硬塞進不合適的資料夾。當它選擇 Unknown 時，介面會請你人工檢視該檔案，而不是假裝分類成功。

<div class="chamfer-card-wrapper jev-shell" id="jev-files">
  <div class="chamfer-card-content jev-shell-inner">
    <div class="jev-ex-head">
      <div>
        <span class="card-tag">EXHIBIT // 01 · CHOICE + NOUL</span>
        <h4 class="jev-h4">檔案櫃</h4>
        <p class="jev-p">輸入檔名，若有摘錄就一併填入，讓 Jev 在起始資料夾、你自訂的資料夾或 Unknown 之間選擇。長條代表完整的機率分布。</p>
      </div>
      <div class="jev-status" id="jev-file-status" data-state="working">
        <span class="jev-dot" aria-hidden="true"></span>
        <span id="jev-file-state">DEMO</span>
      </div>
    </div>
    <div class="jev-demo-bar" id="jev-file-demo-bar">
      <div class="jev-demo-main">
        <span class="jev-demo-dot" aria-hidden="true"></span>
        <span class="jev-demo-mode" id="jev-file-demo-mode">AUTO DEMO</span>
        <span class="jev-demo-index" id="jev-file-demo-index">01 / 05</span>
        <span class="jev-demo-dots" id="jev-file-demo-dots" aria-hidden="true">
          <i></i><i></i><i></i><i></i><i></i>
        </span>
      </div>
      <div class="jev-demo-actions">
        <button class="jev-text-btn" id="jev-file-demo-pause" type="button">暫停展示</button>
        <button class="jev-text-btn" id="jev-file-demo-takeover" type="button">接手操作</button>
      </div>
    </div>
    <div class="jev-manual-note" id="jev-file-manual-note" hidden>
      <span class="card-tag">MANUAL //</span>
      <p>Auto demo 已暫停。請在上方加入金鑰，然後分類一份檔案。 <button class="jev-text-btn" id="jev-file-demo-resume" type="button">繼續展示</button></p>
    </div>
    <div class="jev-file-grid">
      <form id="jev-file-form">
        <label class="jev-field">
          <span class="jev-label">FILE NAME</span>
          <input class="jev-input" id="jev-file-name" type="text" value="Q3_invoice_acme_2026.pdf" autocomplete="off" spellcheck="false" placeholder="Q3_invoice_acme_2026.pdf" />
        </label>
        <label class="jev-field">
          <span class="jev-label">EXCERPT <span class="jev-optional">OPTIONAL</span></span>
          <textarea class="jev-textarea" id="jev-file-excerpt" rows="2" placeholder="A sentence or two from the document..."></textarea>
        </label>
        <div class="jev-samples" aria-label="Sample files">
          <button class="jev-sample" type="button" data-sample="invoice">Invoice</button>
          <button class="jev-sample" type="button" data-sample="incident">Incident</button>
          <button class="jev-sample" type="button" data-sample="nda">NDA</button>
          <button class="jev-sample" type="button" data-sample="resume">Resume</button>
        </div>
        <div class="jev-form-actions">
          <button class="mono-btn-chamfer" id="jev-file-submit" type="submit">
            <span class="chamfer-inner"><span class="btn-tag">JUDGE //</span><span class="btn-label">分類檔案</span></span>
          </button>
          <button class="jev-text-btn" id="jev-file-copy" type="button">Copy request</button>
        </div>
      </form>
      <div class="jev-folders" id="jev-folders" aria-live="polite"></div>
    </div>
    <div class="jev-folder-manager">
      <div class="jev-folder-manager-head">
        <span class="jev-label">CUSTOM FOLDERS</span>
        <div class="jev-folder-manager-tools">
          <span class="jev-hint" id="jev-folder-count">0 / 8</span>
          <button class="jev-text-btn" id="jev-reset-folders" type="button" hidden>Reset</button>
        </div>
      </div>
      <form class="jev-folder-add" id="jev-folder-form">
        <input class="jev-input" id="jev-new-folder" type="text" maxlength="32" autocomplete="off" spellcheck="false" placeholder="Folder name" aria-label="Custom folder name" />
        <input class="jev-input" id="jev-new-folder-desc" type="text" maxlength="120" autocomplete="off" spellcheck="false" placeholder="What belongs here? (optional)" aria-label="Custom folder description" />
        <button class="mono-btn-chamfer" id="jev-add-folder" type="submit">
          <span class="chamfer-inner"><span class="btn-tag">ADD //</span><span class="btn-label">Folder</span></span>
        </button>
      </form>
      <div class="jev-custom-list" id="jev-custom-list" aria-live="polite"></div>
    </div>
    <div class="jev-file-result" id="jev-file-result" hidden>
      <div class="jev-file-chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/></svg>
        <span class="jev-file-chip-name" id="jev-file-chip-name"></span>
        <span class="jev-chip-arrow" aria-hidden="true">→</span>
        <span class="jev-chip-folder" id="jev-file-chip-folder"></span>
      </div>
      <div class="jev-unknown-note" id="jev-file-unknown-note" hidden>
        <span class="card-tag">REVIEW //</span>
        <p>沒有合適的資料夾。Jev 選擇了 Unknown，這份檔案應交給人工，或由你新增一個資料夾。</p>
      </div>
      <div class="jev-telemetry" id="jev-file-telemetry"></div>
      <div class="jev-probs" id="jev-file-probs"></div>
    </div>
    <details class="jev-req">
      <summary>Inspect the request</summary>
      <pre id="jev-file-json"></pre>
    </details>
    <div class="jev-foot">STATE = FILE NAME + EXCERPT · QUESTIONS = 1 CHOICE + 1 NOUL · ANSWER = FOLDER + PROBABILITIES + CONFIDENCE · UNKNOWN ALWAYS AVAILABLE · ICONS: LUCIDE (ISC)</div>
  </div>
</div>

### 請求長什麼樣子

整個整合就是一個物件。資料夾名稱是 `criteria` 的鍵；描述則是模型比對的評分依據。`sensitive` 這個問題是「有用的投機」：問它幾乎不花成本，而當它不相關時，程式可以直接忽略。

```json
{
  "model": "jev-latest",
  "state": {
    "file_name": "Q3_invoice_acme_2026.pdf",
    "excerpt": ""
  },
  "questions": {
    "folder": {
      "type": "choice",
      "instructions": "Which folder should this file be filed into? Judge from the file name and any excerpt. Pick the single best folder.",
      "criteria": {
        "Finance": "Invoices, receipts, budgets, payroll, tax, expense reports, financial statements.",
        "Engineering": "Source code, architecture notes, incident reports, API specs, infrastructure, technical documentation.",
        "Legal": "Contracts, NDAs, terms of service, compliance policies, licenses, regulatory filings.",
        "Marketing": "Campaign briefs, ad copy, brand assets, social posts, landing pages, market research.",
        "People": "Resumes, offer letters, performance reviews, onboarding, HR policies, employee records.",
        "Unknown": "No listed folder fits, or the file is too ambiguous to file with confidence."
      }
    },
    "sensitive": {
      "type": "noul",
      "instructions": "Does the file name or excerpt suggest it contains personal, confidential, or regulated data?"
    }
  }
}
```

一個具代表性的回應也同樣精簡：

```json
{
  "model": "jev-1.13.0",
  "answers": {
    "folder": {
      "type": "choice",
      "choice": "Finance",
      "confidence": 1.0,
      "probabilities": {
        "Finance": 1.0,
        "Engineering": 0.0,
        "Legal": 0.0,
        "Marketing": 0.0,
        "People": 0.0,
        "Unknown": 0.0
      }
    },
    "sensitive": { "type": "noul", "noul": 0.66 }
  },
  "usage": { "input_tokens": 495, "output_tokens": 38 }
}
```

沒有解析步驟。`folder.choice` 已經是你提供的鍵之一；`sensitive.noul` 已經是 0 到 1 之間的數字。0.66 值不值得標記為待審，由程式決定——Jev 不做這個政策決定。

## 展品 02 — 由 Jev 操控的貪食蛇

第二個展品比較好玩，也是對契約更嚴格的測試。棋盤是 **10 欄 × 9 列**。你不能操控蛇，每一步都由 Jev 決定。

它以 **structured replay** 開啟：一段用 `jev-1.13.0` 錄下的 102 步軌跡，存成約 20 KB 的 JSON。瀏覽器用種子與錄下的移動重建棋盤，然後從第一步播放到 `GAME OVER`。過程中不需要金鑰、relay 或 API 請求。想用你自己的金鑰對 Jev 執行同樣的迴圈時，按 **切換到 live**。

每一回合送出相同形狀的狀態：

- 全部 90 格的 **compact matrix**，每列一個字串：`0` 空、`1` 蛇頭、`2` 蛇身、`3` 食物。
- 一個把每個數字對應到意義的 **legend**。
- 蛇頭座標、目前方向、食物座標、分數、步數，以及由程式計算出的 **合法移動**。

問題是一個 **Choice**，選項只有合法移動。程式已經把牆與蛇身從動作空間中移除，所以錯誤答案不會因為技術細節而結束遊戲。模型仍然得讀懂格線，並選出朝食物前進的方向。

<div class="chamfer-card-wrapper jev-shell" id="jev-snake">
  <div class="chamfer-card-content jev-shell-inner">
    <div class="jev-ex-head">
      <div>
        <span class="card-tag">EXHIBIT // 02 · CHOICE</span>
        <h4 class="jev-h4">Jev 玩貪食蛇</h4>
        <p class="jev-p">10 × 9 的棋盤。不能用方向鍵。開局時棋盤會先 以 <strong>structured replay</strong> 播放一段用 Jev 錄下的軌跡——102 步，不需要金鑰或 Worker。想自己呼叫 API 就切換到 live 模式；每吃到十顆食物會暫停一次，或按 <strong>執行到底</strong> to skip the gate.</p>
      </div>
      <div class="jev-status" id="jev-snake-status" data-state="working">
        <span class="jev-dot" aria-hidden="true"></span>
        <span id="jev-state">REPLAY</span>
      </div>
    </div>
    <div class="jev-snake-modebar">
      <div class="jev-snake-mode-main">
        <span class="card-tag">MODE //</span>
        <strong id="jev-snake-mode-label">STRUCTURED REPLAY</strong>
        <span id="jev-snake-mode-note">載入軌跡中…</span>
      </div>
      <div class="jev-snake-mode-actions">
        <button class="jev-mode-btn is-active" id="jev-snake-mode-replay" type="button">Watch replay</button>
        <button class="jev-mode-btn" id="jev-snake-mode-live" type="button">切換到 live</button>
      </div>
    </div>
    <div class="jev-snake-grid">
      <div class="jev-board-wrap">
        <div class="jev-board" id="jev-board" role="img" aria-label="10 by 9 Snake board"></div>
        <div class="jev-board-caption">
          <span>GRID 10 × 9</span>
          <span>1 = HEAD</span>
          <span>2 = BODY</span>
          <span>3 = FOOD</span>
        </div>
      </div>
      <div class="jev-snake-panel">
        <div class="jev-telemetry-grid">
          <div><span class="jev-label">SCORE</span><strong id="jev-score">0</strong></div>
          <div><span class="jev-label">STEPS</span><strong id="jev-steps">0</strong></div>
          <div><span class="jev-label">TOKENS</span><strong id="jev-tokens">0</strong></div>
          <div><span class="jev-label">MODEL</span><strong>JEV</strong></div>
        </div>
        <div class="jev-move">
          <span class="jev-label">JEV'S LAST MOVE</span>
          <div class="jev-move-readout">
            <strong id="jev-move-choice">—</strong>
            <span id="jev-move-conf">—</span>
          </div>
          <div class="jev-probs" id="jev-snake-probs"></div>
        </div>
        <div class="jev-matrix-wrap">
          <span class="jev-label">WHAT JEV SEES</span>
          <pre class="jev-matrix" id="jev-matrix"></pre>
          <div class="jev-legend">
            <span><b>0</b> EMPTY</span>
            <span><b>1</b> HEAD</span>
            <span><b>2</b> BODY</span>
            <span><b>3</b> FOOD</span>
          </div>
        </div>
        <div class="jev-snake-replay-actions" id="jev-snake-replay-actions">
          <button class="mono-btn-chamfer" id="jev-snake-replay-play" type="button">
            <span class="chamfer-inner"><span class="btn-tag">PLAY //</span><span class="btn-label">暫停重播</span></span>
          </button>
          <button class="jev-text-btn" id="jev-snake-replay-restart" type="button">Restart</button>
          <button class="jev-text-btn" id="jev-snake-replay-speed" type="button">Speed 4×</button>
          <span class="jev-replay-progress" id="jev-snake-replay-progress">STEP 000 / 102</span>
        </div>
        <div class="jev-snake-actions" id="jev-snake-live-actions" hidden>
          <button class="mono-btn-chamfer" id="jev-snake-start" type="button">
            <span class="chamfer-inner"><span class="btn-tag">RUN //</span><span class="btn-label">開始執行</span></span>
          </button>
          <button class="mono-btn-chamfer" id="jev-snake-auto" type="button">
            <span class="chamfer-inner"><span class="btn-tag">AUTO //</span><span class="btn-label">執行到底</span></span>
          </button>
          <button class="jev-text-btn" id="jev-snake-pause" type="button">Pause</button>
          <button class="jev-text-btn" id="jev-snake-stop" type="button">Stop</button>
          <button class="jev-text-btn" id="jev-snake-reset" type="button">New run</button>
        </div>
        <div class="jev-gate" id="jev-snake-gate" hidden>
          <span class="card-tag">TOKEN BUDGET // 10 FOOD</span>
          <p>Jev 已吃到十顆食物。執行在此暫停，讓你決定是否繼續花費 token。每一步都是一次請求。 <strong>執行到底</strong> 會跳過這道閘門，一路執行到棋盤結束。</p>
          <div class="jev-gate-actions">
            <button class="mono-btn-chamfer" id="jev-snake-continue" type="button">
              <span class="chamfer-inner"><span class="btn-tag">NEXT //</span><span class="btn-label">繼續執行</span></span>
            </button>
            <button class="jev-text-btn" id="jev-snake-auto-gate" type="button">執行到底</button>
            <button class="jev-text-btn" id="jev-snake-end" type="button">結束這局</button>
          </div>
        </div>
        <div class="jev-log" id="jev-snake-log" aria-live="polite"></div>
      </div>
    </div>
    <details class="jev-req">
      <summary>Inspect the current request</summary>
      <pre id="jev-snake-json"></pre>
    </details>
    <div style="margin-top: 10px;">
      <button class="jev-text-btn" id="jev-snake-copy" type="button">Copy current request</button>
    </div>
    <div class="jev-foot">MODE = REPLAY (20 KB TRACE) / LIVE (KEY + RELAY) · STATE = 9 × 10 MATRIX + LEGEND + HEAD + DIRECTION + FOOD + LEGAL MOVES · QUESTION = 1 CHOICE</div>
  </div>
</div>

### 緊湊矩陣

這個矩陣刻意無聊。一個有 90 個具名欄位的 JSON 物件對人可讀，對模型卻是噪音；9 列、每列 10 個字元的陣列則緊湊、無歧義、也容易記錄。以下是遊戲中一個真實的狀態：

```json
{
  "grid": [
    "0000000000",
    "0000000000",
    "0000000000",
    "0000000000",
    "1221003000",
    "0000000000",
    "0000000000",
    "0000000000",
    "0000000000"
  ],
  "legend": { "0": "empty", "1": "snake head", "2": "snake body", "3": "food" },
  "head": { "row": 4, "col": 3 },
  "direction": "right",
  "food": { "row": 4, "col": 7 },
  "score": 0,
  "steps": 0,
  "legal_moves": ["up", "right", "down"]
}
```

指示文字告訴 Jev 座標慣例——第 0 列在最上方、第 0 欄在最左側，向右增加欄、向下增加列——並要求它只能從 `legal_moves` 中選擇。在這個棋盤上，它選擇朝食物前進的 `right`，信心約 0.95。當食物在蛇的背後時，它必須轉向；矩陣讓蛇身可見，而合法移動集合則讓它保持誠實。

<blockquote><p><strong>設計註記：</strong>動作空間是在程式裡過濾的，不是在 prompt 裡。這就是「流程由程式掌握」原則的縮影。Jev 選擇方向；程式保證該方向合法。模型做的是判斷，不是記帳。</p></blockquote>

### 為什麼跑到十分就暫停

在 **live 模式** 下，每一步都是一次請求。Jev 很便宜——輸入每十億 token 42 美元，輸出免費——但「便宜」不等於「免費」，長時間執行會累積。這個棋盤上典型的一步約 600 個輸入 token。一局十顆食物的遊戲通常是 60–100 步，所以大約是 36,000–60,000 個輸入 token，以目前價格約 0.0015–0.0025 美元。在十分食物處暫停是一道預算閘門，不是技術限制：你可以繼續、結束，或先停下來檢查矩陣。replay 沒有閘門，它已經付過錢了。

**執行到底** 是刻意的繞道。它維持同一個迴圈，但忽略十分閘門，只在遊戲結束、棋盤填滿、發生錯誤或按下 **Stop** 時停止。這個按鈕與 **開始執行** 分開，是因為跳過預算閘門應該是自覺的選擇，而不是預設行為。如果你想不點每一次閘門就觀察模型行為，就用它；如果你想在每個里程碑檢查矩陣，就留在手動執行。

這道閘門也提供了一個觀察模型行為的自然位置。它走了最短路徑嗎？它被自己的身體困住了嗎？錯誤發生前信心有下降嗎？當你在自己的資料上評估一個決策模型時，這些才是值得問的問題。

## 兩者背後的同一個模式

兩個展品看起來毫不相關，但它們共享同樣的四個動作：

| 動作 | 檔案櫃 | 貪食蛇 |
| :-- | :-- | :-- |
| **限制答案** | 資料夾鍵 + Unknown | 只有合法方向 |
| **只給相關狀態** | 檔名 + 摘錄 | 矩陣 + legend + 蛇頭 + 食物 |
| **提出獨立問題** | 一次呼叫問資料夾 + 敏感度 | 每次呼叫一個移動，因為棋盤會變 |
| **把政策留在程式裡** | 如何處理 `sensitive` | 過濾非法移動與 token 閘門 |

第二列是多數基於 prompt 的系統出錯的地方。更多上下文不會自動更好。Jev 自己的文件就把「塞滿無關細節的巨大狀態」列為失敗模式：無關素材會變成干擾，準確率隨之下降。解法是在送出請求前，於程式中過濾並結構化。

第四列是讓系統可測試的關鍵。模型回傳機率分布；程式決定閾值、備援方案與人工升級路徑。當政策改變時，你改的是程式裡的一個數字——不是 prompt 裡的一段話。

## 同一個想法的兩套 schema

上面的展品使用 TypeSafe 的 **[System One](https://docs.typesafe.ai/concepts/system-one)** schema。截至 2026 年 10 月，同一件事有了第二套公開 schema：OpenAI 的 **[Decisions API](https://developers.openai.com/api/docs/guides/decisions)**。兩者接近到可以逐欄比較，也差異到足以讓比較釐清「決策模型 API」究竟是什麼。

System One 不只是 Jev 的私有請求內容。Cloudflare 的 **[Clef](https://developers.cloudflare.com/workers-ai/models/clef)** 與 **Clef-flash** 實作了相同形狀——`state`、一個 `questions` map，以及帶 `criteria` 的 `noul` / `choice` / `score` 原語——並加上多模態擴充。這讓 System One 成為實務意義上的 schema：不只一個模型能說它。OpenAI 的 Decisions API 則是第二套 schema，由單一端點、目前由單一模型提供。

### 並排比較

<div class="api-spec chamfer-card-wrapper dark">
  <div class="chamfer-card-content">
    <div class="api-spec-head">
      <div>
        <span class="card-tag">SPEC MATRIX // DECISION PROTOCOLS</span>
        <h3 class="api-spec-title">Two contracts, one typed answer</h3>
        <p class="api-spec-sub">兩個端點都回傳機率而不是散文。真正的分歧在線路格式。</p>
      </div>
      <div class="api-spec-status" aria-label="Public docs, 2026-10-18">
        <span class="api-spec-dot" aria-hidden="true"></span>
        <span>PUBLIC DOCS<br>2026-10-18</span>
      </div>
    </div>
    <div class="api-spec-endpoints">
      <div class="api-endpoint">
        <span class="api-endpoint-tag">S1 // SYSTEM ONE</span>
        <code class="api-endpoint-path">POST /v1/systemone</code>
        <span class="api-endpoint-flow">
          <span class="api-flow-node">state</span><span class="api-flow-arrow">→</span>
          <span class="api-flow-node">questions{}</span><span class="api-flow-arrow">→</span>
          <span class="api-flow-node">answers{}</span>
        </span>
      </div>
      <div class="api-endpoint is-openai">
        <span class="api-endpoint-tag">OA // DECISIONS</span>
        <code class="api-endpoint-path">POST /v1/decisions</code>
        <span class="api-endpoint-flow">
          <span class="api-flow-node">input</span><span class="api-flow-arrow">→</span>
          <span class="api-flow-node">questions[]</span><span class="api-flow-arrow">→</span>
          <span class="api-flow-node">answers[]</span>
        </span>
      </div>
    </div>
    <div class="api-spec-scroll">
      <table class="api-spec-table">
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">System One <span class="api-table-note">Jev / Clef</span></th>
            <th scope="col">OpenAI Decisions <span class="api-table-note">GPT-6 Luna</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Evidence</th>
            <td><code>state</code> — string, object, or array</td>
            <td><code>input</code> — string, messages, or images</td>
          </tr>
          <tr>
            <th scope="row">Modality</th>
            <td>Jev: text. Clef: text / JSON / image / video.</td>
            <td>Text + image</td>
          </tr>
          <tr>
            <th scope="row">Questions</th>
            <td>Map keyed by ID. The key is not sent.</td>
            <td>Array. Optional <code>name</code> is echoed.</td>
          </tr>
          <tr>
            <th scope="row">Yes / no</th>
            <td><code>noul</code> → <code>noul</code></td>
            <td><code>predicate</code> → <code>probability</code></td>
          </tr>
          <tr>
            <th scope="row">Choice</th>
            <td><code>choice</code> + <code>probabilities{}</code> + <code>confidence</code></td>
            <td><code>choice</code> + <code>probabilities[]</code> + <code>confidence</code></td>
          </tr>
          <tr>
            <th scope="row">Score</th>
            <td><code>score</code> + <code>legend</code> + <code>probabilities{}</code> + <code>confidence</code></td>
            <td><code>score</code> + <code>probabilities[]</code> + <code>confidence</code></td>
          </tr>
          <tr>
            <th scope="row">Options</th>
            <td><code>criteria</code> — map / array / object</td>
            <td><code>choices[]</code> or <code>levels[]</code></td>
          </tr>
          <tr>
            <th scope="row">Instructions</th>
            <td>Required. String / object / array.</td>
            <td>Required. String.</td>
          </tr>
          <tr>
            <th scope="row">Answers</th>
            <td><code>answers{}</code> keyed by ID</td>
            <td><code>answers[]</code> in question order</td>
          </tr>
          <tr>
            <th scope="row">Refusal</th>
            <td>No answer type. Threshold in code.</td>
            <td>Per-question <code>refusal</code>; optional <code>safety_identifier</code>.</td>
          </tr>
          <tr>
            <th scope="row">Limits</th>
            <td>64k / request; 32k / question; 262k long context.</td>
            <td>1–200 questions; 2–255 choices.</td>
          </tr>
          <tr>
            <th scope="row">Model</th>
            <td>Jev 1.13 / 1.14 + Clef</td>
            <td>GPT-6 Luna (public beta)</td>
          </tr>
          <tr>
            <th scope="row">Price</th>
            <td>$0.042 / 1M input; output free</td>
            <td>$0.10 / 1M input; no output or cache charge</td>
          </tr>
          <tr>
            <th scope="row">Adoption</th>
            <td>Jev + Clef / Clef-flash</td>
            <td>OpenAI endpoint only</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="api-spec-swipe" aria-hidden="true">SWIPE TABLE →</div>
    <div class="api-spec-foot">
      <span>MONO / HAIRLINE 0.7PX</span>
      <span>SCHEMA DRIFT: CHECK DOCS</span>
      <span>JEV · CLEF · GPT-6 LUNA</span>
    </div>
  </div>
</div>

有兩列值得修正這個比較的「民間版本」。第一，**兩套 schema 都需要 `instructions`**。真正的差別在選項放在哪裡：System One 放在 `criteria`，OpenAI 放在 `choices` 或 `levels`。第二，OpenAI 的 `predicate` **不會**回傳獨立的「條件指標」；它回傳 `{ type, name, probability }`，條件本身活在 `instructions` 字串裡。那個統計物件與 `noul` 是同一回事。

### 兩邊都問同樣的三個問題

以下是在 System One 中的一個客服工單決策。狀態是結構化物件，問題以 ID 為鍵：

<div class="api-console">
  <div class="api-console-bar">
    <span class="api-console-title">REQUEST // SYSTEM ONE</span>
    <span class="api-console-meta">POST /v1/systemone · JSON</span>
  </div>
  <div class="api-console-body">

```json title="System One — POST /v1/systemone"
{
  "model": "jev-latest",
  "state": {
    "message": "I was charged twice for order A-104. Please refund the duplicate.",
    "order_id": "A-104"
  },
  "questions": {
    "department": {
      "type": "choice",
      "instructions": "Which team should handle this message?",
      "criteria": {
        "billing": "Payments, invoices, and refunds.",
        "technical": "Bugs, outages, and integrations.",
        "shipping": "Delivery and tracking.",
        "other": "None of the above."
      }
    },
    "refund_requested": {
      "type": "noul",
      "instructions": "Does the customer explicitly request a refund?"
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated is the customer?",
      "criteria": ["Calm", "Frustrated but civil", "Very angry"]
    }
  }
}
```

</div>
  <div class="api-console-foot"><span>STATE → QUESTIONS{}</span><span>APPLICATION/JSON</span></div>
</div>

而這是在 OpenAI Decisions 格式中的同一個決策。證據是訊息形狀，問題是陣列，每個問題都帶有一個 name：

<div class="api-console">
  <div class="api-console-bar">
    <span class="api-console-title">REQUEST // OPENAI DECISIONS</span>
    <span class="api-console-meta">POST /v1/decisions · JSON</span>
  </div>
  <div class="api-console-body">

```json title="OpenAI Decisions — POST /v1/decisions"
{
  "model": "gpt-6-luna",
  "input": "Order A-104: I was charged twice. Please refund the duplicate.",
  "questions": [
    {
      "type": "choice",
      "name": "department",
      "instructions": "Which team should handle this message?",
      "choices": [
        { "value": "billing", "description": "Payments, invoices, and refunds." },
        { "value": "technical", "description": "Bugs, outages, and integrations." },
        { "value": "shipping", "description": "Delivery and tracking." },
        { "value": "other", "description": "None of the above." }
      ]
    },
    {
      "type": "predicate",
      "name": "refund_requested",
      "instructions": "Does the customer explicitly request a refund?"
    },
    {
      "type": "score",
      "name": "frustration",
      "instructions": "How frustrated is the customer?",
      "levels": [
        { "label": "Calm", "description": "Neutral, matter-of-fact." },
        { "label": "Frustrated but civil", "description": "Annoyed, still constructive." },
        { "label": "Very angry", "description": "Hostile or threatening to leave." }
      ]
    }
  ]
}
```

</div>
  <div class="api-console-foot"><span>INPUT → QUESTIONS[]</span><span>APPLICATION/JSON</span></div>
</div>

兩個回應分別對應兩種收集風格：

<div class="api-console">
  <div class="api-console-bar">
    <span class="api-console-title">RESPONSE // SYSTEM ONE</span>
    <span class="api-console-meta">200 OK · ANSWERS{}</span>
  </div>
  <div class="api-console-body">

```json title="System One — response"
{
  "model": "jev-1.13.0",
  "answers": {
    "department": {
      "type": "choice",
      "choice": "billing",
      "confidence": 0.93,
      "probabilities": {
        "billing": 0.95,
        "technical": 0.02,
        "shipping": 0.01,
        "other": 0.02
      }
    },
    "refund_requested": { "type": "noul", "noul": 0.98 },
    "frustration": {
      "type": "score",
      "score": 1.1,
      "legend": {
        "0": "Calm",
        "1": "Frustrated but civil",
        "2": "Very angry"
      },
      "probabilities": { "0": 0.1, "1": 0.7, "2": 0.2 },
      "confidence": 0.55
    }
  },
  "usage": { "input_tokens": 420, "output_tokens": 40 }
}
```

</div>
  <div class="api-console-foot"><span>KEYED BY QUESTION ID</span><span>PROBABILITY DISTRIBUTION</span></div>
</div>

<div class="api-console">
  <div class="api-console-bar">
    <span class="api-console-title">RESPONSE // OPENAI DECISIONS</span>
    <span class="api-console-meta">200 OK · ANSWERS[]</span>
  </div>
  <div class="api-console-body">

```json title="OpenAI Decisions — response"
{
  "model": "gpt-6-luna",
  "answers": [
    {
      "type": "choice",
      "name": "department",
      "choice": "billing",
      "confidence": 0.93,
      "probabilities": [
        { "value": "billing", "probability": 0.95 },
        { "value": "technical", "probability": 0.02 },
        { "value": "shipping", "probability": 0.01 },
        { "value": "other", "probability": 0.02 }
      ]
    },
    {
      "type": "predicate",
      "name": "refund_requested",
      "probability": 0.98
    },
    {
      "type": "score",
      "name": "frustration",
      "score": 1.1,
      "confidence": 0.55,
      "probabilities": [
        { "value": 0, "label": "Calm", "probability": 0.1 },
        { "value": 1, "label": "Frustrated but civil", "probability": 0.7 },
        { "value": 2, "label": "Very angry", "probability": 0.2 }
      ]
    }
  ],
  "usage": { "input_tokens": 420 }
}
```

</div>
  <div class="api-console-foot"><span>ORDERED BY QUESTIONS[]</span><span>PROBABILITY DISTRIBUTION</span></div>
</div>

這些數值只是示意，形狀才是重點。

### 表格藏起來的事

**`state` 是證據形狀；`input` 是訊息形狀。** System One 直接接受 JSON 物件或陣列，所以一張工單紀錄與其政策可以作為結構化資料傳遞。OpenAI 的 `input` 是字串或訊息陣列；結構化證據必須序列化成文字或 content part。如果你的狀態本來就是一筆紀錄，System One 對你的程式要求較少。如果你的狀態是圖片或對話，Decisions API 更自然。

**map 鍵 vs 陣列名稱。** System One 的問題鍵是給你的程式用的；模型永遠看不到它。OpenAI 的 `name` 是問題物件的一部分，會在答案中被回顯，而答案依問題順序抵達。兩者都容易對應到程式，但失敗方式不同：System One 少了鍵是查表落空；OpenAI 少了 name 則是陣列位置，你只能相信順序。

**`criteria` vs `choices` / `levels`。** System One 把評分依據壓進 `criteria`：Choice 用 map、Score 用有序陣列、Noul 用選填的 `{true, false}` 物件。OpenAI 把選項攤開：`choices` 是 `{value, description}` 陣列，`levels` 是 `{label, description}` 陣列。後者更囉唆，但讓 choice 的值可以是布林，並把標籤與值分開。兩套 schema 仍然都需要 `instructions`。

**`noul` vs `predicate`。** 同一個想法，不同欄位名。兩者都回傳該陳述為真的一個機率。TypeSafe 叫它 `noul`，OpenAI 叫它 `probability`。兩者都沒有為這個原語另外提供 confidence 欄位，因為那個機率本身就是不確定性。

**拒答是一個通道，不是一個機率。** OpenAI 可以針對單一問題回傳 `refusal` 答案，而同一請求中的其他問題仍可作答。它還接受選填的 `safety_identifier`——一個由呼叫方提供、綁定在已驗證組織範圍內的不透明終端使用者 ID。System One 沒有專屬的拒答答案型別；你把護欄表達成 Noul 問題，並在程式中決定如何處理那個機率與信心。這是一個真實的架構選擇：OpenAI 給你一條拒答通道，TypeSafe 給你一個可以設閾值的數字。

**物件回傳 vs 陣列回傳。** System One 以你的問題 ID 作為答案的鍵，所以順序無關。OpenAI 依問題陣列的相同順序回傳答案，以 `name` 作為穩定識別。兩者都為 Choice 與 Score 回傳完整機率分布。System One 的 Score 答案包含 `legend`；OpenAI 的 Score 機率則在每個項目上帶 `label` 與 `value`。

**價格與模態。** Jev 定價為每 100 萬輸入 token 0.042 美元，輸出免費；GPT-6 Luna Decisions 為每 100 萬輸入 token 0.10 美元，且不收取輸出或快取費用。分詞方式與請求大小不同，所以請用自己的工作負載比較，而不是把牌價相乘。更大的差異在輸入：Jev 1.13 只支援文字，而 Decisions API 接受圖片，Clef 則把 System One 的形狀擴展到圖片與影片。

**採用度與可攜性。** System One 有不只一個實作：Jev 與 Cloudflare 的 Clef/Clef-flash。OpenAI 的 Decisions API 是單一廠商端點，目前只有一個模型。如果你想讓同一套 schema 在換模型後依然存活，System One 是更可攜的契約；如果你要 OpenAI 的模型與影像處理，Decisions 是直接的路。

### 該用哪一個？

- **用 System One**：當證據是結構化 JSON、工作負載偏文字、你想在單次請求中問多個獨立問題，且想要可設閾值的校準機率時。若你希望同一套 schema 能跑在 Jev 或 Clef 上，它也更合適。
- **用 OpenAI Decisions**：當你需要文字加圖片、你已經在 OpenAI SDK 生態系裡，或你需要 `safety_identifier` 與逐題 `refusal` 的語意時。
- **兩者都不要當成你的控制流程。** 兩者都只回傳決策；路由、閾值、重試與人工升級路徑仍應由你的程式掌握。schema 決定答案的形狀，不是政策。

兩種格式在線路上並不相容，但接近到可以正規化。一個小轉接層就能對應 `state` ↔ `input`、問題 map ↔ 陣列、`noul` ↔ `predicate`；其餘只是欄位改名。有些 API gateway 已經在同一條路徑後面同時暴露兩種形狀。那是相容層，不是標準。

在定案任何一邊之前有一個提醒：OpenAI 的 Decisions API 仍在公開 beta，目前只接受 `gpt-6-luna`；TypeSafe 的 Jev 在 1.13/1.14；Clef 則是開放權重模型，有自己的限制與價格。上表反映的是 **2026-10-18** 的公開文件。在你的程式庫裡凍結 schema 之前，請先確認目前的文件。

## 自己跑一次

HTTP API 只有一個端點：

```bash
curl https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": { "file_name": "Q3_invoice_acme_2026.pdf" },
    "questions": {
      "folder": {
        "type": "choice",
        "instructions": "Which folder should this file be filed into?",
        "criteria": {
          "Finance": "Invoices, budgets, tax, payroll.",
          "Engineering": "Code, incidents, specs, infrastructure.",
          "Legal": "Contracts, NDAs, compliance.",
          "Marketing": "Campaigns, copy, brand assets.",
          "People": "Resumes, reviews, HR records."
        }
      }
    }
  }'
```

### replay 軌跡

這個頁面上的 replay 是一個 JSON 檔，不是影片。大約 20 KB：

```json
{
  "source": "jev",
  "model": "jev-1.13.0",
  "seed": 20261018,
  "outcome": { "state": "GAME OVER", "score": 12, "steps": 102, "inputTokens": 64954 },
  "steps": [
    { "step": 1, "move": "right", "confidence": 0.31, "probabilities": { "up": 0.46, "right": 0.54, "down": 0 }, "input_tokens": 645 }
  ]
}
```

每一步只儲存決策：方向、信心、機率與輸入 token。棋盤由種子、固定規則與移動清單確定性地重建，所以檔案不需要存 102 份 90 格矩陣。

用你自己的金鑰產生：

```bash
TYPESAFE_API_KEY=... bun run record:snake
```

這支腳本直接從 Node 呼叫 `/v1/systemone`——沒有 CORS、沒有 Worker、沒有瀏覽器金鑰。它寫入 `public/data/jev-snake-replay.json`，且從不儲存金鑰。如果你只想要一份版面用的 fixture，`bun run record:snake:mock` 會產生腳本化的軌跡；頁面會將它標示為 `SCRIPTED REPLAY`。

提交進 repo 的軌跡是以 `jev-1.13.0` 錄製：102 步、12 顆食物、64,954 個輸入 token。訪客不需要金鑰或 relay 就能重播。下方的 live 模式則沒有改變，仍然兩者都需要。

### 自己控制的 relay

部署後的頁面需要 relay，因為 CORS 白名單。部署一個小小的；這個 Cloudflare Worker 只轉發兩條路徑，並把 CORS 白名單收得很緊：

```js
export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "https://blog.alextrinitywolf.com";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, content-type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin"
    };

if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

const url = new URL(request.url);
    if (url.pathname !== "/v1/systemone" && url.pathname !== "/v1/models") {
      return new Response("Not found", { status: 404, headers: cors });
    }

const upstream = await fetch("https://api.typesafe.ai" + url.pathname, {
      method: request.method,
      headers: {
        authorization: request.headers.get("authorization") || "",
        "content-type": request.headers.get("content-type") || "application/json"
      },
      body: request.method === "GET" ? undefined : await request.text()
    });

return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...cors,
        "content-type": upstream.headers.get("content-type") || "application/json"
      }
    });
  }
};
```

把 `ALLOWED_ORIGIN` 設成你自己的來源。relay 會看到 `Authorization` 標頭，所以請自行托管、把白名單收窄、且不要記錄請求內容。這不是公開的 CORS proxy，而是一小塊你擁有的基礎設施。

部署完成後，把 `https://your-worker.workers.dev` 貼到頁面的 Relay 欄位（只要 base，不要 `/v1/systemone`），然後按 **測試連線**。

本機開發時，同樣的想法用 Bun 寫：

```ts
const ALLOW = "http://localhost:4321";

Bun.serve({
  port: 8787,
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOW,
      "Access-Control-Allow-Headers": "authorization, content-type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    };

if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

const url = new URL(request.url);
    const upstream = await fetch("https://api.typesafe.ai" + url.pathname, {
      method: request.method,
      headers: {
        authorization: request.headers.get("authorization") || "",
        "content-type": request.headers.get("content-type") || "application/json"
      },
      body: request.method === "GET" ? undefined : await request.text()
    });

return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...cors,
        "content-type": upstream.headers.get("content-type") || "application/json"
      }
    });
  }
});
```

用 `bun run relay.ts` 執行，接著把 `http://localhost:8787` 貼到頁面的 Relay 欄位。這個本機 HTTP relay 只用於開發：HTTPS 頁面無法呼叫 loopback 的 HTTP relay（瀏覽器會封鎖私有位址空間），所以部署後的網站請用 HTTPS Worker。

> **不要為此使用公開的 CORS proxy。** 它會在你的 `Authorization` 標頭裡收到金鑰。自己控制的 relay 是這個模式裡我唯一願意上線的版本。

## 實戰筆記

- **模型版本。** `jev-latest` 目前解析到 `jev-1.13.0`。Jev 1.14.0 可透過 `jev-preview` 或其版本化 ID 取得。若要調整信心閾值，請固定使用版本化 ID 並刻意切換。
- **語言。** 英文是主要訓練語言。Jev 接受其他語言（包括中日韓），但準確率較低。在依賴它之前，請用自己的內容測試。
- **字面解讀。** Jev 回答的是你寫下的問題，不是你想問的問題。邊界案例要放進 `criteria`；若一個判斷需要多個獨立因素，就把它拆開。
- **數字與日期。** 算術、計數與日期比較留在程式裡。Jev 用來抽取或判斷，不用來計算。
- **成本。** 輸入每十億 token 42 美元；輸出 token 免費。貪食蛇的一步是幾百個輸入 token，所以十顆食物的閘門主要是紀律問題，不是價格問題。
- **安全。** 這個 demo 的金鑰存在 `localStorage`。使用有範圍限制的金鑰、結束後撤銷、絕不提交。用來驗證本文的測試金鑰不在 repo 裡。

兩個展品的重點不是模型會玩貪食蛇，而是模型能在流程中的特定點回傳一個**具型別的決策**，而系統其餘部分仍然是一般的程式。那是一個比「生成一個答案，然後祈禱它解析得動」小得多、也可測試得多的介面。

如果你要用它做東西，文件在 [docs.typesafe.ai](https://docs.typesafe.ai)，而 [TypeSafe Playground](https://console.typesafe.ai/playground) 是寫整合之前，先試一個狀態與幾個問題的好地方。

<style>
.jev-shell {
  margin: 28px 0;
  background: var(--mono-grid);
}

.jev-shell .chamfer-card-content {
  padding: 22px 20px 18px;
}

.jev-shell-inner {
  min-width: 0;
}

.jev-h4 {
  margin: 4px 0 5px;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--mono-ink);
}

.jev-shell .jev-p {
  margin: 0 0 14px;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--mono-muted);
}

.jev-shell .jev-label {
  display: block;
  font-family: var(--mono-font-mono);
  font-size: 9px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--mono-muted);
}

.jev-shell .jev-optional {
  color: var(--mono-faint);
  letter-spacing: 0.08em;
}

.jev-ex-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.jev-ex-head > div {
  min-width: 0;
}

.jev-kicker {
  display: block;
  font-family: var(--mono-font-mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--mono-faint);
  text-transform: uppercase;
  margin-bottom: 3px;
}

.jev-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding-top: 2px;
  font-family: var(--mono-font-mono);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--mono-muted);
  text-transform: uppercase;
}

.jev-ex-head .jev-status > span:last-child {
  display: inline-block;
  width: 128px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}

.jev-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--mono-faint);
}

.jev-status[data-state="ready"] .jev-dot,
.jev-status[data-state="ok"] .jev-dot {
  background: var(--mono-ink);
}

.jev-status[data-state="working"] .jev-dot {
  background: var(--mono-ink);
  animation: jev-blink 1s steps(2, end) infinite;
}

.jev-status[data-state="error"] .jev-dot {
  background: transparent;
  border: 0.8px solid var(--mono-ink);
}

.jev-key-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
  flex-wrap: wrap;
}

.jev-input-wrap {
  position: relative;
  flex: 1 1 260px;
  min-width: 0;
}

.jev-input-wrap .jev-input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  width: 14px;
  height: 14px;
  transform: translateY(-50%);
  color: var(--mono-muted);
  pointer-events: none;
}

.jev-input-wrap .jev-input {
  padding-left: 32px;
}

.jev-input,
.jev-textarea {
  width: 100%;
  background: var(--mono-paper);
  border: 0.7px solid var(--mono-grid);
  border-radius: 3px;
  padding: 9px 11px;
  color: var(--mono-ink);
  font-family: var(--mono-font-mono);
  font-size: 12px;
  line-height: 1.45;
  outline: none;
  transition: border-color 150ms ease;
}

.jev-input::placeholder,
.jev-textarea::placeholder {
  color: var(--mono-faint);
}

.jev-input:focus,
.jev-textarea:focus {
  border-color: var(--mono-ink);
}

.jev-textarea {
  min-height: 58px;
  resize: vertical;
}

.jev-icon-btn {
  position: absolute;
  right: 4px;
  top: 50%;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: var(--mono-muted);
  cursor: pointer;
  border-radius: 2px;
}

.jev-icon-btn svg {
  width: 14px;
  height: 14px;
}

.jev-icon-btn:hover,
.jev-icon-btn.is-on {
  color: var(--mono-ink);
}

.jev-text-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 0;
  border: 0;
  border-bottom: 0.7px solid transparent;
  background: transparent;
  color: var(--mono-muted);
  font-family: var(--mono-font-mono);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 150ms ease, border-color 150ms ease;
}

.jev-text-btn:hover {
  color: var(--mono-ink);
  border-bottom-color: var(--mono-ink);
}

.jev-text-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  border-bottom-color: transparent;
}

.jev-transport {
  display: grid;
  gap: 5px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 0.7px dashed var(--mono-grid);
}

.jev-transport .jev-input {
  width: 100%;
}

.jev-hint,
.jev-endpoint {
  font-family: var(--mono-font-mono);
  font-size: 9px;
  line-height: 1.5;
  letter-spacing: 0.04em;
  color: var(--mono-faint);
}

.jev-endpoint {
  color: var(--mono-muted);
  word-break: break-all;
}

.jev-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: -14px 0 24px;
  padding: 12px 14px;
  border: 0.7px solid var(--mono-ink);
  background: var(--mono-paper);
}

.jev-error-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--mono-ink);
  margin-top: 1px;
}

.jev-error-body {
  flex: 1;
  min-width: 0;
}

.jev-error .jev-error-title {
  margin: 0 0 3px;
  font-size: 12px;
  font-weight: 800;
  color: var(--mono-ink);
}

.jev-error .jev-error-detail {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--mono-l2);
  overflow-wrap: anywhere;
}

.jev-error-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.jev-error-close {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--mono-muted);
  cursor: pointer;
}

.jev-error-close:hover {
  color: var(--mono-ink);
}

.jev-file-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 18px;
  align-items: start;
}

.jev-field {
  display: block;
  margin-bottom: 10px;
}

.jev-field .jev-label {
  margin-bottom: 5px;
}

.jev-samples {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 2px 0 12px;
}

.jev-sample {
  border: 0.7px solid var(--mono-grid);
  background: var(--mono-paper);
  padding: 3px 7px;
  color: var(--mono-muted);
  font-family: var(--mono-font-mono);
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease;
}

.jev-sample:hover {
  border-color: var(--mono-ink);
  color: var(--mono-ink);
}

.jev-form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.jev-shell .mono-btn-chamfer[disabled] {
  opacity: 0.45;
  cursor: not-allowed;
}

.jev-shell .mono-btn-chamfer.is-loading .btn-label {
  animation: jev-blink 1s steps(2, end) infinite;
}

.jev-folders {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.jev-folder {
  position: relative;
  min-height: 104px;
  padding: 9px 9px 8px;
  border: 0.7px solid var(--mono-grid);
  background: var(--mono-paper);
  transition: border-color 200ms ease;
}

.jev-folder.is-choice {
  border-color: var(--mono-ink);
}

.jev-folder.is-unknown {
  border-style: dashed;
}

.jev-folder.is-custom .jev-folder-desc {
  color: var(--mono-l3);
}

.jev-folder.is-choice::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 7px;
  height: 7px;
  background: var(--mono-ink);
}

.jev-folder-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 6px;
}

.jev-folder-icon {
  display: inline-flex;
  width: 17px;
  height: 17px;
  color: var(--mono-l3);
}

.jev-folder.is-choice .jev-folder-icon {
  color: var(--mono-ink);
}

.jev-folder-icon svg {
  width: 17px;
  height: 17px;
}

.jev-folder-pct {
  font-family: var(--mono-font-mono);
  font-size: 10px;
  font-weight: 800;
  color: var(--mono-l3);
}

.jev-folder.is-choice .jev-folder-pct {
  color: var(--mono-ink);
}

.jev-folder-name {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  color: var(--mono-ink);
  overflow-wrap: normal;
  word-break: normal;
  hyphens: none;
}

.jev-folder-desc {
  display: block;
  margin-top: 3px;
  font-size: 8.5px;
  line-height: 1.35;
  color: var(--mono-muted);
}

.jev-folder-bar {
  position: absolute;
  left: 9px;
  right: 9px;
  bottom: 8px;
  height: 2px;
  background: var(--mono-grid);
  overflow: hidden;
}

.jev-folder-bar i {
  display: block;
  width: calc(var(--p, 0) * 100%);
  height: 100%;
  background: var(--mono-l5);
  transition: width 700ms cubic-bezier(0.22, 1, 0.36, 1);
}

.jev-folder.is-choice .jev-folder-bar i {
  background: var(--mono-ink);
}

.jev-folder-manager {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 0.7px dashed var(--mono-grid);
}

.jev-folder-manager-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 7px;
}

.jev-folder-manager-tools {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.jev-folder-add {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr) auto;
  gap: 7px;
  align-items: stretch;
}

.jev-folder-add .mono-btn-chamfer {
  white-space: nowrap;
}

.jev-folder-add .mono-btn-chamfer .chamfer-inner {
  height: 100%;
}

.jev-custom-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}

.jev-custom-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 4px 3px 8px;
  border: 0.7px solid var(--mono-grid);
  font-family: var(--mono-font-mono);
  font-size: 9.5px;
  color: var(--mono-l2);
}

.jev-custom-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--mono-muted);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}

.jev-custom-remove:hover {
  color: var(--mono-ink);
}

.jev-custom-empty {
  font-family: var(--mono-font-mono);
  font-size: 9.5px;
  line-height: 1.5;
  color: var(--mono-faint);
}

.jev-unknown-note {
  margin-top: 10px;
  padding: 9px 11px;
  border: 0.7px solid var(--mono-ink);
  border-left: 3px solid var(--mono-ink);
}

.jev-shell .jev-unknown-note p {
  margin: 3px 0 0;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--mono-l2);
}

.jev-file-result {
  min-height: 250px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 0.7px dashed var(--mono-grid);
  animation: jev-drop 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.jev-file-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  max-width: 100%;
  padding: 6px 9px;
  border: 0.7px solid var(--mono-ink);
  font-family: var(--mono-font-mono);
  font-size: 10.5px;
  color: var(--mono-ink);
}

.jev-file-chip svg {
  flex-shrink: 0;
  width: 13px;
  height: 13px;
}

.jev-file-chip-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jev-chip-arrow {
  color: var(--mono-faint);
}

.jev-chip-folder {
  font-weight: 800;
  white-space: nowrap;
}

.jev-telemetry {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.jev-telemetry strong {
  display: block;
  margin-top: 2px;
  font-family: var(--mono-font-mono);
  font-size: 12px;
  font-weight: 800;
  color: var(--mono-ink);
  overflow-wrap: anywhere;
}

.jev-probs {
  margin-top: 10px;
}

.jev-prob {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 38px;
  align-items: center;
  gap: 7px;
  margin-top: 5px;
}

.jev-prob-label,
.jev-prob-pct {
  font-family: var(--mono-font-mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--mono-muted);
}

.jev-prob-pct {
  text-align: right;
}

.jev-prob-bar {
  height: 4px;
  background: var(--mono-grid);
  overflow: hidden;
}

.jev-prob-bar i {
  display: block;
  height: 100%;
  background: var(--mono-l5);
  transition: width 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.jev-prob.is-win .jev-prob-bar i {
  background: var(--mono-ink);
}

.jev-prob.is-win .jev-prob-label,
.jev-prob.is-win .jev-prob-pct {
  color: var(--mono-ink);
  font-weight: 800;
}

.jev-foot {
  margin-top: 14px;
  padding-top: 8px;
  border-top: 0.7px solid var(--mono-grid);
  font-family: var(--mono-font-mono);
  font-size: 8.5px;
  font-weight: 500;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--mono-faint);
}

.jev-snake-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.jev-board-wrap {
  padding: 7px;
  border: 0.7px solid var(--mono-ink);
  background: var(--mono-paper);
}

.jev-board {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  width: 100%;
  aspect-ratio: 10 / 9;
  gap: 0.7px;
  padding: 0.7px;
  background: var(--mono-grid);
  border: 0.7px solid var(--mono-grid);
}

.jev-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mono-paper);
  min-width: 0;
  min-height: 0;
}

.jev-cell.is-head {
  background: var(--mono-ink);
}

.jev-cell.is-body.shade-1 {
  background: var(--mono-l3);
}

.jev-cell.is-body.shade-2 {
  background: var(--mono-l4);
}

.jev-cell.is-body.shade-3 {
  background: var(--mono-l5);
}

.jev-eye {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--mono-paper);
}

.jev-food {
  width: 44%;
  height: 44%;
  border: 1.1px solid var(--mono-ink);
  background: var(--mono-paper);
  transform: rotate(45deg);
  animation: jev-food 2.6s ease-in-out infinite;
}

.jev-board-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--mono-muted);
}

.jev-snake-panel {
  min-width: 0;
}

.jev-snake-panel .jev-probs {
  min-height: 74px;
}

.jev-telemetry-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 0.7px solid var(--mono-grid);
}

.jev-telemetry-grid strong {
  display: block;
  margin-top: 2px;
  font-family: var(--mono-font-mono);
  font-size: 13px;
  font-weight: 800;
  color: var(--mono-ink);
  overflow-wrap: anywhere;
}

.jev-move {
  padding: 10px 0;
  border-bottom: 0.7px dashed var(--mono-grid);
}

.jev-move-readout {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin: 2px 0 4px;
}

.jev-move-readout strong {
  min-width: 6.5ch;
  font-family: var(--mono-font-mono);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--mono-ink);
}

.jev-move-readout span {
  font-family: var(--mono-font-mono);
  font-size: 9.5px;
  font-weight: 600;
  color: var(--mono-muted);
}

.jev-matrix-wrap {
  padding: 10px 0;
  border-bottom: 0.7px dashed var(--mono-grid);
}

.jev-matrix {
  margin: 6px 0 0;
  padding: 10px 12px;
  background: var(--mono-dark-bg);
  border: 0.7px solid var(--mono-dark-grid);
  color: var(--mono-dark-ink);
  font-family: var(--mono-font-mono);
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
}

.jev-mrow {
  display: block;
  white-space: nowrap;
}

.jev-mlabel {
  display: inline-block;
  width: 1.2ch;
  color: var(--mono-dark-l6);
}

.jev-mline {
  display: inline;
}

.jev-md {
  display: inline-block;
  width: 1ch;
  text-align: center;
}

.jev-md.v0 {
  color: var(--mono-dark-l7);
}

.jev-md.v1,
.jev-md.v3 {
  color: var(--mono-dark-l1);
  font-weight: 800;
}

.jev-md.v2 {
  color: var(--mono-dark-l4);
}

.jev-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 7px;
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--mono-muted);
}

.jev-legend b {
  color: var(--mono-ink);
  font-weight: 800;
}

.jev-demo-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin: 0 0 14px;
  padding: 9px 0;
  border-top: 0.7px solid var(--mono-grid);
  border-bottom: 0.7px solid var(--mono-grid);
}

.jev-demo-main {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
  font-family: var(--mono-font-mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--mono-muted);
}

.jev-demo-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--mono-ink);
  animation: jev-blink 1s steps(2, end) infinite;
}

.jev-demo-mode {
  display: inline-block;
  min-width: 12ch;
  color: var(--mono-ink);
  font-weight: 800;
}

.jev-demo-index {
  display: inline-block;
  min-width: 7ch;
  color: var(--mono-faint);
}

.jev-demo-dots {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 2px;
}

.jev-demo-dots i {
  display: block;
  width: 14px;
  height: 2px;
  background: var(--mono-grid);
  transition: background 150ms ease;
}

.jev-demo-dots i.is-active {
  background: var(--mono-ink);
}

.jev-demo-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.jev-demo-actions #jev-file-demo-pause {
  justify-content: flex-end;
  min-width: 88px;
}

.jev-manual-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0 0 14px;
  padding: 10px 12px;
  border: 0.7px solid var(--mono-ink);
  background: var(--mono-paper);
}

.jev-manual-note p {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--mono-l2);
}

.jev-manual-note .jev-text-btn {
  margin-left: 4px;
}

.jev-snake-modebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin: 0 0 14px;
  padding: 9px 0;
  border-top: 0.7px solid var(--mono-grid);
  border-bottom: 0.7px solid var(--mono-grid);
}

.jev-snake-mode-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.jev-snake-mode-main .card-tag {
  margin-bottom: 0;
}

.jev-snake-mode-main strong {
  min-width: 17ch;
  font-family: var(--mono-font-mono);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--mono-ink);
  text-transform: uppercase;
  white-space: nowrap;
}

.jev-snake-mode-main span:last-child {
  display: block;
  flex: 1 1 220px;
  min-width: 0;
  height: 1.5em;
  line-height: 1.5;
  font-family: var(--mono-font-mono);
  font-size: 8.5px;
  letter-spacing: 0.04em;
  color: var(--mono-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.jev-snake-mode-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.jev-mode-btn {
  border: 0.7px solid var(--mono-grid);
  background: var(--mono-paper);
  color: var(--mono-muted);
  padding: 4px 8px;
  font-family: var(--mono-font-mono);
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.jev-mode-btn:hover {
  color: var(--mono-ink);
  border-color: var(--mono-ink);
}

.jev-mode-btn.is-active {
  background: var(--mono-ink);
  border-color: var(--mono-ink);
  color: var(--mono-paper);
}

.jev-snake-actions,
.jev-snake-replay-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.jev-snake-replay-actions {
  padding-top: 10px;
  border-top: 0.7px dashed var(--mono-grid);
}

.jev-snake-replay-actions #jev-snake-replay-play .chamfer-inner {
  min-width: 128px;
  justify-content: center;
}

.jev-snake-replay-actions #jev-snake-replay-speed {
  min-width: 72px;
  justify-content: flex-start;
}

.jev-snake-actions .mono-btn-chamfer .chamfer-inner {
  min-width: 122px;
  justify-content: center;
}

.jev-snake-actions .jev-text-btn {
  min-width: 54px;
  justify-content: center;
}

.jev-replay-progress {
  min-width: 124px;
  margin-left: auto;
  font-family: var(--mono-font-mono);
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--mono-muted);
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.jev-gate {
  margin-top: 14px;
  padding: 12px 14px;
  border: 0.7px solid var(--mono-ink);
  background: var(--mono-paper);
  animation: jev-drop 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.jev-shell .jev-gate p {
  margin: 5px 0 10px;
  font-size: 12px;
  line-height: 1.55;
  color: var(--mono-l2);
}

.jev-gate-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.jev-log {
  min-height: 96px;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 0.7px solid var(--mono-grid);
  font-family: var(--mono-font-mono);
  font-size: 9px;
  line-height: 1.9;
  letter-spacing: 0.04em;
  color: var(--mono-muted);
}

/* ------------------------------------------------------------------ */
/* API spec matrix + request/response consoles                         */
/* ------------------------------------------------------------------ */

.api-spec {
  margin: 28px 0;
  min-width: 0;
  max-width: 100%;
  background: var(--mono-dark-grid);
}

.api-spec .chamfer-card-content {
  min-width: 0;
  padding: 0;
  background: var(--mono-dark-bg);
  color: var(--mono-dark-ink);
}

.api-spec-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  min-width: 0;
  padding: 20px 20px 16px;
  border-bottom: 0.7px solid var(--mono-dark-grid);
  background-image:
    linear-gradient(var(--mono-dark-grid-soft) 0.7px, transparent 0.7px),
    linear-gradient(90deg, var(--mono-dark-grid-soft) 0.7px, transparent 0.7px);
  background-size: 26px 26px;
  background-position: -0.7px -0.7px;
}

.api-spec .card-tag {
  color: var(--mono-dark-l5);
}

.api-spec .api-spec-head h3.api-spec-title {
  margin: 4px 0 6px;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--mono-dark-l1);
}

.api-spec .api-spec-head p.api-spec-sub {
  max-width: 520px;
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--mono-dark-l4);
}

.api-spec-status {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  flex-shrink: 0;
  padding-left: 14px;
  border-left: 0.7px solid var(--mono-dark-grid);
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  line-height: 1.6;
  letter-spacing: 0.12em;
  color: var(--mono-dark-l5);
  text-align: right;
  text-transform: uppercase;
}

.api-spec-dot {
  width: 5px;
  height: 5px;
  margin-top: 3px;
  border-radius: 50%;
  background: var(--mono-dark-l1);
  animation: api-pulse 2.4s steps(2, end) infinite;
}

.api-spec-endpoints {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7px;
  min-width: 0;
  background: var(--mono-dark-grid);
  border-bottom: 0.7px solid var(--mono-dark-grid);
}

.api-endpoint {
  min-width: 0;
  padding: 14px 16px 13px;
  background: var(--mono-dark-bg);
  position: relative;
}

.api-endpoint::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 26px;
  height: 0.7px;
  background: var(--mono-dark-l5);
}

.api-endpoint-tag {
  display: block;
  margin-bottom: 5px;
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--mono-dark-l5);
}

.api-spec .api-endpoint code.api-endpoint-path {
  display: block;
  margin: 0 0 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--mono-dark-l1);
  font-family: var(--mono-font-mono);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.api-endpoint-flow {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-family: var(--mono-font-mono);
  font-size: 8px;
  line-height: 1.5;
  letter-spacing: 0.04em;
  color: var(--mono-dark-l4);
}

.api-flow-node {
  padding: 2px 5px;
  border: 0.7px solid var(--mono-dark-grid);
  background: var(--mono-dark-surface);
  color: var(--mono-dark-l3);
}

.api-flow-arrow {
  color: var(--mono-dark-l6);
  font-size: 10px;
}

.api-spec-scroll {
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  background: var(--mono-dark-bg);
  border-bottom: 0.7px solid var(--mono-dark-grid);
  -webkit-overflow-scrolling: touch;
}

.api-spec .api-spec-scroll table.api-spec-table {
  display: table;
  width: 100%;
  min-width: 640px;
  margin: 0;
  border-collapse: collapse;
  table-layout: fixed;
  overflow-x: visible;
  font-size: 10.5px;
  line-height: 1.55;
  color: var(--mono-dark-l2);
}

.api-spec .api-spec-table thead th {
  padding: 9px 12px;
  border: 0;
  border-bottom: 0.7px solid var(--mono-dark-grid);
  background: var(--mono-dark-bg);
  color: var(--mono-dark-l5);
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-align: left;
  text-transform: uppercase;
  vertical-align: bottom;
}

.api-spec .api-spec-table thead th:nth-child(1) { width: 18%; }
.api-spec .api-spec-table thead th:nth-child(2) { width: 41%; }
.api-spec .api-spec-table thead th:nth-child(3) { width: 41%; }

.api-spec .api-spec-table tbody th {
  padding: 8px 12px;
  border: 0;
  border-bottom: 0.7px solid var(--mono-dark-grid-soft);
  background: var(--mono-dark-bg);
  color: var(--mono-dark-l4);
  font-family: var(--mono-font-mono);
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: left;
  text-transform: uppercase;
  vertical-align: top;
}

.api-spec .api-spec-table tbody td {
  padding: 8px 12px;
  border: 0;
  border-bottom: 0.7px solid var(--mono-dark-grid-soft);
  background: var(--mono-dark-bg);
  color: var(--mono-dark-l2);
  font-size: 10.5px;
  line-height: 1.55;
  vertical-align: top;
  overflow-wrap: anywhere;
}

.api-spec .api-spec-table tbody tr:last-child th,
.api-spec .api-spec-table tbody tr:last-child td {
  border-bottom: 0;
}

.api-spec .api-spec-table tbody tr:hover th,
.api-spec .api-spec-table tbody tr:hover td {
  background: var(--mono-dark-surface);
}

.api-spec .api-spec-table td code,
.api-spec .api-spec-table th code {
  padding: 1px 4px;
  border: 0.7px solid var(--mono-dark-grid);
  border-radius: 2px;
  background: var(--mono-dark-surface);
  color: var(--mono-dark-l1);
  font-family: var(--mono-font-mono);
  font-size: 9.5px;
  line-height: 1.45;
  word-break: break-word;
}

.api-table-note {
  display: block;
  margin-top: 2px;
  font-family: var(--mono-font-mono);
  font-size: 7.5px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--mono-dark-l6);
  text-transform: none;
}

.api-spec-swipe {
  display: none;
}

.api-spec-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
  padding: 8px 12px;
  border-top: 0.7px solid var(--mono-dark-grid);
  background: var(--mono-dark-bg);
  font-family: var(--mono-font-mono);
  font-size: 7.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--mono-dark-l6);
  text-transform: uppercase;
}

.api-console {
  position: relative;
  min-width: 0;
  max-width: 100%;
  margin: 18px 0 22px;
  border: 0.7px solid var(--mono-dark-grid);
  background: var(--mono-dark-bg);
  clip-path: polygon(
    0 0,
    calc(100% - 8px) 0,
    100% 8px,
    100% 100%,
    8px 100%,
    0 calc(100% - 8px)
  );
}

.api-console-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 0.7px solid var(--mono-dark-grid);
  background: var(--mono-dark-surface);
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--mono-dark-l4);
  text-transform: uppercase;
}

.api-console-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--mono-dark-l1);
}

.api-console-title::before {
  content: '';
  width: 4px;
  height: 4px;
  background: var(--mono-dark-l1);
  transform: rotate(45deg);
}

.api-console-meta {
  color: var(--mono-dark-l5);
  text-align: right;
}

.api-console-body {
  position: relative;
  background: var(--mono-dark-bg);
}

.api-console-body::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0.7px;
  background: var(--mono-dark-grid);
  pointer-events: none;
}

.api-console-body pre.astro-code {
  margin: 0 !important;
  padding: 16px 16px 16px 46px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: var(--mono-dark-bg) !important;
  color: var(--mono-dark-ink) !important;
  font-size: 11px !important;
  line-height: 1.65 !important;
  filter: grayscale(1) contrast(1.06);
  counter-reset: api-line;
  max-width: none;
  box-sizing: border-box;
}

.api-console-body pre.astro-code .line {
  position: relative;
}

.api-console-body pre.astro-code .line::before {
  counter-increment: api-line;
  content: counter(api-line, decimal-leading-zero);
  position: absolute;
  left: -32px;
  width: 22px;
  text-align: right;
  color: var(--mono-dark-l7);
  font-family: var(--mono-font-mono);
  font-size: 8px;
  font-weight: 500;
  letter-spacing: 0.02em;
  user-select: none;
}

.api-console-body pre.astro-code:focus-visible {
  outline: 1px solid var(--mono-dark-l5);
  outline-offset: -2px;
}

.api-console-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 6px 12px;
  border-top: 0.7px solid var(--mono-dark-grid);
  background: var(--mono-dark-bg);
  font-family: var(--mono-font-mono);
  font-size: 7.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--mono-dark-l6);
  text-transform: uppercase;
}

@keyframes api-pulse {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.25; }
}

@media (max-width: 640px) {
  .api-spec-head {
    flex-direction: column;
    gap: 12px;
  }

.api-spec-status {
    padding-left: 0;
    border-left: 0;
    text-align: left;
  }

.api-spec-endpoints {
    grid-template-columns: 1fr;
  }

.api-spec-scroll {
    border-bottom: 0;
  }

.api-spec-swipe {
    display: flex;
    justify-content: flex-end;
    padding: 4px 12px;
    border-top: 0.7px solid var(--mono-dark-grid);
    background: var(--mono-dark-bg);
    font-family: var(--mono-font-mono);
    font-size: 7.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--mono-dark-l6);
  }

.api-console-bar {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }

.api-console-meta {
    text-align: left;
  }

.api-console-body pre.astro-code {
    font-size: 10px !important;
    padding-left: 38px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .api-spec-dot {
    animation: none;
  }
}

.jev-req {
  margin-top: 12px;
  border-top: 0.7px solid var(--mono-grid);
  padding-top: 8px;
}

.jev-req summary {
  cursor: pointer;
  font-family: var(--mono-font-mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--mono-muted);
}

.jev-req summary:hover {
  color: var(--mono-ink);
}

.jev-req pre {
  margin: 8px 0 0;
  max-height: 220px;
  overflow: auto;
  background: var(--mono-dark-bg);
  color: var(--mono-dark-ink);
  border: 0.7px solid var(--mono-dark-grid);
  padding: 10px 12px;
  font-size: 10px;
  line-height: 1.55;
}

.jev-shell button:focus-visible,
.jev-shell input:focus-visible,
.jev-shell textarea:focus-visible,
.jev-shell summary:focus-visible {
  outline: 2px solid var(--mono-ink);
  outline-offset: 2px;
}

.jev-shell [hidden],
.jev-error[hidden] {
  display: none !important;
}

@keyframes jev-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.25; }
}

@keyframes jev-drop {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: none; }
}

@keyframes jev-food {
  0%, 100% { transform: rotate(45deg) scale(1); }
  50% { transform: rotate(45deg) scale(0.78); }
}

@media (max-width: 860px) {
  .jev-file-grid,
  .jev-snake-grid {
    grid-template-columns: 1fr;
  }

.jev-folders {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

.jev-board-wrap {
    max-width: 520px;
    margin: 0 auto;
  }
}

@media (max-width: 560px) {
  .jev-shell .chamfer-card-content {
    padding: 18px 14px 14px;
  }

.jev-folders {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

.jev-folder-add {
    grid-template-columns: 1fr;
  }

.jev-folder-add .mono-btn-chamfer {
    width: 100%;
  }

.jev-telemetry,
  .jev-telemetry-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

.jev-demo-bar,
  .jev-snake-modebar {
    align-items: flex-start;
  }

.jev-replay-progress {
    width: 100%;
    margin-left: 0;
  }

.jev-key-row {
    flex-direction: column;
  }

.jev-key-row .jev-input-wrap {
    flex: 0 0 auto;
    width: 100%;
  }

.jev-key-row .mono-btn-chamfer {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .jev-food,
  .jev-status[data-state="working"] .jev-dot,
  .jev-demo-dot,
  .jev-shell .mono-btn-chamfer.is-loading .btn-label {
    animation: none;
  }

.jev-file-result,
  .jev-gate {
    animation: none;
  }

.jev-folder-bar i,
  .jev-prob-bar i {
    transition: none;
  }
}

</style>

<script is:inline>
(() => {
  'use strict';

const LS = {
    key: 'jev.key.v1',
    relay: 'jev.relay.v1',
    folders: 'jev.folders.v1'
  };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const app = {
    key: '',
    relay: ''
  };

const esc = (value) =>
    String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

function readStored() {
    try {
      app.key = localStorage.getItem(LS.key) || '';
      app.relay = localStorage.getItem(LS.relay) || '';
    } catch (err) {
      app.key = '';
      app.relay = '';
    }
  }

function store(name, value) {
    try {
      localStorage.setItem(name, value);
    } catch (err) {
      /* localStorage can be unavailable in private modes. */
    }
  }

function forget(name) {
    try {
      localStorage.removeItem(name);
    } catch (err) {
      /* no-op */
    }
  }

function baseUrl() {
    const url = app.relay.trim().replace(/\/+$/, '');
    if (!url) throw new Error('Add a relay base URL first.');
    return url;
  }

class ApiError extends Error {
    constructor(message, status, body) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.body = body;
    }
  }

async function api(path, options = {}) {
    const base = baseUrl();
    const headers = {
      Authorization: 'Bearer ' + app.key,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    };

let res;
    try {
      res = await fetch(base + path, { ...options, headers });
    } catch (err) {
      const wrapped = new Error('Network request failed.');
      wrapped.network = true;
      wrapped.cause = err;
      throw wrapped;
    }

const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      data = null;
    }

if (!res.ok) {
      const detail = data && typeof data === 'object' ? JSON.stringify(data) : text;
      throw new ApiError('TypeSafe returned ' + res.status + '.', res.status, detail);
    }
    return data;
  }

function describeError(err) {
    if (err && err.message === 'Add a relay base URL first.') {
      return {
        title: 'Add a relay URL.',
        detail:
          'Paste the HTTPS base URL of your Cloudflare Worker. The demo appends /v1/systemone to it.',
        relay: true
      };
    }
    if (err && err.network) {
      return {
        title: 'Could not reach the relay.',
        detail:
          'Check the relay URL, that the Worker is deployed, and that its ALLOWED_ORIGIN matches this page. ' +
          'The Worker must be HTTPS.',
        relay: true
      };
    }
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return {
          title: 'The key was rejected (401).',
          detail: 'Check the key and save it again. A revoked or mistyped key returns 401.'
        };
      }
      if (err.status === 429) {
        return {
          title: 'Rate limited (429).',
          detail: 'Wait a few seconds, then continue the run. The SDKs retry with backoff; this demo does not.'
        };
      }
      if (err.status === 422) {
        return {
          title: 'The request was rejected (422).',
          detail: err.body || 'The API could not validate the request body.'
        };
      }
      return {
        title: 'TypeSafe returned ' + err.status + '.',
        detail: err.body || 'The request did not complete.'
      };
    }
    return {
      title: '請求失敗。',
      detail: err && err.message ? err.message : String(err)
    };
  }

const errorBox = $('#jev-error');

function showError(err) {
    const info = describeError(err);
    $('#jev-error-title').textContent = info.title;
    $('#jev-error-detail').textContent = info.detail;
    $('#jev-error-relay').hidden = !info.relay;
    errorBox.hidden = false;
  }

function clearError() {
    if (errorBox) errorBox.hidden = true;
  }

async function copyText(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message || 'Copied.');
    } catch (err) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        showToast(message || 'Copied.');
      } catch (copyErr) {
        showToast('Copy failed. Select the text manually.');
      }
      area.remove();
    }
  }

function requireKey() {
    if (app.key) return true;
    showToast('Add your Jev API key above first.');
    const input = $('#jev-key-input');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return false;
  }

function requireRelay() {
    if (app.relay.trim()) return true;
    showToast('Add your relay URL first.');
    focusRelay();
    return false;
  }

function setKeyStatus(text, stateName) {
    const status = $('#jev-key-status');
    if (!status) return;
    status.dataset.state = stateName || 'empty';
    status.querySelector('[data-status-text]').textContent = text;
  }

function syncKeyUI() {
    const input = $('#jev-key-input');
    if (input) input.value = app.key;
    setKeyStatus(app.key ? 'KEY STORED' : '未設定金鑰', app.key ? 'ready' : 'empty');
    const test = $('#jev-key-test');
    if (test) test.disabled = !app.key;
  }

function renderRelayMeta() {
    const hint = $('#jev-relay-hint');
    if (hint) {
      hint.textContent = app.relay.trim()
        ? 'Saved in this browser. The request goes browser → relay → TypeSafe.'
        : '貼上你的 Cloudflare Worker 的 HTTPS base URL。它會存在這個瀏覽器中。';
    }
    const endpoint = $('#jev-endpoint');
    if (endpoint) {
      endpoint.textContent = app.relay.trim()
        ? app.relay.trim().replace(/\/+$/, '') + '/v1/systemone'
        : 'ADD A RELAY URL';
    }
  }

function syncRelayUI() {
    const relayInput = $('#jev-relay-input');
    if (relayInput && document.activeElement !== relayInput && relayInput.value !== app.relay) {
      relayInput.value = app.relay;
    }
    renderRelayMeta();
  }

function focusRelay() {
    const input = $('#jev-relay-input');
    if (!input) return;
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

async function testConnection() {
    if (!requireKey()) return;
    if (!requireRelay()) return;
    clearError();
    setKeyStatus('TESTING', 'working');
    const button = $('#jev-key-test');
    if (button) button.disabled = true;
    try {
      const data = await api('/v1/models', { method: 'GET' });
      const count = data && Array.isArray(data.models) ? data.models.length : null;
      setKeyStatus(count ? 'CONNECTED · ' + count + ' MODELS' : 'CONNECTED', 'ok');
      showToast('Connection works.');
    } catch (err) {
      setKeyStatus('CONNECTION FAILED', 'error');
      showError(err);
    } finally {
      if (button) button.disabled = false;
    }
  }

/* ------------------------------------------------------------------ */
  /* Exhibit 01 — the filing cabinet                                     */
  /* ------------------------------------------------------------------ */

const FOLDER_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>';
  const FILE_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>';

const UNKNOWN_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>';

const DEFAULT_FOLDERS = [
    {
      name: 'Finance',
      desc: 'Invoices · budgets · tax',
      long: 'Invoices, receipts, budgets, payroll, tax, expense reports, financial statements.'
    },
    {
      name: 'Engineering',
      desc: 'Code · incidents · specs',
      long: 'Source code, architecture notes, incident reports, API specs, infrastructure, technical documentation.'
    },
    {
      name: 'Legal',
      desc: 'Contracts · policies · NDAs',
      long: 'Contracts, NDAs, terms of service, compliance policies, licenses, regulatory filings.'
    },
    {
      name: 'Marketing',
      desc: 'Campaigns · copy · brand',
      long: 'Campaign briefs, ad copy, brand assets, social posts, landing pages, market research.'
    },
    {
      name: 'People',
      desc: 'Resumes · reviews · HR',
      long: 'Resumes, offer letters, performance reviews, onboarding, HR policies, employee records.'
    }
  ];

const UNKNOWN_FOLDER = {
    name: 'Unknown',
    desc: 'No folder fits',
    long: 'No listed folder fits, or the file is too ambiguous to file with confidence.',
    kind: 'unknown'
  };

const MAX_CUSTOM_FOLDERS = 8;
  let customFolders = [];

const SAMPLES = {
    invoice: { name: 'Q3_invoice_acme_2026.pdf', excerpt: '' },
    incident: {
      name: 'incident_postmortem_2026-10-02.md',
      excerpt: 'Root cause: expired TLS certificate on the edge gateway. 43 minutes of elevated 502s.'
    },
    nda: { name: 'mutual_nda_signed_v4.pdf', excerpt: '' },
    resume: {
      name: 'resume_jane_doe.pdf',
      excerpt: '10 years of backend engineering, distributed systems, Go and Rust.'
    }
  };

const DEMO_FILES = [
    {
      name: 'Q3_invoice_acme_2026.pdf',
      excerpt: '',
      folder: 'Finance',
      confidence: 1,
      sensitive: 0.75,
      tokens: 515,
      probabilities: {
        'Finance': 1,
        'Engineering': 0,
        'Legal': 0,
        'Marketing': 0,
        'People': 0,
        'Unknown': 0
      }
    },
    {
      name: 'incident_postmortem_2026-10-02.md',
      excerpt: 'Root cause: expired TLS certificate on the edge gateway. 43 minutes of elevated 502s.',
      folder: 'Engineering',
      confidence: 1,
      sensitive: 0.23,
      tokens: 550,
      probabilities: {
        'Finance': 0,
        'Engineering': 1,
        'Legal': 0,
        'Marketing': 0,
        'People': 0,
        'Unknown': 0
      }
    },
    {
      name: 'mutual_nda_signed_v4.pdf',
      excerpt: '',
      folder: 'Legal',
      confidence: 1,
      sensitive: 0.92,
      tokens: 512,
      probabilities: {
        'Finance': 0,
        'Engineering': 0,
        'Legal': 1,
        'Marketing': 0,
        'People': 0,
        'Unknown': 0
      }
    },
    {
      name: 'resume_jane_doe.pdf',
      excerpt: '10 years of backend engineering, distributed systems, Go and Rust.',
      folder: 'People',
      confidence: 1,
      sensitive: 0.86,
      tokens: 531,
      probabilities: {
        'Finance': 0,
        'Engineering': 0,
        'Legal': 0,
        'Marketing': 0,
        'People': 1,
        'Unknown': 0
      }
    },
    {
      name: 'notes_untitled.txt',
      excerpt: 'Loose notes with no clear owner or topic.',
      folder: 'Unknown',
      confidence: 1,
      sensitive: 0.13,
      tokens: 527,
      probabilities: {
        'Finance': 0,
        'Engineering': 0,
        'Legal': 0,
        'Marketing': 0,
        'People': 0,
        'Unknown': 1
      }
    },
  ];

const fileDemo = {
    mode: 'auto',
    running: false,
    userPaused: false,
    index: 0,
    runId: 0,
    inView: false,
    reduced: false
  };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isReservedName(name) {
    const lower = name.toLowerCase();
    return lower === 'unknown' || DEFAULT_FOLDERS.some((folder) => folder.name.toLowerCase() === lower);
  }

function loadCustomFolders() {
    try {
      const raw = localStorage.getItem(LS.folders);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      customFolders = parsed
        .filter((item) => item && typeof item.name === 'string')
        .map((item) => ({
          name: item.name.trim().replace(/\s+/g, ' '),
          desc: typeof item.desc === 'string' ? item.desc.trim().replace(/\s+/g, ' ') : ''
        }))
        .filter((item) => item.name && !isReservedName(item.name))
        .slice(0, MAX_CUSTOM_FOLDERS);
    } catch (err) {
      customFolders = [];
    }
  }

function saveCustomFolders() {
    store(LS.folders, JSON.stringify(customFolders));
  }

function allFolders() {
    return [
      ...DEFAULT_FOLDERS.map((folder) => ({ ...folder, kind: 'default' })),
      ...customFolders.map((folder) => ({
        ...folder,
        kind: 'custom',
        long:
          folder.desc ||
          'Custom folder named ' + folder.name + '. Use the folder name and the file itself to decide.'
      }))
    ];
  }

function folderOptions() {
    return [...allFolders(), UNKNOWN_FOLDER];
  }

function addCustomFolder(name, desc) {
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const cleanDesc = desc.trim().replace(/\s+/g, ' ');

if (!cleanName) {
      showToast('Type a folder name first.');
      return false;
    }
    if (cleanName.length > 32) {
      showToast('Folder names are limited to 32 characters.');
      return false;
    }
    if (customFolders.length >= MAX_CUSTOM_FOLDERS) {
      showToast('Up to ' + MAX_CUSTOM_FOLDERS + ' custom folders.');
      return false;
    }
    if (
      isReservedName(cleanName) ||
      customFolders.some((folder) => folder.name.toLowerCase() === cleanName.toLowerCase())
    ) {
      showToast('That folder already exists.');
      return false;
    }

customFolders.push({ name: cleanName, desc: cleanDesc });
    saveCustomFolders();
    return true;
  }

function removeCustomFolder(index) {
    if (index < 0 || index >= customFolders.length) return;
    const removed = customFolders.splice(index, 1)[0];
    saveCustomFolders();
    renderFolders();
    renderCustomList();
    clearFileResult();
    updateFileJson(buildFilePayload());
    showToast('Removed ' + removed.name + '.');
  }

function resetCustomFolders() {
    customFolders = [];
    saveCustomFolders();
    renderFolders();
    renderCustomList();
    clearFileResult();
    updateFileJson(buildFilePayload());
    showToast('Custom folders reset.');
  }

function renderFolders() {
    const host = $('#jev-folders');
    if (!host) return;
    host.innerHTML = folderOptions()
      .map((folder) => {
        const kind = folder.kind || 'default';
        const icon = kind === 'unknown' ? UNKNOWN_ICON : FOLDER_ICON;
        const classes = ['jev-folder'];
        if (kind === 'unknown') classes.push('is-unknown');
        if (kind === 'custom') classes.push('is-custom');
        return `
          <div class="${classes.join(' ')}" data-folder="${esc(folder.name)}" data-kind="${kind}" aria-label="${esc(folder.name)}: no result yet">
            <div class="jev-folder-top">
              <span class="jev-folder-icon">${icon}</span>
              <span class="jev-folder-pct" data-pct>—</span>
            </div>
            <span class="jev-folder-name">${esc(folder.name)}</span>
            <span class="jev-folder-desc">${esc(folder.desc || (kind === 'custom' ? 'Custom folder' : ''))}</span>
            <span class="jev-folder-bar" aria-hidden="true"><i></i></span>
          </div>`;
      })
      .join('');
  }

function renderCustomList() {
    const host = $('#jev-custom-list');
    const count = $('#jev-folder-count');
    const reset = $('#jev-reset-folders');

if (count) count.textContent = customFolders.length + ' / ' + MAX_CUSTOM_FOLDERS;
    if (reset) reset.hidden = customFolders.length === 0;
    if (!host) return;

if (!customFolders.length) {
      host.innerHTML =
        '<span class="jev-custom-empty">尚無自訂資料夾。起始資料夾與 Unknown 永遠可用。</span>';
      return;
    }

host.innerHTML = customFolders
      .map(
        (folder, index) => `
          <span class="jev-custom-chip">
            <span>${esc(folder.name)}</span>
            <button class="jev-custom-remove" type="button" data-remove-index="${index}" aria-label="Remove ${esc(folder.name)}">×</button>
          </span>`
      )
      .join('');
  }

function clearFileResult() {
    const result = $('#jev-file-result');
    if (result) result.hidden = true;
    const unknown = $('#jev-file-unknown-note');
    if (unknown) unknown.hidden = true;
  }

function buildFilePayload() {
    const name = $('#jev-file-name').value.trim();
    const excerpt = $('#jev-file-excerpt').value.trim();
    const state = { file_name: name };
    if (excerpt) state.excerpt = excerpt;

return {
      model: 'jev-latest',
      state,
      questions: {
        folder: {
          type: 'choice',
          instructions:
            'Which folder should this file be filed into? Judge from the file name and any excerpt. Pick the single best folder.',
          criteria: Object.fromEntries(folderOptions().map((folder) => [folder.name, folder.long]))
        },
        sensitive: {
          type: 'noul',
          instructions:
            'Does the file name or excerpt suggest it contains personal, confidential, or regulated data?'
        }
      }
    };
  }

function updateFileJson(payload) {
    const json = $('#jev-file-json');
    if (json) json.textContent = JSON.stringify(payload, null, 2);
  }

function renderFileResult(data, fileName) {
    const folderAnswer = data.answers && data.answers.folder;
    if (!folderAnswer) throw new Error('The response did not include a folder answer.');
    const sensitive = data.answers && data.answers.sensitive;
    const probabilities = folderAnswer.probabilities || {};

const folderHost = $('#jev-folders');
    folderOptions().forEach((folder) => {
      const card = Array.from(folderHost.querySelectorAll('.jev-folder')).find(
        (el) => el.dataset.folder === folder.name
      );
      if (!card) return;
      const probability = Number(probabilities[folder.name] || 0);
      card.style.setProperty('--p', String(probability));
      const pct = card.querySelector('[data-pct]');
      if (pct) pct.textContent = Math.round(probability * 100) + '%';
      card.classList.toggle('is-choice', folder.name === folderAnswer.choice);
      card.setAttribute(
        'aria-label',
        folder.name + ': ' + Math.round(probability * 100) + ' percent' +
          (folder.name === folderAnswer.choice ? ', selected' : '')
      );
    });

$('#jev-file-chip-name').textContent = fileName;
    $('#jev-file-chip-folder').textContent = folderAnswer.choice;
    $('#jev-file-unknown-note').hidden = folderAnswer.choice !== 'Unknown';
    $('#jev-file-result').hidden = false;

$('#jev-file-telemetry').innerHTML = `
      <div><span class="jev-label">MODEL</span><strong>${esc(data.model || '—')}</strong></div>
      <div><span class="jev-label">CONFIDENCE</span><strong>${Number(folderAnswer.confidence || 0).toFixed(2)}</strong></div>
      <div><span class="jev-label">SENSITIVE</span><strong>${sensitive ? Math.round(Number(sensitive.noul || 0) * 100) + '%' : '—'}</strong></div>
      <div><span class="jev-label">TOKENS</span><strong>${data.usage ? Number(data.usage.input_tokens || 0).toLocaleString() : '—'}</strong></div>`;

const probHost = $('#jev-file-probs');
    if (probHost) {
      const entries = Object.entries(probabilities).sort((a, b) => Number(b[1]) - Number(a[1]));
      probHost.innerHTML = entries
        .map(
          ([label, value]) => `
            <div class="jev-prob ${label === folderAnswer.choice ? 'is-win' : ''}">
              <span class="jev-prob-label">${esc(label)}</span>
              <span class="jev-prob-bar"><i style="width:${(Number(value) * 100).toFixed(1)}%"></i></span>
              <span class="jev-prob-pct">${Math.round(Number(value) * 100)}%</span>
            </div>`
        )
        .join('');
    }
  }

function fileDemoData(sample) {
    return {
      model: 'jev-1.13.0',
      answers: {
        folder: {
          type: 'choice',
          choice: sample.folder,
          confidence: sample.confidence,
          probabilities: sample.probabilities
        },
        sensitive: { type: 'noul', noul: sample.sensitive }
      },
      usage: { input_tokens: sample.tokens, output_tokens: 38 }
    };
  }

function setFileStatus(text, stateName) {
    const el = $('#jev-file-state');
    if (el) el.textContent = text;
    const status = $('#jev-file-status');
    if (status) status.dataset.state = stateName || 'ready';
  }

function resetFileVisuals() {
    const host = $('#jev-folders');
    if (host) {
      folderOptions().forEach((folder) => {
        const card = Array.from(host.querySelectorAll('.jev-folder')).find(
          (el) => el.dataset.folder === folder.name
        );
        if (!card) return;
        card.style.setProperty('--p', '0');
        const pct = card.querySelector('[data-pct]');
        if (pct) pct.textContent = '—';
        card.classList.remove('is-choice');
        card.setAttribute('aria-label', folder.name + ': no result yet');
      });
    }
    const result = $('#jev-file-result');
    if (result) result.hidden = false;
    const chipName = $('#jev-file-chip-name');
    if (chipName) chipName.textContent = '';
    const chipFolder = $('#jev-file-chip-folder');
    if (chipFolder) chipFolder.textContent = '…';
    const unknown = $('#jev-file-unknown-note');
    if (unknown) unknown.hidden = true;
    const probs = $('#jev-file-probs');
    if (probs) probs.innerHTML = '';
    const telemetry = $('#jev-file-telemetry');
    if (telemetry) telemetry.innerHTML = '';
  }

function setFileDemoInputs(sample) {
    const name = $('#jev-file-name');
    const excerpt = $('#jev-file-excerpt');
    if (name) name.value = sample.name;
    if (excerpt) excerpt.value = sample.excerpt;
    updateFileJson(buildFilePayload());
  }

function updateFileDemoUI() {
    const mode = $('#jev-file-demo-mode');
    const index = $('#jev-file-demo-index');
    const pause = $('#jev-file-demo-pause');
    const takeover = $('#jev-file-demo-takeover');
    const dots = $$('#jev-file-demo-dots i');

if (mode) {
      mode.textContent =
        fileDemo.mode === 'manual'
          ? 'MANUAL MODE'
          : fileDemo.userPaused
            ? 'DEMO PAUSED'
            : 'AUTO DEMO';
    }
    if (index) {
      const current = (fileDemo.index % DEMO_FILES.length) + 1;
      index.textContent =
        String(current).padStart(2, '0') + ' / ' + String(DEMO_FILES.length).padStart(2, '0');
    }
    if (pause) {
      pause.textContent =
        fileDemo.mode === 'manual'
          ? '繼續展示'
          : fileDemo.userPaused
            ? 'Play demo'
            : '暫停展示';
    }
    if (takeover) takeover.hidden = fileDemo.mode === 'manual';
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', fileDemo.mode !== 'manual' && i === fileDemo.index);
    });
  }

async function showFileDemoSample(sample, index, runId) {
    setFileDemoInputs(sample);
    resetFileVisuals();
    fileDemo.index = index;
    updateFileDemoUI();
    setFileStatus('DEMO · CLASSIFYING', 'working');
    await sleep(900);
    if (runId !== fileDemo.runId || fileDemo.mode !== 'auto' || fileDemo.userPaused) return;
    renderFileResult(fileDemoData(sample), sample.name);
    setFileStatus('DEMO · ' + sample.folder.toUpperCase(), 'ok');
    await sleep(2400);
  }

async function runFileDemo() {
    if (fileDemo.mode !== 'auto' || fileDemo.userPaused || fileDemo.running) return;
    const runId = ++fileDemo.runId;
    fileDemo.running = true;
    updateFileDemoUI();
    while (runId === fileDemo.runId && fileDemo.mode === 'auto' && !fileDemo.userPaused) {
      for (let i = 0; i < DEMO_FILES.length; i += 1) {
        if (runId !== fileDemo.runId || fileDemo.mode !== 'auto' || fileDemo.userPaused) {
          fileDemo.running = false;
          return;
        }
        await showFileDemoSample(DEMO_FILES[i], i, runId);
        if (runId !== fileDemo.runId) {
          fileDemo.running = false;
          return;
        }
        await sleep(650);
      }
    }
    fileDemo.running = false;
  }

function startFileDemo() {
    if (fileDemo.mode !== 'auto' || fileDemo.userPaused || fileDemo.running) return;
    runFileDemo();
  }

function pauseFileDemo(auto) {
    fileDemo.running = false;
    fileDemo.runId += 1;
    if (!auto) {
      fileDemo.userPaused = true;
      setFileStatus('DEMO PAUSED', 'ready');
    }
    updateFileDemoUI();
  }

function takeOverFileDemo() {
    if (fileDemo.mode === 'manual') return;
    fileDemo.mode = 'manual';
    fileDemo.userPaused = true;
    fileDemo.running = false;
    fileDemo.runId += 1;
    const note = $('#jev-file-manual-note');
    if (note) note.hidden = false;
    setFileStatus('MANUAL', 'ready');
    updateFileDemoUI();
  }

function resumeFileDemo() {
    fileDemo.mode = 'auto';
    fileDemo.userPaused = false;
    const note = $('#jev-file-manual-note');
    if (note) note.hidden = true;
    setFileStatus('DEMO', 'working');
    updateFileDemoUI();
    startFileDemo();
  }

async function classifyFile(event) {
    event.preventDefault();
    takeOverFileDemo();
    if (!requireKey()) return;
    if (!requireRelay()) return;
    clearError();

const nameInput = $('#jev-file-name');
    const fileName = nameInput.value.trim();
    if (!fileName) {
      showToast('Type a file name first.');
      nameInput.focus();
      return;
    }

const payload = buildFilePayload();
    updateFileJson(payload);
    setFileStatus('LIVE · CLASSIFYING', 'working');

const button = $('#jev-file-submit');
    const label = button ? button.querySelector('.btn-label') : null;
    const oldLabel = label ? label.textContent : '';
    if (button) {
      button.disabled = true;
      button.classList.add('is-loading');
    }
    if (label) label.textContent = 'Classifying…';

try {
      const data = await api('/v1/systemone', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      renderFileResult(data, fileName);
      const liveFolder = data.answers && data.answers.folder && data.answers.folder.choice;
      setFileStatus('LIVE · ' + String(liveFolder || 'READY').toUpperCase(), 'ok');
    } catch (err) {
      setFileStatus('ERROR', 'error');
      showError(err);
    } finally {
      if (button) {
        button.disabled = false;
        button.classList.remove('is-loading');
      }
      if (label && oldLabel) label.textContent = oldLabel;
    }
  }

function loadSample(key) {
    const sample = SAMPLES[key];
    if (!sample) return;
    $('#jev-file-name').value = sample.name;
    $('#jev-file-excerpt').value = sample.excerpt;
    updateFileJson(buildFilePayload());
    $('#jev-file-name').focus();
  }

/* ------------------------------------------------------------------ */
  /* Exhibit 02 — Jev 玩貪食蛇                                        */
  /* ------------------------------------------------------------------ */

const COLS = 10;
  const ROWS = 9;
  const DELTA = {
    up: [-1, 0],
    right: [0, 1],
    down: [1, 0],
    left: [0, -1]
  };
  const MOVE_LABEL = { up: 'UP', right: 'RIGHT', down: 'DOWN', left: 'LEFT' };
  const MOVE_DESC = {
    up: 'Move one cell up. Row decreases by 1.',
    right: 'Move one cell right. Column increases by 1.',
    down: 'Move one cell down. Row increases by 1.',
    left: 'Move one cell left. Column decreases by 1.'
  };

const game = {
    snake: [],
    food: null,
    direction: 'right',
    score: 0,
    steps: 0,
    tokens: 0,
    running: false,
    paused: false,
    gameOver: false,
    gate: false,
    autoRun: false,
    mode: 'replay',
    seed: 20261018,
    inFlight: false,
    timer: null,
    lastGate: -1,
    runId: 0,
    log: []
  };

const REPLAY_BASE_MS = 480;
  const replay = {
    trace: null,
    index: 0,
    playing: false,
    timer: null,
    speed: 4,
    runId: 0,
    complete: false,
    userPaused: false,
    inView: false,
    loading: true,
    error: null
  };

function rand() {
    game.seed = (game.seed * 1664525 + 1013904223) >>> 0;
    return game.seed / 4294967296;
  }

function placeFood() {
    const occupied = new Set(game.snake.map((point) => point.r + ',' + point.c));
    const empty = [];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (!occupied.has(r + ',' + c)) empty.push({ r, c });
      }
    }
    if (!empty.length) {
      game.food = null;
      game.gameOver = true;
      return;
    }
    game.food = empty[Math.floor(rand() * empty.length)];
  }

function gridRows() {
    const map = new Map();
    game.snake.forEach((point, index) => {
      map.set(point.r + ',' + point.c, index === 0 ? 1 : 2);
    });
    if (game.food) map.set(game.food.r + ',' + game.food.c, 3);

const rows = [];
    for (let r = 0; r < ROWS; r += 1) {
      let row = '';
      for (let c = 0; c < COLS; c += 1) {
        row += String(map.has(r + ',' + c) ? map.get(r + ',' + c) : 0);
      }
      rows.push(row);
    }
    return rows;
  }

function setSnakeState(text) {
    const el = $('#jev-state');
    if (el) el.textContent = text;
  }

function renderMatrix() {
    const host = $('#jev-matrix');
    if (!host) return;
    const rows = gridRows();
    const header =
      '<span class="jev-mrow"><span class="jev-mlabel"></span><span class="jev-mline">' +
      '0123456789'
        .split('')
        .map((digit) => '<span class="jev-md">' + digit + '</span>')
        .join('') +
      '</span></span>';
    const body = rows
      .map((row, index) => {
        const digits = row
          .split('')
          .map((digit) => '<span class="jev-md v' + digit + '">' + digit + '</span>')
          .join('');
        return (
          '<span class="jev-mrow"><span class="jev-mlabel">' +
          index +
          '</span><span class="jev-mline">' +
          digits +
          '</span></span>'
        );
      })
      .join('');
    host.innerHTML = header + body;
    host.setAttribute('aria-label', 'Compact grid matrix: ' + rows.join(' '));
  }

function renderBoard() {
    const host = $('#jev-board');
    if (!host) return;
    const map = new Map();
    game.snake.forEach((point, index) => {
      map.set(point.r + ',' + point.c, index === 0 ? 'head' : 'body:' + index);
    });
    if (game.food) map.set(game.food.r + ',' + game.food.c, 'food');

let html = '';
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const value = map.get(r + ',' + c) || '';
        let className = 'jev-cell';
        let inner = '';
        if (value === 'head') {
          className += ' is-head';
          inner = '<i class="jev-eye"></i>';
        } else if (value.indexOf('body:') === 0) {
          const index = Number(value.split(':')[1]);
          className += ' is-body shade-' + (((index - 1) % 3) + 1);
        } else if (value === 'food') {
          className += ' is-food';
          inner = '<i class="jev-food"></i>';
        }
        html +=
          '<div class="' + className + '" data-r="' + r + '" data-c="' + c + '">' + inner + '</div>';
      }
    }
    host.innerHTML = html;

const head = game.snake[0];
    host.setAttribute(
      'aria-label',
      'Snake board. Head at row ' + (head.r + 1) + ', column ' + (head.c + 1) +
        '. Food at row ' + (game.food ? game.food.r + 1 : 'none') +
        ', column ' + (game.food ? game.food.c + 1 : 'none') +
        '. Score ' + game.score + '.'
    );

$('#jev-score').textContent = String(game.score);
    $('#jev-steps').textContent = String(game.steps);
    $('#jev-tokens').textContent = game.tokens.toLocaleString();
    renderMatrix();
  }

function legalMoves() {
    const head = game.snake[0];
    const body = new Set(game.snake.slice(0, -1).map((point) => point.r + ',' + point.c));
    return Object.keys(DELTA).filter((direction) => {
      const delta = DELTA[direction];
      const r = head.r + delta[0];
      const c = head.c + delta[1];
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
      return !body.has(r + ',' + c);
    });
  }

function buildSnakePayload(legal) {
    const head = game.snake[0];
    return {
      model: 'jev-latest',
      state: {
        grid: gridRows(),
        legend: {
          '0': 'empty',
          '1': 'snake head',
          '2': 'snake body',
          '3': 'food'
        },
        head: { row: head.r, col: head.c },
        direction: game.direction,
        food: game.food ? { row: game.food.r, col: game.food.c } : null,
        score: game.score,
        steps: game.steps,
        legal_moves: legal
      },
      questions: {
        move: {
          type: 'choice',
          instructions:
            'You are the snake head (1). The snake is moving ' + game.direction +
            '. Choose the next move that keeps the snake alive and moves toward the food (3). ' +
            'The grid is 9 rows by 10 columns: row 0 is the top row, column 0 is the left column. ' +
            'Only choose from `legal_moves`.',
          criteria: Object.fromEntries(legal.map((direction) => [direction, MOVE_DESC[direction]]))
        }
      }
    };
  }

function updateSnakeJson(payload) {
    const el = $('#jev-snake-json');
    if (el) el.textContent = JSON.stringify(payload, null, 2);
  }

function applyMove(direction) {
    const delta = DELTA[direction];
    const head = game.snake[0];
    const next = { r: head.r + delta[0], c: head.c + delta[1] };
    game.snake.unshift(next);

const ate = game.food && next.r === game.food.r && next.c === game.food.c;
    if (ate) {
      game.score += 1;
      placeFood();
      if (!game.food) {
        game.gameOver = true;
        game.running = false;
        setSnakeState('BOARD FULL');
      }
    } else {
      game.snake.pop();
    }

game.direction = direction;
    game.steps += 1;
  }

function renderMove(answer, choice, corrected) {
    const choiceEl = $('#jev-move-choice');
    if (choiceEl) {
      choiceEl.textContent = MOVE_LABEL[choice] + (corrected ? ' · CORRECTED' : '');
    }
    const confEl = $('#jev-move-conf');
    if (confEl) {
      confEl.textContent =
        answer && answer.confidence != null ? 'CONF ' + Number(answer.confidence).toFixed(2) : '—';
    }

const host = $('#jev-snake-probs');
    if (!host) return;
    const probabilities = (answer && answer.probabilities) || {};
    const entries = Object.entries(probabilities).sort((a, b) => Number(b[1]) - Number(a[1]));
    host.innerHTML = entries
      .map(
        ([label, value]) => `
          <div class="jev-prob ${label === choice ? 'is-win' : ''}">
            <span class="jev-prob-label">${esc(MOVE_LABEL[label] || label)}</span>
            <span class="jev-prob-bar"><i style="width:${(Number(value) * 100).toFixed(1)}%"></i></span>
            <span class="jev-prob-pct">${Math.round(Number(value) * 100)}%</span>
          </div>`
      )
      .join('');
  }

function addLog(choice, answer, corrected) {
    game.log.unshift({
      step: game.steps,
      direction: choice,
      confidence: answer && answer.confidence != null ? Number(answer.confidence) : null,
      corrected
    });
    game.log = game.log.slice(0, 5);
    const host = $('#jev-snake-log');
    if (!host) return;
    host.innerHTML = game.log
      .map(
        (entry) =>
          '<div>STEP ' +
          String(entry.step).padStart(3, '0') +
          ' · ' +
          MOVE_LABEL[entry.direction] +
          ' · ' +
          (entry.confidence == null ? '—' : entry.confidence.toFixed(2)) +
          (entry.corrected ? ' · CORRECTED' : '') +
          '</div>'
      )
      .join('');
  }

function updateSnakeButtons() {
    const start = $('#jev-snake-start');
    const auto = $('#jev-snake-auto');
    const pause = $('#jev-snake-pause');
    const stop = $('#jev-snake-stop');

if (start) {
      start.disabled = game.running || game.gate;
      const label = start.querySelector('.btn-label');
      if (label) {
        label.textContent = game.running
          ? 'Running'
          : game.gate
            ? 'Paused'
            : game.gameOver
              ? 'New run'
              : game.steps > 0
                ? 'Resume run'
                : '開始執行';
      }
    }
    if (auto) {
      auto.disabled = game.autoRun;
      auto.classList.toggle('active', game.autoRun);
      const label = auto.querySelector('.btn-label');
      if (label) {
        label.textContent = game.autoRun
          ? 'Auto running'
          : game.gameOver
            ? 'Run again'
            : game.gate
              ? 'Finish run'
              : '執行到底';
      }
    }
    if (pause) {
      pause.disabled = game.gate || (!game.running && !game.paused);
      pause.textContent = game.gate ? 'Paused' : game.paused ? 'Resume' : 'Pause';
    }
    if (stop) {
      stop.disabled = game.gate || (!game.running && !game.paused);
    }
  }

function updateReplayUI() {
    const progress = $('#jev-snake-replay-progress');
    const speed = $('#jev-snake-replay-speed');
    const play = $('#jev-snake-replay-play');
    const label = play ? play.querySelector('.btn-label') : null;
    const tag = play ? play.querySelector('.btn-tag') : null;
    const modeLabel = $('#jev-snake-mode-label');
    const modeNote = $('#jev-snake-mode-note');
    const replayMode = $('#jev-snake-mode-replay');
    const liveMode = $('#jev-snake-mode-live');

if (progress) {
      const total = replay.trace ? replay.trace.steps.length : '—';
      progress.textContent = 'STEP ' + String(replay.index).padStart(3, '0') + ' / ' + total;
    }
    if (speed) speed.textContent = 'Speed ' + replay.speed + '×';
    if (play) play.hidden = game.mode !== 'replay';
    if (label) {
      label.textContent = replay.complete
        ? 'Replay again'
        : replay.playing
          ? '暫停重播'
          : 'Play replay';
    }
    if (tag) tag.textContent = replay.complete ? 'AGAIN //' : 'PLAY //';
    if (modeLabel) {
      modeLabel.textContent = game.mode === 'live' ? 'LIVE MODE' : 'STRUCTURED REPLAY';
    }
    if (modeNote) {
      if (game.mode === 'live') {
        modeNote.textContent = 'Live mode · add a key + relay above · one request per move';
      } else if (replay.loading) {
        modeNote.textContent = '載入軌跡中…';
      } else if (replay.error) {
        modeNote.textContent = 'Replay unavailable · go live or check /data/jev-snake-replay.json';
      } else if (replay.trace) {
        modeNote.textContent =
          (replay.trace.source === 'jev'
            ? 'Recorded with ' + (replay.trace.model || 'Jev')
            : 'Scripted trace') +
          ' · ' +
          replay.trace.steps.length +
          ' steps · ' +
          replay.trace.outcome.score +
          ' food · no key required';
      } else {
        modeNote.textContent = 'Structured trace · no key required';
      }
      modeNote.title = modeNote.textContent;
    }
    if (replayMode) replayMode.classList.toggle('is-active', game.mode === 'replay');
    if (liveMode) liveMode.classList.toggle('is-active', game.mode === 'live');
    const replayActions = $('#jev-snake-replay-actions');
    const liveActions = $('#jev-snake-live-actions');
    if (replayActions) replayActions.hidden = game.mode !== 'replay';
    if (liveActions) liveActions.hidden = game.mode !== 'live';
  }

function setSnakeMode(mode, options = {}) {
    if (game.mode === mode && !options.force) return;
    replay.playing = false;
    replay.runId += 1;
    clearTimeout(replay.timer);
    replay.timer = null;
    game.mode = mode;
    game.running = false;
    game.paused = false;
    game.gate = false;
    game.autoRun = false;
    game.inFlight = false;
    resetGame();
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;

if (mode === 'live') {
      replay.userPaused = true;
      setSnakeState('READY');
    } else {
      replay.index = 0;
      replay.complete = false;
      replay.userPaused = false;
      setSnakeState('REPLAY');
      if (replay.trace && replay.inView) playReplay();
    }
    updateReplayUI();
    updateSnakeButtons();
  }

async function loadReplay() {
    try {
      const res = await fetch('/data/jev-snake-replay.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data || !Array.isArray(data.steps) || !data.steps.length) {
        throw new Error('The trace has no steps.');
      }
      replay.trace = data;
      replay.loading = false;
      replay.error = null;
      replay.index = 0;
      replay.complete = false;
      updateReplayUI();
      if (game.mode === 'replay' && replay.inView && !replay.userPaused) {
        playReplay();
      }
    } catch (err) {
      replay.loading = false;
      replay.error = err;
      updateReplayUI();
    }
  }

function playReplay() {
    if (game.mode !== 'replay' || !replay.trace) return;
    if (replay.complete) {
      restartReplay();
      return;
    }
    if (replay.playing) return;
    if (replay.index >= replay.trace.steps.length) {
      finishReplay();
      return;
    }
    replay.playing = true;
    replay.userPaused = false;
    const runId = ++replay.runId;
    setSnakeState('REPLAY');
    updateReplayUI();
    stepReplay(runId);
  }

function pauseReplay(auto) {
    replay.playing = false;
    replay.runId += 1;
    clearTimeout(replay.timer);
    replay.timer = null;
    if (!auto) {
      replay.userPaused = true;
      setSnakeState('PAUSED');
    }
    updateReplayUI();
  }

function restartReplay() {
    replay.playing = false;
    replay.runId += 1;
    clearTimeout(replay.timer);
    replay.timer = null;
    replay.index = 0;
    replay.complete = false;
    replay.userPaused = false;
    resetGame();
    setSnakeState('REPLAY');
    updateReplayUI();
    playReplay();
  }

function finishReplay() {
    replay.playing = false;
    replay.complete = true;
    replay.runId += 1;
    clearTimeout(replay.timer);
    replay.timer = null;
    const outcome = replay.trace && replay.trace.outcome ? replay.trace.outcome.state : 'GAME OVER';
    setSnakeState(outcome);
    updateReplayUI();
  }

function stepReplay(runId) {
    if (runId !== replay.runId || !replay.playing || game.mode !== 'replay') return;
    if (!replay.trace || replay.index >= replay.trace.steps.length) {
      finishReplay();
      return;
    }
    const legal = legalMoves();
    if (!legal.length) {
      finishReplay();
      return;
    }
    const step = replay.trace.steps[replay.index];
    let move = step.move;
    let corrected = Boolean(step.corrected);
    if (legal.indexOf(move) === -1) {
      move = legal[0];
      corrected = true;
    }
    applyMove(move);
    game.tokens += Number(step.input_tokens || 0);
    renderBoard();
    renderMove(step, move, corrected);
    addLog(move, step, corrected);
    replay.index += 1;
    updateReplayUI();
    if (replay.index >= replay.trace.steps.length || game.gameOver) {
      finishReplay();
      return;
    }
    replay.timer = setTimeout(
      () => stepReplay(runId),
      Math.max(60, Math.round(REPLAY_BASE_MS / replay.speed))
    );
  }

function cycleReplaySpeed() {
    replay.speed = replay.speed === 1 ? 2 : replay.speed === 2 ? 4 : 1;
    updateReplayUI();
  }

function resetGame() {
    game.runId += 1;
    clearTimeout(game.timer);
    game.timer = null;
    game.inFlight = false;
    game.snake = [
      { r: 4, c: 3 },
      { r: 4, c: 2 },
      { r: 4, c: 1 }
    ];
    game.food = null;
    game.direction = 'right';
    game.score = 0;
    game.steps = 0;
    game.tokens = 0;
    game.running = false;
    game.paused = false;
    game.gameOver = false;
    game.gate = false;
    game.autoRun = false;
    game.seed = 20261018;
    game.lastGate = -1;
    game.log = [];
    placeFood();
    renderBoard();
    setSnakeState('READY');
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;
    const log = $('#jev-snake-log');
    if (log) log.innerHTML = '';
    const choice = $('#jev-move-choice');
    if (choice) choice.textContent = '—';
    const conf = $('#jev-move-conf');
    if (conf) conf.textContent = '—';
    const probs = $('#jev-snake-probs');
    if (probs) probs.innerHTML = '';
    updateSnakeJson(buildSnakePayload(legalMoves()));
    updateSnakeButtons();
  }

async function stepSnake() {
    if (game.mode !== 'live') return;
    if (!game.running || game.paused || game.gameOver || game.inFlight) return;

const legal = legalMoves();
    if (!legal.length) {
      game.running = false;
      game.gameOver = true;
      game.autoRun = false;
      setSnakeState('GAME OVER');
      updateSnakeButtons();
      return;
    }

game.inFlight = true;
    setSnakeState('THINKING');
    const runId = game.runId;

try {
      const payload = buildSnakePayload(legal);
      updateSnakeJson(payload);
      const data = await api('/v1/systemone', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (runId !== game.runId) return;

const answer = data.answers && data.answers.move;
      if (!answer) throw new Error('The response did not include a move answer.');

let choice = answer.choice;
      let corrected = false;
      if (legal.indexOf(choice) === -1) {
        choice = legal[0];
        corrected = true;
      }

applyMove(choice);
      game.tokens += data.usage ? Number(data.usage.input_tokens || 0) : 0;
      renderBoard();
      renderMove(answer, choice, corrected);
      addLog(choice, answer, corrected);

if (game.score > 0 && game.score % 10 === 0 && game.score !== game.lastGate) {
        game.lastGate = game.score;
        if (game.autoRun) {
          setSnakeState('AUTO · ' + game.score + ' FOOD');
        } else {
          game.gate = true;
          game.running = false;
          game.paused = true;
          game.inFlight = false;
          setSnakeState('GATE · ' + game.score + ' FOOD');
          const gate = $('#jev-snake-gate');
          if (gate) gate.hidden = false;
          updateSnakeButtons();
          return;
        }
      }
    } catch (err) {
      if (runId !== game.runId) return;
      game.running = false;
      game.paused = false;
      game.inFlight = false;
      game.autoRun = false;
      setSnakeState('ERROR');
      showError(err);
      updateSnakeButtons();
      return;
    }

if (runId !== game.runId) return;
    game.inFlight = false;

if (game.running && !game.paused && !game.gameOver) {
      setSnakeState(game.autoRun ? 'AUTO' : 'RUNNING');
      game.timer = setTimeout(() => {
        if (runId === game.runId) stepSnake();
      }, 700);
    } else if (game.gameOver) {
      game.autoRun = false;
      setSnakeState('GAME OVER');
    }
    updateSnakeButtons();
  }

function startSnake() {
    if (game.mode !== 'live') return;
    if (!requireKey()) return;
    if (!requireRelay()) return;
    clearError();
    if (game.gameOver || (game.steps === 0 && !game.running)) {
      resetGame();
    }
    game.autoRun = false;
    game.running = true;
    game.paused = false;
    game.gate = false;
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;
    setSnakeState('RUNNING');
    updateSnakeButtons();
    stepSnake();
  }

function autoSnake() {
    if (game.mode !== 'live') return;
    if (!requireKey()) return;
    if (!requireRelay()) return;
    clearError();
    if (game.gameOver || (game.steps === 0 && !game.running && !game.paused)) {
      resetGame();
    }
    game.autoRun = true;
    game.running = true;
    game.paused = false;
    game.gate = false;
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;
    setSnakeState('AUTO');
    updateSnakeButtons();
    if (!game.inFlight) stepSnake();
  }

function pauseSnake() {
    if (game.gate) return;
    if (game.running) {
      game.running = false;
      game.paused = true;
      clearTimeout(game.timer);
      game.timer = null;
      setSnakeState('PAUSED');
    } else if (game.paused && !game.gameOver) {
      game.paused = false;
      game.running = true;
      setSnakeState(game.autoRun ? 'AUTO' : 'RUNNING');
      if (!game.inFlight) stepSnake();
    }
    updateSnakeButtons();
  }

function stopSnake() {
    game.running = false;
    game.paused = false;
    game.gate = false;
    game.autoRun = false;
    clearTimeout(game.timer);
    game.timer = null;
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;
    setSnakeState('STOPPED');
    updateSnakeButtons();
  }

function continueSnake() {
    game.gate = false;
    game.paused = false;
    game.autoRun = false;
    game.running = true;
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;
    setSnakeState('RUNNING');
    updateSnakeButtons();
    stepSnake();
  }

function endSnake() {
    game.gate = false;
    game.paused = false;
    game.autoRun = false;
    game.running = false;
    game.gameOver = true;
    clearTimeout(game.timer);
    game.timer = null;
    const gate = $('#jev-snake-gate');
    if (gate) gate.hidden = true;
    setSnakeState('ENDED');
    updateSnakeButtons();
  }

/* ------------------------------------------------------------------ */
  /* Wiring                                                              */
  /* ------------------------------------------------------------------ */

function bindEvents() {
    $('#jev-key-save').addEventListener('click', () => {
      const value = $('#jev-key-input').value.trim();
      if (!value) {
        showToast('Paste a Jev API key first.');
        return;
      }
      app.key = value;
      store(LS.key, value);
      syncKeyUI();
      showToast('Key saved in this browser.');
    });

$('#jev-key-clear').addEventListener('click', () => {
      app.key = '';
      forget(LS.key);
      $('#jev-key-input').value = '';
      syncKeyUI();
      showToast('Key removed from this browser.');
    });

$('#jev-key-toggle').addEventListener('click', () => {
      const input = $('#jev-key-input');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      $('#jev-key-toggle').setAttribute('aria-label', show ? 'Hide key' : 'Show key');
      $('#jev-key-toggle').classList.toggle('is-on', show);
    });

$('#jev-key-test').addEventListener('click', testConnection);
    $('#jev-error-close').addEventListener('click', clearError);
    $('#jev-error-relay').addEventListener('click', focusRelay);

$('#jev-relay-input').addEventListener('input', (event) => {
      app.relay = event.target.value.trim();
      store(LS.relay, app.relay);
      renderRelayMeta();
    });

$('#jev-file-form').addEventListener('submit', classifyFile);
    $('#jev-file-copy').addEventListener('click', () => {
      copyText(JSON.stringify(buildFilePayload(), null, 2), 'Request JSON copied.');
    });
    $$('.jev-sample').forEach((button) => {
      button.addEventListener('click', () => {
        takeOverFileDemo();
        loadSample(button.dataset.sample);
      });
    });
    $('#jev-file-name').addEventListener('input', takeOverFileDemo);
    $('#jev-file-excerpt').addEventListener('input', takeOverFileDemo);
    $('#jev-file-demo-pause').addEventListener('click', () => {
      if (fileDemo.mode === 'manual') {
        resumeFileDemo();
      } else if (fileDemo.userPaused) {
        resumeFileDemo();
      } else {
        pauseFileDemo(false);
      }
    });
    $('#jev-file-demo-takeover').addEventListener('click', () => {
      takeOverFileDemo();
      showToast('Auto demo paused. Add your key above to run live.');
    });
    $('#jev-file-demo-resume').addEventListener('click', resumeFileDemo);

$('#jev-folder-form').addEventListener('submit', (event) => {
      event.preventDefault();
      takeOverFileDemo();
      const nameInput = $('#jev-new-folder');
      const descInput = $('#jev-new-folder-desc');
      if (!addCustomFolder(nameInput.value, descInput.value)) return;
      nameInput.value = '';
      descInput.value = '';
      renderFolders();
      renderCustomList();
      clearFileResult();
      updateFileJson(buildFilePayload());
      showToast('Folder added.');
      nameInput.focus();
    });

$('#jev-custom-list').addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove-index]');
      if (!button) return;
      takeOverFileDemo();
      removeCustomFolder(Number(button.dataset.removeIndex));
    });

$('#jev-reset-folders').addEventListener('click', () => {
      takeOverFileDemo();
      resetCustomFolders();
    });

$('#jev-snake-mode-replay').addEventListener('click', () => setSnakeMode('replay'));
    $('#jev-snake-mode-live').addEventListener('click', () => setSnakeMode('live'));
    $('#jev-snake-replay-play').addEventListener('click', () => {
      if (replay.complete) {
        restartReplay();
      } else if (replay.playing) {
        pauseReplay(false);
      } else {
        playReplay();
      }
    });
    $('#jev-snake-replay-restart').addEventListener('click', restartReplay);
    $('#jev-snake-replay-speed').addEventListener('click', cycleReplaySpeed);

$('#jev-snake-start').addEventListener('click', startSnake);
    $('#jev-snake-auto').addEventListener('click', autoSnake);
    $('#jev-snake-pause').addEventListener('click', pauseSnake);
    $('#jev-snake-stop').addEventListener('click', stopSnake);
    $('#jev-snake-reset').addEventListener('click', () => {
      resetGame();
      showToast('New run ready.');
    });
    $('#jev-snake-continue').addEventListener('click', continueSnake);
    $('#jev-snake-auto-gate').addEventListener('click', autoSnake);
    $('#jev-snake-end').addEventListener('click', endSnake);
    $('#jev-snake-copy').addEventListener('click', () => {
      const payload = buildSnakePayload(legalMoves());
      copyText(JSON.stringify(payload, null, 2), 'Request JSON copied.');
    });
  }

function init() {
    readStored();
    syncKeyUI();
    loadCustomFolders();
    renderFolders();
    renderCustomList();
    syncRelayUI();
    resetGame();
    bindEvents();
    updateFileJson(buildFilePayload());

fileDemo.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fileDemo.reduced) {
      setFileDemoInputs(DEMO_FILES[0]);
      renderFileResult(fileDemoData(DEMO_FILES[0]), DEMO_FILES[0].name);
      fileDemo.userPaused = true;
      setFileStatus('DEMO · READY', 'ready');
    } else {
      setFileStatus('DEMO', 'working');
    }
    updateFileDemoUI();

const fileObserver = new IntersectionObserver(
      (entries) => {
        fileDemo.inView = entries.some((entry) => entry.isIntersecting);
        if (fileDemo.inView && fileDemo.mode === 'auto' && !fileDemo.userPaused) {
          startFileDemo();
        } else if (!fileDemo.inView && fileDemo.running) {
          pauseFileDemo(true);
        }
      },
      { threshold: 0.2 }
    );
    const fileExhibit = $('#jev-files');
    if (fileExhibit) fileObserver.observe(fileExhibit);

setSnakeMode('replay', { force: true });
    loadReplay();
    const snakeObserver = new IntersectionObserver(
      (entries) => {
        replay.inView = entries.some((entry) => entry.isIntersecting);
        if (
          replay.inView &&
          game.mode === 'replay' &&
          replay.trace &&
          !replay.complete &&
          !replay.userPaused
        ) {
          playReplay();
        } else if (!replay.inView && replay.playing) {
          pauseReplay(true);
        }
      },
      { threshold: 0.2 }
    );
    const snakeExhibit = $('#jev-snake');
    if (snakeExhibit) snakeObserver.observe(snakeExhibit);
  }

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

</script>
