---
title: "透過 MCP 發佈文章：API Key、預簽上傳與 RustFS"
description: "一份可行性草圖，不是規格：AI 透過 MCP 更新接案網站的最新文章，伺服器只簽一個短效上傳 URL，圖片直接進 RustFS。不把儲存桶金鑰交給模型，也不假裝已經有完整的工具與資料表。"
pubDate: 2026-11-25
category: "AI"
tags: ["MCP", "Spring Boot", "RustFS", "S3", "架構"]
featured: false
author: "Alex.Hsiao"
readTime: "7 分鐘"
---

# 透過 MCP 發佈文章：API Key、預簽上傳與 RustFS

## 想法，不是藍圖

接案宣傳網站有一個最新文章專區。目前是人在瀏覽器裡編輯。現在的想法是讓 AI 也能起草、更新這些文章，並且加入圖片。

問題不是「怎麼把資料庫連線交給模型」，而是「模型最少需要什麼能力」。答案可以很小：一個內容用的 MCP 端點、一個短效檔案 URL，以及一個永遠不把儲存桶金鑰交給模型的物件儲存。

這是一份可行性草圖，不是規格。它刻意不發明資料表名稱、端點清單或完整的工具 schema。HTTP 範例裡的名稱只是佔位符。重點是形狀，而這個形狀可以用很多方式實作。

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
      <h4>存連結，不存位元組</h4>
      <p>文章保留文字與物件引用；頁面從儲存讀取圖片。</p>
      <div class="mfig-meta">文字 · URL · CDN</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 128" role="img" aria-labelledby="pub-lead-title pub-lead-desc">
    <title id="pub-lead-title">發佈想法的一條線</title>
    <desc id="pub-lead-desc">AI 用戶端呼叫 MCP 伺服器，伺服器檢查金鑰、簽一個上傳 URL，用戶端把位元組 PUT 到 RustFS，文章最後保存物件的引用。</desc>
    <defs>
      <marker id="pub-lead-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="16" class="f" font-size="7.5" letter-spacing="1.2">一個想法 // 六個動作</text>
    <text x="816" y="16" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">能力，不是憑證</text>
    <line x1="24" y1="24" x2="816" y2="24" class="rule"/>
    <rect x="24" y="38" width="118" height="50" class="term"/>
    <text x="42" y="58" class="f" font-size="6.2" letter-spacing="0.6">用戶端</text>
    <text x="42" y="74" class="t" font-size="9.2" font-weight="800">AI</text>
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

<p class="mfig-bridge">接下來是一張圖、五個步驟，以及一段明確標成示意的請求範例。</p>

## RustFS 提供什麼

RustFS 是一套分散式、S3 相容的物件儲存，以 Rust 撰寫。官方文件描述常見的 S3 資料平面：儲存桶與物件、multipart 上傳、IAM 與 bucket policy，以及預簽 GET/PUT URL。它使用 Signature Version 4，預設是 path-style 定址。

對這個想法來說，三個特性最重要：

- **預簽 URL 是一種能力。** 伺服器可以為單一物件、單一短窗簽一個 URL。AI 不需要 RustFS 的存取金鑰。
- **位元組可以直接進儲存。** 應用伺服器簽完 URL 就可以退出傳輸路徑。它處理的是中介資料，不是 megabytes。
- **公開端可以維持唯讀。** 上傳留在私有儲存桶，發佈後的圖片再透過反向代理或 CDN 提供。寫入路徑與讀取路徑不需要同一組權限。

一個提醒：S3 相容是目標，不是同一件事。RustFS 文件列出它支援的操作，也列出與 AWS S3 不同的地方。測試你實際會用到的操作，並且用用戶端真的連得到的端點來簽章；scheme、host、port、region 與物件路徑都是簽章的一部分。

## 簡單架構

