import { CanonicalRow } from "../types/row";

export function isRowDataEqual(a: CanonicalRow, b: CanonicalRow): boolean {
  const keys = new Set([
    ...Object.keys(a.data),
    ...Object.keys(b.data),
  ]);

  for (const key of keys) {
    const aVal = a.data[key] ?? "";
    const bVal = b.data[key] ?? "";

    if (aVal !== bVal) return false;
  }

  return true;
}
