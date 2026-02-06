import { sheets_v4 } from "googleapis";
import { getSheetsClient } from "./client";
import { env } from "../config/env";

const METADATA_HEADERS = ["__row_id", "__updated_at"];

export async function hideMetadataColumns() {
    const sheets = getSheetsClient();

    // 1. Get sheet info (needed for sheetId)
    const sheetRes = await sheets.spreadsheets.get({
        spreadsheetId: env.google.sheetId,
    });

    const sheet = sheetRes.data.sheets?.[0];
    if (!sheet || sheet.properties?.sheetId == null) return;

    const sheetId = sheet.properties.sheetId;

    // 2. Read header row
    const headerRes = await sheets.spreadsheets.values.get({
        spreadsheetId: env.google.sheetId,
        range: "A1:Z1",
    });

    const headers = headerRes.data.values?.[0] || [];

    const requests: sheets_v4.Schema$Request[] = [];

    headers.forEach((header, index) => {
        if (METADATA_HEADERS.includes(header)) {
            requests.push({
                updateDimensionProperties: {
                    range: {
                        sheetId,
                        dimension: "COLUMNS",
                        startIndex: index,
                        endIndex: index + 1,
                    },
                    properties: {
                        hiddenByUser: true,
                    },
                    fields: "hiddenByUser",
                },
            });
        }
    });

    if (requests.length === 0) return;

    // 3. Batch update to hide columns
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: env.google.sheetId,
        requestBody: {
            requests,
        },
    });
}
