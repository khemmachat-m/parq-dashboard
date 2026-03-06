/**
 * Case Management – data processing
 */
import { parseDate } from '../utils/date.js';
import { pctOf, topN } from '../utils/stats.js';

/**
 * Compute Case statistics for a set of rows.
 * Expects enriched CSV columns (EventType_Description, Priority_Name, Location_Name…)
 * Falls back gracefully to raw IDs when enriched columns are absent.
 */
export function caseStats(rows) {
  const total     = rows.length;
  const resolved  = rows.filter(r => +r.StatusId === 7).length;
  const cancelled = rows.filter(r => +r.StatusId === 8).length;
  const active    = rows.filter(r => [4, 5].includes(+r.StatusId)).length;

  let slaPass = 0, slaFail = 0;
  for (const r of rows) {
    const actual = parseDate(r.ActualCompletionDateTime);
    const sla    = parseDate(r.SlatoResolve);
    if (actual && sla) {
      if (actual <= sla) slaPass++; else slaFail++;
    }
  }
  const slaTotal = slaPass + slaFail;

  const priorities = topN(
    rows.map(r => r.Priority_Name || (r.PriorityLevelId ? `Priority ${r.PriorityLevelId}` : 'Unknown')),
    6
  );
  const locations  = topN(rows.map(r => r.Location_Name || r.TopLocation_Name || 'Other'), 6);
  const events     = topN(rows.map(r => r.EventType_Description || r.EventType_Code || 'Other'));

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
  };
}
