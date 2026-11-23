/** A filename that is safe for R2 metadata and Content-Disposition. */
export function safeName(input: string): string {
  const base = input.split(/[\\/]/).pop() ?? 'document';
  const cleaned = base
    .replace(/[\p{Cc}\p{Cf}\p{Cs}]/gu, '')
    .replace(/["<>|:*?]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(cleaned).slice(0, 120).join('') || 'document';
}

/** ASCII fallback for the `filename=` parameter in Content-Disposition. */
export function asciiName(name: string): string {
  return name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
}

function encodeRFC5987(value: string): string {
  return encodeURIComponent(value).replace(/['()*]/g, (character) => {
    return `%${character.charCodeAt(0).toString(16).toUpperCase()}`;
  });
}

export function contentDisposition(name: string): string {
  return `inline; filename="${asciiName(name)}"; filename*=UTF-8''${encodeRFC5987(name)}`;
}
