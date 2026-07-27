/** Normalise for comparison: lowercase, strip punctuation/spaces */
function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** True if filter loosely matches value (substring either way or shared token). */
export function fuzzyMatch(value: string, filter: string): boolean {
  const v = value.toLowerCase().trim();
  const f = filter.toLowerCase().trim();
  if (!f) return true;
  if (v.includes(f) || f.includes(v)) return true;

  const vNorm = normalise(v);
  const fNorm = normalise(f);
  if (vNorm.includes(fNorm) || fNorm.includes(vNorm)) return true;

  // Match individual words (e.g. "full stack" matches "Full Stack Developer")
  const fWords = f.split(/\s+/).filter(Boolean);
  return fWords.every((word) => v.includes(word) || normalise(v).includes(normalise(word)));
}

export function matchesAnyFuzzy(items: string[], filters: string[]): boolean {
  if (filters.length === 0) return true;
  return filters.some((filter) => items.some((item) => fuzzyMatch(item, filter)));
}
