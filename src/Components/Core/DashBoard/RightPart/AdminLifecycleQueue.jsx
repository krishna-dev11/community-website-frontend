import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCheck,
  FaTimes,
  FaRedo,
  FaFilter,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  FiX,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiInfo,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { familyEndpoints } from "../../../../services/apis";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------
const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    UNDER_REVIEW: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    APPROVED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    REJECTED: "border-red-400/30 bg-red-400/10 text-red-300",
    REQUIRES_CORRECTION: "border-purple-400/30 bg-purple-400/10 text-purple-300",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${styles[status] || styles.PENDING}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
};

const ActionButton = ({ children, icon: Icon, tone = "neutral", ...props }) => {
  const classes = {
    neutral: "btn-secondary !py-1.5 !px-3 !text-xs",
    success: "btn-primary !py-1.5 !px-3.5 !text-xs",
    warning:
      "inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-bold text-xs uppercase tracking-wider px-3 py-1.5 transition-all hover:bg-amber-400/20 disabled:opacity-50 cursor-pointer",
    danger:
      "inline-flex items-center justify-center gap-1.5 rounded-full border border-red-400/30 bg-red-400/10 text-red-300 font-bold text-xs uppercase tracking-wider px-3 py-1.5 transition-all hover:bg-red-400/20 disabled:opacity-50 cursor-pointer",
    info:
      "inline-flex items-center justify-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-300 font-bold text-xs uppercase tracking-wider px-3 py-1.5 transition-all hover:bg-sky-400/20 disabled:opacity-50 cursor-pointer",
  };
  return (
    <button
      {...props}
      className={`${classes[tone] || classes.neutral} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </button>
  );
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const LIFECYCLE_TYPE_LABELS = {
  ADD_MEMBER: "Add Member",
  REPORT_DEATH: "Report Death",
  HEAD_SUCCESSION: "Head Succession",
  HEAD_TRANSFER: "Head Transfer",
  MEMBER_TRANSFER: "Member Transfer",
  FAMILY_SPLIT: "Family Split",
  PROFILE_CORRECTION: "Profile Correction",
  MARITAL_STATUS_CHANGE: "Marital Status Change",
  ADDRESS_CHANGE: "Address Change",
};

const TYPE_ICONS = {
  ADD_MEMBER: "👤",
  REPORT_DEATH: "⚰️",
  HEAD_SUCCESSION: "👑",
  HEAD_TRANSFER: "🔄",
  MEMBER_TRANSFER: "🏠",
  FAMILY_SPLIT: "🏗️",
  PROFILE_CORRECTION: "✏️",
  MARITAL_STATUS_CHANGE: "💍",
  ADDRESS_CHANGE: "📍",
};

const REJECTION_CATEGORIES = [
  "Insufficient Documentation",
  "Identity Verification Failed",
  "Duplicate Request",
  "Invalid Information",
  "Out of Jurisdiction",
  "Policy Violation",
  "Administrative Hold",
  "Other",
];

// ---------------------------------------------------------------------------
// Review Modal
// ---------------------------------------------------------------------------
const ReviewModal = ({ request, authConfig, onClose, onSuccess }) => {
  const [action, setAction] = useState("APPROVE");
  const [adminReason, setAdminReason] = useState("");
  const [rejectionCategory, setRejectionCategory] = useState(REJECTION_CATEGORIES[0]);
  const [correctionRequired, setCorrectionRequired] = useState("");
  const [approvedNewHeadId, setApprovedNewHeadId] = useState(request?.data?.proposedSuccessor || "");
  const [busy, setBusy] = useState(false);

  const needsReason = action === "REJECT" || action === "REQUEST_CORRECTION";

  const submit = async (e) => {
    e.preventDefault();
    if (needsReason && !adminReason.trim()) {
      toast.error("Admin reason is mandatory for this action");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        action,
        adminReason: adminReason.trim() || "Approved by administration",
        ...(action === "REJECT" && { rejectionCategory }),
        ...(action === "REQUEST_CORRECTION" && { correctionRequired }),
        ...(action === "APPROVE" && approvedNewHeadId && { approvedData: { newHeadId: approvedNewHeadId } }),
      };

      await apiConnector(
        "PATCH",
        familyEndpoints.REVIEW_LIFECYCLE_REQUEST_API(request._id),
        payload,
        authConfig
      );

      toast.success(`Request ${action.toLowerCase().replace("_", " ")}d`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to process review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{TYPE_ICONS[request.type]}</span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {LIFECYCLE_TYPE_LABELS[request.type] || request.type}
              </h3>
            </div>
            <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{request.requestId}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-[var(--surface-elevated)] transition cursor-pointer">
            <FiX size={16} className="text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Request details */}
        <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Family</span>
              <p className="text-[var(--text-primary)] font-medium">
                {request.family?.familyName} <span className="opacity-60">({request.family?.familyCode})</span>
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">SSSM ID</span>
              <p className="text-[var(--text-primary)] font-medium">{request.family?.sssmId || "—"}</p>
            </div>
          </div>
          {request.member && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Affected Member</span>
              <p className="text-[var(--text-primary)] font-medium">{request.member.firstName} {request.member.lastName} ({request.member.memberId})</p>
            </div>
          )}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Requested By</span>
            <p className="text-[var(--text-primary)] font-medium">{request.requestedBy?.firstName} {request.requestedBy?.lastName} <span className="opacity-60">({request.requestedBy?.email})</span></p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Reason / Description</span>
            <p className="text-[var(--text-secondary)] mt-0.5 leading-relaxed">{request.reason}</p>
          </div>
          {request.data && Object.keys(request.data).length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Additional Data</span>
              <pre className="mt-1 rounded-xl bg-[var(--surface)] p-2.5 text-[10px] text-[var(--text-secondary)] overflow-x-auto">
                {JSON.stringify(request.data, null, 2)}
              </pre>
            </div>
          )}
          {request.documents?.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Supporting Documents</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {request.documents.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[10px] font-bold text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition"
                  >
                    <FaExternalLinkAlt size={9} />
                    {doc.name || `Document ${i + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Review form */}
        <form onSubmit={submit} className="p-5 grid gap-4">
          {/* Action selector */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-1">
            {[
              { id: "APPROVE", label: "Approve", color: "success" },
              { id: "REQUEST_CORRECTION", label: "Correction", color: "warning" },
              { id: "REJECT", label: "Reject", color: "danger" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                id={`lifecycle-action-${opt.id}`}
                onClick={() => setAction(opt.id)}
                className={`rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  action === opt.id
                    ? opt.id === "APPROVE"
                      ? "bg-emerald-500 text-white shadow-md"
                      : opt.id === "REJECT"
                      ? "bg-red-500 text-white shadow-md"
                      : "bg-amber-500 text-white shadow-md"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Conditional: Successor ID for succession/transfer requests */}
          {action === "APPROVE" && (request.type === "HEAD_SUCCESSION" || request.type === "HEAD_TRANSFER") && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Confirm New Head Member ID *
              </span>
              <input
                className="ka-input !h-11 !py-0"
                placeholder="MongoDB user _id of new Family Head"
                value={approvedNewHeadId}
                onChange={(e) => setApprovedNewHeadId(e.target.value)}
                required
              />
            </label>
          )}

          {/* Rejection category */}
          {action === "REJECT" && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Rejection Category *</span>
              <select
                className="ka-input !h-11 !py-0"
                value={rejectionCategory}
                onChange={(e) => setRejectionCategory(e.target.value)}
                required
              >
                {REJECTION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          )}

          {/* Correction instructions */}
          {action === "REQUEST_CORRECTION" && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Instructions for Family Head *</span>
              <textarea
                rows={2}
                className="ka-input !py-2.5 resize-none"
                placeholder="Explain specifically what needs to be corrected or resubmitted…"
                value={correctionRequired}
                onChange={(e) => setCorrectionRequired(e.target.value)}
                required={action === "REQUEST_CORRECTION"}
              />
            </label>
          )}

          {/* Admin reason */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Admin Note {needsReason ? "(Required)" : "(Optional)"}
            </span>
            <textarea
              rows={3}
              className="ka-input !py-2.5 resize-none"
              placeholder={
                needsReason
                  ? "Provide a clear reason for your decision…"
                  : "Optional notes for record-keeping…"
              }
              value={adminReason}
              onChange={(e) => setAdminReason(e.target.value)}
              required={needsReason}
            />
          </label>

          {needsReason && (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 flex items-start gap-2">
              <FiAlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-amber-300">
                Rejection / correction reason is mandatory and will be sent to the Family Head.
                Be specific and constructive — they must be able to act on your feedback.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <ActionButton tone="neutral" type="button" onClick={onClose} className="flex-1">Cancel</ActionButton>
            <ActionButton
              tone={action === "APPROVE" ? "success" : action === "REJECT" ? "danger" : "warning"}
              type="submit"
              disabled={busy}
              className="flex-1"
              icon={action === "APPROVE" ? FaCheck : action === "REJECT" ? FaTimes : FaRedo}
            >
              {busy ? "Processing…" : action === "APPROVE" ? "Approve" : action === "REJECT" ? "Reject" : "Request Correction"}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const AdminLifecycleQueue = () => {
  const { token } = useSelector((state) => state.auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [filterType, setFilterType] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null);

  const authConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }), [token]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.type = filterType;
      const response = await apiConnector("GET", familyEndpoints.ADMIN_LIFECYCLE_REQUESTS_API, null, authConfig, params);
      setRequests(response.data?.data?.requests || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to load lifecycle requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, [filterStatus, filterType]);

  const pendingCount = requests.filter((r) => r.status === "PENDING" || r.status === "UNDER_REVIEW").length;

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6">
      {/* Review modal */}
      {reviewTarget && (
        <ReviewModal
          request={reviewTarget}
          authConfig={authConfig}
          onClose={() => setReviewTarget(null)}
          onSuccess={loadRequests}
        />
      )}

      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Header */}
        <div className="border-b border-[var(--border-subtle)] pb-6">
          <div className="eyebrow-badge mb-2">
            <FiUsers size={13} />
            <span>Family Administration</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="heading-hero text-[var(--text-primary)]">
                Lifecycle <span className="text-gradient">Request Queue</span>
              </h1>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Review life event submissions from Family Heads — deaths, successions, transfers, corrections.
              </p>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5">
                <FiAlertTriangle size={14} className="text-amber-400" />
                <span className="text-sm font-bold text-amber-300">{pendingCount} pending</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <FaFilter size={12} className="text-[var(--text-muted)]" />
          <div className="flex flex-wrap gap-2">
            {["", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "REQUIRES_CORRECTION"].map((s) => (
              <button
                key={s}
                id={`lifecycle-filter-${s || "all"}`}
                onClick={() => setFilterStatus(s)}
                className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterStatus === s
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                    : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>
          <select
            className="ka-input !h-9 !text-xs !px-3 ml-auto"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            id="lifecycle-type-filter"
          >
            <option value="">All Types</option>
            {Object.entries(LIFECYCLE_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <FiCheckCircle size={40} className="text-emerald-400 opacity-60" />
            <p className="text-[var(--text-muted)] text-sm">No lifecycle requests match these filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {requests.map((req) => (
              <article
                key={req._id}
                id={`lifecycle-req-${req._id}`}
                className="ka-card p-4 sm:p-5 transition-all hover:border-[var(--border-strong)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left: Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="text-3xl shrink-0 mt-0.5">{TYPE_ICONS[req.type] || "📋"}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">
                          {LIFECYCLE_TYPE_LABELS[req.type] || req.type}
                        </h3>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-[10px] font-mono text-[var(--text-muted)]">{req.requestId}</p>

                      {/* Family info */}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                        <span>
                          <strong className="text-[var(--text-muted)]">Family:</strong>{" "}
                          {req.family?.familyName}{" "}
                          <span className="font-mono opacity-60 text-[10px]">({req.family?.familyCode})</span>
                        </span>
                        {req.family?.sssmId && (
                          <span>
                            <strong className="text-[var(--text-muted)]">SSSM:</strong> {req.family.sssmId}
                          </span>
                        )}
                        {req.member && (
                          <span>
                            <strong className="text-[var(--text-muted)]">Member:</strong>{" "}
                            {req.member.firstName} {req.member.lastName} ({req.member.memberId})
                          </span>
                        )}
                      </div>

                      {/* Submitter */}
                      <div className="mt-1.5 text-xs text-[var(--text-muted)]">
                        Submitted by{" "}
                        <span className="font-semibold text-[var(--text-secondary)]">
                          {req.requestedBy?.firstName} {req.requestedBy?.lastName}
                        </span>{" "}
                        · {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>

                      {/* Reason */}
                      <p className="mt-2 text-xs text-[var(--text-secondary)] line-clamp-2">{req.reason}</p>

                      {/* Documents */}
                      {req.documents?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {req.documents.map((doc, i) => (
                            <a
                              key={i}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[10px] font-bold text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition"
                            >
                              <FaExternalLinkAlt size={8} />
                              {doc.name || `Doc ${i + 1}`}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Admin reason (if reviewed) */}
                      {req.adminReason && (
                        <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-2.5">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                            Admin Response · {req.reviewedBy?.firstName} {req.reviewedBy?.lastName}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">{req.adminReason}</p>
                          {req.correctionRequired && (
                            <p className="mt-1 text-xs text-amber-300">Correction required: {req.correctionRequired}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap gap-2 items-start lg:flex-col lg:w-44 lg:shrink-0">
                    {(req.status === "PENDING" || req.status === "UNDER_REVIEW" || req.status === "REQUIRES_CORRECTION") && (
                      <ActionButton
                        tone="success"
                        icon={FaCheck}
                        onClick={() => setReviewTarget(req)}
                        className="w-full lg:w-full"
                        id={`review-btn-${req._id}`}
                      >
                        Review Request
                      </ActionButton>
                    )}
                    {req.status === "APPROVED" && (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                        <FiCheckCircle size={13} />
                        Approved
                      </div>
                    )}
                    {req.status === "REJECTED" && (
                      <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                        <FiAlertTriangle size={13} />
                        Rejected
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] mt-1">
                      <FiClock size={10} />
                      {new Date(req.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Info footer */}
        <div className="rounded-2xl border border-sky-400/20 bg-sky-400/5 p-4 flex items-start gap-3">
          <FiInfo size={14} className="text-sky-400 mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">Reminder:</strong> All rejections and correction requests require a mandatory admin reason.
            Family Heads will receive a notification and can resubmit corrected requests.
            Approved death/succession requests will automatically update the family record.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLifecycleQueue;
