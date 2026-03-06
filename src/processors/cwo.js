/**
 * Corrective Work Orders – data processing
 */
import { parseDate } from '../utils/date.js';
import { pctOf, topN } from '../utils/stats.js';

// Thai + English keyword → category mapping
const KEYWORD_MAP = [
  [['แอร์', 'อุณหภูมิ', 'temperature'],     'Aircon / Temperature'],
  [['ไฟ', 'หลอด', 'light'],                  'Lighting Faulty'],
  [['น้ำ', 'หยด', 'leak'],                   'Water Leak / Plumbing'],
  [['ประตู', 'มือจับ', 'door'],               'Door / Lock'],
  [['แม่บ้าน', 'ทำความสะอาด'],               'Cleaning'],
  [['กระเบื้อง', 'พื้น', 'tile'],             'Floor / Tile'],
  [['ลิฟต์', 'lift'],                         'Lift / Elevator'],
  [['smoke', 'alarm', 'fire'],                'Fire Alarm'],
];

export function categorizeCWO(desc) {
  if (!desc) return 'Other';
  const d = String(desc).toLowerCase();
  for (const [keywords, cat] of KEYWORD_MAP) {
    if (keywords.some(k => d.includes(k))) return cat;
  }
  return 'Other';
}

/**
 * Compute CWO statistics for a set of rows.
 * @param {Object[]} rows  Parsed CSV rows (enriched or raw)
 * @returns {Object} stats
 */
export function cwoStats(rows) {
  const total     = rows.length;
  const resolved  = rows.filter(r => +r.StatusId === 7).length;
  const cancelled = rows.filter(r => +r.StatusId === 8).length;
  const active    = rows.filter(r => [4, 5].includes(+r.StatusId)).length;

  // SLA: actual completion vs SlatoResolve
  let slaPass = 0, slaFail = 0;
  for (const r of rows) {
    const actual = parseDate(r.ActualCompletionDateTime);
    const sla    = parseDate(r.SlatoResolve);
    if (actual && sla) {
      if (actual <= sla) slaPass++; else slaFail++;
    }
  }
  const slaTotal = slaPass + slaFail;

  // Breakdowns
  const priorities = topN(rows.map(r => r.Priority_Name || (r.PriorityId ? `Priority ${r.PriorityId}` : 'Unknown')), 6);
  const locations  = topN(rows.map(r => r.TopLocation_Name || r.Location_Name || 'Other Zone'), 6);
  const events     = topN(rows.map(r => r._EventType || categorizeCWO(r.Description)));
  const assets     = topN(
    rows.filter(r => r.Asset_Name && r.Asset_Name.trim() !== '' && r.Asset_Name !== 'No Asset Linked')
        .map(r => r.Asset_Name),
    6
  );

  return {
    total,
    resolved,
    cancelled,
    active,
    slaPass,
    slaFail,
    slaTotal,
    slaPassPct:  pctOf(slaPass, slaTotal),
    slaFailPct:  pctOf(slaFail, slaTotal),
    resolvePct:  pctOf(resolved, total),
    activePct:   pctOf(active, total),
    priorities,
    locations,
    events,
    assets,
  };
}
