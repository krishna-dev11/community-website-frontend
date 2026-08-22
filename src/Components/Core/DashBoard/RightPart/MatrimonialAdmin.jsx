import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArchive,
  FaCheck,
  FaExclamationTriangle,
  FaHeart,
  FaSearch,
  FaSyncAlt,
  FaTimes,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { matrimonialEndpoints } from "../../../../services/apis";

const inputClass = "ka-input";

const Button = ({ children, icon: Icon, tone = "neutral", className = "", ...props }) => {
  const toneClasses = {
    neutral: "btn-secondary !py-2 !px-4 !text-xs",
    success: "btn-primary !py-2 !px-5 !text-xs",
    warning: "inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all hover:bg-amber-500/20 disabled:opacity-50 cursor-pointer",
    danger: "inline-flex items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all hover:bg-red-500/20 disabled:opacity-50 cursor-pointer",
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

const Status = ({ value }) => (
  <span className="inline-flex w-fit rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
    {value || "UNKNOWN"}
  </span>
);

const Empty = ({ text }) => (
  <div className="ka-card border-dashed px-5 py-8 text-sm text-[var(--text-muted)] text-center rounded-2xl">
    {text}
  </div>
);

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const tabs = [
  { key: "profiles", label: "Profiles", icon: FaHeart },
  { key: "reports", label: "Reports", icon: FaExclamationTriangle },
];

const MatrimonialAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profiles");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ q: "", gender: "", status: "" });
  const [reportStatus, setReportStatus] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState({});

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "")
      );
      const response = await apiConnector("GET", matrimonialEndpoints.ADMIN_PROFILES_API, null, authConfig, params);
      setProfiles(response.data?.data?.profiles || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load matrimonial profiles");
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = reportStatus ? { status: reportStatus } : {};
      const response = await apiConnector("GET", matrimonialEndpoints.ADMIN_REPORTS_API, null, authConfig, params);
      setReports(response.data?.data?.reports || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load matrimonial reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "profiles") {
      loadProfiles();
    } else {
      loadReports();
    }
  }, [activeTab, reportStatus]);

  const refreshActive = () => {
    if (activeTab === "profiles") {
      loadProfiles();
    } else {
      loadReports();
    }
  };

  const reviewProfile = async (profileId, action) => {
    const draft = reviewDrafts[profileId] || {};
    setBusyId(profileId);
    try {
      await apiConnector(
        "PATCH",
        matrimonialEndpoints.REVIEW_PROFILE_API(profileId),
        { action, note: draft.reason || "" },
        authConfig
      );
      toast.success(`Profile updated to ${action}`);
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
        { status, resolutionNote: draft.reason || "" },
        authConfig
      );
      toast.success("Report review updated");
      await loadReports();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to review report");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
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

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
          </div>
        ) : (
          <>
            {activeTab === "profiles" && (
              <section className="grid gap-4">
                <div className="ka-card p-4 grid gap-3 lg:grid-cols-[1fr_180px_200px_auto]">
                  <input
                    className={inputClass}
                    value={filters.q}
                    onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                    placeholder="Search profiles"
                  />
                  <select
                    className={inputClass}
                    value={filters.gender}
                    onChange={(event) => setFilters((current) => ({ ...current, gender: event.target.value }))}
                  >
                    <option value="">All genders</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <select
                    className={inputClass}
                    value={filters.status}
                    onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option value="">All statuses</option>
                    <option value="PENDING_REVIEW">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="PAUSED">Paused</option>
                    <option value="UNDER_INVESTIGATION">Investigation</option>
                  </select>
                  <Button icon={FaSearch} onClick={loadProfiles}>Apply</Button>
                </div>

                {profiles.map((profile) => (
                  <article key={profile._id} className="ka-card p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        {profile.photos?.[0]?.url ? (
                          <img
                            src={profile.photos[0].url}
                            alt={profile.displayName}
                            className="h-24 w-32 rounded-2xl border border-[var(--border-subtle)] object-cover shadow-sm"
                          />
                        ) : null}
                        <div className="min-w-0">
                          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                            {profile.displayName}
                          </h2>
                          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                            {profile.gender} • {formatDate(profile.dateOfBirth)} • {profile.currentCity || "City not set"}
                          </p>
                          <p className="mt-1 text-xs sm:text-sm text-[var(--accent-primary)] font-medium">
                            {profile.education || "Education not set"} • {profile.profession || "Profession not set"}
                          </p>
                          <p className="mt-2 line-clamp-2 text-xs text-[var(--text-muted)]">
                            {profile.about || "No about note"}
                          </p>
                          {profile.protectedContact ? (
                            <p className="mt-2 text-xs text-[var(--text-muted)] font-mono">
                              Protected: {profile.protectedContact.phone || "no phone"} / {profile.protectedContact.email || "no email"}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <Status value={profile.status} />
                    </div>
                    <div className="mt-4 grid gap-3 border-t border-[var(--border-subtle)] pt-4 lg:grid-cols-[1fr_auto_auto_auto_auto]">
                      <input
                        className={inputClass}
                        value={reviewDrafts[profile._id]?.reason || ""}
                        onChange={(event) =>
                          setReviewDrafts((current) => ({
                            ...current,
                            [profile._id]: { reason: event.target.value },
                          }))
                        }
                        placeholder="Review reason"
                      />
                      <Button icon={FaCheck} tone="success" onClick={() => reviewProfile(profile._id, "APPROVE")} disabled={busyId === profile._id}>
                        Approve
                      </Button>
                      <Button icon={FaTimes} tone="warning" onClick={() => reviewProfile(profile._id, "REJECT")} disabled={busyId === profile._id}>
                        Reject
                      </Button>
                      <Button icon={FaExclamationTriangle} onClick={() => reviewProfile(profile._id, "INVESTIGATE")} disabled={busyId === profile._id}>
                        Investigate
                      </Button>
                      <Button icon={FaArchive} tone="danger" onClick={() => reviewProfile(profile._id, "ARCHIVE")} disabled={busyId === profile._id}>
                        Archive
                      </Button>
                    </div>
                  </article>
                ))}
                {profiles.length === 0 && <Empty text="No matrimonial profiles found." />}
              </section>
            )}

            {activeTab === "reports" && (
              <section className="grid gap-4">
                <div className="ka-card p-4 grid gap-3 md:grid-cols-[220px_auto]">
                  <select
                    className={inputClass}
                    value={reportStatus}
                    onChange={(event) => setReportStatus(event.target.value)}
                  >
                    <option value="">All report statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="DISMISSED">Dismissed</option>
                  </select>
                  <Button icon={FaSyncAlt} onClick={loadReports}>Apply</Button>
                </div>

                {reports.map((report) => (
                  <article key={report._id} className="ka-card p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                          {report.profile?.displayName || "Matrimonial profile"} Report
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] font-medium text-amber-400">
                          {report.reason}
                        </p>
                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                          {report.details || "No extra details"} • Reported by {report.reportedBy?.firstName || "Member"}
                        </p>
                      </div>
                      <Status value={report.status} />
                    </div>
                    <div className="mt-4 grid gap-3 border-t border-[var(--border-subtle)] pt-4 lg:grid-cols-[1fr_auto_auto_auto]">
                      <input
                        className={inputClass}
                        value={reviewDrafts[report._id]?.reason || ""}
                        onChange={(event) =>
                          setReviewDrafts((current) => ({
                            ...current,
                            [report._id]: { reason: event.target.value },
                          }))
                        }
                        placeholder="Resolution note"
                      />
                      <Button onClick={() => reviewReport(report._id, "UNDER_REVIEW")} disabled={busyId === report._id}>
                        Review
                      </Button>
                      <Button tone="success" onClick={() => reviewReport(report._id, "RESOLVED")} disabled={busyId === report._id}>
                        Resolve
                      </Button>
                      <Button tone="warning" onClick={() => reviewReport(report._id, "DISMISSED")} disabled={busyId === report._id}>
                        Dismiss
                      </Button>
                    </div>
                  </article>
                ))}
                {reports.length === 0 && <Empty text="No matrimonial reports found." />}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MatrimonialAdmin;
