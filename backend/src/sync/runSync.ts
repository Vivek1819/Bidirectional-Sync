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
import { bumpSheetUpdatedAtIfNeeded } from "./bumpSheetUpdatedAt";

let isRunning = false;

export async function runSync() {
  if (isRunning) return;
  isRunning = true;

  try {
    await ensureMetadataColumns();
    await writeMissingRowMetadata();

    // ─────────────────────────────────
    // PHASE 1: Sheet → DB
    // ─────────────────────────────────

    const rawSheetA = await readSheet();
    const sheetRowsA = normalizeSheetRows(rawSheetA);
    const dbRowsA = await getAllRows();

    await bumpSheetUpdatedAtIfNeeded(sheetRowsA, dbRowsA);

    const rawSheetB = await readSheet();          // AFTER bump
    const sheetRowsB = normalizeSheetRows(rawSheetB);

    const diffSheetToDb = diffRows(sheetRowsB, dbRowsA);

    await applySheetToDb(diffSheetToDb);
    await applyDbDeletes(diffSheetToDb);

    // ─────────────────────────────────
    // PHASE 2: DB → Sheet
    // ─────────────────────────────────

    const dbRowsB = await getAllRows();            // AFTER DB writes
    const rawSheetC = await readSheet();           // 🚨 MUST RE-READ
    const sheetRowsC = normalizeSheetRows(rawSheetC);

    const diffDbToSheet = diffRows(sheetRowsC, dbRowsB);

    await applyDbInsertToSheet(diffDbToSheet.toInsertSheet);
    await applyDbToSheet(diffDbToSheet.toUpdateSheet);
    await applyDbDeletesToSheet(dbRowsB);

    await hideDeletedRowsInSheet();
  } finally {
    isRunning = false;
  }
}

