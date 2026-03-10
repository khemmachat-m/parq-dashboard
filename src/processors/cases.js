/**
 * Case Management – data processing
 *
 * Mozart StatusCode values (from export):
 *   '1'   = New / Active (no ResolvedOn)
 *   '2'   = Acknowledged
 *   '4'   = Resolved (ResolvedOn is populated)
 *   '101' = Cancelled
 *
 * SLA fields (from export):
 *   SLAFailed = 'True' → SLA breached
 *   SLAFailed = ''     → check SLADate + ResolvedOn to confirm pass
 */
import { parseDate } from '../utils/date.js';
import { pctOf, topN } from '../utils/stats.js';

export function caseStats(rows) {
  const total     = rows.length;
  const resolved  = rows.filter(r => r.StatusCode === '4').length;
  const cancelled = rows.filter(r => r.StatusCode === '101').length;
  const active    = rows.filter(r => ['1', '2'].includes(r.StatusCode)).length;

  let slaPass = 0, slaFail = 0;
  for (const r of rows) {
    if (r.SLAFailed === 'True') {
      slaFail++;
    } else if (r.ResolvedOn?.trim() && r.SLADate?.trim()) {
      // Resolved before SLA date = pass
      slaPass++;
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
