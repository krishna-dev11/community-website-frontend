import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArchive,
  FaBriefcase,
  FaCheck,
  FaGraduationCap,
  FaPaperPlane,
  FaSyncAlt,
  FaTimes,
  FaUserCheck,
  FaWhatsapp,
  FaPlus,
} from "react-icons/fa";
import { FiCheckCircle, FiClock, FiSearch, FiPhone, FiMail, FiX, FiPlus as FiPlusIcon, FiAlertCircle } from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { opportunityEndpoints } from "../../../../services/apis";

const inputClass = "ka-input !py-2.5 !px-3.5 !text-xs sm:!text-sm rounded-xl";
const textareaClass = "ka-input !py-2.5 !px-3.5 !text-xs sm:!text-sm !min-h-24 resize-y rounded-xl";

function cleanPhone(raw) {
  if (!raw) return "";
  return raw.replace(/[^0-9+]/g, "");
}

// ─── Module navigation tabs ────────────────────────────────────────────────
const tabs = [
  { key: "jobs",            label: "Jobs",             icon: FaBriefcase     },
  { key: "jobApps",         label: "Job Apps",         icon: FaCheck         },
  { key: "scholarships",     label: "Scholarships",     icon: FaGraduationCap },
  { key: "scholarshipApps", label: "Scholarship Apps", icon: FaUserCheck     },
];

// ─── Status configs per module ─────────────────────────────────────────────
const MODULE_STATUS_CONFIG = {
  jobs: [
    { key: "PENDING_MODERATION",  label: "Pending Review"    },
    { key: "CHANGES_REQUESTED",   label: "Changes Requested" },
    { key: "PUBLISHED",            label: "Published"         },
    { key: "REJECTED",             label: "Rejected"          },
    { key: "EXPIRED",              label: "Expired"           },
    { key: "ARCHIVED",             label: "Archived"          },
    { key: "ALL",                  label: "All"               },
  ],
  jobApps: [
    { key: "SUBMITTED",   label: "Needs Action" },
    { key: "SHORTLISTED", label: "Shortlisted"  },
    { key: "INTERVIEW",   label: "Interview"    },
    { key: "SELECTED",    label: "Selected"     },
    { key: "REJECTED",    label: "Rejected"     },
    { key: "ALL",         label: "All"          },
  ],
  scholarships: [
    { key: "OPEN",     label: "Open Grants" },
    { key: "DRAFT",    label: "Draft"       },
    { key: "ARCHIVED", label: "Archived"    },
    { key: "ALL",      label: "All"         },
  ],
  scholarshipApps: [
    { key: "SUBMITTED",    label: "Needs Review" },
    { key: "UNDER_REVIEW", label: "Under Review" },
    { key: "SHORTLISTED",  label: "Shortlisted"  },
    { key: "APPROVED",     label: "Approved"     },
    { key: "REJECTED",     label: "Rejected"     },
    { key: "ALL",          label: "All"          },
  ],
};

const DONE_STATUSES = new Set([
  "SELECTED", "REJECTED", "APPROVED", "ARCHIVED", "EXPIRED",
]);

const MODULE_DEFAULT_STATUS = {
  jobs:            "PENDING_MODERATION",
  jobApps:         "SUBMITTED",
  scholarships:    "OPEN",
  scholarshipApps: "SUBMITTED",
};

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

const Field = ({ label, children }) => (
  <label className="grid gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
    {children}
  </label>
);

const StatusBadge = ({ value }) => {
  const colorMap = {
    SUBMITTED:         "border-amber-400/40 bg-amber-400/10 text-amber-300",
    PENDING_MODERATION:"border-amber-400/40 bg-amber-400/10 text-amber-300",
    CHANGES_REQUESTED: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    OPEN:              "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    PUBLISHED:         "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    UNDER_REVIEW:      "border-sky-400/40 bg-sky-400/10 text-sky-300",
    SHORTLISTED:       "border-teal-400/40 bg-teal-400/10 text-teal-300",
    INTERVIEW:         "border-purple-400/40 bg-purple-400/10 text-purple-300",
    SELECTED:          "border-green-400/40 bg-green-400/10 text-green-300",
    APPROVED:          "border-green-400/40 bg-green-400/10 text-green-300",
    REJECTED:          "border-red-400/40 bg-red-400/10 text-red-300",
    EXPIRED:           "border-orange-400/40 bg-orange-400/10 text-orange-300",
    DRAFT:             "border-purple-400/40 bg-purple-400/10 text-purple-300",
    ARCHIVED:          "border-gray-500/40 bg-gray-500/10 text-gray-400",
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

const SummaryCards = ({ data, config }) => {
  const counts = {};
  data.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });

  const actionKey = config[0]?.key;
  const midKeys   = config.slice(1, -1).filter((c) => !DONE_STATUSES.has(c.key) && c.key !== "ALL").map((c) => c.key);
  const doneKeys  = config.filter((c) => DONE_STATUSES.has(c.key)).map((c) => c.key);

  const cards = [
    { label: "Total",        value: data.length,                                                  textColor: "text-[var(--text-primary)]", border: "border-[var(--border-subtle)]" },
    { label: "Needs Action", value: actionKey ? (counts[actionKey] || 0) : 0,                     textColor: "text-amber-300",              border: "border-amber-400/20" },
    { label: "In Progress",  value: midKeys.reduce((s, k) => s + (counts[k] || 0), 0),            textColor: "text-sky-300",                border: "border-sky-400/20" },
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
      <p className="text-xs text-[var(--text-muted)]">No {moduleLabel} found for this status.</p>
    </div>
  );
};

const money = (value) => value ? `Rs. ${Number(value).toLocaleString("en-IN")}` : "Amount not set";
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not set";

