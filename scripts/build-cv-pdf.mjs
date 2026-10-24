#!/usr/bin/env bun
/**
 * Render the print pages (/cv/, /zh-hant/cv/, /zh-hans/cv/) to PDF.
 *
 * PDFs are committed under public/cv so the Pages build stays dependency-free.
 * Run this after editing src/views/CVDocument.astro or src/data/cv.ts, with a
 * preview server already serving the freshly built site.
 *
 *   bun run build
 *   bun x astro preview --port 4331
 *   bun scripts/build-cv-pdf.mjs http://localhost:4331
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.argv[2] ?? 'http://localhost:4331').replace(/\/$/, '');

const chromeCandidates = [
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
];

const chrome = chromeCandidates.find((path) => path && existsSync(path));
if (!chrome) throw new Error('Chrome not found; set CHROME_PATH.');

const pages = [
  ['/cv/', 'en'],
  ['/zh-hant/cv/', 'zh-hant'],
  ['/zh-hans/cv/', 'zh-hans'],
];

mkdirSync('public/cv', { recursive: true });

for (const [route, locale] of pages) {
  const out = join('public', 'cv', `alex-hsiao-cv-${locale}.pdf`);
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--virtual-time-budget=15000',
    `--print-to-pdf=${out}`,
    `${base}${route}`,
  ], { stdio: 'inherit' });
  console.log(`wrote ${out}`);
}
