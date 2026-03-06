/**
 * Planned Preventive Maintenance (PPM) – data processing
 */
import { pctOf, topN } from '../utils/stats.js';

// Mozart PPM StatusId → meaning
// 2 = In Progress   3 = Overdue   4 = Completed   7 = Closed   8 = Cancelled
const CLOSED_IDS     = new Set([4, 7]);
const CANCELLED_ID   = 8;
const IN_PROGRESS_ID = 2;
const OVERDUE_ID     = 3;

// FrequencyTypeId → human label
const FREQ_LABELS = {
  1: 'Daily (7D)',
  2: 'Daily (Mon–Fri)',
  5: 'Monthly',
  6: 'Bi-Monthly',
  7: 'Quarterly',
  8: 'Semi-Annual',
  9: 'Annual',
};

// ServiceCategoryId → human label (fallback)
const SVC_LABELS = {
  3: 'Cleaning',
  4: 'Electrical / Generator',
  5: 'Gas / Utilities',
  6: 'Escalator',
  7: 'Landscaping / Plants',
  8: 'Pest Control',
  9: 'Fire Protection',
  10: 'Pool / Fountain',
  11: 'Security / CCTV',
  13: 'HVAC / Exhaust',
  15: 'Operations / Soft Svc',
  20: 'Waste Water',
};

/**
 * Derive task category from MasterWorkOrderTitle + ServiceCategoryId fallback.
 */
export function categorizePPM(title, svcId) {
  if (title) {
    const t = String(title).toLowerCase();
    if (/toilet|ห้องน้ำ/.test(t))               return 'Toilet Cleaning';
    if (/car\s*park|parking|basement|b1|b2/.test(t)) return 'Car Park Cleaning';
    if (/clean|ทำความสะอาด/.test(t))            return 'General Cleaning';
    if (/plant|รดน้ำ|weed|วัชพืช|garden|sapling|stake/.test(t)) return 'Landscaping / Plants';
    if (/exhaust\s*fan|ahu|pau|ahe|hvac|pressuri[sz]ed/.test(t)) return 'HVAC / Ventilation';
    if (/exit\s*sign|emergency\s*light|electrical|generator|genset/.test(t)) return 'Electrical / Generator';
    if (/fire\s*pump|jockey|sprinkler|fire/.test(t)) return 'Fire Protection';
    if (/pump|waste\s*water|swimming\s*pool|fountain/.test(t)) return 'Plumbing / Water';
    if (/lift|elevator|ลิฟต์|escalator/.test(t))  return 'Lift / Escalator';
    if (/cctv|security/.test(t))                   return 'Security / CCTV';
    if (/pest/.test(t))                            return 'Pest Control';
    if (/operate\s*team|ops|soft\s*service/.test(t)) return 'Operations / Soft Svc';
  }
  if (svcId) return SVC_LABELS[+svcId] || 'Other';
  return 'Other';
}

/**
 * Derive zone/floor label from MasterWorkOrderTitle.
 */
export function ppmZone(title) {
  if (!title) return 'Other';
  const t = String(title).toUpperCase();
  if (/B1|B2|CAR\s*PARK|BASEMENT/.test(t))   return 'Car Park / Basement';
  if (/Q\s*GARDEN|GARDEN/.test(t))            return 'Q Garden';
  if (/PERIMETER|EXTERIOR/.test(t))           return 'Perimeter / Exterior';
  const m = t.match(/(\d{1,2})F(?:\s|$|[^A-Z])/);
  if (m) {
    const fl = +m[1];
    return fl <= 5 ? `Floor ${fl}` : fl <= 10 ? 'Floor 6–10' : 'Floor 11+';
  }
  return 'Other / Building-Wide';
}

/**
 * Compute PPM statistics for a set of rows.
 */
export function ppmStats(rows) {
  const total      = rows.length;
  const closed     = rows.filter(r => CLOSED_IDS.has(+r.StatusId)).length;
  const cancelled  = rows.filter(r => +r.StatusId === CANCELLED_ID).length;
  const inProgress = rows.filter(r => +r.StatusId === IN_PROGRESS_ID).length;
  const overdue    = rows.filter(r => +r.StatusId === OVERDUE_ID).length;
  const actionable = closed + overdue + inProgress;

  // Frequency: prefer FrequencyType_Name from enriched CSV, else map ID
  const frequencies = topN(
    rows.map(r => r.FrequencyType_Name || FREQ_LABELS[+r.FrequencyTypeId] || 'Other'),
    6
  );
  const categories = topN(
    rows.map(r => categorizePPM(r.MasterWorkOrderTitle, r.ServiceCategoryId))
  );
  const zones = topN(
    rows.map(r => ppmZone(r.MasterWorkOrderTitle)),
    6
  );

  return {
    total,
    closed,
    cancelled,
    inProgress,
    overdue,
    closedPct:     pctOf(closed, total),
    compliancePct: pctOf(closed, actionable),
    overduePct:    pctOf(overdue, actionable),
    frequencies,
    categories,
    zones,
    // alias so buildComparison() can use the same key as CWO/Case
    events: categories,
  };
}
