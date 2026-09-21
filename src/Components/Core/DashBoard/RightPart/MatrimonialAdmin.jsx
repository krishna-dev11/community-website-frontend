import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArchive,
  FaCheck,
  FaExclamationTriangle,
  FaHeart,
  FaSyncAlt,
  FaTimes,
  FaUserShield,
} from "react-icons/fa";
import { FiCheckCircle, FiClock, FiSearch } from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { matrimonialEndpoints } from "../../../../services/apis";

// ─── Module top-level navigation tabs ──────────────────────────────────────
const tabs = [
  { key: "profiles", label: "Profiles", icon: FaHeart },
  { key: "reports",  label: "Reports",  icon: FaExclamationTriangle },
];

// ─── Status config per module (keys match backend schema values) ─────────────
const MODULE_STATUS_CONFIG = {
  profiles: [
    { key: "PENDING_REVIEW",      label: "Needs Review" },
    { key: "UNDER_INVESTIGATION", label: "Under Investigation" },
    { key: "APPROVED",            label: "Approved" },
    { key: "REJECTED",            label: "Rejected" },
    { key: "PAUSED",              label: "Paused" },
    { key: "ARCHIVED",            label: "Archived" },
    { key: "ALL",                 label: "All" },
  ],
  reports: [
    { key: "PENDING",      label: "Needs Review" },
    { key: "UNDER_REVIEW", label: "Under Review" },
    { key: "RESOLVED",     label: "Resolved" },
    { key: "DISMISSED",    label: "Dismissed" },
    { key: "ALL",          label: "All" },
  ],
};

const DONE_STATUSES = new Set([
  "APPROVED", "REJECTED", "ARCHIVED", "RESOLVED", "DISMISSED",
]);

const MODULE_DEFAULT_STATUS = {
  profiles: "PENDING_REVIEW",
  reports:  "PENDING",
};

const inputClass = "ka-input";

// ─── Shared UI primitives ───────────────────────────────────────────────────
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

