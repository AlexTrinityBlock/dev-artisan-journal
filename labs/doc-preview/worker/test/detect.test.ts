import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { strToU8, zipSync } from 'fflate';
import { DocumentError, detectDocument } from '../src/detect';

function sample(name: string): Uint8Array {
  return new Uint8Array(readFileSync(new URL(`../../public/samples/${name}`, import.meta.url)));
}

function errorCode(fn: () => unknown): string {
  try {
    fn();
  } catch (error) {
    if (error instanceof DocumentError) return error.code;
    throw error;
  }
  throw new Error('Expected a DocumentError');
}

describe('detectDocument', () => {
  test('recognises a DOCX package by its content types', () => {
    const result = detectDocument(sample('sample.docx'), 'sample.docx');
    expect(result.kind).toBe('docx');
    expect(result.legacy).toBe(false);
    expect(result.previewable).toBe(true);
    expect(result.mime).toContain('wordprocessingml');
  });

  test('recognises a PPTX package by its content types', () => {
    const result = detectDocument(sample('sample.pptx'), 'sample.pptx');
    expect(result.kind).toBe('pptx');
    expect(result.previewable).toBe(true);
    expect(result.mime).toContain('presentationml');
  });

  test('trusts the package over a misleading extension', () => {
    expect(detectDocument(sample('sample.pptx'), 'renamed.docx').kind).toBe('pptx');
    expect(detectDocument(sample('sample.docx'), 'renamed.pptx').kind).toBe('docx');
  });

  test('marks legacy OLE files as storage-only', () => {
    const cfb = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0]);
    expect(detectDocument(cfb, 'old.doc').kind).toBe('doc');
    expect(detectDocument(cfb, 'old.ppt').kind).toBe('ppt');
    expect(detectDocument(cfb, 'old.ppt').previewable).toBe(false);
  });

  test('rejects a legacy file without a legacy extension', () => {
    const cfb = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    expect(errorCode(() => detectDocument(cfb, 'renamed.docx'))).toBe('LEGACY_EXTENSION');
  });

  test('rejects a ZIP that is not OOXML', () => {
    const zip = zipSync({ 'hello.txt': strToU8('not a document') });
    expect(errorCode(() => detectDocument(zip, 'hello.docx'))).toBe('NOT_OOXML');
  });

  test('rejects an oversized content-types part', () => {
    const zip = zipSync({ '[Content_Types].xml': strToU8('x'.repeat(1_000_001)) });
    expect(errorCode(() => detectDocument(zip, 'bomb.docx'))).toBe('OOXML_PART_TOO_LARGE');
  });

  test('rejects an empty file', () => {
    expect(errorCode(() => detectDocument(new Uint8Array(), 'empty.docx'))).toBe('EMPTY_FILE');
  });

  test('rejects unrelated bytes', () => {
    expect(errorCode(() => detectDocument(strToU8('hello'), 'hello.txt'))).toBe(
      'UNSUPPORTED_FORMAT',
    );
  });
});
