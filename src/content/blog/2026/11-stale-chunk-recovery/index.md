---
title: "The Tab That Missed the Deploy: Recovering Stale Vite Chunks"
description: "Why an open Vite tab asks for a JavaScript chunk that no longer exists, and how an error boundary, one reload, and a 15-second cooldown turn a blank page into a clean update."
pubDate: 2026-11-23
category: "Web"
tags: ["Vite", "React", "Frontend", "Caching", "Reliability"]
featured: false
author: "Alex.Hsiao"
readTime: "14 min read"
cardImage: "./cover.webp"
cardImageAlt: "Diagram of the stale-tab recovery flow: old tab, lazy import, 404, reload once, fresh document"
---

# The Tab That Missed the Deploy: Recovering Stale Vite Chunks

## The short version: one stale tab

<section class="stale-lead">
  <div class="stale-lead-head">
    <span class="card-tag">THE STALE TAB // 00</span>
    <p class="stale-lead-kicker">A deploy does not update the tab that is already open. It only changes what the next request will find.</p>
    <h3 class="stale-lead-title">One missing file. One clean reload.</h3>
    <p class="stale-lead-sub">Catch the failed import, reload once, land on the new build.</p>
  </div>
  <div class="stale-lead-grid">
    <div class="stale-lead-card">
      <div class="stale-lead-icon"><svg class="stale-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>
      <div class="stale-lead-tag">DEPLOY // RENAME</div>
      <h4>New build, new names</h4>
      <p>Vite puts a content hash in each filename. The entry HTML now points at a new set of files.</p>
      <div class="stale-lead-meta">BUILD v2 → NEW HASHES</div>
    </div>
    <div class="stale-lead-arrow" aria-hidden="true">→</div>
    <div class="stale-lead-card">
      <div class="stale-lead-icon"><svg class="stale-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg></div>
      <div class="stale-lead-tag">TAB // STALE MAP</div>
      <h4>The open tab keeps the old map</h4>
      <p>Its main bundle still lists the chunks from build v1. Nothing tells it they were removed.</p>
      <div class="stale-lead-meta">TAB v1 → OLD NAMES</div>
    </div>
    <div class="stale-lead-arrow" aria-hidden="true">→</div>
    <div class="stale-lead-card">
      <div class="stale-lead-icon"><svg class="stale-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></div>
      <div class="stale-lead-tag">RECOVER // RELOAD</div>
      <h4>Catch the miss, reload once</h4>
      <p>A boundary recognizes the module-load failure. One reload fetches fresh HTML and fresh names.</p>
      <div class="stale-lead-meta">CHUNK ERROR → FRESH DOC</div>
    </div>
  </div>
  <div class="stale-lead-flow stale-scroll">
  <svg class="stale-svg" viewBox="0 0 840 170" role="img" aria-labelledby="stale-lead-title stale-lead-desc">
    <title id="stale-lead-title">The stale tab recovery flow</title>
    <desc id="stale-lead-desc">An old tab opens a lazy route, requests a deleted chunk, receives 404, and the error boundary triggers one reload. The reload fetches the new HTML and the new chunk.</desc>
    <defs>
      <marker id="stale-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="stale-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">SIMPLE FLOW // ONE TAB, ONE MISS</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">OLD MAP · 404 · FRESH DOC</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="120" height="72" class="term"/>
    <svg x="36" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/></svg>
    <text x="58" y="63" class="f" font-size="6.2" letter-spacing="0.6">TAB v1</text>
    <text x="36" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">OLD TAB</text>
    <text x="36" y="96" class="m" font-size="6.8">old map</text>
    <text x="36" y="108" class="f" font-size="6.2">index-A9.js</text>
    <line x1="144" y1="80" x2="160" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="160" y="44" width="150" height="72" class="box"/>
    <svg x="172" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="m10 12-2 2 2 2"/><path d="m14 16 2-2-2-2"/></svg>
    <text x="194" y="63" class="f" font-size="6.2" letter-spacing="0.6">ROUTE</text>
    <text x="172" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">LAZY IMPORT</text>
    <text x="172" y="96" class="m" font-size="6.8">import()</text>
    <text x="172" y="108" class="f" font-size="6.2">AboutPage-OLD.js</text>
    <line x1="310" y1="80" x2="326" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="326" y="44" width="120" height="72" class="codebox"/>
    <text x="342" y="63" class="f" font-size="6.2" letter-spacing="0.6">SERVER</text>
    <text x="342" y="84" class="t" font-size="17" font-weight="800" letter-spacing="-0.02em">404</text>
    <text x="342" y="96" class="m" font-size="6.8">chunk deleted</text>
    <text x="342" y="108" class="f" font-size="6.2">no such file</text>
    <line x1="446" y1="80" x2="462" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="462" y="44" width="150" height="72" class="box"/>
    <svg x="474" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
    <text x="496" y="63" class="f" font-size="6.2" letter-spacing="0.6">CATCH</text>
    <text x="474" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">BOUNDARY</text>
    <text x="474" y="96" class="m" font-size="6.8">module error</text>
    <text x="474" y="108" class="f" font-size="6.2">render only</text>
    <line x1="612" y1="80" x2="628" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="628" y="44" width="90" height="72" class="box"/>
    <svg x="640" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
    <text x="662" y="63" class="f" font-size="6.2" letter-spacing="0.6">ONCE</text>
    <text x="640" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">RELOAD</text>
    <text x="640" y="96" class="m" font-size="6.8">15s guard</text>
    <text x="640" y="108" class="f" font-size="6.2">new doc</text>
    <line x1="718" y1="80" x2="734" y2="80" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="734" y="44" width="82" height="72" class="codebox"/>
    <svg x="746" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
    <text x="768" y="63" class="f" font-size="6.2" letter-spacing="0.6">TAB v2</text>
    <text x="746" y="84" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">FRESH</text>
    <text x="746" y="96" class="m" font-size="6.8">new map</text>
    <text x="746" y="108" class="f" font-size="6.2">new hashes</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">IF THE SECOND LOAD FAILS // SHOW THE MANUAL BUTTON</text>
  </svg>
  </div>
  <p class="stale-lead-note"><b>The old code is not broken. Its address is.</b> The recovery is not a patch; it is a new document.</p>
