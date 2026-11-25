---
title: "通过 MCP 发布文章：API Key、预签名上传与 RustFS"
description: "一份可行性草图，不是规格：AI 通过 MCP 更新接案网站的最新文章，服务器只签发一个短期有效上传 URL，图片直接进 RustFS。不把存储桶密钥交给模型，也不假装已经有完整的工具与数据表。"
pubDate: 2026-11-25
category: "AI"
tags: ["MCP", "Spring Boot", "RustFS", "S3", "架构"]
featured: false
author: "Alex.Hsiao"
readTime: "7 分钟"
---

# 通过 MCP 发布文章：API Key、预签名上传与 RustFS

## 想法，不是蓝图

接案宣传网站有一个最新文章专区。目前是人在浏览器里编辑。现在的想法是让 AI 也能起草、更新这些文章，并且加入图片。

问题不是「怎么把数据库连接交给模型」，而是「模型最少需要什么能力」。答案可以很小：一个内容用的 MCP 端点、一个短期有效文件 URL，以及一个永远不把存储桶密钥交给模型的对象存储。

这是一份可行性草图，不是规格。它刻意不发明数据表名称、端点清单或完整的工具 schema。HTTP 示例里的名称只是占位符。重点是形状，而这个形状可以用很多方式实现。

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">MCP 发布 // 00</span>
    <p class="mfig-lead-kicker">真正有用的问题不是「AI 能不能写」，而是「它应该被允许碰什么」。</p>
    <h3 class="mfig-lead-title">给代理一个能力，而不是存储桶密钥。</h3>
    <p class="mfig-lead-sub">MCP 负责内容操作，预签名 URL 负责一个文件，RustFS 负责字节。</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg></div>
      <div class="mfig-tag">MCP // 密钥</div>
      <h4>一个狭窄的权限</h4>
      <p>管理员发密钥给 AI 客户端。服务器检查密钥，决定它能做什么。</p>
      <div class="mfig-meta">身份 · 范围 · 撤销</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg></div>
      <div class="mfig-tag">S3 // 预签名</div>
      <h4>一个对象，一个短窗口</h4>
      <p>服务器只为单一对象签发一个短期有效 URL，模型直接上传。</p>
      <div class="mfig-meta">一个对象 · 十分钟</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg></div>
      <div class="mfig-tag">文章 // 引用</div>
      <h4>文章放数据库，图片放 RustFS</h4>
      <p>文章留在数据库，图片留在 RustFS；公开页面把两者一起呈现。</p>
      <div class="mfig-meta">数据库 · RUSTFS · 公开</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 128" role="img" aria-labelledby="pub-lead-title pub-lead-desc">
    <title id="pub-lead-title">发布想法的一条线</title>
    <desc id="pub-lead-desc">AI 客户端调用 MCP 服务器，服务器检查密钥、签发一个上传 URL，客户端把字节 PUT 到 RustFS，文章最后保存对象的引用。</desc>
    <defs>
      <marker id="pub-lead-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="16" class="f" font-size="7.5" letter-spacing="1.2">一个想法 // 六个动作</text>
    <text x="816" y="16" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">能力，不是凭证</text>
    <line x1="24" y1="24" x2="816" y2="24" class="rule"/>
    <rect x="24" y="38" width="118" height="50" class="term"/>
    <text x="42" y="58" class="f" font-size="6.2" letter-spacing="0.6">客户端</text>
    <text x="42" y="74" class="t" font-size="9.2" font-weight="800">AI AGENT</text>
    <line x1="142" y1="63" x2="160" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="162" y="38" width="118" height="50" class="box"/>
    <text x="180" y="58" class="f" font-size="6.2" letter-spacing="0.6">内容</text>
    <text x="180" y="74" class="t" font-size="9.2" font-weight="800">MCP</text>
    <line x1="280" y1="63" x2="298" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="300" y="38" width="118" height="50" class="codebox"/>
    <text x="318" y="58" class="f" font-size="6.2" letter-spacing="0.6">验证</text>
    <text x="318" y="74" class="t" font-size="9.2" font-weight="800">检查</text>
    <line x1="418" y1="63" x2="436" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="438" y="38" width="118" height="50" class="term"/>
    <text x="456" y="58" class="f" font-size="6.2" letter-spacing="0.6">上传</text>
    <text x="456" y="74" class="t" font-size="9.2" font-weight="800">签署</text>
    <line x1="556" y1="63" x2="574" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="576" y="38" width="118" height="50" class="box"/>
    <text x="594" y="58" class="f" font-size="6.2" letter-spacing="0.6">存储</text>
    <text x="594" y="74" class="t" font-size="9.2" font-weight="800">RUSTFS</text>
    <line x1="694" y1="63" x2="712" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="714" y="38" width="118" height="50" class="term"/>
    <text x="732" y="58" class="f" font-size="6.2" letter-spacing="0.6">内容</text>
    <text x="732" y="74" class="t" font-size="9.2" font-weight="800">文章</text>
    <text x="420" y="110" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">API 永远不需要存储桶密钥 · URL 是唯一的写入能力</text>
    <text x="420" y="122" class="f" font-size="6.2" text-anchor="middle">从密钥开始，以引用结束</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>图片和文章是两件事。</b>这个分离让模型不必碰存储凭证。</p>
