---
title: "透過 MCP 發佈文章"
description: "接案宣傳網站的最新文章專區，現在可以讓 AI Agent 透過 MCP 更新文章：一把受限的金鑰、一個短效 RustFS 上傳 URL，以及與圖片一起公開的資料庫文章。"
pubDate: 2026-11-25
category: "AI"
tags: ["MCP", "Spring Boot", "RustFS", "S3", "架構"]
featured: false
author: "Alex.Hsiao"
readTime: "8 分鐘"
cardImage: "./cover.webp"
cardImageAlt: "MCP 用戶端與伺服器堆疊，包含 session 與傳輸層"
---

# 透過 MCP 發佈文章

## 現在實際運作的是什麼

接案宣傳網站的最新文章專區，以前只能在瀏覽器裡編輯。現在不只有這樣。AI Agent 可以透過 MCP 起草、更新文章，並且加入圖片。人工編輯器還在；代理是第二個用戶端，只是金鑰範圍更窄。

這就是值得寫下來的部分。實作是一個 Spring Boot 服務，帶一個 MCP 端點、一個放文章內容的資料庫，以及放圖片的 RustFS。我不會在這裡公開完整的工具清單或資料表定義。重點不是 schema，而是責任怎麼切。

代理從頭到尾不會拿到資料庫 URL，也不會拿到 RustFS 的存取金鑰。它拿到的是一把內容操作用的金鑰；需要圖片時，再拿到一個短效上傳 URL。

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">MCP 發佈 // 00</span>
    <p class="mfig-lead-kicker">真正有用的問題不是「AI 能不能寫」，而是「它應該被允許碰什麼」。</p>
    <h3 class="mfig-lead-title">給代理一個能力，而不是儲存桶金鑰。</h3>
    <p class="mfig-lead-sub">MCP 負責內容操作，預簽 URL 負責一個檔案，RustFS 負責位元組。</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg></div>
      <div class="mfig-tag">MCP // 金鑰</div>
      <h4>一個狹窄的權限</h4>
      <p>管理員發金鑰給 AI 用戶端。伺服器檢查金鑰，決定它能做什麼。</p>
      <div class="mfig-meta">身分 · 範圍 · 撤銷</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg></div>
      <div class="mfig-tag">S3 // 預簽</div>
      <h4>一個物件，一個短窗</h4>
      <p>伺服器只為單一物件簽一個短效 URL，模型直接上傳。</p>
      <div class="mfig-meta">一個物件 · 十分鐘</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg></div>
      <div class="mfig-tag">文章 // 引用</div>
      <h4>文章放資料庫，圖片放 RustFS</h4>
      <p>文章留在資料庫，圖片留在 RustFS；公開頁面把兩者一起呈現。</p>
      <div class="mfig-meta">資料庫 · RUSTFS · 公開</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 128" role="img" aria-labelledby="pub-lead-title pub-lead-desc">
    <title id="pub-lead-title">發佈流程的一條線</title>
    <desc id="pub-lead-desc">AI 用戶端呼叫 MCP 伺服器，伺服器檢查金鑰、簽一個上傳 URL，用戶端把位元組 PUT 到 RustFS，文章最後保存物件的引用。</desc>
    <defs>
      <marker id="pub-lead-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="16" class="f" font-size="7.5" letter-spacing="1.2">一條流程 // 六個動作</text>
    <text x="816" y="16" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">能力，不是憑證</text>
    <line x1="24" y1="24" x2="816" y2="24" class="rule"/>
    <rect x="24" y="38" width="118" height="50" class="term"/>
    <text x="42" y="58" class="f" font-size="6.2" letter-spacing="0.6">用戶端</text>
    <text x="42" y="74" class="t" font-size="9.2" font-weight="800">AI AGENT</text>
    <line x1="142" y1="63" x2="160" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="162" y="38" width="118" height="50" class="box"/>
    <text x="180" y="58" class="f" font-size="6.2" letter-spacing="0.6">內容</text>
    <text x="180" y="74" class="t" font-size="9.2" font-weight="800">MCP</text>
    <line x1="280" y1="63" x2="298" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="300" y="38" width="118" height="50" class="codebox"/>
    <text x="318" y="58" class="f" font-size="6.2" letter-spacing="0.6">驗證</text>
    <text x="318" y="74" class="t" font-size="9.2" font-weight="800">檢查</text>
    <line x1="418" y1="63" x2="436" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="438" y="38" width="118" height="50" class="term"/>
    <text x="456" y="58" class="f" font-size="6.2" letter-spacing="0.6">上傳</text>
    <text x="456" y="74" class="t" font-size="9.2" font-weight="800">簽署</text>
    <line x1="556" y1="63" x2="574" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="576" y="38" width="118" height="50" class="box"/>
    <text x="594" y="58" class="f" font-size="6.2" letter-spacing="0.6">儲存</text>
    <text x="594" y="74" class="t" font-size="9.2" font-weight="800">RUSTFS</text>
    <line x1="694" y1="63" x2="712" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="714" y="38" width="118" height="50" class="term"/>
    <text x="732" y="58" class="f" font-size="6.2" letter-spacing="0.6">內容</text>
    <text x="732" y="74" class="t" font-size="9.2" font-weight="800">文章</text>
    <text x="420" y="110" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">API 永遠不需要儲存桶密鑰 · URL 是唯一的寫入能力</text>
    <text x="420" y="122" class="f" font-size="6.2" text-anchor="middle">從金鑰開始，以引用結束</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>圖片和文章是兩件事。</b>這個分離讓模型不必碰儲存憑證。</p>
