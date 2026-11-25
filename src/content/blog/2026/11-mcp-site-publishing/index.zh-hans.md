---
title: "通过 MCP 发布文章：API Key、预签名上传与 RustFS"
description: "Spring Boot MCP 服务器如何让 AI 更新接案宣传网站的最新文章：权限受控的 API Key、版本化写入，以及上传到 S3 兼容 RustFS 的限时预签名图片 URL。"
pubDate: 2026-11-25
category: "AI"
tags: ["MCP", "Spring Boot", "RustFS", "S3", "安全"]
featured: false
author: "Alex.Hsiao"
readTime: "13 分钟"
---

# 通过 MCP 发布文章：API Key、预签名上传与 RustFS

## 网站，与两道门

工作小组的接案宣传网站，页面不多，价值却很集中：服务页、作品集、联络信息，以及一个用来证明团队仍在持续交付的「最新文章」区块。前三个每季才改一次，第四个却想每周都更新。

管理员已经有 React 编辑器。新需求听起来范围很大，其实很窄：让 AI 助理起草、更新文章，还能加入图片。高风险的做法，是把数据库 URL 和 S3 访问密钥直接交给模型；安全的做法，则是给它几个工具，和一个十分钟后失效的 URL。

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">MCP 发布 // 00</span>
    <p class="mfig-lead-kicker">AI 可以写完整篇文章，却从头到尾不必持有存储桶的密钥。</p>
    <h3 class="mfig-lead-title">给代理一个工具，而不是存储凭证。</h3>
    <p class="mfig-lead-sub">Spring Boot MCP 服务器检查密钥、签名一次上传，字节则由 RustFS 负责传输。</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg></div>
      <div class="mfig-tag">MCP // 密钥</div>
      <h4>谁在调用</h4>
      <p>由管理员签发的密钥，静态存储时只存哈希，依工具家族划分权限范围，删掉一行就能撤销。</p>
      <div class="mfig-meta">BEARER · 权限范围 · 审计</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg></div>
      <div class="mfig-tag">S3 // 预签名</div>
      <h4>一个对象，一个时间窗</h4>
      <p>一个十分钟有效的 PUT URL，绑定服务器选定的对象键、内容类型与字节上限。</p>
      <div class="mfig-meta">TTL · 类型 · 单一对象</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg></div>
      <div class="mfig-tag">RUSTFS // 对象</div>
      <h4>字节直达</h4>
      <p>API 负责签名，RustFS 负责存储。图片从不经过 JVM。</p>
      <div class="mfig-meta">暂存 · 公开 · CDN</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 170" role="img" aria-labelledby="pub-lead-title pub-lead-desc">
    <title id="pub-lead-title">MCP 图片发布路径</title>
    <desc id="pub-lead-desc">AI 主机调用一个受权限范围管控的 MCP 工具，服务器检查密钥并签名一个短时效上传 URL，客户端直接把字节 PUT 到 RustFS，接着确认并把图片附加到文章。</desc>
    <defs>
      <marker id="pub-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一组密钥 // 一个对象 // 十分钟</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">图片路径</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="118" height="72" class="term"/>
    <svg x="34" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
    <text x="52" y="64" class="f" font-size="6.2" letter-spacing="0.6">AI 主机</text>
    <text x="34" y="88" class="t" font-size="9.5" font-weight="800">MCP 客户端</text>
    <text x="34" y="100" class="m" font-size="6.8">一组密钥</text>
    <text x="34" y="112" class="f" font-size="6.2">claude · ide · 自定义</text>
    <line x1="144" y1="80" x2="160" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="162" y="44" width="118" height="72" class="box"/>
    <svg x="172" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    <text x="190" y="64" class="f" font-size="6.2" letter-spacing="0.6">工具</text>
    <text x="172" y="88" class="t mono" font-size="8.6" font-weight="800">request_upload</text>
    <text x="172" y="100" class="m" font-size="6.8">文章 + 类型</text>
    <text x="172" y="112" class="f" font-size="6.2">声明字节数</text>
    <line x1="282" y1="80" x2="298" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="300" y="44" width="118" height="72" class="codebox"/>
    <svg x="310" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
    <text x="328" y="64" class="f" font-size="6.2" letter-spacing="0.6">验证</text>
    <text x="310" y="88" class="t" font-size="9.5" font-weight="800">密钥检查</text>
    <text x="310" y="100" class="m" font-size="6.8">权限 · 速率</text>
    <text x="310" y="112" class="f" font-size="6.2">已撤销？已过期？</text>
    <line x1="420" y1="80" x2="436" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="438" y="44" width="118" height="72" class="term"/>
    <svg x="448" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
    <text x="466" y="64" class="f" font-size="6.2" letter-spacing="0.6">签名</text>
    <text x="448" y="88" class="t" font-size="9.5" font-weight="800">预签名</text>
    <text x="448" y="100" class="m" font-size="6.8">10 分钟</text>
    <text x="448" y="112" class="f" font-size="6.2">服务器选定对象键</text>
    <line x1="558" y1="80" x2="574" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="576" y="44" width="118" height="72" class="box"/>
    <svg x="586" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/></svg>
    <text x="604" y="64" class="f" font-size="6.2" letter-spacing="0.6">上传</text>
    <text x="586" y="88" class="t" font-size="9.5" font-weight="800">RUSTFS PUT</text>
    <text x="586" y="100" class="m" font-size="6.8">字节直送</text>
    <text x="586" y="112" class="f" font-size="6.2">不经 JVM 代理</text>
    <line x1="696" y1="80" x2="712" y2="80" class="arrow" marker-end="url(#pub-arrow)"/>
    <rect x="714" y="44" width="118" height="72" class="term"/>
    <svg x="724" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    <text x="742" y="64" class="f" font-size="6.2" letter-spacing="0.6">附加</text>
    <text x="724" y="88" class="t" font-size="9.5" font-weight="800">确认</text>
    <text x="724" y="100" class="m" font-size="6.8">HEAD + 复制</text>
    <text x="724" y="112" class="f" font-size="6.2">文章 v+1</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">API 从不代理图片 · 预签名 URL 是唯一的写入能力</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>代理拿到的是能力，不是凭证。</b>整个设计的差别就在这里。</p>
