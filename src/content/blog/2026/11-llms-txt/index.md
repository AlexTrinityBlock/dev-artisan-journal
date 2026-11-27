---
title: "llms.txt: A Small Map for AI Agents"
description: "What llms.txt is for, what the file looks like, and what it does not do — a short, practical introduction to the proposal at llmstxt.org."
pubDate: 2026-11-26
category: "Web"
tags: ["llms.txt", "AI Agents", "Markdown", "Context", "Web Standards"]
featured: false
author: "Alex.Hsiao"
readTime: "4 min read"
cardImage: "./cover.webp"
cardImageAlt: "Official llms.txt sample format showing one H1, a blockquote summary, H2 sections, and annotated link lists"
---

# llms.txt: A Small Map for AI Agents

llms.txt is a Markdown file at `/llms.txt` — or at any subpath such as `/docs/llms.txt` — that tells an AI agent what a site or section contains and where to read more. That is its job. It is a curated index for machines that are trying to answer a question, not a ranking trick and not a replacement for `robots.txt`.

The proposal comes from Jeremy Howard and was first published in September 2024. Version 2, updated in August 2026, reflects two years of adoption. [llmstxt.org](https://llmstxt.org/) is its home.

## The problem it solves

A web page is built for a person. It carries navigation, ads, scripts, cookie banners, and layout. An agent that fetches it has to strip all of that away, and it still may not know which page matters. Context windows are larger than they were, but a whole documentation site still does not fit. Every irrelevant token costs latency and money.

llms.txt takes the opposite approach. Keep the map small. Put the details behind links. An agent reads the map, chooses the two or three pages it needs, and fetches only those. The path is predictable, so the agent does not have to guess where to begin.

## What the file looks like

The format is deliberately plain Markdown. One H1 is required. A blockquote summary and optional detail usually follow. H2 sections contain link lists with short notes.

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

The `Optional` section is a convention: it holds secondary material an agent can skip when context is tight.

<figure class="fig">
  <img src="/images/llms-txt/llms-txt-format.webp" alt="Illustration of the llms.txt sample format with one H1 title, a blockquote description, optional details, H2 sections, and annotated link lists" width="1108" height="718" loading="lazy" />
  <figcaption><b>Official figure</b> — The sample format from llmstxt.org: one H1, a blockquote summary, optional detail, H2 sections, and link lists with short notes. Source: <a href="https://llmstxt.org/">llmstxt.org</a></figcaption>
</figure>

Version 2 adds the other half of the idea. Pages that agents may need should have a clean Markdown version at the same URL, either `page.md` or `page.html.md`. Sites can advertise those versions with `rel="alternate" type="text/markdown"` and point to the covering `llms.txt` with `rel="describedby"`. The links can live in HTML or in an HTTP `Link` header, so a CDN can add them without touching every page.

## What it is not

- **Not a replacement for `robots.txt`.** `robots.txt` says what crawlers may access. `llms.txt` says what is worth reading and where it is.
- **Not a replacement for `sitemap.xml`.** A sitemap lists indexable pages. `llms.txt` is curated, can include external links, and should point to LLM-readable versions.
- **Not a guarantee.** It is a proposal, not an enforced standard. A model can ignore it. It helps when the agent is looking for a path through your content.
- **Not a training license.** The proposal is mainly about inference-time use. It does not settle training or reuse rights, and it does not replace a site's terms.

## Who should publish one

Software documentation is the strongest case, and the source page says that is where most use happens. A coding agent that can read a quickstart and an API reference in Markdown makes fewer wrong calls. The same pattern works for a business describing its policies, a personal site answering questions about a CV, or a school publishing course information. OpenAI, Anthropic, and Gemini publish `llms.txt` files for their own developer documentation.

For a small site, the cost is one file. The return is that an agent can find the right page without reading the whole site.

## How to test it

Give an agent only your `llms.txt` and a real question. If it cannot choose the right link, the map is not clear enough. The source page suggests exactly this test. Keep the language concrete, describe each link, and avoid unexplained jargon.

## References

- [The /llms.txt file, v2](https://llmstxt.org/) — the current proposal: format, examples, and adoption notes.
- [Changes in v2](https://llmstxt.org/changes.html) — what changed since the September 2024 proposal, and why.
- [/llms.txt—a proposal to provide information to help LLMs use websites](https://www.answer.ai/posts/2024-09-03-llmstxt.html) — Jeremy Howard's original Answer.AI announcement.
- [OpenAI developer docs llms.txt](https://developers.openai.com/llms.txt) — a production index for a large documentation site.
- [Anthropic docs llms.txt](https://docs.anthropic.com/llms.txt) — the Claude documentation index.
- [Gemini API docs llms.txt](https://ai.google.dev/gemini-api/docs/llms.txt) — Google's Gemini API documentation index.
- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html) — the crawler-access standard that llms.txt is often compared with.
- [Sitemaps XML format](https://www.sitemaps.org/protocol.html) — the indexing standard that llms.txt complements.
