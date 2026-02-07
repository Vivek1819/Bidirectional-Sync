import { CanonicalRow } from "../types/row";
import { getSheetsClient } from "../sheets/client";
import { env } from "../config/env";

const ROW_ID_COL = "__row_id";
const DELETED_AT_COL = "__deleted_at";

function columnIndexToLetter(index: number): string {
  let letter = "";
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

export async function applyDbDeletesToSheet(dbRows: CanonicalRow[]) {
  const sheets = getSheetsClient();

  // 1. Read FULL RAW SHEET (authoritative for row positions)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: env.google.sheetId,
    range: "A1:Z1000",
  });

  const values = res.data.values || [];
  if (values.length === 0) return;

  const headers = values[0];
  const rows = values.slice(1);

  const rowIdIndex = headers.indexOf(ROW_ID_COL);
  const deletedAtIndex = headers.indexOf(DELETED_AT_COL);

  if (rowIdIndex === -1 || deletedAtIndex === -1) return;

  const deletedAtColLetter = columnIndexToLetter(deletedAtIndex);

  // 2. DB lookup
  const dbMap = new Map(dbRows.map(r => [r.row_id, r]));

  const updates: { range: string; values: string[][] }[] = [];

  // 3. Scan PHYSICAL sheet rows
  rows.forEach((row, physicalIdx) => {
    const rowId = row[rowIdIndex];
    if (!rowId) return;

    const dbRow = dbMap.get(rowId);
    if (!dbRow?.deleted_at) return;

    const currentSheetDeletedAt = row[deletedAtIndex];

    if (
      !currentSheetDeletedAt ||
      Number(currentSheetDeletedAt) < dbRow.deleted_at
    ) {
      const sheetRowNumber = physicalIdx + 2; // ✅ CORRECT

      updates.push({
        range: `${deletedAtColLetter}${sheetRowNumber}`,
        values: [[dbRow.deleted_at.toString()]],
      });
    }
  });

  // 4. Apply updates
  for (const u of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.google.sheetId,
      range: u.range,
      valueInputOption: "RAW",
      requestBody: { values: u.values },
    });
  }
}
