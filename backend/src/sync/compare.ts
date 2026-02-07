import { CanonicalRow } from "../types/row";

export function isRowDataEqual(
  a: CanonicalRow,
  b: CanonicalRow
): boolean {
  const aKeys = Object.keys(a.data);
  const bKeys = Object.keys(b.data);

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    const aVal = a.data[key] ?? "";
    const bVal = b.data[key] ?? "";

    if (aVal !== bVal) {
      return false;
    }
  }

  return true;
}
