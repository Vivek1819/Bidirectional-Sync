import { CanonicalRow } from "../types/row";
import { getSheetsClient } from "../sheets/client";
import { env } from "../config/env";

export async function applyDbInsertToSheet(rows: CanonicalRow[]) {
  if (rows.length === 0) return;

  const sheets = getSheetsClient();

  // Read headers
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: env.google.sheetId,
    range: "A1:Z1",
  });

  const headers = headerRes.data.values?.[0] || [];
  const rowIdIndex = headers.indexOf("__row_id");
  const updatedAtIndex = headers.indexOf("__updated_at");

  if (rowIdIndex === -1 || updatedAtIndex === -1) return;

  const values = rows.map((row) => {
    const newRow: string[] = [];

    headers.forEach((header, idx) => {
      if (header === "__row_id") {
        newRow[idx] = row.row_id;
      } else if (header === "__updated_at") {
        newRow[idx] = row.updated_at.toString();
      } else {
        newRow[idx] = row.data[header] ?? "";
      }
    });

    return newRow;
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.google.sheetId,
    range: "A2",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
}
