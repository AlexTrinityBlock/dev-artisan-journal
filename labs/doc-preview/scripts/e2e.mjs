#!/usr/bin/env bun
/**
 * Browser smoke test for the lab. Starts Vite if it is not already running.
 *
 *   bun run e2e
 *
 * Set PLAYWRIGHT_CHROMIUM_PATH if Chromium is not in the default Playwright cache.
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const root = join(import.meta.dir, '..');
const port = 5179;
const url = `http://localhost:${port}/`;

function chromiumPath() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const cache = join(homedir(), '.cache', 'ms-playwright');
  if (existsSync(cache)) {
    const builds = readdirSync(cache)
      .filter((name) => /^chromium-\d+$/.test(name))
      .sort();
    const newest = builds.at(-1);
    if (newest) {
      const candidate = join(cache, newest, 'chrome-linux64', 'chrome');
      if (existsSync(candidate)) return candidate;
    }
  }
  return chromium.executablePath();
}

async function reachable(target) {
  try {
    const response = await fetch(target, { signal: AbortSignal.timeout(1000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitFor(target, timeoutMs = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await reachable(target)) return;
    await Bun.sleep(150);
  }
  throw new Error(`Timed out waiting for ${target}`);
}

let server;
const legacy = join(tmpdir(), 'doc-preview-legacy.ppt');
const unsupported = join(tmpdir(), 'doc-preview-note.txt');
writeFileSync(legacy, Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0]));
writeFileSync(unsupported, 'not a document');

try {
  if (!(await reachable(url))) {
    server = Bun.spawn(
      ['bun', join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', String(port)],
      {
        cwd: root,
        stdout: 'ignore',
        stderr: 'ignore',
      },
    );
    await waitFor(url);
  }

  const browser = await chromium.launch({ executablePath: chromiumPath(), headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(url, { waitUntil: 'networkidle' });

  await page.locator('[data-sample="docx"]').click();
  await page.waitForFunction(
    () =>
      document.querySelector('.docx-wrapper')?.textContent?.includes('Document Preview Lab') ??
      false,
    undefined,
    { timeout: 20_000 },
  );
  assert.equal(await page.locator('.docx-wrapper > section.docx').count(), 2, 'DOCX pages');
  assert.match(await page.locator('#status').textContent(), /DOCX ready/);

  await page.locator('[data-sample="pptx"]').click();
  await page.waitForFunction(
    () => document.querySelector('#status')?.textContent?.includes('PPTX ready') ?? false,
    undefined,
    { timeout: 30_000 },
  );
  assert.equal(await page.locator('#slide-count').textContent(), '1 / 3');

  const canvas = await page.evaluate(() => {
    const element = document.querySelector('#pptx-canvas');
    return element ? { width: element.width, height: element.height } : null;
  });
  assert.ok(canvas && canvas.width >= 600 && canvas.height >= 300, 'PPTX canvas size');

  await page.locator('#next').click();
  await page.waitForFunction(() => document.querySelector('#slide-count')?.textContent === '2 / 3');
  await page.locator('#next').click();
  await page.waitForFunction(() => document.querySelector('#slide-count')?.textContent === '3 / 3');

  await page.locator('#file').setInputFiles(legacy);
  await page.waitForFunction(
    () => document.querySelector('#status')?.textContent?.includes('Legacy PPT') ?? false,
    undefined,
    { timeout: 10_000 },
  );
  assert.equal(await page.locator('#legacy-host .legacy-code').textContent(), 'LEGACY BINARY');

  await page.locator('#file').setInputFiles(unsupported);
  await page.waitForFunction(
    () => document.querySelector('#status')?.textContent?.includes('Unsupported') ?? false,
    undefined,
    { timeout: 10_000 },
  );
  assert.equal(await page.locator('#legacy-host .legacy-code').textContent(), 'UNSUPPORTED FILE');

  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  assert.ok(overflow.scroll <= overflow.client, 'mobile horizontal overflow');

  assert.deepEqual(errors, [], `console errors: ${errors.join(' | ')}`);
  await browser.close();
  console.log('e2e ok: DOCX, PPTX, legacy, unsupported, mobile overflow, console clean');
} finally {
  server?.kill();
  rmSync(legacy, { force: true });
  rmSync(unsupported, { force: true });
}
