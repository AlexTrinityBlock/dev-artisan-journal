#!/usr/bin/env bun
/**
 * Worker integration smoke test. Starts `wrangler dev` with Node if the local
 * worker is not already running, then exercises upload, metadata, Range, CORS,
 * ETag, legacy handling, and deletion.
 *
 *   bun run worker:dev    # in another terminal (optional)
 *   bun run worker:smoke
 */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const base = 'http://127.0.0.1:8788';
const wrangler = join(root, 'node_modules', '.bin', 'wrangler');
const sampleDir = join(root, 'public', 'samples');
const legacy = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0]);
const token = process.env.UPLOAD_TOKEN ?? '';
const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

async function reachable() {
  try {
    const response = await fetch(`${base}/health`, { signal: AbortSignal.timeout(1000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForWorker(timeoutMs = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await reachable()) return;
    await Bun.sleep(150);
  }
  throw new Error(`Timed out waiting for ${base}/health`);
}

function file(name, bytes, type) {
  return new File([bytes], name, { type });
}

async function upload(name, bytes, type) {
  const form = new FormData();
  form.append('file', file(name, bytes, type));
  return fetch(`${base}/api/documents`, {
    method: 'POST',
    headers: { Origin: 'http://localhost:5173', ...authHeaders },
    body: form,
  });
}

let server;
try {
  if (!(await reachable())) {
    if (!existsSync(wrangler)) throw new Error('wrangler is not installed; run bun install');
    // Wrangler's dev proxy does not work under Bun's fetch; use Node for it.
    const args = [
      process.env.NODE_BIN ?? 'node',
      wrangler,
      'dev',
      '--config',
      'worker/wrangler.toml',
      '--port',
      '8788',
      '--ip',
      '127.0.0.1',
    ];
    if (token) args.push('--var', `UPLOAD_TOKEN:${token}`);
    server = Bun.spawn(args, { cwd: root, stdout: 'ignore', stderr: 'ignore' });
    await waitForWorker();
  }

  const docx = new Uint8Array(await Bun.file(join(sampleDir, 'sample.docx')).arrayBuffer());
  const pptx = new Uint8Array(await Bun.file(join(sampleDir, 'sample.pptx')).arrayBuffer());

  const created = await upload('sample.docx', docx, 'application/octet-stream');
  assert.equal(created.status, 201);
  const doc = await created.json();
  assert.equal(doc.kind, 'docx');
  assert.equal(doc.size, docx.byteLength);
  assert.equal(doc.previewable, true);
  assert.match(doc.meta.title, /DOCX fixture/);

  const metaResponse = await fetch(`${base}/api/documents/${doc.id}/meta`, {
    headers: { Origin: 'http://localhost:5173' },
  });
  assert.equal(metaResponse.status, 200);
  assert.equal(metaResponse.headers.get('access-control-allow-origin'), 'http://localhost:5173');

  const ranged = await fetch(doc.url, {
    headers: { Origin: 'http://localhost:5173', Range: 'bytes=0-15' },
  });
  assert.equal(ranged.status, 206);
  assert.equal(ranged.headers.get('content-range'), `bytes 0-15/${doc.size}`);
  assert.equal(ranged.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  assert.equal((await ranged.arrayBuffer()).byteLength, 16);

  const etag = ranged.headers.get('etag');
  assert.ok(etag);
  const notModified = await fetch(doc.url, { headers: { 'If-None-Match': etag } });
  assert.equal(notModified.status, 304);

  const head = await fetch(doc.url, {
    method: 'HEAD',
    headers: { Origin: 'http://localhost:5173' },
  });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-length'), String(doc.size));
  assert.equal(await head.text(), '');

  const headRange = await fetch(doc.url, {
    method: 'HEAD',
    headers: { Origin: 'http://localhost:5173', Range: 'bytes=0-15' },
  });
  assert.equal(headRange.status, 206);
  assert.equal(headRange.headers.get('content-range'), `bytes 0-15/${doc.size}`);

  const headNotModified = await fetch(doc.url, {
    method: 'HEAD',
    headers: { 'If-None-Match': etag },
  });
  assert.equal(headNotModified.status, 304);

  const badId = await fetch(`${base}/api/documents/%`);
  assert.equal(badId.status, 400);

  const pptxCreated = await upload('sample.pptx', pptx, 'application/octet-stream');
  assert.equal(pptxCreated.status, 201);
  const deck = await pptxCreated.json();
  assert.equal(deck.kind, 'pptx');
  assert.equal(deck.meta.slides, 3);

  const legacyCreated = await upload('old.ppt', legacy, 'application/octet-stream');
  assert.equal(legacyCreated.status, 201);
  const oldDeck = await legacyCreated.json();
  assert.equal(oldDeck.kind, 'ppt');
  assert.equal(oldDeck.previewable, false);

  const unsupported = await upload('note.txt', new TextEncoder().encode('hello'), 'text/plain');
  assert.equal(unsupported.status, 415);

  for (const id of [doc.id, deck.id, oldDeck.id]) {
    const response = await fetch(`${base}/api/documents/${id}`, {
      method: 'DELETE',
      headers: { Origin: 'http://localhost:5173', ...authHeaders },
    });
    assert.equal(response.status, 200);
  }

  console.log('worker smoke ok: upload, meta, Range, CORS, ETag, legacy, 415, delete');
} finally {
  server?.kill();
}
