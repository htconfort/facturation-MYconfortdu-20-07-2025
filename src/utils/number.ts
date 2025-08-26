export const toSafeString = (v: unknown): string =>
  typeof v === 'string' ? v : (v as any)?.toString?.() ?? '';

export const normalizeInput = (raw: unknown) => {
  const s = toSafeString(raw).trim();
  if (s === '') return { raw: '', clean: '', number: null };
  const clean = s.replace(/\s+/g, '').replace(',', '.');
  const n = Number(clean);
  return { raw: s, clean, number: Number.isFinite(n) ? n : null };
};