</section>

<p class="mfig-bridge">接下來是實際運作的架構、四個步驟，以及讓這個分離成立的請求形狀。</p>

## 為什麼用 RustFS

RustFS 是一套分散式、S3 相容的物件儲存，以 Rust 撰寫。我用它，因為它支援 S3 API，支援預簽 GET/PUT URL。這讓應用程式可以簽一個上傳 URL，而不必把儲存憑證交給代理。

這次實作有三個特性最重要：

- **預簽 URL 是一種能力。** 伺服器可以為單一物件、單一短窗簽一個 URL。代理不需要 RustFS 的存取金鑰。
- **位元組可以直接進儲存。** 應用伺服器簽完 URL 就退出傳輸路徑。它處理的是中介資料，不是 megabytes。
- **公開端可以維持唯讀。** 上傳留在私有儲存桶，發佈後的圖片再透過反向代理或 CDN 提供。寫入路徑與讀取路徑不需要同一組權限。

一個提醒：S3 相容是目標，不是同一件事。RustFS 文件列出它支援的操作，也列出與 AWS S3 不同的地方。測試你實際會用到的操作，並且用用戶端真的連得到的端點來簽章；scheme、host、port、region 與物件路徑都是簽章的一部分。

## 實際架構

實際運作的架構刻意很小。AI Agent 呼叫 MCP 伺服器。MCP 伺服器把文章寫進資料庫，並回傳一個預簽上傳 URL。AI Agent 直接把圖片上傳到 RustFS。公開頁面從資料庫讀文章、從 RustFS 讀圖片。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">形狀 // 01</span>
    <h3 class="mfig-fig-title">內容走 MCP，位元組走儲存</h3>
    <p class="mfig-fig-sub">MCP 伺服器不代理圖片。它驗證代理、把文章寫進資料庫，並為單一物件簽一個短效 URL。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 340" role="img" aria-labelledby="pub-f1-title pub-f1-desc">
    <title id="pub-f1-title">MCP 發佈文章的實際架構</title>
    <desc id="pub-f1-desc">AI Agent 呼叫 Spring Boot MCP 伺服器。伺服器把文章寫進資料庫，並回傳一個 RustFS 的上傳 URL。AI Agent 直接把圖片上傳到 RustFS。公開使用者從資料庫讀文章、從 RustFS 讀圖片，通常透過 CDN 或反向代理。</desc>
    <defs>
      <marker id="pub-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="pub-f1-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一個 MCP 端點 // 一個預簽 URL // 一個公開頁面</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">實際運作中</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="48" width="160" height="64" class="term"/>
    <text x="36" y="66" class="f" font-size="6.4" letter-spacing="0.7">用戶端</text>
    <text x="36" y="86" class="t" font-size="9.4" font-weight="800">AI AGENT</text>
    <text x="36" y="100" class="m" font-size="6.4">MCP 用戶端</text>
    <rect x="250" y="48" width="180" height="64" class="box"/>
    <text x="262" y="66" class="f" font-size="6.4" letter-spacing="0.7">內容平面</text>
    <text x="262" y="86" class="t" font-size="9.4" font-weight="800">MCP 伺服器</text>
    <text x="262" y="100" class="m" font-size="6.4">Spring Boot · 驗證 · 簽章</text>
    <rect x="500" y="48" width="170" height="64" class="term"/>
    <text x="512" y="66" class="f" font-size="6.4" letter-spacing="0.7">儲存</text>
    <text x="512" y="86" class="t" font-size="9.4" font-weight="800">資料庫</text>
    <text x="512" y="100" class="m" font-size="6.4">文章內容</text>
    <line x1="184" y1="80" x2="246" y2="80" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="190" y="72" class="f" font-size="6">文章</text>
    <line x1="430" y1="80" x2="496" y2="80" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="436" y="72" class="f" font-size="6">寫入</text>
    <path d="M250 96 H220 V160 H140 V112" class="dash" marker-end="url(#pub-f1-arrow-muted)"/>
    <text x="146" y="154" class="f" font-size="6">預簽 URL</text>
    <rect x="250" y="210" width="180" height="64" class="codebox"/>
    <text x="262" y="228" class="f" font-size="6.4" letter-spacing="0.7">物件儲存</text>
    <text x="262" y="248" class="t" font-size="9.4" font-weight="800">RUSTFS</text>
    <text x="262" y="262" class="m" font-size="6.4">圖片物件</text>
    <path d="M80 112 V242 H246" class="dash" fill="none" marker-end="url(#pub-f1-arrow-muted)"/>
    <text x="88" y="184" class="f" font-size="6">上傳圖片</text>
    <rect x="500" y="210" width="170" height="64" class="box"/>
    <text x="512" y="228" class="f" font-size="6.4" letter-spacing="0.7">讀取路徑</text>
    <text x="512" y="248" class="t" font-size="9.4" font-weight="800">公開使用者</text>
    <text x="512" y="262" class="m" font-size="6.4">文章 + 圖片</text>
    <line x1="585" y1="112" x2="585" y2="206" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="593" y="160" class="f" font-size="6">文章</text>
    <line x1="430" y1="242" x2="496" y2="242" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="436" y="234" class="f" font-size="6">圖片</text>
    <text x="24" y="310" class="f" font-size="6.4" letter-spacing="0.5">MCP 寫入文章並回傳一個預簽 URL · 它從不代理圖片</text>
    <text x="24" y="324" class="f" font-size="6.2">資料庫 = 文章 · RUSTFS = 圖片 · 公開頁面讀取兩者</text>
  </svg>
  </div>
  <p class="mfig-fig-src">AI AGENT · MCP · 資料庫 · RUSTFS · 公開使用者</p>
