/**
 * masterData.js
 * Builds fast lookup maps from Mozart master-data CSV rows.
 */

/**
 * Build an Id-keyed lookup map  { "123": { Id, Name, … }, … }
 * @param {Object[]} rows   Parsed CSV rows
 * @param {string}   idCol  Column to use as key (default "Id")
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
 * Build a case-insensitive EquipmentTag-keyed lookup map for Assets.
 * Used by enrichCases (Cases has no AssetId — only EquipmentTag).
 * @param {Object[]} assetRows  Parsed rows from Assets.csv
 * @returns {Object}  { "ct033-02": { Id, Name, Description, … }, … }
 */
export function buildAssetByTagMap(assetRows) {
  const map = {};
  for (const row of assetRows) {
    const tag = (row.EquipmentTag || '').trim();
    if (tag) {
      map[tag.toLowerCase()] = row;
    }
  }
  return map;
}

/** Safe lookup — returns {} if key missing or map undefined */
export function lookup(map, id) {
  if (!map || id == null || id === '') return {};
  return map[String(id).trim()] || {};
}

/**
 * Build all master lookup maps from raw CSV row arrays.
 * Pass the result object into enrichCWO / enrichCases / enrichPPM.
 */
export function buildMasters(raws) {
  return {
    priority:        buildLookup(raws.priorityRows        || []),
    location:        buildLookup(raws.locationRows        || []),
    asset:           buildLookup(raws.assetRows           || []),  // Id-keyed  (CWO / PPM)
    assetByTag:      buildAssetByTagMap(raws.assetRows    || []),  // EquipmentTag-keyed (Cases)
    eventType:       buildLookup(raws.eventTypeRows       || []),
    problemType:     buildLookup(raws.problemTypeRows     || []),
    serviceCategory: buildLookup(raws.serviceCategoryRows || []),
    frequencyType:   buildLookup(raws.frequencyTypeRows   || []),
  };
}
