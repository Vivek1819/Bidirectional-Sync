import { db } from "./index";

const HARD_DELETE_AFTER_MS = 60 * 60 * 1000; // 1 hour

export async function cleanupDeletedRows() {
  const cutoff = Date.now() - HARD_DELETE_AFTER_MS;

  const [result] = await db.query<any>(
    `
    DELETE FROM canonical_rows
    WHERE deleted_at IS NOT NULL
      AND deleted_at < ?
    `,
    [cutoff]
  );

  if (result?.affectedRows > 0) {
    console.log(
      `[cleanup] Hard-deleted ${result.affectedRows} rows`
    );
  }
}
