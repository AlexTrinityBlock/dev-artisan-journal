// Lucide (ISC) icon bodies, fetched from api.iconify.design.
// Inner SVG markup only; Icon.astro supplies the shared <svg> wrapper.

export const ICONS: Record<string, string> = {
  'layers': '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  'route': '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  'gauge': '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"/>',
  'workflow': '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
  'split': '<path d="M16 3h5v5M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3m12 6l6-6"/>',
  'cpu': '<path d="M12 20v2m0-20v2m5 16v2m0-20v2M2 12h2m-2 5h2M2 7h2m16 5h2m-2 5h2M20 7h2M7 20v2M7 2v2"/><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="8" height="8" x="8" y="8" rx="1"/>',
  'brain-circuit': '<path d="M12 13h4m-4 5h6a2 2 0 0 1 2 2v1M12 8h8m-8 1a4.17 4.17 0 0 1-3 4m7-5V5a2 2 0 0 1 2-2M6 18a4 4 0 0 1-2-7.465"/><path d="M6.004 5.125a4 4 0 0 0-2.526 5.77"/><path d="M6.294 6.294A3 3 0 1 1 12 5v13a4 4 0 1 1-7.967-.518"/><circle cx="16" cy="13" r=".5" fill="currentColor"/><circle cx="18" cy="3" r=".5" fill="currentColor"/><circle cx="20" cy="21" r=".5" fill="currentColor"/><circle cx="20" cy="8" r=".5" fill="currentColor"/>',
  'zap': '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.914 4a1.5 1.5 0 0 0-2.474-1.561l-9 9A1.5 1.5 0 0 0 5.5 14h4.002a.5.5 0 0 1 .471.666L8.086 20a1.5 1.5 0 0 0 2.475 1.56l9-9A1.5 1.5 0 0 0 18.5 10h-3.997a.5.5 0 0 1-.472-.667z"/>',
  'hexagon': '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16"/>',
  'messages-square': '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2zm4-1a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/>',
  'flask-conical': '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2M6.453 15h11.094M8.5 2h7"/>',
  'braces': '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2a2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1m8 0h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>',
  'ship-wheel': '<circle cx="12" cy="12" r="8"/><path d="M12 2v7.5M19 5l-5.23 5.23M22 12h-7.5m4.5 7l-5.23-5.23M12 14.5V22m-1.77-8.23L5 19m4.5-7H2m8.23-1.77L5 5"/><circle cx="12" cy="12" r="2.5"/>',
  'cloud': '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9"/>',
  'cloud-cog': '<path d="m10.852 19.772l-.383.924m2.679-6.468l.383-.923m-.383 6.467a3 3 0 1 0-2.296-5.544l-.383-.923"/><path d="m13.53 20.696l-.382-.924a3 3 0 1 1-2.296-5.544m3.92 1.624l.923-.383m-.923 2.679l.923.383"/><path d="M4.2 15.1a7 7 0 1 1 9.93-9.858A7 7 0 0 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.2m-10.772-.348l-.923-.383m.923 2.679l-.923.383"/>',
  'blocks': '<path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect width="8" height="8" x="14" y="2" rx="1"/>',
  'container': '<path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z"/><path d="M10 21.9V14L2.1 9.1M10 14l11.9-6.9M14 19.8v-8.1m4 5.8V9.4"/>',
  'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  'server': '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><path d="M6 6h.01M6 18h.01"/>',
  'file-json-2': '<path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4M4 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1m4 0a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1a1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/>',
  'hard-drive': '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 16h.01m-7.798-4.423a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11zm19.734.436H2.054M6 16h.01"/>',
  'archive': '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-10 4h4"/>',
  'sparkles': '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594zM20 2v4m2-2h-4"/><circle cx="4" cy="20" r="2"/>',
  'graduation-cap': '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0zM22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12l2 2l4-4"/>',
  'microscope': '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18h8M3 22h18m-7 0a7 7 0 1 0 0-14h-1m-4 6h2m-2-2a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Zm3-6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
  'code': '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16 18l6-6l-6-6M8 6l-6 6l6 6"/>',
};

const SKILL_ICONS: [string, string][] = [
  ['vLLM', 'gauge'],
  ['LangGraph', 'workflow'],
  ['HAMi', 'split'],
  ['GPU Operator', 'cpu'],
  ['PyTorch', 'brain-circuit'],
  ['FastAPI', 'zap'],
  ['Node.js', 'hexagon'],
  ['RabbitMQ', 'messages-square'],
  ['Django', 'flask-conical'],
  ['PHP', 'braces'],
  ['Kubernetes', 'ship-wheel'],
  ['AWS', 'cloud'],
  ['Google Cloud', 'cloud-cog'],
  ['Terraform', 'blocks'],
  ['Docker', 'container'],
  ['PostgreSQL', 'database'],
  ['SQL Server', 'server'],
  ['MongoDB', 'file-json-2'],
  ['Longhorn', 'hard-drive'],
  ['MinIO', 'archive'],
];

// Product names are identical across locales, so matching on them stays stable.
export function skillIcon(name: string): string {
  for (const [needle, icon] of SKILL_ICONS) {
    if (name.includes(needle)) return icon;
  }
  return 'code';
}

const ENTRY_ICONS: Record<string, string> = {
  'NODE // CURRENT': 'sparkles',
  'NODE // ACADEMIC ADVISORY': 'graduation-cap',
  'NODE // NATIONAL CYBER SECURITY': 'shield-check',
  'NODE // CLOUD ARCHITECTURE': 'cloud',
  'NODE // RESEARCH & THESIS': 'microscope',
  'NODE // EARLY CAREER': 'code',
};

export function entryIcon(tag: string): string {
  return ENTRY_ICONS[tag] ?? 'code';
}