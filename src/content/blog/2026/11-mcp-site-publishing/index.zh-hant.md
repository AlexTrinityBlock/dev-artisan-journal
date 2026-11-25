---
title: "透過 MCP 發佈文章：API Key、預簽上傳與 RustFS"
description: "Spring Boot MCP 伺服器如何讓 AI 更新接案宣傳網站的最新文章：權限受控的 API Key、版本化寫入，以及上傳到 S3 相容 RustFS 的限時預簽圖片 URL。"
pubDate: 2026-11-25
category: "AI"
tags: ["MCP", "Spring Boot", "RustFS", "S3", "安全"]
featured: false
author: "Alex.Hsiao"
readTime: "13 分鐘"
---

# 透過 MCP 發佈文章：API Key、預簽上傳與 RustFS

## 網站，與兩道門

工作小組的接案宣傳網站，頁面不多，價值卻很集中：服務頁、作品集、聯絡資訊，以及一個用來證明團隊仍在持續交付的「最新文章」區塊。前三個每季才改一次，第四個卻想每週都更新。

管理者已經有 React 編輯器。新需求聽起來範圍很大，其實很窄：讓 AI 助理起草、更新文章，還能加入圖片。高風險的做法，是把資料庫 URL 和 S3 存取金鑰直接交給模型；安全的做法，則是給它幾個工具，和一個十分鐘後失效的 URL。

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">MCP 發佈 // 00</span>
    <p class="mfig-lead-kicker">AI 可以寫完整篇文章，卻從頭到尾不必持有儲存桶的金鑰。</p>
    <h3 class="mfig-lead-title">給代理一個工具，而不是儲存憑證。</h3>
    <p class="mfig-lead-sub">Spring Boot MCP 伺服器檢查金鑰、簽署一次上傳，位元組則由 RustFS 負責傳輸。</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg></div>
      <div class="mfig-tag">MCP // 金鑰</div>
      <h4>誰在呼叫</h4>
      <p>由管理者簽發的金鑰，靜態儲存時只存雜湊，依工具家族劃分權限範圍，刪掉一列就能撤銷。</p>
      <div class="mfig-meta">BEARER · 權限範圍 · 稽核</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg></div>
      <div class="mfig-tag">S3 // 預簽</div>
      <h4>一個物件，一個時間窗</h4>
      <p>一個十分鐘有效的 PUT URL，綁定伺服器選定的物件鍵、內容類型與位元組上限。</p>
      <div class="mfig-meta">TTL · 類型 · 單一物件</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg></div>
      <div class="mfig-tag">RUSTFS // 物件</div>
      <h4>位元組直達</h4>
      <p>API 負責簽署，RustFS 負責儲存。圖片從不經過 JVM。</p>
      <div class="mfig-meta">暫存 · 公開 · CDN</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 170" role="img" aria-labelledby="pub-lead-title pub-lead-desc">
    <title id="pub-lead-title">MCP 圖片發佈路徑</title>
    <desc id="pub-lead-desc">AI 主機呼叫一個受權限範圍控管的 MCP 工具，伺服器檢查金鑰並簽署一個短時效上傳 URL，用戶端直接把位元組 PUT 到 RustFS，接著確認並把圖片附加到文章。</desc>
    <defs>
      <marker id="pub-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一組金鑰 // 一個物件 // 十分鐘</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">圖片路徑</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="118" height="72" class="term"/>
    <svg x="34" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
    <text x="52" y="64" class="f" font-size="6.2" letter-spacing="0.6">AI 主機</text>
    <text x="34" y="88" class="t" font-size="9.5" font-weight="800">MCP 用戶端</text>
    <text x="34" y="100" class="m" font-size="6.8">一組金鑰</text>
    <text x="34" y="112" class="f" font-size="6.2">claude · ide · 自訂</text>
    <line x1="144" y1="80" x2="160" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="162" y="44" width="118" height="72" class="box"/>
    <svg x="172" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    <text x="190" y="64" class="f" font-size="6.2" letter-spacing="0.6">工具</text>
    <text x="172" y="88" class="t mono" font-size="8.6" font-weight="800">request_upload</text>
    <text x="172" y="100" class="m" font-size="6.8">文章 + 類型</text>
    <text x="172" y="112" class="f" font-size="6.2">宣告位元組數</text>
    <line x1="282" y1="80" x2="298" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="300" y="44" width="118" height="72" class="codebox"/>
    <svg x="310" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
    <text x="328" y="64" class="f" font-size="6.2" letter-spacing="0.6">驗證</text>
    <text x="310" y="88" class="t" font-size="9.5" font-weight="800">金鑰檢查</text>
    <text x="310" y="100" class="m" font-size="6.8">權限 · 速率</text>
    <text x="310" y="112" class="f" font-size="6.2">已撤銷？已過期？</text>
    <line x1="420" y1="80" x2="436" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="438" y="44" width="118" height="72" class="term"/>
    <svg x="448" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
    <text x="466" y="64" class="f" font-size="6.2" letter-spacing="0.6">簽署</text>
    <text x="448" y="88" class="t" font-size="9.5" font-weight="800">預簽</text>
    <text x="448" y="100" class="m" font-size="6.8">10 分鐘</text>
    <text x="448" y="112" class="f" font-size="6.2">伺服器選定物件鍵</text>
    <line x1="558" y1="80" x2="574" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="576" y="44" width="118" height="72" class="box"/>
    <svg x="586" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/></svg>
    <text x="604" y="64" class="f" font-size="6.2" letter-spacing="0.6">上傳</text>
    <text x="586" y="88" class="t" font-size="9.5" font-weight="800">RUSTFS PUT</text>
    <text x="586" y="100" class="m" font-size="6.8">位元組直送</text>
    <text x="586" y="112" class="f" font-size="6.2">不經 JVM 代理</text>
    <line x1="696" y1="80" x2="712" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="714" y="44" width="118" height="72" class="term"/>
    <svg x="724" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    <text x="742" y="64" class="f" font-size="6.2" letter-spacing="0.6">附加</text>
    <text x="724" y="88" class="t" font-size="9.5" font-weight="800">確認</text>
    <text x="724" y="100" class="m" font-size="6.8">HEAD + 複製</text>
    <text x="724" y="112" class="f" font-size="6.2">文章 v+1</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">API 從不代理圖片 · 預簽 URL 是唯一的寫入能力</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>代理拿到的是能力，不是憑證。</b>整個設計的差別就在這裡。</p>