</section>

<p class="stale-lead-bridge">The rest of this article is the machinery behind that sentence: what the build writes, what the tab remembers, where the error surfaces, and why the reload needs a leash.</p>

## A deploy is a rename

At 10:00, a visitor opens the app. The browser receives `index.html`, reads one `<script type="module">` tag, and downloads `assets/index-A9_mBUvc.js`. That file is the application: the shell, the router, and a map of every lazy route it knows how to load.

The visitor clicks around but never opens the About page. Nothing fetches `AboutPage-OLD123.js`. It exists on the server, but it is not in the tab's memory or in its HTTP cache.

At 10:05, you deploy a new build. It contains `index-NEW999.js`, `AboutPage-NEW888.js`, and a new `index.html` that points at them. The old hashed files are removed from the server.

At 10:06, the visitor clicks About. The tab is still running `index-A9_mBUvc.js`. That file has never heard of build v2. It calls `import('./AboutPage')`, which Vite compiled into a request for `AboutPage-OLD123.js`. The server returns 404. The dynamic import rejects. React has no component to render, so the rejection travels up the tree. If no error boundary catches it, the tree unmounts and the page goes blank.

The browser did nothing wrong. It followed a map that was accurate when it was printed.

```text
dist/
├── index.html                 # same URL every deploy; must revalidate
└── assets/
    ├── index-A9_mBUvc.js      # the entry: holds the lazy-route map
    ├── AboutPage-OLD123.js    # fetched only when /about is opened
    └── ...
```

Content hashing is what makes this system work. A file whose contents changed gets a new name, so a CDN can cache it forever. The entry HTML is the one file that must not be cached forever, because its job is to name the current build.

```http
# index.html — keep the address, revalidate the content
Cache-Control: no-cache

# /assets/* — the name changes when the content changes
Cache-Control: public, max-age=31536000, immutable
```

`no-cache` is a confusing name. It does not mean "do not store". It means "do not use without asking". The HTML can sit in the browser cache; a navigation or reload still checks with the server. `no-store` is stronger and usually unnecessary.

Two nuances matter:

- A lazy chunk that was already fetched may still be in the HTTP cache. The old tab can keep working for that route. The failure appears on routes the visitor never opened before the deploy — the ones that were never cached.
- If the HTML itself is cached past the deploy, a reload may return the old HTML, which points at the old main bundle, which points at the old chunk. The recovery loop cannot fix a stale entry document. That is a header problem, not a boundary problem.

