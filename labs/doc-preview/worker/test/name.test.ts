import { describe, expect, test } from 'bun:test';
import { asciiName, contentDisposition, safeName } from '../src/name';

describe('safeName', () => {
  test('strips paths', () => {
    expect(safeName('../secret.docx')).toBe('secret.docx');
    expect(safeName('C:\\Users\\a\\file.pptx')).toBe('file.pptx');
  });

  test('removes control characters and quotes', () => {
    expect(safeName('a\u0000b"c.docx')).toBe('ab_c.docx');
  });

  test('keeps Unicode names', () => {
    expect(safeName('簡報 2026.pptx')).toBe('簡報 2026.pptx');
  });

  test('falls back for empty input', () => {
    expect(safeName('')).toBe('document');
    expect(safeName('   ')).toBe('document');
  });

  test('truncates by code point, not UTF-16 unit', () => {
    const name = `${'a'.repeat(119)}😀.docx`;
    const result = safeName(name);
    expect(Array.from(result).length).toBe(120);
    expect(() => encodeURIComponent(result)).not.toThrow();
  });

  test('strips bidi and lone surrogate characters', () => {
    expect(safeName('a\u202Eb\uD800c.docx')).toBe('abc.docx');
  });
});

describe('contentDisposition', () => {
  test('provides an ASCII fallback and an RFC 5987 name', () => {
    expect(contentDisposition('簡報.pptx')).toBe(
      'inline; filename="__.pptx"; filename*=UTF-8\'\'%E7%B0%A1%E5%A0%B1.pptx',
    );
    expect(asciiName('plain.docx')).toBe('plain.docx');
  });
});
