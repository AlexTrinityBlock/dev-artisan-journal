---
title: "Publishing Through MCP: API Keys, Pre-Signed Uploads, and RustFS"
description: "How a Spring Boot MCP server lets an AI update a contract-work site's latest articles — with scoped API keys, versioned writes, and time-limited pre-signed image uploads to S3-compatible RustFS."
pubDate: 2026-11-25
category: "AI"
tags: ["MCP", "Spring Boot", "RustFS", "S3", "Security"]
featured: false
author: "Alex.Hsiao"
readTime: "13 min read"
---

# Publishing Through MCP: API Keys, Pre-Signed Uploads, and RustFS

## The site, and the two doors

A contract-work marketing site has a small, high-value surface: service pages, a portfolio, contact details, and a latest-articles section that proves the team is still shipping. The first three change once a quarter. The fourth wants to change every week.

The admin already has a React editor. The new requirement is narrower than it sounds: let an AI assistant draft and update articles, and let it add images. The risky version gives the model a database URL and an S3 access key. The safe version gives it a few tools and a ten-minute URL.

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">MCP PUBLISHING // 00</span>
    <p class="mfig-lead-kicker">An AI can write the article without ever holding the bucket key.</p>
    <h3 class="mfig-lead-title">Give the agent a tool, not the storage credentials.</h3>
    <p class="mfig-lead-sub">A Spring Boot MCP server checks the key, signs one upload, and lets RustFS carry the bytes.</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg></div>
      <div class="mfig-tag">MCP // KEY</div>
      <h4>Who is calling</h4>
      <p>An admin-issued key, hashed at rest, scoped per tool family, revoked with one row.</p>
      <div class="mfig-meta">BEARER · SCOPES · AUDIT</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg></div>
      <div class="mfig-tag">S3 // PRESIGNED</div>
      <h4>One object, one window</h4>
      <p>A ten-minute PUT URL bound to a server-chosen key, content type, and byte budget.</p>
      <div class="mfig-meta">TTL · TYPE · ONE OBJECT</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg></div>
      <div class="mfig-tag">RUSTFS // OBJECT</div>
      <h4>Bytes go direct</h4>
      <p>The API signs; RustFS stores. The image never passes through the JVM.</p>
      <div class="mfig-meta">STAGING · PUBLIC · CDN</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 170" role="img" aria-labelledby="pub-lead-title pub-lead-desc">
    <title id="pub-lead-title">The MCP image publishing path</title>
    <desc id="pub-lead-desc">An AI host calls a scoped MCP tool, the server checks the key and signs one short-lived upload URL, the client PUTs bytes directly to RustFS, then confirms and attaches the image to an article.</desc>
    <defs>
      <marker id="pub-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">ONE KEY // ONE OBJECT // TEN MINUTES</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">THE IMAGE PATH</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="118" height="72" class="term"/>
    <svg x="34" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
    <text x="52" y="64" class="f" font-size="6.2" letter-spacing="0.6">AI HOST</text>
    <text x="34" y="88" class="t" font-size="9.5" font-weight="800">MCP CLIENT</text>
    <text x="34" y="100" class="m" font-size="6.8">one key</text>
    <text x="34" y="112" class="f" font-size="6.2">claude · ide · custom</text>
    <line x1="144" y1="80" x2="160" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="162" y="44" width="118" height="72" class="box"/>
    <svg x="172" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    <text x="190" y="64" class="f" font-size="6.2" letter-spacing="0.6">TOOL</text>
    <text x="172" y="88" class="t mono" font-size="8.6" font-weight="800">request_upload</text>
    <text x="172" y="100" class="m" font-size="6.8">article + type</text>
    <text x="172" y="112" class="f" font-size="6.2">declared bytes</text>
    <line x1="282" y1="80" x2="298" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="300" y="44" width="118" height="72" class="codebox"/>
    <svg x="310" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
    <text x="328" y="64" class="f" font-size="6.2" letter-spacing="0.6">AUTH</text>
    <text x="310" y="88" class="t" font-size="9.5" font-weight="800">KEY CHECK</text>
    <text x="310" y="100" class="m" font-size="6.8">scope · rate</text>
    <text x="310" y="112" class="f" font-size="6.2">revoked? expired?</text>
    <line x1="420" y1="80" x2="436" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="438" y="44" width="118" height="72" class="term"/>
    <svg x="448" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
    <text x="466" y="64" class="f" font-size="6.2" letter-spacing="0.6">SIGN</text>
    <text x="448" y="88" class="t" font-size="9.5" font-weight="800">PRESIGN</text>
    <text x="448" y="100" class="m" font-size="6.8">10 minutes</text>
    <text x="448" y="112" class="f" font-size="6.2">server-chosen key</text>
    <line x1="558" y1="80" x2="574" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="576" y="44" width="118" height="72" class="box"/>
    <svg x="586" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/></svg>
    <text x="604" y="64" class="f" font-size="6.2" letter-spacing="0.6">UPLOAD</text>
    <text x="586" y="88" class="t" font-size="9.5" font-weight="800">RUSTFS PUT</text>
    <text x="586" y="100" class="m" font-size="6.8">bytes direct</text>
    <text x="586" y="112" class="f" font-size="6.2">no JVM proxy</text>
    <line x1="696" y1="80" x2="712" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="714" y="44" width="118" height="72" class="term"/>
    <svg x="724" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    <text x="742" y="64" class="f" font-size="6.2" letter-spacing="0.6">ATTACH</text>
    <text x="724" y="88" class="t" font-size="9.5" font-weight="800">CONFIRM</text>
    <text x="724" y="100" class="m" font-size="6.8">HEAD + copy</text>
    <text x="724" y="112" class="f" font-size="6.2">article v+1</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">THE API NEVER PROXIES THE IMAGE · THE PRESIGNED URL IS THE ONLY WRITE CAPABILITY</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>The agent gets a capability, not a credential.</b> That distinction is the whole design.</p>