</section>

<p class="mfig-bridge">接下來會依序說明內容模型、金鑰模型、上傳流程，以及決定這套設計能否站得住腳的各種失敗情境。</p>

## 兩道門，一個內容模型

網站有兩個前門，共用一層服務。

- **管理 API。** `/api/admin/**` 由管理者的 session cookie 驗證，並受 CSRF 保護。React 編輯器就是它的使用者。
- **MCP 端點。** `/mcp` 以 `Authorization: Bearer` API key 驗證。它是無狀態的，沒有 CSRF token，使用 JSON-RPC。
- **公開 API。** `/api/public/**` 是唯讀的，負責提供渲染後的網站。

MCP 伺服器不是第二個後端，而是同一套文章服務前面的轉接層。這一點很重要，因為所有業務規則——slug 唯一性、翻譯完整性、發佈權限、版本檢查——不論請求從哪道門進來，都必須成立。

內容模型刻意保持精簡：

| 資料表 | 存放內容 |
| :--- | :--- |
| `content_blocks` | 每篇文章一列：id、type、status、version、published_at |
| `block_translations` | 每個語言版本一列：title、summary、body Markdown |
| `media_assets` | 物件鍵、內容類型、位元組數、狀態、附加的文章區塊 |
| `mcp_keys` | 金鑰 id、密鑰雜湊、權限範圍、到期、撤銷、最後使用時間 |
| `audit_log` | 誰在什麼目標上呼叫了哪個工具，結果如何 |

