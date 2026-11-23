# Document Preview Lab

A small, standalone spike for previewing **DOCX** and **PPTX** in the browser, plus an optional
Cloudflare Worker that stores the originals in R2 and returns metadata.

It is intentionally outside the Astro build: `labs/doc-preview` has its own `package.json`, Vite
entry point, tests, and Worker. Nothing here ships to `blog.alextrinitywolf.com` unless it is
explicitly imported later.

```
labs/doc-preview/
├── index.html                 # lab UI
├── src/                       # Vite frontend (TypeScript, no framework)
├── public/samples/            # committed DOCX / PPTX fixtures
├── scripts/                   # fixture generator, browser e2e, Worker smoke test
├── worker/                    # Cloudflare Worker (fetch handler + R2)
│   ├── src/
│   ├── test/
│   └── wrangler.toml
└── package.json
```

## Selection

The decision is deliberately narrow: one proven library per format, loaded lazily, with the
frontend kept framework-free.

| Candidate | Version | License | Weekly downloads | Size | Verdict |
| --- | --- | --- | ---: | --- | --- |
| **docx-preview** | 0.4.1 | Apache-2.0 | 4.47M | 978 KB unpacked | **Selected for DOCX.** Mature, paginated HTML, headers/footers, tables. |
| **pptxviewjs** | 1.1.9 | MIT | 136K | 4.3 MB unpacked | **Selected for PPTX.** Canvas renderer, framework-agnostic, clean API, chart support. |
| pptx-react-viewer | 5.0.0 | Apache-2.0 | 45K | 19.9 MB unpacked | Rejected: React-only and 13 peer dependencies (AI SDK, Yjs, jsPDF, i18next, framer-motion…). The Astro site has no React island. |
| pptx-viewer-core | 5.0.0 | Apache-2.0 | 33K | 169 KB unpacked | Rejected: parser/serializer SDK, not a renderer; Node peers (`node-forge`, `xml-crypto`, `@napi-rs/canvas`). |
| pptx-preview | 1.0.7 | ISC | 356K | 1.8 MB unpacked | Rejected: ECharts/lodash/uuid deps, no public repository, source-license restrictions, and audit advisories. |
| pptx-vanilla-viewer | 4.0.0 | Apache-2.0 | 22K | 2.5 MB unpacked | Hold: capable, but editor/UI-heavy for a read-only preview; published days ago. |
| @file-viewer/renderer-presentation | 3.3.6 | Apache-2.0 | 40K | small entry | Hold: the only candidate that advertises legacy binary **PPT** rendering, but it is brand new and wants the `@file-viewer/vite-plugin` asset pipeline. Revisit only if `.ppt` preview is mandatory. |

Both selected libraries are imported with `await import(...)`, so the 9.2 kB shell loads first and
the heavy renderer only arrives when that format is used.

Measured with `vite build` on this machine:

| Chunk | Raw | Gzip | Loaded when |
| --- | ---: | ---: | --- |
| App shell | 11.85 kB | 4.78 kB | always |
| `docx-preview` | 75.49 kB | 20.65 kB | first DOCX |
| `jszip` (shared) | 96.89 kB | 28.91 kB | first DOCX/PPTX |
| `pptxviewjs` + Chart.js | 999.01 kB | 290.16 kB | first PPTX |

Render time on the fixtures: DOCX (2 pages) ~44 ms, PPTX (3 slides incl. a chart) ~60 ms. These
are local observations, not a benchmark.

### Packaging caveat

`pptxviewjs@1.1.9` imports the `round` package in its ESM build but does not declare it. The lab
pins `round@2.0.1` explicitly. It also declares `jszip` and `chart.js` as peers; both are installed.

## Run the lab

```bash
cd labs/doc-preview
bun install
bun run dev            # http://localhost:5173
```

Buttons:

- **DOCX sample** renders `public/samples/sample.docx`.
- **PPTX sample** renders `public/samples/sample.pptx`; use the arrows to move between three slides.
- **Health / Upload** talk to the Worker at `http://localhost:8788` by default.

Regenerate the fixtures after changing the generator:

```bash
bun run samples
```

The generator uses `docx` and `pptxgenjs` as dev dependencies. The resulting files are committed so
the demo works without a generation step.

## Worker

The Worker is a storage and metadata adapter, not a renderer. Rendering happens in the browser.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness and limits |
| `POST` | `/api/documents` | Multipart upload (`file` field); detects format by magic bytes and `[Content_Types].xml`; stores in R2; returns metadata |
| `GET` | `/api/documents/:id` | Streams the original with correct MIME, `Content-Disposition`, ETag, and single-range `206` support |
| `GET` | `/api/documents/:id/meta` | JSON record and extracted metadata |
| `DELETE` | `/api/documents/:id` | Removes the original and metadata |

**Formats**

- `.docx`, `.pptx`: validated as OOXML, previewable, metadata extracted from `docProps/core.xml` and
  `docProps/app.xml` (title, creator, dates, word/slide count, application).
