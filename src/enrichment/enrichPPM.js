/**
 * enrichPPM.js — PPM Work Orders enrichment
 *
 * Joins performed:
 *   PriorityId        → Priority_Name, Priority_ColorCode       (Priorities)
 *   LocationId        → Location_Name, Location_FullName, …     (Locations)
 *   TopLocationId     → TopLocation_Name, TopLocation_Code      (Locations)
 *   AssetId           → Asset_Name, Asset_EquipmentTag          (Assets)
 *   ServiceCategoryId → ServiceCategory_Name, ServiceCategory_Code (Service Categories)
 *   FrequencyTypeId   → FrequencyType_Name, FrequencyType_Code     (Frequency Types)
 *   StatusId          → Status_Label  (derived, no master file needed)
 */
import { lookup } from './masterData.js';

const PPM_STATUS_MAP = {
  1: 'Scheduled',
  2: 'In Progress',
  3: 'Overdue',
  4: 'Completed',
  5: 'Cancelled',
  7: 'Closed',
  8: 'Cancelled',
};

export function enrichPPM(rows, masters) {
  const { priority, location, asset, serviceCategory, frequencyType } = masters;

  return rows.map(row => {
    const out = { ...row };

    // ── Priority ───────────────────────────────────────────────────────────
    const prio = lookup(priority, row.PriorityId);
    if (prio.Name)            out.Priority_Name      = prio.Name;
    if (prio.ColorCode)       out.Priority_ColorCode = prio.ColorCode;

    // ── Location ───────────────────────────────────────────────────────────
    const loc = lookup(location, row.LocationId);
    if (loc.Name)             out.Location_Name          = loc.Name;
    if (loc.FullName)         out.Location_FullName       = loc.FullName;
    if (loc.LocationCode)     out.Location_LocationCode   = loc.LocationCode;
    if (loc.FloorNo)          out.Location_FloorNo        = loc.FloorNo;
    if (loc.ParentLocationId) out.Location_ParentLocationId = loc.ParentLocationId;
    if (loc.TopLocationId)    out.Location_TopLocationId  = loc.TopLocationId;
    if (loc.LocationTypeId)   out.Location_LocationTypeId = loc.LocationTypeId;

    // ── Top Location ───────────────────────────────────────────────────────
    const top = lookup(location, row.TopLocationId);
    if (top.Name)             out.TopLocation_Name     = top.Name;
    if (top.FullName)         out.TopLocation_FullName = top.FullName;
    if (top.LocationCode)     out.TopLocation_Code     = top.LocationCode;

    // ── Asset ──────────────────────────────────────────────────────────────
    const aRow = lookup(asset, row.AssetId);
    if (aRow.Name)            out.Asset_Name         = aRow.Name;
    if (aRow.EquipmentTag)    out.Asset_EquipmentTag = aRow.EquipmentTag;

    // ── Service Category (optional) ────────────────────────────────────────
    const svc = lookup(serviceCategory, row.ServiceCategoryId);
    if (svc.Name)             out.ServiceCategory_Name = svc.Name;
    if (svc.Code)             out.ServiceCategory_Code = svc.Code;

    // ── Frequency Type (optional) ──────────────────────────────────────────
    const freq = lookup(frequencyType, row.FrequencyTypeId);
    if (freq.Name)            out.FrequencyType_Name = freq.Name;
    if (freq.Code)            out.FrequencyType_Code = freq.Code;

    // ── Status Label (derived) ─────────────────────────────────────────────
    out.Status_Label = PPM_STATUS_MAP[+row.StatusId] || 'Unknown';

    return out;
  });
}
