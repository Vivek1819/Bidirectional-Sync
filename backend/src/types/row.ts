export type CanonicalRow = {
  row_id: string;
  updated_at: number;
  deleted_at: number | null;
  data: Record<string, string>;
};
