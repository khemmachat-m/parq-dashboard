/**
 * csv.js
 * Utilities for converting enriched row arrays back to CSV text
 * and triggering browser downloads.
 */
import Papa from 'papaparse';

/**
 * Convert an array of row objects to a CSV string.
 * Preserves all columns present in the data (original + enriched).
 */
export function rowsToCsv(rows) {
  if (!rows || !rows.length) return '';
  return Papa.unparse(rows, {
    quotes: true,          // quote all fields for safety
    skipEmptyLines: false,
  });
}

/**
 * Trigger a browser download of a CSV string.
 * @param {string} csvText   CSV content
 * @param {string} filename  e.g. 'PARQ_CWO_Enriched.csv'
 */
export function downloadCsv(csvText, filename) {
  // BOM prefix so Excel opens UTF-8 correctly
  const bom  = '\uFEFF';
  const blob = new Blob([bom + csvText], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
