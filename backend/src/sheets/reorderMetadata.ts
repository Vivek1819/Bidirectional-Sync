import { sheets_v4 } from "googleapis";
import { getSheetsClient } from "./client";
import { env } from "../config/env";

const META = ["__row_id", "__updated_at"];

let reordered = false;

export async function reorderMetadataColumns() {
  if (reordered) return;

  const sheets = getSheetsClient();

  // 1. Get sheetId
  const sheetRes = await sheets.spreadsheets.get({
    spreadsheetId: env.google.sheetId,
  });

  const sheet = sheetRes.data.sheets?.[0];
  if (!sheet?.properties?.sheetId) return;

  const sheetId = sheet.properties.sheetId;

  // 2. Read headers
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: env.google.sheetId,
    range: "A1:Z1",
  });

  const headers = headerRes.data.values?.[0] || [];

  const rowIdIndex = headers.indexOf("__row_id");
  const updatedAtIndex = headers.indexOf("__updated_at");

  // If metadata missing, do nothing (it'll be created first)
  if (rowIdIndex === -1 || updatedAtIndex === -1) return;

  // Already correct
  if (rowIdIndex === 0 && updatedAtIndex === 1) {
    reordered = true;
    return;
  }

  const requests: sheets_v4.Schema$Request[] = [];

  /**
   * Move __row_id to column 0
   * Then move __updated_at to column 1
   *
   * IMPORTANT:
   * After first move, indexes may shift.
   * We re-calc carefully.
   */

  // Move __row_id → index 0
  requests.push({
    moveDimension: {
      source: {
        sheetId,
        dimension: "COLUMNS",
        startIndex: rowIdIndex,
        endIndex: rowIdIndex + 1,
      },
      destinationIndex: 0,
    },
  });

  // After moving row_id, updated_at index might shift
  const adjustedUpdatedAtIndex =
    updatedAtIndex < rowIdIndex ? updatedAtIndex + 1 : updatedAtIndex;

  // Move __updated_at → index 1
  requests.push({
    moveDimension: {
      source: {
        sheetId,
        dimension: "COLUMNS",
        startIndex: adjustedUpdatedAtIndex,
        endIndex: adjustedUpdatedAtIndex + 1,
      },
      destinationIndex: 1,
    },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: env.google.sheetId,
    requestBody: { requests },
  });

  reordered = true;
}
