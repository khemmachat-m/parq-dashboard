/**
 * enrichCases.js — Case Management enrichment
 *
 * Joins performed:
 *   PriorityLevelId  → Priority_Name, Priority_ColorCode            (Priorities)
 *   LocationId       → Location_Name, Location_FullName,
 *                      Location_LocationCode, Location_FloorNo      (Locations)
 *   EquipmentTag     → Asset_Name, Asset_Description,
 *                      Asset_Manufacturer, Asset_Model,
 *                      Asset_OperationalStatus                       (Assets)
 *   EventTypeId      → EventType_Code, EventType_Description        (Event Types)
 *
 * NOTE: Cases has NO AssetId or TopLocationId field —
 *       asset lookup is done via EquipmentTag (case-insensitive).
 *       EventSubTypeId is present in the schema but always empty in
 *       current exports, so no sub-type join is performed.
 */
import { lookup } from './masterData.js';

/**
 * Build a case-insensitive EquipmentTag → asset-row lookup map.
 * Call this once when building masters, then pass into enrichCases.
 *
 * @param {Object[]} assetRows  Parsed rows from Assets.csv
 * @returns {Object}  { "ct033-02": { Name, Description, … }, … }
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

/**
 * Enrich an array of parsed Case rows.
 *
 * @param {Object[]} rows     Parsed rows from MZ_PARQ_Cases_*.csv
 * @param {Object}   masters  Must include:
 *   .priority        – Id-keyed map from Priorities.csv
 *   .location        – Id-keyed map from Locations.csv
 *   .assetByTag      – EquipmentTag-keyed map (use buildAssetByTagMap)
 *   .eventType       – Id-keyed map from Event_Types.csv
 */
export function enrichCases(rows, masters) {
  const { priority, location, assetByTag, eventType } = masters;

  return rows.map(row => {
    const out = { ...row };

    // ── Priority ───────────────────────────────────────────────────────────
    // Key: PriorityLevelId (integer string, e.g. "3")
    const prio = lookup(priority, row.PriorityLevelId);
    if (prio.Name)      out.Priority_Name       = prio.Name;
    if (prio.ColorCode) out.Priority_ColorCode  = prio.ColorCode;

    // ── Location ───────────────────────────────────────────────────────────
    // Key: LocationId (integer string, e.g. "303")
    // Cases already carries LocationCode and LocationName from Mozart,
    // but the master adds FloorNo which is not in the raw export.
    const loc = lookup(location, row.LocationId);
    if (loc.Name)         out.Location_Name         = loc.Name;
    if (loc.FullName)     out.Location_FullName      = loc.FullName;
    if (loc.LocationCode) out.Location_LocationCode  = loc.LocationCode;
    if (loc.FloorNo)      out.Location_FloorNo       = loc.FloorNo;

    // ── Asset (via EquipmentTag — case-insensitive) ────────────────────────
    // Cases has NO AssetId. The only asset identifier is EquipmentTag.
    // Match is case-insensitive to handle inconsistent casing in exports
    // (e.g. "DP-13N14" in Cases vs "dp-13n14" in Assets).
    const tagKey = (row.EquipmentTag || '').trim().toLowerCase();
    const aRow   = (assetByTag && tagKey) ? (assetByTag[tagKey] || {}) : {};
    if (aRow.Name)              out.Asset_Name              = aRow.Name;
    if (aRow.Description)       out.Asset_Description       = aRow.Description;
    if (aRow.Manufacturer)      out.Asset_Manufacturer      = aRow.Manufacturer;
    if (aRow.Model)             out.Asset_Model             = aRow.Model;
    if (aRow.OperationalStatus) out.Asset_OperationalStatus = aRow.OperationalStatus;

    // ── Event Type ─────────────────────────────────────────────────────────
    // Key: EventTypeId (integer string, e.g. "59")
    const et = lookup(eventType, row.EventTypeId);
    if (et.Code)        out.EventType_Code        = et.Code;
    if (et.Description) out.EventType_Description = et.Description;

    // EventSubTypeId column exists in the Mozart schema but is empty in all
    // current exports — no join performed.

    return out;
  });
}