</section>

<p class="mfig-bridge">接下来会依序说明内容模型、密钥模型、上传流程，以及决定这套设计能否站得住脚的各种失败情境。</p>

## 两道门，一个内容模型

网站有两个前门，共用一层服务。

- **管理 API。** `/api/admin/**` 由管理员的 session cookie 验证，并受 CSRF 保护。React 编辑器就是它的用户。
- **MCP 端点。** `/mcp` 以 `Authorization: Bearer` API key 验证。它是无状态的，没有 CSRF token，使用 JSON-RPC。
- **公开 API。** `/api/public/**` 是只读的，负责提供渲染后的网站。

MCP 服务器不是第二个后端，而是同一套文章服务前面的适配层。这一点很重要，因为所有业务规则——slug 唯一性、翻译完整性、发布权限、版本检查——不论请求从哪道门进来，都必须成立。

内容模型刻意保持精简：

| 数据表 | 存放内容 |
| :--- | :--- |
| `content_blocks` | 每篇文章一行：id、type、status、version、published_at |
| `block_translations` | 每个语言版本一行：title、summary、body Markdown |
| `media_assets` | 对象键、内容类型、字节数、状态、附加的文章区块 |
| `mcp_keys` | 密钥 id、密钥哈希、权限范围、到期、撤销、最后使用时间 |
| `audit_log` | 谁在什么目标上调用了哪个工具，结果如何 |

一篇文章就是一行 `content_blocks`，类型为 `article`，带有一到多行 `block_translations`。`version` 字段就是乐观锁。管理编辑器与 MCP 工具都 PATCH 同一行，因此不会各自漂移成两种不同的「当前版本」。

## 工具清单

第一个版本有七个工具就够了。工具越少，模型需要误读的描述越少，需要审计的范围也越小。