</figure>

## 四個步驟

流程是四個步驟，外加一開始的那把金鑰。

管理員先給 AI Agent 一把金鑰。金鑰代表代理，不是資料庫密碼。它可以設定範圍，也可以撤銷。

1. **文章直接進資料庫。** AI Agent 把文章交給 MCP 伺服器。伺服器驗證請求，直接把文章寫進資料庫。
2. **上傳 URL 由 MCP 取得。** 需要圖片時，AI Agent 向 MCP 伺服器要求一個上傳位置。伺服器回傳一個單一物件的短效 URL。
3. **圖片進 RustFS。** AI Agent 用這個 URL 把圖片位元組 `PUT` 到 RustFS。MCP 伺服器不代理圖片。
4. **文章與圖片一起公開。** 公開頁面從資料庫讀文章、從 RustFS 讀圖片，通常透過 CDN 或反向代理。兩者一起呈現給使用者。

實務上，任何一步都可能失敗。URL 過期就重新申請一個。檔案與宣告類型不符就拒絕。上傳了卻沒被引用，就排程清理。這些是維運細節，不是把儲存桶金鑰交給模型的理由。

## MCP 請求的形狀

<figure class="fig">
  <img src="/images/mcp-publishing/mcp-stack.webp" alt="Spring AI 的 MCP 堆疊圖：MCP 用戶端與伺服器各自在傳輸層之上有 session 層，底部列出 stdio、SSE 等傳輸。" width="1600" height="909" loading="lazy" />
  <figcaption><b>官方圖示</b> — Spring AI 對 MCP 堆疊的畫法：用戶端與伺服器各自在傳輸層之上維持 session，JSON-RPC 訊息跨越傳輸層。圖下方以 stdio 與 SSE 為例；本站建置的 HTTP 端點就位於同一個傳輸層。資料來源：<a href="https://docs.spring.io/spring-ai/reference/api/mcp/mcp-overview.html">Spring AI — MCP overview</a></figcaption>
