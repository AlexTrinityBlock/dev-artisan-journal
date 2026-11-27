---
title: "Publishing Through MCP"
description: "How the site's latest-articles section now lets an AI Agent update articles through MCP — with a scoped key, one short-lived RustFS upload URL, and a database-backed article that goes public with its image."
pubDate: 2026-11-25
category: "AI"
tags: ["MCP", "Spring Boot", "RustFS", "S3", "Architecture"]
featured: false
author: "Alex.Hsiao"
readTime: "8 min read"
cardImage: "./cover.webp"
cardImageAlt: "MCP client and server stack with session and transport layers"
---

# Publishing Through MCP

## What is running now

The latest-articles section of the contract-work site used to be browser-only. It is not anymore. An AI Agent can now draft and update articles through MCP, and attach images. The human editor still exists; the agent is a second client, with a narrower key.

That is the part worth writing down. The implementation is a Spring Boot service with an MCP endpoint, a database for article content, and RustFS for images. I am not publishing the full tool catalog or the table definitions here. The interesting part is not the schema; it is the division of responsibility.

The agent never receives a database URL or a RustFS access key. It receives a key for the content operation and, when it needs an image, one short-lived upload URL.

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">MCP PUBLISHING // 00</span>
    <p class="mfig-lead-kicker">The useful question is not "can the AI write?" but "what should it be allowed to touch?"</p>
    <h3 class="mfig-lead-title">Give the agent a capability, not the bucket keys.</h3>
    <p class="mfig-lead-sub">MCP carries the content operation. A pre-signed URL carries one file. RustFS carries the bytes.</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg></div>
      <div class="mfig-tag">MCP // KEY</div>
      <h4>A narrow permission</h4>
      <p>The admin issues a key to the AI client. The server checks the key and decides what it may do.</p>
      <div class="mfig-meta">IDENTITY · SCOPE · REVOKE</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg></div>
      <div class="mfig-tag">S3 // PRESIGNED</div>
      <h4>One object, one window</h4>
      <p>The server signs a URL for a single object and a short expiry. The model uploads directly.</p>
      <div class="mfig-meta">ONE KEY · TEN MINUTES</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg></div>
      <div class="mfig-tag">ARTICLE // REFERENCE</div>
      <h4>The article stays in the database</h4>
      <p>The image stays in RustFS. The public page reads both and presents them together.</p>
      <div class="mfig-meta">DATABASE · RUSTFS · PUBLIC</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 128" role="img" aria-labelledby="pub-lead-title pub-lead-desc">
    <title id="pub-lead-title">The publishing flow in one line</title>
    <desc id="pub-lead-desc">An AI client calls an MCP server, the server checks the key, signs one upload URL, the client puts bytes into RustFS, and the article stores a reference to the uploaded object.</desc>
    <defs>
      <marker id="pub-lead-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="16" class="f" font-size="7.5" letter-spacing="1.2">ONE IDEA // SIX MOVES</text>
    <text x="816" y="16" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">CAPABILITY, NOT CREDENTIALS</text>
    <line x1="24" y1="24" x2="816" y2="24" class="rule"/>
    <rect x="24" y="38" width="118" height="50" class="term"/>
    <text x="42" y="58" class="f" font-size="6.2" letter-spacing="0.6">CLIENT</text>
    <text x="42" y="74" class="t" font-size="9.2" font-weight="800">AI AGENT</text>
    <line x1="142" y1="63" x2="160" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="162" y="38" width="118" height="50" class="box"/>
    <text x="180" y="58" class="f" font-size="6.2" letter-spacing="0.6">CONTENT</text>
    <text x="180" y="74" class="t" font-size="9.2" font-weight="800">MCP</text>
    <line x1="280" y1="63" x2="298" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="300" y="38" width="118" height="50" class="codebox"/>
    <text x="318" y="58" class="f" font-size="6.2" letter-spacing="0.6">AUTH</text>
    <text x="318" y="74" class="t" font-size="9.2" font-weight="800">CHECK</text>
    <line x1="418" y1="63" x2="436" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="438" y="38" width="118" height="50" class="term"/>
    <text x="456" y="58" class="f" font-size="6.2" letter-spacing="0.6">UPLOAD</text>
    <text x="456" y="74" class="t" font-size="9.2" font-weight="800">SIGN</text>
    <line x1="556" y1="63" x2="574" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="576" y="38" width="118" height="50" class="box"/>
    <text x="594" y="58" class="f" font-size="6.2" letter-spacing="0.6">STORAGE</text>
    <text x="594" y="74" class="t" font-size="9.2" font-weight="800">RUSTFS</text>
    <line x1="694" y1="63" x2="712" y2="63" class="arrow" marker-end="url(#pub-lead-arrow)"/>
    <rect x="714" y="38" width="118" height="50" class="term"/>
    <text x="732" y="58" class="f" font-size="6.2" letter-spacing="0.6">CONTENT</text>
    <text x="732" y="74" class="t" font-size="9.2" font-weight="800">ARTICLE</text>
    <text x="420" y="110" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">THE API NEVER NEEDS THE BUCKET SECRET · THE URL IS THE ONLY WRITE CAPABILITY</text>
    <text x="420" y="122" class="f" font-size="6.2" text-anchor="middle">START WITH A KEY, END WITH A REFERENCE</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>The image is a separate concern from the article.</b> That separation is what keeps the model away from storage credentials.</p>
