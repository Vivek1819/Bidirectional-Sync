import { getSheetsClient } from "./client";
import { env } from "../config/env";

const METADATA_COLUMNS = [
  "__row_id",
  "__updated_at",
  "__deleted_at",
];

export async function ensureMetadataColumns() {
  const sheets = getSheetsClient();

  // 1. Read header
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: env.google.sheetId,
    range: "A1:Z1",
  });

  const headers = headerRes.data.values?.[0] ?? [];
  let newHeaders = [...headers];

  for (const col of METADATA_COLUMNS) {
    if (!newHeaders.includes(col)) {
      newHeaders.push(col);
    }
  }

  // 2. Update header if needed
  if (newHeaders.length !== headers.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.google.sheetId,
      range: "A1",
      valueInputOption: "RAW",
      requestBody: { values: [newHeaders] },
    });
  }

  // 3. 🔥 FORCE MATERIALIZATION OF deleted_at COLUMN
  const deletedAtIndex = newHeaders.indexOf("__deleted_at");
  if (deletedAtIndex === -1) return;

  const colLetter = String.fromCharCode(65 + deletedAtIndex);

  // Fill first 1000 rows with empty string
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.google.sheetId,
    range: `${colLetter}2:${colLetter}1000`,
    valueInputOption: "RAW",
    requestBody: {
      values: Array.from({ length: 999 }, () => [""]),
    },
  });
}
