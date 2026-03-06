/**
 * masterData.js
 * Builds fast ID→row lookup maps from Mozart master-data CSV rows.
 */

export function buildLookup(rows, idCol = 'Id') {
  const map = {};
  for (const row of rows) {
    const raw = row[idCol];
    if (raw == null || raw === '') continue;
    map[String(raw).trim()] = row;
  }
  return map;
}

/**
 * Build all lookup maps from raw master row arrays.
 *
 * Master file → raws key → used by
 * ─────────────────────────────────────────────────────────────
 * Priorities         priorityRows        CWO, Case, PPM
 * Locations          locationRows        CWO, Case, PPM
 * Assets             assetRows           CWO, Case, PPM
 * Problem Types *    problemTypeRows     CWO  (ProblemTypeId → Event Types CSV)
 * Event Types        eventTypeRows       Case (EventTypeId / EventSubTypeId)
 * Service Categories serviceCategoryRows PPM
 * Frequency Types    frequencyTypeRows   PPM
 *
 * * Problem Types: upload the same MZ_PARQ_Event Types*.csv — Mozart stores
 *   problem type definitions in the Event Types table, referenced by ProblemTypeId.
 */
export function buildMasters(raws) {
  return {
    priority:        buildLookup(raws.priorityRows        || []),
    location:        buildLookup(raws.locationRows        || []),
    asset:           buildLookup(raws.assetRows           || []),
    problemType:     buildLookup(raws.problemTypeRows     || []),
    eventType:       buildLookup(raws.eventTypeRows       || []),
    serviceCategory: buildLookup(raws.serviceCategoryRows || []),
    frequencyType:   buildLookup(raws.frequencyTypeRows   || []),
  };
}

/** Safe lookup — returns {} if key not found */
export function lookup(map, id) {
  if (!map || id == null || id === '') return {};
  return map[String(id).trim()] || {};
}
