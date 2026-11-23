import type { PPTXViewer as PPTXViewerInstance } from 'pptxviewjs';
import './style.css';

type Kind = 'docx' | 'pptx' | 'doc' | 'ppt' | 'unknown';
type Source = 'local' | 'worker';

const $ = <T extends HTMLElement>(selector: string): T => {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
};

const els = {
  drop: $('#drop'),
  file: $<HTMLInputElement>('#file'),
  browse: $<HTMLButtonElement>('#browse'),
  workerUrl: $<HTMLInputElement>('#worker-url'),
  workerToken: $<HTMLInputElement>('#worker-token'),
  workerHealth: $<HTMLButtonElement>('#worker-health'),
  workerUpload: $<HTMLButtonElement>('#worker-upload'),
  workerLog: $<HTMLPreElement>('#worker-log'),
  status: $('#status'),
  statusDot: $('#status-dot'),
  fileMeta: $('#file-meta'),
  stageBody: $('#stage-body'),
  empty: $('#empty'),
  docxHost: $('#docx-host'),
  pptxHost: $('#pptx-host'),
  pptxCanvas: $<HTMLCanvasElement>('#pptx-canvas'),
  legacyHost: $('#legacy-host'),
  slideNav: $('#slide-nav'),
  slideCount: $('#slide-count'),
  prev: $<HTMLButtonElement>('#prev'),
  next: $<HTMLButtonElement>('#next'),
  timing: $('#timing'),
};

const state: {
  viewer: PPTXViewerInstance | null;
  file: File | null;
  kind: Kind;
  source: Source;
} = {
  viewer: null,
  file: null,
  kind: 'unknown',
  source: 'local',
};

const CFB = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

function extension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
}

function sniffKind(buffer: ArrayBuffer, name: string): Kind {
  const head = new Uint8Array(buffer.slice(0, 8));
  const ext = extension(name);
  if (head[0] === 0x50 && head[1] === 0x4b) {
    return ext === 'pptx' ? 'pptx' : 'docx';
  }
  if (CFB.every((byte, index) => head[index] === byte)) {
    return ext === 'ppt' ? 'ppt' : ext === 'doc' ? 'doc' : 'doc';
  }
  return ext === 'pptx' ? 'pptx' : ext === 'docx' ? 'docx' : 'unknown';
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function setStatus(text: string, tone: 'idle' | 'live' | 'ok' | 'bad' = 'live'): void {
  els.status.textContent = text;
  els.statusDot.className = `dot${tone === 'idle' ? '' : ` is-${tone}`}`;
}

function setMeta(
  values: Partial<Record<'name' | 'type' | 'size' | 'state', string>>,
  bad = false,
): void {
  const order = ['name', 'type', 'size', 'state'] as const;
  order.forEach((key, index) => {
    const dd = els.fileMeta.querySelectorAll('dd')[index];
    if (!dd || values[key] === undefined) return;
    dd.textContent = values[key] ?? '—';
    dd.classList.toggle('is-bad', bad && key === 'state');
    dd.title = values[key] ?? '';
  });
}

function log(text: string): void {
  els.workerLog.textContent = text;
}

function resetStage(): void {
  state.viewer?.destroy();
  state.viewer = null;
  els.docxHost.innerHTML = '';
  els.docxHost.hidden = true;
  els.pptxHost.hidden = true;
  els.legacyHost.hidden = true;
  els.empty.hidden = false;
  els.slideNav.hidden = true;
  els.slideCount.textContent = '0 / 0';
}

const SAFE_LINK = /^(?:https?:|mailto:|#|\/)/i;
const BLOCKED_TAGS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'base',
  'form',
  'button',
  'input',
  'textarea',
  'select',
]);

function isUnsafeUrl(value: string): boolean {
  const normalized = value.replace(/[\p{Cc}\s]/gu, '').toLowerCase();
  return (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('data:text/html')
  );
}