const initialJob = {
  title: "", companyName: "", description: "", location: "", employmentType: "FULL_TIME",
  salaryRange: "", experienceRequired: "", skills: "", contactEmail: "", contactPhone: "",
  expiresAt: "", status: "PUBLISHED",
};

const initialScholarship = {
  title: "", description: "", eligibility: "", amount: "", seats: "", applicationDeadline: "",
  status: "OPEN", requiredDocument: { enabled: true, name: "", instructions: "" },
};

// ============================================================================
//  OpportunityAdmin Main Component
// ============================================================================
const OpportunityAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("jobs");
  const [loading, setLoading]     = useState(false);
  const [busyId, setBusyId]       = useState(null);

  const [jobs, setJobs]                                   = useState([]);
  const [selectedJob, setSelectedJob]                     = useState("");
  const [jobApplications, setJobApplications]             = useState([]);
  const [scholarships, setScholarships]                   = useState([]);
  const [selectedScholarship, setSelectedScholarship]     = useState("");
  const [scholarshipApplications, setScholarshipApplications] = useState([]);

  const [jobForm, setJobForm]                             = useState(initialJob);
  const [scholarshipForm, setScholarshipForm]             = useState(initialScholarship);
  const [scholarshipDocumentFile, setScholarshipDocumentFile] = useState(null);
  const [editingScholarshipId, setEditingScholarshipId]   = useState(null);
  const [drafts, setDrafts]                               = useState({});
  const [showJobForm, setShowJobForm]                     = useState(false);
  const [showScholarshipForm, setShowScholarshipForm]     = useState(false);

  // ── Per-module status filters and search ──────────────────────────────────
  const [statusFilters, setStatusFilters] = useState({ ...MODULE_DEFAULT_STATUS });
  const [moduleSearch, setModuleSearch]   = useState({
    jobs: "", jobApps: "", scholarships: "", scholarshipApps: "",
  });

  const setFilter = (mod, key) => setStatusFilters((prev) => ({ ...prev, [mod]: key }));
  const setSearch = (mod, val) => setModuleSearch((prev) => ({ ...prev, [mod]: val }));

  const authConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }), [token]);

  const loadJobs = async () => {
    const response = await apiConnector("GET", opportunityEndpoints.ADMIN_JOBS_API, null, authConfig, { limit: 100 });
    const items = response.data?.data?.jobs || [];
    setJobs(items);
    if (!selectedJob && items[0]?._id) setSelectedJob(items[0]._id);
  };

  const loadJobApplications = async () => {
    if (!selectedJob) {
      setJobApplications([]);
      return;
    }
    const response = await apiConnector("GET", opportunityEndpoints.JOB_APPLICATIONS_API(selectedJob), null, authConfig, { limit: 100 });
    setJobApplications(response.data?.data?.applications || []);
  };

  const loadScholarships = async () => {
    const response = await apiConnector("GET", opportunityEndpoints.ADMIN_SCHOLARSHIPS_API, null, authConfig, { limit: 100 });
    const items = response.data?.data?.scholarships || [];
    setScholarships(items);
    if (!selectedScholarship && items[0]?._id) setSelectedScholarship(items[0]._id);
  };

  const loadScholarshipApplications = async () => {
    const endpoint = selectedScholarship
      ? opportunityEndpoints.SCHOLARSHIP_APPLICATIONS_API(selectedScholarship)
      : opportunityEndpoints.ADMIN_SCHOLARSHIP_APPLICATIONS_API;
    const response = await apiConnector("GET", endpoint, null, authConfig, { limit: 100 });
    setScholarshipApplications(response.data?.data?.applications || []);
  };

  const refreshActive = async () => {
    setLoading(true);
    try {
      if (activeTab === "jobs") await loadJobs();
      if (activeTab === "jobApps") {
        if (jobs.length === 0) await loadJobs();
        await loadJobApplications();
      }
      if (activeTab === "scholarships") await loadScholarships();
      if (activeTab === "scholarshipApps") {
        if (scholarships.length === 0) await loadScholarships();
        await loadScholarshipApplications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load opportunities data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshActive();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "jobApps") {
      loadJobApplications().catch((error) => toast.error(error.response?.data?.message || "Unable to load job applications"));
    }
  }, [selectedJob]);

  useEffect(() => {
    if (activeTab === "scholarshipApps") {
      loadScholarshipApplications().catch((error) => toast.error(error.response?.data?.message || "Unable to load scholarship applications"));
    }
  }, [selectedScholarship]);

  const createJob = async (event) => {
    event.preventDefault();
    setBusyId("job");
    try {
      await apiConnector("POST", opportunityEndpoints.JOBS_API, jobForm, authConfig);
      toast.success("Job saved successfully");
      setJobForm(initialJob);
      setShowJobForm(false);
      await loadJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save job");
    } finally {
      setBusyId(null);
    }
  };

  const moderateJob = async (jobId, action) => {
    const draft = drafts[jobId] || {};
    setBusyId(jobId);
    try {
      await apiConnector("PATCH", opportunityEndpoints.MODERATE_JOB_API(jobId), { action, reason: draft.reason || undefined }, authConfig);
      toast.success("Job status updated");
      await loadJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to moderate job");
    } finally {
      setBusyId(null);
    }
  };

  const updateJobApplication = async (applicationId, status) => {
    const draft = drafts[applicationId] || {};
    setBusyId(applicationId);
    try {
      await apiConnector("PATCH", opportunityEndpoints.UPDATE_JOB_APPLICATION_STATUS_API(applicationId), { status, reviewMessage: draft.reason || undefined }, authConfig);
      toast.success("Job application updated");
      await loadJobApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update job application");
    } finally {
      setBusyId(null);
    }
  };

  const createScholarship = async (event) => {
    event.preventDefault();
    setBusyId("scholarship");
    try {
      if (scholarshipForm.status === "OPEN" && !scholarshipForm.requiredDocument.name) {
        toast.error("Open scholarships require a document name.");
        setBusyId(null);
        return;
      }
      const formData = new FormData();
      formData.append("title", scholarshipForm.title);
      formData.append("description", scholarshipForm.description);
      formData.append("eligibility", scholarshipForm.eligibility || "");
      formData.append("applicationDeadline", scholarshipForm.applicationDeadline);
      formData.append("status", scholarshipForm.status);
      if (scholarshipForm.amount) formData.append("amount", Number(scholarshipForm.amount));
      if (scholarshipForm.seats) formData.append("seats", Number(scholarshipForm.seats));
      formData.append("requiredDocument", JSON.stringify(scholarshipForm.requiredDocument));
      if (scholarshipDocumentFile) formData.append("requiredDocumentFile", scholarshipDocumentFile);

      const endpoint = editingScholarshipId
        ? opportunityEndpoints.SCHOLARSHIP_API(editingScholarshipId)
        : opportunityEndpoints.SCHOLARSHIPS_API;
      await apiConnector(editingScholarshipId ? "PATCH" : "POST", endpoint, formData, authConfig);
      toast.success(editingScholarshipId ? "Scholarship updated" : "Scholarship saved");
      setScholarshipForm(initialScholarship);
      setScholarshipDocumentFile(null);
      setEditingScholarshipId(null);
      setShowScholarshipForm(false);
      await loadScholarships();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save scholarship");
    } finally {
      setBusyId(null);
    }
  };

  const archiveScholarship = async (scholarshipId) => {
    const draft = drafts[scholarshipId] || {};
    setBusyId(scholarshipId);
    try {
      await apiConnector("PATCH", opportunityEndpoints.ARCHIVE_SCHOLARSHIP_API(scholarshipId), { reason: draft.reason || "Archived from dashboard" }, authConfig);
      toast.success("Scholarship archived");
      await loadScholarships();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to archive scholarship");
    } finally {
      setBusyId(null);
    }
  };

  const reviewScholarshipApplication = async (applicationId, status) => {
    const draft = drafts[applicationId] || {};
    if (status === "REJECTED" && !draft.reason?.trim()) {
      toast.error("Enter a rejection reason before rejecting.");
      return;
    }
    if (status === "APPROVED" && !window.confirm("Approve this scholarship application?")) return;
    if (status === "REJECTED" && !window.confirm("Reject this scholarship application?")) return;

    setBusyId(applicationId);
    try {
      await apiConnector("PATCH", opportunityEndpoints.REVIEW_SCHOLARSHIP_APPLICATION_API(applicationId), { status, reason: draft.reason || undefined }, authConfig);
      toast.success("Scholarship application updated");
      await loadScholarshipApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to review scholarship application");
    } finally {
      setBusyId(null);
    }
  };

  const draftInput = (id, placeholder = "Reason or note") => (
    <input
      className={inputClass}
      value={drafts[id]?.reason || ""}
      onChange={(event) => setDrafts((current) => ({ ...current, [id]: { reason: event.target.value } }))}
      placeholder={placeholder}
    />
  );

  // ── Filtered data sets ────────────────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    const statusKey = statusFilters.jobs;
    const query = (moduleSearch.jobs || "").trim().toLowerCase();
    return jobs.filter((job) => {
      const matchStatus = statusKey === "ALL" || job.status === statusKey;
      const searchBlob  = [job.title, job.companyName, job.location, job.skills, job.description].filter(Boolean).join(" ").toLowerCase();
      return matchStatus && (!query || searchBlob.includes(query));
    });
  }, [jobs, statusFilters.jobs, moduleSearch.jobs]);

  const filteredJobApplications = useMemo(() => {
    const statusKey = statusFilters.jobApps;
    const query = (moduleSearch.jobApps || "").trim().toLowerCase();
    return jobApplications.filter((app) => {
      const matchStatus = statusKey === "ALL" || app.status === statusKey;
      const snap = app.applicantSnapshot || {};
      const searchBlob = [
        snap.fullName, snap.email, snap.phone, snap.city, snap.profession,
        snap.skills?.join(" "), app.applicant?.firstName, app.applicant?.lastName,
      ].filter(Boolean).join(" ").toLowerCase();
      return matchStatus && (!query || searchBlob.includes(query));
    });
  }, [jobApplications, statusFilters.jobApps, moduleSearch.jobApps]);

  const filteredScholarships = useMemo(() => {
    const statusKey = statusFilters.scholarships;
    const query = (moduleSearch.scholarships || "").trim().toLowerCase();
    return scholarships.filter((s) => {
      const matchStatus = statusKey === "ALL" || s.status === statusKey;
      const searchBlob  = [s.title, s.description, s.eligibility].filter(Boolean).join(" ").toLowerCase();
      return matchStatus && (!query || searchBlob.includes(query));
    });
  }, [scholarships, statusFilters.scholarships, moduleSearch.scholarships]);

  const filteredScholarshipApps = useMemo(() => {
    const statusKey = statusFilters.scholarshipApps;
    const query = (moduleSearch.scholarshipApps || "").trim().toLowerCase();
    return scholarshipApplications.filter((app) => {
      const matchStatus = statusKey === "ALL" || app.status === statusKey;
      const searchBlob  = [
        app.applicantName, app.educationDetails, app.statement,
        app.applicant?.firstName, app.applicant?.lastName, app.scholarship?.title,
      ].filter(Boolean).join(" ").toLowerCase();
      return matchStatus && (!query || searchBlob.includes(query));
    });
  }, [scholarshipApplications, statusFilters.scholarshipApps, moduleSearch.scholarshipApps]);

  return (
    <div className="w-full min-w-0 flex flex-col gap-6 text-[var(--text-primary)]">
      <div className="flex flex-col gap-6 w-full min-w-0">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow-badge mb-2">
                <FaBriefcase size={12} />
                <span>Careers &amp; Grants</span>
              </div>
              <h1 className="heading-hero text-[var(--text-primary)]">
                Jobs &amp; <span className="text-gradient">Scholarships</span>
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
                Moderate career posts, review applications, and manage education-support scholarships.
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {activeTab === "jobs" && (
                <button
                  type="button"
                  onClick={() => setShowJobForm((p) => !p)}
                  className="btn-primary !py-2 !px-4 !text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {showJobForm ? <FiX size={14} /> : <FiPlusIcon size={14} />}
                  <span>{showJobForm ? "Close Form" : "+ Post Career Listing"}</span>
                </button>
              )}
              {activeTab === "scholarships" && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingScholarshipId(null);
                    setScholarshipForm(initialScholarship);
                    setScholarshipDocumentFile(null);
                    setShowScholarshipForm((p) => !p);
                  }}
                  className="btn-primary !py-2 !px-4 !text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {showScholarshipForm ? <FiX size={14} /> : <FiPlusIcon size={14} />}
                  <span>{showScholarshipForm ? "Close Form" : "+ Create Scholarship"}</span>
                </button>
              )}
              <Button icon={FaSyncAlt} onClick={refreshActive} disabled={loading}>Refresh</Button>
            </div>
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

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════════════
                JOBS MODULE
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "jobs" && (
              <div className="flex flex-col gap-6 w-full min-w-0">
                {/* Collapsible / Toggleable Job Form */}
                {showJobForm && (
                  <form onSubmit={createJob} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 sm:p-6 shadow-xl space-y-4 w-full min-w-0">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Post New Career Listing</h2>
                        <p className="text-xs text-[var(--text-muted)]">Add a community job opportunity directly as Administrator</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowJobForm(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        <FiX size={16} />
                      </button>
                    </div>

                    <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="sm:col-span-2">
                        <Field label="Job Title *">
                          <input className={inputClass} value={jobForm.title} onChange={(e) => setJobForm((cur) => ({ ...cur, title: e.target.value }))} placeholder="e.g. Senior Software Engineer" required />
                        </Field>
                      </div>
                      <div>
                        <Field label="Company / Organization *">
                          <input className={inputClass} value={jobForm.companyName} onChange={(e) => setJobForm((cur) => ({ ...cur, companyName: e.target.value }))} placeholder="e.g. Acme Tech" required />
                        </Field>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <Field label="Job Description *">
                          <textarea className={textareaClass} value={jobForm.description} onChange={(e) => setJobForm((cur) => ({ ...cur, description: e.target.value }))} placeholder="Role responsibilities, benefits, and requirements..." required />
                        </Field>
                      </div>
                      <div>
                        <Field label="Location">
                          <input className={inputClass} value={jobForm.location} onChange={(e) => setJobForm((cur) => ({ ...cur, location: e.target.value }))} placeholder="e.g. Indore, MP" />
                        </Field>
                      </div>
                      <div>
                        <Field label="Employment Type">
                          <select className={inputClass} value={jobForm.employmentType} onChange={(e) => setJobForm((cur) => ({ ...cur, employmentType: e.target.value }))}>
                            <option value="FULL_TIME">Full time</option>
                            <option value="PART_TIME">Part time</option>
                            <option value="CONTRACT">Contract</option>
                            <option value="INTERNSHIP">Internship</option>
                            <option value="REMOTE">Remote</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </Field>
                      </div>
                      <div>
                        <Field label="Salary / CTC">
                          <input className={inputClass} value={jobForm.salaryRange} onChange={(e) => setJobForm((cur) => ({ ...cur, salaryRange: e.target.value }))} placeholder="e.g. 6 - 8 LPA" />
                        </Field>
                      </div>
                      <div>
                        <Field label="Experience Required">
                          <input className={inputClass} value={jobForm.experienceRequired} onChange={(e) => setJobForm((cur) => ({ ...cur, experienceRequired: e.target.value }))} placeholder="e.g. 2+ years" />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Skills Required">
                          <input className={inputClass} value={jobForm.skills} onChange={(e) => setJobForm((cur) => ({ ...cur, skills: e.target.value }))} placeholder="React, Node, Python (comma separated)" />
                        </Field>
                      </div>
                      <div>
                        <Field label="Expires At">
                          <input type="date" className={inputClass} value={jobForm.expiresAt} onChange={(e) => setJobForm((cur) => ({ ...cur, expiresAt: e.target.value }))} />
                        </Field>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3.5 space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">Job Provider Contact Details</p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Field label="Contact Person">
                          <input className={inputClass} value={jobForm.contactPersonName || ""} onChange={(e) => setJobForm((cur) => ({ ...cur, contactPersonName: e.target.value }))} placeholder="Name" />
                        </Field>
                        <Field label="Contact Phone">
                          <input className={inputClass} value={jobForm.contactPhone || ""} onChange={(e) => setJobForm((cur) => ({ ...cur, contactPhone: e.target.value }))} placeholder="Phone number" />
                        </Field>
                        <Field label="Contact Email">
                          <input className={inputClass} value={jobForm.contactEmail || ""} onChange={(e) => setJobForm((cur) => ({ ...cur, contactEmail: e.target.value }))} placeholder="Email address" />
                        </Field>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button icon={FaPaperPlane} tone="success" disabled={busyId === "job"}>
                        Save &amp; Post Job
                      </Button>
                      <Button type="button" onClick={() => setShowJobForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {/* Jobs Roster with Tabs + Search */}
                <section className="flex flex-col gap-4 w-full min-w-0">
                  <SummaryCards data={jobs} config={MODULE_STATUS_CONFIG.jobs} />
                  <div className="flex flex-col gap-2 w-full min-w-0">
                    <StatusTabBar
                      data={jobs}
                      config={MODULE_STATUS_CONFIG.jobs}
                      activeKey={statusFilters.jobs}
                      onChange={(k) => setFilter("jobs", k)}
                    />
                    <SearchBar
                      value={moduleSearch.jobs}
                      onChange={(v) => setSearch("jobs", v)}
                      placeholder="Search title, company, location, skills, contact..."
                    />
                  </div>

                  {filteredJobs.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.jobs} moduleLabel="job listings" />
                  ) : (
                    <div className="grid gap-4 w-full min-w-0">
                      {filteredJobs.map((job) => {
                        const isDone = DONE_STATUSES.has(job.status);
                        const isMemberJob = job.createdByRole === "MEMBER";
                        const needsAction = job.status === "PENDING_MODERATION" || job.status === "CHANGES_REQUESTED";
                        const phone = job.contactPhone || "";
                        const phoneClean = cleanPhone(phone);
                        const email = job.contactEmail || "";
                        const waNum = job.contactWhatsApp || phone;
                        const waClean = cleanPhone(waNum);

                        return (
                          <article
                            key={job._id}
                            className={`rounded-2xl border p-4 sm:p-5 md:p-6 transition shadow-sm ${
                              needsAction
                                ? "border-amber-400/40 bg-amber-400/5 shadow-amber-500/5"
                                : isDone
                                  ? "border-[var(--border-subtle)] bg-[var(--surface-elevated)] opacity-75"
                                  : "border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
                            }`}
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className={`text-base sm:text-lg font-bold break-words ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
                                    {job.title}
                                  </h3>
                                  <StatusBadge value={job.status} />
                                  {isMemberJob && (
                                    <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                                      Member Post
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] break-words">
                                  {job.companyName} {job.location ? `· 📍 ${job.location}` : ""} · 💼 {job.employmentType?.replace("_", " ")}
                                </p>
                                {job.salaryRange && (
                                  <p className="inline-block text-xs sm:text-sm font-bold text-emerald-400">
                                    💰 {job.salaryRange}
                                  </p>
                                )}
                                <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] break-words whitespace-pre-line">
                                  {job.description}
                                </p>
                                {job.skills?.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {job.skills.map((s) => (
                                      <span key={s} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-2.5 py-0.5 text-[11px] text-[var(--text-secondary)] font-medium">
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Provider contact — visible to admin for review */}
                                {(job.contactPersonName || job.contactPhone || job.contactEmail) && (
                                  <div className="mt-3 rounded-xl border border-violet-500/25 bg-violet-500/10 p-3.5 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                                        Job Provider Contact (Admin View)
                                      </p>
                                      {job.preferredContactMethod && job.preferredContactMethod !== "ANY" && (
                                        <span className="text-[10px] text-violet-300 font-medium">Prefers: {job.preferredContactMethod}</span>
                                      )}
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-3 text-xs">
                                      {job.contactPersonName && (
                                        <div>
                                          <span className="text-[10px] uppercase text-[var(--text-muted)] block">Contact Person</span>
                                          <span className="font-semibold text-[var(--text-primary)]">{job.contactPersonName}</span>
                                        </div>
                                      )}
                                      {job.contactPhone && (
                                        <div>
                                          <span className="text-[10px] uppercase text-[var(--text-muted)] block">Phone</span>
                                          <span className="font-semibold text-[var(--text-primary)]">{job.contactPhone}</span>
                                        </div>
                                      )}
                                      {job.contactEmail && (
                                        <div>
                                          <span className="text-[10px] uppercase text-[var(--text-muted)] block">Email</span>
                                          <span className="font-semibold text-[var(--text-primary)]">{job.contactEmail}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Action Links */}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                      {phoneClean && (
                                        <a
                                          href={`tel:${phoneClean.startsWith("+") ? phoneClean : `+91${phoneClean}`}`}
                                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                                        >
                                          <FiPhone size={11} /> Call
                                        </a>
                                      )}
                                      {waClean && (
                                        <a
                                          href={`https://wa.me/${waClean.startsWith("+") ? waClean.replace("+", "") : `91${waClean}`}`}
                                          target="_blank" rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-[11px] font-bold text-green-300 hover:bg-green-500/20 transition-colors"
                                        >
                                          <FaWhatsapp size={11} /> WhatsApp
                                        </a>
                                      )}
                                      {email && (
                                        <a
                                          href={`mailto:${email}`}
                                          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold text-sky-300 hover:bg-sky-500/20 transition-colors"
                                        >
                                          <FiMail size={11} /> Email
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Admin notes */}
                                {job.reviewNote && (
                                  <div className="rounded-xl border border-orange-400/25 bg-orange-400/10 px-3.5 py-2 text-xs text-orange-300">
                                    <span className="font-bold">Changes Requested: </span>{job.reviewNote}
                                  </div>
                                )}
                                {job.moderationReason && job.status === "REJECTED" && (
                                  <div className="rounded-xl border border-red-400/25 bg-red-400/10 px-3.5 py-2 text-xs text-red-300">
                                    <span className="font-bold">Rejection Reason: </span>{job.moderationReason}
                                  </div>
                                )}

                                {job.submittedAt && (
                                  <p className="text-[10px] text-[var(--text-muted)]">
                                    Submitted: {new Date(job.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 grid gap-2.5 border-t border-[var(--border-subtle)] pt-4">
                              {draftInput(job._id, needsAction ? "Review note / rejection reason (required for Reject & Changes)" : "Moderation reason")}
                              <div className="flex flex-wrap gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
                                {job.status !== "PUBLISHED" && (
                                  <Button
                                    tone="success"
                                    onClick={() => {
                                      if (window.confirm(`Approve and publish "${job.title}"? It will become visible to all job seekers.`)) {
                                        moderateJob(job._id, "PUBLISH");
                                      }
                                    }}
                                    disabled={busyId === job._id}
                                  >
                                    Approve &amp; Publish
                                  </Button>
                                )}
                                {needsAction && (
                                  <Button
                                    tone="warning"
                                    onClick={() => moderateJob(job._id, "REQUEST_CHANGES")}
                                    disabled={busyId === job._id}
                                  >
                                    Request Changes
                                  </Button>
                                )}
                                {(needsAction || job.status === "PUBLISHED") && (
                                  <Button
                                    tone="danger"
                                    onClick={() => moderateJob(job._id, "REJECT")}
                                    disabled={busyId === job._id}
                                  >
                                    Reject
                                  </Button>
                                )}
                                {job.status === "PUBLISHED" && (
                                  <Button tone="warning" onClick={() => moderateJob(job._id, "EXPIRE")} disabled={busyId === job._id}>
                                    Expire
                                  </Button>
                                )}
                                {job.status !== "ARCHIVED" && (
                                  <Button icon={FaArchive} tone="danger" onClick={() => moderateJob(job._id, "ARCHIVE")} disabled={busyId === job._id}>
                                    Archive
                                  </Button>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                JOB APPLICATIONS MODULE
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "jobApps" && (
              <section className="grid gap-4">
                {/* Select which job to view apps for */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Filter By Job Posting:</label>
                  <select
                    className={`${inputClass} !h-10 w-full sm:w-80`}
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                  >
                    {jobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title} ({job.companyName})
                      </option>
                    ))}
                  </select>
                </div>

                <SummaryCards data={jobApplications} config={MODULE_STATUS_CONFIG.jobApps} />

                <div className="flex flex-col gap-2">
                  <StatusTabBar
                    data={jobApplications}
                    config={MODULE_STATUS_CONFIG.jobApps}
                    activeKey={statusFilters.jobApps}
                    onChange={(k) => setFilter("jobApps", k)}
                  />
                  <SearchBar
                    value={moduleSearch.jobApps}
                    onChange={(v) => setSearch("jobApps", v)}
                    placeholder="Search applicant name, email, phone, city, skills, profession..."
                  />
                </div>

                {filteredJobApplications.length === 0 ? (
                  <ModuleEmptyState statusKey={statusFilters.jobApps} moduleLabel="job applications" />
                ) : (
                  <div className="grid gap-3">
                    {filteredJobApplications.map((application) => {
                      const snap = application.applicantSnapshot || {};
                      const name = snap.fullName || `${application.applicant?.firstName || ""} ${application.applicant?.lastName || ""}`.trim() || "Applicant";
                      const isDone = DONE_STATUSES.has(application.status);

                      return (
                        <article
                          key={application._id}
                          className={`rounded-2xl border p-4 sm:p-5 transition ${
                            isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className={`font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>{name}</h3>
                                <StatusBadge value={application.status} />
                              </div>
                              {snap.profession && (
                                <p className="text-xs text-[var(--accent-primary)] font-medium">
                                  {snap.profession}{snap.organization ? ` @ ${snap.organization}` : ""}
                                </p>
                              )}
                              <div className="mt-2 grid gap-1.5 text-xs text-[var(--text-secondary)] sm:grid-cols-2">
                                {snap.phone && <span>📞 {snap.phone}</span>}
                                {snap.city && <span>📍 {snap.city}</span>}
                                {snap.email && <span>✉️ {snap.email}</span>}
                                {snap.education && <span>🎓 {snap.education}</span>}
                                {snap.experienceYears != null && <span>💼 {snap.experienceYears} year(s) exp</span>}
                                {snap.expectedSalary && <span>💰 Expected: {snap.expectedSalary}</span>}
                              </div>
                              {snap.skills?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {snap.skills.map((skill) => (
                                    <span key={skill} className="rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-2.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {application.coverLetter && (
                                <p className="mt-2.5 text-xs text-[var(--text-muted)] italic border-l-2 border-[var(--border-subtle)] pl-3 line-clamp-2">
                                  "{application.coverLetter}"
                                </p>
                              )}
                              <div className="mt-3 flex flex-wrap gap-3">
                                {snap.linkedIn && <a href={snap.linkedIn} target="_blank" rel="noreferrer" className="text-xs font-bold text-sky-400 hover:underline">LinkedIn ↗</a>}
                                {snap.portfolioUrl && <a href={snap.portfolioUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-400 hover:underline">Portfolio ↗</a>}
                                {application.resume?.url && <a href={application.resume.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-amber-400 hover:underline">Resume ↗</a>}
                              </div>
                            </div>
                          </div>

                          {!isDone && (
                            <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 lg:grid-cols-[1fr_auto]">
                              {draftInput(application._id, "Review note for applicant")}
                              <div className="flex flex-wrap gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
                                <Button tone="warning" onClick={() => updateJobApplication(application._id, "SHORTLISTED")} disabled={busyId === application._id}>Shortlist</Button>
                                <Button onClick={() => updateJobApplication(application._id, "INTERVIEW")} disabled={busyId === application._id}>Interview</Button>
                                <Button tone="success" onClick={() => updateJobApplication(application._id, "SELECTED")} disabled={busyId === application._id}>Select</Button>
                                <Button tone="danger" onClick={() => updateJobApplication(application._id, "REJECTED")} disabled={busyId === application._id}>Reject</Button>
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

            {/* ══════════════════════════════════════════════════════════════
                SCHOLARSHIPS MODULE
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "scholarships" && (
              <div className="flex flex-col gap-6 w-full min-w-0">
                {/* Create / Edit Scholarship Form (Toggleable) */}
                {showScholarshipForm && (
                  <form onSubmit={createScholarship} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 sm:p-6 shadow-xl space-y-4 w-full min-w-0">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                          {editingScholarshipId ? "Edit Scholarship" : "Create Education Scholarship"}
                        </h2>
                        <p className="text-xs text-[var(--text-muted)]">Configure financial grant, eligibility and required proof</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowScholarshipForm(false);
                          setEditingScholarshipId(null);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        <FiX size={16} />
                      </button>
                    </div>

                    <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="sm:col-span-2">
                        <Field label="Scholarship Title *">
                          <input className={inputClass} value={scholarshipForm.title} onChange={(e) => setScholarshipForm((cur) => ({ ...cur, title: e.target.value }))} placeholder="e.g. Higher Education Merit Scholarship" required />
                        </Field>
                      </div>
                      <div>
                        <Field label="Status">
                          <select className={inputClass} value={scholarshipForm.status} onChange={(e) => setScholarshipForm((cur) => ({ ...cur, status: e.target.value }))}>
                            <option value="OPEN">Open (Accepting Applications)</option>
                            <option value="DRAFT">Draft</option>
                          </select>
                        </Field>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <Field label="Description *">
                          <textarea className={textareaClass} value={scholarshipForm.description} onChange={(e) => setScholarshipForm((cur) => ({ ...cur, description: e.target.value }))} placeholder="Program objectives, selection criteria..." required />
                        </Field>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <Field label="Eligibility Criteria">
                          <textarea className={textareaClass} value={scholarshipForm.eligibility} onChange={(e) => setScholarshipForm((cur) => ({ ...cur, eligibility: e.target.value }))} placeholder="Minimum 75% in 12th standard, enrolled in recognized university..." />
                        </Field>
                      </div>
                      <div>
                        <Field label="Grant Amount (Rs.)">
                          <input type="number" className={inputClass} value={scholarshipForm.amount} onChange={(e) => setScholarshipForm((cur) => ({ ...cur, amount: e.target.value }))} placeholder="25000" />
                        </Field>
                      </div>
                      <div>
                        <Field label="Seats Available">
                          <input type="number" className={inputClass} value={scholarshipForm.seats} onChange={(e) => setScholarshipForm((cur) => ({ ...cur, seats: e.target.value }))} placeholder="10" />
                        </Field>
                      </div>
                      <div>
                        <Field label="Deadline *">
                          <input type="date" className={inputClass} value={scholarshipForm.applicationDeadline} onChange={(e) => setScholarshipForm((cur) => ({ ...cur, applicationDeadline: e.target.value }))} required />
                        </Field>
                      </div>
                    </div>

                    <div className="grid gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 sm:p-4">
                      <div>
                        <h3 className="text-xs font-bold text-[var(--text-primary)]">Mandatory Supporting Proof</h3>
                        <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Applicant must upload this proof before submitting.</p>
                      </div>
                      <Field label="Proof Name *">
                        <input className={inputClass} value={scholarshipForm.requiredDocument.name} onChange={(e) => setScholarshipForm((cur) => ({ ...cur, requiredDocument: { ...cur.requiredDocument, name: e.target.value } }))} placeholder="Latest College Marksheet / Income Certificate" required={scholarshipForm.status === "OPEN"} />
                      </Field>
                      <Field label="Instructions">
                        <textarea className={textareaClass} value={scholarshipForm.requiredDocument.instructions} onChange={(e) => setScholarshipForm((cur) => ({ ...cur, requiredDocument: { ...cur.requiredDocument, instructions: e.target.value } }))} placeholder="Upload a clear PDF or scanned image..." />
                      </Field>
                      <Field label="Reference Form (PDF/Image)">
                        <input type="file" accept="application/pdf,image/jpeg,image/png" className={`${inputClass} !py-2`} onChange={(e) => setScholarshipDocumentFile(e.target.files?.[0] || null)} />
                      </Field>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button icon={FaPaperPlane} tone="success" disabled={busyId === "scholarship"}>
                        {editingScholarshipId ? "Update Scholarship" : "Save Scholarship"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setShowScholarshipForm(false);
                          setEditingScholarshipId(null);
                          setScholarshipForm(initialScholarship);
                          setScholarshipDocumentFile(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {/* Scholarships Roster with Tabs + Search */}
                <section className="flex flex-col gap-4 w-full min-w-0">
                  <SummaryCards data={scholarships} config={MODULE_STATUS_CONFIG.scholarships} />
                  <div className="flex flex-col gap-2 w-full min-w-0">
                    <StatusTabBar
                      data={scholarships}
                      config={MODULE_STATUS_CONFIG.scholarships}
                      activeKey={statusFilters.scholarships}
                      onChange={(k) => setFilter("scholarships", k)}
                    />
                    <SearchBar
                      value={moduleSearch.scholarships}
                      onChange={(v) => setSearch("scholarships", v)}
                      placeholder="Search scholarship title, description..."
                    />
                  </div>

                  {filteredScholarships.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.scholarships} moduleLabel="scholarships" />
                  ) : (
                    <div className="grid gap-4 w-full min-w-0">
                      {filteredScholarships.map((scholarship) => {
                        const isDone = DONE_STATUSES.has(scholarship.status);
                        return (
                          <article
                            key={scholarship._id}
                            className={`rounded-2xl border p-4 sm:p-5 md:p-6 transition shadow-sm ${
                              isDone ? "border-[var(--border-subtle)] bg-[var(--surface-elevated)] opacity-75" : "border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
                            }`}
                          >
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className={`text-base sm:text-lg font-bold break-words ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
                                    {scholarship.title}
                                  </h3>
                                  <StatusBadge value={scholarship.status} />
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-emerald-400">
                                  {money(scholarship.amount)} · ⏳ Deadline {formatDate(scholarship.applicationDeadline)} {scholarship.seats ? `· 🪑 ${scholarship.seats} Seats` : ""}
                                </p>
                                <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] break-words whitespace-pre-line">
                                  {scholarship.description}
                                </p>
                                {scholarship.eligibility && (
                                  <p className="text-xs text-[var(--text-muted)] italic">
                                    <span className="font-semibold text-[var(--text-secondary)]">Eligibility: </span>{scholarship.eligibility}
                                  </p>
                                )}
                                {scholarship.requiredDocument?.name && (
                                  <p className="mt-1.5 text-xs text-emerald-400 font-medium">
                                    Required Proof: {scholarship.requiredDocument.name}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 grid gap-2.5 border-t border-[var(--border-subtle)] pt-4 md:grid-cols-[1fr_auto]">
                              {draftInput(scholarship._id, "Archive reason")}
                              <div className="flex flex-wrap gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
                                <Button
                                  type="button"
                                  onClick={() => {
                                    setEditingScholarshipId(scholarship._id);
                                    setScholarshipForm({
                                      title: scholarship.title || "",
                                      description: scholarship.description || "",
                                      eligibility: scholarship.eligibility || "",
                                      amount: scholarship.amount || "",
                                      seats: scholarship.seats || "",
                                      applicationDeadline: scholarship.applicationDeadline ? new Date(scholarship.applicationDeadline).toISOString().slice(0, 10) : "",
                                      status: scholarship.status === "OPEN" ? "OPEN" : "DRAFT",
                                      requiredDocument: {
                                        enabled: Boolean(scholarship.requiredDocument?.enabled),
                                        name: scholarship.requiredDocument?.name || "",
                                        instructions: scholarship.requiredDocument?.instructions || "",
                                      },
                                    });
                                    setScholarshipDocumentFile(null);
                                    setShowScholarshipForm(true);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  icon={FaArchive}
                                  tone="danger"
                                  onClick={() => archiveScholarship(scholarship._id)}
                                  disabled={busyId === scholarship._id || scholarship.status === "ARCHIVED"}
                                >
                                  Archive
                                </Button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                SCHOLARSHIP APPLICATIONS MODULE
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "scholarshipApps" && (
              <section className="grid gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Filter By Scholarship:</label>
                  <select
                    className={`${inputClass} !h-10 w-full sm:w-80`}
                    value={selectedScholarship}
                    onChange={(e) => setSelectedScholarship(e.target.value)}
                  >
                    <option value="">All Scholarships</option>
                    {scholarships.map((s) => (
                      <option key={s._id} value={s._id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <SummaryCards data={scholarshipApplications} config={MODULE_STATUS_CONFIG.scholarshipApps} />

                <div className="flex flex-col gap-2">
                  <StatusTabBar
                    data={scholarshipApplications}
                    config={MODULE_STATUS_CONFIG.scholarshipApps}
                    activeKey={statusFilters.scholarshipApps}
                    onChange={(k) => setFilter("scholarshipApps", k)}
                  />
                  <SearchBar
                    value={moduleSearch.scholarshipApps}
                    onChange={(v) => setSearch("scholarshipApps", v)}
                    placeholder="Search applicant name, education, statement..."
                  />
                </div>

                {filteredScholarshipApps.length === 0 ? (
                  <ModuleEmptyState statusKey={statusFilters.scholarshipApps} moduleLabel="scholarship applications" />
                ) : (
                  <div className="grid gap-3">
                    {filteredScholarshipApps.map((application) => {
                      const isDone = DONE_STATUSES.has(application.status);
                      const name = application.applicantName || `${application.applicant?.firstName || ""} ${application.applicant?.lastName || ""}`;

                      return (
                        <article
                          key={application._id}
                          className={`rounded-2xl border p-4 sm:p-5 transition ${
                            isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className={`font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>{name}</h3>
                                <StatusBadge value={application.status} />
                              </div>
                              <p className="text-xs text-gray-400 font-medium">
                                {application.scholarship?.title || "Scholarship"} · {application.educationDetails || "Education not set"}
                              </p>
                              <p className="mt-1.5 line-clamp-2 text-xs text-gray-500 leading-relaxed">
                                {application.statement || "No statement provided."}
                              </p>
                              {application.documents?.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {application.documents.map((doc) => (
                                    <a
                                      key={doc.publicId || doc.url}
                                      href={doc.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn-secondary !py-1.5 !px-3 !text-[11px] inline-flex items-center gap-1 text-emerald-300"
                                    >
                                      <span>📄 View {doc.fileName || doc.name || "Proof Document"} ↗</span>
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-2 text-xs text-amber-400">No supporting document uploaded</p>
                              )}
                            </div>
                          </div>

                          {!isDone && (
                            <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 lg:grid-cols-[1fr_auto]">
                              {draftInput(application._id, "Review note for applicant")}
                              <div className="flex flex-wrap gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
                                <Button onClick={() => reviewScholarshipApplication(application._id, "UNDER_REVIEW")} disabled={busyId === application._id}>Review</Button>
                                <Button tone="warning" onClick={() => reviewScholarshipApplication(application._id, "SHORTLISTED")} disabled={busyId === application._id}>Shortlist</Button>
                                <Button tone="success" onClick={() => reviewScholarshipApplication(application._id, "APPROVED")} disabled={busyId === application._id}>Approve</Button>
                                <Button tone="danger" onClick={() => reviewScholarshipApplication(application._id, "REJECTED")} disabled={busyId === application._id}>Reject</Button>
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

export default OpportunityAdmin;
