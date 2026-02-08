export type RowData = {
  [key: string]: string;
};

export type CanonicalRow = {
  row_id: string;
  updated_at: number;
  deleted_at: number | null;
  data: RowData;
};