| 工具 | 输入 | 权限范围 | 副作用 |
| :--- | :--- | :--- | :--- |
| `list_articles` | status、locale、cursor、limit | `articles:read` | 无 |
| `get_article` | id 或 slug | `articles:read` | 无 |
| `create_article` | 请求 id、locale、title、body | `articles:write` | 草稿 + 修订 |
| `update_article` | id、期望版本、patch | `articles:write` | 新修订 |
| `publish_article` | id、期望版本 | `articles:publish` | 上线 + 清除缓存 |
| `request_image_upload` | 文章 id、内容类型、字节数、请求 id | `images:write` | 待处理票据 + URL |
| `confirm_image_upload` | 上传 id、ETag | `images:write` | 验证、复制、附加 |

有三个选择值得特别说明。

**发布与写入分开。** AI 可以整个下午都在起草，却不会动到公开网站。发布是一个独立的权限范围，因为它是唯一会产生公开后果的动作。

**没有删除工具。** 删除是管理员的动作。一个能创建与发布的代理，不需要同时具备抹除案例研究的能力。

**每次写入都要带幂等键。** `create_article` 会以唯一约束存储 `(key_id, client_request_id)`。如果响应丢失、客户端重试，第二次调用会返回第一篇文章，而不是创建重复数据。

## 密钥是身份，不是密码

密钥长这样：

```text
mcp_live_7f3a9c2e_9Jq...32-random-bytes...xK
```

中间那一段是创建索引的 `key_id`。最后一段是 32 个随机字节，以 base64url 编码。数据库存储 id、哈希、权限范围、所属网站，以及到期、撤销、轮换与最后使用时间等时间戳。

对于 256 位的随机密钥，使用带服务器端 pepper 的 HMAC-SHA-256 就足够，而且每次请求验证的成本很低。Argon2id 适合由人类选择密钥的情境，因为它让猜测变得昂贵；但对高流量的机器凭证来说并不适合，尤其当每次验证要花上一秒时。无论用哪种函数，都要以常数时间比较，并且对未知、已撤销、密钥错误的密钥返回相同的 `401`。

权限范围对应到 authority，并且在服务层强制执行，不只在 MCP 路由上检查：

```java
public Article updateArticle(Actor actor, UUID id, long expectedVersion, ArticlePatch patch) {
    actor.requireScope("articles:write");
    return articles.update(id, expectedVersion, patch); // UPDATE ... WHERE version = ?
}
```

密钥在每个请求中都放在 `Authorization` 请求头里。它绝不会出现在工具参数、提示词、查询字符串或 URL 中。工具参数对模型可见，也经常被记录；把密钥放在那里，就等于泄露密钥。

在运营上，管理员需要四个按钮：创建、轮换、撤销、查看最后使用时间。轮换会创建一个连接到旧密钥的新密钥，允许一段重叠期，然后撤销旧密钥。速率限制依密钥与工具分别计算。审计日志记录密钥 id、工具、目标、结果、延迟、请求 id、IP 与 user agent——但绝不记录密钥、文章正文或预签名 URL。

## 写入文章，而不与版本竞速

写入路径刻意设计得很无聊：

1. 工具验证 payload 与权限范围。
2. 服务开启一个事务。
3. 以 `WHERE id = ? AND version = ?` 更新文章。
4. 若变动行数为零，返回 `409` 与当前版本。
5. 若变动一行，写入修订与审计纪录，然后提交。

因此 `update_article` 要求 `expected_version`，响应会返回新版本。模型收到的指示是：收到 `409` 后重新读取文章、合并变更，再重试一次。拿着旧版本盲目重试会永远失败，这正是正确的行为。

同一条规则也保护管理编辑器。编辑器发送它渲染时的版本，MCP 工具发送它读取到的版本。两者都无法悄悄覆盖对方。

## 图片：签名一个对象，而不是整个存储桶

图片是最容易让人想「干脆给代理 S3 权限」的地方。这套设计改用两个存储桶与三个调用。

