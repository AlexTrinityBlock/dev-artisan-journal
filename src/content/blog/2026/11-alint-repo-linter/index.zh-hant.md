---
title: "alint：為程式碼周圍的儲存庫而生的檢查器"
description: "程式碼檢查器只看檔案內部。alint 檢查檔案之外的形狀——缺少的 README、沒有固定版本的 Action、被提交的產物、對不上的版本——用一份 .alint.yml、一個靜態二進位檔，讓 CI、pre-commit 與編輯器看到相同結果。"
pubDate: 2026-11-25
category: "DevOps"
tags: ["alint", "靜態檢查", "GitHub Actions", "CI", "DevOps"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分鐘"
---

# alint：為程式碼周圍的儲存庫而生的檢查器

## 破口：檔案很乾淨，儲存庫卻在漂移

<section class="alint-lead">
  <div class="alint-lead-head">
    <span class="card-tag">儲存庫檢查器 // 00</span>
    <p class="alint-lead-kicker">每個儲存庫都有一個它應該維持的形狀。那個形狀大多靠記憶在把關。</p>
    <h3 class="alint-lead-title">程式碼可以很乾淨，儲存庫卻仍然是錯的。</h3>
    <p class="alint-lead-sub">alint 檢查的是檔案、名稱、設定值與檔案之間的關係——這些都是程式碼檢查器看不到的。</p>
  </div>
  <div class="alint-lead-grid">
    <div class="alint-lead-card">
      <div class="alint-lead-icon"><svg class="alint-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg></div>
      <div class="alint-lead-tag">程式碼 // 已檢查</div>
      <h4>檔案內部</h4>
      <p>ESLint、Clippy 與 Ruff 檢查語法、型別與風格。它們只看到檔案邊界為止。</p>
      <div class="alint-lead-meta">語法 · 型別 · 風格</div>
    </div>
    <div class="alint-lead-arrow" aria-hidden="true">→</div>
    <div class="alint-lead-card">
      <div class="alint-lead-icon"><svg class="alint-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2a1 1 0 0 0-.8-.4H11a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M3 5a2 2 0 0 0 2 2h3"/><path d="M3 3v13a2 2 0 0 0 2 2h3"/></svg></div>
      <div class="alint-lead-tag">儲存庫 // 已漂移</div>
      <h4>檔案之外的形狀</h4>
      <p>一個 README、一個固定版本的 Action、一個必須對上的版本號。這些都住在審查者的記憶裡。</p>
      <div class="alint-lead-meta">README · 版本固定 · 版本號</div>
    </div>
    <div class="alint-lead-arrow" aria-hidden="true">→</div>
    <div class="alint-lead-card">
      <div class="alint-lead-icon"><svg class="alint-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/></svg></div>
      <div class="alint-lead-tag">ALINT // 已強制</div>
      <h4>把形狀寫成規則</h4>
      <p>一份 <code>.alint.yml</code>、一個靜態二進位檔。CI、pre-commit 與編輯器看到相同的結果。</p>
      <div class="alint-lead-meta">一份設定 · 一次掃描</div>
    </div>
  </div>
  <div class="alint-lead-flow alint-scroll">
  <svg class="alint-svg" viewBox="0 0 840 170" role="img" aria-labelledby="alint-lead-title alint-lead-desc">
    <title id="alint-lead-title">alint 流程一眼看盡</title>
    <desc id="alint-lead-desc">一個儲存庫由一份 .alint.yml 設定讀取，一次掃描完成檢查，輸出成檢查結果，然後被修正或用來把關 CI。</desc>
    <defs>
      <marker id="alint-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="alint-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一個儲存庫 // 一份設定 // 一次掃描</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">ALINT 流程</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="128" height="72" class="term"/>
    <svg x="36" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2a1 1 0 0 0-.8-.4H11a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M3 5a2 2 0 0 0 2 2h3"/><path d="M3 3v13a2 2 0 0 0 2 2h3"/></svg>
    <text x="58" y="63" class="f" font-size="6.2" letter-spacing="0.6">儲存庫</text>
    <text x="36" y="88" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">大量檔案</text>
    <text x="36" y="100" class="m" font-size="6.8">README · ci.yml</text>
    <text x="36" y="112" class="f" font-size="6.2">manifest · 語系檔</text>
    <line x1="156" y1="80" x2="186" y2="80" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="190" y="44" width="128" height="72" class="box"/>
    <svg x="202" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
    <text x="224" y="63" class="f" font-size="6.2" letter-spacing="0.6">設定</text>
    <text x="202" y="88" class="t mono" font-size="9.2" font-weight="800">.ALINT.YML</text>
    <text x="202" y="100" class="m" font-size="6.8">一份設定</text>
    <text x="202" y="112" class="f" font-size="6.2">extends + 規則</text>
    <line x1="322" y1="80" x2="352" y2="80" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="356" y="44" width="128" height="72" class="codebox"/>
    <svg x="368" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/></svg>
    <text x="390" y="63" class="f" font-size="6.2" letter-spacing="0.6">引擎</text>
    <text x="368" y="88" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">一次掃描</text>
    <text x="368" y="100" class="m" font-size="6.8">走訪 · 掃描</text>
    <text x="368" y="112" class="f" font-size="6.2">每個檔案只讀一次</text>
    <line x1="488" y1="80" x2="518" y2="80" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="522" y="44" width="128" height="72" class="term"/>
    <svg x="534" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>
    <text x="556" y="63" class="f" font-size="6.2" letter-spacing="0.6">報告</text>
    <text x="534" y="88" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">檢查結果</text>
    <text x="534" y="100" class="m" font-size="6.8">8 種格式</text>
    <text x="534" y="112" class="f" font-size="6.2">human · SARIF · agent</text>
    <line x1="654" y1="80" x2="684" y2="80" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="688" y="44" width="128" height="72" class="box"/>
    <svg x="700" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    <text x="722" y="63" class="f" font-size="6.2" letter-spacing="0.6">出口</text>
    <text x="700" y="88" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">修正 / 把關</text>
    <text x="700" y="100" class="m" font-size="6.8">26 種修正</text>
    <text x="700" y="112" class="f" font-size="6.2">基準線 · CI</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">相同規則會在 CI、PRE-COMMIT、編輯器與代理中執行</text>
  </svg>
  </div>
  <p class="alint-lead-note"><b>儲存庫不只是裡面的程式碼。</b> alint 是把這句話說出來的檢查器。</p>
</section>

<p class="alint-lead-bridge">接下來是這句話背後的機制：這個形狀包含什麼、一次掃描如何找到它，以及如何不用大掃除就能採用這個工具。</p>

一個程式碼檢查器可以在一個仍然有問題的儲存庫上回報零個問題。

新套件少了 README。某個工作流程跑的是 `actions/checkout@v4`，而不是 commit SHA。又有人把 `target/` 提交進去了。`package.json` 寫著 `1.4.0`，`Cargo.toml` 還停在 `1.3.0`。這些都不是語法錯誤、型別錯誤或風格違規。它們是關於儲存庫的事實：哪些檔案存在、叫什麼名字、內容是什麼，以及它們之間如何關聯。

ESLint、Clippy 與 Ruff 一次讀一個檔案，問裡面的程式碼是否有效。它們對「這個檔案該不該存在」、「它的名字能不能跨平台」、「它的版本有沒有跟隔壁的 manifest 對上」沒有意見。這些規則通常住在審查者的腦袋裡，或 `CONTRIBUTING.md` 的某一段。當一個拉取請求忽略它們時，沒有任何東西會失敗。

alint 的賭注是：這些規則值得和程式碼規則一樣的待遇——一份宣告式設定、一次確定性檢查，以及一個結束碼。

## alint 是什麼

alint 自稱「一個快速、通用的檢查器」。這個修飾詞很重要。它不是更快的 ESLint。它檢查的是程式碼周圍的儲存庫。

- 一個靜態 Rust 二進位檔，Apache-2.0 或 MIT 雙授權。
- 13 個規則家族、104 種規則類型，外加 11 個別名。
- 24 個內建規則集，編譯進二進位檔，離線解析。
- 26 種修正操作，分成安全、不安全與建議三個層級。
- 8 種輸出格式，包括 SARIF、GitHub 標註，以及給代理用的 JSON 報告。
- 執行路徑上沒有 Node、JVM 或 Python 執行環境；沒有遙測；執行時不連網，除非你自己寫了 `extends:` URL。

它接手 Repolinter 留下的位置——Repolinter 已於 2026 年 2 月封存——並且與程式碼檢查器並肩運作，而不是取代它們。專案每次發佈都會公佈基準測試：10 萬個檔案約 1.5 秒，100 萬個檔案不到 20 秒。

這個工具很年輕。v0.23.0 在 2026 年 11 月 22 日發佈；儲存庫本身則成立於 2026 年 4 月。這是把版本固定下來的理由，不是忽略它的理由。核心模型很小也很穩定：一份設定、一次走訪、一組規則、一份報告。

## 一條規則是三件事

設定放在儲存庫根目錄的 `.alint.yml`。最短的有用版本只採用一個內建規則集：

```yaml
version: 1
extends:
  - alint://bundled/oss-baseline@v1
```

`extends:` 用來組合規則集。規則集可以是內建的（編譯進二進位檔，以 `alint://bundled/<name>@v1` 定址）、本機檔案，或是以 SHA-256 雜湊固定的 HTTPS URL。alint 會解析它們、做循環檢查，並依規則 `id` 逐層合併欄位。你自己的規則疊在最上面；你可以重新宣告某個規則的 id 來覆寫嚴重程度，或把它關掉。

一條規則是三件事：

1. **一個類型。** 要執行的檢查，例如 `file_exists`、`filename_case` 或 `pair`。
2. **路徑。** 它套用的檔案或 glob。
3. **一個嚴重程度。** `error`、`warning`、`info` 或 `off`。

規則還可以帶一個 `when:` 條件（只在預設分支執行，或只在某個檔案存在時執行）以及一個 `fix:` 操作。

以下設定採用兩個規則集，並加入一條本機規則：

```yaml
version: 1
extends:
  - alint://bundled/oss-baseline@v1
  - alint://bundled/ci/github-actions@v1
rules:
  - id: no-focused-tests
    kind: file_content_forbidden
    paths: ["**/*.test.ts"]
    pattern: '\.only\('
    message: "Remove .only() so CI runs the whole suite, not one test"
    level: error
```

第一個規則集涵蓋開源專案的基本盤：一個 README、一個授權、沒有合併衝突標記。第二個強化 GitHub Actions：把第三方 Action 固定到完整的 commit SHA、宣告唯讀的權杖、讓每個工作流程都有名字。第三條是本機且具體的：不要在拉取請求裡留下 focused test。

規則模型刻意無聊。熱路徑上沒有外掛 API、沒有動態載入的程式碼、沒有逐語言的執行環境。引擎、規則、格式化器與語言伺服器都是同一個二進位檔。當內建類型都不合適時，一個需要明確啟用的 `command` 類型可以執行你原本就信任的工具，並把它的結束碼變成違規。那是逃生門，不是地基。

## 它看得見什麼

104 種規則類型分成幾個表面。完整清單在規則參考裡；真正重要的是分類：

| 表面 | 它抓到什麼 | 規則類型範例 |
| :--- | :--- | :--- |
| 檔案與結構 | 少了 README 或授權；被提交的 `target/`；太深的目錄；太大的檔案 | `file_exists`、`file_absent`、`file_max_size` |
| 名稱與內容 | 大小寫錯誤的模組；少了授權標頭；合併衝突標記；行尾空白 | `filename_case`、`file_header`、`file_content_forbidden` |
| 設定值 | 沒有授權欄位的 `package.json`；沒有 `permissions:` 的工作流程；不是 semver 的版本 | `json_path_matches`、`yaml_path_absent`、`json_schema_passes` |
| 跨檔關係 | 每個套件都有 README；每個 `.proto` 都有產生的綁定；每個語系都有參考鍵；沒有匯入循環 | `every_matching_has`、`pair`、`key_parity`、`file_graph` |
| 安全與編碼 | 沒有固定版本的 Action；Trojan-Source 雙向控制字元；零寬字元；位元組順序標記 | `pinned_references`、`no_bidi_controls` |
| Git 與中介資料 | 違反慣例的提交主旨；少了簽署；無法撐過 checkout 的檔案模式 | `git_commit_message`、`pair_changed_together` |

跨檔那一列是大多數工具沒有的部分。程式碼檢查器只看一個檔案。檔案系統檢查器可以看到整棵樹，這表示它可以斷言關係：`pair` 說每個 `.proto` 都有一個產生的綁定；`key_parity` 說每個語系檔都宣告了與參考檔相同的鍵；`file_graph` 說匯入圖沒有循環；`generated_file_fresh` 說簽入的產生檔案仍然與它的來源相符。

結構化查詢也在這裡。alint 可以讀 JSON、YAML、TOML、XML、dotenv、INI、`.properties` 與 HCL，用 RFC 9535 JSONPath 查詢，並斷言某個值、符合某個模式、禁止某個鍵，或依 JSON Schema 驗證整個檔案。規則可以要求每個 `package.json` 都有 `license`、每個內部 crate 都有 `publish = false`，或每個工作流程都使用唯讀權杖。

以下是一條檢查語系鍵一致性的跨檔規則：

```yaml
version: 1
rules:
  - id: locales-match-english
    kind: key_parity
    reference: locales/en.json
    peers: "locales/*.json"
    level: error
```

如果 `locales/fr.json` 少了 `nav.about`，規則會回報這個鍵，而不是值。如果每個語系都宣告了參考鍵集，規則就通過。沒有腳本、沒有臨時測試、沒有審查者的記憶。

## 一份設定，一次走訪，一份報告

執行模型是 alint 快的原因，而且簡單到可以放在腦子裡。

1. **組出設定。** alint 找到 `.alint.yml`，解析每個 `extends:` 來源，快取、做循環檢查，並依規則 id 逐層合併欄位。這裡也是信任邊界：從 `extends:` 進來的程序啟動規則或自訂事實會在載入時被拒絕，所以採用別人的規則集不會讓你的機器執行他們的命令。
2. **把儲存庫走訪一次。** 走訪是平行的，遵守 `.gitignore`、`.ignore`、git 排除規則與你自己的 `ignore:` glob，並建立一個確定性、排序過的 `FileIndex`。排序是輸出可重現的原因：同一棵樹每次都產生逐位元組相同的輸出。
3. **事實只算一次。** 你宣告的任何 `facts:` 都只針對這份索引評估一次。接著檢查每條規則的 `when:` 運算式，條件為假的規則會在掃描檔案之前被丟掉。在一個只有 Rust 的儲存庫裡列出 Rust、Node、Python 與 Go 規則集，幾乎不花成本。
4. **每個檔案只掃一次。** 逐檔規則以檔案為主：alint 每個符合的檔案最多讀一次位元組，並把這一次讀取交給所有套用的規則。跨檔規則以規則為主：每條規則掃描整份索引，斷言任何單一檔案無法斷言的關係。兩類規則都跨核心平行執行。
5. **合併與輸出。** 違規會被合併、重新排序，並以選定的格式呈現。程式以 `0` 表示乾淨、`1` 表示有違規、`2` 表示設定錯誤、`3` 表示內部錯誤。

設計目標是一份設定、一次掃描、一份報告。加入更多逐檔規則幾乎不改變成本，因為檔案已經在記憶體裡。昂貴的是跨檔規則，而它們的數量比較少。

<figure class="alint-fig">
  <figcaption>
    <span class="card-tag">流程 // 01</span>
    <h3 class="alint-fig-title">一份設定，一次走訪，一份報告</h3>
    <p class="alint-fig-sub">alint 組出有效設定、把儲存庫索引一次、依 <code>when:</code> 過濾規則、每個檔案最多讀一次，然後輸出單一報告。</p>
  </figcaption>
  <div class="alint-scroll">
  <svg class="alint-svg" viewBox="0 0 840 330" role="img" aria-labelledby="alint-f1-title alint-f1-desc">
    <title id="alint-f1-title">alint 的執行流程</title>
    <desc id="alint-f1-desc">五個階段：從 .alint.yml 與其 extends 組出設定、把儲存庫走訪成排序索引、評估事實並依 when 過濾規則、用逐檔與跨檔規則各掃描一次，最後合併報告並回傳結束碼。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">流程 // 從設定到結束碼</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一次掃描 · 確定性輸出</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="36" y="56" width="136" height="120" class="term"/>
    <text x="48" y="78" class="f" font-size="7" letter-spacing="0.8">01 · 設定</text>
    <text x="48" y="106" class="t mono" font-size="9.4" font-weight="800">.ALINT.YML</text>
    <text x="48" y="124" class="m" font-size="6.8">extends:</text>
    <text x="48" y="138" class="m" font-size="6.8">依 id 合併</text>
    <text x="48" y="152" class="f" font-size="6.2">信任閘門</text>
    <line x1="172" y1="116" x2="190" y2="116" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="194" y="56" width="136" height="120" class="box"/>
    <text x="206" y="78" class="f" font-size="7" letter-spacing="0.8">02 · 走訪</text>
    <text x="206" y="106" class="t" font-size="9.4" font-weight="800">一次掃描</text>
    <text x="206" y="124" class="m" font-size="6.8">.gitignore</text>
    <text x="206" y="138" class="m" font-size="6.8">排序索引</text>
    <text x="206" y="152" class="f" font-size="6.2">平行</text>
    <line x1="330" y1="116" x2="348" y2="116" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="352" y="56" width="136" height="120" class="box"/>
    <text x="364" y="78" class="f" font-size="7" letter-spacing="0.8">03 · 事實</text>
    <text x="364" y="106" class="t" font-size="9.4" font-weight="800">事實只算一次</text>
    <text x="364" y="124" class="m" font-size="6.8">when:</text>
    <text x="364" y="138" class="m" font-size="6.8">先剔除規則</text>
    <text x="364" y="152" class="f" font-size="6.2">掃描之前</text>
    <line x1="488" y1="116" x2="506" y2="116" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="510" y="56" width="136" height="120" class="codebox"/>
    <text x="522" y="78" class="f" font-size="7" letter-spacing="0.8">04 · 掃描</text>
    <text x="522" y="106" class="t" font-size="9.4" font-weight="800">只讀一次</text>
    <text x="522" y="124" class="m" font-size="6.8">逐檔</text>
    <text x="522" y="138" class="m" font-size="6.8">跨檔</text>
    <text x="522" y="152" class="f" font-size="6.2">跨核心平行</text>
    <line x1="646" y1="116" x2="664" y2="116" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="668" y="56" width="136" height="120" class="term"/>
    <text x="680" y="78" class="f" font-size="7" letter-spacing="0.8">05 · 報告</text>
    <text x="680" y="106" class="t" font-size="9.4" font-weight="800">合併</text>
    <text x="680" y="124" class="m" font-size="6.8">8 formats</text>
    <text x="680" y="138" class="m" font-size="6.8">結束碼 0/1/2/3</text>
    <text x="680" y="152" class="f" font-size="6.2">一份報告</text>
    <rect x="36" y="200" width="768" height="48" class="term"/>
    <text x="48" y="220" class="t mono" font-size="7.2" font-weight="700">每個檔案只讀一次 → 所有符合的規則</text>
    <text x="792" y="220" class="m mono" font-size="7.2" text-anchor="end">跨檔規則掃描同一份索引</text>
    <line x1="36" y1="270" x2="804" y2="270" class="dash"/>
    <text x="36" y="292" class="f" font-size="6.8">確定性輸出 · CI、PRE-COMMIT、編輯器與代理看到相同結果</text>
    <text x="36" y="312" class="f" font-size="6.8">設定信任邊界：來自 extends 的 command 規則會在載入時被拒絕</text>
  </svg>
  </div>
  <p class="alint-fig-src">設定 → 走訪 → 事實 → 掃描 → 報告</p>
</figure>

## 修正機械性的，揭露需要判斷的

一個只會回報的檢查器，是會被關掉的檢查器。alint 可以就地修正 26 種違規，但它把機械性的問題與有意義的問題分開。

- **安全修正**會在單純的 `alint fix` 時套用：空白與換行規範、行尾、標頭位置、排序標記區塊、重新縮排。
- **不安全修正**會改變意義或移除內容，所以要等 `alint fix --unsafe-fixes`：刪除檔案、正規表達式取代、把已提交的產物從 git 索引移除。
- **建議**只會被回報，永遠不會寫入，用於沒有機械修復方式的違規。

用 `alint fix --dry-run` 預覽，或用 `alint fix --diff` 看確切編輯。alint 會在記憶體裡批次處理一個檔案的編輯、每個檔案只寫一次，並重跑到樹不再變動為止；超過 1 MiB 的檔案會被跳過，而不是被重寫。

修正器裡也有一條信任規則。因為 `extends:` 可以從 URL 拉規則集，來自遠端或巢狀規則集、會注入內容或把內容指向遠端的修正，會降級為建議，除非你把該來源列在 `trusted_extends:`。會呼叫 shell 的修正，除了你自己的頂層設定之外，一律拒絕。重點是：共享規則集可以建議修復，但不能默默改寫你的儲存庫。

## 不用大掃除也能採用

在一個已經成形的儲存庫裡打開結構檢查器，會遇到雞生蛋的問題：第一次執行會回報幾千個不是目前拉取請求造成的違規。alint 的答案是基準線模式。

```bash
alint baseline
# 寫出 .alint-baseline.json；把它提交

alint check --baseline .alint-baseline.json
# 只對相對於基準線的新問題失敗
```

基準線不是行號抑制清單。每個違規都會被指紋化：對規則、路徑與一個內容判別項做 SHA-256。內容判別項可能是違規行的文字、規則特定的鍵，或整個檔案規則的路徑。行號永遠不是雜湊的一部分。插入或刪除無關的行不會讓基準線震盪；編輯違規的那一行則會，所以新問題不能躲在舊條目後面。

檔案是 JSON Lines：第一行是標頭，接著每個被納入基準線的檢查結果一行，排序過。這讓它容易合併，而且在樹沒變時可以逐位元組重現。每個條目裡的 `count` 是預算：相同的檢查結果會收斂成一個條目，如果樹後來出現比記錄更多的次數，多出來的部分會以新問題回報。

重新執行 `alint baseline` 不會默默把新債納入。如果這次執行會新增指紋或提高計數，它會拒絕寫入，並告訴你要嘛修正問題，要嘛加上 `--accept-new`。修剪你已經修好的條目永遠安全。`--strict-baseline` 會把過期條目的警告變成硬失敗，所以基準線不會悄悄腐爛。

這就是棘輪：現在先止血，待處理的清單照自己的步調慢慢還。這和你把型別檢查器引進一個沒有型別的程式庫是同一個做法。

## 它在哪裡執行

一份設定只有在能跟著工作跑時才有用。alint 在四個地方執行，報告改變形狀，規則不變。

**拉取請求。** 官方的 `asamarts/alint` GitHub Action 把安裝與呼叫包成一步。預設它執行 `alint check --format github`，輸出 GitHub 會渲染成拉取請求行內標註的工作流程命令。`alint check --changed` 只檢查拉取請求碰過的檔案。要進 Code Scanning，設 `format: sarif` 並上傳結果；SARIF 帶有穩定的 `partialFingerprints`，所以警示會跨執行去重。

```yaml
name: lint
on: [pull_request]
permissions:
  contents: read
jobs:
  alint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: asamarts/alint@465e70c48ec13774c8cb3bb58856b58b71e3a93d # v0.23.0
        with:
          format: github
```

這個 Action 固定在 commit SHA，而不是標籤，因為那正是 `ci/github-actions` 規則集所強制的。Action 只在 Linux 與 macOS runner 上執行。在 Windows 上，請在 `run:` 步驟安裝 alint（`pip install alint`、`npm install -g @asamarts/alint` 或 `cargo install alint`），然後直接呼叫它。

**提交。** `alint-pre-commit` 鏡像會安裝預先建置的 wheel，所以掛鉤不需要 Rust 工具鏈：

```yaml
repos:
  - repo: https://github.com/asamarts/alint-pre-commit
    rev: v0.23.0
    hooks:
      - id: alint
```

`alint` 掛鉤會檢查每次提交；`alint-fix` 註冊在 `stages: [manual]` 底下，因為它會改動工作樹。想要機械性修復時再明確執行它。

**編輯器。** `alint lsp` 是一個語言伺服器，提供診斷、懸停說明與套用修正的程式碼動作。VS Code 與 JetBrains 有市集擴充功能，Zed 有原始碼擴充功能，Neovim、Sublime Text、Emacs 與 Helix 也有現成設定。

**編碼代理。** `agent` 輸出格式會帶著每個違規的指示與修正命令。`alint export-agents-md` 會讓 `AGENTS.md` 或 `CLAUDE.md` 裡的指示與 alint 強制的規則保持同步，所以代理與 CI 對同一份契約有共識。

<figure class="alint-fig">
  <figcaption>
    <span class="card-tag">接觸面 // 02</span>
    <h3 class="alint-fig-title">一份設定，四個接觸面</h3>
    <p class="alint-fig-sub">同一份 <code>.alint.yml</code> 驅動拉取請求、提交掛鉤、編輯器與編碼代理。報告改變形狀，規則不變。</p>
  </figcaption>
  <div class="alint-scroll">
  <svg class="alint-svg" viewBox="0 0 840 360" role="img" aria-labelledby="alint-f2-title alint-f2-desc">
    <title id="alint-f2-title">alint 在哪裡執行</title>
    <desc id="alint-f2-desc">一份 .alint.yml 餵給四個接觸面：拉取請求標註與 SARIF、pre-commit 掛鉤、編輯器語言伺服器，以及編碼代理輸出。規則不變，報告格式改變。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一份設定 // 四個接觸面</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">相同規則，不同報告</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="48" y="48" width="220" height="72" class="box"/>
    <text x="60" y="68" class="f" font-size="7" letter-spacing="0.8">拉取請求</text>
    <text x="60" y="92" class="t" font-size="9.4" font-weight="800">標註 · SARIF</text>
    <text x="60" y="108" class="m" font-size="6.8">alint check --changed</text>
    <rect x="572" y="48" width="220" height="72" class="box"/>
    <text x="584" y="68" class="f" font-size="7" letter-spacing="0.8">PRE-COMMIT</text>
    <text x="584" y="92" class="t" font-size="9.4" font-weight="800">每次提交都檢查</text>
    <text x="584" y="108" class="m" font-size="6.8">alint · alint-fix</text>
    <rect x="48" y="240" width="220" height="72" class="box"/>
    <text x="60" y="260" class="f" font-size="7" letter-spacing="0.8">編輯器</text>
    <text x="60" y="284" class="t" font-size="9.4" font-weight="800">LSP · 程式碼動作</text>
    <text x="60" y="300" class="m" font-size="6.8">診斷 · 懸停說明</text>
    <rect x="572" y="240" width="220" height="72" class="box"/>
    <text x="584" y="260" class="f" font-size="7" letter-spacing="0.8">編碼代理</text>
    <text x="584" y="284" class="t" font-size="9.4" font-weight="800">代理格式</text>
    <text x="584" y="300" class="m" font-size="6.8">export-agents-md</text>
    <rect x="320" y="140" width="200" height="80" class="codebox"/>
    <text x="332" y="160" class="f" font-size="7" letter-spacing="0.8">設定</text>
    <text x="332" y="184" class="t mono" font-size="10" font-weight="800">.ALINT.YML</text>
    <text x="332" y="200" class="m" font-size="6.8">extends + 規則</text>
    <text x="332" y="214" class="f" font-size="6.2">baseline: .alint-baseline.json</text>
    <path d="M320 160 H268 V120" class="arrow" fill="none" marker-end="url(#alint-arrow)"/>
    <path d="M520 160 H572 V120" class="arrow" fill="none" marker-end="url(#alint-arrow)"/>
    <path d="M320 200 H268 V240" class="arrow" fill="none" marker-end="url(#alint-arrow)"/>
    <path d="M520 200 H572 V240" class="arrow" fill="none" marker-end="url(#alint-arrow)"/>
    <line x1="24" y1="328" x2="816" y2="328" class="dash"/>
    <text x="420" y="346" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.4">8 種輸出格式 · 13 個子命令 · 結束碼 0 乾淨 / 1 違規 / 2 設定錯誤 / 3 內部錯誤</text>
  </svg>
  </div>
  <p class="alint-fig-src">拉取請求 · PRE-COMMIT · 編輯器 · 代理 · 任何 CI</p>
</figure>

同一份設定也可以在任何 CI 裡執行：八種輸出格式涵蓋人類終端、JSON 消費者、SARIF、GitHub、Markdown、JUnit、GitLab 與代理。結束碼穩定，警告預設不會讓建置失敗，除非你加上 `--fail-on-warning`。

## 它不是什麼

alint 檢查的是儲存庫的形狀與內容，不是裡面程式碼的語意。它刻意不是：

- 程式碼或 AST 檢查器——請用 ESLint、Clippy 或 Ruff；
- SAST 掃描器——請用 Semgrep 或 CodeQL；
- IaC 掃描器——請用 Checkov 或 Conftest；
- 完整的提交訊息檢查器——conventional commit 的語法、scope 與 body/footer 規則請用 commitlint；
- 機密掃描器——請用 gitleaks 或 TruffleHog。

它在這些工具底下執行。分工很乾淨：它們把規則放在程式碼上；alint 把規則放在檔案系統上。

幾個實務上的提醒：

- **它很年輕。** v0.23.0 才三天大。把二進位檔、Action 與 pre-commit 的 `rev:` 固定下來；升級前先讀 changelog。
- **規則集預設不阻擋。** 內建規則集以 `info` 或 `warning` 出貨，`error` 只留給沒有歧義的 bug。重新宣告規則 id 就能讓它變成阻擋。
- **修正有層級。** 在 `--unsafe-fixes` 之前先看 `alint fix --diff`；刪除檔案不是空白修正。
- **Action 只支援 Linux/macOS。** Windows CI 需要直接安裝的步驟。
- **遠端規則集是信任邊界。** HTTPS 的 `extends:` 必須有 SRI 固定；來自擴充設定的程序啟動規則與自訂事實會在載入時被拒絕；來自遠端規則集、會注入內容的修正會降級為建議，除非你信任它。
- **它看不到 GitHub 設定。** 分支保護、程式碼審查規則與簽署發佈都在儲存庫之外；請用 OpenSSF Scorecard。

## 五分鐘開始

1. 安裝二進位檔。

```bash
curl -fsSL https://alint.org/install.sh | bash
```

2. 讓它偵測你的生態系，或自己寫三行設定。

```bash
alint init
alint check
```

3. 預覽機械性修復，然後套用安全的部分。

```bash
alint fix --dry-run
alint fix
```

4. 記錄既有債務，只對差量把關。

```bash
alint baseline
alint check --baseline .alint-baseline.json
```

5. 加入 GitHub Action 或 pre-commit 掛鉤，固定在一個發佈版本上。

6. 試一條你的程式碼檢查器表達不了的本機規則：不要 focused test、要求授權欄位、版本必須跟隔壁 manifest 對上。

第一次執行是最貴的。之後，儲存庫就有了一個會在漂移時讓建置失敗的形狀。

## 參考資料

- [alint](https://alint.org/) — 專案首頁、快速開始與基準測試方法。
- [asamarts/alint on GitHub](https://github.com/asamarts/alint) — 原始碼、發佈與完整 README。
- [How alint works](https://alint.org/docs/concepts/start-here/how-alint-works/) — 設定、走訪、事實、掃描與報告的流程。
- [Rule reference](https://alint.org/docs/rules/) — 全部 104 種規則類型與範例。
- [Bundled rulesets](https://alint.org/docs/bundled-rulesets/) — 24 個規則集與它們的預設值。
- [Fixing](https://alint.org/docs/concepts/adoption/fixing/) — 安全、不安全與建議層級。
- [Baseline mode](https://alint.org/docs/concepts/adoption/baseline/) — 指紋、計數與棘輪。
- [GitHub Actions](https://alint.org/docs/integrations/github-actions/) — 行內標註、SARIF 與 SHA 固定。
- [pre-commit](https://alint.org/docs/integrations/pre-commit/) — `alint` 與 `alint-fix` 掛鉤。
- [How alint compares](https://alint.org/compare/) — Repolinter、ls-lint、actionlint 與其他工具。
- [Repolinter](https://github.com/todogroup/repolinter) — 已封存的前身。
- [actionlint](https://github.com/rhysd/actionlint) — 工作流程語意與 ShellCheck 整合。
- [OpenSSF Scorecard](https://github.com/ossf/scorecard) — 檔案系統之外的儲存庫設定。


<style>
  .prose-inner .alint-lead {
    margin: 26px 0;
    padding: 20px 18px 16px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .alint-lead-head {
    margin-bottom: 14px;
  }

  .prose-inner .alint-lead-kicker {
    margin: 0 0 6px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .alint-lead-title {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: var(--mono-ink);
  }

  .prose-inner .alint-lead-sub {
    margin: 0 0 14px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .alint-lead-grid {
    display: grid;
    grid-template-columns: 1fr 26px 1fr 26px 1fr;
    align-items: stretch;
    margin-bottom: 14px;
  }

  .prose-inner .alint-lead-card {
    display: flex;
    flex-direction: column;
    padding: 16px 14px 12px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .alint-lead-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    margin-bottom: 12px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-bg-subtle);
    color: var(--mono-ink);
  }

  .prose-inner .alint-lead-ico {
    display: block;
    width: 24px;
    height: 24px;
  }

  .prose-inner .alint-lead-tag {
    margin-bottom: 5px;
    font-family: var(--mono-font-mono);
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--mono-muted);
  }

  .prose-inner .alint-lead-card h4 {
    margin: 0 0 5px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.35;
    color: var(--mono-ink);
  }

  .prose-inner .alint-lead-card p {
    margin: 0 0 12px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .alint-lead-card code {
    font-size: 0.9em;
  }

  .prose-inner .alint-lead-meta {
    margin-top: auto;
    padding-top: 8px;
    border-top: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font-mono);
    font-size: 7.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--mono-faint);
  }

  .prose-inner .alint-lead-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--mono-font-mono);
    font-size: 12px;
    color: var(--mono-faint);
  }

  .prose-inner .alint-lead-flow {
    margin-bottom: 12px;
  }

  .prose-inner .alint-lead-note {
    margin: 0;
    padding-top: 10px;
    border-top: 0.7px solid var(--mono-grid);
    font-size: 12px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .alint-lead-note b {
    color: var(--mono-ink);
  }

  .prose-inner .alint-lead-bridge {
    margin: 0 0 6px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .alint-fig {
    margin: 26px 0;
    padding: 20px 18px 14px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .alint-fig figcaption {
    margin-bottom: 14px;
  }

  .prose-inner .alint-fig-title {
    margin: 4px 0 3px;
    font-size: 15.5px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.3;
    color: var(--mono-ink);
  }

  .prose-inner .alint-fig-sub {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .alint-fig-sub code {
    font-size: 0.9em;
  }

  .prose-inner .alint-fig-src {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font-mono);
    font-size: 8.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mono-faint);
  }

  .prose-inner .alint-scroll {
    overflow-x: auto;
  }

  .prose-inner .alint-svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .prose-inner .alint-svg text {
    font-family: var(--mono-font);
  }

  .prose-inner .alint-svg .t {
    fill: var(--mono-ink);
  }

  .prose-inner .alint-svg .m {
    fill: var(--mono-muted);
  }

  .prose-inner .alint-svg .f {
    fill: var(--mono-faint);
    font-family: var(--mono-font-mono);
  }

  .prose-inner .alint-svg .mono {
    font-family: var(--mono-font-mono);
  }

  .prose-inner .alint-svg .box {
    fill: var(--mono-paper);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .alint-svg .term {
    fill: var(--mono-bg-subtle);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .alint-svg .codebox {
    fill: var(--mono-bg-subtle);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .alint-svg .rule {
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .alint-svg .rule-soft {
    stroke: var(--mono-grid);
    stroke-width: 0.5;
  }

  .prose-inner .alint-svg .dash {
    fill: none;
    stroke: var(--mono-l5);
    stroke-width: 0.7;
    stroke-dasharray: 2 3;
  }

  .prose-inner .alint-svg .arrow {
    fill: none;
    stroke: var(--mono-ink);
    stroke-width: 0.8;
  }

  @media (max-width: 700px) {
    .prose-inner .alint-lead-grid {
      grid-template-columns: 1fr;
    }

    .prose-inner .alint-lead-arrow {
      height: 22px;
      transform: rotate(90deg);
    }

    .prose-inner .alint-lead-title {
      font-size: 18px;
    }

    .prose-inner .alint-svg {
      min-width: 760px;
    }
  }
</style>
