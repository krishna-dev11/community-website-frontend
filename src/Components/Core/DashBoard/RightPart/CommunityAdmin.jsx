import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArchive,
  FaAward,
  FaCalendarCheck,
  FaCheck,
  FaCalendarTimes,
  FaClipboardList,
  FaExclamationCircle,
  FaFlag,
  FaHeart,
  FaPaperPlane,
  FaPoll,
  FaSyncAlt,
  FaTimes,
  FaGlobe,
} from "react-icons/fa";
import { FiX, FiFileText, FiEye, FiSearch, FiCheckCircle, FiClock, FiDownload } from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { communityEndpoints } from "../../../../services/apis";
import DocViewer from "../../../Common/DocViewer";
import { formatDharamshalaPrice } from "../../../../Utilities/dharamshalaPricing";

// ─── Module top-level navigation tabs ──────────────────────────────────────
const tabs = [
  { key: "issues",       label: "Issues",   icon: FaExclamationCircle },
  { key: "bookings",     label: "Bookings", icon: FaCalendarCheck     },
  { key: "blocks",       label: "Blocks",   icon: FaCalendarTimes     },
  { key: "polls",        label: "Polls",    icon: FaPoll              },
  { key: "reports",      label: "Reports",  icon: FaFlag              },
  { key: "achievements", label: "Pride",    icon: FaAward             },
  { key: "shradhanjali", label: "Tribute",  icon: FaHeart             },
];

// ─── Status config per module (keys MUST match actual backend values) ───────
const MODULE_STATUS_CONFIG = {
  issues: [
    { key: "SUBMITTED",    label: "Needs Action" },
    { key: "UNDER_REVIEW", label: "Under Review" },
    { key: "IN_PROGRESS",  label: "In Progress"  },
    { key: "RESOLVED",     label: "Resolved"     },
    { key: "REJECTED",     label: "Rejected"     },
    { key: "ALL",          label: "All"          },
  ],
  bookings: [
    { key: "PENDING",         label: "Pending"          },
    { key: "PAYMENT_PENDING", label: "Awaiting Payment" },
    { key: "CONFIRMED",       label: "Confirmed"        },
    { key: "CHECKED_IN",      label: "Checked In"       },
    { key: "COMPLETED",       label: "Completed"        },
    { key: "REJECTED",        label: "Rejected"         },
    { key: "CANCELLED",       label: "Cancelled"        },
    { key: "ALL",             label: "All"              },
  ],
  blocks: [
    { key: "ACTIVE",   label: "Active"   },
    { key: "ARCHIVED", label: "Archived" },
    { key: "ALL",      label: "All"      },
  ],
  polls: [
    { key: "DRAFT",    label: "Draft"    },
    { key: "ACTIVE",   label: "Active"   },
    { key: "CLOSED",   label: "Closed"   },
    { key: "ARCHIVED", label: "Archived" },
    { key: "ALL",      label: "All"      },
  ],
  reports: [
    { key: "PENDING",      label: "Needs Review" },
    { key: "UNDER_REVIEW", label: "Under Review" },
    { key: "RESOLVED",     label: "Resolved"     },
    { key: "DISMISSED",    label: "Dismissed"    },
    { key: "ALL",          label: "All"          },
  ],
  achievements: [
    { key: "PENDING",   label: "Pending Review" },
    { key: "PUBLISHED", label: "Published"      },
    { key: "REJECTED",  label: "Rejected"       },
    { key: "ARCHIVED",  label: "Archived"       },
    { key: "ALL",       label: "All"            },
  ],
  shradhanjali: [
    { key: "PENDING",   label: "Pending Review" },
    { key: "PUBLISHED", label: "Published"      },
    { key: "REJECTED",  label: "Rejected"       },
    { key: "ARCHIVED",  label: "Archived"       },
    { key: "ALL",       label: "All"            },
  ],
};

// Statuses considered "done" — rendered with de-emphasis
const DONE_STATUSES = new Set([
  "RESOLVED", "REJECTED", "COMPLETED", "CANCELLED", "ARCHIVED", "DISMISSED",
]);

// Default "needs action" status per module shown on first open
const MODULE_DEFAULT_STATUS = {
  issues:       "SUBMITTED",
  bookings:     "PENDING",
  blocks:       "ACTIVE",
  polls:        "DRAFT",
  reports:      "PENDING",
  achievements: "PENDING",
  shradhanjali: "PENDING",
};

// ─── Shared primitive components ────────────────────────────────────────────
const inputClass    = "ka-input";
const textareaClass = "ka-input !min-h-24 resize-none !py-3";

const Button = ({ children, icon: Icon, tone = "neutral", className = "", ...props }) => {
  const toneClasses = {
    neutral: "btn-secondary !py-2 !px-4 !text-xs",
    success: "btn-primary !py-2 !px-5 !text-xs",
    warning: "inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all hover:bg-amber-400/20 disabled:opacity-50 cursor-pointer",
    danger:  "inline-flex items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 text-red-300 font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all hover:bg-red-400/20 disabled:opacity-50 cursor-pointer",
  };
  return (
    <button
      {...props}
      className={`${toneClasses[tone] || toneClasses.neutral} ${className} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </button>
  );
};

const Field = ({ label, children }) => (
  <label className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
    {children}
  </label>
);

// Colored status badge (replaces the old plain `Status` component)
const StatusBadge = ({ value }) => {
  const colorMap = {
    SUBMITTED:       "border-amber-400/40 bg-amber-400/10 text-amber-300",
    UNDER_REVIEW:    "border-sky-400/40 bg-sky-400/10 text-sky-300",
    IN_PROGRESS:     "border-blue-400/40 bg-blue-400/10 text-blue-300",
    PENDING:         "border-amber-400/40 bg-amber-400/10 text-amber-300",
    PAYMENT_PENDING: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    CONFIRMED:       "border-teal-400/40 bg-teal-400/10 text-teal-300",
    CHECKED_IN:      "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
    DRAFT:           "border-purple-400/40 bg-purple-400/10 text-purple-300",
    ACTIVE:          "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    PUBLISHED:       "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    RESOLVED:        "border-green-400/40 bg-green-400/10 text-green-300",
    COMPLETED:       "border-green-400/40 bg-green-400/10 text-green-300",
    CLOSED:          "border-slate-400/40 bg-slate-400/10 text-slate-300",
    REJECTED:        "border-red-400/40 bg-red-400/10 text-red-300",
    CANCELLED:       "border-red-400/40 bg-red-400/10 text-red-300",
    ARCHIVED:        "border-gray-500/40 bg-gray-500/10 text-gray-400",
    DISMISSED:       "border-gray-500/40 bg-gray-500/10 text-gray-400",
  };
  return (
    <span
      className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        colorMap[value] || "border-white/10 bg-white/5 text-gray-400"
      }`}
    >
      {value || "UNKNOWN"}
    </span>
  );
};

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatFileSize = (bytes) => {
  if (!bytes) return "Size not available";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const documentTypeLabel = (doc = {}) => {
  const value = `${doc.mimeType || ""} ${doc.name || ""}`.toLowerCase();
  if (value.includes("pdf")) return "PDF";
  if (value.includes("webp")) return "WEBP image";
  if (value.includes("png")) return "PNG image";
  if (value.includes("jpg") || value.includes("jpeg")) return "JPEG image";
  return doc.mimeType || "Document";
};

// ─── Summary stat cards ──────────────────────────────────────────────────────
const SummaryCards = ({ data, config }) => {
  // Build a count map from status values
  const counts = {};
  data.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });

  const actionKey   = config[0]?.key;
  const midKeys     = config.slice(1, -1).filter((c) => !DONE_STATUSES.has(c.key) && c.key !== "ALL").map((c) => c.key);
  const doneKeys    = config.filter((c) => DONE_STATUSES.has(c.key)).map((c) => c.key);

  const cards = [
    { label: "Total",        value: data.length,                                                  textColor: "text-[var(--text-primary)]", border: "border-[var(--border-subtle)]"  },
    { label: "Needs Action", value: actionKey ? (counts[actionKey] || 0) : 0,                     textColor: "text-amber-300",              border: "border-amber-400/20"            },
    { label: "In Progress",  value: midKeys.reduce((s, k) => s + (counts[k] || 0), 0),            textColor: "text-sky-300",                border: "border-sky-400/20"              },
    { label: "Completed",    value: doneKeys.reduce((s, k) => s + (counts[k] || 0), 0),           textColor: "text-emerald-300",            border: "border-emerald-400/20"          },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-2xl border ${card.border} bg-[var(--surface-elevated)] px-4 py-3`}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{card.label}</p>
          <p className={`mt-0.5 text-2xl font-black ${card.textColor}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Status tab bar with live counts ────────────────────────────────────────
const StatusTabBar = ({ data, config, activeKey, onChange }) => {
  const counts = { ALL: data.length };
  data.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });

  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {config.map((tab) => {
        const count    = tab.key === "ALL" ? data.length : (counts[tab.key] || 0);
        const isActive = activeKey === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex-shrink-0 h-8 rounded-full px-3.5 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-[var(--accent-primary)] text-[#070707] shadow-sm"
                : "border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label} ({count})
          </button>
        );
      })}
    </div>
  );
};