</section>

<p class="mfig-bridge">接下来是一张图、四个步骤，以及一段明确标成示意的请求示例。</p>

## RustFS 提供什么

RustFS 是一套分布式、S3 兼容的对象存储，以 Rust 编写。官方文件描述常见的 S3 数据平面：存储桶与对象、multipart 上传、IAM 与 bucket policy，以及预签名 GET/PUT URL。它使用 Signature Version 4，默认是 path-style 定址。

对这个想法来说，三个特性最重要：

- **预签名 URL 是一种能力。** 服务器可以为单一对象、单一短窗口签发一个 URL。AI 不需要 RustFS 的访问密钥。
- **字节可以直接进存储。** 应用服务器签完 URL 就可以退出传输路径。它处理的是元数据，不是 megabytes。
- **公开端可以维持唯读。** 上传留在私有存储桶，发布后的图片再通过反向代理或 CDN 提供。写入路径与读取路径不需要同一组权限。

一个提醒：S3 兼容是目标，不是同一件事。RustFS 文件列出它支援的操作，也列出与 AWS S3 不同的地方。测试你实际会用到的操作，并且用客户端真的连得到的端点来签名；scheme、host、port、region 与对象路径都是签名的一部分。

## 简单架构

这张图刻意很小。AI Agent 连到 MCP 服务器。MCP 服务器把文章直接写进数据库，并签一个上传 URL。AI Agent 直接把图片上传到 RustFS。公开页面从数据库读文章、从 RustFS 读图片。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">形状 // 01</span>
    <h3 class="mfig-fig-title">内容走 MCP，字节走存储</h3>
    <p class="mfig-fig-sub">MCP 服务器不代理图片。它验证代理、把文章写进数据库，并为单个对象签发一个短期有效 URL。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 340" role="img" aria-labelledby="pub-f1-title pub-f1-desc">
    <title id="pub-f1-title">MCP 发布文章的简单架构</title>
    <desc id="pub-f1-desc">AI Agent 调用 Spring Boot MCP 服务器。服务器把文章写进数据库，并返回一个 RustFS 的上传 URL。AI Agent 直接把图片上传到 RustFS。公开用户从数据库读文章、从 RustFS 读图片，通常通过 CDN 或反向代理。</desc>
    <defs>
      <marker id="pub-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="pub-f1-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一个 MCP 端点 // 一个预签名 URL // 一个公开页面</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">可行性草图</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="48" width="160" height="64" class="term"/>
    <text x="36" y="66" class="f" font-size="6.4" letter-spacing="0.7">客户端</text>
    <text x="36" y="86" class="t" font-size="9.4" font-weight="800">AI AGENT</text>
    <text x="36" y="100" class="m" font-size="6.4">MCP 客户端</text>
    <rect x="250" y="48" width="180" height="64" class="box"/>
    <text x="262" y="66" class="f" font-size="6.4" letter-spacing="0.7">内容平面</text>
    <text x="262" y="86" class="t" font-size="9.4" font-weight="800">MCP 服务器</text>
    <text x="262" y="100" class="m" font-size="6.4">Spring Boot · 验证 · 签名</text>
    <rect x="500" y="48" width="170" height="64" class="term"/>
    <text x="512" y="66" class="f" font-size="6.4" letter-spacing="0.7">存储</text>
    <text x="512" y="86" class="t" font-size="9.4" font-weight="800">数据库</text>
    <text x="512" y="100" class="m" font-size="6.4">文章内容</text>
    <line x1="184" y1="80" x2="246" y2="80" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="190" y="72" class="f" font-size="6">文章</text>
    <line x1="430" y1="80" x2="496" y2="80" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="436" y="72" class="f" font-size="6">写入</text>
    <path d="M250 96 H220 V160 H140 V112" class="dash" marker-end="url(#pub-f1-arrow-muted)"/>
    <text x="146" y="154" class="f" font-size="6">预签名 URL</text>
    <rect x="250" y="210" width="180" height="64" class="codebox"/>
    <text x="262" y="228" class="f" font-size="6.4" letter-spacing="0.7">对象存储</text>
    <text x="262" y="248" class="t" font-size="9.4" font-weight="800">RUSTFS</text>
    <text x="262" y="262" class="m" font-size="6.4">图片对象</text>
    <path d="M80 112 V242 H246" class="dash" fill="none" marker-end="url(#pub-f1-arrow-muted)"/>
    <text x="88" y="184" class="f" font-size="6">上传图片</text>
    <rect x="500" y="210" width="170" height="64" class="box"/>
    <text x="512" y="228" class="f" font-size="6.4" letter-spacing="0.7">读取路径</text>
    <text x="512" y="248" class="t" font-size="9.4" font-weight="800">公开用户</text>
    <text x="512" y="262" class="m" font-size="6.4">文章 + 图片</text>
    <line x1="585" y1="112" x2="585" y2="206" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="593" y="160" class="f" font-size="6">文章</text>
    <line x1="430" y1="242" x2="496" y2="242" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="436" y="234" class="f" font-size="6">图片</text>
    <text x="24" y="310" class="f" font-size="6.4" letter-spacing="0.5">MCP 写入文章并返回一个预签名 URL · 它从不代理图片</text>
    <text x="24" y="324" class="f" font-size="6.2">数据库 = 文章 · RUSTFS = 图片 · 公开页面读取两者</text>
  </svg>
  </div>
  <p class="mfig-fig-src">AI AGENT · MCP · 数据库 · RUSTFS · 公开用户</p>
