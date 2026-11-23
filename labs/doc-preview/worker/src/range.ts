export type ParsedRange = { offset: number; length: number };

/**
 * Parses a single `bytes=start-end` range. Multi-range requests and malformed
 * headers are ignored (the caller returns the full object). A syntactically
 * valid range that starts past the end of the object is `invalid` and should
 * produce a 416.
 */
export function parseRange(header: string | null, size: number): ParsedRange | 'invalid' | null {
  if (!header || size <= 0) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  const startText = match[1] ?? '';
  const endText = match[2] ?? '';
  if (startText === '' && endText === '') return null;

  if (startText === '') {
    const suffix = Number.parseInt(endText, 10);
    if (!Number.isFinite(suffix) || suffix <= 0) return 'invalid';
    const length = Math.min(suffix, size);
    return { offset: size - length, length };
  }

  const start = Number.parseInt(startText, 10);
  if (!Number.isFinite(start) || start < 0 || start >= size) return 'invalid';

  const end = endText === '' ? size - 1 : Number.parseInt(endText, 10);
  if (!Number.isFinite(end) || end < start) return 'invalid';

  const boundedEnd = Math.min(end, size - 1);
  return { offset: start, length: boundedEnd - start + 1 };
}
