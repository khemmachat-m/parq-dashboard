/**
 * enrichCWO.js — CWO enrichment
 *
 * Joins performed:
 *   PriorityId    → Priority_Name, Priority_ColorCode          (Priorities)
 *   LocationId    → Location_Name, Location_FullName, …        (Locations)
 *   TopLocationId → TopLocation_Name, TopLocation_Code         (Locations)
 *   AssetId       → Asset_Name, Asset_EquipmentTag             (Assets)
 *   ProblemTypeId → ProblemType_Code, ProblemType_Description  (Problem Types / Event Types CSV)
 */
import { lookup } from './masterData.js';

export function enrichCWO(rows, masters) {
  const { priority, location, asset, problemType } = masters;

  return rows.map(row => {
    const out = { ...row };

    // ── Priority ───────────────────────────────────────────────────────────
    const prio = lookup(priority, row.PriorityId);
    if (prio.Name)            out.Priority_Name       = prio.Name;
    if (prio.ColorCode)       out.Priority_ColorCode  = prio.ColorCode;
    if (prio.IsCritical != null) out.Priority_IsCritical = prio.IsCritical;

    // ── Location ───────────────────────────────────────────────────────────
    const loc = lookup(location, row.LocationId);
    if (loc.Name)             out.Location_Name           = loc.Name;
    if (loc.FullName)         out.Location_FullName        = loc.FullName;
    if (loc.LocationCode)     out.Location_LocationCode    = loc.LocationCode;
    if (loc.FloorNo)          out.Location_FloorNo         = loc.FloorNo;
    if (loc.LocationTypeId)   out.Location_LocationTypeId  = loc.LocationTypeId;

    // ── Top Location ───────────────────────────────────────────────────────
    const top = lookup(location, row.TopLocationId);
    if (top.Name)             out.TopLocation_Name     = top.Name;
    if (top.FullName)         out.TopLocation_FullName = top.FullName;
    if (top.LocationCode)     out.TopLocation_Code     = top.LocationCode;

    // ── Asset ──────────────────────────────────────────────────────────────
    const aRow = lookup(asset, row.AssetId);
    if (aRow.Name)            out.Asset_Name         = aRow.Name;
    if (aRow.EquipmentTag)    out.Asset_EquipmentTag = aRow.EquipmentTag;

    // ── Problem Type (via Problem Types / Event Types table) ───────────────
    const pt = lookup(problemType, row.ProblemTypeId);
    if (pt.Code)              out.ProblemType_Code        = pt.Code;
    if (pt.Description)       out.ProblemType_Description = pt.Description;

    return out;
  });
}
