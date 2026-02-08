import { useState } from "react";
import type { CanonicalRow } from "../types/row";
import { deleteRow, updateCell } from "../api/client";

type Props = {
    rows: CanonicalRow[];
    onRowDeleted?: (rowId: string) => void;
};

export function RowsTable({ rows, onRowDeleted }: Props) {
    const [editing, setEditing] = useState<Record<string, string>>({});
    const [hoverRow, setHoverRow] = useState<string | null>(null);

    if (rows.length === 0) return (
        <div className="empty-state-container">
            <div className="empty-grid-lines"></div>
            <p>NO DATA RECORDS FOUND</p>
        </div>
    );

    const columns = Object.keys(rows[0].data);

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
        if (!confirm("CONFIRM DELETION PROTOCOL?")) return;
        await deleteRow(row_id);
        onRowDeleted?.(row_id);
    }

    return (
        <div className="data-grid-container">
            <div className="grid-header-decors">
                <div className="rect"></div>
                <div className="rect"></div>
                <div className="rect"></div>
            </div>

            <div className="table-scroll">
                <table className="cyber-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col}>{col.toUpperCase()}</th>
                            ))}
                            <th>UPDATED</th>
                            <th>CMD</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row) => (
                            <tr
                                key={row.row_id}
                                onMouseEnter={() => setHoverRow(row.row_id)}
                                onMouseLeave={() => setHoverRow(null)}
                                className={hoverRow === row.row_id ? "row-hover" : ""}
                            >
                                {columns.map((col) => {
                                    const key = cellKey(row.row_id, col);
                                    const value = editing[key] ?? row.data[col] ?? "";

                                    return (
                                        <td key={col}>
                                            <input
                                                className="cyber-input"
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

                                <td className="time-cell">
                                    {new Date(row.updated_at).toLocaleTimeString()}
                                </td>

                                <td className="action-cell">
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(row.row_id)}
                                        title="Delete Record"
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
        .data-grid-container {
          background: var(--bg-panel);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--panel-shadow);
          position: relative;
        }

        .grid-header-decors {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
          background: rgba(0,0,0,0.4);
          border-bottom: 1px solid var(--glass-border);
        }
        
        .grid-header-decors .rect {
          width: 8px;
          height: 8px;
          background: var(--text-muted);
          opacity: 0.3;
        }

        .table-scroll {
          overflow-x: auto;
        }

        .cyber-table {
          width: 100%;
          border-collapse: collapse;
          color: var(--text-main);
        }

        .cyber-table th {
          text-align: left;
          padding: 1rem;
          color: var(--neon-blue);
          font-family: var(--font-display);
          font-size: 0.75rem;
          letter-spacing: 1px;
          border-bottom: 1px solid var(--glass-border);
          white-space: nowrap;
        }

        .cyber-table td {
          padding: 0.5rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 0.9rem;
        }

        .cyber-table tr {
          transition: background 0.2s ease;
        }

        .cyber-table tr:hover, .cyber-table tr.row-hover {
          background: rgba(0, 243, 255, 0.03);
        }

        .cyber-input {
          background: transparent;
          border: none;
          color: var(--text-main);
          width: 100%;
          font-family: inherit;
          padding: 4px 0;
          border-bottom: 1px solid transparent;
          transition: all 0.2s;
        }

        .cyber-input:focus {
          outline: none;
          border-bottom: 1px solid var(--neon-purple);
          background: rgba(188, 19, 254, 0.05);
          box-shadow: 0 4px 8px -2px rgba(188, 19, 254, 0.2);
        }

        .time-cell {
          color: var(--text-muted);
          font-family: 'Space Mono', monospace;
          font-size: 0.8rem;
        }

        .action-cell {
          text-align: center;
        }

        .delete-btn {
          color: var(--text-muted);
          font-size: 1.5rem;
          line-height: 1;
          opacity: 0.5;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          color: var(--neon-red);
          opacity: 1;
          text-shadow: 0 0 8px var(--neon-red);
          transform: scale(1.2);
        }
        
        .empty-state-container {
           text-align: center;
           padding: 4rem;
           color: var(--text-muted);
           background: var(--bg-panel);
           border-radius: 12px;
           border: 1px dashed var(--glass-border);
           letter-spacing: 2px;
        }
      `}</style>
        </div>
    );
}
