import { useState } from "react";
import type { CanonicalRow } from "../types/row";
import { updateCell } from "../api/client";

type Props = {
  rows: CanonicalRow[];
};

export function RowsTable({ rows }: Props) {
  if (rows.length === 0) return <p>No rows</p>;

  const columns = Object.keys(rows[0].data);

  async function handleBlur(
    row_id: string,
    column: string,
    value: string
  ) {
    await updateCell(row_id, column, value);
  }

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
              <td key={col}>
                <input
                  defaultValue={row.data[col]}
                  onBlur={(e) =>
                    handleBlur(row.row_id, col, e.target.value)
                  }
                  style={{ width: "100%" }}
                />
              </td>
            ))}
            <td>{new Date(row.updated_at).toLocaleTimeString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
