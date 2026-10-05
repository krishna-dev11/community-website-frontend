import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FaLightbulb,
  FaPlus,
  FaChevronLeft,
  FaPaperPlane,
  FaTrashAlt,
  FaCircle,
  FaInbox,
  FaFilter,
} from "react-icons/fa";
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiMessageCircle,
} from "react-icons/fi";
import { apiConnector } from "../../../../services/apiConnector";
import { suggestionEndpoints } from "../../../../services/apis";

const {
  CREATE_SUGGESTION_API,
  MY_SUGGESTIONS_API,
  GET_SUGGESTION_API,
  ADD_MEMBER_MESSAGE_API,
  DELETE_SUGGESTION_API,
} = suggestionEndpoints;

// ─────────────────────────────────────────────────────────────────────────────
// Status styling
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Submitted",
    color: "text-blue-300",
    bg: "border-blue-400/30 bg-blue-400/10",
    icon: FiClock,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "text-amber-300",
    bg: "border-amber-400/30 bg-amber-400/10",
    icon: FiClock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-violet-300",
    bg: "border-violet-400/30 bg-violet-400/10",
    icon: FiClock,
  },
  RESPONDED: {
    label: "Responded",
    color: "text-emerald-300",
    bg: "border-emerald-400/30 bg-emerald-400/10",
    icon: FiCheckCircle,
  },
  RESOLVED: {
    label: "Resolved",
    color: "text-emerald-300",
    bg: "border-emerald-400/30 bg-emerald-400/10",
    icon: FiCheckCircle,
  },
  CLOSED: {
    label: "Closed",
    color: "text-gray-400",
    bg: "border-gray-500/30 bg-gray-500/10",
    icon: FiXCircle,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-400",
    bg: "border-red-400/30 bg-red-400/10",
    icon: FiXCircle,
  },
};

const CATEGORIES = [
  "General Suggestion",
  "Community Improvement",
  "Member Services",
  "Family / Family Hub",
  "Dharamshala",
  "Monthly Contribution",
  "Donation / Finance",
  "Jobs",
  "Scholarships",
  "Matrimonial",
  "Events",
  "Website / Technical Issue",
  "Content / Notices",
  "Other",
];

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg =
    STATUS_CONFIG[status] || {
      label: status,
      color: "text-gray-400",
      bg: "border-gray-500/30 bg-gray-500/10",
      icon: FiAlertCircle,
    };

  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth token helper
// ─────────────────────────────────────────────────────────────────────────────

