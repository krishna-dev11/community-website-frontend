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
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { opportunityEndpoints } from "../../../../services/apis";

const inputClass = "ka-input";
const textareaClass = "ka-input !min-h-24 resize-none !py-3";

const tabs = [
  { key: "jobs", label: "Jobs", icon: FaBriefcase },
  { key: "jobApps", label: "Job Apps", icon: FaCheck },
  { key: "scholarships", label: "Scholarships", icon: FaGraduationCap },
  { key: "scholarshipApps", label: "Scholarship Apps", icon: FaCheck },
];

const Button = ({ children, icon: Icon, tone = "neutral", className = "", ...props }) => {
  const toneClasses = {
    neutral: "btn-secondary !py-2 !px-4 !text-xs",
    success: "btn-primary !py-2 !px-5 !text-xs",
    warning: "inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all hover:bg-amber-400/20 disabled:opacity-50 cursor-pointer",
    danger: "inline-flex items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 text-red-300 font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all hover:bg-red-400/20 disabled:opacity-50 cursor-pointer",
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

const Status = ({ value }) => (
  <span className="inline-flex w-fit rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
    {value || "UNKNOWN"}
  </span>
);

const Empty = ({ text }) => (
  <div className="ka-card border-dashed px-5 py-8 text-sm text-[var(--text-muted)] text-center">{text}</div>
);


const money = (value) => value ? `Rs. ${Number(value).toLocaleString("en-IN")}` : "Amount not set";
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not set";

const initialJob = {
  title: "",
  companyName: "",
  description: "",
  location: "",
  employmentType: "FULL_TIME",
  salaryRange: "",
  experienceRequired: "",
  skills: "",
  contactEmail: "",
  contactPhone: "",
  expiresAt: "",
  status: "PUBLISHED",
};

const initialScholarship = {
  title: "",
  description: "",
  eligibility: "",
  amount: "",
  seats: "",
  applicationDeadline: "",
  status: "OPEN",
};

const OpportunityAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("jobs");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [jobApplications, setJobApplications] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [selectedScholarship, setSelectedScholarship] = useState("");
  const [scholarshipApplications, setScholarshipApplications] = useState([]);
  const [jobForm, setJobForm] = useState(initialJob);
  const [scholarshipForm, setScholarshipForm] = useState(initialScholarship);
  const [drafts, setDrafts] = useState({});

  const authConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }), [token]);

  const loadJobs = async () => {
    const response = await apiConnector("GET", opportunityEndpoints.ADMIN_JOBS_API, null, authConfig, { limit: 40 });
    const items = response.data?.data?.jobs || [];
    setJobs(items);
    if (!selectedJob && items[0]?._id) setSelectedJob(items[0]._id);
  };

  const loadJobApplications = async () => {
    if (!selectedJob) {
      setJobApplications([]);
      return;
    }
    const response = await apiConnector("GET", opportunityEndpoints.JOB_APPLICATIONS_API(selectedJob), null, authConfig, { limit: 40 });
    setJobApplications(response.data?.data?.applications || []);
  };

  const loadScholarships = async () => {
    const response = await apiConnector("GET", opportunityEndpoints.ADMIN_SCHOLARSHIPS_API, null, authConfig, { limit: 40 });
    const items = response.data?.data?.scholarships || [];
    setScholarships(items);
    if (!selectedScholarship && items[0]?._id) setSelectedScholarship(items[0]._id);
  };

  const loadScholarshipApplications = async () => {
    const endpoint = selectedScholarship
      ? opportunityEndpoints.SCHOLARSHIP_APPLICATIONS_API(selectedScholarship)
      : opportunityEndpoints.ADMIN_SCHOLARSHIP_APPLICATIONS_API;
    const response = await apiConnector("GET", endpoint, null, authConfig, { limit: 40 });
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
    if (activeTab === "jobApps") loadJobApplications().catch((error) => toast.error(error.response?.data?.message || "Unable to load job applications"));
  }, [selectedJob]);

  useEffect(() => {
    if (activeTab === "scholarshipApps") loadScholarshipApplications().catch((error) => toast.error(error.response?.data?.message || "Unable to load scholarship applications"));
  }, [selectedScholarship]);

  const createJob = async (event) => {
    event.preventDefault();
    setBusyId("job");
    try {
      await apiConnector("POST", opportunityEndpoints.JOBS_API, jobForm, authConfig);
      toast.success("Job saved");
      setJobForm(initialJob);
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
      toast.success("Job moderated");
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
      await apiConnector(
        "POST",
        opportunityEndpoints.SCHOLARSHIPS_API,
        {
          ...scholarshipForm,
          amount: scholarshipForm.amount ? Number(scholarshipForm.amount) : undefined,
          seats: scholarshipForm.seats ? Number(scholarshipForm.seats) : undefined,
        },
        authConfig
      );
      toast.success("Scholarship saved");
      setScholarshipForm(initialScholarship);
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

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow-badge mb-2">
                <FaBriefcase size={12} />
                <span>Careers & Grants</span>
              </div>
              <h1 className="heading-hero text-[var(--text-primary)]">Jobs & <span className="text-gradient">Scholarships</span></h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
                Moderate career posts, review applications, and manage education-support scholarships.
              </p>
            </div>
            <Button icon={FaSyncAlt} onClick={refreshActive} disabled={loading}>Refresh</Button>
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
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {activeTab === "jobs" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createJob} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold">Create Job</h2>
                  <Field label="Title"><input className={inputClass} value={jobForm.title} onChange={(event) => setJobForm((current) => ({ ...current, title: event.target.value }))} required /></Field>
                  <Field label="Company"><input className={inputClass} value={jobForm.companyName} onChange={(event) => setJobForm((current) => ({ ...current, companyName: event.target.value }))} required /></Field>
                  <Field label="Description"><textarea className={textareaClass} value={jobForm.description} onChange={(event) => setJobForm((current) => ({ ...current, description: event.target.value }))} required /></Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Location"><input className={inputClass} value={jobForm.location} onChange={(event) => setJobForm((current) => ({ ...current, location: event.target.value }))} /></Field>
                    <Field label="Type">
                      <select className={inputClass} value={jobForm.employmentType} onChange={(event) => setJobForm((current) => ({ ...current, employmentType: event.target.value }))}>
                        <option value="FULL_TIME">Full time</option>
                        <option value="PART_TIME">Part time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                        <option value="REMOTE">Remote</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </Field>
                    <Field label="Salary"><input className={inputClass} value={jobForm.salaryRange} onChange={(event) => setJobForm((current) => ({ ...current, salaryRange: event.target.value }))} /></Field>
                    <Field label="Experience"><input className={inputClass} value={jobForm.experienceRequired} onChange={(event) => setJobForm((current) => ({ ...current, experienceRequired: event.target.value }))} /></Field>
                    <Field label="Skills"><input className={inputClass} value={jobForm.skills} onChange={(event) => setJobForm((current) => ({ ...current, skills: event.target.value }))} placeholder="Comma separated" /></Field>
                    <Field label="Expires At"><input type="date" className={inputClass} value={jobForm.expiresAt} onChange={(event) => setJobForm((current) => ({ ...current, expiresAt: event.target.value }))} /></Field>
                  </div>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "job"}>Save Job</Button>
                </form>
                <section className="grid gap-3">
                  {jobs.map((job) => (
                    <article key={job._id} className="border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-bold">{job.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{job.companyName} - {job.location || "Location not set"}</p>
                          <p className="mt-2 line-clamp-2 text-xs text-gray-600">{job.description}</p>
                        </div>
                        <Status value={job.status} />
                      </div>
                      <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 lg:grid-cols-[1fr_auto_auto_auto_auto]">
                        {draftInput(job._id, "Moderation reason")}
                        <Button tone="success" onClick={() => moderateJob(job._id, "PUBLISH")} disabled={busyId === job._id}>Publish</Button>
                        <Button tone="warning" onClick={() => moderateJob(job._id, "REJECT")} disabled={busyId === job._id}>Reject</Button>
                        <Button onClick={() => moderateJob(job._id, "EXPIRE")} disabled={busyId === job._id}>Expire</Button>
                        <Button icon={FaArchive} tone="danger" onClick={() => moderateJob(job._id, "ARCHIVE")} disabled={busyId === job._id}>Archive</Button>
                      </div>
                    </article>
                  ))}
                  {jobs.length === 0 && <Empty text="No jobs found." />}
                </section>
              </div>
            )}

            {activeTab === "jobApps" && (
              <section className="grid gap-4">
                <select className={inputClass} value={selectedJob} onChange={(event) => setSelectedJob(event.target.value)}>
                  <option value="">Select job</option>
                  {jobs.map((job) => <option key={job._id} value={job._id}>{job.title}</option>)}
                </select>
                {jobApplications.map((application) => (
                  <article key={application._id} className="border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-bold">{application.applicant?.firstName} {application.applicant?.lastName}</h3>
                        <p className="mt-1 text-sm text-gray-500">{application.coverLetter || "No cover letter"}</p>
                        {application.resume?.url ? <a href={application.resume.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold text-emerald-300">Open resume</a> : null}
                      </div>
                      <Status value={application.status} />
                    </div>
                    <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 lg:grid-cols-[1fr_auto_auto_auto_auto]">
                      {draftInput(application._id, "Review note")}
                      <Button tone="success" onClick={() => updateJobApplication(application._id, "SHORTLISTED")} disabled={busyId === application._id}>Shortlist</Button>
                      <Button onClick={() => updateJobApplication(application._id, "INTERVIEW")} disabled={busyId === application._id}>Interview</Button>
                      <Button tone="success" onClick={() => updateJobApplication(application._id, "SELECTED")} disabled={busyId === application._id}>Select</Button>
                      <Button tone="danger" onClick={() => updateJobApplication(application._id, "REJECTED")} disabled={busyId === application._id}>Reject</Button>
                    </div>
                  </article>
                ))}
                {jobApplications.length === 0 && <Empty text="No job applications found." />}
              </section>
            )}

            {activeTab === "scholarships" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createScholarship} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold">Create Scholarship</h2>
                  <Field label="Title"><input className={inputClass} value={scholarshipForm.title} onChange={(event) => setScholarshipForm((current) => ({ ...current, title: event.target.value }))} required /></Field>
                  <Field label="Description"><textarea className={textareaClass} value={scholarshipForm.description} onChange={(event) => setScholarshipForm((current) => ({ ...current, description: event.target.value }))} required /></Field>
                  <Field label="Eligibility"><textarea className={textareaClass} value={scholarshipForm.eligibility} onChange={(event) => setScholarshipForm((current) => ({ ...current, eligibility: event.target.value }))} /></Field>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Amount"><input type="number" className={inputClass} value={scholarshipForm.amount} onChange={(event) => setScholarshipForm((current) => ({ ...current, amount: event.target.value }))} /></Field>
                    <Field label="Seats"><input type="number" className={inputClass} value={scholarshipForm.seats} onChange={(event) => setScholarshipForm((current) => ({ ...current, seats: event.target.value }))} /></Field>
                    <Field label="Deadline"><input type="date" className={inputClass} value={scholarshipForm.applicationDeadline} onChange={(event) => setScholarshipForm((current) => ({ ...current, applicationDeadline: event.target.value }))} required /></Field>
                  </div>
                  <Field label="Status">
                    <select className={inputClass} value={scholarshipForm.status} onChange={(event) => setScholarshipForm((current) => ({ ...current, status: event.target.value }))}>
                      <option value="DRAFT">Draft</option>
                      <option value="OPEN">Open</option>
                    </select>
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "scholarship"}>Save Scholarship</Button>
                </form>
                <section className="grid gap-3">
                  {scholarships.map((scholarship) => (
                    <article key={scholarship._id} className="border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-bold">{scholarship.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{money(scholarship.amount)} - deadline {formatDate(scholarship.applicationDeadline)}</p>
                          <p className="mt-2 line-clamp-2 text-xs text-gray-600">{scholarship.description}</p>
                        </div>
                        <Status value={scholarship.status} />
                      </div>
                      <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 md:grid-cols-[1fr_auto]">
                        {draftInput(scholarship._id, "Archive reason")}
                        <Button icon={FaArchive} tone="danger" onClick={() => archiveScholarship(scholarship._id)} disabled={busyId === scholarship._id || scholarship.status === "ARCHIVED"}>Archive</Button>
                      </div>
                    </article>
                  ))}
                  {scholarships.length === 0 && <Empty text="No scholarships found." />}
                </section>
              </div>
            )}

            {activeTab === "scholarshipApps" && (
              <section className="grid gap-4">
                <select className={inputClass} value={selectedScholarship} onChange={(event) => setSelectedScholarship(event.target.value)}>
                  <option value="">All scholarships</option>
                  {scholarships.map((scholarship) => <option key={scholarship._id} value={scholarship._id}>{scholarship.title}</option>)}
                </select>
                {scholarshipApplications.map((application) => (
                  <article key={application._id} className="border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-bold">{application.applicantName || `${application.applicant?.firstName || ""} ${application.applicant?.lastName || ""}`}</h3>
                        <p className="mt-1 text-sm text-gray-500">{application.scholarship?.title || "Scholarship"} - {application.educationDetails || "Education not set"}</p>
                        <p className="mt-2 line-clamp-2 text-xs text-gray-600">{application.statement || "No statement"}</p>
                      </div>
                      <Status value={application.status} />
                    </div>
                    <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 lg:grid-cols-[1fr_auto_auto_auto_auto]">
                      {draftInput(application._id, "Review reason")}
                      <Button onClick={() => reviewScholarshipApplication(application._id, "UNDER_REVIEW")} disabled={busyId === application._id}>Review</Button>
                      <Button tone="warning" onClick={() => reviewScholarshipApplication(application._id, "SHORTLISTED")} disabled={busyId === application._id}>Shortlist</Button>
                      <Button tone="success" onClick={() => reviewScholarshipApplication(application._id, "APPROVED")} disabled={busyId === application._id}>Approve</Button>
                      <Button tone="danger" onClick={() => reviewScholarshipApplication(application._id, "REJECTED")} disabled={busyId === application._id}>Reject</Button>
                    </div>
                  </article>
                ))}
                {scholarshipApplications.length === 0 && <Empty text="No scholarship applications found." />}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OpportunityAdmin;
