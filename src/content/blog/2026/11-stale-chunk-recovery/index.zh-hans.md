---
title: "没跟上部署的那个标签页：Vite 过期 chunk 的恢复"
description: "为什么一个开着的 Vite 标签页会请求一个早已不存在的 JavaScript chunk，以及错误边界、一次刷新与 15 秒冷却如何把空白页变成干净的更新。"
pubDate: 2026-11-23
category: "Web"
tags: ["Vite", "React", "前端", "缓存", "可靠性"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分钟"
cardImage: "./cover.webp"
cardImageAlt: "过期标签页恢复流程图：旧标签页、延迟加载、404、重新加载一次、新文档"
---

# 没跟上部署的那个标签页：Vite 过期 chunk 的恢复

## 简单版：一个过期的标签页

<section class="stale-lead">
  <div class="stale-lead-head">
    <span class="card-tag">过期标签页 // 00</span>
    <p class="stale-lead-kicker">部署不会更新已经开着的标签页。它只改变下一个请求会找到什么。</p>
    <h3 class="stale-lead-title">少了一个文件，换来一次干净的刷新。</h3>
    <p class="stale-lead-sub">接住失败的 import，刷新一次，落在新的构建上。</p>
  </div>
  <div class="stale-lead-grid">
    <div class="stale-lead-card">
      <div class="stale-lead-icon"><svg class="stale-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>
      <div class="stale-lead-tag">部署 // 改名</div>
      <h4>新的构建，新的名字</h4>
      <p>Vite 会把内容哈希写进每个文件名。HTML 入口现在指向一组全新的文件。</p>
      <div class="stale-lead-meta">构建 v2 → 新哈希</div>
    </div>
    <div class="stale-lead-arrow" aria-hidden="true">→</div>
    <div class="stale-lead-card">
      <div class="stale-lead-icon"><svg class="stale-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg></div>
      <div class="stale-lead-tag">标签页 // 过期地图</div>
      <h4>开着的标签页仍握着旧地图</h4>
      <p>它的主 bundle 还列着构建 v1 的 chunk。没有人告诉它那些文件已经被移除。</p>
      <div class="stale-lead-meta">标签页 v1 → 旧文件名</div>
    </div>
    <div class="stale-lead-arrow" aria-hidden="true">→</div>
    <div class="stale-lead-card">
      <div class="stale-lead-icon"><svg class="stale-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></div>
      <div class="stale-lead-tag">恢复 // 刷新</div>
      <h4>接住这次错过，刷新一次</h4>
      <p>错误边界认得这种模块加载失败。一次刷新就会取得新的 HTML 与新的文件名。</p>
      <div class="stale-lead-meta">CHUNK 错误 → 全新文件</div>
    </div>
  </div>
  <div class="stale-lead-flow stale-scroll">
  <svg class="stale-svg" viewBox="0 0 840 170" role="img" aria-labelledby="stale-lead-title stale-lead-desc">
    <title id="stale-lead-title">过期标签页的恢复流程</title>
    <desc id="stale-lead-desc">旧标签页打开一条延迟路由，请求已删除的 chunk，收到 404，错误边界触发一次刷新。刷新取得新的 HTML 与新的 chunk。</desc>
    <defs>
      <marker id="stale-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="stale-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">简单流程 // 一个标签页，一次错过</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">旧地图 · 404 · 全新文件</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="120" height="72" class="term"/>
    <svg x="36" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/></svg>
    <text x="58" y="63" class="f" font-size="6.2" letter-spacing="0.6">标签页 v1</text>
    <text x="36" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">旧标签页</text>
    <text x="36" y="96" class="m" font-size="6.8">旧地图</text>
    <text x="36" y="108" class="f" font-size="6.2">index-A9.js</text>
    <line x1="144" y1="80" x2="160" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="160" y="44" width="150" height="72" class="box"/>
    <svg x="172" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="m10 12-2 2 2 2"/><path d="m14 16 2-2-2-2"/></svg>
    <text x="194" y="63" class="f" font-size="6.2" letter-spacing="0.6">路由</text>
    <text x="172" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">延迟加载</text>
    <text x="172" y="96" class="m" font-size="6.8">import()</text>
    <text x="172" y="108" class="f" font-size="6.2">AboutPage-OLD.js</text>
    <line x1="310" y1="80" x2="326" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="326" y="44" width="120" height="72" class="codebox"/>
    <text x="342" y="63" class="f" font-size="6.2" letter-spacing="0.6">服务器</text>
    <text x="342" y="84" class="t" font-size="17" font-weight="800" letter-spacing="-0.02em">404</text>
    <text x="342" y="96" class="m" font-size="6.8">chunk 已删除</text>
    <text x="342" y="108" class="f" font-size="6.2">文件不存在</text>
    <line x1="446" y1="80" x2="462" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="462" y="44" width="150" height="72" class="box"/>
    <svg x="474" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
    <text x="496" y="63" class="f" font-size="6.2" letter-spacing="0.6">拦截</text>
    <text x="474" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">错误边界</text>
    <text x="474" y="96" class="m" font-size="6.8">模块错误</text>
    <text x="474" y="108" class="f" font-size="6.2">仅限渲染</text>
    <line x1="612" y1="80" x2="628" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="628" y="44" width="90" height="72" class="box"/>
    <svg x="640" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
    <text x="662" y="63" class="f" font-size="6.2" letter-spacing="0.6">一次</text>
    <text x="640" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">刷新</text>
    <text x="640" y="96" class="m" font-size="6.8">15 秒冷却</text>
    <text x="640" y="108" class="f" font-size="6.2">新文件</text>
    <line x1="718" y1="80" x2="734" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="734" y="44" width="82" height="72" class="codebox"/>
    <svg x="746" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
    <text x="768" y="63" class="f" font-size="6.2" letter-spacing="0.6">标签页 v2</text>
    <text x="746" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">全新</text>
    <text x="746" y="96" class="m" font-size="6.8">新地图</text>
    <text x="746" y="108" class="f" font-size="6.2">新哈希</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">若第二次加载仍失败 // 显示手动按钮</text>
  </svg>
  </div>
  <p class="stale-lead-note"><b>旧程序并没有坏。坏掉的是它的地址。</b> 恢复不是打补丁；是换一份全新的文件。</p>
</section>

<p class="stale-lead-bridge">接下来是这句话背后的机制：构建写了什么、标签页记住了什么、错误在哪里浮现，以及为什么刷新需要一根牵绳。</p>

## 部署就是改名

10:00，一位访客打开应用。浏览器收到 `index.html`，读到一个 `<script type="module">` 标签，下载 `assets/index-A9_mBUvc.js`。那个文件就是应用本体：外壳、路由，以及它知道如何加载的每一条延迟路由的地图。

访客四处点击，但从未打开 About 页面。没有任何东西去抓 `AboutPage-OLD123.js`。它存在于服务器上，但不在标签页的内存里，也不在它的 HTTP 缓存里。

10:05，你部署了一个新的构建。里面有 `index-NEW999.js`、`AboutPage-NEW888.js`，以及一个指向它们的新 `index.html`。旧的哈希文件从服务器上移除。

10:06，访客点击 About。标签页还在执行 `index-A9_mBUvc.js`。那个文件从未听过构建 v2。它调用 `import('./AboutPage')`，Vite 把它编译成对 `AboutPage-OLD123.js` 的请求。服务器返回 404。动态 import 被拒绝。React 没有组件可以渲染，于是拒绝沿着树往上传。如果没有错误边界接住，整棵树会卸载，页面变成空白。

浏览器没有做错任何事。它只是照着一张印出来时还正确的地图走。

```text
dist/
├── index.html                 # 每次部署都是同一个网址；必须重新验证
└── assets/
    ├── index-A9_mBUvc.js      # 入口：握有延迟路由的地图
    ├── AboutPage-OLD123.js    # 只有打开 /about 时才会抓取
    └── ...
```

内容哈希是这套系统能工作的原因。内容改变的文件会得到新名字，所以 CDN 可以把它缓存到永久。入口 HTML 是唯一不能被永久缓存的文件，因为它的工作就是指出当前构建的名字。

```http
# index.html — 保留地址，重新验证内容
Cache-Control: no-cache

# /assets/* — 内容一变，文件名就变
Cache-Control: public, max-age=31536000, immutable
```

`no-cache` 是个容易误解的名字。它不是「不要存储」，而是「不要未经询问就使用」。HTML 可以留在浏览器缓存里；导览或刷新时，浏览器仍会向服务器确认。`no-store` 更强，但通常不需要。

两个细节很重要：

- 已经抓过的延迟 chunk 可能还在 HTTP 缓存里。旧标签页对那条路由还能继续工作。失败会出现在访客在部署前从未打开过的路由——也就是从未被缓存的那些。
- 如果 HTML 本身被缓存到部署之后，刷新可能还是拿到旧 HTML，指向旧主 bundle，再指向旧 chunk。恢复循环救不了过期的入口文件。那是响应头设置的问题，不是错误边界的问题。

<figure class="stale-fig">
  <figcaption>
    <span class="card-tag">失败 // 01</span>
    <h3 class="stale-fig-title">这个标签页正在读一份已被替换的目录</h3>
    <p class="stale-fig-sub">部署改变了服务器上的名字。它没有改变开着的标签页已经记住的名字。</p>
  </figcaption>
  <div class="stale-scroll">
  <svg class="stale-svg" viewBox="0 0 840 340" role="img" aria-labelledby="stale-f1-title stale-f1-desc">
    <title id="stale-f1-title">一个过期标签页的三个时刻</title>
    <desc id="stale-f1-desc">10:00，标签页加载 index.html 与 index-A9.js，并记住 AboutPage-OLD123.js 但没有抓取。10:05，新的构建取代旧文件。10:06，标签页请求已删除的 chunk，收到 404。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">失败 // 三个时刻</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一个标签页 · 两个构建 · 一个 404</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="42" width="248" height="26" class="term"/>
    <text x="36" y="59" class="f" font-size="7" letter-spacing="0.8">10:00 · 首次加载</text>
    <rect x="24" y="68" width="248" height="214" class="box"/>
    <text x="36" y="86" class="t mono" font-size="7.2">index.html</text>
    <text x="260" y="86" class="m mono" font-size="6.8" text-anchor="end">200</text>
    <line x1="36" y1="94" x2="260" y2="94" class="rule-soft"/>
    <text x="36" y="110" class="t mono" font-size="7.2">assets/index-A9.js</text>
    <text x="260" y="110" class="m mono" font-size="6.8" text-anchor="end">200</text>
    <line x1="36" y1="118" x2="260" y2="118" class="rule-soft"/>
    <text x="36" y="134" class="t mono" font-size="7.2">AboutPage-OLD.js</text>
    <text x="260" y="134" class="m mono" font-size="6.8" text-anchor="end">未抓取</text>
    <line x1="36" y1="146" x2="260" y2="146" class="rule"/>
    <text x="36" y="166" class="m" font-size="6.8">标签页存着 v1 地图。</text>
    <text x="36" y="178" class="m" font-size="6.8">About 从未被打开，所以它的</text>
    <text x="36" y="190" class="m" font-size="6.8">chunk 不在 HTTP 缓存里。</text>
    <rect x="36" y="208" width="224" height="28" class="term"/>
    <text x="48" y="226" class="f" font-size="6.6" letter-spacing="0.6">地图 v1 // 在内存</text>
    <text x="36" y="262" class="f" font-size="6.4" letter-spacing="0.6">这个标签页 // 仍在执行</text>
    <rect x="296" y="42" width="248" height="26" class="term"/>
    <text x="308" y="59" class="f" font-size="7" letter-spacing="0.8">10:05 · 部署</text>
    <rect x="296" y="68" width="248" height="214" class="box"/>
    <text x="308" y="86" class="t mono" font-size="7.2">index.html</text>
    <text x="532" y="86" class="m mono" font-size="6.8" text-anchor="end">已指向 v2</text>
    <line x1="308" y1="94" x2="532" y2="94" class="rule-soft"/>
    <text x="308" y="110" class="t mono" font-size="7.2">assets/index-NEW.js</text>
    <text x="532" y="110" class="m mono" font-size="6.8" text-anchor="end">200</text>
    <line x1="308" y1="118" x2="532" y2="118" class="rule-soft"/>
    <text x="308" y="134" class="m mono" font-size="7.2" text-decoration="line-through">AboutPage-OLD.js</text>
    <text x="532" y="134" class="m mono" font-size="6.8" text-anchor="end">已删除</text>
    <line x1="308" y1="146" x2="532" y2="146" class="rule"/>
    <text x="308" y="166" class="m" font-size="6.8">新的 HTML 指着一组新文件。</text>
    <text x="308" y="178" class="m" font-size="6.8">旧的哈希文件已经不在了。</text>
    <rect x="308" y="208" width="224" height="28" class="term"/>
    <text x="320" y="226" class="f" font-size="6.6" letter-spacing="0.6">地图 v2 // 在服务器</text>
    <text x="308" y="262" class="f" font-size="6.4" letter-spacing="0.6">服务器 // 部署之后</text>
    <rect x="568" y="42" width="248" height="26" class="term"/>
    <text x="580" y="59" class="f" font-size="7" letter-spacing="0.8">10:06 · 点击</text>
    <rect x="568" y="68" width="248" height="214" class="box"/>
    <rect x="576" y="74" width="232" height="26" fill="var(--mono-l1)"/>
    <text x="586" y="91" fill="var(--mono-paper)" class="mono" font-size="7.2">GET AboutPage-OLD.js</text>
    <text x="798" y="91" fill="var(--mono-paper)" class="mono" font-size="6.8" text-anchor="end">404</text>
    <text x="580" y="116" class="t mono" font-size="7.2">import()</text>
    <text x="804" y="116" class="m mono" font-size="6.8" text-anchor="end">拒绝</text>
    <line x1="580" y1="124" x2="804" y2="124" class="rule-soft"/>
    <text x="580" y="140" class="t mono" font-size="7.2">错误边界</text>
    <text x="804" y="140" class="m mono" font-size="6.8" text-anchor="end">拦截</text>
    <line x1="580" y1="148" x2="804" y2="148" class="rule"/>
    <text x="580" y="166" class="m" font-size="6.8">标签页照着它唯一有的地图走。</text>
    <text x="580" y="178" class="m" font-size="6.8">地址已经过期了。</text>
    <rect x="580" y="208" width="224" height="28" class="term"/>
    <text x="592" y="226" class="f" font-size="6.6" letter-spacing="0.6">下一步 // 全新文件</text>
    <text x="580" y="262" class="f" font-size="6.4" letter-spacing="0.6">旧标签页 // 错过之后</text>
    <line x1="24" y1="302" x2="816" y2="302" class="dash"/>
    <text x="420" y="320" class="f" font-size="6.8" text-anchor="middle" letter-spacing="0.6">构建 v2 从未到达开着的标签页 · 旧地图指向一个已删除的文件</text>
  </svg>
  </div>
  <p class="stale-fig-src">部署时间轴 · 一个开着的标签页 · VITE 内容哈希</p>
</figure>

## 错误有它的形状

动态 import 失败长什么样子？消息依浏览器而异，但形状一致：一个被拒绝的 promise，说某个模块抓不到。

- Chrome：`Failed to fetch dynamically imported module: https://…/assets/AboutPage-OLD123.js`
- Chrome（HTML 回退）：`Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html".`
- Firefox：`error loading dynamically imported module: https://…`
- Safari：`Importing a module script failed.`
- webpack：`ChunkLoadError: Loading chunk 42 failed.`

要匹配的是片语，不是完整字符串。URL 每次构建都不一样；片语不会变。

```ts
const CHUNK_ERROR_RE =
  /Failed to fetch dynamically imported module|Failed to load module script|error loading dynamically imported module|Importing a module script failed|ChunkLoadError/i;
```

最后一个选项留给 webpack 时代的 bundle 与较旧的工具链。其余几项涵盖你大概会遇到的浏览器。

`Failed to load module script` 这个变体，是主机把不存在的资源请求改写成 `index.html` 时看到的；响应是 HTML，不是 JavaScript。如果你的主机这样做，浏览器根本看不到 404。

有一个区分比正则本身更重要：单纯的 `TypeError: Failed to fetch` 不够。用户离线、API 调用失败、CORS 挡掉请求时，也会看到同样的消息。对每个网络错误都刷新，会把不稳定的连接变成刷新循环。错误边界只该对模块加载失败采取行动。

## 在接缝处接住它

`React.lazy` 是渲染时期的加载器。import 还在等待时，它会 suspend；import 被拒绝时，它会抛出错误。因此，只要错误边界位于延迟组件之上，就能接住这个失败。

```tsx
const AboutPage = lazy(() => import('./AboutPage'));

export default function App() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <button onClick={() => setShowAbout(true)}>打开 About</button>

      <ChunkErrorBoundary>
        <Suspense fallback={<p>加载中…</p>}>
          {showAbout && <AboutPage />}
        </Suspense>
      </ChunkErrorBoundary>
    </>
  );
}
```

顺序很重要，但不是第一眼看起来的那种。错误边界必须在延迟组件之上；把它放在 `Suspense` 外侧，是让加载后备与错误后备保持分离最简单的方式。放在应用根部的边界也能接住错误，但它会替换整个外壳。把它缩小到会失败的区域，让页面其余部分仍可使用。

错误边界本身需要两个生命周期方法。`getDerivedStateFromError` 在渲染期间执行，判断这是不是 chunk 错误。`componentDidCatch` 在 commit 之后执行，是决定是否刷新的正确位置。

完整文件：

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

const RELOAD_KEY = 'chunk-reload-at';
const COOLDOWN_MS = 15_000;

const CHUNK_ERROR_RE =
  /Failed to fetch dynamically imported module|Failed to load module script|error loading dynamically imported module|Importing a module script failed|ChunkLoadError/i;

interface Props {
  children: ReactNode;
}

interface State {
  chunkError: boolean;
  showManual: boolean;
}

export function tryRecover(): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return false;

  try {
    const now = Date.now();
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);

    if (now - last <= COOLDOWN_MS) return false;

    sessionStorage.setItem(RELOAD_KEY, String(now));
    window.location.reload();
    return true;
  } catch {
    // sessionStorage 在隐私模式下可能抛出错误。
    return false;
  }
}

