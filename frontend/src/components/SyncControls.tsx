import { useState } from "react";

type SyncControlsProps = {
  onSync: () => Promise<void>;
  loading: boolean;
};

export default function SyncControls({ onSync, loading }: SyncControlsProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number | null>(null);

  async function run() {
    try {
      setStatus(null);
      await onSync();
      setLastSync(Date.now());
      setStatus("Sync completed successfully");
    } catch (err: any) {
      setStatus(err.message || "Sync failed");
    }
  }

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 16,
        borderRadius: 6,
        marginBottom: 24,
      }}
    >
      <h2>Sync Controls</h2>

      <button onClick={run} disabled={loading}>
        {loading ? "Running sync..." : "Run Sync Now"}
      </button>

      {status && (
        <p style={{ marginTop: 12 }}>
          <strong>Status:</strong> {status}
        </p>
      )}

      {lastSync && (
        <p>
          <strong>Last Sync:</strong>{" "}
          {new Date(lastSync).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
