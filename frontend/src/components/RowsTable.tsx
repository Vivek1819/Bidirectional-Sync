import type { CanonicalRow } from "../types/row";

type Props = {
  rows: CanonicalRow[];
};

export function RowsTable({ rows }: Props) {
  if (rows.length === 0) return <p>No rows</p>;

  const columns = Object.keys(rows[0].data);

  return (
    <table border={1} cellPadding={8}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
          <th>updated_at</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.row_id}>
            {columns.map((col) => (
              <td key={col}>{row.data[col]}</td>
            ))}
            <td>{new Date(row.updated_at).toLocaleTimeString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
