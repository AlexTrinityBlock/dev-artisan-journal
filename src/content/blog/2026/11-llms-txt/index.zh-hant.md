---
title: "llms.txt：給 AI 代理的一張小地圖"
description: "llms.txt 是做什麼用的、檔案長什麼樣子，以及它不做什麼——一篇簡短的實用介紹，起點是 llmstxt.org。"
pubDate: 2026-11-26
category: "Web"
tags: ["llms.txt", "AI 代理", "Markdown", "上下文", "Web 標準"]
featured: false
author: "Alex.Hsiao"
readTime: "4 分鐘"
cardImage: "./cover.webp"
cardImageAlt: "llms.txt 官方範例格式：一個 H1、blockquote 摘要、H2 區段與帶說明的連結清單"
---

# llms.txt：給 AI 代理的一張小地圖

llms.txt 是一個放在 `/llms.txt` 的 Markdown 檔——也可以放在 `/docs/llms.txt` 這類子路徑——用來告訴 AI 代理一個網站或某個區段有什麼內容、哪裡可以讀到更多。這就是它的工作。它是一份給機器看的策展索引，不是排名技巧，也不是 `robots.txt` 的替代品。

這個提案由 Jeremy Howard 提出，2024 年 9 月首次發表。2026 年 8 月更新的第二版，反映了兩年來的採用情況。規格的首頁是 [llmstxt.org](https://llmstxt.org/)。

## 它解決什麼問題

網頁是為人設計的。它帶著導覽、廣告、腳本、cookie 橫幅與版面。代理抓取頁面後，必須先把這些剝掉，而且還不一定知道哪一頁重要。上下文雖然比以前大，但一整個文件網站仍然放不進去。每一個無關的 token 都在增加延遲與成本。

llms.txt 反過來做：把地圖保持很小，把細節放在連結後面。代理讀地圖，選出真正需要的兩三頁，只抓那些頁面。路徑是固定的，代理不必猜要從哪裡開始。

## 檔案長什麼樣子

格式刻意保持純 Markdown。只有一個 H1 是必要欄位；blockquote 摘要與選填細節通常接著出現。H2 區段裡放連結清單，每個連結可以加一句簡短說明。

```md
# Acme Docs

> Acme is a payments API for small businesses.

Use the test keys in the sandbox. Production keys are issued after review.

## Start here

- [Quickstart](https://docs.acme.com/quickstart.md): install, authenticate, first charge
- [API reference](https://docs.acme.com/api.md): endpoints, errors, rate limits

## Optional

- [Changelog](https://docs.acme.com/changelog.md)
```

`Optional` 區段是一個慣例：放代理在上下文吃緊時可以跳過的次要資料。

<figure class="fig">
  <img src="/images/llms-txt/llms-txt-format.webp" alt="llms.txt 範例格式示意圖：一個 H1 標題、blockquote 說明、選填細節、H2 區段與帶說明的連結清單" width="1108" height="718" loading="lazy" />
  <figcaption><b>官方圖示</b> — llmstxt.org 的範例格式：一個 H1、blockquote 摘要、選填細節、H2 區段，以及帶簡短說明的連結清單。來源：<a href="https://llmstxt.org/">llmstxt.org</a></figcaption>
</figure>

第二版補上了另一半：代理可能會需要的頁面，應該在相同 URL 提供乾淨的 Markdown 版本，檔名是 `page.md` 或 `page.html.md`。網站可以用 `rel="alternate" type="text/markdown"` 標出這些版本，並用 `rel="describedby"` 指向涵蓋它的 `llms.txt`。連結可以放在 HTML 裡，也可以放在 HTTP `Link` 標頭，讓 CDN 不必逐頁修改就能加上。

## 它不是什麼

- **不是 `robots.txt` 的替代品。** `robots.txt` 說爬蟲可以存取什麼；`llms.txt` 說哪些內容值得讀、在哪裡讀。
- **不是 `sitemap.xml` 的替代品。** Sitemap 列出可索引的頁面；`llms.txt` 是策展過的，可以包含外部連結，而且應該指向 LLM 可讀的版本。
- **不是保證。** 它是一個提案，不是強制標準。模型可以忽略它。它只在代理正在找路時幫上忙。
- **不是訓練授權。** 這個提案主要談推論時的使用，並沒有解決訓練或再利用的權利，也不取代網站的條款。

## 誰應該放一份

軟體文件是最強的使用場景，規格首頁也說大多數使用集中在那裡。coding agent 如果能讀到 Markdown 版的快速入門與 API 參考，就會少做幾次錯誤的呼叫。同樣的模式也適用於說明政策的企業網站、回答個人 CV 問題的個人網站，或提供課程資訊的學校。OpenAI、Anthropic 與 Gemini 都為自家的開發者文件放了 `llms.txt`。

對一個小網站來說，成本就是一個檔案。回報是代理不必讀完整個網站，就能找到正確的那一頁。

## 怎麼測試

只給代理你的 `llms.txt`，再問它一個真實問題。如果它選不到正確的連結，地圖就不夠清楚。規格首頁建議的正是這個測試。用具體的語言、描述每一個連結、不要用沒有解釋的術語。

## 參考資料

- [The /llms.txt file, v2](https://llmstxt.org/) — 現行提案的格式、範例與採用情況。
- [Changes in v2](https://llmstxt.org/changes.html) — 2024 年 9 月原始提案之後的變更與原因。
- [/llms.txt—a proposal to provide information to help LLMs use websites](https://www.answer.ai/posts/2024-09-03-llmstxt.html) — Jeremy Howard 在 Answer.AI 的原始公告。
- [OpenAI developer docs llms.txt](https://developers.openai.com/llms.txt) — 大型文件網站的實際索引。
- [Anthropic docs llms.txt](https://docs.anthropic.com/llms.txt) — Claude 文件索引。
- [Gemini API docs llms.txt](https://ai.google.dev/gemini-api/docs/llms.txt) — Google Gemini API 文件索引。
- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html) — 常與 llms.txt 對照的爬蟲存取標準。
- [Sitemaps XML format](https://www.sitemaps.org/protocol.html) — 與 llms.txt 互補的索引標準。