<figure class="stale-fig">
  <figcaption>
    <span class="card-tag">THE FAILURE // 01</span>
    <h3 class="stale-fig-title">The tab is reading a directory that was replaced</h3>
    <p class="stale-fig-sub">A deploy changes the names on the server. It does not change the names the open tab already memorized.</p>
  </figcaption>
  <div class="stale-scroll">
  <svg class="stale-svg" viewBox="0 0 840 340" role="img" aria-labelledby="stale-f1-title stale-f1-desc">
    <title id="stale-f1-title">Three moments in one stale tab</title>
    <desc id="stale-f1-desc">At 10:00 the tab loads index.html and index-A9.js, and remembers AboutPage-OLD123.js without fetching it. At 10:05 a new build replaces the old files. At 10:06 the tab requests the deleted chunk and receives 404.</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">THE FAILURE // THREE MOMENTS</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">ONE TAB · TWO BUILDS · ONE 404</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="42" width="248" height="26" class="term"/>
    <text x="36" y="59" class="f" font-size="7" letter-spacing="0.8">10:00 · FIRST LOAD</text>
    <rect x="24" y="68" width="248" height="214" class="box"/>
    <text x="36" y="86" class="t mono" font-size="7.2">index.html</text>
    <text x="260" y="86" class="m mono" font-size="6.8" text-anchor="end">200</text>
    <line x1="36" y1="94" x2="260" y2="94" class="rule-soft"/>
    <text x="36" y="110" class="t mono" font-size="7.2">assets/index-A9.js</text>
    <text x="260" y="110" class="m mono" font-size="6.8" text-anchor="end">200</text>
    <line x1="36" y1="118" x2="260" y2="118" class="rule-soft"/>
    <text x="36" y="134" class="t mono" font-size="7.2">AboutPage-OLD.js</text>
    <text x="260" y="134" class="m mono" font-size="6.8" text-anchor="end">not fetched</text>
    <line x1="36" y1="146" x2="260" y2="146" class="rule"/>
    <text x="36" y="166" class="m" font-size="6.8">The tab stores the v1 map.</text>
    <text x="36" y="178" class="m" font-size="6.8">About was never opened, so its</text>
    <text x="36" y="190" class="m" font-size="6.8">chunk is not in the HTTP cache.</text>
    <rect x="36" y="208" width="224" height="28" class="term"/>
    <text x="48" y="226" class="f" font-size="6.6" letter-spacing="0.6">MAP v1 // IN MEMORY</text>
    <text x="36" y="262" class="f" font-size="6.4" letter-spacing="0.6">THE TAB // STILL RUNNING</text>
    <rect x="296" y="42" width="248" height="26" class="term"/>
    <text x="308" y="59" class="f" font-size="7" letter-spacing="0.8">10:05 · DEPLOY</text>
    <rect x="296" y="68" width="248" height="214" class="box"/>
    <text x="308" y="86" class="t mono" font-size="7.2">index.html</text>
    <text x="532" y="86" class="m mono" font-size="6.8" text-anchor="end">now v2</text>
    <line x1="308" y1="94" x2="532" y2="94" class="rule-soft"/>
    <text x="308" y="110" class="t mono" font-size="7.2">assets/index-NEW.js</text>
    <text x="532" y="110" class="m mono" font-size="6.8" text-anchor="end">200</text>
    <line x1="308" y1="118" x2="532" y2="118" class="rule-soft"/>
    <text x="308" y="134" class="m mono" font-size="7.2" text-decoration="line-through">AboutPage-OLD.js</text>
    <text x="532" y="134" class="m mono" font-size="6.8" text-anchor="end">deleted</text>
    <line x1="308" y1="146" x2="532" y2="146" class="rule"/>
    <text x="308" y="166" class="m" font-size="6.8">The new HTML names a new set.</text>
    <text x="308" y="178" class="m" font-size="6.8">The old hashed files are gone.</text>
    <rect x="308" y="208" width="224" height="28" class="term"/>
    <text x="320" y="226" class="f" font-size="6.6" letter-spacing="0.6">MAP v2 // ON SERVER</text>
    <text x="308" y="262" class="f" font-size="6.4" letter-spacing="0.6">THE SERVER // AFTER DEPLOY</text>
    <rect x="568" y="42" width="248" height="26" class="term"/>
    <text x="580" y="59" class="f" font-size="7" letter-spacing="0.8">10:06 · CLICK</text>
    <rect x="568" y="68" width="248" height="214" class="box"/>
    <rect x="576" y="74" width="232" height="26" fill="var(--mono-l1)"/>
    <text x="586" y="91" fill="var(--mono-paper)" class="mono" font-size="7.2">GET AboutPage-OLD.js</text>
    <text x="798" y="91" fill="var(--mono-paper)" class="mono" font-size="6.8" text-anchor="end">404</text>
    <text x="580" y="116" class="t mono" font-size="7.2">import()</text>
    <text x="804" y="116" class="m mono" font-size="6.8" text-anchor="end">rejects</text>
    <line x1="580" y1="124" x2="804" y2="124" class="rule-soft"/>
    <text x="580" y="140" class="t mono" font-size="7.2">boundary</text>
    <text x="804" y="140" class="m mono" font-size="6.8" text-anchor="end">catches</text>
    <line x1="580" y1="148" x2="804" y2="148" class="rule"/>
    <text x="580" y="166" class="m" font-size="6.8">The tab followed the only map</text>
    <text x="580" y="178" class="m" font-size="6.8">it had. The address expired.</text>
    <rect x="580" y="208" width="224" height="28" class="term"/>
    <text x="592" y="226" class="f" font-size="6.6" letter-spacing="0.6">NEXT // FRESH DOCUMENT</text>
    <text x="580" y="262" class="f" font-size="6.4" letter-spacing="0.6">THE OLD TAB // AFTER THE MISS</text>
    <line x1="24" y1="302" x2="816" y2="302" class="dash"/>
    <text x="420" y="320" class="f" font-size="6.8" text-anchor="middle" letter-spacing="0.6">BUILD v2 NEVER REACHES THE OPEN TAB · THE OLD MAP POINTS AT A DELETED FILE</text>
  </svg>
  </div>
  <p class="stale-fig-src">DEPLOY TIMELINE · ONE OPEN TAB · VITE CONTENT HASHES</p>
