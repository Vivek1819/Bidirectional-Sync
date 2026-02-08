import { useState } from "react";
import type { CanonicalRow } from "../types/row";
import { deleteRow, updateCell } from "../api/client";

type Props = {
  rows: CanonicalRow[];
  onRowDeleted?: (rowId: string) => void;
};

export function RowsTable({ rows, onRowDeleted }: Props) {
  if (rows.length === 0) return <p>No rows</p>;

  const columns = Object.keys(rows[0].data);

  // local edit buffer (per-cell)
  const [editing, setEditing] = useState<Record<string, string>>({});

  function cellKey(rowId: string, col: string) {
    return `${rowId}:${col}`;
  }

  async function handleBlur(
    row_id: string,
    column: string,
    value: string,
    original: string
  ) {
    if (value === original) return;

    await updateCell(row_id, column, value);
  }

  async function handleDelete(row_id: string) {
    if (!confirm("Delete this row?")) return;

    await deleteRow(row_id);
    onRowDeleted?.(row_id);
  }

  return (
    <table border={1} cellPadding={8}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
          <th>updated_at</th>
          <th>actions</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr key={row.row_id}>
            {columns.map((col) => {
              const key = cellKey(row.row_id, col);
              const value =
                editing[key] ?? row.data[col] ?? "";

              return (
                <td key={col}>
                  <input
                    value={value}
                    onChange={(e) =>
                      setEditing((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    onBlur={() =>
                      handleBlur(
                        row.row_id,
                        col,
                        value,
                        row.data[col] ?? ""
                      )
                    }
                  />
                </td>
              );
            })}

            <td>
              {new Date(row.updated_at).toLocaleTimeString()}
            </td>

            <td>
              <button
                onClick={() => handleDelete(row.row_id)}
                style={{ color: "red" }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