</figure>

請求的形狀很簡單。以下工具名稱與參數是文章裡的簡寫；真正的名稱留在服務內部。

假設 MCP 端點是 `POST /mcp`，金鑰放在 `Authorization` 標頭：

```http
POST /mcp HTTP/1.1
Host: example.com
Authorization: Bearer <MCP_KEY>
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "update_article",
    "arguments": {
      "article_id": "article-123",
      "title": "A new title",
      "body": "The updated article..."
    }
  }
}
```

成功回應可以只是一段文字：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      { "type": "text", "text": "Article updated." }
    ]
  }
}
```

上傳請求也是同一個形狀。伺服器回傳短效 URL，而不是檔案：

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "request_upload",
    "arguments": {
      "filename": "cover.webp",
      "content_type": "image/webp"
    }
  }
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "PUT https://rustfs.example/tmp/cover.webp?X-Amz-... (expires in 10 minutes)"
      }
    ]
  }
}
```

用戶端接著用回傳的 `Content-Type` 做一般的 `PUT`。最後再呼叫一次 MCP，把上傳物件接到文章；或由伺服器檢查物件後自行接上。

## 實際做下來，哪些設計選擇重要

- **金鑰要有範圍。** 內容金鑰不能管理整個儲存叢集。
- **只簽一個物件。** 用戶端不能選儲存桶、路徑或到期時間。
- **窗口要短。** 預簽 URL 是 bearer 能力，把它當密碼看。
- **上傳後要驗證。** `PUT` URL 不是完整的上傳政策。檢查類型與大小，不符就刪除。
- **讀寫路徑分開。** 公開讀取走 CDN 或反向代理；私有寫入走簽章 URL。
- **發佈保留人工。** 代理可以起草與準備，但要不要上線由人決定。

這些選擇讓實作小到可以推理。

## 這次改變了什麼

有趣的地方不是上傳，而是分離。AI Agent 拿到的是內容能力與一個物件 URL，不是儲存憑證。MCP 伺服器可以保持很小，因為它不代理檔案。RustFS 做物件儲存擅長的事，公開頁面讀一個穩定的引用。

實作是一個 Spring Boot 服務、一個資料庫，以及 RustFS。工具可以不同，模式可以攜帶。代理可以在不持有儲存桶金鑰的情況下發佈文章。這是我想要的性質，現在系統也有了。

## 參考資料

- [RustFS：S3 相容 API](https://docs.rustfs.com/en/administration/protocols/s3) — SigV4、path-style 定址與預簽 GET/PUT URL。
- [RustFS 文件](https://docs.rustfs.com/en/) — 安裝、IAM、TLS 與維運。
- [MCP 規格](https://modelcontextprotocol.io/specification/2026-07-28) — JSON-RPC 訊息與工具呼叫。
- [Spring AI MCP server](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html) — 其中一種 hosting MCP 端點的方式。
- [Amazon S3 預簽 URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) — 能力模型與限制。
