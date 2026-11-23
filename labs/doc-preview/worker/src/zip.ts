import { Unzip, UnzipInflate, UnzipPassThrough } from 'fflate';
import { DocumentError } from './errors';

/**
 * Reads selected parts from a ZIP without trusting the central directory's
 * uncompressed-size fields. A crafted ZIP can declare a tiny originalSize and
 * still inflate a huge stream; the per-chunk counter aborts at the limit.
 */
export function readZipParts(
  bytes: Uint8Array,
  limits: Record<string, number>,
): Record<string, Uint8Array> {
  const result: Record<string, Uint8Array> = {};
  let failure: DocumentError | null = null;
  const unzip = new Unzip();

  unzip.register(UnzipPassThrough);
  unzip.register(UnzipInflate);

  unzip.onfile = (file) => {
    if (failure) return;
    const limit = limits[file.name];
    if (limit === undefined) return;

    const chunks: Uint8Array[] = [];
    let size = 0;

    file.ondata = (error, chunk, final) => {
      if (failure) return;
      if (error) {
        failure = new DocumentError('The ZIP container could not be read.', 'INVALID_ZIP', 415);
        return;
      }
      size += chunk.length;
      if (size > limit) {
        failure = new DocumentError(
          `The ${file.name} part is too large.`,
          'OOXML_PART_TOO_LARGE',
          413,
        );
        throw failure;
      }
      chunks.push(chunk);
      if (final) {
        const output = new Uint8Array(size);
        let offset = 0;
        for (const part of chunks) {
          output.set(part, offset);
          offset += part.length;
        }
        result[file.name] = output;
      }
    };

    try {
      file.start();
    } catch (error) {
      if (error instanceof DocumentError) throw error;
      failure = new DocumentError('The ZIP container could not be read.', 'INVALID_ZIP', 415);
    }
    if (failure) throw failure;
  };

  try {
    unzip.push(bytes, true);
  } catch (error) {
    if (error instanceof DocumentError) throw error;
    throw new DocumentError('The ZIP container could not be read.', 'INVALID_ZIP', 415);
  }
  if (failure) throw failure;
  return result;
}
