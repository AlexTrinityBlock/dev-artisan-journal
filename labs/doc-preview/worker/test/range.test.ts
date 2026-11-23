import { describe, expect, test } from 'bun:test';
import { parseRange } from '../src/range';

describe('parseRange', () => {
  test('returns null without a range header', () => {
    expect(parseRange(null, 1000)).toBeNull();
    expect(parseRange('', 1000)).toBeNull();
  });

  test('parses a closed range', () => {
    expect(parseRange('bytes=0-99', 1000)).toEqual({ offset: 0, length: 100 });
  });

  test('parses an open-ended range', () => {
    expect(parseRange('bytes=900-', 1000)).toEqual({ offset: 900, length: 100 });
  });

  test('parses a suffix range', () => {
    expect(parseRange('bytes=-200', 1000)).toEqual({ offset: 800, length: 200 });
    expect(parseRange('bytes=-5000', 1000)).toEqual({ offset: 0, length: 1000 });
  });

  test('clamps an end past the object size', () => {
    expect(parseRange('bytes=900-5000', 1000)).toEqual({ offset: 900, length: 100 });
  });

  test('rejects a start past the object size', () => {
    expect(parseRange('bytes=1000-', 1000)).toBe('invalid');
    expect(parseRange('bytes=2000-3000', 1000)).toBe('invalid');
  });

  test('ignores multi-range requests', () => {
    expect(parseRange('bytes=0-9,20-29', 1000)).toBeNull();
  });
});
