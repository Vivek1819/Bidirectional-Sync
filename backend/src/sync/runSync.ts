import { readSheet } from "../sheets/read";
import { normalizeSheetRows } from "../sheets/normalize";
import { getAllRows } from "../db/rows";
import { diffRows } from "./diff";
import { applySheetToDb } from "./applySheetToDb";
import { applyDbDeletes } from "./applyDeletes";
import { applyDbToSheet } from "./applyDbToSheet";
import { applyDbInsertToSheet } from "./applyDbInsertToSheet";
import { applyDbDeletesToSheet } from "./applyDbDeletesToSheet";
import { ensureMetadataColumns } from "../sheets/metadata";
import { writeMissingRowMetadata } from "../sheets/writeMetadata";
import { hideDeletedRowsInSheet } from "./applyDbDeletesVisibilityToSheet";

let isRunning = false;

export async function runSync() {
  if (isRunning) return;
  isRunning = true;

  await ensureMetadataColumns();
  await writeMissingRowMetadata();


  try {
    // 1️⃣ Read current state
    const rawSheet = await readSheet();
    const sheetRows = normalizeSheetRows(rawSheet);
    const dbRowsBefore = await getAllRows();

    // 2️⃣ Diff
    const diff = diffRows(sheetRows, dbRowsBefore);

    // 3️⃣ Sheet → DB
    await applySheetToDb(diff);
    await applyDbDeletes(diff);

    // 4️⃣ RE-READ DB (CRITICAL)
    const dbRowsAfter = await getAllRows();

    // 5️⃣ DB → Sheet
    await applyDbInsertToSheet(diff.toInsertSheet);
    await applyDbToSheet(diff.toUpdateSheet);
    await applyDbDeletesToSheet(dbRowsAfter);

    await hideDeletedRowsInSheet();
  } finally {
    isRunning = false;
  }
}