一篇文章就是一列 `content_blocks`，類型為 `article`，帶有一到多列 `block_translations`。`version` 欄位就是樂觀鎖。管理編輯器與 MCP 工具都 PATCH 同一列，因此不會各自漂移成兩種不同的「目前版本」。

## 工具清單

第一個版本有七個工具就夠了。工具越少，模型需要誤讀的描述越少，需要稽核的範圍也越小。

| 工具 | 輸入 | 權限範圍 | 副作用 |
| :--- | :--- | :--- | :--- |
| `list_articles` | status、locale、cursor、limit | `articles:read` | 無 |
| `get_article` | id 或 slug | `articles:read` | 無 |
| `create_article` | 請求 id、locale、title、body | `articles:write` | 草稿 + 修訂 |
| `update_article` | id、期望版本、patch | `articles:write` | 新修訂 |
| `publish_article` | id、期望版本 | `articles:publish` | 上線 + 清除快取 |
| `request_image_upload` | 文章 id、內容類型、位元組數、請求 id | `images:write` | 待處理票據 + URL |
| `confirm_image_upload` | 上傳 id、ETag | `images:write` | 驗證、複製、附加 |

有三個選擇值得特別說明。

**發佈與寫入分開。** AI 可以整個下午都在起草，卻不會動到公開網站。發佈是一個獨立的權限範圍，因為它是唯一會產生公開後果的動作。

**沒有刪除工具。** 刪除是管理者的動作。一個能建立與發佈的代理，不需要同時具備抹除案例研究的能力。

**每次寫入都要帶冪等鍵。** `create_article` 會以唯一約束儲存 `(key_id, client_request_id)`。如果回應遺失、用戶端重試，第二次呼叫會回傳第一篇文章，而不是建立重複資料。

## 金鑰是身分，不是密碼

金鑰長這樣：

```text
mcp_live_7f3a9c2e_9Jq...32-random-bytes...xK
```

中間那一段是建立索引的 `key_id`。最後一段是 32 個隨機位元組，以 base64url 編碼。資料庫儲存 id、雜湊、權限範圍、所屬網站，以及到期、撤銷、輪替與最後使用時間等時間戳記。

對於 256 位元的隨機密鑰，使用帶伺服器端 pepper 的 HMAC-SHA-256 就足夠，而且每次請求驗證的成本很低。Argon2id 適合由人類選擇密鑰的情境，因為它讓猜測變得昂貴；但對高流量的機器憑證來說並不適合，尤其當每次驗證要花上一秒時。無論用哪種函式，都要以常數時間比較，並且對未知、已撤銷、密鑰錯誤的金鑰回傳相同的 `401`。

權限範圍對應到 authority，並且在服務層強制執行，不只在 MCP 路由上檢查：

```java
public Article updateArticle(Actor actor, UUID id, long expectedVersion, ArticlePatch patch) {
    actor.requireScope("articles:write");
    return articles.update(id, expectedVersion, patch); // UPDATE ... WHERE version = ?
}
```

金鑰在每個請求中都放在 `Authorization` 標頭裡。它絕不會出現在工具參數、提示詞、查詢字串或 URL 中。工具參數對模型可見，也經常被記錄；把金鑰放在那裡，就等於洩漏金鑰。

在營運上，管理者需要四個按鈕：建立、輪替、撤銷、檢視最後使用時間。輪替會建立一個連結到舊金鑰的新金鑰，允許一段重疊期，然後撤銷舊金鑰。速率限制依金鑰與工具分別計算。稽核日誌記錄金鑰 id、工具、目標、結果、延遲、請求 id、IP 與 user agent——但絕不記錄密鑰、文章正文或預簽 URL。

## 寫入文章，而不與版本競速

寫入路徑刻意設計得很無聊：

1. 工具驗證 payload 與權限範圍。
2. 服務開啟一個交易。
3. 以 `WHERE id = ? AND version = ?` 更新文章。
4. 若異動列數為零，回傳 `409` 與目前版本。
5. 若異動一列，寫入修訂與稽核紀錄，然後提交。

