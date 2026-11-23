export type DocumentKind = 'docx' | 'pptx' | 'doc' | 'ppt';

export interface DocumentMeta {
  title: string | null;
  creator: string | null;
  lastModifiedBy: string | null;
  created: string | null;
  modified: string | null;
  pages: number | null;
  words: number | null;
  slides: number | null;
  application: string | null;
}

export interface Detection {
  kind: DocumentKind;
  mime: string;
  legacy: boolean;
  previewable: boolean;
}

export interface DocumentRecord extends Detection {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  meta: DocumentMeta;
}

export interface Env {
  DOCS: R2Bucket;
  ALLOWED_ORIGINS?: string;
  MAX_UPLOAD_BYTES?: string;
  UPLOAD_TOKEN?: string;
}