- `media-staging` 是私有的。它接受短时效的 PUT。
- `media-public` 可通过 CDN 读取。它只包含验证过、不可变的对象。
- Spring Boot 应用程序持有唯一能写入这两个存储桶的凭证。

流程如下：

1. **请求。** AI 以文章 id、内容类型、声明大小与幂等键调用 `request_image_upload`。
2. **票据。** 服务器检查权限范围、确认文章可编辑、验证类型与大小、插入一行 `PENDING`，并产生像 `staging/site/article/<uuid>.webp` 的对象键。文件名永远不由客户端提供。
3. **预签名。** 服务器为该对象键、该 `Content-Type` 签名一个十分钟有效的 PUT。
4. **上传。** AI 直接把字节 PUT 到 RustFS。图片不经过 JVM。
5. **确认。** AI 以上传 id 与 ETag 调用 `confirm_image_upload`。
6. **验证与复制。** 服务器执行 `HEAD`、检查大小与类型、视情况检查 magic bytes，以明确的内容类型把对象复制到 `media-public`，并在提升文章版本的同一个事务中把该行改为 `ATTACHED`。
7. **对外提供。** 文章记录对象键；公开页面把它转成 CDN URL。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">架构 // 01</span>
    <h3 class="mfig-fig-title">两道门、一层服务、两个存储桶</h3>
    <p class="mfig-fig-sub">管理 session 与 MCP 密钥遇上同一个文章服务。只有服务持有 RustFS 凭证；客户端一次只会拿到一个已签名的 URL。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 410" role="img" aria-labelledby="pub-f1-title pub-f1-desc">
    <title id="pub-f1-title">MCP 发布流程的架构</title>
    <desc id="pub-f1-desc">管理 SPA 与 AI MCP 客户端从边缘进入，边缘负责 TLS、WAF、请求体上限与来源检查。Spring Boot 应用程序提供管理 REST API 与 MCP 端点，认证两者、写入 PostgreSQL、签名上传，并与 RustFS 沟通。AI 客户端用预签名 URL 直接上传到 RustFS。CDN 只读取公开存储桶。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">两道门 // 一个内容模型 // 两个存储桶</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">信任边界</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="48" width="180" height="58" class="box"/>
    <text x="36" y="66" class="f" font-size="6.8" letter-spacing="0.7">管理</text>
    <text x="36" y="86" class="t" font-size="9.2" font-weight="800">SPA 编辑器</text>
    <text x="36" y="99" class="m" font-size="6.6">session + CSRF</text>
    <rect x="636" y="48" width="180" height="58" class="box"/>
    <text x="648" y="66" class="f" font-size="6.8" letter-spacing="0.7">AI</text>
    <text x="648" y="86" class="t" font-size="9.2" font-weight="800">MCP 客户端</text>
    <text x="648" y="99" class="m" font-size="6.6">bearer 密钥</text>
    <line x1="114" y1="106" x2="114" y2="130" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <line x1="726" y1="106" x2="726" y2="130" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="24" y="132" width="792" height="30" class="term"/>
    <text x="36" y="151" class="f" font-size="6.8" letter-spacing="0.8">边缘 // TLS · WAF · 请求体上限 · 来源检查 · 速率限制</text>
    <line x1="420" y1="162" x2="420" y2="190" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="12" y="190" width="816" height="118" class="dash"/>
    <text x="20" y="204" class="f" font-size="6.2" letter-spacing="0.8">受信任的应用网络</text>
    <rect x="24" y="212" width="170" height="76" class="box"/>
    <text x="36" y="230" class="f" font-size="6.6" letter-spacing="0.7">验证</text>
    <text x="36" y="250" class="t" font-size="8.8" font-weight="800">SESSION | API KEY</text>
    <text x="36" y="264" class="m" font-size="6.6">权限范围 · 速率限制</text>
    <text x="36" y="276" class="f" font-size="6.2">常数时间验证</text>
    <line x1="194" y1="250" x2="242" y2="250" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="246" y="204" width="340" height="92" class="codebox"/>
    <text x="258" y="222" class="f" font-size="6.6" letter-spacing="0.7">SPRING BOOT</text>
    <rect x="258" y="232" width="150" height="48" class="box"/>
    <text x="268" y="250" class="t" font-size="8.4" font-weight="800">REST /api/admin</text>
    <text x="268" y="264" class="m" font-size="6.4">编辑器 + 媒体</text>
    <rect x="424" y="232" width="150" height="48" class="box"/>
    <text x="434" y="250" class="t" font-size="8.4" font-weight="800">MCP /mcp</text>
    <text x="434" y="264" class="m" font-size="6.4">工具 + JSON-RPC</text>
    <text x="258" y="292" class="f" font-size="6.2">一套文章服务 · 一个版本字段</text>
    <line x1="586" y1="250" x2="632" y2="250" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="636" y="212" width="180" height="76" class="box"/>
    <text x="648" y="230" class="f" font-size="6.6" letter-spacing="0.7">POSTGRES</text>
    <text x="648" y="250" class="t" font-size="8.8" font-weight="800">文章</text>
    <text x="648" y="264" class="m" font-size="6.6">区块 · 翻译</text>
    <text x="648" y="276" class="f" font-size="6.2">密钥 · 审计 · 版本</text>
    <line x1="416" y1="296" x2="416" y2="330" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <text x="424" y="316" class="f" font-size="6.2">预签名</text>
    <rect x="330" y="332" width="180" height="48" class="term"/>
    <text x="342" y="350" class="f" font-size="6.6" letter-spacing="0.7">RUSTFS</text>
    <text x="342" y="368" class="t" font-size="8.2" font-weight="800">暂存 + 公开</text>
    <path d="M636 106 H610 V370 H516" class="dash" fill="none" marker-end="url(#pub-f1-arrow)"/>
    <text x="616" y="338" class="f" font-size="6.2" letter-spacing="1">PUT</text>
    <line x1="510" y1="356" x2="632" y2="356" class="arrow" marker-end="url(#pub-f1-arrow)"/>
    <rect x="636" y="332" width="180" height="48" class="box"/>
    <text x="648" y="350" class="f" font-size="6.6" letter-spacing="0.7">边缘</text>
    <text x="648" y="368" class="t" font-size="8.2" font-weight="800">CDN / 公开读取</text>
    <text x="24" y="400" class="f" font-size="6.2">预签名 URL 是 bearer 能力 · 每把密钥都要限定范围 · 绝不把存储凭证放进模型</text>
  </svg>
  </div>
  <p class="mfig-fig-src">管理 SESSION · MCP 密钥 · 一套服务 · 两个存储桶</p>