</figure>

## The error has a shape

What does a failed dynamic import look like? The message is browser-specific, but the shape is consistent: a rejected promise that says a module could not be fetched.

- Chrome: `Failed to fetch dynamically imported module: https://…/assets/AboutPage-OLD123.js`
- Chrome (HTML fallback): `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html".`
- Firefox: `error loading dynamically imported module: https://…`
- Safari: `Importing a module script failed.`
- webpack: `ChunkLoadError: Loading chunk 42 failed.`

Match the phrase, not the full string. The URL changes every build; the phrase does not.

```ts
const CHUNK_ERROR_RE =
  /Failed to fetch dynamically imported module|Failed to load module script|error loading dynamically imported module|Importing a module script failed|ChunkLoadError/i;
```

Keep the last alternative for webpack-era bundles and older tooling. The rest cover the browsers you are likely to see.

The `Failed to load module script` variant is what you see when a host rewrites missing asset requests to `index.html`; the response is HTML, not JavaScript. If your host does that, the browser never sees a 404.

One distinction matters more than the regex: a plain `TypeError: Failed to fetch` is not enough. That is also what you get when the user is offline, when an API call fails, or when CORS blocks a request. Reloading on every network error turns a flaky connection into a reload loop. The boundary should act only on module-load failures.

## Catch it at the seam

`React.lazy` is a render-time loader. It suspends while the import is pending and throws if the import rejects. That makes the failure catchable by an error boundary, as long as the boundary sits above the lazy component.

```tsx
const AboutPage = lazy(() => import('./AboutPage'));

export default function App() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <button onClick={() => setShowAbout(true)}>Open About</button>

      <ChunkErrorBoundary>
        <Suspense fallback={<p>Loading…</p>}>
          {showAbout && <AboutPage />}
        </Suspense>
      </ChunkErrorBoundary>
    </>
  );
}
```

Order matters, but not in the way it first appears. The boundary must be above the lazy component; placing it outside `Suspense` is the simplest way to keep the loading fallback and the error fallback separate. A boundary at the app root also catches the error, but it replaces the whole shell. Scope it to the region that can fail and leave the rest of the page usable.

The boundary itself needs two lifecycle methods. `getDerivedStateFromError` runs during render and decides whether this is a chunk error. `componentDidCatch` runs after commit and is the right place for the reload decision.

