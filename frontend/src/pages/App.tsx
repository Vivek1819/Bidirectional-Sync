import { useEffect, useState } from "react";
import { fetchRows, runSync } from "../api/client";
import type { CanonicalRow } from "../types/row";
import { RowsTable } from "../components/RowsTable";
import SyncControls from "../components/SyncControls";
import { insertRow } from "../api/client";

function App() {
  const [rows, setRows] = useState<CanonicalRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadRows() {
    const data = await fetchRows();
    setRows(data);
  }

  async function handleAddRow() {
    const row = await insertRow({});
    setRows(prev => [...prev, row]);
  }


  async function handleSync() {
    setLoading(true);
    await runSync();
    await loadRows();
    setLoading(false);
  }

  useEffect(() => {
    loadRows();
  }, []);

  return (
    <div>
      <h1>Sheet ↔ DB Sync Dashboard</h1>

      <SyncControls onSync={handleSync} loading={loading} />

      <RowsTable
        rows={rows.filter(r => !r.deleted_at)}
        onRowDeleted={(rowId) => {
          setRows(prev => prev.filter(r => r.row_id !== rowId));
        }}
      />
      <button onClick={handleAddRow} style={{ marginBottom: 12 }}>
        + Add Row
      </button>

    </div>
  );
}

export default App;
