/* Small RFC-4180-ish CSV parser: quoted fields, escaped quotes (""), commas
   and newlines inside quotes, CRLF/LF/CR line endings, BOM, and auto-detected
   delimiter (comma, semicolon or tab — Excel in some locales uses ;). */

export function detectDelimiter(text: string): string {
  const firstLine = text.replace(/^﻿/, "").split(/\r\n|\n|\r/, 1)[0] ?? "";
  const counts = [",", ";", "\t"].map((d) => {
    let n = 0, q = false;
    for (const ch of firstLine) { if (ch === '"') q = !q; else if (!q && ch === d) n++; }
    return [d, n] as const;
  });
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0]![1] > 0 ? counts[0]![0] : ",";
}

export function parseCsv(input: string, delimiter = detectDelimiter(input)): string[][] {
  const text = input.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"' && field.trim() === "") { inQuotes = true; field = ""; i++; continue; }
    if (ch === delimiter) { row.push(field); field = ""; i++; continue; }
    if (ch === "\r" || ch === "\n") {
      row.push(field); field = "";
      rows.push(row); row = [];
      i += ch === "\r" && text[i + 1] === "\n" ? 2 : 1;
      continue;
    }
    field += ch; i++;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  // Trim cells and drop fully empty lines.
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some((c) => c !== ""));
}

export function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((r) => r.map((c) => { const s = String(c); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(","))
    .join("\r\n");
}
