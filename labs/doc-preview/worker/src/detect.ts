import { strFromU8 } from 'fflate';
import { DocumentError } from './errors';
import type { Detection } from './types';
import { readZipParts } from './zip';

export { DocumentError };

const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04];
const CFB_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const MAX_CONTENT_TYPES_BYTES = 1_000_000;

const MIME = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  doc: 'application/msword',
  ppt: 'application/vnd.ms-powerpoint',
} as const;

function startsWith(bytes: Uint8Array, magic: number[]): boolean {
  return magic.every((byte, index) => bytes[index] === byte);
}

export function isZip(bytes: Uint8Array): boolean {
  return startsWith(bytes, ZIP_MAGIC);
}

export function isCfb(bytes: Uint8Array): boolean {
  return startsWith(bytes, CFB_MAGIC);
}

function extension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
}

function contentTypes(bytes: Uint8Array): string {
  const files = readZipParts(bytes, { '[Content_Types].xml': MAX_CONTENT_TYPES_BYTES });
  const entry = files['[Content_Types].xml'];
  if (!entry) {
    throw new DocumentError(
      'This is a ZIP file, but not an OOXML document (missing [Content_Types].xml).',
      'NOT_OOXML',
      415,
    );
  }
  return strFromU8(entry);
}

export function detectDocument(bytes: Uint8Array, filename: string): Detection {
  if (bytes.byteLength === 0) {
    throw new DocumentError('The uploaded file is empty.', 'EMPTY_FILE', 400);
  }

  if (isZip(bytes)) {
    const xml = contentTypes(bytes);
    const isWord = xml.includes('wordprocessingml.document');
    const isPresentation = xml.includes('presentationml.presentation');
    const ext = extension(filename);

    if (isWord && (!isPresentation || ext !== 'pptx')) {
      return { kind: 'docx', mime: MIME.docx, legacy: false, previewable: true };
    }
    if (isPresentation) {
      return { kind: 'pptx', mime: MIME.pptx, legacy: false, previewable: true };
    }
    throw new DocumentError(
      'The ZIP is valid, but it is neither a DOCX nor a PPTX package.',
      'UNSUPPORTED_OOXML',
      415,
    );
  }

  if (isCfb(bytes)) {
    const ext = extension(filename);
    if (ext === 'doc') {
      return { kind: 'doc', mime: MIME.doc, legacy: true, previewable: false };
    }
    if (ext === 'ppt') {
      return { kind: 'ppt', mime: MIME.ppt, legacy: true, previewable: false };
    }
    throw new DocumentError(
      'Legacy OLE files must be named .doc or .ppt so the format can be identified.',
      'LEGACY_EXTENSION',
      415,
    );
  }

  throw new DocumentError(
    'Only DOCX, PPTX, DOC, and PPT files are accepted.',
    'UNSUPPORTED_FORMAT',
    415,
  );
}