</figure>

预签名 URL 是一种能力。任何持有它的人都能在到期前写入那一个对象。把它当密码看待：不要记录、不要贴进文章、不要重复用于第二张图片。

预签名 PUT 也不是完整的上传策略。它绑定方法、对象键、到期时间与已签名的请求头；它无法可靠地强制请求体大小上限。声明大小会在签名前检查，边缘会执行请求体上限，确认步骤则执行 `HEAD` 并删除任何不符的内容。这是纵深防御，不是单一控制。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">上传 // 02</span>
    <h3 class="mfig-fig-title">签名、上传、确认，然后附加</h3>
    <p class="mfig-fig-sub">服务器从未看到图片的字节。它看到的是票据、元数据与 ETag，并且只把验证过的对象复制进公开存储桶。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 420" role="img" aria-labelledby="pub-f2-title pub-f2-desc">
    <title id="pub-f2-title">图片上传流程</title>
    <desc id="pub-f2-desc">八个步骤：AI 请求上传，服务器插入待处理票据、返回预签名 URL，AI 把字节 PUT 到 RustFS，以 ETag 确认，服务器验证并复制到公开存储桶，附加资产并提升文章版本，最后返回公开 URL。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">图片上传 // 从请求到公开 URL</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">字节不经过 JVM</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="48" y="44" width="150" height="36" class="box"/>
    <text x="60" y="66" class="t" font-size="8" font-weight="800">AI 客户端</text>
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
    <text x="354" y="134" class="m" font-size="6.6">INSERT 待处理票据</text>
    <text x="30" y="176" class="f" font-size="6.4">03</text>
    <line x1="341" y1="174" x2="127" y2="174" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="150" y="168" class="m" font-size="6.6">uploadUrl + Content-Type + 到期</text>
    <text x="30" y="210" class="f" font-size="6.4">04</text>
    <line x1="123" y1="208" x2="755" y2="208" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="136" y="202" class="m" font-size="6.6">PUT 字节（10 分钟 URL，单一对象）</text>
    <text x="30" y="244" class="f" font-size="6.4">05</text>
    <line x1="123" y1="242" x2="337" y2="242" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="136" y="236" class="m" font-size="6.6">confirm_image_upload(uploadId, ETag)</text>
    <text x="30" y="278" class="f" font-size="6.4">06</text>
    <line x1="341" y1="276" x2="755" y2="276" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="354" y="270" class="m" font-size="6.6">HEAD + 复制 暂存 → 公开</text>
    <text x="30" y="312" class="f" font-size="6.4">07</text>
    <line x1="341" y1="310" x2="555" y2="310" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="354" y="304" class="m" font-size="6.6">附加 + 版本 + 1</text>
    <text x="30" y="346" class="f" font-size="6.4">08</text>
    <line x1="341" y1="344" x2="127" y2="344" class="arrow" marker-end="url(#pub-f2-arrow)"/>
    <text x="150" y="338" class="m" font-size="6.6">公开 URL</text>
    <line x1="24" y1="368" x2="816" y2="368" class="rule-soft"/>
    <text x="24" y="388" class="f" font-size="6.2">过期 → 新票据 · ETAG 或类型不符 → 拒绝 + 删除 · 未确认 → 清扫器</text>
    <text x="816" y="404" class="f" font-size="6.2" text-anchor="end">一个对象 · 一个时间窗 · 一次确认</text>
  </svg>
  </div>
  <p class="mfig-fig-src">请求 → 签名 → PUT → HEAD → 复制 → 附加</p>
