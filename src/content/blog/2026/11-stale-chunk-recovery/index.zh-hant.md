---
title: "沒跟上部署的那個分頁：Vite 過期 chunk 的復原"
description: "為什麼一個開著的 Vite 分頁會請求一個早已不存在的 JavaScript chunk，以及錯誤邊界、一次重新整理與 15 秒冷卻如何把空白頁變成乾淨的更新。"
pubDate: 2026-11-23
category: "Web"
tags: ["Vite", "React", "前端", "快取", "可靠性"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分鐘"
cardImage: "./cover.webp"
cardImageAlt: "過期分頁復原流程圖：舊分頁、延遲載入、404、重新載入一次、新文件"
---

# 沒跟上部署的那個分頁：Vite 過期 chunk 的復原

## 簡單版：一個過期的分頁

<section class="stale-lead">
  <div class="stale-lead-head">
    <span class="card-tag">過期分頁 // 00</span>
    <p class="stale-lead-kicker">部署不會更新已經開著的分頁。它只改變下一個請求會找到什麼。</p>
    <h3 class="stale-lead-title">少了一個檔案，換來一次乾淨的重新整理。</h3>
    <p class="stale-lead-sub">接住失敗的 import，重新整理一次，落在新的建置上。</p>
  </div>
  <div class="stale-lead-grid">
    <div class="stale-lead-card">
      <div class="stale-lead-icon"><svg class="stale-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>
      <div class="stale-lead-tag">部署 // 改名</div>
      <h4>新的建置，新的名字</h4>
      <p>Vite 會把內容雜湊寫進每個檔名。HTML 入口現在指向一組全新的檔案。</p>
      <div class="stale-lead-meta">建置 v2 → 新雜湊</div>
    </div>
    <div class="stale-lead-arrow" aria-hidden="true">→</div>
    <div class="stale-lead-card">
      <div class="stale-lead-icon"><svg class="stale-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg></div>
      <div class="stale-lead-tag">分頁 // 過期地圖</div>
      <h4>開著的分頁仍握著舊地圖</h4>
      <p>它的主 bundle 還列著建置 v1 的 chunk。沒有人告訴它那些檔案已經被移除。</p>
      <div class="stale-lead-meta">分頁 v1 → 舊檔名</div>
    </div>
    <div class="stale-lead-arrow" aria-hidden="true">→</div>
    <div class="stale-lead-card">
      <div class="stale-lead-icon"><svg class="stale-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></div>
      <div class="stale-lead-tag">復原 // 重新整理</div>
      <h4>接住這次錯過，重新整理一次</h4>
      <p>錯誤邊界認得這種模組載入失敗。一次重新整理就會取得新的 HTML 與新的檔名。</p>
      <div class="stale-lead-meta">CHUNK 錯誤 → 全新文件</div>
    </div>
  </div>
  <div class="stale-lead-flow stale-scroll">
  <svg class="stale-svg" viewBox="0 0 840 170" role="img" aria-labelledby="stale-lead-title stale-lead-desc">
    <title id="stale-lead-title">過期分頁的復原流程</title>
    <desc id="stale-lead-desc">舊分頁開啟一條延遲路由，請求已刪除的 chunk，收到 404，錯誤邊界觸發一次重新整理。重新整理取得新的 HTML 與新的 chunk。</desc>
    <defs>
      <marker id="stale-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="stale-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">簡單流程 // 一個分頁，一次錯過</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">舊地圖 · 404 · 全新文件</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="120" height="72" class="term"/>
    <svg x="36" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/></svg>
    <text x="58" y="63" class="f" font-size="6.2" letter-spacing="0.6">分頁 v1</text>
    <text x="36" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">舊分頁</text>
    <text x="36" y="96" class="m" font-size="6.8">舊地圖</text>
    <text x="36" y="108" class="f" font-size="6.2">index-A9.js</text>
    <line x1="144" y1="80" x2="160" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="160" y="44" width="150" height="72" class="box"/>
    <svg x="172" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="m10 12-2 2 2 2"/><path d="m14 16 2-2-2-2"/></svg>
    <text x="194" y="63" class="f" font-size="6.2" letter-spacing="0.6">路由</text>
    <text x="172" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">延遲載入</text>
    <text x="172" y="96" class="m" font-size="6.8">import()</text>
    <text x="172" y="108" class="f" font-size="6.2">AboutPage-OLD.js</text>
    <line x1="310" y1="80" x2="326" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="326" y="44" width="120" height="72" class="codebox"/>
    <text x="342" y="63" class="f" font-size="6.2" letter-spacing="0.6">伺服器</text>
    <text x="342" y="84" class="t" font-size="17" font-weight="800" letter-spacing="-0.02em">404</text>
    <text x="342" y="96" class="m" font-size="6.8">chunk 已刪除</text>
    <text x="342" y="108" class="f" font-size="6.2">檔案不存在</text>
    <line x1="446" y1="80" x2="462" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="462" y="44" width="150" height="72" class="box"/>
    <svg x="474" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
    <text x="496" y="63" class="f" font-size="6.2" letter-spacing="0.6">攔截</text>
    <text x="474" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">錯誤邊界</text>
    <text x="474" y="96" class="m" font-size="6.8">模組錯誤</text>
    <text x="474" y="108" class="f" font-size="6.2">僅限渲染</text>
    <line x1="612" y1="80" x2="628" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="628" y="44" width="90" height="72" class="box"/>
    <svg x="640" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
    <text x="662" y="63" class="f" font-size="6.2" letter-spacing="0.6">一次</text>
    <text x="640" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">重新整理</text>
    <text x="640" y="96" class="m" font-size="6.8">15 秒冷卻</text>
    <text x="640" y="108" class="f" font-size="6.2">新文件</text>
    <line x1="718" y1="80" x2="734" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="734" y="44" width="82" height="72" class="codebox"/>
    <svg x="746" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
    <text x="768" y="63" class="f" font-size="6.2" letter-spacing="0.6">分頁 v2</text>
    <text x="746" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">全新</text>
    <text x="746" y="96" class="m" font-size="6.8">新地圖</text>
    <text x="746" y="108" class="f" font-size="6.2">新雜湊</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">若第二次載入仍失敗 // 顯示手動按鈕</text>
  </svg>
  </div>
  <p class="stale-lead-note"><b>舊程式並沒有壞。壞掉的是它的地址。</b> 復原不是打補丁；是換一份全新的文件。</p>
</section>

<p class="stale-lead-bridge">接下來是這句話背後的機制：建置寫了什麼、分頁記住了什麼、錯誤在哪裡浮現，以及為什麼重新整理需要一條牽繩。</p>

<figure class="fig">
  <img src="/images/stale-chunk-recovery/lead.webp" alt="過期分頁復原流程圖：舊分頁、延遲載入、404、重新載入一次、新文件" width="720" height="405" loading="lazy" />
  <figcaption>編輯圖解——過期分頁的復原流程：舊分頁、延遲載入、404、重新載入一次、新文件。</figcaption>
</figure>

## 部署就是改名

10:00，一位訪客打開應用。瀏覽器收到 `index.html`，讀到一個 `<script type="module">` 標籤，下載 `assets/index-A9_mBUvc.js`。那個檔案就是應用本體：外殼、路由，以及它知道如何載入的每一條延遲路由的地圖。

訪客四處點擊，但從未打開 About 頁面。沒有任何東西去抓 `AboutPage-OLD123.js`。它存在於伺服器上，但不在分頁的記憶體裡，也不在它的 HTTP 快取裡。

10:05，你部署了一個新的建置。裡面有 `index-NEW999.js`、`AboutPage-NEW888.js`，以及一個指向它們的新 `index.html`。舊的雜湊檔案從伺服器上移除。

10:06，訪客點擊 About。分頁還在執行 `index-A9_mBUvc.js`。那個檔案從未聽過建置 v2。它呼叫 `import('./AboutPage')`，Vite 把它編譯成對 `AboutPage-OLD123.js` 的請求。伺服器回傳 404。動態 import 被拒絕。React 沒有元件可以渲染，於是拒絕沿著樹往上傳。如果沒有錯誤邊界接住，整棵樹會卸載，頁面變成空白。

瀏覽器沒有做錯任何事。它只是照著一張印出來時還正確的地圖走。

```text
dist/
├── index.html                 # 每次部署都是同一個網址；必須重新驗證
└── assets/
    ├── index-A9_mBUvc.js      # 入口：握有延遲路由的地圖
    ├── AboutPage-OLD123.js    # 只有打開 /about 時才會抓取
    └── ...
```

內容雜湊是這套系統能運作的原因。內容改變的檔案會得到新名字，所以 CDN 可以把它快取到永久。入口 HTML 是唯一不能被永久快取的文件，因為它的工作就是指出當前建置的名字。

```http
# index.html — 保留地址，重新驗證內容
Cache-Control: no-cache

# /assets/* — 內容一變，檔名就變
Cache-Control: public, max-age=31536000, immutable
```

`no-cache` 是個容易誤解的名字。它不是「不要儲存」，而是「不要未經詢問就使用」。HTML 可以留在瀏覽器快取裡；導覽或重新整理時，瀏覽器仍會向伺服器確認。`no-store` 更強，但通常不需要。

兩個細節很重要：

- 已經抓過的延遲 chunk 可能還在 HTTP 快取裡。舊分頁對那條路由還能繼續運作。失敗會出現在訪客在部署前從未打開過的路由——也就是從未被快取的那些。
- 如果 HTML 本身被快取到部署之後，重新整理可能還是拿到舊 HTML，指向舊主 bundle，再指向舊 chunk。復原迴圈救不了過期的入口文件。那是標頭設定的問題，不是錯誤邊界的問題。

<figure class="stale-fig">
  <figcaption>
    <span class="card-tag">失敗 // 01</span>
    <h3 class="stale-fig-title">這個分頁正在讀一份已被替換的目錄</h3>
    <p class="stale-fig-sub">部署改變了伺服器上的名字。它沒有改變開著的分頁已經記住的名字。</p>
  </figcaption>
  <div class="stale-scroll">
  <svg class="stale-svg" viewBox="0 0 840 340" role="img" aria-labelledby="stale-f1-title stale-f1-desc">
    <title id="stale-f1-title">一個過期分頁的三個時刻</title>
    <desc id="stale-f1-desc">10:00，分頁載入 index.html 與 index-A9.js，並記住 AboutPage-OLD123.js 但沒有抓取。10:05，新的建置取代舊檔案。10:06，分頁請求已刪除的 chunk，收到 404。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">失敗 // 三個時刻</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一個分頁 · 兩個建置 · 一個 404</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="42" width="248" height="26" class="term"/>
    <text x="36" y="59" class="f" font-size="7" letter-spacing="0.8">10:00 · 首次載入</text>
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
    <text x="36" y="166" class="m" font-size="6.8">分頁存著 v1 地圖。</text>
    <text x="36" y="178" class="m" font-size="6.8">About 從未被打開，所以它的</text>
    <text x="36" y="190" class="m" font-size="6.8">chunk 不在 HTTP 快取裡。</text>
    <rect x="36" y="208" width="224" height="28" class="term"/>
    <text x="48" y="226" class="f" font-size="6.6" letter-spacing="0.6">地圖 v1 // 在記憶體</text>
    <text x="36" y="262" class="f" font-size="6.4" letter-spacing="0.6">這個分頁 // 仍在執行</text>
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
    <text x="532" y="134" class="m mono" font-size="6.8" text-anchor="end">已刪除</text>
    <line x1="308" y1="146" x2="532" y2="146" class="rule"/>
    <text x="308" y="166" class="m" font-size="6.8">新的 HTML 指著一組新檔案。</text>
    <text x="308" y="178" class="m" font-size="6.8">舊的雜湊檔案已經不在了。</text>
    <rect x="308" y="208" width="224" height="28" class="term"/>
    <text x="320" y="226" class="f" font-size="6.6" letter-spacing="0.6">地圖 v2 // 在伺服器</text>
    <text x="308" y="262" class="f" font-size="6.4" letter-spacing="0.6">伺服器 // 部署之後</text>
    <rect x="568" y="42" width="248" height="26" class="term"/>
    <text x="580" y="59" class="f" font-size="7" letter-spacing="0.8">10:06 · 點擊</text>
    <rect x="568" y="68" width="248" height="214" class="box"/>
    <rect x="576" y="74" width="232" height="26" fill="var(--mono-l1)"/>
    <text x="586" y="91" fill="var(--mono-paper)" class="mono" font-size="7.2">GET AboutPage-OLD.js</text>
    <text x="798" y="91" fill="var(--mono-paper)" class="mono" font-size="6.8" text-anchor="end">404</text>
    <text x="580" y="116" class="t mono" font-size="7.2">import()</text>
    <text x="804" y="116" class="m mono" font-size="6.8" text-anchor="end">拒絕</text>
    <line x1="580" y1="124" x2="804" y2="124" class="rule-soft"/>
    <text x="580" y="140" class="t mono" font-size="7.2">錯誤邊界</text>
    <text x="804" y="140" class="m mono" font-size="6.8" text-anchor="end">攔截</text>
    <line x1="580" y1="148" x2="804" y2="148" class="rule"/>
    <text x="580" y="166" class="m" font-size="6.8">分頁照著它唯一有的地圖走。</text>
    <text x="580" y="178" class="m" font-size="6.8">地址已經過期了。</text>
    <rect x="580" y="208" width="224" height="28" class="term"/>
    <text x="592" y="226" class="f" font-size="6.6" letter-spacing="0.6">下一步 // 全新文件</text>
    <text x="580" y="262" class="f" font-size="6.4" letter-spacing="0.6">舊分頁 // 錯過之後</text>
    <line x1="24" y1="302" x2="816" y2="302" class="dash"/>
    <text x="420" y="320" class="f" font-size="6.8" text-anchor="middle" letter-spacing="0.6">建置 v2 從未到達開著的分頁 · 舊地圖指向一個已刪除的檔案</text>
  </svg>
  </div>
  <p class="stale-fig-src">部署時間軸 · 一個開著的分頁 · VITE 內容雜湊</p>
</figure>

## 錯誤有它的形狀

動態 import 失敗長什麼樣子？訊息依瀏覽器而異，但形狀一致：一個被拒絕的 promise，說某個模組抓不到。

- Chrome：`Failed to fetch dynamically imported module: https://…/assets/AboutPage-OLD123.js`
- Chrome（HTML 回退）：`Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html".`
- Firefox：`error loading dynamically imported module: https://…`
- Safari：`Importing a module script failed.`
- webpack：`ChunkLoadError: Loading chunk 42 failed.`

要比對的是片語，不是完整字串。URL 每次建置都不一樣；片語不會變。

```ts
const CHUNK_ERROR_RE =
  /Failed to fetch dynamically imported module|Failed to load module script|error loading dynamically imported module|Importing a module script failed|ChunkLoadError/i;
```

最後一個選項留給 webpack 時代的 bundle 與較舊的工具鏈。其餘幾項涵蓋你大概會遇到的瀏覽器。

`Failed to load module script` 這個變體，是主機把不存在的資產請求改寫成 `index.html` 時看到的；回應是 HTML，不是 JavaScript。如果你的主機這樣做，瀏覽器根本看不到 404。

有一個區分比正則本身更重要：單純的 `TypeError: Failed to fetch` 不夠。使用者離線、API 呼叫失敗、CORS 擋掉請求時，也會看到同樣的訊息。對每個網路錯誤都重新整理，會把不穩的連線變成重整迴圈。錯誤邊界只該對模組載入失敗採取行動。

## 在接縫處接住它

`React.lazy` 是渲染時期的載入器。import 還在等待時，它會 suspend；import 被拒絕時，它會拋出錯誤。因此，只要錯誤邊界位於延遲元件之上，就能接住這個失敗。

```tsx
const AboutPage = lazy(() => import('./AboutPage'));

export default function App() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <button onClick={() => setShowAbout(true)}>打開 About</button>

      <ChunkErrorBoundary>
        <Suspense fallback={<p>載入中…</p>}>
          {showAbout && <AboutPage />}
        </Suspense>
      </ChunkErrorBoundary>
    </>
  );
}
```

順序很重要，但不是第一眼看起來的那種。錯誤邊界必須在延遲元件之上；把它放在 `Suspense` 外側，是讓載入備援與錯誤備援保持分離最簡單的方式。放在應用根部的邊界也能接住錯誤，但它會替換整個外殼。把它縮到會失敗的區域，讓頁面其餘部分仍可使用。

錯誤邊界本身需要兩個生命週期方法。`getDerivedStateFromError` 在渲染期間執行，判斷這是不是 chunk 錯誤。`componentDidCatch` 在 commit 之後執行，是決定是否重新整理的正確位置。

完整檔案：

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
    // sessionStorage 在隱私模式下可能拋出錯誤。
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

    console.error('[chunk] 模組載入失敗', {
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
        <p>這個頁面有新版本。</p>
        <button onClick={() => window.location.reload()}>
          重新載入頁面
        </button>
      </div>
    );
  }
}
```

幾個細節是刻意的：

- `getDerivedStateFromError` 對所有不是 chunk 錯誤的東西回傳 `null`，所以邊界不會吞掉無關的 bug。
- `tryRecover` 在重新整理前檢查 `navigator.onLine`。離線時重新整理什麼也抓不到，只會弄丟使用者手上還有的頁面。這個旗標只是提示，但能擋掉最明顯的情況。
- sessionStorage 的讀寫放在 `try` 裡，因為隱私模式與某些嵌入式瀏覽器會在存取儲存時拋出錯誤。
- 重新整理進行中時，`render` 回傳 `null`，所以頁面不會閃出一張錯誤卡。

## 只重新整理一次，不要無限迴圈

天真的版本只有一行：`componentDidCatch() { window.location.reload(); }`。它能用，直到重新整理本身也救不了問題。

什麼會讓第二次載入失敗？

- HTML 還被快取著，仍指向舊 bundle。
- Service Worker 還在供應上一個外殼。
- CDN 有新的 HTML，但還沒有新的 chunk。
- 使用者離線。
- 部署只傳播了一半。

沒有護欄的話，每次載入失敗都會再重整一次。分頁變成閃爍迴圈，使用者讀不到錯誤，也按不到任何東西。

護欄是一個時間戳，不是一個布林值。布林值（「已經重整過」）會停用整個 session 的復原能力，包括一小時後的另一次部署。時間戳讓分頁在冷卻後再試一次，同時擋住緊密的迴圈。

十五秒是猜的，但還說得過去。它比慢速連線下的一次重新整理加一次 chunk 抓取更長，又短到讓後來的部署仍能自動復原。依你的 p95 載入時間調整；確切數字不如「有一個數字」重要。

`sessionStorage` 是這個值該放的架子。它以分頁為範圍，能撐過重新整理，分頁關閉時就消失。`localStorage` 會把冷卻時間漏到其他分頁與 session，那裡不該有這個值。

<figure class="stale-fig">
  <figcaption>
    <span class="card-tag">復原 // 02</span>
    <h3 class="stale-fig-title">一次自動重新整理，一個手動出口</h3>
    <p class="stale-fig-sub">時間戳是速率限制。它讓分頁能從下一次部署復原，又不至於讓壞掉的重新整理無限打轉。</p>
  </figcaption>
  <div class="stale-scroll">
  <svg class="stale-svg" viewBox="0 0 840 420" role="img" aria-labelledby="stale-f2-title stale-f2-desc">
    <title id="stale-f2-title">chunk 復原狀態機</title>
    <desc id="stale-f2-desc">執行中的應用遇到被拒絕的 import。若這不是 chunk 錯誤，就把錯誤往外拋。若是 chunk 錯誤，且分頁在過去十五秒內沒有重新整理過，就重新整理一次並取得全新文件。若已經重整過，就顯示手動重新整理按鈕。虛線把全新文件帶回執行中狀態。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">復原迴圈 // 兩個出口</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">攔截 · 判斷 · 重新整理或詢問</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="54" width="112" height="44" class="box"/>
    <text x="36" y="72" class="f" font-size="6.2">狀態</text>
    <text x="36" y="88" class="t mono" font-size="8.4">執行中</text>
    <line x1="136" y1="76" x2="160" y2="76" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="160" y="54" width="150" height="44" class="box"/>
    <text x="172" y="72" class="f" font-size="6.2">事件</text>
    <text x="172" y="88" class="t mono" font-size="8">IMPORT 被拒絕</text>
    <line x1="310" y1="76" x2="344" y2="76" class="arrow" marker-end="url(#stale-arrow)"/>
    <path d="M420 38 L496 76 L420 114 L344 76 Z" class="box"/>
    <text x="420" y="72" class="f" font-size="6.2" text-anchor="middle">這是</text>
    <text x="420" y="84" class="t" font-size="7.4" font-weight="700" text-anchor="middle">CHUNK 錯誤嗎？</text>
    <line x1="496" y1="76" x2="560" y2="76" class="arrow" marker-end="url(#stale-arrow)"/>
    <text x="516" y="70" class="f" font-size="6">否</text>
    <rect x="560" y="54" width="140" height="44" class="box"/>
    <text x="572" y="72" class="f" font-size="6.2">出口</text>
    <text x="572" y="88" class="t mono" font-size="8">往外拋</text>
    <line x1="420" y1="114" x2="420" y2="158" class="arrow" marker-end="url(#stale-arrow)"/>
    <text x="428" y="138" class="f" font-size="6">是</text>
    <path d="M420 158 L496 196 L420 234 L344 196 Z" class="box"/>
    <text x="420" y="192" class="f" font-size="6.2" text-anchor="middle">已重新整理</text>
    <text x="420" y="204" class="t" font-size="7.4" font-weight="700" text-anchor="middle">未滿 15 秒？</text>
    <path d="M344 196 H171 V282" class="arrow" fill="none" marker-end="url(#stale-arrow)"/>
    <text x="246" y="190" class="f" font-size="6">否</text>
    <path d="M496 196 H670 V282" class="arrow" fill="none" marker-end="url(#stale-arrow)"/>
    <text x="568" y="190" class="f" font-size="6">是</text>
    <rect x="96" y="282" width="150" height="52" class="box"/>
    <text x="108" y="300" class="f" font-size="6.2">動作</text>
    <text x="108" y="316" class="t mono" font-size="8.2">重新整理一次</text>
    <text x="108" y="328" class="m" font-size="6.4">寫入時間戳，然後重整</text>
    <rect x="300" y="282" width="150" height="52" class="box"/>
    <text x="312" y="300" class="f" font-size="6.2">結果</text>
    <text x="312" y="316" class="t mono" font-size="8.2">全新文件</text>
    <text x="312" y="328" class="m" font-size="6.4">新 HTML · 新地圖</text>
    <line x1="246" y1="308" x2="300" y2="308" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="590" y="282" width="160" height="52" class="box"/>
    <text x="602" y="300" class="f" font-size="6.2">出口</text>
    <text x="602" y="316" class="t mono" font-size="8.2">顯示手動按鈕</text>
    <text x="602" y="328" class="m" font-size="6.4">讓按鈕保持可見</text>
    <path d="M375 334 V366 H80 V98" class="dash" fill="none" marker-end="url(#stale-arrow-muted)"/>
    <text x="230" y="360" class="f" font-size="6.4">回到執行中</text>
    <text x="24" y="400" class="f" font-size="6.6">冷卻時間是速率限制，不是一次性旗標。</text>
    <text x="816" y="400" class="f" font-size="6.6" text-anchor="end">15 秒只是起點 · 依 p95 載入時間調整</text>
  </svg>
  </div>
  <p class="stale-fig-src">復原狀態機 · 一次重新整理 · 一個手動出口</p>
</figure>

## 復原，四個動作

把零件排好，整個復原就是四個動作。

1. **接住。** 動態 import 被拒絕。錯誤邊界比對訊息，並在判斷時先渲染成空白。
2. **重新整理一次。** 如果冷卻允許、瀏覽器也在線上，寫入時間戳並呼叫 `location.reload()`。
3. **重新驗證入口。** 因為 `index.html` 是 `no-cache`，瀏覽器會向伺服器確認，收到新的 HTML。
4. **載入新地圖。** 新的 HTML 指著新的雜湊。延遲路由現在能對建置 v2 解析。

如果第 2 步不被允許，錯誤邊界會顯示手動按鈕。那不是復原失敗；那是復原拒絕打轉。

## 其他入口

錯誤邊界只看得到 React 渲染期間發生的錯誤。動態 import 也可能在 React 永遠不會渲染的地方失敗：

- router 的預取
- 直接呼叫 `import()` 的點擊處理器
- 抓取相依 chunk 的 preload helper
- 供應舊外殼的 Service Worker

Vite 的 preload helper 在載入動態 import 與其相依檔案失敗時，會在 `window` 上發出 `vite:preloadError` 事件。對不經過 React 渲染的程式路徑來說，這是一張有用的安全網：

```ts
// 重用錯誤邊界模組匯出的 tryRecover。
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();

  if (!tryRecover()) {
    console.warn('[chunk] 自動重新整理已被抑制');
    // 在這裡顯示橫幅或手動重新整理按鈕。
  }
});
```

呼叫 `preventDefault()` 會阻止 Vite 把錯誤重新拋出。如果你攔下了預設行為，就要自己負責備援：記錄事件、顯示訊息，或渲染同一個手動按鈕。

對 router 層級的 loader，請在 router 的錯誤元素裡檢查同樣的錯誤形狀，並呼叫 `tryRecover()`。重點不是把重新整理邏輯複製三份，而是只有一個復原函式、一個冷卻時間，以及幾個呼叫它的接縫。

| 接縫 | 什麼失敗了 | 掛鉤 |
| :--- | :--- | :--- |
| React 渲染 | `React.lazy` 的 import 被拒絕 | 錯誤邊界 |
| Vite preload | 相依 chunk 預載失敗 | `vite:preloadError` |
| Router 或事件處理器 | 在渲染之外呼叫 `import()` | Router 錯誤元素，或區域 `.catch()` |
| Service Worker | 從 worker 快取供應舊 HTML | 更新流程 + 一次重新整理 |

最不該做的事，是把 `window.location.reload()` 掛到每一個 `error` 或 `unhandledrejection` 事件上。大多數錯誤不是過期 chunk。對任何 rejection 都全域重整，會讓使用者因為一次失敗的 API 呼叫、一個廣告封鎖器，或一個你原本可以好好顯示的 bug 而受到懲罰。

## 重新整理的成本

自動重新整理是一種小小的暴力。它會丟掉：

- 沒有被保存的表單輸入
- 捲動位置
- 開著的 modal 或選單
- 進行中的請求
- 使用者對自己身在何處的感覺

如果失敗的 chunk 是一個使用者可以暫時不用的設定頁，橫幅比重新整理更溫柔。如果失敗的 chunk 是結帳流程，重新整理是唯一有用的動作。錯誤邊界可以同時支援兩者：對阻擋任務的路由用 `auto` 模式，其餘用 `prompt` 模式。

至少做三件事：

1. 如果頁面有未保存的輸入，重新整理前先把草稿存起來。
2. 用可存取的狀態訊息公告重新整理，不要讓它無聲閃過。
3. 自動嘗試用完時，讓手動按鈕保持可見。

還有：除非 chunk 失敗真的擋住了表單，否則不要在使用者正在輸入時重新整理。背景路由裡的過期 chunk 不是緊急事件。

## 用兩個真實建置來測試

你無法用 `vite dev` 重現這件事。開發伺服器從磁碟供應模組，沒有帶內容雜湊的 chunk 可以刪。請用 `vite build` 加 `vite preview`，或真正的靜態主機來測試。

1. 建置並預覽。

```bash
bun run build
bun run preview
```

2. 打開應用。先不要打開延遲路由。
3. 在 DevTools → Network 記下 chunk 名稱，或列出 `dist/assets`。
4. 對延遲頁面本身做一個小改動後重新建置。供應新的 `dist`。舊 chunk 已經不在了。
5. 在仍開著的分頁裡，點擊延遲路由。
6. 預期會有一次重新整理，然後新的路由載入。
7. 在 DevTools 裡用封鎖規則攔下所有 `AboutPage-*.js` chunk 後重試。重新整理之後，新的 chunk 請求應該再失敗一次，然後出現手動按鈕——而不是再一次重新整理。
8. 切到離線再觸發一次。自動重新整理應該被跳過；按鈕應該出現。

更快的本地重現方式：頁面載入後，從 `dist/assets` 刪掉延遲 chunk，再點那條路由。預覽伺服器會回傳 404，那正是舊分頁在部署後看到的東西。

也要測試全新載入。新的分頁不應該看到錯誤邊界。如果看到了，那就不是過期 chunk，而是建置或部署的問題。

## 部署檢查清單

- 用 `Cache-Control: no-cache` 或 `max-age=0, must-revalidate` 供應 `index.html`。
- 用很長的 `max-age` 與 `immutable` 供應帶雜湊的資產。
- 如果主機允許，把上一個建置的資產多留一段寬限期。它能把硬失敗變成「雖然過期但還能用」的分頁。
- 把新的 HTML 與新的資產原子性地發布，或接受一小段混合視窗期。
- 只比對模組載入錯誤；讓其他錯誤進到正常的錯誤處理。
- 每個冷卻時間最多重新整理一次。
- 提供手動按鈕與可讀的訊息。
- 記錄 chunk URL、路由與建置 id。
- 用真實的兩次建置、封鎖請求與離線模式測試。
- 如果你用 Service Worker，確認它會更新，而且不會把舊 HTML 釘住。

## 這沒有解決什麼

- 它不會更新一個從未觸發延遲 import 的分頁。那個分頁會繼續執行舊程式，直到下一次導覽或重新整理。
- 它不會修好過期的 HTML 入口。如果 HTML 被快取，重新整理可能拿到同一張舊地圖；冷卻會擋住迴圈，但使用者需要強制重新整理，或修正快取標頭。
- 它不會合併狀態。沒有保存的工作還是會消失。
- 它不會取代版本監控。chunk 錯誤是症狀；有用的指標是它多久發生一次、發生在哪條路由、在哪次部署之後。

部署就是改名。已經開著的分頁，讀的是舊目錄。解法不是教舊程式認識新名字，而是快速注意到這次錯過，抓取一次新目錄，並且在架上還是空的時候給使用者一條出路。

少了一個 chunk 不是恐慌的理由。它是一個重新整理的理由——一次就好。

## 參考資料

- [Vite 建置指南](https://vite.dev/guide/build.html) — 帶雜湊的檔名、`dist` 的結構，以及為什麼入口 HTML 不一樣。
- [Vite 建置選項：module preload](https://vite.dev/config/build-options.html#build-modulepreload) — `vite:preloadError` 事件與它的 `preventDefault()` 行為。
- [React：`lazy`](https://react.dev/reference/react/lazy) — 延遲元件如何 suspend，以及 import 被拒絕時會發生什麼事。
- [React：用錯誤邊界接住渲染錯誤](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) — 上面用到的生命週期方法。
- [MDN：`Cache-Control`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) — `no-cache`、`no-store`、`max-age` 與 `immutable`。
- [web.dev：HTTP 快取](https://web.dev/articles/http-cache) — 入口文件與帶雜湊資產的實務標頭策略。
- [MDN：動態 `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) — 模組抓不到時被拒絕的那個 promise。
- [web.dev：Service Worker 生命週期](https://web.dev/articles/service-worker-lifecycle) — 為什麼舊 worker 能繼續供應舊外殼。


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