</section>

<p class="mfig-bridge">The rest of this article is the content model, the key model, the upload sequence, and the failures that decide whether the design holds.</p>

## Two doors, one content model

The site has two front doors and one service layer.

- **Admin API.** `/api/admin/**` is authenticated by the admin's session cookie and protected by CSRF. It serves the React editor.
- **MCP endpoint.** `/mcp` is authenticated by an `Authorization: Bearer` API key. It is stateless, has no CSRF token, and speaks JSON-RPC.
- **Public API.** `/api/public/**` is read-only and serves the rendered site.

The MCP server is not a second backend. It is an adapter in front of the same article service. That matters because every business rule — slug uniqueness, translation completeness, publish permissions, version checks — must hold no matter which door the request came through.

The content model is deliberately small:

| Table | What it holds |
| :--- | :--- |
| `content_blocks` | One row per article: id, type, status, version, published_at |
| `block_translations` | One row per locale: title, summary, body Markdown |
| `media_assets` | Object key, content type, bytes, status, attached block |
| `mcp_keys` | Key id, secret hash, scopes, expiry, revocation, last used |
| `audit_log` | Who called which tool, on what, with which outcome |

An article is a `content_blocks` row of type `article`, with one or more `block_translations`. The `version` column is the optimistic lock. The admin editor and the MCP tools both PATCH the same row, so they cannot drift into two different notions of "current".

## The tool surface

Seven tools are enough for the first release. Fewer tools mean fewer descriptions for the model to misread, and a smaller surface to audit.

| Tool | Inputs | Scope | Side effect |
| :--- | :--- | :--- | :--- |
| `list_articles` | status, locale, cursor, limit | `articles:read` | none |
| `get_article` | id or slug | `articles:read` | none |
| `create_article` | request id, locale, title, body | `articles:write` | draft + revision |
| `update_article` | id, expected version, patch | `articles:write` | new revision |
| `publish_article` | id, expected version | `articles:publish` | live + cache purge |
| `request_image_upload` | article id, content type, bytes, request id | `images:write` | pending ticket + URL |
| `confirm_image_upload` | upload id, ETag | `images:write` | validate, copy, attach |

Three choices are worth calling out.

**Publish is separate from write.** An AI can draft all afternoon without changing the public site. Publishing is a distinct scope because it is the one action with a public consequence.

**There is no delete tool.** Deletion is an admin action. An agent that can create and publish does not also need the ability to erase a case study.

**Every write takes an idempotency key.** `create_article` stores `(key_id, client_request_id)` under a unique constraint. If the response is lost and the client retries, the second call returns the first article instead of creating a duplicate.

## Keys are identities, not passwords

A key looks like this:

```text
mcp_live_7f3a9c2e_9Jq...32-random-bytes...xK
```