// ─── Context-aware empty state ───────────────────────────────────────────────
const ModuleEmptyState = ({ statusKey, moduleLabel }) => {
  const isActionable = !DONE_STATUSES.has(statusKey) && statusKey !== "ALL";
  if (isActionable) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 py-12 text-center">
        <FiCheckCircle size={26} className="text-emerald-400" />
        <p className="text-sm font-semibold text-emerald-300">Everything is up to date</p>
        <p className="text-xs text-[var(--text-muted)]">No {moduleLabel} items require your attention right now.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-12 text-center">
      <FiClock size={26} className="text-[var(--text-muted)]" />
      <p className="text-sm font-semibold text-[var(--text-secondary)]">No records found</p>
      <p className="text-xs text-[var(--text-muted)]">
        No {moduleLabel} records{statusKey !== "ALL" ? " with this status" : ""} yet.
      </p>
    </div>
  );
};

// ─── Search bar ──────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3">
    <FiSearch size={13} className="text-[var(--text-muted)] shrink-0" />
    <input
      className="h-9 min-w-0 flex-1 border-none bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

// ─── Module filter toolbar (tabs + search stacked) ───────────────────────────
const ModuleFilters = ({ data, config, activeKey, onTabChange, searchValue, onSearch, searchPlaceholder }) => (
  <div className="flex flex-col gap-2">
    <StatusTabBar data={data} config={config} activeKey={activeKey} onChange={onTabChange} />
    <SearchBar value={searchValue} onChange={onSearch} placeholder={searchPlaceholder} />
  </div>
);

// ─── Utility: generic record filter ─────────────────────────────────────────
const applyFilter = (records, statusKey, rawQuery, searchFn) =>
  records.filter((record) => {
    const matchStatus = statusKey === "ALL" || record.status === statusKey;
    const query       = rawQuery.trim().toLowerCase();
    const matchSearch = !query || searchFn(record).toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });

// ============================================================================
//  CommunityAdmin — Main Component
// ============================================================================
const CommunityAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const { user }  = useSelector((state) => state.profile);

  // ── Module navigation ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("issues");
  const [loading,   setLoading]   = useState(false);
  const [busyId,    setBusyId]    = useState(null);

  // ── Raw data (fetched from backend) ───────────────────────────────────────
  const [issues,       setIssues]       = useState([]);
  const [bookings,     setBookings]     = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [polls,        setPolls]        = useState([]);
  const [reports,      setReports]      = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [shradhanjalis, setShradhanjalis] = useState([]);

  // ── Poll results modal state ───────────────────────────────────────────────
  const [pollResults,       setPollResults]       = useState(null);
  const [pollResultLoading, setPollResultLoading] = useState(false);
  const [pollResultFilter,  setPollResultFilter]  = useState("ALL");
  const [pollResultSearch,  setPollResultSearch]  = useState("");

  // ── Draft / form state (all unchanged) ────────────────────────────────────
  const [issueDrafts,   setIssueDrafts]   = useState({});
  const [bookingDrafts, setBookingDrafts] = useState({});
  const [blockDrafts,   setBlockDrafts]   = useState({});
  const [reportDrafts,  setReportDrafts]  = useState({});
  const [reviewDrafts,  setReviewDrafts]  = useState({});
  const [pollForm, setPollForm] = useState({
    title: "", description: "", options: "Yes\nNo", endsAt: "", status: "DRAFT",
    isMultipleChoice: false, maxSelections: 1, allowChangeVote: false,
  });
  const [blockForm, setBlockForm] = useState({ startDate: "", endDate: "", reason: "" });

  // ── Solution publish modal ─────────────────────────────────────────────────
  const [solutionModal,     setSolutionModal]     = useState(null);
  const [solutionForm,      setSolutionForm]      = useState({ solutionTitle: "", solutionSummary: "", solutionDetails: "", solutionCategory: "INFRASTRUCTURE" });
  const [publishingSolution, setPublishingSolution] = useState(false);

  // ── DocViewer ──────────────────────────────────────────────────────────────
  const [viewingDoc, setViewingDoc] = useState(null);

  // ── NEW: per-module status filter + search ────────────────────────────────
  const [statusFilters, setStatusFilters] = useState({ ...MODULE_DEFAULT_STATUS });
  const [moduleSearch,  setModuleSearch]  = useState({
    issues: "", bookings: "", blocks: "", polls: "", reports: "", achievements: "", shradhanjali: "",
  });

  const setFilter = (module, key) => setStatusFilters((prev) => ({ ...prev, [module]: key }));
  const setSearch = (module, val) => setModuleSearch((prev) => ({ ...prev, [module]: val }));

  // ── Auth config ────────────────────────────────────────────────────────────
  const authConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` }, withCredentials: true }),
    [token]
  );

  // ── Role / permission checks (unchanged) ──────────────────────────────────
  const userRoles            = user?.roles || [];
  const isPlatformAdmin      = userRoles.some((r) => ["SUPER_ADMIN", "Admin"].includes(r)) || user?.accountType === "Admin";
  const canModerateCommunity = isPlatformAdmin || userRoles.includes("MODERATOR");
  const canReviewStories     = canModerateCommunity;
  const canManageBookings    = isPlatformAdmin || userRoles.includes("DHARAMSHALA_ADMIN");
  const canManagePolls       = isPlatformAdmin;

  const visibleTabs = useMemo(
    () =>
      tabs.filter((tab) => {
        if (tab.key === "issues"  || tab.key === "reports")          return canModerateCommunity;
        if (tab.key === "achievements" || tab.key === "shradhanjali") return canReviewStories;
        if (tab.key === "bookings" || tab.key === "blocks")           return canManageBookings;
        if (tab.key === "polls")                                       return canManagePolls;
        return false;
      }),
    [canModerateCommunity, canManageBookings, canManagePolls, canReviewStories]
  );

  // ── Data loaders (unchanged, limit bumped to 100 for proper tab counts) ───
  const loadIssues = async () => {
    const res = await apiConnector("GET", communityEndpoints.ISSUES_API, null, authConfig, { limit: 100 });
    setIssues(res.data?.data?.issues || []);
  };
  const loadBookings = async () => {
    const res = await apiConnector("GET", communityEndpoints.DHARAMSHALA_BOOKINGS_API, null, authConfig, { limit: 100 });
    setBookings(res.data?.data?.bookings || []);
  };
  const loadBlockedDates = async () => {
    const res = await apiConnector("GET", communityEndpoints.DHARAMSHALA_BLOCKED_DATES_API, null, authConfig, { limit: 100 });
    setBlockedDates(res.data?.data?.blockedDates || []);
  };
  const loadPolls = async () => {
    const res = await apiConnector("GET", communityEndpoints.POLLS_API, null, authConfig, { admin: "true", limit: 100 });
    setPolls(res.data?.data?.polls || []);
  };
  const loadReports = async () => {
    const res = await apiConnector("GET", communityEndpoints.COMMUNITY_REPORTS_API, null, authConfig, { limit: 100 });
    setReports(res.data?.data?.reports || []);
  };
  const loadAchievements = async () => {
    const res = await apiConnector("GET", communityEndpoints.ADMIN_ACHIEVEMENTS_API, null, authConfig, { limit: 100 });
    setAchievements(res.data?.data?.achievements || []);
  };
  const loadShradhanjalis = async () => {
    const res = await apiConnector("GET", communityEndpoints.ADMIN_SHRADHANJALIS_API, null, authConfig, { limit: 100 });
    setShradhanjalis(res.data?.data?.shradhanjalis || []);
  };

  const loaders = useMemo(
    () => ({
      issues: loadIssues, bookings: loadBookings, blocks: loadBlockedDates,
      polls: loadPolls, reports: loadReports, achievements: loadAchievements,
      shradhanjali: loadShradhanjalis,
    }),
    [authConfig]
  );

  const refreshActive = async () => {
    setLoading(true);
    try { await loaders[activeTab](); }
    catch (err) { toast.error(err.response?.data?.message || "Unable to load admin data"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some((t) => t.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [visibleTabs, activeTab]);

  useEffect(() => {
    if (!visibleTabs.some((t) => t.key === activeTab)) return;
    refreshActive();
  }, [activeTab]);

  // ── Action handlers — ALL IDENTICAL TO ORIGINAL ──────────────────────────
  const updateIssueStatus = async (issueId, status) => {
    const draft = issueDrafts[issueId] || {};
    setBusyId(issueId);
    try {
      await apiConnector("PATCH", communityEndpoints.UPDATE_ISSUE_STATUS_API(issueId), { status, note: draft.note || undefined, reason: draft.reason || undefined }, authConfig);
      toast.success("Issue updated");
      await loadIssues();
    } catch (err) { toast.error(err.response?.data?.message || "Unable to update issue"); }
    finally { setBusyId(null); }
  };

  const reviewBooking = async (bookingId, action) => {
    const draft = bookingDrafts[bookingId] || {};
    const note  = (draft.reviewMessage || "").trim();
    if (action === "REJECT" && !note) {
      if (!window.confirm("Are you sure you want to reject this booking request without adding a rejection reason?")) return;
    }
    setBusyId(`${bookingId}-${action}`);
    try {
      await apiConnector("PATCH", communityEndpoints.REVIEW_DHARAMSHALA_BOOKING_API(bookingId), { action, reviewMessage: note || undefined, reviewNote: note || undefined }, authConfig);
      toast.success(action === "APPROVE" ? "Booking approved successfully" : "Booking rejected successfully");
      setBookingDrafts((c) => { const n = { ...c }; delete n[bookingId]; return n; });
      await loadBookings();
    } catch (err) { toast.error(err.response?.data?.message || "Unable to review booking"); }
    finally { setBusyId(null); }
  };

  const cancelBooking = async (bookingId) => {
    const draft = bookingDrafts[bookingId] || {};
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setBusyId(`${bookingId}-CANCEL`);
    try {
      await apiConnector("PATCH", communityEndpoints.CANCEL_DHARAMSHALA_BOOKING_API(bookingId), { reason: (draft.reviewMessage || "Cancelled by administrator").trim() }, authConfig);
      toast.success("Booking cancelled successfully");
      setBookingDrafts((c) => { const n = { ...c }; delete n[bookingId]; return n; });
      await loadBookings();
    } catch (err) { toast.error(err.response?.data?.message || "Unable to cancel booking"); }
    finally { setBusyId(null); }
  };

  const updateBookingLifecycle = async (bookingId, action) => {
    setBusyId(`${bookingId}-${action}`);
    try {
      await apiConnector("PATCH", communityEndpoints.UPDATE_DHARAMSHALA_BOOKING_LIFECYCLE_API(bookingId), { action }, authConfig);
      toast.success(action === "CHECK_IN" ? "Guest checked in" : "Booking marked completed");
      await loadBookings();
    } catch (err) { toast.error(err.response?.data?.message || "Unable to update booking lifecycle"); }
    finally { setBusyId(null); }
  };

  const refundBooking = async (booking) => {
    if (!booking.paymentId || !window.confirm("Process a full Razorpay refund for this cancelled booking?")) return;
    setBusyId(`${booking._id}-REFUND`);
    try {
      await apiConnector("POST", communityEndpoints.REFUND_DHARAMSHALA_PAYMENT_API(booking.paymentId), {}, authConfig);
      toast.success("Refund processed");
      await loadBookings();
    } catch (err) { toast.error(err.response?.data?.message || "Unable to process refund"); }
    finally { setBusyId(null); }
  };

  const createBlockedDate = async (event) => {
    event.preventDefault();
    setBusyId("block-create");
    try {
      await apiConnector("POST", communityEndpoints.DHARAMSHALA_BLOCKED_DATES_API, blockForm, authConfig);
      toast.success("Dates blocked");
      setBlockForm({ startDate: "", endDate: "", reason: "" });
      await loadBlockedDates();
    } catch (err) { toast.error(err.response?.data?.message || "Unable to block dates"); }
    finally { setBusyId(null); }
  };

  const archiveBlockedDate = async (blockId) => {
    const draft = blockDrafts[blockId] || {};
    setBusyId(blockId);
    try {
      await apiConnector("PATCH", communityEndpoints.ARCHIVE_DHARAMSHALA_BLOCKED_DATE_API(blockId), { reason: draft.reason || "Archived from dashboard" }, authConfig);
      toast.success("Blocked dates archived");
      await loadBlockedDates();
    } catch (err) { toast.error(err.response?.data?.message || "Unable to archive blocked dates"); }
    finally { setBusyId(null); }
  };

  const createPoll = async (event) => {
    event.preventDefault();
    const options = pollForm.options.split("\n").map((o) => o.trim()).filter(Boolean);
    if (options.length < 2) { toast.error("Add at least two options"); return; }
    setBusyId("poll-create");
    try {
      await apiConnector("POST", communityEndpoints.POLLS_API, { ...pollForm, options, maxSelections: pollForm.isMultipleChoice ? Number(pollForm.maxSelections) || 2 : 1 }, authConfig);
      toast.success("Poll created");
      setPollForm({ title: "", description: "", options: "Yes\nNo", endsAt: "", status: "DRAFT" });
      await loadPolls();
    } catch (err) { toast.error(err.response?.data?.message || "Unable to create poll"); }
    finally { setBusyId(null); }
  };

  const updatePollStatus = async (pollId, status) => {
    setBusyId(pollId);
    try {
      await apiConnector("PATCH", communityEndpoints.UPDATE_POLL_STATUS_API(pollId), { status }, authConfig);
      toast.success("Poll status updated");
      await loadPolls();
    } catch (err) { toast.error(err.response?.data?.message || "Unable to update poll"); }
    finally { setBusyId(null); }
  };

  const openPollResults = async (pollId) => {
    setPollResultLoading(true);
    setPollResults(null);
    setPollResultFilter("ALL");
    setPollResultSearch("");
    try {
      const res = await apiConnector("GET", communityEndpoints.POLL_RESULTS_API(pollId), null, authConfig);
      setPollResults(res.data?.data?.poll || null);
    } catch (err) { toast.error(err.response?.data?.message || "Unable to load poll results"); }
    finally { setPollResultLoading(false); }
  };

  const reviewReport = async (reportId, status) => {
    const draft = reportDrafts[reportId] || {};
    setBusyId(reportId);
    try {
      await apiConnector("PATCH", communityEndpoints.REVIEW_COMMUNITY_REPORT_API(reportId), { status, resolution: draft.resolution || undefined, targetStatus: draft.targetStatus || undefined }, authConfig);
      toast.success("Report reviewed");
      await loadReports();
    } catch (err) { toast.error(err.response?.data?.message || "Unable to review report"); }
    finally { setBusyId(null); }
  };

  const publishSolution = async (event) => {
    event.preventDefault();
    if (!solutionModal?.issueId) return;
    setPublishingSolution(true);
    try {
      await apiConnector("POST", communityEndpoints.PUBLISH_ISSUE_SOLUTION_API(solutionModal.issueId), { title: solutionForm.solutionTitle, summary: solutionForm.solutionSummary, solution: solutionForm.solutionDetails, category: solutionForm.solutionCategory, ...solutionForm }, authConfig);
      toast.success("Published as community solution");
      setSolutionModal(null);
      setSolutionForm({ solutionTitle: "", solutionSummary: "", solutionDetails: "", solutionCategory: "INFRASTRUCTURE" });
      await loadIssues();
    } catch (err) { toast.error(err.response?.data?.message || "Unable to publish solution"); }
    finally { setPublishingSolution(false); }
  };

  const reviewStory = async (type, itemId, status) => {
    const draft    = reviewDrafts[itemId] || {};
    const endpoint = type === "achievement"
      ? communityEndpoints.REVIEW_ACHIEVEMENT_API(itemId)
      : communityEndpoints.REVIEW_SHRADHANJALI_API(itemId);
    setBusyId(itemId);
    try {
      await apiConnector("PATCH", endpoint, { status, reason: draft.reason || undefined }, authConfig);
      toast.success("Review updated");
      if (type === "achievement") await loadAchievements();
      else await loadShradhanjalis();
    } catch (err) { toast.error(err.response?.data?.message || "Unable to update review"); }
    finally { setBusyId(null); }
  };

  // ── Poll voters filter (unchanged) ────────────────────────────────────────
  const fetchShradhanjaliDocument = async (item, { download = false } = {}) => {
    const response = await apiConnector(
      "GET",
      communityEndpoints.SHRADHANJALI_SUPPORTING_DOCUMENT_API(item._id),
      null,
      authConfig,
      download ? { download: "true" } : undefined
    );
    return response.data?.data;
  };

  const viewShradhanjaliDocument = async (item) => {
    try {
      const data = await fetchShradhanjaliDocument(item);
      if (!data?.signedUrl) throw new Error("Missing document URL");
      setViewingDoc({
        url: data.signedUrl,
        title: `${item.personName} - Supporting Document`,
        sourceItem: item,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to open supporting document");
    }
  };

  const downloadShradhanjaliDocument = async (item) => {
    const tab = window.open("", "_blank", "noopener,noreferrer");
    try {
      const data = await fetchShradhanjaliDocument(item, { download: true });
      if (!data?.signedUrl) throw new Error("Missing document URL");
      if (tab) tab.location.href = data.signedUrl;
      else window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      if (tab) tab.close();
      toast.error(err.response?.data?.message || "Unable to download supporting document");
    }
  };

  const filteredPollVoters = (pollResults?.voters || []).filter((voter) => {
    const selectedLabels = (voter.selectedOptions || []).map((o) => o.label);
    const matchesOption  = pollResultFilter === "ALL" || selectedLabels.includes(pollResultFilter);
    const matchesSearch  = !pollResultSearch.trim() || voter.name?.toLowerCase().includes(pollResultSearch.trim().toLowerCase());
    return matchesOption && matchesSearch;
  });

  // ── Per-module filtered record sets ───────────────────────────────────────
  const filteredIssues = useMemo(() =>
    applyFilter(issues, statusFilters.issues, moduleSearch.issues,
      (r) => `${r.title} ${r.description} ${r.category} ${r.priority}`),
    [issues, statusFilters.issues, moduleSearch.issues]);

  const filteredBookings = useMemo(() =>
    applyFilter(bookings, statusFilters.bookings, moduleSearch.bookings,
      (r) => [r.bookingReference, r.roomType, r.guestName, r.guestEmail, r.requester?.firstName, r.requester?.lastName, r.requester?.email].filter(Boolean).join(" ")),
    [bookings, statusFilters.bookings, moduleSearch.bookings]);

  const filteredBlocks = useMemo(() =>
    applyFilter(blockedDates, statusFilters.blocks, moduleSearch.blocks,
      (r) => `${r.reason} ${r.createdBy?.firstName || ""} ${r.createdBy?.lastName || ""}`),
    [blockedDates, statusFilters.blocks, moduleSearch.blocks]);

  const filteredPolls = useMemo(() =>
    applyFilter(polls, statusFilters.polls, moduleSearch.polls,
      (r) => `${r.title} ${r.description || ""}`),
    [polls, statusFilters.polls, moduleSearch.polls]);

  const filteredReports = useMemo(() =>
    applyFilter(reports, statusFilters.reports, moduleSearch.reports,
      (r) => `${r.reason} ${r.targetType} ${r.post?.title || ""} ${r.reportedBy?.firstName || ""}`),
    [reports, statusFilters.reports, moduleSearch.reports]);

  const filteredAchievements = useMemo(() =>
    applyFilter(achievements, statusFilters.achievements, moduleSearch.achievements,
      (r) => `${r.title} ${r.achieverName} ${r.category || ""} ${r.organization || ""}`),
    [achievements, statusFilters.achievements, moduleSearch.achievements]);

  const filteredShradhanjalis = useMemo(() =>
    applyFilter(shradhanjalis, statusFilters.shradhanjali, moduleSearch.shradhanjali,
      (r) => `${r.personName} ${r.message || ""}`),
    [shradhanjalis, statusFilters.shradhanjali, moduleSearch.shradhanjali]);

  // ══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">

          {/* ── Page header ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="eyebrow-badge mb-2">
                  <FaClipboardList size={12} />
                  <span>Operations</span>
                </div>
                <h1 className="heading-hero text-[var(--text-primary)]">
                  Community <span className="text-gradient">Admin</span>
                </h1>
                <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
                  Review member requests, resolve issues, manage dharamshala bookings, run polls, and handle reports.
                </p>
              </div>
              <Button icon={FaSyncAlt} onClick={refreshActive} disabled={loading}>Refresh</Button>
            </div>

            {/* Module navigation */}
            <div className="flex flex-wrap gap-2">
              {visibleTabs.map((tab) => {
                const Icon   = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                      active
                        ? "bg-[var(--accent-primary)] text-[#070707] shadow-md"
                        : "border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <Icon size={12} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Content area ────────────────────────────────────────────── */}
          {visibleTabs.length === 0 ? (
            <ModuleEmptyState statusKey="ALL" moduleLabel="community admin" />
          ) : loading ? (
            <div className="flex h-56 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
            </div>
          ) : (
            <>
              {/* ════════════════════════════════════════════════════════════
                  ISSUES
              ════════════════════════════════════════════════════════════ */}
{activeTab === "issues" && (
                <section className="grid gap-4">
                  <SummaryCards data={issues} config={MODULE_STATUS_CONFIG.issues} />

                  <ModuleFilters
                    data={issues}
                    config={MODULE_STATUS_CONFIG.issues}
                    activeKey={statusFilters.issues}
                    onTabChange={(k) => setFilter("issues", k)}
                    searchValue={moduleSearch.issues}
                    onSearch={(v) => setSearch("issues", v)}
                    searchPlaceholder="Search title, description, category..."
                  />

                  {filteredIssues.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.issues} moduleLabel="issue" />
                  ) : (
                    <div className="grid gap-3">
                      {filteredIssues.map((issue) => {
                        const isDone = DONE_STATUSES.has(issue.status);
                        return (
                          <article
                            key={issue._id}
                            className={`rounded-2xl border p-5 transition ${
                              isDone
                                ? "border-white/5 bg-white/[0.01] opacity-75"
                                : "border-white/10 bg-white/[0.02]"
                            }`}
                          >
                            {/* Header row */}
                            <div className="flex flex-wrap items-start gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start gap-2 mb-1">
                                  <h2 className={`text-sm font-bold leading-snug ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
                                    {issue.title}
                                  </h2>
                                  <StatusBadge value={issue.status} />
                                </div>
                                {/* line-clamp-2 hata diya hai taaki description poora dikhe */}
                                <p className="text-xs text-gray-400 leading-relaxed break-words">{issue.description}</p>
                                
                                {/* Agar rejection ya koi special reason hai toh use yahan poora dikhane ke liye */}
                                {issue.reason && (
                                  <p className="mt-1.5 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                    <strong className="font-semibold">Reason:</strong> {issue.reason}
                                  </p>
                                )}

                                <p className="mt-1 text-[11px] text-gray-600">
                                  {issue.category || "General"} · {issue.priority} · {formatDate(issue.createdAt)}
                                </p>
                              </div>
                            </div>

                            {/* Context-aware action buttons */}
                            {!isDone && (
                              <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 lg:grid-cols-[1fr_1fr_auto]">
                                <input
                                  className={inputClass}
                                  value={issueDrafts[issue._id]?.note || ""}
                                  onChange={(e) => setIssueDrafts((c) => ({ ...c, [issue._id]: { ...c[issue._id], note: e.target.value } }))}
                                  placeholder="Status note"
                                />
                                <input
                                  className={inputClass}
                                  value={issueDrafts[issue._id]?.reason || ""}
                                  onChange={(e) => setIssueDrafts((c) => ({ ...c, [issue._id]: { ...c[issue._id], reason: e.target.value } }))}
                                  placeholder="Reason (if rejecting)"
                                />
                                <div className="flex flex-wrap gap-2">
                                  {issue.status === "SUBMITTED" && (
                                    <Button onClick={() => updateIssueStatus(issue._id, "UNDER_REVIEW")} disabled={busyId === issue._id}>Review</Button>
                                  )}
                                  {["SUBMITTED", "UNDER_REVIEW"].includes(issue.status) && (
                                    <Button tone="warning" onClick={() => updateIssueStatus(issue._id, "IN_PROGRESS")} disabled={busyId === issue._id}>Progress</Button>
                                  )}
                                  {["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS"].includes(issue.status) && (
                                    <Button tone="success" onClick={() => updateIssueStatus(issue._id, "RESOLVED")} disabled={busyId === issue._id}>Resolve</Button>
                                  )}
                                  <Button tone="danger" onClick={() => updateIssueStatus(issue._id, "REJECTED")} disabled={busyId === issue._id}>Reject</Button>
                                </div>
                              </div>
                            )}

                            {/* Publish-as-solution (resolved but not yet public) */}
                            {issue.status === "RESOLVED" && !issue.isPublicSolution && (
                              <div className="mt-3">
                                <Button
                                  icon={FaGlobe}
                                  tone="warning"
                                  onClick={() => {
                                    setSolutionModal({ issueId: issue._id, title: issue.title, description: issue.description });
                                    setSolutionForm({ solutionTitle: issue.title, solutionSummary: issue.adminStatusNote || "", solutionDetails: "", solutionCategory: "INFRASTRUCTURE" });
                                  }}
                                  disabled={busyId === issue._id}
                                >
                                  Publish as Community Solution
                                </Button>
                              </div>
                            )}
                            {issue.isPublicSolution && (
                              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
                                <FaGlobe size={10} /> Published as Community Solution
                              </span>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* ════════════════════════════════════════════════════════════
                  BOOKINGS
              ════════════════════════════════════════════════════════════ */}
              {activeTab === "bookings" && (
                <section className="grid gap-4">
                  <SummaryCards data={bookings} config={MODULE_STATUS_CONFIG.bookings} />

                  <ModuleFilters
                    data={bookings}
                    config={MODULE_STATUS_CONFIG.bookings}
                    activeKey={statusFilters.bookings}
                    onTabChange={(k) => setFilter("bookings", k)}
                    searchValue={moduleSearch.bookings}
                    onSearch={(v) => setSearch("bookings", v)}
                    searchPlaceholder="Search booking ref, guest name, email, room..."
                  />

                  {filteredBookings.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.bookings} moduleLabel="booking" />
                  ) : (
                    <div className="grid gap-3">
                      {filteredBookings.map((booking) => {
                        const isDone = DONE_STATUSES.has(booking.status);
                        return (
                          <article
                            key={booking._id}
                            className={`rounded-2xl border p-5 transition ${
                              isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"
                            }`}
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{booking.bookingReference || booking._id?.slice(-8)}</span>
                                  <StatusBadge value={booking.status} />
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${booking.isMember ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                                    {booking.isMember ? "MEMBER" : "GUEST"}
                                  </span>
                                </div>
                                <h2 className={`text-sm font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
                                  {booking.dharamshalaName || booking.dharamshala?.name || "Samaj Dharamshala"} — {booking.roomType || "Standard"}
                                </h2>
                                <p className="text-xs text-gray-400"><strong>Purpose:</strong> {booking.purpose}</p>
                                <p className="text-xs text-gray-500">📅 {formatDate(booking.startDate)} to {formatDate(booking.endDate)} · {booking.roomsRequested || 1} room(s) · {booking.numberOfGuests || 1} guest(s)</p>
                                <p className="text-xs text-gray-400">
                                  👤 <strong>Applicant:</strong>{" "}
                                  {booking.guestName || `${booking.requester?.firstName || ""} ${booking.requester?.lastName || ""}`}{" "}
                                  ({booking.guestPhone || "No Phone"}) · {booking.guestEmail || booking.requester?.email || ""}
                                </p>
                                <p className="text-xs font-bold text-emerald-400">
                                  💰 Total: {formatDharamshalaPrice(booking.totalAmount, "Price unavailable")} ({booking.paymentStatus || "NOT_REQUIRED"})
                                </p>
                              </div>
                            </div>

                            {(booking.reviewNote || booking.reviewMessage || booking.cancellationReason) && (
                              <div className={`mt-3 rounded-xl border p-3 text-xs ${
                                booking.status === "REJECTED"
                                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                                  : ["APPROVED", "PAYMENT_PENDING"].includes(booking.status)
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-gray-500/30 bg-gray-500/10 text-gray-300"
                              }`}>
                                <p className="font-bold uppercase tracking-wider text-[10px]">
                                  {booking.status === "CANCELLED" ? "Cancellation Reason" : ["APPROVED", "PAYMENT_PENDING"].includes(booking.status) ? "Admin Note" : "Rejection Reason"}
                                </p>
                                <p className="mt-1 leading-relaxed text-[var(--text-primary)] text-xs">
                                  {booking.status === "CANCELLED" ? booking.cancellationReason : (booking.reviewNote || booking.reviewMessage)}
                                </p>
                              </div>
                            )}

                            {booking.status === "PENDING" && (
                              <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 lg:grid-cols-[1fr_auto_auto_auto]">
                                <input className={inputClass} value={bookingDrafts[booking._id]?.reviewMessage || ""} onChange={(e) => setBookingDrafts((c) => ({ ...c, [booking._id]: { reviewMessage: e.target.value } }))} placeholder="Review message / Rejection reason" disabled={Boolean(busyId && busyId.startsWith(booking._id))} />
                                <Button icon={FaCheck} tone="success" onClick={() => reviewBooking(booking._id, "APPROVE")} disabled={Boolean(busyId)}>{busyId === `${booking._id}-APPROVE` ? "Approving..." : "Approve"}</Button>
                                <Button icon={FaTimes} tone="danger" onClick={() => reviewBooking(booking._id, "REJECT")} disabled={Boolean(busyId)}>{busyId === `${booking._id}-REJECT` ? "Rejecting..." : "Reject"}</Button>
                                <Button tone="warning" onClick={() => cancelBooking(booking._id)} disabled={Boolean(busyId)}>{busyId === `${booking._id}-CANCEL` ? "Cancelling..." : "Cancel"}</Button>
                              </div>
                            )}
                            {booking.status === "CONFIRMED" && (
                              <div className="mt-4 border-t border-white/10 pt-4">
                                <Button icon={FaCheck} tone="success" onClick={() => updateBookingLifecycle(booking._id, "CHECK_IN")} disabled={Boolean(busyId)}>{busyId === `${booking._id}-CHECK_IN` ? "Checking in..." : "Check In"}</Button>
                              </div>
                            )}
                            {booking.status === "CHECKED_IN" && (
                              <div className="mt-4 border-t border-white/10 pt-4">
                                <Button icon={FaCheck} tone="success" onClick={() => updateBookingLifecycle(booking._id, "COMPLETE")} disabled={Boolean(busyId)}>{busyId === `${booking._id}-COMPLETE` ? "Completing..." : "Mark Completed"}</Button>
                              </div>
                            )}
                            {booking.status === "CANCELLED" && booking.paymentStatus === "REFUND_PENDING" && booking.paymentId && (
                              <div className="mt-4 border-t border-white/10 pt-4">
                                <Button icon={FaCheck} tone="warning" onClick={() => refundBooking(booking)} disabled={Boolean(busyId)}>{busyId === `${booking._id}-REFUND` ? "Refunding..." : "Process Refund"}</Button>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* ════════════════════════════════════════════════════════════
                  BLOCKS (split: create form left, list right)
              ════════════════════════════════════════════════════════════ */}
              {activeTab === "blocks" && (
                <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                  {/* Create form — unchanged */}
                  <form onSubmit={createBlockedDate} className="grid h-fit gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2">
                      <FaCalendarTimes className="text-emerald-300" size={14} />
                      <h2 className="text-base font-bold text-[var(--text-primary)]">Block Dharamshala Dates</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Start Date"><input type="date" className={inputClass} value={blockForm.startDate} onChange={(e) => setBlockForm((c) => ({ ...c, startDate: e.target.value }))} required /></Field>
                      <Field label="End Date"><input type="date" className={inputClass} value={blockForm.endDate} onChange={(e) => setBlockForm((c) => ({ ...c, endDate: e.target.value }))} required /></Field>
                    </div>
                    <Field label="Reason"><textarea className={textareaClass} value={blockForm.reason} onChange={(e) => setBlockForm((c) => ({ ...c, reason: e.target.value }))} required /></Field>
                    <Button icon={FaPaperPlane} tone="success" disabled={busyId === "block-create"}>Block Dates</Button>
                  </form>

                  {/* Blocked-dates list with status tabs */}
                  <section className="grid content-start gap-3">
                    <SummaryCards data={blockedDates} config={MODULE_STATUS_CONFIG.blocks} />
                    <ModuleFilters
                      data={blockedDates}
                      config={MODULE_STATUS_CONFIG.blocks}
                      activeKey={statusFilters.blocks}
                      onTabChange={(k) => setFilter("blocks", k)}
                      searchValue={moduleSearch.blocks}
                      onSearch={(v) => setSearch("blocks", v)}
                      searchPlaceholder="Search reason, created by..."
                    />

                    {filteredBlocks.length === 0 ? (
                      <ModuleEmptyState statusKey={statusFilters.blocks} moduleLabel="blocked date" />
                    ) : (
                      <div className="grid gap-3">
                        {filteredBlocks.map((block) => {
                          const isDone = DONE_STATUSES.has(block.status);
                          return (
                            <article key={block._id} className={`rounded-2xl border p-5 transition ${isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"}`}>
                              <div className="flex flex-wrap items-start gap-2 mb-1">
                                <h2 className={`text-sm font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
                                  {formatDate(block.startDate)} – {formatDate(block.endDate)}
                                </h2>
                                <StatusBadge value={block.status} />
                              </div>
                              <p className="text-xs text-gray-500">{block.reason}</p>
                              <p className="mt-1 text-[11px] text-gray-600">Created by {block.createdBy?.firstName || "Admin"} {block.createdBy?.lastName || ""}</p>
                              {!isDone && (
                                <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-[1fr_auto]">
                                  <input className={inputClass} value={blockDrafts[block._id]?.reason || ""} onChange={(e) => setBlockDrafts((c) => ({ ...c, [block._id]: { reason: e.target.value } }))} placeholder="Archive reason" />
                                  <Button icon={FaArchive} tone="danger" onClick={() => archiveBlockedDate(block._id)} disabled={block.status !== "ACTIVE" || busyId === block._id}>Archive</Button>
                                </div>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  POLLS (split: create form left, list right)
              ════════════════════════════════════════════════════════════ */}
              {activeTab === "polls" && (
                <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                  {/* Create poll form — unchanged */}
                  <form onSubmit={createPoll} className="grid h-fit gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2">
                      <FaClipboardList className="text-emerald-300" size={14} />
                      <h2 className="text-base font-bold text-[var(--text-primary)]">Create Poll</h2>
                    </div>
                    <Field label="Title"><input className={inputClass} value={pollForm.title} onChange={(e) => setPollForm((c) => ({ ...c, title: e.target.value }))} required /></Field>
                    <Field label="Description"><textarea className={textareaClass} value={pollForm.description} onChange={(e) => setPollForm((c) => ({ ...c, description: e.target.value }))} /></Field>
                    <Field label="Options (one per line)"><textarea className={textareaClass} value={pollForm.options} onChange={(e) => setPollForm((c) => ({ ...c, options: e.target.value }))} required /></Field>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Ends At"><input type="datetime-local" className={inputClass} value={pollForm.endsAt} onChange={(e) => setPollForm((c) => ({ ...c, endsAt: e.target.value }))} required /></Field>
                      <Field label="Initial Status">
                        <select className={inputClass} value={pollForm.status} onChange={(e) => setPollForm((c) => ({ ...c, status: e.target.value }))}>
                          <option value="DRAFT">Draft</option>
                          <option value="ACTIVE">Active</option>
                        </select>
                      </Field>
                    </div>
                    <div className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Voting Options</p>
                      <label className="flex cursor-pointer items-center gap-2.5">
                        <input type="checkbox" checked={pollForm.isMultipleChoice} onChange={(e) => setPollForm((c) => ({ ...c, isMultipleChoice: e.target.checked }))} className="h-4 w-4 rounded accent-[var(--accent-primary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Allow multiple choice voting</span>
                      </label>
                      {pollForm.isMultipleChoice && (
                        <Field label="Max Selections"><input type="number" min="2" max="10" className={inputClass} value={pollForm.maxSelections} onChange={(e) => setPollForm((c) => ({ ...c, maxSelections: e.target.value }))} /></Field>
                      )}
                      <label className="flex cursor-pointer items-center gap-2.5">
                        <input type="checkbox" checked={pollForm.allowChangeVote} onChange={(e) => setPollForm((c) => ({ ...c, allowChangeVote: e.target.checked }))} className="h-4 w-4 rounded accent-[var(--accent-primary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Allow members to change their vote</span>
                      </label>
                    </div>
                    <Button icon={FaPaperPlane} tone="success" disabled={busyId === "poll-create"}>Create Poll</Button>
                  </form>

                  {/* Poll list with status tabs */}
                  <section className="grid content-start gap-3">
                    <SummaryCards data={polls} config={MODULE_STATUS_CONFIG.polls} />
                    <ModuleFilters
                      data={polls}
                      config={MODULE_STATUS_CONFIG.polls}
                      activeKey={statusFilters.polls}
                      onTabChange={(k) => setFilter("polls", k)}
                      searchValue={moduleSearch.polls}
                      onSearch={(v) => setSearch("polls", v)}
                      searchPlaceholder="Search poll title, description..."
                    />

                    {filteredPolls.length === 0 ? (
                      <ModuleEmptyState statusKey={statusFilters.polls} moduleLabel="poll" />
                    ) : (
                      <div className="grid gap-3">
                        {filteredPolls.map((poll) => {
                          const isDone = DONE_STATUSES.has(poll.status);
                          return (
                            <article key={poll._id} className={`rounded-2xl border p-5 transition ${isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"}`}>
                              <div className="flex flex-wrap items-start gap-2 mb-1">
                                <h2 className={`text-sm font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>{poll.title}</h2>
                                <StatusBadge value={poll.status} />
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">{poll.description}</p>
                              <p className="mt-1 text-[11px] text-gray-600">{poll.totalVotes || 0} votes · ends {formatDate(poll.endsAt)}</p>
                              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                                <Button icon={FiEye} onClick={() => openPollResults(poll._id)} disabled={pollResultLoading}>View Results</Button>
                                {poll.status !== "ACTIVE"   && <Button tone="success" onClick={() => updatePollStatus(poll._id, "ACTIVE")}   disabled={busyId === poll._id}>Activate</Button>}
                                {poll.status === "ACTIVE"   && <Button tone="warning" onClick={() => updatePollStatus(poll._id, "CLOSED")}   disabled={busyId === poll._id}>Close</Button>}
                                {poll.status !== "ARCHIVED" && <Button tone="danger"  onClick={() => updatePollStatus(poll._id, "ARCHIVED")} disabled={busyId === poll._id}>Archive</Button>}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  REPORTS
              ════════════════════════════════════════════════════════════ */}
              {activeTab === "reports" && (
                <section className="grid gap-4">
                  <SummaryCards data={reports} config={MODULE_STATUS_CONFIG.reports} />
                  <ModuleFilters
                    data={reports}
                    config={MODULE_STATUS_CONFIG.reports}
                    activeKey={statusFilters.reports}
                    onTabChange={(k) => setFilter("reports", k)}
                    searchValue={moduleSearch.reports}
                    onSearch={(v) => setSearch("reports", v)}
                    searchPlaceholder="Search reason, target type, reporter..."
                  />

                  {filteredReports.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.reports} moduleLabel="report" />
                  ) : (
                    <div className="grid gap-3">
                      {filteredReports.map((report) => {
                        const isDone = DONE_STATUSES.has(report.status);
                        return (
                          <article key={report._id} className={`rounded-2xl border p-5 transition ${isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"}`}>
                            <div className="flex flex-wrap items-start gap-2 mb-1">
                              <h2 className={`text-sm font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>{report.targetType} Report</h2>
                              <StatusBadge value={report.status} />
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">{report.reason}</p>
                            <p className="mt-1 text-[11px] text-gray-600">
                              {report.post?.title || report.comment?.body || "Target unavailable"} · by {report.reportedBy?.firstName || "Member"}
                            </p>
                            {!isDone && (
                              <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 lg:grid-cols-[1fr_220px_auto_auto]">
                                <input className={inputClass} value={reportDrafts[report._id]?.resolution || ""} onChange={(e) => setReportDrafts((c) => ({ ...c, [report._id]: { ...c[report._id], resolution: e.target.value } }))} placeholder="Resolution note" />
                                <select className={inputClass} value={reportDrafts[report._id]?.targetStatus || ""} onChange={(e) => setReportDrafts((c) => ({ ...c, [report._id]: { ...c[report._id], targetStatus: e.target.value } }))}>
                                  <option value="">Leave target unchanged</option>
                                  <option value="PUBLISHED">Publish</option>
                                  <option value="HIDDEN">Hide</option>
                                  <option value="ARCHIVED">Archive</option>
                                </select>
                                <Button tone="success" onClick={() => reviewReport(report._id, "RESOLVED")} disabled={busyId === report._id}>Resolve</Button>
                                <Button onClick={() => reviewReport(report._id, "DISMISSED")} disabled={busyId === report._id}>Dismiss</Button>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* ════════════════════════════════════════════════════════════
                  ACHIEVEMENTS (PRIDE)
              ════════════════════════════════════════════════════════════ */}
              {activeTab === "achievements" && (
                <section className="grid gap-4">
                  <SummaryCards data={achievements} config={MODULE_STATUS_CONFIG.achievements} />
                  <ModuleFilters
                    data={achievements}
                    config={MODULE_STATUS_CONFIG.achievements}
                    activeKey={statusFilters.achievements}
                    onTabChange={(k) => setFilter("achievements", k)}
                    searchValue={moduleSearch.achievements}
                    onSearch={(v) => setSearch("achievements", v)}
                    searchPlaceholder="Search honoree name, title, category..."
                  />

                  {filteredAchievements.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.achievements} moduleLabel="pride submission" />
                  ) : (
                    <div className="grid gap-3">
                      {filteredAchievements.map((achievement) => {
                        const photoUrl = achievement.recipientPhoto?.url || achievement.image?.url;
                        const docUrl   = achievement.supportingDocument?.url;
                        const isDone   = DONE_STATUSES.has(achievement.status);
                        return (
                          <article key={achievement._id} className={`rounded-2xl border p-5 transition ${isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"}`}>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                              {photoUrl && (
                                <div className="relative flex aspect-[4/5] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-2 shadow-md sm:w-24">
                                  <img src={photoUrl} alt={achievement.title} className="h-full w-full object-contain" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start gap-2 mb-1">
                                  <h2 className={`text-sm font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>{achievement.title}</h2>
                                  <StatusBadge value={achievement.status} />
                                  <span className="rounded-md border border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">{achievement.category || "General"}</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                  Honoree: <strong className="text-white">{achievement.achieverName}</strong>
                                  {achievement.organization ? ` · ${achievement.organization}` : ""}
                                  {achievement.year ? ` (${achievement.year})` : ""}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs text-gray-400">{achievement.description}</p>
                                {docUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setViewingDoc({ url: docUrl, title: `${achievement.achieverName} - Verification Proof` })}
                                    className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                                  >
                                    <FiFileText size={13} /><span>View Uploaded Proof</span><FiEye size={12} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Context-aware action buttons */}
                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                              <input
                                className={`${inputClass} flex-1`}
                                value={reviewDrafts[achievement._id]?.reason || ""}
                                onChange={(e) => setReviewDrafts((c) => ({ ...c, [achievement._id]: { reason: e.target.value } }))}
                                placeholder="Review reason"
                              />
                              {achievement.status === "PENDING" && (
                                <>
                                  <Button tone="success" onClick={() => reviewStory("achievement", achievement._id, "PUBLISHED")} disabled={busyId === achievement._id}>Publish</Button>
                                  <Button tone="warning" onClick={() => reviewStory("achievement", achievement._id, "REJECTED")}  disabled={busyId === achievement._id}>Reject</Button>
                                </>
                              )}
                              {["PUBLISHED", "REJECTED"].includes(achievement.status) && (
                                <Button tone="danger" onClick={() => reviewStory("achievement", achievement._id, "ARCHIVED")} disabled={busyId === achievement._id}>Archive</Button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* ════════════════════════════════════════════════════════════
                  SHRADHANJALI (TRIBUTE)
              ════════════════════════════════════════════════════════════ */}
              {activeTab === "shradhanjali" && (
                <section className="grid gap-4">
                  <SummaryCards data={shradhanjalis} config={MODULE_STATUS_CONFIG.shradhanjali} />
                  <ModuleFilters
                    data={shradhanjalis}
                    config={MODULE_STATUS_CONFIG.shradhanjali}
                    activeKey={statusFilters.shradhanjali}
                    onTabChange={(k) => setFilter("shradhanjali", k)}
                    searchValue={moduleSearch.shradhanjali}
                    onSearch={(v) => setSearch("shradhanjali", v)}
                    searchPlaceholder="Search person name, message..."
                  />

                  {filteredShradhanjalis.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.shradhanjali} moduleLabel="tribute submission" />
                  ) : (
                    <div className="grid gap-3">
                      {filteredShradhanjalis.map((item) => {
                        const isDone = DONE_STATUSES.has(item.status);
                        const supportingDocument = item.supportingDocument;
                        return (
                          <article key={item._id} className={`rounded-2xl border p-5 transition ${isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"}`}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                              {item.photo?.url && (
                                <img src={item.photo.url} alt={item.personName} className="h-16 w-20 shrink-0 rounded-xl border border-[var(--border-subtle)] object-cover" />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start gap-2 mb-1">
                                  <h2 className={`text-sm font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>{item.personName}</h2>
                                  <StatusBadge value={item.status} />
                                </div>
                                <p className="text-xs text-gray-500">Passed on {formatDate(item.dateOfPassing)}</p>
                                <p className="mt-1 line-clamp-2 text-xs text-gray-600">{item.message}</p>
                                <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60 p-3">
                                  {supportingDocument?.publicId || supportingDocument?.url ? (
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                      <div className="min-w-0">
                                        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                                          <FiFileText size={14} />
                                          <span className="truncate">{supportingDocument.name || "Supporting Document"}</span>
                                        </p>
                                        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                                          {documentTypeLabel(supportingDocument)} · {formatFileSize(supportingDocument.size)} · Uploaded {formatDate(supportingDocument.uploadedAt || item.createdAt)}
                                        </p>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        <Button icon={FiEye} tone="neutral" onClick={() => viewShradhanjaliDocument(item)}>
                                          View Supporting Document
                                        </Button>
                                        <Button icon={FiDownload} tone="neutral" onClick={() => downloadShradhanjaliDocument(item)}>
                                          Download Document
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs font-semibold text-[var(--text-muted)]">Supporting document not available</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Context-aware action buttons */}
                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                              <input
                                className={`${inputClass} flex-1`}
                                value={reviewDrafts[item._id]?.reason || ""}
                                onChange={(e) => setReviewDrafts((c) => ({ ...c, [item._id]: { reason: e.target.value } }))}
                                placeholder="Review reason"
                              />
                              {item.status === "PENDING" && (
                                <>
                                  <Button tone="success" onClick={() => reviewStory("shradhanjali", item._id, "PUBLISHED")} disabled={busyId === item._id}>Publish</Button>
                                  <Button tone="warning" onClick={() => reviewStory("shradhanjali", item._id, "REJECTED")}  disabled={busyId === item._id}>Reject</Button>
                                </>
                              )}
                              {["PUBLISHED", "REJECTED"].includes(item.status) && (
                                <Button tone="danger" onClick={() => reviewStory("shradhanjali", item._id, "ARCHIVED")} disabled={busyId === item._id}>Archive</Button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          POLL RESULTS MODAL — UNCHANGED
      ══════════════════════════════════════════════════════════════════════ */}
      {pollResults || pollResultLoading ? (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/75 px-3 py-6 sm:px-4 sm:py-8 backdrop-blur-md">
          <div className="ka-card flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden border border-[var(--border-strong)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] p-4 sm:p-5">
              <div>
                <span className="eyebrow-badge mb-2">Poll Results</span>
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">{pollResults?.title || "Loading poll results..."}</h2>
                {pollResults?.description && <p className="mt-1 text-xs text-[var(--text-secondary)]">{pollResults.description}</p>}
              </div>
              <button type="button" onClick={() => setPollResults(null)} className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <FiX size={18} />
              </button>
            </div>

            <div className="grid gap-5 overflow-y-auto p-4 sm:p-5 lg:grid-cols-[0.9fr_1.1fr]">
              {pollResultLoading ? (
                <div className="flex h-56 items-center justify-center lg:col-span-2">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
                </div>
              ) : (
                <>
                  <section className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Votes</p>
                        <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">{pollResults?.totalVotes || 0}</p>
                      </div>
                      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Unique Voters</p>
                        <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">{pollResults?.uniqueVoters || 0}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {(pollResults?.options || []).map((option) => (
                        <div key={option._id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3.5">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-bold text-[var(--text-primary)]">{option.label}</span>
                            <span className="font-mono font-bold text-[var(--accent-primary)]">{option.voteCount || 0} votes · {Math.round(option.percentage || 0)}%</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--surface)]">
                            <div className="h-full rounded-full bg-[var(--accent-primary)]" style={{ width: `${Math.min(option.percentage || 0, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3">
                        <FiSearch className="text-[var(--text-muted)]" />
                        <input className="h-10 min-w-0 flex-1 border-none bg-transparent text-xs text-[var(--text-primary)] outline-none" value={pollResultSearch} onChange={(e) => setPollResultSearch(e.target.value)} placeholder="Search member..." />
                      </div>
                      <select className={inputClass} value={pollResultFilter} onChange={(e) => setPollResultFilter(e.target.value)}>
                        <option value="ALL">All Voters</option>
                        {(pollResults?.options || []).map((option) => (
                          <option key={option._id} value={option.label}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Voters ({filteredPollVoters.length})</h3>
                    <div className="grid max-h-[46vh] gap-2 overflow-y-auto pr-1">
                      {filteredPollVoters.map((voter) => (
                        <article key={`${voter.memberId}-${voter.updatedAt}`} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-bold text-[var(--text-primary)]">{voter.name}</h4>
                              <p className="mt-1 text-xs text-[var(--text-secondary)]">Selected: {(voter.selectedOptions || []).map((o) => o.label).join(", ") || "No option"}</p>
                              <p className="mt-1 text-[11px] text-[var(--text-muted)]">Voted: {voter.updatedAt ? new Date(voter.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not set"}</p>
                            </div>
                            {voter.voteChanged && <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[10px] font-bold text-sky-300">Changed</span>}
                          </div>
                        </article>
                      ))}
                      {filteredPollVoters.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-8 text-center text-xs text-[var(--text-muted)]">
                          No members have voted on this poll yet.
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ══════════════════════════════════════════════════════════════════════
          PUBLISH AS COMMUNITY SOLUTION MODAL — UNCHANGED
      ══════════════════════════════════════════════════════════════════════ */}
      {solutionModal && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/75 px-3 py-6 sm:px-4 sm:py-8 backdrop-blur-md">
          <form onSubmit={publishSolution} className="ka-card flex max-h-[92dvh] w-full max-w-xl flex-col border border-[var(--border-strong)] p-4 sm:p-6 shadow-2xl">
            <div className="mb-5 flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <span className="eyebrow-badge mb-2"><FaGlobe size={10} /><span>Publish Solution</span></span>
                <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)]">{solutionModal.title}</h2>
                <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">{solutionModal.description}</p>
              </div>
              <button type="button" onClick={() => setSolutionModal(null)} className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><FiX size={18} /></button>
            </div>
            <div className="grid flex-1 gap-4 overflow-y-auto pr-1">
              <Field label="Solution Title *"><input className={inputClass} value={solutionForm.solutionTitle} onChange={(e) => setSolutionForm((c) => ({ ...c, solutionTitle: e.target.value }))} placeholder="Clear, descriptive title for the public solution" required /></Field>
              <Field label="Category">
                <select className={inputClass} value={solutionForm.solutionCategory} onChange={(e) => setSolutionForm((c) => ({ ...c, solutionCategory: e.target.value }))}>
                  <option value="INFRASTRUCTURE">Infrastructure</option>
                  <option value="WATER">Water / Utilities</option>
                  <option value="SAFETY">Safety</option>
                  <option value="ENVIRONMENT">Environment</option>
                  <option value="COMMUNITY_SERVICE">Community Service</option>
                  <option value="HEALTH">Health</option>
                  <option value="EDUCATION">Education</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>
              <Field label="Short Summary"><input className={inputClass} value={solutionForm.solutionSummary} onChange={(e) => setSolutionForm((c) => ({ ...c, solutionSummary: e.target.value }))} placeholder="One-line summary of how the issue was resolved" /></Field>
              <Field label="Detailed Solution"><textarea className={textareaClass} value={solutionForm.solutionDetails} onChange={(e) => setSolutionForm((c) => ({ ...c, solutionDetails: e.target.value }))} placeholder="Step-by-step resolution details, resources used, timeline, and outcome" /></Field>
            </div>
            <div className="mt-6 grid shrink-0 gap-3 pt-2 sm:grid-cols-2">
              <button type="button" onClick={() => setSolutionModal(null)} className="btn-secondary w-full">Cancel</button>
              <button type="submit" disabled={publishingSolution} className="btn-primary w-full"><FaGlobe size={14} /><span>{publishingSolution ? "Publishing..." : "Publish Solution"}</span></button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DOCUMENT VIEWER MODAL — UNCHANGED
      ══════════════════════════════════════════════════════════════════════ */}
      <DocViewer
        isOpen={Boolean(viewingDoc)}
        onClose={() => setViewingDoc(null)}
        url={viewingDoc?.url}
        title={viewingDoc?.title}
        onDownload={viewingDoc?.sourceItem ? () => downloadShradhanjaliDocument(viewingDoc.sourceItem) : undefined}
      />
    </>
  );
};

export default CommunityAdmin;
