import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiPlus,
  FiRefreshCw,
  FiEdit2,
  FiEye,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { apiConnector } from "../../../../services/apiConnector";
import { opportunityEndpoints } from "../../../../services/apis";

const STATUS_META = {
  PENDING_MODERATION: {
    label: "Pending Review",
    color: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    icon: FiClock,
    tip: "Your job is awaiting review by the Samaj Admin.",
  },
  CHANGES_REQUESTED: {
    label: "Changes Needed",
    color: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    icon: FiAlertCircle,
    tip: "Admin has requested changes. Edit and resubmit.",
  },
  PUBLISHED: {
    label: "Published",
    color: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    icon: FiCheckCircle,
    tip: "Your job is live and visible to job seekers.",
  },
  REJECTED: {
    label: "Rejected",
    color: "border-red-400/40 bg-red-400/10 text-red-300",
    icon: FiXCircle,
    tip: "Your job was not approved. See reason below.",
  },
  EXPIRED: {
    label: "Expired",
    color: "border-gray-400/40 bg-gray-400/10 text-gray-400",
    icon: FiClock,
    tip: "This job listing has expired.",
  },
  ARCHIVED: {
    label: "Archived",
    color: "border-gray-500/40 bg-gray-500/10 text-gray-500",
    icon: FiClock,
    tip: "This job has been archived by Admin.",
  },
};

const formatDate = (val) =>
  val
    ? new Date(val).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const MyJobPosts = () => {
  const { token } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  };

  const fetchMyJobs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await apiConnector("GET", opportunityEndpoints.MY_JOBS_API, null, authConfig, { limit: 50 });
      setJobs(response.data?.data?.jobs || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not load your job posts.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow-badge mb-2">
              <FiBriefcase size={12} />
              <span>My Postings</span>
            </div>
            <h1 className="heading-hero text-[var(--text-primary)]">
              My Job <span className="text-gradient">Posts</span>
            </h1>
            <p className="mt-2 max-w-xl text-xs text-[var(--text-secondary)] sm:text-sm">
              Track the status of jobs you've posted for the community.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchMyJobs}
              disabled={loading}
              className="btn-secondary !py-2 !px-4 !text-xs cursor-pointer disabled:opacity-50"
            >
              <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigate("/jobs")}
              className="btn-primary !py-2 !px-4 !text-xs cursor-pointer"
            >
              <FiPlus size={12} />
              <span>Post New Job</span>
            </button>
          </div>
        </div>

        {/* Info notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-xs text-violet-300">
          <FiAlertTriangle size={14} className="mt-0.5 shrink-0" />
          <p>
            Jobs are reviewed by Samaj Admin before going live. Once approved, your contact details will be visible to job seekers so they can reach you directly.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--border-subtle)] py-20 text-center">
            <FiBriefcase size={40} className="text-[var(--text-muted)]" />
            <div>
              <p className="text-base font-bold text-[var(--text-secondary)]">No job posts yet</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Post your first job and help fellow community members find opportunities.
              </p>
            </div>
            <button
              onClick={() => navigate("/jobs")}
              className="btn-primary !py-2.5 !px-6 !text-xs cursor-pointer"
            >
              <FiPlus size={12} />
              Post a Job
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => {
              const meta = STATUS_META[job.status] || STATUS_META.PENDING_MODERATION;
              const StatusIcon = meta.icon;
              const canEdit = ["REJECTED", "CHANGES_REQUESTED", "PENDING_MODERATION"].includes(job.status);

              return (
                <article
                  key={job._id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 transition hover:border-[var(--accent-primary)]/30"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {/* Title row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-words text-base font-black text-[var(--text-primary)]">{job.title}</h2>
                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>
                          <StatusIcon size={10} />
                          {meta.label}
                        </span>
                      </div>

                      {/* Company + meta */}
                      <p className="mt-1 break-words text-sm text-[var(--text-secondary)]">{job.companyName}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[var(--text-muted)]">
                        {job.location && <span>📍 {job.location}</span>}
                        {job.employmentType && <span>💼 {job.employmentType.replace("_", " ")}</span>}
                        {job.salaryRange && <span>💰 {job.salaryRange}</span>}
                        <span>📅 Submitted: {formatDate(job.submittedAt || job.createdAt)}</span>
                        {job.expiresAt && <span>⏳ Expires: {formatDate(job.expiresAt)}</span>}
                        {job.publishedAt && <span>✅ Published: {formatDate(job.publishedAt)}</span>}
                      </div>

                      {/* Status tips & admin notes */}
                      <p className="mt-2 text-[11px] italic text-[var(--text-muted)]">{meta.tip}</p>

                      {job.reviewNote && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-orange-400/20 bg-orange-400/5 px-3 py-2 text-xs text-orange-300">
                          <FiAlertCircle size={12} className="mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold">Admin Note: </span>
                            {job.reviewNote}
                          </div>
                        </div>
                      )}

                      {job.moderationReason && job.status === "REJECTED" && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-300">
                          <FiXCircle size={12} className="mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold">Rejection Reason: </span>
                            {job.moderationReason}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                      <button
                        onClick={() => navigate("/jobs")}
                        className="btn-secondary !py-2 !px-4 !text-xs cursor-pointer"
                      >
                        <FiEye size={12} />
                        <span>{job.status === "PUBLISHED" ? "View Live" : "View Jobs"}</span>
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => navigate("/jobs")}
                          className="btn-primary !py-2 !px-4 !text-xs cursor-pointer"
                        >
                          <FiEdit2 size={12} />
                          <span>{job.status === "CHANGES_REQUESTED" ? "Edit & Resubmit" : "Edit"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobPosts;
