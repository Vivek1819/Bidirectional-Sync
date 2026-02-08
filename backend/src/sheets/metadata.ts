import { getSheetsClient } from "./client";
import { env } from "../config/env";

const METADATA_COLUMNS = [
  "__row_id",
  "__updated_at",
  "__deleted_at",
];

// Modified to accept DB columns for Schema Sync
export async function ensureMetadataColumns(dbColumns: string[] = []) {
  const sheets = getSheetsClient();

  // 1. Read header
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: env.google.sheetId,
    range: "A1:Z1",
  });

  const headers = headerRes.data.values?.[0] ?? [];
  let newHeaders = [...headers];

  // 2. Ensure DB Columns exist in Sheet
  for (const col of dbColumns) {
    if (!newHeaders.includes(col)) {
      newHeaders.push(col);
    }
  }

  // 3. Ensure Metadata Columns exist
  for (const col of METADATA_COLUMNS) {
    if (!newHeaders.includes(col)) {
      newHeaders.push(col);
    }
  }

  // 4. Update header if needed
  if (newHeaders.length !== headers.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.google.sheetId,
      range: "A1",
      valueInputOption: "RAW",
      requestBody: { values: [newHeaders] },
    });
    console.log("[Schema Sync] Updated Sheet Headers:", newHeaders);
  }

  // 5. Ensure deleted_at column has data (fill with empty strings if new)
  if (newHeaders.length > headers.length) {
    const deletedAtIndex = newHeaders.indexOf("__deleted_at");
    if (deletedAtIndex !== -1 && !headers.includes("__deleted_at")) {
      // ... (filling logic)
    }
  }

  // 6. Hide Metadata Columns
  // We need the sheetId (GID) to hide columns
  const metadataIndices = METADATA_COLUMNS
    .map(col => newHeaders.indexOf(col))
    .filter(idx => idx !== -1);

  if (metadataIndices.length > 0) {
    try {
      const sheetMeta = await sheets.spreadsheets.get({
        spreadsheetId: env.google.sheetId,
      });
      const sheetId = sheetMeta.data.sheets?.[0].properties?.sheetId ?? 0;

      const requests = metadataIndices.map(idx => ({
        updateDimensionProperties: {
          range: {
            sheetId: sheetId,
            dimension: "COLUMNS",
            startIndex: idx,
            endIndex: idx + 1,
          },
          properties: {
            hiddenByUser: true,
          },
          fields: "hiddenByUser",
        },
      }));

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: env.google.sheetId,
        requestBody: { requests },
      });
      console.log("[Schema Sync] Hidden Metadata Columns");
    } catch (err) {
      console.error("Failed to hide metadata columns", err);
    }
  }
}
