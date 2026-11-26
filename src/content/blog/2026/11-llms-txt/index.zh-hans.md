---
title: "llms.txt：给 AI 代理的一张小地图"
description: "llms.txt 是做什么用的、文件长什么样子，以及它不做什么——一篇简短的实用介绍，起点是 llmstxt.org。"
pubDate: 2026-11-26
category: "Web"
tags: ["llms.txt", "AI 代理", "Markdown", "上下文", "Web 标准"]
featured: false
author: "Alex.Hsiao"
readTime: "4 分钟"
---

# llms.txt：给 AI 代理的一张小地图

llms.txt 是一个放在 `/llms.txt` 的 Markdown 文件——也可以放在 `/docs/llms.txt` 这类子路径——用来告诉 AI 代理一个网站或某个区段有什么内容、哪里可以读到更多。这就是它的工作。它是一份给机器看的策展索引，不是排名技巧，也不是 `robots.txt` 的替代品。

这个提案由 Jeremy Howard 提出，2024 年 9 月首次发表。2026 年 8 月更新的第二版，反映了两年来采用的情况。规格首页是 [llmstxt.org](https://llmstxt.org/)。

## 它解决什么问题

网页是为人们设计的。它带着导航、广告、脚本、cookie 横幅与版面布局。代理抓取页面后，必须先把这些剥掉，而且还未必知道哪一页重要。上下文虽然比以前大，但一整个文档网站仍然放不进去。每一个无关的 token 都在增加延迟与成本。

llms.txt 反过来做：把地图保持很小，把细节放在链接后面。代理读地图，选出真正需要的两三页，只抓那些页面。路径是固定的，代理不必猜要从哪里开始。

## 文件长什么样子

格式刻意保持纯 Markdown。只有一个 H1 是必需字段；blockquote 摘要与可选细节通常随后出现。H2 章节里放链接列表，每个链接可以加一句简短说明。

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

`Optional` 区段是一个惯例：放代理在上下文紧张时可以跳过的次要资料。

第二版补上了另一半：代理可能会需要的页面，应该在相同 URL 提供干净的 Markdown 版本，文件名是 `page.md` 或 `page.html.md`。网站可以用 `rel="alternate" type="text/markdown"` 标出这些版本，并用 `rel="describedby"` 指向覆盖它的 `llms.txt`。链接可以放在 HTML 里，也可以放在 HTTP `Link` 标头，让 CDN 不必逐页修改就能加上。

## 它不是什么

- **不是 `robots.txt` 的替代品。** `robots.txt` 说爬虫可以访问什么；`llms.txt` 说哪些内容值得读、在哪里读。
- **不是 `sitemap.xml` 的替代品。** Sitemap 列出可索引的页面；`llms.txt` 是策展过的，可以包含外部链接，而且应该指向 LLM 可读的版本。
- **不是保证。** 它是一个提案，不是强制标准。模型可以忽略它。它只在代理正在找路时帮上忙。
- **不是训练授权。** 这个提案主要谈推理时的使用，并没有解决训练或再利用的权利，也不取代网站的条款。

## 谁应该放一份

软件文档是最强的使用场景，规格首页也说大多数使用集中在那里。coding agent 如果能读到 Markdown 版的快速入门与 API 参考，就会少做几次错误的调用。同样的模式也适用于说明政策的企业网站、回答个人 CV 问题的个人网站，或提供课程信息的学校。OpenAI、Anthropic 与 Gemini 都为自家的开发者文档放了 `llms.txt`。

对一个小网站来说，成本就是一个文件。回报是代理不必读完整个网站，就能找到正确的那一页。

## 怎么测试

只给代理你的 `llms.txt`，再问它一个真实问题。如果它选不到正确的链接，地图就不够清楚。规格首页建议的正是这个测试。用具体的语言、描述每一个链接、不要用没有解释的术语。

## 短版结论

llms.txt 是给代理看的目录。它不会让网站变得权威，也不会取代页面本身。它只是让代理访问网站的第一分钟更便宜、更准确。这是一件很小、但很有用的事。

## 参考资料

- [The /llms.txt file, v2](https://llmstxt.org/) — 现行提案的格式、示例与采用情况。
- [Changes in v2](https://llmstxt.org/changes.html) — 2024 年 9 月原始提案之后的变更与原因。
- [/llms.txt—a proposal to provide information to help LLMs use websites](https://www.answer.ai/posts/2024-09-03-llmstxt.html) — Jeremy Howard 在 Answer.AI 的原始公告。
- [OpenAI developer docs llms.txt](https://developers.openai.com/llms.txt) — 大型文档网站的实际索引。
- [Anthropic docs llms.txt](https://docs.anthropic.com/llms.txt) — Claude 文档索引。
- [Gemini API docs llms.txt](https://ai.google.dev/gemini-api/docs/llms.txt) — Google Gemini API 文档索引。
- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html) — 常与 llms.txt 对照的爬虫访问标准。
- [Sitemaps XML format](https://www.sitemaps.org/protocol.html) — 与 llms.txt 互补的索引标准。
