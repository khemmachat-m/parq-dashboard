/**
 * Shared statistics utilities
 */

/** Safe percentage: round(a/b*100, 1) or 0 */
export function pctOf(a, b) {
  return b ? +((a / b) * 100).toFixed(1) : 0;
}

/**
 * Count occurrences of each value in arr, return top-N sorted by count desc.
 * Tie-break: alphabetical by label.
 * @returns {Array<{label:string, count:number}>}
 */
export function topN(arr, n = 8) {
  const counts = {};
  for (const v of arr) {
    if (v != null && v !== '') counts[v] = (counts[v] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([label, count]) => ({ label, count }));
}

/**
 * Build a two-week comparison array for the Comparing table.
 * @returns {Array<{type, lw, pw, delta}>} sorted by lw desc
 */
export function buildComparison(lwItems, pwItems) {
  const allTypes = [...new Set([...lwItems, ...pwItems].map(e => e.label))].sort();
  const lwMap = Object.fromEntries(lwItems.map(e => [e.label, e.count]));
  const pwMap = Object.fromEntries(pwItems.map(e => [e.label, e.count]));
  return allTypes
    .map(t => ({ type: t, lw: lwMap[t] || 0, pw: pwMap[t] || 0, delta: (lwMap[t] || 0) - (pwMap[t] || 0) }))
    .sort((a, b) => b.lw - a.lw);
}
