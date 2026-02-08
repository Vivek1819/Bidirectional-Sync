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

    // ─────────────
    // READ PHASE
    // ─────────────
    const sheetRows = normalizeSheetRows(await readSheet());
    const dbRows = await getAllRows();

    // Ensure sheet edits get timestamps
    await bumpSheetUpdatedAtIfNeeded(sheetRows, dbRows);

    const sheetRowsAfter = normalizeSheetRows(await readSheet());

    // ─────────────
    // DIFF
    // ─────────────
    const diff = diffRows(sheetRowsAfter, dbRows);

    // ─────────────
    // APPLY
    // ─────────────
    await applySheetToDb(diff);        // Sheet → DB
    await applyDbToSheet(diff.toUpdateSheet); // DB → Sheet

    // Deletes are handled ONLY via deleted_at
    await applyDbDeletesToSheet(await getAllRows());
    await hideDeletedRowsInSheet();

  } finally {
    isRunning = false;
  }
}