</figure>

Java 端有两块。第一，绑定到客户端可见端点的 presigner，使用 path-style 访问与暂存存储桶：

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

第二，检查权限范围与文章的 MCP 工具，然后创建票据：

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

注意签名里没有什么：存储桶、路径、访问密钥或文件名。全部由服务器选择。工具接受内容类型与字节数，因为它需要在签名前挡掉明显的滥用；它不接受目的地。

## RustFS 与 S3 兼容，但不是 S3

RustFS 走的是 S3 API，因此 Spring 端可以直接用 AWS SDK v2 的 `S3Presigner`，不需要自定义客户端。兼容性是真的，但那是兼容目标，不是逐字节复制 AWS。上线时有五个细节要注意：

1. **对客户端可见的端点签名。** scheme、host、port、region 与路径都是签名的一部分。以 `http://rustfs:9000` 签名，却把 URL 交给外部客户端，会得到 `SignatureDoesNotMatch`。在 presigner 里使用公开的 HTTPS 端点。
2. **path-style 访问是默认。** 设置 `pathStyleAccessEnabled(true)`，以及与 `RUSTFS_REGION` 一致的 region（通常是 `us-east-1`），除非你已经用通配符 DNS 与凭证架好 virtual-host 样式。
3. **不要暴露控制台。** S3 API 与控制台是不同的端口。只有 API 端点该放在边缘后面；控制台留在私有网络。第一次部署前先改掉默认管理凭证。
4. **CORS 只是为了让浏览器上传。** 如果 AI 客户端在服务器端，就不需要 CORS。如果管理 SPA 直接上传，只允许确切的来源、PUT 方法，以及你签名的请求头。
5. **复制时带上明确的内容类型。** 从暂存复制到公开时，设置 `MetadataDirective=REPLACE` 并重新发送 `Content-Type`；否则复制可能丢失它。锁定 RustFS 版本，并针对你实际使用的端点跑契约测试。