因此 `update_article` 要求 `expected_version`，回應會回傳新版本。模型收到的指示是：收到 `409` 後重新讀取文章、合併變更，再重試一次。拿著舊版本盲目重試會永遠失敗，這正是正確的行為。

同一條規則也保護管理編輯器。編輯器送出它渲染時的版本，MCP 工具送出它讀取到的版本。兩者都無法悄悄覆蓋對方。

## 圖片：簽署一個物件，而不是整個儲存桶

圖片是最容易讓人想「乾脆給代理 S3 權限」的地方。這套設計改用兩個儲存桶與三個呼叫。

- `media-staging` 是私有的。它接受短時效的 PUT。
- `media-public` 可透過 CDN 讀取。它只包含驗證過、不可變的物件。
- Spring Boot 應用程式持有唯一能寫入這兩個儲存桶的憑證。

流程如下：

1. **請求。** AI 以文章 id、內容類型、宣告大小與冪等鍵呼叫 `request_image_upload`。
2. **票據。** 伺服器檢查權限範圍、確認文章可編輯、驗證類型與大小、插入一列 `PENDING`，並產生像 `staging/site/article/<uuid>.webp` 的物件鍵。檔名永遠不由用戶端提供。
3. **預簽。** 伺服器為該物件鍵、該 `Content-Type` 簽署一個十分鐘有效的 PUT。
4. **上傳。** AI 直接把位元組 PUT 到 RustFS。圖片不經過 JVM。
5. **確認。** AI 以上傳 id 與 ETag 呼叫 `confirm_image_upload`。
6. **驗證與複製。** 伺服器執行 `HEAD`、檢查大小與類型、視情況檢查 magic bytes，以明確的內容類型把物件複製到 `media-public`，並在提升文章版本的同一個交易中把該列改為 `ATTACHED`。
7. **對外提供。** 文章記錄物件鍵；公開頁面把它轉成 CDN URL。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">架構 // 01</span>
    <h3 class="mfig-fig-title">兩道門、一層服務、兩個儲存桶</h3>
    <p class="mfig-fig-sub">管理 session 與 MCP 金鑰遇上同一個文章服務。只有服務持有 RustFS 憑證；用戶端一次只會拿到一個已簽署的 URL。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 410" role="img" aria-labelledby="pub-f1-title pub-f1-desc">
    <title id="pub-f1-title">MCP 發佈流程的架構</title>
    <desc id="pub-f1-desc">管理 SPA 與 AI MCP 用戶端從邊緣進入，邊緣負責 TLS、WAF、請求內文上限與來源檢查。Spring Boot 應用程式提供管理 REST API 與 MCP 端點，認證兩者、寫入 PostgreSQL、簽署上傳，並與 RustFS 溝通。AI 用戶端用預簽 URL 直接上傳到 RustFS。CDN 只讀取公開儲存桶。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">兩道門 // 一個內容模型 // 兩個儲存桶</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">信任邊界</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="48" width="180" height="58" class="box"/>
    <text x="36" y="66" class="f" font-size="6.8" letter-spacing="0.7">管理</text>
    <text x="36" y="86" class="t" font-size="9.2" font-weight="800">SPA 編輯器</text>
    <text x="36" y="99" class="m" font-size="6.6">session + CSRF</text>
    <rect x="636" y="48" width="180" height="58" class="box"/>
    <text x="648" y="66" class="f" font-size="6.8" letter-spacing="0.7">AI</text>
    <text x="648" y="86" class="t" font-size="9.2" font-weight="800">MCP 用戶端</text>
    <text x="648" y="99" class="m" font-size="6.6">bearer 金鑰</text>
    <line x1="114" y1="106" x2="114" y2="130" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <line x1="726" y1="106" x2="726" y2="130" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="24" y="132" width="792" height="30" class="term"/>
    <text x="36" y="151" class="f" font-size="6.8" letter-spacing="0.8">邊緣 // TLS · WAF · 請求內文上限 · 來源檢查 · 速率限制</text>
    <line x1="420" y1="162" x2="420" y2="190" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="12" y="190" width="816" height="118" class="dash"/>
    <text x="20" y="204" class="f" font-size="6.2" letter-spacing="0.8">受信任的應用網路</text>
    <rect x="24" y="212" width="170" height="76" class="box"/>
    <text x="36" y="230" class="f" font-size="6.6" letter-spacing="0.7">驗證</text>
    <text x="36" y="250" class="t" font-size="8.8" font-weight="800">SESSION | API KEY</text>
    <text x="36" y="264" class="m" font-size="6.6">權限範圍 · 速率限制</text>
    <text x="36" y="276" class="f" font-size="6.2">常數時間驗證</text>
    <line x1="194" y1="250" x2="242" y2="250" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="246" y="204" width="340" height="92" class="codebox"/>
    <text x="258" y="222" class="f" font-size="6.6" letter-spacing="0.7">SPRING BOOT</text>
    <rect x="258" y="232" width="150" height="48" class="box"/>
    <text x="268" y="250" class="t" font-size="8.4" font-weight="800">REST /api/admin</text>
    <text x="268" y="264" class="m" font-size="6.4">編輯器 + 媒體</text>
    <rect x="424" y="232" width="150" height="48" class="box"/>
    <text x="434" y="250" class="t" font-size="8.4" font-weight="800">MCP /mcp</text>
    <text x="434" y="264" class="m" font-size="6.4">工具 + JSON-RPC</text>
    <text x="258" y="292" class="f" font-size="6.2">一套文章服務 · 一個版本欄位</text>
    <line x1="586" y1="250" x2="632" y2="250" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="636" y="212" width="180" height="76" class="box"/>
    <text x="648" y="230" class="f" font-size="6.6" letter-spacing="0.7">POSTGRES</text>
    <text x="648" y="250" class="t" font-size="8.8" font-weight="800">文章</text>
    <text x="648" y="264" class="m" font-size="6.6">區塊 · 翻譯</text>
    <text x="648" y="276" class="f" font-size="6.2">金鑰 · 稽核 · 版本</text>
    <line x1="416" y1="296" x2="416" y2="330" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="424" y="316" class="f" font-size="6.2">預簽</text>
    <rect x="330" y="332" width="180" height="48" class="term"/>
    <text x="342" y="350" class="f" font-size="6.6" letter-spacing="0.7">RUSTFS</text>
    <text x="342" y="368" class="t" font-size="8.2" font-weight="800">暫存 + 公開</text>
    <path d="M636 106 H610 V370 H516" class="dash" fill="none" marker-end="url(#pub-f1-arrow)"/>
    <text x="616" y="338" class="f" font-size="6.2" letter-spacing="1">PUT</text>
    <line x1="510" y1="356" x2="632" y2="356" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="636" y="332" width="180" height="48" class="box"/>
    <text x="648" y="350" class="f" font-size="6.6" letter-spacing="0.7">邊緣</text>
    <text x="648" y="368" class="t" font-size="8.2" font-weight="800">CDN / 公開讀取</text>
    <text x="24" y="400" class="f" font-size="6.2">預簽 URL 是 bearer 能力 · 每把金鑰都要限定範圍 · 絕不把儲存憑證放進模型</text>
  </svg>
  </div>
  <p class="mfig-fig-src">管理 SESSION · MCP 金鑰 · 一套服務 · 兩個儲存桶</p>