The complete file:

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
    // sessionStorage can throw in private mode.
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

    console.error('[chunk] module load failed', {
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
        <p>A new version of this page is available.</p>
        <button onClick={() => window.location.reload()}>
          Reload the page
        </button>
      </div>
    );
  }
}
```

A few details are deliberate:

- `getDerivedStateFromError` returns `null` for everything that is not a chunk error, so the boundary does not swallow unrelated bugs.
- `tryRecover` checks `navigator.onLine` before reloading. A reload while offline cannot fetch anything; it only loses the page the user still has. The flag is only a hint, but it catches the obvious case.
- The sessionStorage read and write are inside the `try`, because private mode and some embedded browsers throw on storage access.
- `render` returns `null` while the reload is in flight, so the page does not flash an error card for a few hundred milliseconds.

## Reload once, not forever

The naive version is one line: `componentDidCatch() { window.location.reload(); }`. It works until the reload does not fix the problem.

What can make the second load fail?

- The HTML is still cached and still points at the old bundle.
- A service worker is serving the previous shell.
- The CDN has the new HTML but not the new chunk yet.
- The user is offline.
- The deploy is only half-propagated.

Without a guard, each failed load reloads again. The tab becomes a flicker loop, and the user cannot read the error or press anything.

The guard is a timestamp, not a boolean. A boolean ("already reloaded") would disable recovery for the rest of the session, including a second deploy an hour later. A timestamp lets the tab try again after the cooldown, while stopping a tight loop.

Fifteen seconds is a guess, but a defensible one. It is long enough for a reload and a chunk fetch to finish on most connections, and short enough that a later deploy can still recover automatically. Tune it to your p95 load time; the exact number matters less than having one.

`sessionStorage` is the right shelf for this value. It is scoped to the tab, survives the reload, and disappears when the tab closes. `localStorage` would leak the cooldown across tabs and sessions, where it does not belong.

<figure class="stale-fig">
  <figcaption>
    <span class="card-tag">THE RECOVERY // 02</span>
    <h3 class="stale-fig-title">One automatic reload, one manual escape hatch</h3>
    <p class="stale-fig-sub">The timestamp is a rate limit. It lets the tab recover from a later deploy without letting a broken reload spin forever.</p>
  </figcaption>
  <div class="stale-scroll">
  <svg class="stale-svg" viewBox="0 0 840 420" role="img" aria-labelledby="stale-f2-title stale-f2-desc">
    <title id="stale-f2-title">The chunk recovery state machine</title>
    <desc id="stale-f2-desc">A running app hits a rejected import. If it is not a chunk error, the error is re-thrown. If it is a chunk error and the tab has not reloaded in the last fifteen seconds, it reloads once and gets a fresh document. If it has, it shows a manual reload button. A dashed path returns the fresh document to running.</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">THE RECOVERY LOOP // TWO EXITS</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">CATCH · DECIDE · RELOAD OR ASK</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="54" width="112" height="44" class="box"/>
    <text x="36" y="72" class="f" font-size="6.2">STATE</text>
    <text x="36" y="88" class="t mono" font-size="8.4">RUNNING</text>
    <line x1="136" y1="76" x2="160" y2="76" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="160" y="54" width="150" height="44" class="box"/>
    <text x="172" y="72" class="f" font-size="6.2">EVENT</text>
    <text x="172" y="88" class="t mono" font-size="8">IMPORT REJECTS</text>
    <line x1="310" y1="76" x2="344" y2="76" class="arrow" marker-end="url(#stale-arrow)"/>
    <path d="M420 38 L496 76 L420 114 L344 76 Z" class="box"/>
    <text x="420" y="72" class="f" font-size="6.2" text-anchor="middle">IS IT A</text>
    <text x="420" y="84" class="t" font-size="7.4" font-weight="700" text-anchor="middle">CHUNK ERROR?</text>
    <line x1="496" y1="76" x2="560" y2="76" class="arrow" marker-end="url(#stale-arrow)"/>
    <text x="516" y="70" class="f" font-size="6">NO</text>
    <rect x="560" y="54" width="140" height="44" class="box"/>
    <text x="572" y="72" class="f" font-size="6.2">EXIT</text>
    <text x="572" y="88" class="t mono" font-size="8">RE-THROW</text>
    <line x1="420" y1="114" x2="420" y2="158" class="arrow" marker-end="url(#stale-arrow)"/>
    <text x="428" y="138" class="f" font-size="6">YES</text>
    <path d="M420 158 L496 196 L420 234 L344 196 Z" class="box"/>
    <text x="420" y="192" class="f" font-size="6.2" text-anchor="middle">RELOADED</text>
    <text x="420" y="204" class="t" font-size="7.4" font-weight="700" text-anchor="middle">&lt; 15s?</text>
    <path d="M344 196 H171 V282" class="arrow" fill="none" marker-end="url(#stale-arrow)"/>
    <text x="246" y="190" class="f" font-size="6">NO</text>
    <path d="M496 196 H670 V282" class="arrow" fill="none" marker-end="url(#stale-arrow)"/>
    <text x="568" y="190" class="f" font-size="6">YES</text>
    <rect x="96" y="282" width="150" height="52" class="box"/>
    <text x="108" y="300" class="f" font-size="6.2">ACTION</text>
    <text x="108" y="316" class="t mono" font-size="8.2">RELOAD ONCE</text>
    <text x="108" y="328" class="m" font-size="6.4">write timestamp, then reload</text>
    <rect x="300" y="282" width="150" height="52" class="box"/>
    <text x="312" y="300" class="f" font-size="6.2">RESULT</text>
    <text x="312" y="316" class="t mono" font-size="8.2">FRESH DOC</text>
    <text x="312" y="328" class="m" font-size="6.4">new HTML · new map</text>
    <line x1="246" y1="308" x2="300" y2="308" class="arrow" marker-end="url(#stale-arrow)"/>
    <rect x="590" y="282" width="160" height="52" class="box"/>
    <text x="602" y="300" class="f" font-size="6.2">EXIT</text>
    <text x="602" y="316" class="t mono" font-size="8.2">SHOW MANUAL</text>
    <text x="602" y="328" class="m" font-size="6.4">keep the button visible</text>
    <path d="M375 334 V366 H80 V98" class="dash" fill="none" marker-end="url(#stale-arrow-muted)"/>
    <text x="230" y="360" class="f" font-size="6.4">BACK TO RUNNING</text>
    <text x="24" y="400" class="f" font-size="6.6">THE COOLDOWN IS A RATE LIMIT, NOT A ONE-SHOT FLAG.</text>
    <text x="816" y="400" class="f" font-size="6.6" text-anchor="end">15s IS A STARTING POINT · TUNE IT TO p95 LOAD TIME</text>
  </svg>
  </div>
  <p class="stale-fig-src">RECOVERY STATE MACHINE · ONE RELOAD · ONE MANUAL EXIT</p>
</figure>

## The recovery, in four moves

Put the pieces in order and the whole recovery is four moves.

1. **Catch.** The dynamic import rejects. The boundary matches the message and renders nothing while it decides.
2. **Reload once.** If the cooldown allows and the browser is online, write the timestamp and call `location.reload()`.
3. **Revalidate the entry.** Because `index.html` is `no-cache`, the browser asks the server and receives the new HTML.
4. **Load the new map.** The new HTML names new hashes. The lazy route now resolves against build v2.

If step 2 is not allowed, the boundary shows the manual button. That is not a failure of the recovery; it is the recovery declining to loop.

## The other doors

The error boundary only sees errors that happen during React rendering. A dynamic import can fail in places React never renders:

- a router prefetch
- a click handler that calls `import()` directly
- a preload helper fetching a dependency chunk
- a service worker serving an old shell

Vite emits a `vite:preloadError` event on `window` when its preload helper fails to load a dynamic import and its dependencies. It is a useful safety net for code paths that do not go through a React render:

```ts
// Reuse the exported tryRecover from the boundary module.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();

  if (!tryRecover()) {
    console.warn('[chunk] automatic reload suppressed');
    // Show a banner or a manual reload button here.
  }
});
```

Calling `preventDefault()` stops Vite from re-throwing the error. If you prevent the default, you own the fallback: log the event, show a message, or render the same manual button.

For router-level loaders, check for the same error shape in the router's error element and call `tryRecover()`. The point is not to have three copies of the reload logic. It is to have one recovery function, one cooldown, and several seams that call it.

| Seam | What fails | Hook |
| :--- | :--- | :--- |
| React render | `React.lazy` import rejects | Error boundary |
| Vite preload | A dependency chunk fails to preload | `vite:preloadError` |
| Router or event handler | `import()` outside render | Router error element, or a local `.catch()` |
| Service worker | Old HTML is served from the worker cache | Update flow + one reload |

The one thing not to do is attach `window.location.reload()` to every `error` or `unhandledrejection` event. Most errors are not stale chunks. A global reload on any rejection punishes the user for a failed API call, an ad blocker, or a bug you could have shown them.

## What the reload costs

An automatic reload is a small act of violence. It throws away:

- form input that was not persisted
- scroll position
- an open modal or menu
- in-flight requests
- the user's sense of where they were

If the failed chunk is a settings page the user can live without, a banner is kinder than a reload. If the failed chunk is the checkout flow, a reload is the only useful move. The boundary can support both: an `auto` mode for routes that block the task, and a `prompt` mode for everything else.

At minimum, do three things:

1. Persist drafts before reloading if the page has unsaved input.
2. Announce the reload with an accessible status message, not a silent flash.
3. Keep the manual button visible when the automatic attempt is exhausted.

Also: do not reload while the user is typing into a form unless the chunk failure actually blocks the form. A stale chunk in a background route is not an emergency.

## Test it with two real builds

You cannot reproduce this with `vite dev`. The dev server serves modules from disk and there are no content-hashed chunks to delete. Test against `vite build` and `vite preview`, or the real static host.

1. Build and preview.

```bash
bun run build
bun run preview
```

2. Open the app. Do not open the lazy route yet.
3. Note the chunk name in DevTools → Network, or list `dist/assets`.
4. Rebuild after a trivial change to the lazy page itself. Serve the new `dist`. The old chunk is gone.
5. In the still-open tab, click the lazy route.
6. Expect one reload, then the new route.
7. Repeat with a block pattern that matches every `AboutPage-*.js` chunk. After the reload, the new chunk request should fail once more and the manual button should appear — not another reload.
8. Go offline and trigger it. The automatic reload should be skipped; the button should appear.

A quicker local reproduction: after loading the page, delete the lazy chunk from `dist/assets` and click the route. The preview server returns 404, which is exactly what the old tab sees after a deploy.

Test the fresh load too. A new tab should never see the boundary. If it does, the error is not a stale chunk; it is a build or deploy problem.

## The deploy checklist

- Serve `index.html` with `Cache-Control: no-cache` or `max-age=0, must-revalidate`.
- Serve hashed assets with a long `max-age` and `immutable`.
- Keep the previous build's assets for a grace period if the host allows it. It turns a hard failure into a stale-but-working tab.
- Publish the new HTML and the new assets atomically, or accept a short mixed window.
- Match only module-load errors; let other errors reach your normal error handling.
- Reload at most once per cooldown.
- Provide a manual button and a readable message.
- Log the chunk URL, the route, and the build id.
- Test a real two-build sequence, a blocked request, and offline mode.
- If you use a service worker, make sure it updates and does not pin the old HTML.

## What this does not fix

- It does not update a tab that never triggers a lazy import. That tab keeps running old code until the next navigation or reload.
- It does not fix a stale HTML entry. If the HTML is cached, the reload may return the same old map; the cooldown stops the loop, but the user needs a hard refresh or a cache-header fix.
- It does not merge state. Unsaved work is still lost unless you persist it.
- It does not replace version monitoring. A chunk error is a symptom; the useful metric is how often it happens, on which route, and after which deploy.

A deploy is a rename. The tab that is already open is reading the old directory. The fix is not to teach the old code the new names. It is to notice the miss quickly, fetch a new directory once, and give the user a way out if the shelf is still empty.

One missing chunk is not a reason to panic. It is a reason to reload — once.

## References

- [Vite build guide](https://vite.dev/guide/build.html) — hashed filenames, the `dist` layout, and why the entry HTML is different.
- [Vite build options: module preload](https://vite.dev/config/build-options.html#build-modulepreload) — the `vite:preloadError` event and its `preventDefault()` behavior.
- [React: `lazy`](https://react.dev/reference/react/lazy) — how a lazy component suspends and what happens when its import rejects.
- [React: catching rendering errors with an error boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) — the lifecycle methods used above.
- [MDN: `Cache-Control`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) — `no-cache`, `no-store`, `max-age`, and `immutable`.
- [web.dev: HTTP caching](https://web.dev/articles/http-cache) — the practical header strategy for entry documents and hashed assets.
- [MDN: dynamic `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) — the promise that rejects when a module cannot be fetched.
- [web.dev: service worker lifecycle](https://web.dev/articles/service-worker-lifecycle) — why an old worker can keep serving an old shell.

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