- `.doc`, `.ppt`: accepted as legacy OLE and stored, but `previewable: false`. No false promise of a
  browser preview; converting them needs LibreOffice or a similar server-side converter.
- Everything else: `415`.

**Limits and safety**

- 20 MB default (`MAX_UPLOAD_BYTES`, capped at 50 MB).
- OOXML parts are capped during streaming decompression: 1 MB content types, 512 KB metadata,
  2 MB presentation part, 8 MB document part. The central directory's declared sizes are not
  trusted, so a lying ZIP header cannot bypass the cap.
- The DOCX host is hardened after render and by a `MutationObserver`: event-handler attributes,
  `javascript:` / `vbscript:` / `data:text/html` URLs, script-capable tags, forms, and style URLs
  with external origins are removed. A CSP blocks external images, fonts, frames, and form posts.
  These are mitigations for `docx-preview`'s HTML/CSS output, not a full sandbox.
- Filename is sanitized; object keys are generated UUIDs, never user paths.
- OOXML MIME is derived from the bytes, not the upload header. Legacy `.doc`/`.ppt` are identified
  by extension because the OLE container does not distinguish them cheaply.
- CORS is an exact allowlist (`ALLOWED_ORIGINS`), defaulting to local Vite and the blog origin.
- `UPLOAD_TOKEN` is optional. When set, `POST` and `DELETE` require
  `Authorization: Bearer <token>`. An explicitly empty value fails closed; leaving the variable
  undefined keeps local anonymous uploads working. CORS does not authorize writes, so set a token
  for any public deployment.

### Local development

Wrangler's dev proxy currently fails under Bun's `fetch` (Bun issue #39247). Run Wrangler with
Node.js; the Vite frontend can stay on Bun.

```bash
cd labs/doc-preview
cp worker/.dev.vars.example worker/.dev.vars   # optional token; Wrangler reads it next to its config
bun run worker:dev                             # Node + wrangler, http://127.0.0.1:8788
```

`wrangler dev` creates the local R2 bucket automatically. For a real deployment:

```bash
cd labs/doc-preview
bun x wrangler login
bun x wrangler r2 bucket create doc-preview-documents
bun x wrangler secret put UPLOAD_TOKEN --config worker/wrangler.toml
bun x wrangler deploy --config worker/wrangler.toml
```

Then set `ALLOWED_ORIGINS` in `worker/wrangler.toml` to the deployed frontend origin and point the
lab's **Base URL** field at the Worker.

Do not deploy this as-is for public, untrusted uploads. It has no authentication by default, no
rate limiting, no malware scanning, and no lifecycle policy on the bucket. Put Cloudflare Access or
a signed-upload flow in front of it first.

## Verification

```bash
cd labs/doc-preview
bun run typecheck      # frontend + Worker
bun run lint           # Biome
bun test worker/test   # 27 unit tests
bun run build
bun run e2e            # Chromium: DOCX, PPTX, legacy, unsupported, mobile
bun run worker:smoke   # upload, metadata, Range, CORS, ETag, legacy, delete
```

Results on 2026-11-23:

- 27 Worker unit tests pass.
- Browser e2e passes with no console errors and no horizontal overflow at 390 px.
- `bun audit` reports **no vulnerabilities** for this package.
- Python helpers in the repository are audited separately, from the repository root:
  `uvx pip-audit -r scripts/requirements.txt`.
- The root Astro dependency tree reports one low-severity KaTeX advisory. The math renderer is used
  only for trusted article Markdown, and the stylesheet is pinned to KaTeX 0.16, so the vulnerable
  prototype-pollution path is not exposed to untrusted input. Track it with the next `rehype-katex`
  release rather than forcing a mismatched KaTeX 0.19 upgrade.

## Known limits

- PPTX fidelity is good for text, shapes, tables, and charts, but not every OOXML feature (SmartArt,
  transitions, embedded media, unusual fonts) will match PowerPoint exactly.
- DOCX pagination depends on the host's available fonts.
- Legacy `.doc`/`.ppt` are storage-only. There is no server-side conversion in this spike.
- Encrypted documents and macro-enabled `.docm`/`.pptm` are rejected.
- The PPTX chunk is large because `pptxviewjs` statically imports Chart.js; the lazy boundary keeps
  it off the initial page, but a future version could split charts further.
- `pptxviewjs` uses Canvas, so text is not selectable in the preview.
- Page-wide CSS injection is reduced by the CSP and the style sanitizer, but a document can still
  apply arbitrary in-scope CSS. For genuinely untrusted files, render inside a sandboxed iframe
  instead of the main document.
- The lab is not wired into the Astro site. Promoting it means adding a page that lazy-imports the
  same modules and, if uploads are wanted, pointing it at the deployed Worker.
- The Upload button accepts an optional bearer token in memory; it is never written to storage.
  The Worker smoke test reads `UPLOAD_TOKEN` from the environment when set.
- The Worker parses the multipart body before it can check the decoded `file.size`. A client that
  omits `Content-Length` can therefore push up to Cloudflare's request-body limit before rejection.
  For public deployments, put authentication and rate limiting in front of the Worker.
