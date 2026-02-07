import { getSheetsClient } from "../sheets/client";
import { env } from "../config/env";
import { sheets_v4 } from "googleapis";

const DELETED_AT_COL = "__deleted_at";

export async function hideDeletedRowsInSheet() {
    const sheets = getSheetsClient();

    // 1. Read sheet
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: env.google.sheetId,
        range: "A1:Z1000",
    });

    const values = res.data.values || [];
    if (values.length < 2) return;

    const headers = values[0];
    const rows = values.slice(1);

    const deletedAtIndex = headers.indexOf(DELETED_AT_COL);
    if (deletedAtIndex === -1) return;

    // 2. Get sheetId
    const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId: env.google.sheetId,
    });

    const sheetId = sheetInfo.data.sheets?.[0]?.properties?.sheetId;
    if (sheetId == null) return;

    const requests: sheets_v4.Schema$Request[] = [];

    rows.forEach((row, idx) => {
        if (row[deletedAtIndex]) {
            requests.push({
                updateDimensionProperties: {
                    range: {
                        sheetId,
                        dimension: "ROWS",
                        startIndex: idx + 1, // +1 for header
                        endIndex: idx + 2,
                    },
                    properties: { hiddenByUser: true },
                    fields: "hiddenByUser",
                },
            });
        }
    });

    if (requests.length === 0) return;

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: env.google.sheetId,
        requestBody: { requests },
    });
}
