/**
 * enrichCases.js — Case Management enrichment
 *
 * Joins performed:
 *   PriorityLevelId  → Priority_Name, Priority_ColorCode       (Priorities)
 *   LocationId       → Location_Name, Location_FullName, …     (Locations)
 *   TopLocationId    → TopLocation_Name, TopLocation_Code      (Locations)
 *   AssetId          → Asset_Name, Asset_EquipmentTag          (Assets)
 *   EventTypeId      → EventType_Code, EventType_Description   (Event Types)
 *   EventSubTypeId   → EventSubType_Code, EventSubType_Desc    (Event Types)
 */
import { lookup } from './masterData.js';

export function enrichCases(rows, masters) {
  const { priority, location, asset, eventType } = masters;

  return rows.map(row => {
    const out = { ...row };

    // ── Priority ───────────────────────────────────────────────────────────
    const prio = lookup(priority, row.PriorityLevelId);
    if (prio.Name)            out.Priority_Name      = prio.Name;
    if (prio.ColorCode)       out.Priority_ColorCode = prio.ColorCode;

    // ── Location ───────────────────────────────────────────────────────────
    const loc = lookup(location, row.LocationId);
    if (loc.Name)             out.Location_Name        = loc.Name;
    if (loc.FullName)         out.Location_FullName     = loc.FullName;
    if (loc.LocationCode)     out.Location_LocationCode = loc.LocationCode;
    if (loc.FloorNo)          out.Location_FloorNo      = loc.FloorNo;

    // ── Top Location ───────────────────────────────────────────────────────
    const top = lookup(location, row.TopLocationId);
    if (top.Name)             out.TopLocation_Name     = top.Name;
    if (top.FullName)         out.TopLocation_FullName = top.FullName;
    if (top.LocationCode)     out.TopLocation_Code     = top.LocationCode;

    // ── Asset ──────────────────────────────────────────────────────────────
    const aRow = lookup(asset, row.AssetId);
    if (aRow.Name)            out.Asset_Name         = aRow.Name;
    if (aRow.EquipmentTag)    out.Asset_EquipmentTag = aRow.EquipmentTag;

    // ── Event Type ─────────────────────────────────────────────────────────
    const et = lookup(eventType, row.EventTypeId);
    if (et.Code)              out.EventType_Code        = et.Code;
    if (et.Description)       out.EventType_Description = et.Description;

    // ── Event Sub Type ─────────────────────────────────────────────────────
    const sub = lookup(eventType, row.EventSubTypeId);
    if (sub.Code)             out.EventSubType_Code        = sub.Code;
    if (sub.Description)      out.EventSubType_Description = sub.Description;

    return out;
  });
}