export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { chunkError: false, showManual: false };

  static getDerivedStateFromError(error: Error): Partial<State> | null {
    return CHUNK_ERROR_RE.test(error.message) ? { chunkError: true } : null;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (!CHUNK_ERROR_RE.test(error.message)) return;

    console.error('[chunk] 模块加载失败', {
      message: error.message,
      componentStack: info.componentStack,
    });

    if (!tryRecover()) {
      this.setState({ showManual: true });
    }
  }

  render() {
    if (!this.state.chunkError) return this.props.children;
    if (!this.state.showManual) return null;

    return (
      <div role="alert">
        <p>这个页面有新版本。</p>
        <button onClick={() => window.location.reload()}>
          重新加载页面
        </button>
      </div>
    );
  }
}
```

几个细节是刻意的：

- `getDerivedStateFromError` 对所有不是 chunk 错误的东西返回 `null`，所以边界不会吞掉无关的 bug。
- `tryRecover` 在刷新前检查 `navigator.onLine`。离线时刷新什么也抓不到，只会弄丢用户手上还有的页面。这个标志只是提示，但能挡掉最明显的情况。
- sessionStorage 的读写放在 `try` 里，因为隐私模式与某些嵌入式浏览器会在访问存储时抛出错误。
- 刷新进行中时，`render` 返回 `null`，所以页面不会闪出一张错误卡。

## 只刷新一次，不要无限循环

天真的版本只有一行：`componentDidCatch() { window.location.reload(); }`。它能用，直到刷新本身也救不了问题。

什么会让第二次加载失败？

- HTML 还被缓存着，仍指向旧 bundle。
- Service Worker 还在提供上一个外壳。
- CDN 有新的 HTML，但还没有新的 chunk。
- 用户离线。
- 部署只完成了一半。

没有护栏的话，每次加载失败都会再刷新一次。标签页变成闪烁循环，用户读不到错误，也按不到任何东西。

护栏是一个时间戳，不是一个布尔值。布尔值（「已经刷新过」）会停用整个会话的恢复能力，包括一小时后的另一次部署。时间戳让标签页在冷却后再试一次，同时挡住紧密的循环。

十五秒是猜的，但还说得过去。它比慢速连接下的一次刷新加一次 chunk 抓取更长，又短到让后来的部署仍能自动恢复。依你的 p95 加载时间调整；确切数字不如「有一个数字」重要。

`sessionStorage` 是这个值该放的架子。它以标签页为范围，能撑过刷新，标签页关闭时就消失。`localStorage` 会把冷却时间漏到其他标签页与会话，那里不该有这个值。

<figure class="stale-fig">
  <figcaption>
    <span class="card-tag">恢复 // 02</span>
    <h3 class="stale-fig-title">一次自动刷新，一个手动出口</h3>
    <p class="stale-fig-sub">时间戳是速率限制。它让标签页能从下一次部署恢复，又不至于让坏掉的刷新无限打转。</p>
  </figcaption>
  <div class="stale-scroll">
  <svg class="stale-svg" viewBox="0 0 840 420" role="img" aria-labelledby="stale-f2-title stale-f2-desc">
    <title id="stale-f2-title">chunk 恢复状态机</title>
    <desc id="stale-f2-desc">执行中的应用遇到被拒绝的 import。若这不是 chunk 错误，就把错误往外抛。若是 chunk 错误，且标签页在过去十五秒内没有刷新过，就刷新一次并取得全新文件。若已经刷新过，就显示手动刷新按钮。虚线把全新文件带回执行中状态。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">恢复循环 // 两个出口</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">拦截 · 判断 · 刷新或询问</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="54" width="112" height="44" class="box"/>
    <text x="36" y="72" class="f" font-size="6.2">状态</text>
    <text x="36" y="88" class="t mono" font-size="8.4">执行中</text>
    <line x1="136" y1="76" x2="160" y2="76" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="160" y="54" width="150" height="44" class="box"/>
    <text x="172" y="72" class="f" font-size="6.2">事件</text>
    <text x="172" y="88" class="t mono" font-size="8">IMPORT 被拒绝</text>
    <line x1="310" y1="76" x2="344" y2="76" class="arrow" marker-end="url(#stale-arrow)"/>
    <path d="M420 38 L496 76 L420 114 L344 76 Z" class="box"/>
    <text x="420" y="72" class="f" font-size="6.2" text-anchor="middle">这是</text>
    <text x="420" y="84" class="t" font-size="7.4" font-weight="700" text-anchor="middle">CHUNK 错误吗？</text>
    <line x1="496" y1="76" x2="560" y2="76" class="arrow" marker-end="url(#stale-arrow)"/>
    <text x="516" y="70" class="f" font-size="6">否</text>
    <rect x="560" y="54" width="140" height="44" class="box"/>
    <text x="572" y="72" class="f" font-size="6.2">出口</text>
    <text x="572" y="88" class="t mono" font-size="8">往外抛</text>
    <line x1="420" y1="114" x2="420" y2="158" class="arrow" marker-end="url(#stale-arrow)"/>
    <text x="428" y="138" class="f" font-size="6">是</text>
    <path d="M420 158 L496 196 L420 234 L344 196 Z" class="box"/>
    <text x="420" y="192" class="f" font-size="6.2" text-anchor="middle">已刷新</text>
    <text x="420" y="204" class="t" font-size="7.4" font-weight="700" text-anchor="middle">未满 15 秒？</text>
    <path d="M344 196 H171 V282" class="arrow" fill="none" marker-end="url(#stale-arrow)"/>
    <text x="246" y="190" class="f" font-size="6">否</text>
    <path d="M496 196 H670 V282" class="arrow" fill="none" marker-end="url(#stale-arrow)"/>
    <text x="568" y="190" class="f" font-size="6">是</text>
    <rect x="96" y="282" width="150" height="52" class="box"/>
    <text x="108" y="300" class="f" font-size="6.2">动作</text>
    <text x="108" y="316" class="t mono" font-size="8.2">刷新一次</text>
    <text x="108" y="328" class="m" font-size="6.4">写入时间戳，然后刷新</text>
    <rect x="300" y="282" width="150" height="52" class="box"/>
    <text x="312" y="300" class="f" font-size="6.2">结果</text>
    <text x="312" y="316" class="t mono" font-size="8.2">全新文件</text>
    <text x="312" y="328" class="m" font-size="6.4">新 HTML · 新地图</text>
    <line x1="246" y1="308" x2="300" y2="308" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="590" y="282" width="160" height="52" class="box"/>
    <text x="602" y="300" class="f" font-size="6.2">出口</text>
    <text x="602" y="316" class="t mono" font-size="8.2">显示手动按钮</text>
    <text x="602" y="328" class="m" font-size="6.4">让按钮保持可见</text>
    <path d="M375 334 V366 H80 V98" class="dash" fill="none" marker-end="url(#stale-arrow-muted)"/>
    <text x="230" y="360" class="f" font-size="6.4">回到执行中</text>
    <text x="24" y="400" class="f" font-size="6.6">冷却时间是速率限制，不是一次性开关。</text>
    <text x="816" y="400" class="f" font-size="6.6" text-anchor="end">15 秒只是起点 · 依 p95 加载时间调整</text>
  </svg>
  </div>
  <p class="stale-fig-src">恢复状态机 · 一次刷新 · 一个手动出口</p>
</figure>

## 恢复，四个动作

把这些环节排好，整个恢复就是四个动作。

1. **接住。** 动态 import 被拒绝。错误边界匹配消息，并在判断时先渲染成空白。
2. **刷新一次。** 如果冷却允许、浏览器也处于在线状态，写入时间戳并调用 `location.reload()`。
3. **重新验证入口。** 因为 `index.html` 是 `no-cache`，浏览器会向服务器确认，收到新的 HTML。
4. **加载新地图。** 新的 HTML 指着新的哈希。延迟路由现在能对构建 v2 解析。

如果第 2 步不被允许，错误边界会显示手动按钮。那不是恢复失败；那是恢复拒绝打转。

## 其他入口

错误边界只看得到 React 渲染期间发生的错误。动态 import 也可能在 React 永远不会渲染的地方失败：

- router 的预取
- 直接调用 `import()` 的点击处理器
- 抓取依赖 chunk 的 preload helper
- 提供旧外壳的 Service Worker

Vite 的 preload helper 在加载动态 import 与其依赖文件失败时，会在 `window` 上发出 `vite:preloadError` 事件。对不经过 React 渲染的程序路径来说，这是一张有用的安全网：

```ts
// 复用错误边界模块导出的 tryRecover。
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();

  if (!tryRecover()) {
    console.warn('[chunk] 自动刷新已被抑制');
    // 在这里显示横幅或手动刷新按钮。
  }
});
```

调用 `preventDefault()` 会阻止 Vite 把错误重新抛出。如果你拦下了默认行为，就要自己负责后备：记录事件、显示消息，或渲染同一个手动按钮。

对 router 层级的 loader，请在 router 的错误元素里检查同样的错误形状，并调用 `tryRecover()`。重点不是把刷新逻辑复制三份，而是只有一个恢复函数、一个冷却时间，以及几个调用它的接缝。

| 接缝 | 什么失败了 | 挂钩 |
| :--- | :--- | :--- |
| React 渲染 | `React.lazy` 的 import 被拒绝 | 错误边界 |
| Vite preload | 依赖 chunk 预加载失败 | `vite:preloadError` |
| Router 或事件处理器 | 在渲染之外调用 `import()` | Router 错误元素，或区域 `.catch()` |
| Service Worker | 从 worker 缓存提供旧 HTML | 更新流程 + 一次刷新 |

最不该做的事，是把 `window.location.reload()` 挂到每一个 `error` 或 `unhandledrejection` 事件上。大多数错误不是过期 chunk。对任何 rejection 都全局刷新，会让用户因为一次失败的 API 调用、一个广告拦截器，或一个你原本可以好好显示的 bug 而受到惩罚。

## 刷新的成本

自动刷新是一种小小的暴力。它会丢掉：

- 没有被保存的表单输入
- 滚动位置
- 开着的 modal 或菜单
- 进行中的请求
- 用户对自己身在何处的感觉

如果失败的 chunk 是一个用户可以暂时不用的设置页，横幅比刷新更温柔。如果失败的 chunk 是结账流程，刷新是唯一有用的动作。错误边界可以同时支持两者：对阻挡任务的路由用 `auto` 模式，其余用 `prompt` 模式。

至少做三件事：

1. 如果页面有未保存的输入，刷新前先把草稿存起来。
2. 用可访问的状态消息提示刷新，不要让它悄无声息地闪过。
3. 自动尝试用尽时，让手动按钮保持可见。

还有：除非 chunk 失败真的挡住了表单，否则不要在用户正在输入时刷新。背景路由里的过期 chunk 不是紧急事件。

## 用两个真实构建来测试

你无法用 `vite dev` 重现这件事。开发服务器从磁盘提供模块，没有带内容哈希的 chunk 可以删。请用 `vite build` 加 `vite preview`，或真正的静态主机来测试。

1. 构建并预览。

```bash
bun run build
bun run preview
```

2. 打开应用。先不要打开延迟路由。
3. 在 DevTools → Network 记下 chunk 名称，或列出 `dist/assets`。
4. 对延迟页面本身做一个小改动后重新构建。换上新的 `dist`。旧 chunk 已经不在了。
5. 在仍开着的标签页里，点击延迟路由。
6. 预期会有一次刷新，然后新的路由加载。
7. 在 DevTools 里用屏蔽规则拦下所有 `AboutPage-*.js` chunk 后重试。刷新之后，新的 chunk 请求应该再失败一次，然后出现手动按钮——而不是再一次刷新。
8. 切到离线再触发一次。自动刷新应该被跳过；按钮应该出现。

更快的本地重现方式：页面加载后，从 `dist/assets` 删掉延迟 chunk，再点那条路由。预览服务器会返回 404，那正是旧标签页在部署后看到的东西。

也要测试全新加载。新的标签页不应该看到错误边界。如果看到了，那就不是过期 chunk，而是构建或部署的问题。

## 部署检查清单

- 用 `Cache-Control: no-cache` 或 `max-age=0, must-revalidate` 提供 `index.html`。
- 用很长的 `max-age` 与 `immutable` 提供带哈希的资源。
- 如果主机允许，把上一个构建的资源多留一段宽限期。它能把硬失败变成「虽然过期但还能用」的标签页。
- 把新的 HTML 与新的资源原子性地发布，或接受一小段混合窗口期。
- 只匹配模块加载错误；让其他错误进到正常的错误处理。
- 每个冷却时间最多刷新一次。
- 提供手动按钮与可读的消息。
- 记录 chunk URL、路由与构建 id。
- 用真实的两次构建、屏蔽请求与离线模式测试。
- 如果你用 Service Worker，确认它会更新，而且不会把旧 HTML 固定住。

## 这没有解决什么

- 它不会更新一个从未触发延迟 import 的标签页。那个标签页会继续运行旧程序，直到下一次导航或刷新。
- 它不会修好过期的 HTML 入口。如果 HTML 被缓存，刷新可能拿到同一张旧地图；冷却会挡住循环，但用户需要强制刷新，或修正缓存响应头。
- 它不会合并状态。没有保存的工作还是会消失。
- 它不会取代版本监控。chunk 错误是症状；有用的指标是它多久发生一次、发生在哪条路由、在哪次部署之后。

部署就是改名。已经开着的标签页，读的是旧目录。解法不是教旧程序认识新名字，而是快速注意到这次错过，抓取一次新目录，并且在货架还是空的时候给用户一条出路。

少了一个 chunk 不是恐慌的理由。它是一个刷新的理由——一次就好。

## 参考资料

- [Vite 构建指南](https://vite.dev/guide/build.html) — 带哈希的文件名、`dist` 的结构，以及为什么入口 HTML 不一样。
- [Vite 构建选项：module preload](https://vite.dev/config/build-options.html#build-modulepreload) — `vite:preloadError` 事件与它的 `preventDefault()` 行为。
- [React：`lazy`](https://react.dev/reference/react/lazy) — 延迟组件如何 suspend，以及 import 被拒绝时会发生什么。
- [React：用错误边界接住渲染错误](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) — 上面用到的生命周期方法。
- [MDN：`Cache-Control`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) — `no-cache`、`no-store`、`max-age` 与 `immutable`。
- [web.dev：HTTP 缓存](https://web.dev/articles/http-cache) — 入口文件与带哈希资源的实用响应头策略。
- [MDN：动态 `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) — 模块抓不到时被拒绝的那个 promise。
- [web.dev：Service Worker 生命周期](https://web.dev/articles/service-worker-lifecycle) — 为什么旧 worker 能继续提供旧外壳。


<style>
  .prose-inner .stale-lead {
    margin: 26px 0;
    padding: 20px 18px 16px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .stale-lead-head {
    margin-bottom: 14px;
  }

  .prose-inner .stale-lead-kicker {
    margin: 0 0 6px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .stale-lead-title {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: var(--mono-ink);
  }

  .prose-inner .stale-lead-sub {
    margin: 0 0 14px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .stale-lead-grid {
    display: grid;
    grid-template-columns: 1fr 26px 1fr 26px 1fr;
    align-items: stretch;
    margin-bottom: 14px;
  }

  .prose-inner .stale-lead-card {
    display: flex;
    flex-direction: column;
    padding: 16px 14px 12px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .stale-lead-icon {
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

  .prose-inner .stale-lead-ico {
    display: block;
    width: 24px;
    height: 24px;
  }

  .prose-inner .stale-lead-tag {
    margin-bottom: 5px;
    font-family: var(--mono-font-mono);
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--mono-muted);
  }

  .prose-inner .stale-lead-card h4 {
    margin: 0 0 5px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.35;
    color: var(--mono-ink);
  }

  .prose-inner .stale-lead-card p {
    margin: 0 0 12px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .stale-lead-meta {
    margin-top: auto;
    padding-top: 8px;
    border-top: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font-mono);
    font-size: 7.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--mono-faint);
  }

  .prose-inner .stale-lead-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--mono-font-mono);
    font-size: 12px;
    color: var(--mono-faint);
  }

  .prose-inner .stale-lead-flow {
    margin-bottom: 12px;
  }

  .prose-inner .stale-lead-note {
    margin: 0;
    padding-top: 10px;
    border-top: 0.7px solid var(--mono-grid);
    font-size: 12px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .stale-lead-note b {
    color: var(--mono-ink);
  }

  .prose-inner .stale-lead-bridge {
    margin: 0 0 6px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .stale-fig {
    margin: 26px 0;
    padding: 20px 18px 14px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .stale-fig figcaption {
    margin-bottom: 14px;
  }

  .prose-inner .stale-fig-title {
    margin: 4px 0 3px;
    font-size: 15.5px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.3;
    color: var(--mono-ink);
  }

  .prose-inner .stale-fig-sub {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .stale-fig-src {
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

  .prose-inner .stale-scroll {
    overflow-x: auto;
  }

  .prose-inner .stale-svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .prose-inner .stale-svg text {
    font-family: var(--mono-font);
  }

  .prose-inner .stale-svg .t {
    fill: var(--mono-ink);
  }

  .prose-inner .stale-svg .m {
    fill: var(--mono-muted);
  }

  .prose-inner .stale-svg .f {
    fill: var(--mono-faint);
    font-family: var(--mono-font-mono);
  }

  .prose-inner .stale-svg .mono {
    font-family: var(--mono-font-mono);
  }

  .prose-inner .stale-svg .box {
    fill: var(--mono-paper);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .stale-svg .term {
    fill: var(--mono-bg-subtle);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .stale-svg .codebox {
    fill: var(--mono-bg-subtle);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .stale-svg .rule {
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .stale-svg .rule-soft {
    stroke: var(--mono-grid);
    stroke-width: 0.5;
  }

  .prose-inner .stale-svg .dash {
    fill: none;
    stroke: var(--mono-l5);
    stroke-width: 0.7;
    stroke-dasharray: 2 3;
  }

  .prose-inner .stale-svg .arrow {
    fill: none;
    stroke: var(--mono-ink);
    stroke-width: 0.8;
  }

  @media (max-width: 700px) {
    .prose-inner .stale-lead-grid {
      grid-template-columns: 1fr;
    }

    .prose-inner .stale-lead-arrow {
      height: 22px;
      transform: rotate(90deg);
    }

    .prose-inner .stale-lead-title {
      font-size: 18px;
    }

    .prose-inner .stale-svg {
      min-width: 760px;
    }
  }
</style>