const StatusBadge = ({ value }) => {
  const colorMap = {
    PENDING_REVIEW:      "border-amber-400/40 bg-amber-400/10 text-amber-300",
    PENDING:             "border-amber-400/40 bg-amber-400/10 text-amber-300",
    UNDER_INVESTIGATION: "border-sky-400/40 bg-sky-400/10 text-sky-300",
    UNDER_REVIEW:        "border-sky-400/40 bg-sky-400/10 text-sky-300",
    APPROVED:            "border-green-400/40 bg-green-400/10 text-green-300",
    RESOLVED:            "border-green-400/40 bg-green-400/10 text-green-300",
    REJECTED:            "border-red-400/40 bg-red-400/10 text-red-300",
    PAUSED:              "border-purple-400/40 bg-purple-400/10 text-purple-300",
    ARCHIVED:            "border-gray-500/40 bg-gray-500/10 text-gray-400",
    DISMISSED:           "border-gray-500/40 bg-gray-500/10 text-gray-400",
  };

  return (
    <span
      className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        colorMap[value] || "border-white/10 bg-white/5 text-gray-400"
      }`}
    >
      {value?.replace(/_/g, " ") || "UNKNOWN"}
    </span>
  );
};

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Summary stat cards ─────────────────────────────────────────────────────
const SummaryCards = ({ data, config }) => {
  const counts = {};
  data.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });

  const actionKey = config[0]?.key;
  const midKeys   = config.slice(1, -1).filter((c) => !DONE_STATUSES.has(c.key) && c.key !== "ALL").map((c) => c.key);
  const doneKeys  = config.filter((c) => DONE_STATUSES.has(c.key)).map((c) => c.key);

  const cards = [
    { label: "Total",        value: data.length,                                                  textColor: "text-[var(--text-primary)]", border: "border-[var(--border-subtle)]" },
    { label: "Needs Review", value: actionKey ? (counts[actionKey] || 0) : 0,                     textColor: "text-amber-300",              border: "border-amber-400/20" },
    { label: "Investigating/Mid", value: midKeys.reduce((s, k) => s + (counts[k] || 0), 0),       textColor: "text-sky-300",                border: "border-sky-400/20" },
    { label: "Decided/Done", value: doneKeys.reduce((s, k) => s + (counts[k] || 0), 0),          textColor: "text-emerald-300",            border: "border-emerald-400/20" },
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

// ─── Status tab bar with live counts ─────────────────────────────────────────
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

// ─── Search bar ─────────────────────────────────────────────────────────────
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

// ─── Context-aware empty state ──────────────────────────────────────────────
const ModuleEmptyState = ({ statusKey, moduleLabel }) => {
  const isActionable = !DONE_STATUSES.has(statusKey) && statusKey !== "ALL";
  if (isActionable) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 py-12 text-center">
        <FiCheckCircle size={26} className="text-emerald-400" />
        <p className="text-sm font-semibold text-emerald-300">All caught up!</p>
        <p className="text-xs text-[var(--text-muted)]">No {moduleLabel} require your review right now.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-12 text-center">
      <FiClock size={26} className="text-[var(--text-muted)]" />
      <p className="text-sm font-semibold text-[var(--text-secondary)]">No records found</p>
      <p className="text-xs text-[var(--text-muted)]">
        No {moduleLabel} with this status.
      </p>
    </div>
  );
};

// ============================================================================
//  MatrimonialAdmin Main Component
// ============================================================================
const MatrimonialAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profiles");
  const [loading, setLoading]     = useState(true);
  const [busyId, setBusyId]       = useState(null);

  const [profiles, setProfiles]   = useState([]);
  const [reports, setReports]     = useState([]);

  // Per-module status filters and search
  const [statusFilters, setStatusFilters] = useState({ ...MODULE_DEFAULT_STATUS });
  const [moduleSearch, setModuleSearch]   = useState({ profiles: "", reports: "" });
  const [genderFilter, setGenderFilter]   = useState("");
  const [reviewDrafts, setReviewDrafts]   = useState({});

  const setFilter = (mod, key) => setStatusFilters((prev) => ({ ...prev, [mod]: key }));
  const setSearch = (mod, val) => setModuleSearch((prev) => ({ ...prev, [mod]: val }));

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const loadProfiles = async () => {
    try {
      const response = await apiConnector(
        "GET",
        matrimonialEndpoints.ADMIN_PROFILES_API,
        null,
        authConfig,
        { limit: 100 }
      );
      setProfiles(response.data?.data?.profiles || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load matrimonial profiles");
    }
  };

  const loadReports = async () => {
    try {
      const response = await apiConnector(
        "GET",
        matrimonialEndpoints.ADMIN_REPORTS_API,
        null,
        authConfig,
        { limit: 100 }
      );
      setReports(response.data?.data?.reports || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load matrimonial reports");
    }
  };

  const refreshActive = async () => {
    setLoading(true);
    try {
      if (activeTab === "profiles") await loadProfiles();
      else await loadReports();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshActive();
  }, [activeTab]);

  const reviewProfile = async (profileId, action) => {
    const draft = reviewDrafts[profileId] || {};
    setBusyId(profileId);
    try {
      await apiConnector(
        "PATCH",
        matrimonialEndpoints.REVIEW_PROFILE_API(profileId),
        {
          action,
          reason: draft.reason || "",
          note: draft.reason || "",
        },
        authConfig
      );
      toast.success(`Profile updated to ${action}`);
      setReviewDrafts((c) => { const n = { ...c }; delete n[profileId]; return n; });
      await loadProfiles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update profile status");
    } finally {
      setBusyId(null);
    }
  };

  const reviewReport = async (reportId, status) => {
    const draft = reviewDrafts[reportId] || {};
    setBusyId(reportId);
    try {
      await apiConnector(
        "PATCH",
        matrimonialEndpoints.REVIEW_REPORT_API(reportId),
        {
          status,
          resolutionNote: draft.reason || "",
          reason: draft.reason || "",
        },
        authConfig
      );
      toast.success("Report review updated");
      setReviewDrafts((c) => { const n = { ...c }; delete n[reportId]; return n; });
      await loadReports();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to review report");
    } finally {
      setBusyId(null);
    }
  };

  // ── Filtered data sets ────────────────────────────────────────────────────
  const filteredProfiles = useMemo(() => {
    const statusKey = statusFilters.profiles;
    const query = (moduleSearch.profiles || "").trim().toLowerCase();

    return profiles.filter((p) => {
      const matchStatus = statusKey === "ALL" || p.status === statusKey;
      const matchGender = !genderFilter || p.gender === genderFilter;
      const searchBlob  = [
        p.displayName,
        p.currentCity,
        p.education,
        p.profession,
        p.about,
        p.owner?.firstName,
        p.owner?.lastName,
        p.owner?.email,
      ].filter(Boolean).join(" ").toLowerCase();
      const matchSearch = !query || searchBlob.includes(query);

      return matchStatus && matchGender && matchSearch;
    });
  }, [profiles, statusFilters.profiles, moduleSearch.profiles, genderFilter]);

  const filteredReports = useMemo(() => {
    const statusKey = statusFilters.reports;
    const query = (moduleSearch.reports || "").trim().toLowerCase();

    return reports.filter((r) => {
      const matchStatus = statusKey === "ALL" || r.status === statusKey;
      const searchBlob  = [
        r.reason,
        r.details,
        r.profile?.displayName,
        r.reportedBy?.firstName,
        r.reportedBy?.lastName,
        r.reportedBy?.email,
      ].filter(Boolean).join(" ").toLowerCase();
      const matchSearch = !query || searchBlob.includes(query);

      return matchStatus && matchSearch;
    });
  }, [reports, statusFilters.reports, moduleSearch.reports]);

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow-badge mb-2">
                <FaHeart size={12} />
                <span>Matchmaking Ops</span>
              </div>
              <h1 className="heading-hero text-[var(--text-primary)]">
                Matrimonial <span className="text-gradient">Admin</span>
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
                Review matrimonial profiles, investigate reports, and keep protected contact details moderated.
              </p>
            </div>
            <Button icon={FaSyncAlt} onClick={refreshActive} disabled={loading}>
              Refresh
            </Button>
          </div>

          {/* Module navigation */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex h-10 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
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

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════════════
                PROFILES MODULE
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "profiles" && (
              <section className="grid gap-4">
                <SummaryCards data={profiles} config={MODULE_STATUS_CONFIG.profiles} />

                {/* Filter toolbar */}
                <div className="flex flex-col gap-2">
                  <StatusTabBar
                    data={profiles}
                    config={MODULE_STATUS_CONFIG.profiles}
                    activeKey={statusFilters.profiles}
                    onChange={(k) => setFilter("profiles", k)}
                  />

                  <div className="grid gap-2 sm:grid-cols-[1fr_160px]">
                    <SearchBar
                      value={moduleSearch.profiles}
                      onChange={(v) => setSearch("profiles", v)}
                      placeholder="Search name, city, education, profession, notes..."
                    />
                    <select
                      className={`${inputClass} !h-9 text-xs`}
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                    >
                      <option value="">All Genders</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                {filteredProfiles.length === 0 ? (
                  <ModuleEmptyState statusKey={statusFilters.profiles} moduleLabel="profiles" />
                ) : (
                  <div className="grid gap-3">
                    {filteredProfiles.map((profile) => {
                      const isDone = DONE_STATUSES.has(profile.status);
                      return (
                        <article
                          key={profile._id}
                          className={`rounded-2xl border p-4 sm:p-5 transition ${
                            isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-col sm:flex-row min-w-0 gap-3 sm:gap-4">
                              {profile.photos?.[0]?.url ? (
                                <img
                                  src={profile.photos[0].url}
                                  alt={profile.displayName}
                                  className="h-44 sm:h-24 w-full sm:w-28 rounded-2xl border border-[var(--border-subtle)] object-cover shadow-sm shrink-0"
                                />
                              ) : null}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h2 className={`text-base font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
                                    {profile.displayName}
                                  </h2>
                                  <StatusBadge value={profile.status} />
                                  <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--text-muted)]">
                                    {profile.gender}
                                  </span>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)]">
                                  Born {formatDate(profile.dateOfBirth)} · {profile.currentCity || "City not set"}
                                </p>
                                <p className="mt-1 text-xs text-[var(--accent-primary)] font-medium">
                                  {profile.education || "Education not set"} · {profile.profession || "Profession not set"}
                                </p>
                                <p className="mt-2 line-clamp-2 text-xs text-[var(--text-muted)] leading-relaxed">
                                  {profile.about || "No about note provided."}
                                </p>
                                {profile.protectedContact && (
                                  <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/5 px-2.5 py-1 text-[11px] text-sky-300 font-mono max-w-full break-all">
                                    <FaUserShield size={11} className="shrink-0" />
                                    <span>Protected: {profile.protectedContact.phone || "No phone"} / {profile.protectedContact.email || "No email"}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Context-aware action buttons */}
                          {!isDone && (
                            <div className="mt-4 grid gap-2.5 border-t border-white/10 pt-4 lg:grid-cols-[1fr_auto]">
                              <input
                                className={inputClass}
                                value={reviewDrafts[profile._id]?.reason || ""}
                                onChange={(e) =>
                                  setReviewDrafts((cur) => ({
                                    ...cur,
                                    [profile._id]: { reason: e.target.value },
                                  }))
                                }
                                placeholder="Review note / Reason"
                              />
                              <div className="flex flex-wrap gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
                                {profile.status === "PENDING_REVIEW" && (
                                  <>
                                    <Button
                                      icon={FaCheck}
                                      tone="success"
                                      onClick={() => reviewProfile(profile._id, "APPROVE")}
                                      disabled={busyId === profile._id}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      icon={FaTimes}
                                      tone="danger"
                                      onClick={() => reviewProfile(profile._id, "REJECT")}
                                      disabled={busyId === profile._id}
                                    >
                                      Reject
                                    </Button>
                                    <Button
                                      icon={FaExclamationTriangle}
                                      tone="warning"
                                      onClick={() => reviewProfile(profile._id, "INVESTIGATE")}
                                      disabled={busyId === profile._id}
                                    >
                                      Investigate
                                    </Button>
                                  </>
                                )}

                                {profile.status === "UNDER_INVESTIGATION" && (
                                  <>
                                    <Button
                                      icon={FaCheck}
                                      tone="success"
                                      onClick={() => reviewProfile(profile._id, "APPROVE")}
                                      disabled={busyId === profile._id}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      icon={FaTimes}
                                      tone="danger"
                                      onClick={() => reviewProfile(profile._id, "REJECT")}
                                      disabled={busyId === profile._id}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}

                                {profile.status === "PAUSED" && (
                                  <Button
                                    icon={FaArchive}
                                    tone="danger"
                                    onClick={() => reviewProfile(profile._id, "ARCHIVE")}
                                    disabled={busyId === profile._id}
                                  >
                                    Archive
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                          {isDone && profile.status !== "ARCHIVED" && (
                            <div className="mt-3 flex justify-end">
                              <Button
                                icon={FaArchive}
                                tone="neutral"
                                onClick={() => reviewProfile(profile._id, "ARCHIVE")}
                                disabled={busyId === profile._id}
                              >
                                Move to Archive
                              </Button>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ══════════════════════════════════════════════════════════════
                REPORTS MODULE
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "reports" && (
              <section className="grid gap-4">
                <SummaryCards data={reports} config={MODULE_STATUS_CONFIG.reports} />

                <div className="flex flex-col gap-2">
                  <StatusTabBar
                    data={reports}
                    config={MODULE_STATUS_CONFIG.reports}
                    activeKey={statusFilters.reports}
                    onChange={(k) => setFilter("reports", k)}
                  />
                  <SearchBar
                    value={moduleSearch.reports}
                    onChange={(v) => setSearch("reports", v)}
                    placeholder="Search report reason, profile name, reporter..."
                  />
                </div>

                {filteredReports.length === 0 ? (
                  <ModuleEmptyState statusKey={statusFilters.reports} moduleLabel="reports" />
                ) : (
                  <div className="grid gap-3">
                    {filteredReports.map((report) => {
                      const isDone = DONE_STATUSES.has(report.status);
                      return (
                        <article
                          key={report._id}
                          className={`rounded-2xl border p-4 sm:p-5 transition ${
                            isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h2 className={`text-base font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
                                  Report on {report.profile?.displayName || "Matrimonial Profile"}
                                </h2>
                                <StatusBadge value={report.status} />
                              </div>
                              <p className="text-xs font-semibold text-amber-300">
                                Reason: {report.reason}
                              </p>
                              <p className="mt-1 text-xs text-[var(--text-muted)]">
                                {report.details || "No additional report notes provided."} · Reported by {report.reportedBy?.firstName || "Member"} {report.reportedBy?.lastName || ""}
                              </p>
                            </div>
                          </div>

                          {!isDone && (
                            <div className="mt-4 grid gap-2.5 border-t border-white/10 pt-4 lg:grid-cols-[1fr_auto]">
                              <input
                                className={inputClass}
                                value={reviewDrafts[report._id]?.reason || ""}
                                onChange={(e) =>
                                  setReviewDrafts((cur) => ({
                                    ...cur,
                                    [report._id]: { reason: e.target.value },
                                  }))
                                }
                                placeholder="Resolution note / Action justification"
                              />
                              <div className="flex flex-wrap gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
                                {report.status === "PENDING" && (
                                  <Button
                                    onClick={() => reviewReport(report._id, "UNDER_REVIEW")}
                                    disabled={busyId === report._id}
                                  >
                                    Review
                                  </Button>
                                )}
                                <Button
                                  tone="success"
                                  onClick={() => reviewReport(report._id, "RESOLVED")}
                                  disabled={busyId === report._id}
                                >
                                  Resolve
                                </Button>
                                <Button
                                  tone="warning"
                                  onClick={() => reviewReport(report._id, "DISMISSED")}
                                  disabled={busyId === report._id}
                                >
                                  Dismiss
                                </Button>
                              </div>
                            </div>
                          )}
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
  );
};

export default MatrimonialAdmin;