</figure>

預簽 URL 是一種能力。任何持有它的人都能在到期前寫入那一個物件。把它當密碼看待：不要記錄、不要貼進文章、不要重複用於第二張圖片。

預簽 PUT 也不是完整的上傳政策。它綁定方法、物件鍵、到期時間與已簽署的標頭；它無法可靠地強制請求內文大小上限。宣告大小會在簽署前檢查，邊緣會執行請求內文上限，確認步驟則執行 `HEAD` 並刪除任何不符的內容。這是縱深防禦，不是單一控制。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">上傳 // 02</span>
    <h3 class="mfig-fig-title">簽署、上傳、確認，然後附加</h3>
    <p class="mfig-fig-sub">伺服器從未看到圖片的位元組。它看到的是票據、中繼資料與 ETag，並且只把驗證過的物件複製進公開儲存桶。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 420" role="img" aria-labelledby="pub-f2-title pub-f2-desc">
    <title id="pub-f2-title">圖片上傳流程</title>
    <desc id="pub-f2-desc">八個步驟：AI 請求上傳，伺服器插入待處理票據、回傳預簽 URL，AI 把位元組 PUT 到 RustFS，以 ETag 確認，伺服器驗證並複製到公開儲存桶，附加資產並提升文章版本，最後回傳公開 URL。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">圖片上傳 // 從請求到公開 URL</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">位元組不經過 JVM</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="48" y="44" width="150" height="36" class="box"/>
    <text x="60" y="66" class="t" font-size="8" font-weight="800">AI 用戶端</text>
    <rect x="266" y="44" width="150" height="36" class="box"/>
    <text x="278" y="66" class="t" font-size="8" font-weight="800">MCP / API</text>
    <rect x="484" y="44" width="150" height="36" class="box"/>
    <text x="496" y="66" class="t" font-size="8" font-weight="800">POSTGRES</text>
    <rect x="702" y="44" width="114" height="36" class="box"/>
    <text x="714" y="66" class="t" font-size="8" font-weight="800">RUSTFS</text>
    <line x1="123" y1="80" x2="123" y2="382" class="dash"/>
    <line x1="341" y1="80" x2="341" y2="382" class="dash"/>
    <line x1="559" y1="80" x2="559" y2="382" class="dash"/>
    <line x1="759" y1="80" x2="759" y2="382" class="dash"/>
    <text x="30" y="108" class="f" font-size="6.4">01</text>
    <line x1="123" y1="106" x2="337" y2="106" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="136" y="100" class="m" font-size="6.6">request_image_upload(article, type, bytes)</text>
    <text x="30" y="142" class="f" font-size="6.4">02</text>
    <line x1="341" y1="140" x2="555" y2="140" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="354" y="134" class="m" font-size="6.6">INSERT 待處理票據</text>
    <text x="30" y="176" class="f" font-size="6.4">03</text>
    <line x1="341" y1="174" x2="127" y2="174" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="150" y="168" class="m" font-size="6.6">uploadUrl + Content-Type + 到期</text>
    <text x="30" y="210" class="f" font-size="6.4">04</text>
    <line x1="123" y1="208" x2="755" y2="208" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="136" y="202" class="m" font-size="6.6">PUT 位元組（10 分鐘 URL，單一物件）</text>
    <text x="30" y="244" class="f" font-size="6.4">05</text>
    <line x1="123" y1="242" x2="337" y2="242" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="136" y="236" class="m" font-size="6.6">confirm_image_upload(uploadId, ETag)</text>
    <text x="30" y="278" class="f" font-size="6.4">06</text>
    <line x1="341" y1="276" x2="755" y2="276" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="354" y="270" class="m" font-size="6.6">HEAD + 複製 暫存 → 公開</text>
    <text x="30" y="312" class="f" font-size="6.4">07</text>
    <line x1="341" y1="310" x2="555" y2="310" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="354" y="304" class="m" font-size="6.6">附加 + 版本 + 1</text>
    <text x="30" y="346" class="f" font-size="6.4">08</text>
    <line x1="341" y1="344" x2="127" y2="344" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="150" y="338" class="m" font-size="6.6">公開 URL</text>
    <line x1="24" y1="368" x2="816" y2="368" class="rule-soft"/>
    <text x="24" y="388" class="f" font-size="6.2">過期 → 新票據 · ETAG 或類型不符 → 拒絕 + 刪除 · 未確認 → 清掃器</text>
    <text x="816" y="404" class="f" font-size="6.2" text-anchor="end">一個物件 · 一個時間窗 · 一次確認</text>
  </svg>
  </div>
  <p class="mfig-fig-src">請求 → 簽署 → PUT → HEAD → 複製 → 附加</p>