function sanitizeCss(css: string): string {
  return css
    .replace(/@import[^;]*;/gi, '')
    .replace(/url\s*\(([^)]*)\)/gi, (match, raw: string) => {
      const target = raw.trim().replace(/^['"]|['"]$/g, '');
      return /^(?:data:|blob:|#)/i.test(target) ? match : 'none';
    })
    .replace(/expression\s*\(/gi, '');
}

/**
 * DOCX is untrusted input. docx-preview builds DOM nodes, but hyperlink
 * relationships and VML attributes come from the file. Strip event handlers
 * and dangerous URL schemes before anything can be clicked or loaded.
 */
function hardenElement(root: Element): void {
  const elements = [root, ...root.querySelectorAll('*')];
  for (const element of elements) {
    const tag = element.tagName.toLowerCase();
    if (BLOCKED_TAGS.has(tag)) {
      element.remove();
      continue;
    }
    if (tag === 'style') {
      const css = element.textContent ?? '';
      const safeCss = sanitizeCss(css);
      if (safeCss !== css) element.textContent = safeCss;
    }
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith('on')) {
        element.removeAttribute(attribute.name);
      } else if (name === 'srcdoc') {
        element.removeAttribute(attribute.name);
      } else if (
        (name === 'href' ||
          name === 'xlink:href' ||
          name === 'src' ||
          name === 'action' ||
          name === 'formaction') &&
        isUnsafeUrl(attribute.value)
      ) {
        element.removeAttribute(attribute.name);
      }
    }
    if (element.tagName.toLowerCase() === 'a') {
      const href = element.getAttribute('href') ?? '';
      if (href && !SAFE_LINK.test(href)) element.removeAttribute('href');
      element.setAttribute('rel', 'noopener noreferrer');
    }
  }
}

function updateSlides(): void {
  if (!state.viewer) return;
  const total = state.viewer.getSlideCount();
  const current = state.viewer.getCurrentSlideIndex() + 1;
  els.slideCount.textContent = `${current} / ${total}`;
  els.prev.disabled = current <= 1;
  els.next.disabled = current >= total;
}

async function renderDocx(buffer: ArrayBuffer): Promise<void> {
  const { renderAsync } = await import('docx-preview');
  els.docxHost.hidden = false;
  els.empty.hidden = true;
  await renderAsync(buffer, els.docxHost, els.docxHost, {
    className: 'docx',
    inWrapper: true,
    breakPages: true,
    ignoreWidth: false,
    ignoreHeight: false,
    renderHeaders: true,
    renderFooters: true,
    renderAltChunks: false,
  });
  hardenElement(els.docxHost);
}

async function renderPptx(buffer: ArrayBuffer): Promise<void> {
  const { PPTXViewer } = await import('pptxviewjs');
  els.pptxHost.hidden = false;
  els.empty.hidden = true;
  els.slideNav.hidden = false;
  els.prev.disabled = true;
  els.next.disabled = true;
  const width = Math.max(320, Math.min(960, els.pptxHost.clientWidth - 44));
  els.pptxCanvas.style.width = `${width}px`;
  els.pptxCanvas.style.height = `${Math.round((width * 9) / 16)}px`;
  const viewer = new PPTXViewer({
    canvas: els.pptxCanvas,
    slideSizeMode: 'fit',
    backgroundColor: '#ffffff',
  });
  await viewer.loadFile(buffer);
  await viewer.render();
  // pptxviewjs re-renders once after load to catch async chart parsing. That
  // pass resets the slide index, so do not enable navigation until it is done.
  await new Promise<void>((resolve) => setTimeout(resolve, 300));
  state.viewer = viewer;
  updateSlides();
}

function showLegacy(kind: Kind): void {
  const code = els.legacyHost.querySelector('.legacy-code');
  const title = els.legacyHost.querySelector('h2');
  const body = els.legacyHost.querySelector('p:not(.legacy-code)');
  if (kind === 'unknown') {
    if (code) code.textContent = 'UNSUPPORTED FILE';
    if (title) title.textContent = 'Not a document this lab can preview';
    if (body) {
      body.textContent =
        'The file is neither a ZIP-based DOCX/PPTX package nor a legacy OLE document. Check the extension and the first bytes.';
    }
  } else {
    if (code) code.textContent = 'LEGACY BINARY';
    if (title) title.textContent = 'Not previewable in the browser';
    if (body) {
      body.innerHTML =
        'This file is a legacy OLE document. A Worker can store it and serve it back, but rendering it requires a converter such as LibreOffice. Convert to <code>.docx</code> / <code>.pptx</code> and reload.';
    }
  }
  els.legacyHost.hidden = false;
  els.empty.hidden = true;
  els.slideNav.hidden = true;
}

async function preview(
  buffer: ArrayBuffer,
  name: string,
  kind: Kind,
  source: Source,
): Promise<void> {
  resetStage();
  state.kind = kind;
  state.source = source;
  const started = performance.now();
  setStatus(`Rendering ${name}…`);

  try {
    if (kind === 'docx') {
      await renderDocx(buffer);
    } else if (kind === 'pptx') {
      await renderPptx(buffer);
    } else {
      showLegacy(kind);
    }
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const elapsed = Math.round(performance.now() - started);
    els.timing.textContent = `${kind === 'doc' || kind === 'ppt' ? 'LEGACY' : 'RENDER'} ${elapsed} MS · ${source.toUpperCase()}`;
    setStatus(
      kind === 'docx' || kind === 'pptx'
        ? `${kind.toUpperCase()} ready · ${name}`
        : kind === 'unknown'
          ? `Unsupported file · ${name}`
          : `Legacy ${kind.toUpperCase()} detected · preview unavailable`,
      kind === 'docx' || kind === 'pptx' ? 'ok' : 'bad',
    );
    setMeta({
      name,
      type: kind === 'unknown' ? 'unknown' : kind.toUpperCase(),
      size: humanSize(buffer.byteLength),
      state: source === 'worker' ? 'from worker' : 'local',
    });
    els.workerUpload.disabled = source === 'worker';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(error);
    setStatus(`Render failed: ${message}`, 'bad');
    setMeta(
      { name, type: kind.toUpperCase(), size: humanSize(buffer.byteLength), state: 'failed' },
      true,
    );
    els.timing.textContent = 'RENDER FAILED';
  }
}

async function loadFile(file: File): Promise<void> {
  state.file = file;
  setMeta({ name: file.name, type: 'reading…', size: humanSize(file.size), state: 'loading' });
  els.workerUpload.disabled = false;
  const buffer = await file.arrayBuffer();
  const kind = sniffKind(buffer, file.name);
  await preview(buffer, file.name, kind, 'local');
}

async function loadSample(kind: 'docx' | 'pptx'): Promise<void> {
  const name = kind === 'docx' ? 'sample.docx' : 'sample.pptx';
  const type =
    kind === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  setStatus(`Loading ${name}…`);
  try {
    const response = await fetch(`/samples/${name}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    await loadFile(new File([blob], name, { type }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Sample failed: ${message}`, 'bad');
  }
}

function baseUrl(): string {
  return els.workerUrl.value.trim().replace(/\/+$/, '');
}

async function workerHealth(): Promise<void> {
  const base = baseUrl();
  log(`GET ${base}/health`);
  try {
    const response = await fetch(`${base}/health`);
    const body = await response.text();
    log(`${response.status} ${response.statusText}\n${body}`);
    setStatus(
      response.ok ? 'Worker healthy' : `Worker error ${response.status}`,
      response.ok ? 'ok' : 'bad',
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`FAILED\n${message}`);
    setStatus('Worker unreachable', 'bad');
  }
}

async function workerUpload(): Promise<void> {
  if (!state.file) return;
  const base = baseUrl();
  const form = new FormData();
  form.append('file', state.file, state.file.name);
  log(`POST ${base}/api/documents\n${state.file.name} · ${humanSize(state.file.size)}`);
  setStatus('Uploading to Worker…');
  try {
    const token = els.workerToken.value.trim();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${base}/api/documents`, { method: 'POST', headers, body: form });
    const text = await response.text();
    log(`${response.status} ${response.statusText}\n${text}`);
    if (!response.ok) {
      setStatus(`Upload failed ${response.status}`, 'bad');
      return;
    }
    const payload = JSON.parse(text) as {
      url: string;
      name: string;
      kind: Kind;
      previewable: boolean;
    };
    setStatus('Uploaded — fetching from Worker…');
    const fileResponse = await fetch(payload.url);
    if (!fileResponse.ok) throw new Error(`Worker GET ${fileResponse.status}`);
    const buffer = await fileResponse.arrayBuffer();
    await preview(buffer, payload.name, payload.kind, 'worker');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`FAILED\n${message}`);
    setStatus(`Worker failed: ${message}`, 'bad');
  }
}

els.browse.addEventListener('click', (event) => {
  event.stopPropagation();
  els.file.click();
});

els.drop.addEventListener('click', () => els.file.click());
els.drop.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    els.file.click();
  }
});

els.file.addEventListener('change', () => {
  const file = els.file.files?.[0];
  if (file) void loadFile(file);
  els.file.value = '';
});

for (const eventName of ['dragenter', 'dragover']) {
  els.drop.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.drop.classList.add('is-over');
  });
}

for (const eventName of ['dragleave', 'drop']) {
  els.drop.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.drop.classList.remove('is-over');
  });
}

els.drop.addEventListener('drop', (event) => {
  const file = event.dataTransfer?.files?.[0];
  if (file) void loadFile(file);
});

document.querySelectorAll<HTMLButtonElement>('[data-sample]').forEach((button) => {
  button.addEventListener('click', () => {
    const kind = button.dataset.sample === 'pptx' ? 'pptx' : 'docx';
    void loadSample(kind);
  });
});

async function moveSlide(direction: 'previous' | 'next'): Promise<void> {
  const viewer = state.viewer;
  if (!viewer) return;
  els.prev.disabled = true;
  els.next.disabled = true;
  try {
    if (direction === 'next') await viewer.nextSlide(els.pptxCanvas);
    else await viewer.previousSlide(els.pptxCanvas);
  } finally {
    updateSlides();
  }
}

const DANGEROUS_ATTRIBUTE = /^on|^(?:action|formaction|srcdoc|href|xlink:href|src)$/i;
const docxObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'attributes' && mutation.target instanceof Element) {
      const name = mutation.attributeName ?? '';
      if (DANGEROUS_ATTRIBUTE.test(name)) hardenElement(mutation.target);
      continue;
    }
    for (const node of mutation.addedNodes) {
      if (node instanceof Element) hardenElement(node);
    }
  }
});
docxObserver.observe(els.docxHost, {
  childList: true,
  subtree: true,
  attributes: true,
});

els.docxHost.addEventListener(
  'click',
  (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchorElement = target.closest('a');
    if (!anchorElement) return;
    const href = anchorElement.getAttribute('href') ?? '';
    if (href && !SAFE_LINK.test(href)) event.preventDefault();
  },
  true,
);

els.prev.addEventListener('click', () => void moveSlide('previous'));
els.next.addEventListener('click', () => void moveSlide('next'));

document.addEventListener('keydown', (event) => {
  if (!state.viewer || state.kind !== 'pptx') return;
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
    return;
  if (event.key === 'ArrowLeft') els.prev.click();
  if (event.key === 'ArrowRight') els.next.click();
});

els.workerHealth.addEventListener('click', () => void workerHealth());
els.workerUpload.addEventListener('click', () => void workerUpload());
window.addEventListener('beforeunload', () => state.viewer?.destroy());

setMeta({ name: '—', type: '—', size: '—', state: 'idle' });
