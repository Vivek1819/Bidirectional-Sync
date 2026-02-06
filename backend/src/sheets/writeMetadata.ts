import { getSheetsClient } from "./client";
import { env } from "../config/env";
import crypto from "crypto";

const ROW_ID_COL = "__row_id";
const UPDATED_AT_COL = "__updated_at";

export async function writeMissingRowMetadata() {
    const sheets = getSheetsClient();

    // 1. Read entire sheet
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: env.google.sheetId,
        range: "A1:Z1000",
    });

    const values = response.data.values || [];
    if (values.length === 0) return;

    const headers = values[0];
    const rows = values.slice(1);

    const rowIdIndex = headers.indexOf(ROW_ID_COL);
    const updatedAtIndex = headers.indexOf(UPDATED_AT_COL);

    if (rowIdIndex === -1 || updatedAtIndex === -1) {
        throw new Error("Metadata columns missing");
    }

    const updates: { range: string; values: string[][] }[] = [];

    rows.forEach((row, i) => {
        const sheetRowIndex = i + 2; // header is row 1

        // 🚨 CRITICAL GUARD: skip header-like rows
        if (
            row.includes(ROW_ID_COL) ||
            row.includes(UPDATED_AT_COL)
        ) {
            return;
        }

        const needsRowId = !row[rowIdIndex];
        const needsUpdatedAt = !row[updatedAtIndex];

        if (needsRowId || needsUpdatedAt) {
            updates.push({
                range: `${sheetRowIndex}:${sheetRowIndex}`,
                values: [
                    (() => {
                        const copy = [...row];
                        if (needsRowId) {
                            copy[rowIdIndex] = crypto.randomUUID();
                        }
                        if (needsUpdatedAt) {
                            copy[updatedAtIndex] = Date.now().toString();
                        }
                        return copy;
                    })(),
                ],
            });
        }
    });

    // 2. Batch update
    for (const u of updates) {
        await sheets.spreadsheets.values.update({
            spreadsheetId: env.google.sheetId,
            range: u.range,
            valueInputOption: "RAW",
            requestBody: {
                values: u.values,
            },
        });
    }
}
