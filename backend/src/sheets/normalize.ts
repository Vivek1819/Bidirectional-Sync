import { CanonicalRow } from "../types/row";
import crypto from "crypto";

const ROW_ID_COL = "__row_id";
const UPDATED_AT_COL = "__updated_at";
const DELETED_AT_COL = "__deleted_at";

export function normalizeSheetRows(values: string[][]): CanonicalRow[] {
  if (values.length === 0) return [];

  const headers = values[0];
  const dataRows = values.slice(1);

  const rowIdIndex = headers.indexOf(ROW_ID_COL);
  const updatedAtIndex = headers.indexOf(UPDATED_AT_COL);
  const deletedAtIndex = headers.indexOf(DELETED_AT_COL);

  return dataRows
    // skip fully empty rows
    .filter((row) => row.some((cell) => cell !== ""))
    .map((row) => {
      const data: Record<string, string> = {};

      headers.forEach((header, idx) => {
        if (
          header !== ROW_ID_COL &&
          header !== UPDATED_AT_COL &&
          header !== DELETED_AT_COL
        ) {
          data[header] = row[idx] ?? "";
        }
      });

      const row_id =
        rowIdIndex >= 0 && row[rowIdIndex]
          ? row[rowIdIndex]
          : crypto.randomUUID();

      const updated_at =
        updatedAtIndex >= 0 && row[updatedAtIndex]
          ? Number(row[updatedAtIndex])
          : 0; // IMPORTANT: never auto-Date.now()

      const deleted_at =
        deletedAtIndex >= 0 && row[deletedAtIndex]
          ? Number(row[deletedAtIndex])
          : null;

      return {
        row_id,
        updated_at,
        deleted_at,
        data,
      };
    });
}
