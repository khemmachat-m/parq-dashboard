/**
 * masterStore.js
 * Two-layer master data system:
 *
 *  Layer 1 — Bundled CSVs in /public/masterdata/  (shared, loaded for everyone)
 *  Layer 2 — IndexedDB overrides (per-browser, set when user manually uploads)
 *
 * Priority: IndexedDB override > bundled file
 *
 * This means:
 *  - All users get master data automatically from the repo
 *  - Any user can override a specific file by uploading a newer version
 *  - Overrides persist across sessions in that browser only
 */

const DB_NAME    = 'parq-master-data';
const DB_VERSION = 1;
const STORE_NAME = 'masters';

// Map slot key → bundled CSV filename in /public/masterdata/
export const BUNDLED_FILES = {
  priorityRows:        'priorities.csv',
  locationRows:        'locations.csv',
  assetRows:           'assets.csv',
  problemTypeRows:     'problem_types.csv',
  eventTypeRows:       'event_types.csv',
  serviceCategoryRows: 'service_categories.csv',
  frequencyTypeRows:   'frequency_types.csv',
};

// ── IndexedDB helpers ─────────────────────────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'slotKey' });
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

export async function saveOverride(slotKey, fileName, csvText) {
  const db  = await openDB();
  const tx  = db.transaction(STORE_NAME, 'readwrite');
  const rec = { slotKey, fileName, csvText, updatedAt: new Date().toISOString(), isOverride: true };
  return new Promise((resolve, reject) => {
    const req = tx.objectStore(STORE_NAME).put(rec);
    req.onsuccess = () => resolve(rec);
    req.onerror   = e => reject(e.target.error);
  });
}

export async function loadAllOverrides() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = e => {
        const map = {};
        for (const rec of e.target.result) map[rec.slotKey] = rec;
        resolve(map);
      };
      req.onerror = e => reject(e.target.error);
    });
  } catch {
    return {}; // IndexedDB unavailable (private browsing etc.)
  }
}

export async function deleteOverride(slotKey) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = tx.objectStore(STORE_NAME).delete(slotKey);
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}

// ── Fetch bundled CSV from /public/masterdata/ ────────────────────────────────
async function fetchBundled(slotKey, baseUrl) {
  const filename = BUNDLED_FILES[slotKey];
  if (!filename) return null;
  try {
    const url  = `${baseUrl}masterdata/${filename}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const text = await resp.text();
    // Detect placeholder — don't use it as real data
    if (text.includes('PLACEHOLDER')) return null;
    return { slotKey, fileName: filename, csvText: text, updatedAt: null, isOverride: false };
  } catch {
    return null;
  }
}

// ── Load all masters: bundled + overrides merged ──────────────────────────────
/**
 * Returns { [slotKey]: { slotKey, fileName, csvText, updatedAt, isOverride, source } }
 * source = 'bundled' | 'override' | null (missing)
 */
export async function loadAllMasters(baseUrl = '/') {
  // Normalize baseUrl to end with /
  const base = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

  // Fetch bundled files and IndexedDB overrides in parallel
  const slotKeys = Object.keys(BUNDLED_FILES);
  const [bundledResults, overrides] = await Promise.all([
    Promise.all(slotKeys.map(key => fetchBundled(key, base))),
    loadAllOverrides(),
  ]);

  const bundledMap = {};
  slotKeys.forEach((key, i) => {
    if (bundledResults[i]) bundledMap[key] = { ...bundledResults[i], source: 'bundled' };
  });

  // Merge: override wins over bundled
  const merged = { ...bundledMap };
  for (const [key, rec] of Object.entries(overrides)) {
    merged[key] = { ...rec, source: 'override' };
  }

  return { merged, bundledMap, overrides };
}

export function fmtStoredDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
