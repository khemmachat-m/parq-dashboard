/**
 * Shared date utilities
 */

/**
 * Parse a date string → Date. Returns null on failure.
 * Handles "MM/DD/YYYY HH:MM:SS" (Mozart) and ISO strings.
 */
export function parseDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/** Format a Date as "D Mon YYYY"  e.g. "3 Mar 2026" */
export function fmtDate(d) {
  if (!d) return 'N/A';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Format a Date as "YYYY-MM-DD" for <input type="date"> */
export function toInputDate(d) {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** Parse "YYYY-MM-DD" string → Date at midnight local time */
export function fromInputDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Get all distinct dates in the data, sorted ascending.
 * Used to populate the week picker.
 */
export function getDataDateRange(rows, dateField = 'CreatedOn') {
  const dates = rows.map(r => parseDate(r[dateField])).filter(Boolean);
  if (!dates.length) return null;
  const sorted = dates.sort((a, b) => a - b);
  const minDate = new Date(sorted[0]);   minDate.setHours(0,0,0,0);
  const maxDate = new Date(sorted[sorted.length - 1]); maxDate.setHours(0,0,0,0);
  return { minDate, maxDate };
}

/**
 * Build a list of selectable week options from the data.
 * Each option = one 7-day window (Monday → Sunday preferred, but
 * we keep it simple: each window ends on maxDate, maxDate-7, maxDate-14 …
 * going back as far as the data allows for at least 1 row in that window).
 *
 * Returns Array<{ lwEnd: Date, lwStart: Date, pwEnd: Date, pwStart: Date, label: string }>
 * Sorted newest → oldest, max 12 options.
 */
export function getAvailableWeeks(rows, dateField = 'CreatedOn') {
  const range = getDataDateRange(rows, dateField);
  if (!range) return [];

  const { minDate, maxDate } = range;
  const weeks = [];

  let lwEnd = new Date(maxDate);
  while (weeks.length < 12) {
    const lwStart = new Date(lwEnd); lwStart.setDate(lwEnd.getDate() - 6);
    const pwEnd   = new Date(lwStart); pwEnd.setDate(lwStart.getDate() - 1);
    const pwStart = new Date(pwEnd); pwStart.setDate(pwEnd.getDate() - 6);

    // Only include if lwStart is within (or close to) the data range
    if (lwEnd < minDate) break;

    weeks.push({
      lwEnd:   new Date(lwEnd),
      lwStart: new Date(lwStart),
      pwEnd:   new Date(pwEnd),
      pwStart: new Date(pwStart),
      label:   `${fmtDate(lwStart)} – ${fmtDate(lwEnd)}`,
      value:   toInputDate(lwEnd),
    });

    lwEnd = new Date(lwStart); lwEnd.setDate(lwStart.getDate() - 1);
  }

  return weeks;
}

/**
 * Build week bounds from a chosen lwEnd date (from the picker).
 * Falls back to auto-detect from data if no date given.
 */
export function getWeekBounds(rows, dateField = 'CreatedOn', chosenLwEnd = null) {
  let lwEnd;

  if (chosenLwEnd) {
    lwEnd = new Date(chosenLwEnd);
    lwEnd.setHours(0, 0, 0, 0);
  } else {
    const dates = rows.map(r => parseDate(r[dateField])).filter(Boolean);
    if (!dates.length) return null;
    const maxTs = Math.max(...dates.map(d => d.getTime()));
    lwEnd = new Date(maxTs);
    lwEnd.setHours(0, 0, 0, 0);
  }

  const lwStart = new Date(lwEnd); lwStart.setDate(lwEnd.getDate() - 6);
  const pwEnd   = new Date(lwStart); pwEnd.setDate(lwStart.getDate() - 1);
  const pwStart = new Date(pwEnd);  pwStart.setDate(pwEnd.getDate() - 6);

  return { lwStart, lwEnd, pwStart, pwEnd, reportDate: lwEnd };
}

/**
 * Filter rows to a date window (inclusive, to end-of-day).
 */
export function sliceWeek(rows, start, end, dateField = 'CreatedOn') {
  const endMax = new Date(end);
  endMax.setHours(23, 59, 59, 999);
  return rows.filter(r => {
    const d = parseDate(r[dateField]);
    return d && d >= start && d <= endMax;
  });
}
