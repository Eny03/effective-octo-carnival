/**
 * Date & Timezone utilities for PoliticLens
 * Ensures all timestamps (UTC or local) are parsed accurately and
 * formatted strictly in Italian local time (Europe/Rome - CET/CEST).
 */

export function parseUtcDate(dateStr: string | Date | null | undefined): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;

  let s = String(dateStr).trim();
  // If naive ISO string like "2026-10-23T18:31:29" without Z or offset, append Z
  if (!s.endsWith("Z") && !s.includes("+") && !/[0-9]-[0-9]{2}:[0-9]{2}$/.test(s)) {
    s = s + "Z";
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function formatItalianDateTime(
  dateStr: string | Date | null | undefined,
  includeTime: boolean = true
): string {
  const d = parseUtcDate(dateStr);
  if (!d) return "Data non specificata";

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "short",
    year: "numeric"
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return d.toLocaleString("it-IT", options);
}

export function formatItalianLongDate(dateStr: string | Date | null | undefined): string {
  const d = parseUtcDate(dateStr);
  if (!d) return "Data non specificata";

  return d.toLocaleDateString("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
