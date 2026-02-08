import { useEffect, useState } from "react";
import { fetchRows, runSync, insertRow } from "../api/client";
import type { CanonicalRow } from "../types/row";
import { RowsTable } from "../components/RowsTable";
import SyncControls from "../components/SyncControls";
import "../App.css";

function App() {
  const [rows, setRows] = useState<CanonicalRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadRows() {
    const data = await fetchRows();
    setRows(data);
  }

  async function handleAddRow() {
    const row = await insertRow({});
    setRows((prev) => [...prev, row]);
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

  const activeRows = rows.filter((r) => !r.deleted_at);

  return (
    <div className="app-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">NEXUS SYNC</h1>
        <div className="cluster-subtitle">Data/Sheet Bridge v2.0</div>
      </header>

      <SyncControls onSync={handleSync} loading={loading} />

      <section className="data-section">
        <div className="section-header">
          <h2 className="section-title">LIVE RECORDS</h2>
        </div>

        <RowsTable
          rows={activeRows}
          onRowDeleted={(rowId) => {
            setRows((prev) => prev.filter((r) => r.row_id !== rowId));
          }}
        />

        <div className="add-row-container">
          <button onClick={handleAddRow} className="btn-add">
            <span className="plus-icon">+</span>
            <span>NEW ENTRY</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;