</section>

<p class="mfig-bridge">The rest is the running architecture, the four steps, and the request shape that makes the separation work.</p>

## Why RustFS

RustFS is a distributed, S3-compatible object storage system written in Rust. I used it because it speaks the S3 API and supports presigned GET/PUT URLs. That let the application sign an upload without handing the agent a storage credential.

For this build, three properties mattered:

- **A pre-signed URL is a capability.** The server can sign one URL for one object and one short window. The agent does not need the RustFS access key.
- **Bytes can go directly to storage.** The application server signs the URL and steps out of the transfer path. It handles metadata, not megabytes.
- **The public side can stay read-only.** Uploads stay in a private bucket, and the published image is served through a reverse proxy or CDN. The upload path and the read path do not need the same permissions.

One caveat: S3 compatibility is a target, not an identity. RustFS documents the operations it supports and the areas where it differs from AWS S3. Test the exact operations you use, and sign URLs against the endpoint the client can actually reach; the scheme, host, port, region, and object path are part of the signature.

## The architecture

The running architecture is deliberately small. An AI Agent calls the MCP server. The MCP server writes the article to the database and returns a signed upload URL. The agent uploads the image directly to RustFS. The public page reads the article from the database and the image from RustFS.

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">THE SHAPE // 01</span>
    <h3 class="mfig-fig-title">Content through MCP, bytes through storage</h3>
    <p class="mfig-fig-sub">The MCP server never proxies the image. It authenticates the agent, writes the article to the database, and signs one short-lived URL for one object.</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 340" role="img" aria-labelledby="pub-f1-title pub-f1-desc">
    <title id="pub-f1-title">The architecture now running</title>
    <desc id="pub-f1-desc">An AI Agent calls a Spring Boot MCP server. The server writes the article to the database and returns a signed upload URL for RustFS. The agent uploads the image directly to RustFS. Public users read the article from the database and the image from RustFS, usually through a CDN or reverse proxy.</desc>
    <defs>
      <marker id="pub-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="pub-f1-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">ONE MCP ENDPOINT // ONE SIGNED URL // ONE PUBLIC PAGE</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">BUILT AND RUNNING</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="48" width="160" height="64" class="term"/>
    <text x="36" y="66" class="f" font-size="6.4" letter-spacing="0.7">CLIENT</text>
    <text x="36" y="86" class="t" font-size="9.4" font-weight="800">AI AGENT</text>
    <text x="36" y="100" class="m" font-size="6.4">MCP client</text>
    <rect x="250" y="48" width="180" height="64" class="box"/>
    <text x="262" y="66" class="f" font-size="6.4" letter-spacing="0.7">CONTENT PLANE</text>
    <text x="262" y="86" class="t" font-size="9.4" font-weight="800">MCP SERVER</text>
    <text x="262" y="100" class="m" font-size="6.4">Spring Boot · auth · sign</text>
    <rect x="500" y="48" width="170" height="64" class="term"/>
    <text x="512" y="66" class="f" font-size="6.4" letter-spacing="0.7">STORAGE</text>
    <text x="512" y="86" class="t" font-size="9.4" font-weight="800">DATABASE</text>
    <text x="512" y="100" class="m" font-size="6.4">article content</text>
    <line x1="184" y1="80" x2="246" y2="80" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="190" y="72" class="f" font-size="6">ARTICLE</text>
    <line x1="430" y1="80" x2="496" y2="80" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="436" y="72" class="f" font-size="6">SAVE</text>
    <path d="M250 96 H220 V160 H140 V112" class="dash" marker-end="url(#pub-f1-arrow-muted)"/>
    <text x="146" y="154" class="f" font-size="6">SIGNED URL</text>
    <rect x="250" y="210" width="180" height="64" class="codebox"/>
    <text x="262" y="228" class="f" font-size="6.4" letter-spacing="0.7">OBJECT STORAGE</text>
    <text x="262" y="248" class="t" font-size="9.4" font-weight="800">RUSTFS</text>
    <text x="262" y="262" class="m" font-size="6.4">image object</text>
    <path d="M80 112 V242 H246" class="dash" fill="none" marker-end="url(#pub-f1-arrow-muted)"/>
    <text x="88" y="184" class="f" font-size="6">PUT IMAGE</text>
    <rect x="500" y="210" width="170" height="64" class="box"/>
    <text x="512" y="228" class="f" font-size="6.4" letter-spacing="0.7">READ PATH</text>
    <text x="512" y="248" class="t" font-size="9.4" font-weight="800">PUBLIC USERS</text>
    <text x="512" y="262" class="m" font-size="6.4">article + image</text>
    <line x1="585" y1="112" x2="585" y2="206" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="593" y="160" class="f" font-size="6">ARTICLE</text>
    <line x1="430" y1="242" x2="496" y2="242" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="436" y="234" class="f" font-size="6">IMAGE</text>
    <text x="24" y="310" class="f" font-size="6.4" letter-spacing="0.5">MCP WRITES THE ARTICLE AND RETURNS ONE SIGNED URL · IT NEVER PROXIES THE IMAGE</text>
    <text x="24" y="324" class="f" font-size="6.2">DATABASE = ARTICLE · RUSTFS = IMAGE · THE PUBLIC PAGE READS BOTH</text>
  </svg>
  </div>
  <p class="mfig-fig-src">AI AGENT · MCP · DATABASE · RUSTFS · PUBLIC USERS</p>