The middle segment is an indexed `key_id`. The last segment is 32 random bytes, base64url-encoded. The database stores the id, the hash, the scopes, the site it belongs to, and timestamps for expiry, revocation, rotation, and last use.

For a 256-bit random secret, HMAC-SHA-256 with a server-side pepper is sufficient and cheap enough to verify on every request. Argon2id is the right choice when humans choose the secret, because it makes guessing expensive; it is a poor fit for a high-volume machine credential if each verification takes a second. Whichever function is used, compare in constant time and return the same `401` for unknown, revoked, and wrong-secret keys.

Scopes map to authorities and are enforced in the service layer, not only at the MCP route:

```java
public Article updateArticle(Actor actor, UUID id, long expectedVersion, ArticlePatch patch) {
    actor.requireScope("articles:write");
    return articles.update(id, expectedVersion, patch); // UPDATE ... WHERE version = ?
}
```

The key travels in the `Authorization` header on every request. It never appears in a tool argument, a prompt, a query string, or a URL. Tool arguments are model-visible and often logged; a key placed there is a key leaked.

Operationally, the admin needs four buttons: create, rotate, revoke, and inspect last use. Rotation creates a new key linked to the old one, allows an overlap window, then revokes the old key. Rate limits are per key and per tool. The audit log records the key id, tool, target, outcome, latency, request id, IP, and user agent — never the secret, the article body, or the presigned URL.

## Writing an article without racing it

The write path is boring on purpose:

1. The tool validates the payload and the scope.
2. The service opens one transaction.
3. It updates the article with `WHERE id = ? AND version = ?`.
4. If zero rows changed, it returns `409` with the current version.
5. If one row changed, it writes a revision and an audit entry, then commits.

`update_article` therefore requires `expected_version`, and the response returns the new version. The model is instructed to re-read the article after a `409`, merge its change, and retry once. A blind retry with the old version will fail forever, which is the correct behavior.

The same rule protects the admin editor. The editor sends the version it rendered; the MCP tool sends the version it read. Neither can silently overwrite the other.

## Images: sign one object, not the bucket

Images are where "just give the agent S3 access" becomes tempting. The design instead uses two buckets and three calls.

- `media-staging` is private. It accepts short-lived PUTs.
- `media-public` is readable through the CDN. It contains only validated, immutable objects.
- The Spring Boot app holds the only credentials that can write to either bucket.

The sequence is:

