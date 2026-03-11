/**
 * enrichCases.js — Case Management enrichment
 *
 * Joins performed:
 *   PriorityLevelId  → Priority_Name, Priority_ColorCode              (Priorities)
 *   LocationId       → Location_Name, Location_FullName,
 *                      Location_LocationCode, Location_FloorNo        (Locations)
 *   EquipmentTag     → Asset_Id, Asset_Name, Asset_Description,
 *                      Asset_Manufacturer, Asset_Model,
 *                      Asset_SerialNumber, Asset_AssetCategoryId,
 *                      Asset_LocationId                               (Assets)
 *   EventTypeId      → EventType_Code, EventType_Description          (Event Types)
 *
 * NOTE:
 *   - Cases has NO AssetId field. Asset lookup uses EquipmentTag (case-insensitive).
 *   - Cases has NO TopLocationId field. No top-location join is performed.
 *   - EventSubTypeId exists in the schema but is always empty — no sub-type join.
 */
import { lookup } from './masterData.js';

/**
 * Enrich an array of parsed Case rows.
 *
 * @param {Object[]} rows     Parsed rows from MZ_PARQ_Cases_*.csv
 * @param {Object}   masters  Must include:
 *   .priority    – Id-keyed map from Priorities.csv
 *   .location    – Id-keyed map from Locations.csv
 *   .assetByTag  – EquipmentTag-keyed map (built by buildAssetByTagMap in masterData.js)
 *   .eventType   – Id-keyed map from Event_Types.csv
 */
export function enrichCases(rows, masters) {
  const { priority, location, assetByTag, eventType } = masters;

  return rows.map(row => {
    const out = { ...row };

    // ── Priority ───────────────────────────────────────────────────────────
    const prio = lookup(priority, row.PriorityLevelId);
    if (prio.Name)      out.Priority_Name      = prio.Name;
    if (prio.ColorCode) out.Priority_ColorCode = prio.ColorCode;

    // ── Location ───────────────────────────────────────────────────────────
    const loc = lookup(location, row.LocationId);
    if (loc.Name)         out.Location_Name         = loc.Name;
    if (loc.FullName)     out.Location_FullName      = loc.FullName;
    if (loc.LocationCode) out.Location_LocationCode  = loc.LocationCode;
    if (loc.FloorNo)      out.Location_FloorNo       = loc.FloorNo;

    // ── Asset (via EquipmentTag — case-insensitive) ────────────────────────
    const tagKey = (row.EquipmentTag || '').trim().toLowerCase();
    const aRow   = (assetByTag && tagKey) ? (assetByTag[tagKey] || {}) : {};
    if (aRow.Id)              out.Asset_Id              = aRow.Id;
    if (aRow.Name)            out.Asset_Name            = aRow.Name;
    if (aRow.Description)     out.Asset_Description     = aRow.Description;
    if (aRow.Manufacturer)    out.Asset_Manufacturer    = aRow.Manufacturer;
    if (aRow.Model)           out.Asset_Model           = aRow.Model;
    if (aRow.SerialNumber)    out.Asset_SerialNumber    = aRow.SerialNumber;
    if (aRow.AssetCategoryId) out.Asset_AssetCategoryId = aRow.AssetCategoryId;
    if (aRow.LocationId)      out.Asset_LocationId      = aRow.LocationId;

    // ── Event Type ─────────────────────────────────────────────────────────
    const et = lookup(eventType, row.EventTypeId);
    if (et.Code)        out.EventType_Code        = et.Code;
    if (et.Description) out.EventType_Description = et.Description;

    return out;
  });
}
