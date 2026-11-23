import { strFromU8 } from 'fflate';
import { DocumentError } from './errors';
import type { DocumentKind, DocumentMeta } from './types';
import { readZipParts } from './zip';

const PART_LIMITS: Record<string, number> = {
  'docProps/core.xml': 512 * 1024,
  'docProps/app.xml': 512 * 1024,
  'ppt/presentation.xml': 2 * 1024 * 1024,
  'word/document.xml': 8 * 1024 * 1024,
};

const EMPTY: DocumentMeta = {
  title: null,
  creator: null,
  lastModifiedBy: null,
  created: null,
  modified: null,
  pages: null,
  words: null,
  slides: null,
  application: null,
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos);/gi, (match, entity: string) => {
    if (entity.startsWith('#')) {
      const hex = entity[1]?.toLowerCase() === 'x';
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      const valid =
        Number.isInteger(code) && code >= 0 && code <= 0x10ffff && (code < 0xd800 || code > 0xdfff);
      return valid ? String.fromCodePoint(code) : match;
    }
    switch (entity.toLowerCase()) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      case 'apos':
        return "'";
      default:
        return match;
    }
  });
}

function readTag(xml: string, localName: string): string | null {
  const name = `(?:[A-Za-z_][\\w.-]*:)?${localName}`;
  const expression = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i');
  const match = expression.exec(xml);
  if (!match?.[1]) return null;
  const value = decodeEntities(match[1].replace(/<[^>]+>/g, '').trim());
  return value || null;
}

function readNumber(xml: string, localName: string): number | null {
  const value = readTag(xml, localName);
  if (!value) return null;
  const parsed = Number.parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function clip(value: string | null, max = 240): string | null {
  if (!value) return null;
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function wordCount(xml: string): number | null {
  const text = xml
    .replace(/<w:tab\/>/g, ' ')
    .replace(/<w:br\/>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function extractMetadata(bytes: Uint8Array, kind: DocumentKind): DocumentMeta {
  if (kind === 'doc' || kind === 'ppt') return { ...EMPTY };

  let files: Record<string, Uint8Array>;
  try {
    files = readZipParts(bytes, PART_LIMITS);
  } catch (error) {
    if (error instanceof DocumentError) throw error;
    return { ...EMPTY };
  }

  const core = files['docProps/core.xml'] ? strFromU8(files['docProps/core.xml']) : '';
  const app = files['docProps/app.xml'] ? strFromU8(files['docProps/app.xml']) : '';
  const presentation = files['ppt/presentation.xml']
    ? strFromU8(files['ppt/presentation.xml'])
    : '';
  const document = files['word/document.xml'] ? strFromU8(files['word/document.xml']) : '';

  const slideCount = app ? readNumber(app, 'Slides') : null;
  const slideIds = presentation.match(/<p:sldId\b/g)?.length ?? null;
  const appWords = app ? readNumber(app, 'Words') : null;

  return {
    title: clip(readTag(core, 'title')),
    creator: clip(readTag(core, 'creator')),
    lastModifiedBy: clip(readTag(core, 'lastModifiedBy')),
    created: clip(readTag(core, 'created'), 40),
    modified: clip(readTag(core, 'modified'), 40),
    pages: app ? readNumber(app, 'Pages') : null,
    words: appWords ?? wordCount(document),
    slides: slideCount ?? slideIds,
    application: clip(readTag(app, 'Application'), 80),
  };
}
