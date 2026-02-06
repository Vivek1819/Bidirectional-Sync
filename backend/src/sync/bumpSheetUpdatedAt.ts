import { getSheetsClient } from "../sheets/client";
import { CanonicalRow } from "../types/row";
import { isRowDataEqual } from "./compare";
import { env } from "../config/env";

const UPDATED_AT_COL = "__updated_at";

function columnIndexToLetter(index: number): string {
  let letter = "";
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

export async function bumpSheetUpdatedAtIfNeeded(
  sheetRows: CanonicalRow[],
  dbRows: CanonicalRow[]
) {
  const sheets = getSheetsClient();

  // Read headers to find updated_at column index
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: env.google.sheetId,
    range: "A1:Z1",
  });

  const headers = headerRes.data.values?.[0] || [];
  const updatedAtIndex = headers.indexOf(UPDATED_AT_COL);

  if (updatedAtIndex === -1) return;

  const updatedAtColLetter = columnIndexToLetter(updatedAtIndex);

  const dbMap = new Map<string, CanonicalRow>();
  dbRows.forEach((r) => dbMap.set(r.row_id, r));

  const updates: { range: string; values: string[][] }[] = [];

  sheetRows.forEach((sheetRow, idx) => {
    const dbRow = dbMap.get(sheetRow.row_id);
    if (!dbRow) return;

    if (!isRowDataEqual(sheetRow, dbRow)) {
      const sheetRowIndex = idx + 2; // header is row 1

      updates.push({
        range: `${updatedAtColLetter}${sheetRowIndex}`,
        values: [[Date.now().toString()]],
      });
    }
  });

  for (const u of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.google.sheetId,
      range: u.range,
      valueInputOption: "RAW",
      requestBody: { values: u.values },
    });
  }
}
