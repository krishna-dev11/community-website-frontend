import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { adminEndpoints } from "../../../../services/apis";
import {
  FiShield,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiUser,
  FiClock,
  FiInfo,
  FiEye,
  FiX,
  FiDownload,
} from "react-icons/fi";
import toast from "react-hot-toast";

const ACTION_COLORS = {
  "user.approved": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "user.rejected": "bg-red-500/10 text-red-400 border-red-500/30",
  "user.roles.updated": "bg-amber-500/10 text-amber-400 border-amber-500/30",
  "admin.invite.created": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "donation.refund": "bg-purple-500/10 text-purple-400 border-purple-500/30",
  "community.post.moderated": "bg-sky-500/10 text-sky-400 border-sky-500/30",
};

const AuditLogAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [actionFilter, setActionFilter] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (actionFilter) params.append("action", actionFilter);
      if (targetTypeFilter) params.append("targetType", targetTypeFilter);

      const res = await apiConnector(
        "GET",
        `${adminEndpoints.AUDIT_LOGS_API}?${params.toString()}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (res?.data?.success) {
        setLogs(res.data.data.logs || []);
        setTotal(res.data.meta?.total || 0);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      toast.error(err?.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, targetTypeFilter]);

  const exportCSV = () => {
    if (!logs.length) {
      toast.error("No logs to export");
      return;
    }
    const headers = ["Timestamp", "Actor", "Action", "TargetType", "TargetID", "Reason", "IP"];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toISOString(),
      log.actor?.email || "System",
      log.action,
      log.targetType || "N/A",
      log.target || log.targetId || "N/A",
      `"${log.reason || ""}"`,
      log.ipAddress || "N/A",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `samaj_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit logs exported to CSV");
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] p-4 md:p-8 transition-colors duration-300">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-primary)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <div className="eyebrow-badge mb-2">
              <FiShield size={13} />
              <span>Security & Governance</span>
            </div>
            <h1 className="heading-hero text-[var(--text-primary)]">
              System <span className="text-gradient">Audit Logs</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Immutable trail of all administrative mutations, status updates, and critical actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="btn-secondary !py-2.5 !px-4 !text-xs cursor-pointer"
            >
              <FiDownload size={13} /> <span>Export CSV</span>
            </button>
            <button
              onClick={fetchLogs}
              className="btn-primary !py-2.5 !px-5 !text-xs cursor-pointer"
            >
              <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ka-card p-4">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-3.5 text-[var(--text-muted)]" size={16} />
            <input
              type="text"
              placeholder="Filter by Action (e.g. user.roles.updated)"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="ka-input !h-11 !pl-10"
            />
          </div>

          <div className="relative">
            <FiFilter className="absolute left-3.5 top-3.5 text-[var(--text-muted)]" size={16} />
            <input
              type="text"
              placeholder="Filter by Target Type (e.g. user, donation)"
              value={targetTypeFilter}
              onChange={(e) => {
                setTargetTypeFilter(e.target.value);
                setPage(1);
              }}
              className="ka-input !h-11 !pl-10"
            />
          </div>

          <div className="flex items-center justify-between px-3 text-xs text-[var(--text-secondary)]">
            <span>
              Total Recorded Events: <strong className="text-[var(--text-primary)]">{total}</strong>
            </span>
            <span>Page {page}</span>
          </div>
        </div>


        {/* Logs Table */}
        <div className="ka-card overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[var(--text-muted)]">Loading verified audit trail...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-[var(--text-muted)] text-sm">
              No audit logs found matching the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Actor</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Target Entity</th>
                    <th className="px-6 py-4">Reason / Notes</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {logs.map((log) => {
                    const colorClass =
                      ACTION_COLORS[log.action] ||
                      "bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]";

                    return (
                      <tr
                        key={log._id}
                        className="hover:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <td className="px-6 py-4 text-[var(--text-secondary)] font-mono whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <FiClock size={12} className="text-[var(--text-muted)]" />
                            <span>{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-[var(--text-primary)]">
                              {log.actor?.firstName
                                ? `${log.actor.firstName} ${log.actor.lastName || ""}`
                                : "System / Admin"}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {log.actor?.email || "internal"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${colorClass}`}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col font-mono text-[11px]">
                            <span className="text-[var(--accent-primary)] uppercase font-bold">
                              {log.targetType || "entity"}
                            </span>
                            <span className="text-[var(--text-muted)] truncate max-w-[120px]">
                              {log.target || log.targetId || "N/A"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-[var(--text-muted)] max-w-xs truncate">
                          {log.reason || <span className="text-gray-700 italic">No note</span>}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-[11px] font-semibold"
                          >
                            <FiEye size={12} /> Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
              >
                Previous
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* INSPECT LOG MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[var(--surface)] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            >
              <FiX size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <FiInfo size={20} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Audit Event Inspection</h2>
                <p className="text-xs text-[var(--text-secondary)] font-mono">{selectedLog._id}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/10 p-4 rounded-2xl">
                <div>
                  <span className="text-gray-500 block mb-1">Action</span>
                  <span className="font-bold text-emerald-400">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Target Type</span>
                  <span className="font-bold text-white uppercase">{selectedLog.targetType}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Target ID</span>
                  <span className="font-mono text-gray-300">{selectedLog.target || selectedLog.targetId}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">IP Address</span>
                  <span className="font-mono text-gray-300">{selectedLog.ipAddress || "Unknown"}</span>
                </div>
              </div>

              {/* Old Value / New Value Comparison */}
              {selectedLog.oldValue && (
                <div>
                  <span className="text-[var(--text-muted)] font-bold block mb-1">Previous State (oldValue):</span>
                  <pre className="bg-white/5 border border-white/10 p-3 rounded-xl text-[11px] text-amber-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div>
                  <span className="text-[var(--text-muted)] font-bold block mb-1">Updated State (newValue):</span>
                  <pre className="bg-white/5 border border-white/10 p-3 rounded-xl text-[11px] text-emerald-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.reason && (
                <div>
                  <span className="text-[var(--text-muted)] font-bold block mb-1">Reason Stated:</span>
                  <p className="bg-white/5 border border-white/10 p-3 rounded-xl text-gray-200">
                    {selectedLog.reason}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogAdmin;
