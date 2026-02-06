import { CanonicalRow } from "../types/row";

export function isRowDataEqual(a: CanonicalRow, b: CanonicalRow): boolean {
  const aKeys = Object.keys(a.data);
  const bKeys = Object.keys(b.data);

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a.data[key] !== b.data[key]) return false;
  }

  return true;
}
