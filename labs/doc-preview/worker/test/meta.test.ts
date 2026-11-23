import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { extractMetadata } from '../src/meta';

function sample(name: string): Uint8Array {
  return new Uint8Array(readFileSync(new URL(`../../public/samples/${name}`, import.meta.url)));
}

describe('extractMetadata', () => {
  test('reads DOCX core properties and counts words when app.xml is sparse', () => {
    const meta = extractMetadata(sample('sample.docx'), 'docx');
    expect(meta.title).toBe('Document Preview Lab — DOCX fixture');
    expect(meta.creator).toBe('Doc Preview Lab');
    expect(meta.created).toStartWith('2026-');
    expect(meta.words).toBeGreaterThan(20);
    expect(meta.slides).toBeNull();
  });

  test('reads PPTX slide count and application', () => {
    const meta = extractMetadata(sample('sample.pptx'), 'pptx');
    expect(meta.title).toBe('Document Preview Lab — PPTX fixture');
    expect(meta.slides).toBe(3);
    expect(meta.application).toBe('Microsoft Office PowerPoint');
  });

  test('keeps an invalid numeric entity as text instead of throwing', () => {
    const files = unzipSync(sample('sample.docx'));
    const core = strFromU8(files['docProps/core.xml']).replace(
      'Document Preview Lab — DOCX fixture',
      'Bad &#x110000; entity',
    );
    files['docProps/core.xml'] = strToU8(core);
    const malformed = zipSync(files);
    expect(() => extractMetadata(malformed, 'docx')).not.toThrow();
    expect(extractMetadata(malformed, 'docx').title).toBe('Bad &#x110000; entity');
  });

  test('does not invent metadata for legacy files', () => {
    const meta = extractMetadata(new Uint8Array([1, 2, 3]), 'doc');
    expect(meta.title).toBeNull();
    expect(meta.slides).toBeNull();
  });
});