</figure>

## 四个步骤（外加一把密钥）

第一步之前，管理员先给 AI Agent 一把密钥。密钥代表代理，不是数据库密码。范围尽量窄，而且要能撤销。

1. **文章直接进数据库。** AI Agent 把文章交给 MCP 服务器。服务器验证请求，直接把文章写进数据库。
2. **上传 URL 由 MCP 取得。** 需要图片时，AI Agent 向 MCP 服务器请求一个上传位置。服务器返回一个单对象的短期有效 URL。
3. **图片进 RustFS。** AI Agent 用这个 URL 把图片字节 `PUT` 到 RustFS。MCP 服务器不代理图片。
4. **文章与图片一起公开。** 公开页面从数据库读文章、从 RustFS 读图片，通常通过 CDN 或反向代理。两者一起呈现给用户。

任何一步都可能失败。URL 过期就重新申请一个。文件与声明类型不符就拒绝。上传了却没被引用，就定时清理。这些是运维细节，不是把存储桶密钥交给模型的理由。

## MCP HTTP 请求，示意用

工具名称与参数由你定义。以下名称是占位符，不代表这个专案已经有这些端点。

假设 MCP 端点是 `POST /mcp`，密钥放在 `Authorization` 标头：

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

成功响应可以只是一段文字：

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

上传请求也是同一个形状。服务器返回短期有效 URL，而不是文件：

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

客户端接著用返回的 `Content-Type` 做一般的 `PUT`。最后再调用一次 MCP，把上传对象接到文章；或由服务器检查对象后自行接上。

## 要注意的事

- **密钥要有范围。** 内容密钥不应该能管理整个存储丛集。
- **只签发一个对象。** 不要让客户端选存储桶、路径或到期时间。
- **窗口要短。** 预签名 URL 是 bearer 能力，把它当密码看。
- **上传后要验证。** `PUT` URL 不是完整的上传政策。检查类型与大小，不符就删除。
- **读写路径分开。** 公开读取走 CDN 或反向代理；私有写入走签名 URL。
- **发布保留人工。** AI 可以起草与准备，但要不要上线由人决定。

## 为什么值得试

有趣的地方不是上传，而是分离。AI 拿到的是内容能力与一个对象 URL，不是存储凭证。MCP 服务器可以保持很小，因为它不代理文件。RustFS 做对象存储擅长的事，公开网站读一个稳定的引用。

实现可以是 Spring Boot 服务、小型 Node 程序、serverless function，或托管的 MCP 平台。工具可以不同，模式可以携带。这才是值得实验的部分。

## 参考资料

- [RustFS：S3 兼容 API](https://docs.rustfs.com/en/administration/protocols/s3) — SigV4、path-style 定址与预签名 GET/PUT URL。
- [RustFS 文件](https://docs.rustfs.com/en/) — 安装、IAM、TLS 与运维。
- [MCP 规格](https://modelcontextprotocol.io/specification/2026-07-28) — JSON-RPC 讯息与工具调用。
- [Spring AI MCP server](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html) — 其中一种 hosting MCP 端点的方式。
- [Amazon S3 预签名 URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) — 能力模型与限制。
