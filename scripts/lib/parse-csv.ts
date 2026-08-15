/**
 * Minimal RFC4180-ish CSV parser (quoted fields, embedded commas/quotes/newlines, `""`
 * escaping). No dependency added for one script's needs — `scripts/import-abitgamey-assessments.ts`
 * is the only caller, parsing the local A Bit Gamey export's `posts.csv`.
 */
export function parseCsv(raw: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if (inQuotes) {
      if (char === '"') {
        if (raw[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // swallow, \n handles the row break
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows;
  if (!header) return [];

  return body
    .filter((r) => r.length === header.length && r.some((cell) => cell.length > 0))
    .map((r) => Object.fromEntries(header.map((key, idx) => [key, r[idx] ?? ""])));
}
