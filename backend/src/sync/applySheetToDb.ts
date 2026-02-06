import { CanonicalRow } from "../types/row";
import { upsertRows } from "../db/rows";
import { DiffResult } from "./diff";

export async function applySheetToDb(diff: DiffResult) {
  const rowsToWrite: CanonicalRow[] = [
    ...diff.toInsert,
    ...diff.toUpdate,
  ];

  if (rowsToWrite.length === 0) return;

  await upsertRows(rowsToWrite);
}