使用两个存储桶与两个主体。presigner 只能对暂存 `PutObject`。应用程序可以从暂存 `GetObject`，并对公开 `PutObject`。公开存储桶只允许匿名 `GetObject`。没有任何东西直接写入公开存储桶。

## 失败演练

设计的好坏，取决于它的失败行为。以下是代理碰到正式环境前值得测试的情境：

| 失败 | 调用方看到什么 | 系统做什么 |
| :--- | :--- | :--- |
| 上传 URL 过期 | `410` 或存储错误 | 签发新票据成本很低；旧票据会被清扫 |
| `Content-Type` 或 ETag 错误 | `422` | 拒绝、删除暂存对象、文章维持不变 |
| 在 PUT 之前确认 | `404` | 票据维持待处理直到到期，然后清扫器移除它 |
| 重复确认 | 相同的公开 URL | 确认以上传 id 幂等 |
| 文章版本冲突 | `409` + 当前版本 | 模型重新读取、合并、重试一次 |
| 提交后 DB 超时 | 客户端看到错误 | 以相同请求 id 重试会返回已提交的文章 |
| 孤儿暂存对象 | 无 | 每晚清扫超过 30 分钟仍未处理的票据 |
| MIME 伪造 | `422` | 发布前做 magic-byte 检查并重新编码 |
| 密钥出现在日志中 | 滥用前无感 | 遮蔽 `Authorization`、轮换密钥、检查审计轨迹 |

孤儿清扫器值得独立说明。每个预签名 URL 都创造了一种可能：对象被上传却从未确认，或确认了却从未附加。定时任务会列出已逾期的 `PENDING` 票据、执行 `HEAD`、删除对象，并把票据标记为 `EXPIRED`。暂存的生命周期规则则是第二道防线。

## 检查清单

- [ ] 分离 `/api/admin/**`、`/mcp`、`/api/public/**` 的验证链。
- [ ] API 密钥：前缀查询、强哈希、常数时间比较、权限范围、到期、撤销、轮换、速率限制、审计。
- [ ] Bearer 密钥只放在请求头；绝不放在工具参数、提示词、查询字符串或日志中。
- [ ] 文章写入使用 `expected_version`；`409` 返回当前版本。
- [ ] 每个创建与上传请求都带幂等键。
- [ ] 对公开端点预签名，使用服务器选定的对象键、确切的内容类型，以及十分钟以内的 TTL。
- [ ] 以 `HEAD`、magic-byte 检查、不可变复制与原子附加来确认。
- [ ] 两个存储桶：私有暂存、公开只读；没有直接写入公开存储桶的路径。
- [ ] 孤儿清扫器、暂存生命周期，以及定期对账。
- [ ] RustFS 控制台无法从互联网触及；默认凭证已轮换；版本已锁定。
- [ ] 针对正式环境实际使用的 RustFS 端点跑契约测试。

重点不是让 AI 变得值得信任，而是把爆炸半径缩小到不需要信任。一个受范围限制的密钥、一个版本字段、一个十分钟有效的 URL，这三个小控制让代理能够发布文章，却从头到尾不必持有网站的钥匙。

## 参考资料

- [Spring AI MCP server boot starter](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html) — 传输方式、starter 与服务器配置。
- [Spring AI MCP server annotations](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-annotations-server.html) — 工具、资源与提示词注解。
- [Amazon S3 presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) — 到期、注意事项与 bearer 能力语义。
- [AWS SDK for Java v2 `S3Presigner`](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/presigner/S3Presigner.html) — 预签名 API 与设置。
- [RustFS S3 compatibility](https://docs.rustfs.com/en/administration/protocols/s3) — 端点、region 与 path-style 行为。
- [RustFS CORS](https://docs.rustfs.com/en/administration/cors) — 允许的来源与浏览器上传。
- [MCP authorization](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization) — 为什么 API 密钥是部署选择，而不是规范中的 OAuth 模型。
- [Spring Security authentication architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html) — 过滤器与安全上下文。
- [Spring Security password storage](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html) — Argon2id 与 bcrypt 的取舍。