</figure>

Java 端有兩塊。第一，綁定到用戶端可見端點的 presigner，使用 path-style 存取與暫存儲存桶：

```java
@Bean
S3Presigner presigner(MediaProps props) {
    return S3Presigner.builder()
        .endpointOverride(URI.create(props.publicEndpoint()))
        .region(Region.of(props.region()))
        .credentialsProvider(StaticCredentialsProvider.create(
            AwsBasicCredentials.create(props.accessKey(), props.secretKey())))
        .serviceConfiguration(S3Configuration.builder()
            .pathStyleAccessEnabled(true)
            .checksumValidationEnabled(false)
            .build())
        .build();
}

String presignPut(MediaProps props, String key, String contentType) {
    var request = PutObjectRequest.builder()
        .bucket(props.stagingBucket())
        .key(key)
        .contentType(contentType)
        .build();

    return presigner.presignPutObject(b -> b
        .signatureDuration(Duration.ofMinutes(10))
        .putObjectRequest(request))
        .url().toString();
}
```

第二，檢查權限範圍與文章的 MCP 工具，然後建立票據：

```java
@McpTool(name = "request_image_upload",
    description = "Reserve an image slot; PUT bytes to uploadUrl with the returned Content-Type, then confirm.")
public UploadTicket requestImageUpload(
    @McpToolParam(description = "Article UUID", required = true) UUID articleId,
    @McpToolParam(description = "image/jpeg|png|webp|avif", required = true) String contentType,
    @McpToolParam(description = "Bytes, max 10485760", required = true) long sizeBytes,
    @McpToolParam(description = "Retry UUID", required = false) String clientRequestId) {

    var actor = CurrentActor.requireScope("images:write");
    media.assertEditable(actor, articleId);
    return media.createTicket(actor, articleId, contentType, sizeBytes, clientRequestId);
}
```