</figure>

## Four steps

The flow has four steps, plus the key that starts it.

An admin gives the AI Agent a key. The key identifies the agent; it is not a database password. It can be scoped and revoked.

1. **The article goes to the database.** The AI Agent calls the MCP server with the article. The server validates the request and writes the article straight to the database.
2. **The upload URL comes from MCP.** For an image, the AI Agent asks the MCP server for an upload slot. The server returns a short-lived URL for one object.
3. **The image goes to RustFS.** The AI Agent sends a `PUT` with the image bytes to RustFS. The MCP server does not proxy the image.
4. **Article and image go public together.** The public page reads the article from the database and the image from RustFS, usually through a CDN or reverse proxy. The two are presented as one page.

In practice, a failure can stop at any step. An expired URL needs a new ticket. A file that does not match its declared type is rejected. An image that is uploaded but never published is cleaned up. Those are operational details, not reasons to give the model the bucket key.

## The MCP request shape

<figure class="fig">
  <img src="/images/mcp-publishing/mcp-stack.webp" alt="Spring AI's MCP stack diagram: an MCP client and server, each with a session layer above a transport layer, with stdio, SSE, and other transports at the base." width="1600" height="909" loading="lazy" />
  <figcaption><b>Official diagram</b> — The MCP stack as Spring AI draws it: the client and the server each keep a session above a transport, and JSON-RPC messages cross the transport layer. The footer lists stdio and SSE as examples; the HTTP endpoint in this build sits in that same transport layer. Source: <a href="https://docs.spring.io/spring-ai/reference/api/mcp/mcp-overview.html">Spring AI — MCP overview</a></figcaption>
</figure>

The request shape is simple. The tool names and parameters below are abbreviated for the article; the real ones stay inside the service.

Assume the MCP endpoint is `POST /mcp` and the key travels in the `Authorization` header:

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

A successful response can be as simple as text:

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

The upload request follows the same shape. The server returns a short-lived URL instead of the file:

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

The client then performs a normal `PUT` with the returned `Content-Type`. A final MCP call attaches the uploaded object to the article, or the server does it after checking the object.

## Design choices that mattered

- **Scope the key.** The content key cannot administer the storage cluster.
- **Sign one object.** The client does not choose the bucket, path, or expiry.
- **Keep the window short.** A pre-signed URL is a bearer capability; treat it like a password.
- **Validate after upload.** A `PUT` URL is not a complete upload policy. Check type and size, and delete what does not match.
- **Keep the read path separate.** Public read through a CDN or reverse proxy; private write through a signed URL.
- **Keep a human on publish.** The agent can draft and prepare; a person decides what goes live.

These are the choices that kept the build small enough to reason about.

## What this changed

The interesting part is not the upload. It is the separation of concerns. The AI Agent gets a content capability and a one-object URL, not the storage credentials. The MCP server stays small because it does not proxy files. RustFS does what object storage is good at, and the public page reads a stable reference.

The implementation is a Spring Boot service, a database, and RustFS. The pattern is portable even if the tools are not. The agent can publish an article without ever holding the bucket key. That is the property I wanted, and it is now the property the system has.

## References

- [RustFS: S3-compatible API](https://docs.rustfs.com/en/administration/protocols/s3) — SigV4, path-style addressing, and presigned GET/PUT URLs.
- [RustFS documentation](https://docs.rustfs.com/en/) — installation, IAM, TLS, and operations.
- [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28) — JSON-RPC messages and tool calls.
- [Spring AI MCP server](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html) — one way to host the MCP endpoint.
- [Amazon S3 presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) — the capability model and its limits.