這張圖刻意很小。用戶端連到 MCP 伺服器。MCP 伺服器更新文章儲存、簽一個上傳 URL。用戶端直接上傳到 RustFS。公開網站透過 CDN 讀取已發佈的物件。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">形狀 // 01</span>
    <h3 class="mfig-fig-title">內容走 MCP，位元組走儲存</h3>
    <p class="mfig-fig-sub">MCP 伺服器不代理圖片。它驗證用戶端、記錄文章變更，並為單一物件簽一個短效 URL。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 320" role="img" aria-labelledby="pub-f1-title pub-f1-desc">
    <title id="pub-f1-title">MCP 發佈文章的簡單架構</title>
    <desc id="pub-f1-desc">管理員或 AI 用戶端呼叫 Spring Boot MCP 伺服器。伺服器更新文章儲存，並為 RustFS 簽一個上傳 URL。用戶端直接把位元組上傳到 RustFS。CDN 或反向代理把已發佈的物件提供給公開網站。</desc>
    <defs>
      <marker id="pub-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="pub-f1-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一個 MCP 端點 // 一個簽章 URL // 一個物件儲存</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">可行性草圖</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="48" width="160" height="64" class="term"/>
    <text x="36" y="66" class="f" font-size="6.4" letter-spacing="0.7">用戶端</text>
    <text x="36" y="86" class="t" font-size="9.4" font-weight="800">管理員 / AI</text>
    <text x="36" y="100" class="m" font-size="6.4">session 或 MCP 金鑰</text>
    <rect x="250" y="48" width="180" height="64" class="box"/>
    <text x="262" y="66" class="f" font-size="6.4" letter-spacing="0.7">內容平面</text>
    <text x="262" y="86" class="t" font-size="9.4" font-weight="800">MCP 伺服器</text>
    <text x="262" y="100" class="m" font-size="6.4">Spring Boot · 驗證 · 簽章</text>
    <rect x="500" y="48" width="170" height="64" class="term"/>
    <text x="512" y="66" class="f" font-size="6.4" letter-spacing="0.7">文字 + 中介資料</text>
    <text x="512" y="86" class="t" font-size="9.4" font-weight="800">文章儲存</text>
    <text x="512" y="100" class="m" font-size="6.4">標題 · 內文 · 物件引用</text>
    <line x1="184" y1="80" x2="246" y2="80" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="190" y="72" class="f" font-size="6">更新／請求</text>
    <line x1="430" y1="80" x2="496" y2="80" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="436" y="72" class="f" font-size="6">儲存</text>
    <rect x="250" y="200" width="180" height="64" class="codebox"/>
    <text x="262" y="218" class="f" font-size="6.4" letter-spacing="0.7">物件儲存</text>
    <text x="262" y="238" class="t" font-size="9.4" font-weight="800">RUSTFS</text>
    <text x="262" y="252" class="m" font-size="6.4">私有上傳桶</text>
    <line x1="340" y1="112" x2="340" y2="196" class="dash" marker-end="url(#pub-f1-arrow-muted)"/>
    <text x="348" y="154" class="f" font-size="6">簽一個 URL</text>
    <path d="M104 112 V232 H246" class="dash" fill="none" marker-end="url(#pub-f1-arrow-muted)"/>
    <text x="112" y="180" class="f" font-size="6">直接 PUT</text>
    <text x="112" y="192" class="f" font-size="6">位元組</text>
    <rect x="500" y="200" width="170" height="64" class="box"/>
    <text x="512" y="218" class="f" font-size="6.4" letter-spacing="0.7">讀取路徑</text>
    <text x="512" y="238" class="t" font-size="9.4" font-weight="800">CDN / 公開網站</text>
    <text x="512" y="252" class="m" font-size="6.4">公開唯讀</text>
    <line x1="430" y1="232" x2="496" y2="232" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="436" y="224" class="f" font-size="6">公開</text>
    <text x="24" y="294" class="f" font-size="6.4" letter-spacing="0.5">MCP 伺服器驗證呼叫者並簽 URL · 它不儲存圖片</text>
    <text x="24" y="308" class="f" font-size="6.2">RUSTFS 保存位元組 · 文章保存引用 · CDN 提供公開副本</text>
  </svg>
  </div>
  <p class="mfig-fig-src">MCP · 文章儲存 · RUSTFS · CDN</p>
</figure>

## 五個步驟

1. **發金鑰。** 管理員為 AI 用戶端建立金鑰。金鑰代表用戶端，不是資料庫密碼。範圍盡量窄，而且要能撤銷。
2. **呼叫 MCP 伺服器。** AI 要求更新文章，或要求保留一個上傳位置。伺服器驗證請求、檢查金鑰，決定這個動作是否允許。
3. **簽一個 URL。** 伺服器選定物件鍵、內容類型與到期時間，然後為那一個物件簽 URL。AI 不能選儲存桶或路徑。
4. **直接上傳。** AI 用簽章 URL 對 RustFS 發出 `PUT`。應用伺服器看到的是請求中介資料，不是圖片位元組。
5. **保存引用。** 文章保存文字與上傳物件的引用。公開頁面再透過 CDN 解析這個引用。

任何一步都可能失敗。URL 過期就換一張新的票。檔案與宣告類型不符就拒絕。上傳了卻沒被引用，就排程清理。這些是維運細節，不是把儲存桶金鑰交給模型的理由。

## MCP HTTP 請求，示意用

工具名稱與參數由你定義。以下名稱是佔位符，不代表這個專案已經有這些端點。

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

## 要留意的事

- **金鑰要有範圍。** 內容金鑰不應該能管理整個儲存叢集。
- **只簽一個物件。** 不要讓用戶端選儲存桶、路徑或到期時間。
- **窗口要短。** 預簽 URL 是 bearer 能力，把它當密碼看。
- **上傳後要驗證。** `PUT` URL 不是完整的上傳政策。檢查類型與大小，不符就刪除。
- **讀寫路徑分開。** 公開讀取走 CDN 或反向代理；私有寫入走簽章 URL。
- **發佈保留人工。** AI 可以起草與準備，但要不要上線由人決定。

## 為什麼值得試

有趣的地方不是上傳，而是分離。AI 拿到的是內容能力與一個物件 URL，不是儲存憑證。MCP 伺服器可以保持很小，因為它不代理檔案。RustFS 做物件儲存擅長的事，公開網站讀一個穩定的引用。

實作可以是 Spring Boot 服務、小型 Node 程序、serverless function，或託管的 MCP 平台。工具可以不同，模式可以攜帶。這才是值得實驗的部分。

## 參考資料

- [RustFS：S3 相容 API](https://docs.rustfs.com/en/administration/protocols/s3) — SigV4、path-style 定址與預簽 GET/PUT URL。
- [RustFS 文件](https://docs.rustfs.com/en/) — 安裝、IAM、TLS 與維運。
- [MCP 規格](https://modelcontextprotocol.io/specification/2026-07-28) — JSON-RPC 訊息與工具呼叫。
- [Spring AI MCP server](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html) — 其中一種 hosting MCP 端點的方式。
- [Amazon S3 預簽 URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) — 能力模型與限制。