注意簽章裡沒有什麼：儲存桶、路徑、存取金鑰或檔名。全部由伺服器選擇。工具接受內容類型與位元組數，因為它需要在簽署前擋掉明顯的濫用；它不接受目的地。

## RustFS 與 S3 相容，但不是 S3

RustFS 走的是 S3 API，因此 Spring 端可以直接用 AWS SDK v2 的 `S3Presigner`，不需要自訂用戶端。相容性是真的，但那是相容目標，不是逐位元組複製 AWS。上線時有五個細節要注意：

1. **對用戶端可見的端點簽署。** scheme、host、port、region 與路徑都是簽章的一部分。以 `http://rustfs:9000` 簽署，卻把 URL 交給外部用戶端，會得到 `SignatureDoesNotMatch`。在 presigner 裡使用公開的 HTTPS 端點。
2. **path-style 存取是預設。** 設定 `pathStyleAccessEnabled(true)`，以及與 `RUSTFS_REGION` 相符的 region（通常是 `us-east-1`），除非你已經用萬用字元 DNS 與憑證架好 virtual-host 樣式。
3. **不要暴露主控台。** S3 API 與主控台是不同的連接埠。只有 API 端點該放在邊緣後面；主控台留在私有網路。第一次部署前先改掉預設管理憑證。
4. **CORS 只是為了讓瀏覽器上傳。** 如果 AI 用戶端在伺服器端，就不需要 CORS。如果管理 SPA 直接上傳，只允許確切的來源、PUT 方法，以及你簽署的標頭。
5. **複製時帶上明確的內容類型。** 從暫存複製到公開時，設定 `MetadataDirective=REPLACE` 並重新送出 `Content-Type`；否則複製可能遺失它。鎖定 RustFS 版本，並針對你實際使用的端點跑契約測試。

使用兩個儲存桶與兩個主體。presigner 只能對暫存 `PutObject`。應用程式可以從暫存 `GetObject`，並對公開 `PutObject`。公開儲存桶只允許匿名 `GetObject`。沒有任何東西直接寫入公開儲存桶。

## 失敗演練

