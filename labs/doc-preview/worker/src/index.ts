import { DocumentError, detectDocument } from './detect';
import { extractMetadata } from './meta';
import { contentDisposition, safeName } from './name';
import { parseRange } from './range';
import type { DocumentRecord, Env } from './types';

const DEFAULT_MAX_BYTES = 20 * 1024 * 1024;
const MAX_ALLOWED_BYTES = 50 * 1024 * 1024;
const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://blog.alextrinitywolf.com',
];
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function maxBytes(env: Env): number {
  const parsed = Number.parseInt(env.MAX_UPLOAD_BYTES ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_MAX_BYTES;
  return Math.min(parsed, MAX_ALLOWED_BYTES);
}

function allowedOrigins(env: Env): string[] {
  const configured = env.ALLOWED_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return configured?.length ? configured : DEFAULT_ORIGINS;
}

function corsHeaders(request: Request, env: Env): Headers {
  const headers = new Headers();
  const origin = request.headers.get('Origin');
  if (origin && allowedOrigins(env).includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, DELETE, OPTIONS');
  headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Range, If-None-Match, If-Modified-Since',
  );
  headers.set(
    'Access-Control-Expose-Headers',
    'Content-Length, Content-Range, Content-Disposition, ETag',
  );
  headers.set('Access-Control-Max-Age', '86400');
  return headers;
}

function jsonResponse(
  payload: unknown,
  status: number,
  request: Request,
  env: Env,
  extra?: HeadersInit,
): Response {
  const headers = corsHeaders(request, env);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  if (extra) {
    for (const [name, value] of new Headers(extra)) headers.set(name, value);
  }
  return new Response(JSON.stringify(payload, null, 2), { status, headers });
}

function failure(error: unknown, request: Request, env: Env, context: string): Response {
  if (error instanceof DocumentError) {
    return jsonResponse(
      { error: { code: error.code, message: error.message } },
      error.status,
      request,
      env,
    );
  }
  console.error(context, error);
  return jsonResponse(
    {
      error: {
        code: 'INTERNAL',
        message: 'The request failed before it could be completed.',
      },
    },
    500,
    request,
    env,
  );
}

function authorized(request: Request, env: Env): boolean {
  const token = env.UPLOAD_TOKEN;
  if (token === undefined) return true;
  // An explicitly empty token fails closed instead of silently disabling auth.
  if (token.length === 0) return false;
  return request.headers.get('Authorization') === `Bearer ${token}`;
}

function requireWriteAccess(request: Request, env: Env): void {
  if (!authorized(request, env)) {
    throw new DocumentError('A valid upload token is required.', 'UNAUTHORIZED', 401);
  }
}

function documentKey(id: string): string {
  return `documents/${id}/original`;
}

function metaKey(id: string): string {
  return `documents/${id}/meta.json`;
}

async function recordFor(env: Env, id: string): Promise<DocumentRecord | null> {
  const object = await env.DOCS.get(metaKey(id));
  if (!object) return null;
  return object.json<DocumentRecord>();
}

async function upload(request: Request, env: Env): Promise<Response> {
  requireWriteAccess(request, env);
  const limit = maxBytes(env);
  const declared = Number(request.headers.get('Content-Length') ?? '0');
  if (Number.isFinite(declared) && declared > limit + 1024 * 1024) {
    throw new DocumentError(
      `The upload exceeds the ${Math.round(limit / 1024 / 1024)} MB limit.`,
      'TOO_LARGE',
      413,
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new DocumentError(
      'Send the file as multipart/form-data with a "file" field.',
      'BAD_FORM',
      400,
    );
  }

  const candidate = form.get('file');
  if (!(candidate instanceof File)) {
    throw new DocumentError('The "file" field is missing.', 'MISSING_FILE', 400);
  }
  if (candidate.size === 0) {
    throw new DocumentError('The uploaded file is empty.', 'EMPTY_FILE', 400);
  }
  if (candidate.size > limit) {
    throw new DocumentError(
      `The upload exceeds the ${Math.round(limit / 1024 / 1024)} MB limit.`,
      'TOO_LARGE',
      413,
    );
  }

  const bytes = new Uint8Array(await candidate.arrayBuffer());
  const detection = detectDocument(bytes, candidate.name);
  const name = safeName(candidate.name);
  const id = crypto.randomUUID();
  const record: DocumentRecord = {
    ...detection,
    id,
    name,
    size: bytes.byteLength,
    uploadedAt: new Date().toISOString(),
    meta: extractMetadata(bytes, detection.kind),
  };

  await env.DOCS.put(documentKey(id), bytes, {
    httpMetadata: { contentType: detection.mime },
    customMetadata: {
      kind: detection.kind,
      name: encodeURIComponent(name),
    },
  });
  await env.DOCS.put(metaKey(id), JSON.stringify(record), {
    httpMetadata: { contentType: 'application/json; charset=utf-8' },
  });

  const origin = new URL(request.url).origin;
  return jsonResponse(
    {
      ...record,
      url: `${origin}/api/documents/${id}`,
      metaUrl: `${origin}/api/documents/${id}/meta`,
    },
    201,
    request,
    env,
  );
}

async function serveFile(request: Request, env: Env, id: string): Promise<Response> {
  const record = await recordFor(env, id);
  if (!record) {
    throw new DocumentError('No document with that id.', 'NOT_FOUND', 404);
  }

  const range = parseRange(request.headers.get('Range'), record.size);
  if (range === 'invalid') {
    if (request.method === 'HEAD') {
      const headers = corsHeaders(request, env);
      headers.set('Content-Range', `bytes */${record.size}`);
      return new Response(null, { status: 416, headers });
    }
    return jsonResponse(
      { error: { code: 'RANGE_NOT_SATISFIABLE', message: 'The requested byte range is invalid.' } },
      416,
      request,
      env,
      { 'Content-Range': `bytes */${record.size}` },
    );
  }

  const key = documentKey(id);
  if (request.method === 'HEAD') {
    const head = await env.DOCS.head(key);
    if (!head) throw new DocumentError('The stored object is missing.', 'STORAGE_MISSING', 404);
    if (etagMatches(request.headers.get('If-None-Match'), head.httpEtag)) {
      return notModified(request, env, head.httpEtag);
    }
    const headers = fileHeaders(request, env, record, head.httpEtag);
    headers.set('Content-Length', String(range ? range.length : head.size));
    if (range) {
      headers.set(
        'Content-Range',
        `bytes ${range.offset}-${range.offset + range.length - 1}/${record.size}`,
      );
    }
    return new Response(null, { status: range ? 206 : 200, headers });
  }

  const object = await env.DOCS.get(
    key,
    range ? { range: { offset: range.offset, length: range.length } } : undefined,
  );
  if (!object) {
    throw new DocumentError('The stored object is missing.', 'STORAGE_MISSING', 404);
  }

  const etag = object.httpEtag;
  if (etagMatches(request.headers.get('If-None-Match'), etag)) {
    return notModified(request, env, etag);
  }

  const headers = fileHeaders(request, env, record, etag);
  headers.set('Content-Length', String(range ? range.length : object.size));
  if (range) {
    headers.set(
      'Content-Range',
      `bytes ${range.offset}-${range.offset + range.length - 1}/${record.size}`,
    );
  }
  return new Response(object.body, { status: range ? 206 : 200, headers });
}

function etagMatches(header: string | null, etag: string): boolean {
  if (!header) return false;
  const normalized = etag.replace(/^W\//, '');
  return header.split(',').some((value) => {
    const candidate = value.trim();
    return candidate === '*' || candidate.replace(/^W\//, '') === normalized;
  });
}

function notModified(request: Request, env: Env, etag: string): Response {
  const headers = corsHeaders(request, env);
  headers.set('ETag', etag);
  headers.set('Cache-Control', 'private, max-age=300');
  return new Response(null, { status: 304, headers });
}

function fileHeaders(request: Request, env: Env, record: DocumentRecord, etag: string): Headers {
  const headers = corsHeaders(request, env);
  headers.set('Content-Type', record.mime);
  headers.set('Content-Disposition', contentDisposition(record.name));
  headers.set('Accept-Ranges', 'bytes');
  headers.set('ETag', etag);
  headers.set('Cache-Control', 'private, max-age=300');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Security-Policy', 'sandbox');
  return headers;
}

async function deleteDocument(request: Request, env: Env, id: string): Promise<Response> {
  requireWriteAccess(request, env);
  const record = await recordFor(env, id);
  if (!record) {
    throw new DocumentError('No document with that id.', 'NOT_FOUND', 404);
  }
  await env.DOCS.delete([documentKey(id), metaKey(id)]);
  return jsonResponse({ deleted: id }, 200, request, env);
}

function parseId(raw: string | undefined): string {
  let id = '';
  try {
    id = raw ? decodeURIComponent(raw) : '';
  } catch {
    throw new DocumentError('The document id is not valid.', 'BAD_ID', 400);
  }
  if (!ID_PATTERN.test(id)) {
    throw new DocumentError('The document id is not valid.', 'BAD_ID', 400);
  }
  return id;
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  }

  if (url.pathname === '/health' || url.pathname === '/') {
    return jsonResponse(
      {
        ok: true,
        service: 'doc-preview-api',
        version: '0.1.0',
        limits: { maxUploadBytes: maxBytes(env) },
        endpoints: {
          upload: 'POST /api/documents',
          file: 'GET /api/documents/:id',
          meta: 'GET /api/documents/:id/meta',
          delete: 'DELETE /api/documents/:id',
        },
      },
      200,
      request,
      env,
    );
  }

  if (segments[0] === 'api' && segments[1] === 'documents') {
    if (segments.length === 2) {
      if (request.method === 'POST') return upload(request, env);
      throw new DocumentError('Method not allowed.', 'METHOD_NOT_ALLOWED', 405);
    }

    const id = parseId(segments[2]);

    if (segments.length === 4 && segments[3] === 'meta') {
      if (request.method !== 'GET') {
        throw new DocumentError('Method not allowed.', 'METHOD_NOT_ALLOWED', 405);
      }
      const record = await recordFor(env, id);
      if (!record) throw new DocumentError('No document with that id.', 'NOT_FOUND', 404);
      return jsonResponse(record, 200, request, env);
    }

    if (segments.length === 3) {
      if (request.method === 'GET' || request.method === 'HEAD') {
        return serveFile(request, env, id);
      }
      if (request.method === 'DELETE') return deleteDocument(request, env, id);
      throw new DocumentError('Method not allowed.', 'METHOD_NOT_ALLOWED', 405);
    }
  }

  throw new DocumentError('Route not found.', 'NOT_FOUND', 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await route(request, env);
    } catch (error) {
      return failure(error, request, env, `${request.method} ${new URL(request.url).pathname}`);
    }
  },
} satisfies ExportedHandler<Env>;