1. **Request.** The AI calls `request_image_upload` with the article id, content type, declared size, and an idempotency key.
2. **Ticket.** The server checks the scope, confirms the article is editable, validates the type and size, inserts a `PENDING` row, and generates an object key such as `staging/site/article/<uuid>.webp`. The client never supplies a filename.
3. **Presign.** The server signs a PUT for that exact key, with the exact `Content-Type`, for ten minutes.
4. **Upload.** The AI PUTs the bytes directly to RustFS. The image does not pass through the JVM.
5. **Confirm.** The AI calls `confirm_image_upload` with the upload id and ETag.
6. **Validate and copy.** The server performs a `HEAD`, checks the size and type, optionally checks magic bytes, copies the object into `media-public` with an explicit content type, and flips the row to `ATTACHED` in the same transaction that bumps the article version.
7. **Serve.** The article stores the object key; the public page turns it into a CDN URL.

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">THE ARCHITECTURE // 01</span>
    <h3 class="mfig-fig-title">Two doors, one service layer, two buckets</h3>
    <p class="mfig-fig-sub">Admin sessions and MCP keys meet the same article service. Only the service holds RustFS credentials; clients receive one signed URL at a time.</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 410" role="img" aria-labelledby="pub-f1-title pub-f1-desc">
    <title id="pub-f1-title">Architecture of the MCP publishing pipeline</title>
    <desc id="pub-f1-desc">An admin SPA and an AI MCP client enter through an edge with TLS, WAF, body limits, and origin checks. The Spring Boot application exposes an admin REST API and an MCP endpoint, authenticates both, writes to PostgreSQL, signs uploads, and talks to RustFS. The AI client uploads directly to RustFS with the presigned URL. A CDN reads only the public bucket.</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">TWO DOORS // ONE CONTENT MODEL // TWO BUCKETS</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">TRUST BOUNDARIES</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="48" width="180" height="58" class="box"/>
    <text x="36" y="66" class="f" font-size="6.8" letter-spacing="0.7">ADMIN</text>
    <text x="36" y="86" class="t" font-size="9.2" font-weight="800">SPA EDITOR</text>
    <text x="36" y="99" class="m" font-size="6.6">session + CSRF</text>
    <rect x="636" y="48" width="180" height="58" class="box"/>
    <text x="648" y="66" class="f" font-size="6.8" letter-spacing="0.7">AI</text>
    <text x="648" y="86" class="t" font-size="9.2" font-weight="800">MCP CLIENT</text>
    <text x="648" y="99" class="m" font-size="6.6">bearer key</text>
    <line x1="114" y1="106" x2="114" y2="130" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <line x1="726" y1="106" x2="726" y2="130" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="24" y="132" width="792" height="30" class="term"/>
    <text x="36" y="151" class="f" font-size="6.8" letter-spacing="0.8">EDGE // TLS · WAF · BODY LIMIT · ORIGIN CHECK · RATE LIMIT</text>
    <line x1="420" y1="162" x2="420" y2="190" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="12" y="190" width="816" height="118" class="dash"/>
    <text x="20" y="204" class="f" font-size="6.2" letter-spacing="0.8">TRUSTED APPLICATION NETWORK</text>
    <rect x="24" y="212" width="170" height="76" class="box"/>
    <text x="36" y="230" class="f" font-size="6.6" letter-spacing="0.7">AUTH</text>
    <text x="36" y="250" class="t" font-size="8.8" font-weight="800">SESSION | API KEY</text>
    <text x="36" y="264" class="m" font-size="6.6">scopes · rate limit</text>
    <text x="36" y="276" class="f" font-size="6.2">constant-time verify</text>
    <line x1="194" y1="250" x2="242" y2="250" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="246" y="204" width="340" height="92" class="codebox"/>
    <text x="258" y="222" class="f" font-size="6.6" letter-spacing="0.7">SPRING BOOT</text>
    <rect x="258" y="232" width="150" height="48" class="box"/>
    <text x="268" y="250" class="t" font-size="8.4" font-weight="800">REST /api/admin</text>
    <text x="268" y="264" class="m" font-size="6.4">editor + media</text>
    <rect x="424" y="232" width="150" height="48" class="box"/>
    <text x="434" y="250" class="t" font-size="8.4" font-weight="800">MCP /mcp</text>
    <text x="434" y="264" class="m" font-size="6.4">tools + JSON-RPC</text>
    <text x="258" y="292" class="f" font-size="6.2">ONE ARTICLE SERVICE · ONE VERSION COLUMN</text>
    <line x1="586" y1="250" x2="632" y2="250" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="636" y="212" width="180" height="76" class="box"/>
    <text x="648" y="230" class="f" font-size="6.6" letter-spacing="0.7">POSTGRES</text>
    <text x="648" y="250" class="t" font-size="8.8" font-weight="800">ARTICLES</text>
    <text x="648" y="264" class="m" font-size="6.6">blocks · translations</text>
    <text x="648" y="276" class="f" font-size="6.2">keys · audit · versions</text>
    <line x1="416" y1="296" x2="416" y2="330" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="424" y="316" class="f" font-size="6.2">PRESIGN</text>
    <rect x="330" y="332" width="180" height="48" class="term"/>
    <text x="342" y="350" class="f" font-size="6.6" letter-spacing="0.7">RUSTFS</text>
    <text x="342" y="368" class="t" font-size="8.2" font-weight="800">STAGING + PUBLIC</text>
    <path d="M636 106 H610 V370 H516" class="dash" fill="none" marker-end="url(#pub-f1-arrow)"/>
    <text x="616" y="338" class="f" font-size="6.2" letter-spacing="1">PUT</text>
    <line x1="510" y1="356" x2="632" y2="356" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="636" y="332" width="180" height="48" class="box"/>
    <text x="648" y="350" class="f" font-size="6.6" letter-spacing="0.7">EDGE</text>
    <text x="648" y="368" class="t" font-size="8.2" font-weight="800">CDN / PUBLIC READ</text>
    <text x="24" y="400" class="f" font-size="6.2">PRESIGNED URLS ARE BEARER CAPABILITIES · SCOPE EACH KEY · NEVER PUT STORAGE CREDENTIALS IN THE MODEL</text>
  </svg>
  </div>
  <p class="mfig-fig-src">ADMIN SESSION · MCP KEY · ONE SERVICE · TWO BUCKETS</p>