function getAuthToken() {
  try {
    const raw = localStorage.getItem("token");

    if (raw) {
      const parsed = JSON.parse(raw);

      if (typeof parsed === "string") {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  const raw = localStorage.getItem("token");

  if (raw && typeof raw === "string") {
    let clean = raw.trim();

    if (
      (clean.startsWith('"') && clean.endsWith('"')) ||
      (clean.startsWith("'") && clean.endsWith("'"))
    ) {
      clean = clean.slice(1, -1);
    }

    return clean;
  }

  const cookieToken = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="))
    ?.split("=")?.[1];

  return cookieToken || "";
}

function authHeaders(explicitToken) {
  const token = explicitToken || getAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

// ─────────────────────────────────────────────────────────────────────────────
// New Suggestion Form
// ─────────────────────────────────────────────────────────────────────────────

function NewSuggestionForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    subject: "",
    category: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handle = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

  const submit = async (e) => {
    e.preventDefault();

    if (
      !form.subject.trim() ||
      !form.category ||
      !form.description.trim()
    ) {
      toast.error("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiConnector(
        "POST",
        CREATE_SUGGESTION_API,
        form,
        {
          headers: {
            ...authHeaders(),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success("Suggestion submitted successfully!");

      onCreated(res.data.data);
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to submit suggestion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-xl rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-2xl animate-fadeIn">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
            <FaLightbulb className="text-amber-400" size={16} />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              New Suggestion
            </h2>

            <p className="text-[11px] text-[var(--text-muted)]">
              Share your idea or feedback with the Samaj administration
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Subject *
            </span>

            <input
              className="ka-input"
              placeholder="Brief title of your suggestion (5–150 chars)"
              value={form.subject}
              onChange={handle("subject")}
              maxLength={150}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Category *
            </span>

            <select
              className="ka-input"
              value={form.category}
              onChange={handle("category")}
              required
            >
              <option value="">Select a category…</option>

              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Description *
            </span>

            <textarea
              className="ka-input !min-h-28 resize-none !py-3"
              placeholder="Describe your suggestion in detail (10–2000 chars)"
              value={form.description}
              onChange={handle("description")}
              maxLength={2000}
              required
            />

            <span className="text-right text-[10px] text-[var(--text-muted)]">
              {form.description.length}/2000
            </span>
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 !py-2.5"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary flex flex-1 items-center justify-center gap-2 !py-2.5"
              disabled={loading}
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <FaPaperPlane size={12} />
              )}

              {loading ? "Submitting…" : "Submit Suggestion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail View
// ─────────────────────────────────────────────────────────────────────────────

function SuggestionDetail({
  suggestionId,
  onBack,
  onUpdated,
}) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const messagesContainerRef = useRef(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);

    try {
      const res = await apiConnector(
        "GET",
        GET_SUGGESTION_API(suggestionId),
        null,
        {
          headers: authHeaders(),
          withCredentials: true,
        }
      );

      setSuggestion(res.data.data);
    } catch {
      toast.error("Failed to load suggestion.");
    } finally {
      setLoading(false);
    }
  }, [suggestionId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Keep scrolling isolated to the conversation box so the
  // dashboard/sidebar parent containers never move.
  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [suggestion?.messages]);

  const sendMessage = async () => {
    if (!msg.trim()) return;

    setSendingMsg(true);

    try {
      const res = await apiConnector(
        "POST",
        ADD_MEMBER_MESSAGE_API(suggestionId),
        {
          message: msg.trim(),
        },
        {
          headers: {
            ...authHeaders(),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setSuggestion(res.data.data);
      setMsg("");
      onUpdated?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to send message."
      );
    } finally {
      setSendingMsg(false);
    }
  };

  const withdraw = async () => {
    if (
      !window.confirm(
        "Are you sure you want to withdraw this suggestion?"
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      await apiConnector(
        "DELETE",
        DELETE_SUGGESTION_API(suggestionId),
        null,
        {
          headers: authHeaders(),
          withCredentials: true,
        }
      );

      toast.success("Suggestion withdrawn.");

      onBack();
      onUpdated?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to withdraw."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!suggestion) return null;

  const canWithdraw = suggestion.status === "SUBMITTED";

  const isClosed = ["CLOSED", "REJECTED"].includes(
    suggestion.status
  );

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {/* Detail Header */}
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <button
          onClick={onBack}
          className="flex shrink-0 items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <FaChevronLeft size={12} />
          Back
        </button>

        <div className="h-4 w-px shrink-0 bg-[var(--border-subtle)]" />

        <StatusBadge status={suggestion.status} />

        <span className="ml-auto max-w-full truncate font-mono text-[10px] text-[var(--text-muted)]">
          {suggestion.suggestionId}
        </span>
      </div>

      {/* Main Suggestion Card */}
      <div className="min-w-0 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
        <h2 className="mb-1 break-words text-lg font-bold text-[var(--text-primary)]">
          {suggestion.subject}
        </h2>

        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[10px] font-semibold text-violet-300">
            {suggestion.category}
          </span>

          <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2.5 py-1 text-[10px] text-[var(--text-muted)]">
            {new Date(
              suggestion.createdAt
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <p className="break-words whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
          {suggestion.description}
        </p>

        {suggestion.resolutionNote && (
          <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Resolution Note
            </p>

            <p className="break-words text-sm text-emerald-200">
              {suggestion.resolutionNote}
            </p>
          </div>
        )}

        {suggestion.rejectionReason && (
          <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-red-400">
              Rejection Reason
            </p>

            <p className="break-words text-sm text-red-200">
              {suggestion.rejectionReason}
            </p>
          </div>
        )}
      </div>

      {/* Conversation */}
      {suggestion.messages?.length > 0 && (
        <div className="min-w-0 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Conversation
          </p>

          <div
            ref={messagesContainerRef}
            className="custom-scrollbar flex max-h-80 min-w-0 flex-col gap-3 overflow-y-auto overflow-x-hidden pr-1">
            {suggestion.messages.map((m, i) => {
              const isAdmin = m.senderType === "ADMIN";

              return (
                <div
                  key={i}
                  className={`flex min-w-0 flex-col gap-1 ${
                    isAdmin
                      ? "items-start"
                      : "items-end"
                  }`}
                >
                  <div
                    className={`max-w-[85%] break-words px-4 py-2.5 text-sm leading-relaxed ${
                      isAdmin
                        ? "rounded-2xl rounded-tl-sm border border-violet-400/20 bg-violet-400/10 text-violet-100"
                        : "rounded-2xl rounded-tr-sm border border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/15 text-[var(--text-primary)]"
                    }`}
                  >
                    {m.message}
                  </div>

                  <span className="break-words text-[10px] text-[var(--text-muted)]">
                    {isAdmin
                      ? `${m.senderName} (Admin)`
                      : "You"}{" "}
                    ·{" "}
                    {new Date(
                      m.createdAt
                    ).toLocaleString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              );
            })}

            
          </div>
        </div>
      )}

      {/* Reply */}
      {!isClosed && (
        <div className="min-w-0 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Add a Follow-up
          </p>

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <textarea
              className="ka-input !min-h-16 min-w-0 flex-1 resize-none !py-2.5"
              placeholder="Add additional details or a follow-up message…"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              maxLength={2000}
            />

            <button
              onClick={sendMessage}
              disabled={sendingMsg || !msg.trim()}
              className="btn-primary flex h-11 shrink-0 items-center justify-center gap-2 !px-4 !py-2 sm:self-end"
            >
              {sendingMsg ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <FaPaperPlane size={12} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Withdraw */}
      {canWithdraw && (
        <button
          onClick={withdraw}
          disabled={deleting}
          className="flex shrink-0 items-center gap-2 self-start text-sm text-red-400 transition-colors hover:text-red-300"
        >
          <FaTrashAlt size={12} />

          {deleting
            ? "Withdrawing…"
            : "Withdraw Suggestion"}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggestion Card
// ─────────────────────────────────────────────────────────────────────────────

function SuggestionCard({ s, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full min-w-0 items-start gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 text-left shadow-sm transition-all duration-200 hover:border-[var(--accent-primary)]/30 hover:bg-[var(--surface-elevated)] hover:shadow-md"
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
        <FaLightbulb
          className="text-amber-400"
          size={14}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="max-w-full truncate text-sm font-semibold text-[var(--text-primary)]">
            {s.subject}
          </span>

          {s.hasUnreadAdminResponse && (
            <span className="flex shrink-0 items-center gap-1 rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[10px] text-blue-300">
              <FaCircle size={6} />
              New Reply
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={s.status} />

          <span className="text-[10px] text-[var(--text-muted)]">
            {s.category}
          </span>

          <span className="ml-auto shrink-0 text-[10px] text-[var(--text-muted)]">
            {new Date(
              s.createdAt
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MySuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [total, setTotal] = useState(0);

  const fetchList = useCallback(async () => {
    setLoading(true);

    try {
      const res = await apiConnector(
        "GET",
        MY_SUGGESTIONS_API,
        null,
        {
          headers: authHeaders(),
          withCredentials: true,
        },
        statusFilter
          ? {
              status: statusFilter,
            }
          : {}
      );

      setSuggestions(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch {
      toast.error("Failed to load suggestions.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const STATUSES = [
    "",
    "SUBMITTED",
    "UNDER_REVIEW",
    "IN_PROGRESS",
    "RESPONDED",
    "RESOLVED",
    "CLOSED",
    "REJECTED",
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // Detail Page
  // ───────────────────────────────────────────────────────────────────────────

  if (selectedId) {
    return (
      <div
        className="
          relative
          min-h-full
          min-w-0
          overflow-x-clip
          px-3
          pb-10
          pt-24
          sm:px-5
          sm:pt-24
          lg:px-6
          lg:pb-12
          lg:pt-28
        "
      >
        <div className="mx-auto w-full max-w-4xl min-w-0">
          <SuggestionDetail
            suggestionId={selectedId}
            onBack={() => setSelectedId(null)}
            onUpdated={fetchList}
          />
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // List Page
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="
        relative
        min-h-full
        min-w-0
        overflow-x-clip
      "
    >
      <div className="mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-6">
        {/* Header */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-[var(--text-primary)]">
              <FaLightbulb className="shrink-0 text-amber-400" />
              <span>My Suggestions</span>
            </h1>

            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              Share ideas and feedback with the Samaj administration
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex shrink-0 items-center gap-2 !px-4 !py-2.5 !text-xs"
          >
            <FaPlus size={12} />
            New Suggestion
          </button>
        </div>

        {/* Filter */}
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1">
          <FaFilter
            size={11}
            className="shrink-0 text-[var(--text-muted)]"
          />

          {STATUSES.map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                statusFilter === s
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white"
                  : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        {/* List */}
 {loading ? (
  <div className="flex min-h-[40vh] w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
  </div>
) : suggestions.length === 0 ? (
  <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-4 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
      <FaInbox
        className="text-amber-400"
        size={24}
      />
    </div>

    <div>
      <p className="font-semibold text-[var(--text-primary)]">
        No suggestions yet
      </p>

      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Submit your first suggestion using the button above.
      </p>
    </div>
  </div>
) : (
  <div className="w-full min-w-0">
    <div className="mb-3">
      <p className="text-[11px] text-[var(--text-muted)]">
        {total} suggestion
        {total !== 1 ? "s" : ""}
      </p>
    </div>

    <div className="flex min-w-0 flex-col gap-3">
      {suggestions.map((s) => (
        <SuggestionCard
          key={s._id}
          s={s}
          onClick={() => setSelectedId(s._id)}
        />
      ))}
    </div>
  </div>
)}

        {/* New Form Modal */}
        {showForm && (
          <NewSuggestionForm
            onClose={() => setShowForm(false)}
            onCreated={() => fetchList()}
          />
        )}
      </div>
    </div>
  );
}