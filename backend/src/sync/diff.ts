import { CanonicalRow } from "../types/row";

export type DiffResult = {
  toInsert: CanonicalRow[];
  toUpdate: CanonicalRow[];
  toDelete: CanonicalRow[];
  toUpdateSheet: CanonicalRow[];
  toInsertSheet: CanonicalRow[];
  toDeleteSheet: CanonicalRow[]
};

export function diffRows(
  sheetRows: CanonicalRow[],
  dbRows: CanonicalRow[]
): DiffResult {
  const dbMap = new Map(dbRows.map(r => [r.row_id, r]));
  const sheetMap = new Map(sheetRows.map(r => [r.row_id, r]));

  const toInsert: CanonicalRow[] = [];
  const toUpdate: CanonicalRow[] = [];
  const toUpdateSheet: CanonicalRow[] = [];
  const toInsertSheet: CanonicalRow[] = [];

  // Sheet → DB
  for (const sheetRow of sheetRows) {
    const dbRow = dbMap.get(sheetRow.row_id);

    if (!dbRow) {
      toInsert.push(sheetRow);
      continue;
    }

    if (sheetRow.updated_at > dbRow.updated_at) {
      toUpdate.push(sheetRow);
    } else if (dbRow.updated_at > sheetRow.updated_at) {
      toUpdateSheet.push(dbRow);
    }
  }

  // DB → Sheet (THIS WAS MISSING)
  for (const dbRow of dbRows) {
    if (!sheetMap.has(dbRow.row_id) && !dbRow.deleted_at) {
      toInsertSheet.push(dbRow);
    }
  }

  return {
    toInsert,
    toUpdate,
    toDelete: [],
    toUpdateSheet,
    toInsertSheet,
    toDeleteSheet: [],
  };
}