</figure>

The presigned URL is a capability. Anyone who holds it can write that one object until it expires. Treat it like a password: do not log it, do not paste it into the article, and do not reuse it for a second image.

A presigned PUT is also not a complete upload policy. It binds the method, key, expiry, and signed headers; it does not reliably enforce a maximum body size. The declared size is checked before signing, the edge enforces a body limit, and the confirm step performs a `HEAD` and deletes anything that does not match. That is defense in depth, not a single control.

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">THE UPLOAD // 02</span>
    <h3 class="mfig-fig-title">Sign, upload, confirm — then attach</h3>
    <p class="mfig-fig-sub">The server never sees the image bytes. It sees the ticket, the metadata, and the ETag, and it copies only validated objects into the public bucket.</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 420" role="img" aria-labelledby="pub-f2-title pub-f2-desc">
    <title id="pub-f2-title">Image upload sequence</title>
    <desc id="pub-f2-desc">Eight steps: the AI requests an upload, the server inserts a pending ticket, returns a presigned URL, the AI PUTs bytes to RustFS, confirms with an ETag, the server validates and copies to the public bucket, attaches the asset and bumps the article version, and returns the public URL.</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">IMAGE UPLOAD // REQUEST TO PUBLIC URL</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">NO BYTES THROUGH THE JVM</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="48" y="44" width="150" height="36" class="box"/>
    <text x="60" y="66" class="t" font-size="8" font-weight="800">AI CLIENT</text>
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
    <text x="354" y="134" class="m" font-size="6.6">INSERT pending ticket</text>
    <text x="30" y="176" class="f" font-size="6.4">03</text>
    <line x1="341" y1="174" x2="127" y2="174" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="150" y="168" class="m" font-size="6.6">uploadUrl + Content-Type + expiry</text>
    <text x="30" y="210" class="f" font-size="6.4">04</text>
    <line x1="123" y1="208" x2="755" y2="208" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="136" y="202" class="m" font-size="6.6">PUT bytes (10-minute URL, one object)</text>
    <text x="30" y="244" class="f" font-size="6.4">05</text>
    <line x1="123" y1="242" x2="337" y2="242" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="136" y="236" class="m" font-size="6.6">confirm_image_upload(uploadId, ETag)</text>
    <text x="30" y="278" class="f" font-size="6.4">06</text>
    <line x1="341" y1="276" x2="755" y2="276" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="354" y="270" class="m" font-size="6.6">HEAD + copy staging → public</text>
    <text x="30" y="312" class="f" font-size="6.4">07</text>
    <line x1="341" y1="310" x2="555" y2="310" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="354" y="304" class="m" font-size="6.6">attach + version + 1</text>
    <text x="30" y="346" class="f" font-size="6.4">08</text>
    <line x1="341" y1="344" x2="127" y2="344" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="150" y="338" class="m" font-size="6.6">public URL</text>
    <line x1="24" y1="368" x2="816" y2="368" class="rule-soft"/>
    <text x="24" y="388" class="f" font-size="6.2">EXPIRED → NEW TICKET · ETAG OR TYPE MISMATCH → REJECT + DELETE · UNCONFIRMED → SWEEPER</text>
    <text x="816" y="404" class="f" font-size="6.2" text-anchor="end">ONE OBJECT · ONE WINDOW · ONE CONFIRMATION</text>
  </svg>
  </div>
  <p class="mfig-fig-src">REQUEST → SIGN → PUT → HEAD → COPY → ATTACH</p>
</figure>

The Java side is two pieces. First, a presigner bound to the client-visible endpoint, with path-style access and the staging bucket:

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

Second, the MCP tool that checks the scope and the article, then creates the ticket:

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

Notice what is not in the signature: a bucket, a path, an access key, or a filename. The server chooses all of them. The tool accepts a content type and a byte count because it needs to reject obvious abuse before signing; it does not accept a destination.

## RustFS is S3-compatible, not S3

RustFS speaks the S3 API, which is why the Spring side can use the AWS SDK v2 `S3Presigner` without a custom client. The compatibility is real, but it is a compatibility target, not a byte-for-byte copy of AWS. Five details matter in production:

1. **Sign against the client-visible endpoint.** The scheme, host, port, region, and path are all part of the signature. Signing `http://rustfs:9000` and handing the URL to an external client produces `SignatureDoesNotMatch`. Use the public HTTPS endpoint in the presigner.
2. **Path-style access is the default.** Configure `pathStyleAccessEnabled(true)` and a region that matches `RUSTFS_REGION` (often `us-east-1`) unless you have set up virtual-host style with wildcard DNS and certificates.
3. **Do not expose the console.** The S3 API and the console are different ports. Only the API endpoint belongs behind the edge; the console stays on the private network. Change the default admin credentials before the first deployment.
4. **CORS is only for browser uploads.** If the AI client is server-side, it does not need CORS. If the admin SPA uploads directly, allow only the exact origin, the PUT method, and the headers you sign.
5. **Copy with an explicit content type.** When copying from staging to public, set `MetadataDirective=REPLACE` and resend `Content-Type`; otherwise the copy can lose it. Pin a RustFS version and run contract tests against the exact endpoints you use.

Use two buckets and two principals. The presigner can only `PutObject` into staging. The application can `GetObject` from staging and `PutObject` into public. The public bucket allows anonymous `GetObject` only. Nothing writes to public directly.

## Failure drill

The design is only as good as its failure behavior. These are the cases worth testing before an agent touches production:

| Failure | What the caller sees | What the system does |
| :--- | :--- | :--- |
| Upload URL expired | `410` or a storage error | Issuing a new ticket is cheap; the old one is swept |
| Wrong `Content-Type` or ETag | `422` | Reject, delete the staged object, keep the article unchanged |
| Confirm before PUT | `404` | Ticket stays pending until expiry, then the sweeper removes it |
| Duplicate confirm | Same public URL | Confirmation is idempotent by upload id |
| Article version conflict | `409` + current version | The model re-reads, merges, retries once |
| DB timeout after commit | Client sees an error | Retry with the same request id returns the committed article |
| Orphaned staging object | None | Nightly sweep of pending tickets older than 30 minutes |
| MIME spoofing | `422` | Magic-byte check and re-encode before publishing |
| Key leaked in a log | None until abuse | Redact `Authorization`, rotate the key, inspect the audit trail |

The orphan sweeper deserves its own line. Every presigned URL creates the possibility of an object that was uploaded but never confirmed, or confirmed but never attached. A scheduled job lists `PENDING` tickets past their expiry, performs a `HEAD`, deletes the object, and marks the ticket `EXPIRED`. A staging lifecycle rule is the second net.

## Checklist

- [ ] Separate `/api/admin/**`, `/mcp`, and `/api/public/**` authentication chains.
- [ ] API keys: prefix lookup, strong hash, constant-time compare, scopes, expiry, revocation, rotation, rate limit, audit.
- [ ] Bearer key in the header only; never in tool arguments, prompts, query strings, or logs.
- [ ] Article writes use `expected_version`; `409` returns the current version.
- [ ] Idempotency key on every create and upload request.
- [ ] Presign against the public endpoint, with a server-chosen key, exact content type, and a TTL of ten minutes or less.
- [ ] Confirm with `HEAD`, magic-byte check, immutable copy, and an atomic attach.
- [ ] Two buckets: private staging, public read-only; no direct public writes.
- [ ] Orphan sweeper, staging lifecycle, and periodic reconciliation.
- [ ] RustFS console unreachable from the internet; default credentials rotated; version pinned.
- [ ] Contract tests against the exact RustFS endpoints used in production.

The point is not to make the AI trustworthy. The point is to make the blast radius small enough that trust is not required. A scoped key, a version column, and a ten-minute URL are three small controls that let an agent publish without ever holding the keys to the site.

## References

- [Spring AI MCP server boot starter](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html) — transports, starters, and server configuration.
- [Spring AI MCP server annotations](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-annotations-server.html) — tool, resource, and prompt annotations.
- [Amazon S3 presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) — expiry, caveats, and bearer-capability semantics.
- [AWS SDK for Java v2 `S3Presigner`](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/presigner/S3Presigner.html) — presign APIs and configuration.
- [RustFS S3 compatibility](https://docs.rustfs.com/en/administration/protocols/s3) — endpoint, region, and path-style behavior.
- [RustFS CORS](https://docs.rustfs.com/en/administration/cors) — allowed origins and browser uploads.
- [MCP authorization](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization) — why API keys are a deployment choice, not the spec's OAuth model.
- [Spring Security authentication architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html) — filters and security contexts.
- [Spring Security password storage](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html) — Argon2id and bcrypt tradeoffs.