設計的好壞，取決於它的失敗行為。以下是代理碰到正式環境前值得測試的情境：

| 失敗 | 呼叫者看到什麼 | 系統做什麼 |
| :--- | :--- | :--- |
| 上傳 URL 過期 | `410` 或儲存錯誤 | 簽發新票據成本很低；舊票據會被清掃 |
| `Content-Type` 或 ETag 錯誤 | `422` | 拒絕、刪除暫存物件、文章維持不變 |
| 在 PUT 之前確認 | `404` | 票據維持待處理直到到期，然後清掃器移除它 |
| 重複確認 | 相同的公開 URL | 確認以上傳 id 冪等 |
| 文章版本衝突 | `409` + 目前版本 | 模型重新讀取、合併、重試一次 |
| 提交後 DB 逾時 | 用戶端看到錯誤 | 以相同請求 id 重試會回傳已提交的文章 |
| 孤兒暫存物件 | 無 | 每晚清掃超過 30 分鐘仍未處理的票據 |
| MIME 偽造 | `422` | 發佈前做 magic-byte 檢查並重新編碼 |
| 金鑰出現在日誌中 | 濫用前無感 | 遮蔽 `Authorization`、輪替金鑰、檢查稽核軌跡 |

孤兒清掃器值得獨立說明。每個預簽 URL 都創造了一種可能：物件被上傳卻從未確認，或確認了卻從未附加。排程工作會列出已逾期的 `PENDING` 票據、執行 `HEAD`、刪除物件，並把票據標記為 `EXPIRED`。暫存的生命週期規則則是第二道防線。

## 檢查清單

- [ ] 分離 `/api/admin/**`、`/mcp`、`/api/public/**` 的驗證鏈。
- [ ] API 金鑰：前綴查詢、強雜湊、常數時間比較、權限範圍、到期、撤銷、輪替、速率限制、稽核。
- [ ] Bearer 金鑰只放在標頭；絕不放在工具參數、提示詞、查詢字串或日誌中。
- [ ] 文章寫入使用 `expected_version`；`409` 回傳目前版本。
- [ ] 每個建立與上傳請求都帶冪等鍵。
- [ ] 對公開端點預簽，使用伺服器選定的物件鍵、確切的內容類型，以及十分鐘以內的 TTL。
- [ ] 以 `HEAD`、magic-byte 檢查、不可變複製與原子附加來確認。
- [ ] 兩個儲存桶：私有暫存、公開唯讀；沒有直接寫入公開儲存桶的路徑。
- [ ] 孤兒清掃器、暫存生命週期，以及定期對帳。
- [ ] RustFS 主控台無法從網際網路觸及；預設憑證已輪替；版本已鎖定。
- [ ] 針對正式環境實際使用的 RustFS 端點跑契約測試。

重點不是讓 AI 變得值得信任，而是把爆炸半徑縮小到不需要信任。一個受範圍限制的金鑰、一個版本欄位、一個十分鐘有效的 URL，這三個小控制讓代理能夠發佈文章，卻從頭到尾不必持有網站的鑰匙。

## 參考資料

- [Spring AI MCP server boot starter](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html) — 傳輸方式、starter 與伺服器設定。
- [Spring AI MCP server annotations](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-annotations-server.html) — 工具、資源與提示詞註解。
- [Amazon S3 presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) — 到期、注意事項與 bearer 能力語意。
- [AWS SDK for Java v2 `S3Presigner`](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/presigner/S3Presigner.html) — 預簽 API 與設定。
- [RustFS S3 compatibility](https://docs.rustfs.com/en/administration/protocols/s3) — 端點、region 與 path-style 行為。
- [RustFS CORS](https://docs.rustfs.com/en/administration/cors) — 允許的來源與瀏覽器上傳。
- [MCP authorization](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization) — 為什麼 API 金鑰是部署選擇，而不是規格中的 OAuth 模型。
- [Spring Security authentication architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html) — 篩選器與安全脈絡。
- [Spring Security password storage](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html) — Argon2id 與 bcrypt 的取捨。
