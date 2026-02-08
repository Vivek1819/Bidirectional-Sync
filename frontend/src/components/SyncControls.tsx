import { useState, useEffect } from "react";

type SyncControlsProps = {
  onSync: () => Promise<void>;
  loading: boolean;
};

export default function SyncControls({ onSync, loading }: SyncControlsProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | "neutral">("neutral");

  async function run() {
    try {
      setStatus("Initiating sequence...");
      setStatusType("neutral");
      await onSync();
      setLastSync(Date.now());
      setStatus("Synchronization Complete");
      setStatusType("success");
    } catch (err: any) {
      setStatus(err.message || "Sync Failed");
      setStatusType("error");
    }
  }

  // Effect to clear status after a delay
  useEffect(() => {
    if (status && statusType !== "neutral") {
      const timer = setTimeout(() => {
        setStatus(null);
        setStatusType("neutral");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, statusType]);

  return (
    <div className="sync-module">
      <div className="module-header">
        <h2 className="module-title">SYSTEM CONTROL</h2>
        <div className="status-indicator">
          <span className={`status-dot ${loading ? "pulsing" : statusType}`}></span>
          <span className="status-text">
            {loading ? "SYNCING..." : status || "SYSTEM ONLINE"}
          </span>
        </div>
      </div>

      <div className="module-content">
        <div className="last-sync-display">
          <span className="label">LAST UPDATE</span>
          <span className="value">
            {lastSync ? new Date(lastSync).toLocaleTimeString() : "--:--:--"}
          </span>
        </div>

        <button
          className={`sync-btn ${loading ? "loading" : ""}`}
          onClick={run}
          disabled={loading}
        >
          <span className="btn-content">
            {loading ? "PROCESSING" : "INITIATE SYNC"}
          </span>
          <div className="btn-glitch"></div>
        </button>
      </div>

      <style>{`
        .sync-module {
          background: var(--bg-panel);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(12px);
          box-shadow: var(--panel-shadow);
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }

        .sync-module::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--neon-blue);
          box-shadow: var(--glow-sm);
        }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 1rem;
        }

        .module-title {
          font-family: var(--font-display);
          font-size: 1.2rem;
          letter-spacing: 2px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid var(--glass-border);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-muted);
        }

        .status-dot.success { background: var(--neon-green); box-shadow: 0 0 8px var(--neon-green); }
        .status-dot.error { background: var(--neon-red); box-shadow: 0 0 8px var(--neon-red); }
        .status-dot.pulsing { background: var(--neon-blue); animation: pulse 1s infinite alternate; }

        .status-text {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 1px;
          color: var(--text-main);
        }

        .module-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .last-sync-display {
          display: flex;
          flex-direction: column;
        }

        .last-sync-display .label {
          font-size: 0.7rem;
          color: var(--text-muted);
          letter-spacing: 1.5px;
          margin-bottom: 0.2rem;
        }

        .last-sync-display .value {
          font-family: 'Space Mono', monospace; /* Fallback to monospace if font not loaded */
          font-size: 1.4rem;
          color: var(--neon-blue);
          text-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
        }

        .sync-btn {
          position: relative;
          background: rgba(0, 243, 255, 0.1);
          color: var(--neon-blue);
          border: 1px solid var(--neon-blue);
          padding: 0.8rem 2rem;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          overflow: hidden;
          clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
        }

        .sync-btn:hover:not(:disabled) {
          background: var(--neon-blue);
          color: #000;
          box-shadow: var(--glow-md);
        }
        
        .sync-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          border-color: var(--text-muted);
          color: var(--text-muted);
        }

        @keyframes pulse {
          0% { opacity: 0.4; box-shadow: 0 0 0 rgba(0, 243, 255, 0); }
          100% { opacity: 1; box-shadow: 0 0 10px var(--neon-blue); }
        }
      `}</style>
    </div>
  );
}
