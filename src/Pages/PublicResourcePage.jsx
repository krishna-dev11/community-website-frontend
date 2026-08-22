import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiArrowRight, FiAward, FiBookOpen, FiBriefcase, FiCalendar, FiDownload, FiHeart, FiImage, FiSearch, FiSend, FiX } from "react-icons/fi";
import { apiConnector } from "../services/apiConnector";
import { communityEndpoints, contentEndpoints, opportunityEndpoints } from "../services/apis";

const formatDate = (value) => {
  if (!value) return "Open";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const resourceConfig = {
  notices: {
    title: "Notices & Announcements",
    label: "Community Updates",
    description: "Important published updates, circulars, and announcements from the Samaj committee.",
    endpoint: contentEndpoints.NOTICES_API,
    dataKey: "notices",
    empty: "No published notices are available right now.",
    accent: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    icon: FiCalendar,
  },
  publications: {
    title: "Samaj Magazine",
    label: "Publications",
    description: "Browse patrika editions and community publications shared by the content team.",
    endpoint: contentEndpoints.PUBLICATIONS_API,
    dataKey: "publications",
    empty: "No published magazines are available right now.",
    accent: "border-sky-400/30 bg-sky-500/10 text-sky-200",
    icon: FiBookOpen,
  },
  gallery: {
    title: "Photo & Video Gallery",
    label: "Albums",
    description: "Community moments, programs, and events collected as public gallery albums.",
    endpoint: contentEndpoints.GALLERY_ALBUMS_API,
    dataKey: "albums",
    empty: "No published gallery albums are available right now.",
    accent: "border-amber-400/30 bg-amber-500/10 text-amber-100",
    icon: FiImage,
  },
  jobs: {
    title: "Jobs & Careers",
    label: "Opportunities",
    description: "Open career opportunities submitted for Samaj members and moderated by the team.",
    endpoint: opportunityEndpoints.JOBS_API,
    dataKey: "jobs",
    empty: "No open jobs are available right now.",
    accent: "border-violet-400/30 bg-violet-500/10 text-violet-100",
    icon: FiBriefcase,
  },
  scholarships: {
    title: "Scholarships",
    label: "Education Support",
    description: "Open scholarship schemes with deadlines, eligibility, amount, and available seats.",
    endpoint: opportunityEndpoints.SCHOLARSHIPS_API,
    dataKey: "scholarships",
    empty: "No open scholarships are available right now.",
    accent: "border-rose-400/30 bg-rose-500/10 text-rose-100",
    icon: FiBookOpen,
  },
  achievements: {
    title: "Achievements",
    label: "Community Pride",
    description: "Celebrate member achievements across education, business, service, sports, and public life.",
    endpoint: communityEndpoints.ACHIEVEMENTS_API,
    dataKey: "achievements",
    empty: "No published achievements are available right now.",
    accent: "border-yellow-400/30 bg-yellow-500/10 text-yellow-100",
    icon: FiAward,
  },
  condolence: {
    title: "Shradhanjali",
    label: "Condolence",
    description: "Remember departed community members with dignity, gratitude, and shared prayers.",
    endpoint: communityEndpoints.SHRADHANJALIS_API,
    dataKey: "shradhanjalis",
    empty: "No published shradhanjali messages are available right now.",
    accent: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100",
    icon: FiHeart,
  },
};

const getItemDate = (type, item) => {
  if (type === "scholarships") return item.applicationDeadline;
  if (type === "condolence") return item.dateOfPassing;
  if (type === "gallery") return item.eventDate || item.createdAt;
  if (type === "publications") return item.publishedAt || item.updatedAt;
  if (type === "jobs") return item.expiresAt || item.publishedAt;
  return item.publishedAt || item.createdAt;
};

const getSummary = (type, item) => {
  if (type === "jobs") {
    return [item.companyName, item.location, item.employmentType].filter(Boolean).join(" • ");
  }
  if (type === "scholarships") {
    const amount = item.amount ? `Amount: Rs. ${Number(item.amount).toLocaleString("en-IN")}` : null;
    const seats = item.seats ? `${item.approvedCount || 0}/${item.seats} seats filled` : null;
    return [amount, seats].filter(Boolean).join(" • ");
  }
  if (type === "achievements") {
    return [item.achieverName, item.category].filter(Boolean).join(" • ") || "Community achievement";
  }
  if (type === "condolence") {
    return item.dateOfBirth ? `${formatDate(item.dateOfBirth)} - ${formatDate(item.dateOfPassing)}` : "Remembered by the community";
  }
  if (type === "publications") {
    return [item.edition, item.month && item.year ? `${item.month}/${item.year}` : item.year].filter(Boolean).join(" • ");
  }
  if (type === "gallery") {
    return `${item.photoCount || 0} photos`;
  }
  return item.category || "Announcement";
};

const getDescription = (item) => {
  return item.description || item.message || item.eligibility || item.summary || "Details will be available soon.";
};

const getCoverImage = (type, item) => {
  if (type === "achievements") return item.image?.url;
  if (type === "condolence") return item.photo?.url;
  return item.coverImage?.url;
};

const getTitle = (type, item) => {
  if (type === "condolence") return item.personName;
  return item.title || item.achieverName || "Untitled";
};

const PublicResourcePage = ({ type }) => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const config = resourceConfig[type] || resourceConfig.notices;
  const Icon = config.icon;
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applicationTarget, setApplicationTarget] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    applicantName: "",
    educationDetails: "",
    incomeDetails: "",
    statement: "",
  });

  const params = useMemo(() => {
    const next = { page: 1, limit: type === "gallery" ? 12 : 10 };
    if (activeQuery.trim()) next.q = activeQuery.trim();
    return next;
  }, [activeQuery, type]);

  useEffect(() => {
    let mounted = true;

    const loadResources = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiConnector("GET", config.endpoint, null, null, params);
        if (!mounted) return;
        setItems(response?.data?.data?.[config.dataKey] || []);
        setMeta(response?.data?.meta || null);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Could not load this section.");
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadResources();
    return () => {
      mounted = false;
    };
  }, [config.dataKey, config.endpoint, params]);

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveQuery(query);
  };

  const handlePublicationDownload = async (item) => {
    if (type !== "publications" || !item?._id) return;
    try {
      await apiConnector("POST", contentEndpoints.PUBLICATION_DOWNLOAD_API(item._id));
    } catch {
      // Download tracking should never block access to the public file.
    }
    if (item?.file?.url) window.open(item.file.url, "_blank", "noopener,noreferrer");
  };

  const openApplication = (item) => {
    if (!token) {
      toast.error("Please login to apply.");
      navigate("/login");
      return;
    }

    setApplicationTarget(item);
    setApplicationForm({
      coverLetter: "",
      applicantName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      educationDetails: "",
      incomeDetails: "",
      statement: "",
    });
  };

  const closeApplication = () => {
    if (!applying) setApplicationTarget(null);
  };

  const handleApplicationChange = (field, value) => {
    setApplicationForm((current) => ({ ...current, [field]: value }));
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    if (!applicationTarget?._id) return;

    const isScholarship = type === "scholarships";
    if (isScholarship && (!applicationForm.applicantName || !applicationForm.statement)) {
      toast.error("Applicant name and statement are required.");
      return;
    }

    const endpoint = isScholarship
      ? opportunityEndpoints.APPLY_SCHOLARSHIP_API(applicationTarget._id)
      : opportunityEndpoints.APPLY_JOB_API(applicationTarget._id);

    const body = isScholarship
      ? {
          applicantName: applicationForm.applicantName,
          educationDetails: applicationForm.educationDetails,
          incomeDetails: applicationForm.incomeDetails,
          statement: applicationForm.statement,
        }
      : {
          coverLetter: applicationForm.coverLetter,
        };

    setApplying(true);
    const toastId = toast.loading("Submitting application...");
    try {
      await apiConnector("POST", endpoint, body, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success(isScholarship ? "Scholarship application submitted." : "Job application submitted.");
      setApplicationTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not submit application.");
    } finally {
      toast.dismiss(toastId);
      setApplying(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 pb-16 pt-28 text-[var(--text-primary)] sm:px-6 lg:px-8 transition-colors duration-300">
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-8 border-b border-[var(--border-subtle)] pb-8">
          <div className="eyebrow-badge mb-5">
            <Icon size={14} />
            <span>{config.label}</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <h1 className="heading-hero text-[var(--text-primary)] mb-2">
                {config.title}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)] font-normal">
                {config.description}
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex min-w-0 items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
              <FiSearch className="ml-2 shrink-0 text-[var(--text-muted)]" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] border-none shadow-none focus:ring-0"
              />
              <button type="submit" className="btn-primary !py-2 !px-4 !text-xs uppercase tracking-wider font-bold">
                Search
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="ka-card p-12 text-center text-[var(--text-muted)]">
            {config.empty}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item._id} className="ka-card flex flex-col justify-between p-0 overflow-hidden group">
                {["gallery", "publications", "achievements", "condolence"].includes(type) ? (
                  <div className="aspect-[16/9] bg-[var(--surface-elevated)] overflow-hidden">
                    {getCoverImage(type, item) ? (
                      <img src={getCoverImage(type, item)} alt={getTitle(type, item)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                        <Icon size={36} />
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
                      <span>{formatDate(getItemDate(type, item))}</span>
                      <span className="rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-semibold text-[var(--accent-primary)]">{getSummary(type, item)}</span>
                    </div>

                    <h2 className="line-clamp-2 text-xl font-bold leading-snug tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                      {getTitle(type, item)}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                      {getDescription(item)}
                    </p>

                    {item.skills?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="rounded-full bg-[var(--surface-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
                    {type === "publications" && item.file?.url ? (
                      <button
                        type="button"
                        onClick={() => handlePublicationDownload(item)}
                        className="btn-primary !py-2.5 !px-5 !text-xs w-full"
                      >
                        <FiDownload size={15} />
                        <span>Download Edition</span>
                      </button>
                    ) : type === "jobs" || type === "scholarships" ? (
                      <button
                        type="button"
                        onClick={() => openApplication(item)}
                        className="btn-primary !py-2.5 !px-5 !text-xs w-full"
                      >
                        <FiSend size={15} />
                        <span>Apply Now</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                        <span>View details</span>
                        <FiArrowRight size={14} />
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {meta?.total !== undefined && !loading ? (
          <p className="mt-8 text-xs font-medium text-[var(--text-muted)]">
            Showing {items.length} of {meta.total} records
          </p>
        ) : null}
      </section>

      {applicationTarget ? (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md">
          <form
            onSubmit={submitApplication}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto ka-card p-6 sm:p-8 shadow-2xl border border-[var(--border-strong)]"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <p className="eyebrow-badge mb-2">
                  {type === "scholarships" ? "Scholarship Application" : "Job Application"}
                </p>
                <h2 className="mt-1 text-2xl font-bold leading-snug text-[var(--text-primary)]">
                  {applicationTarget.title}
                </h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {getSummary(type, applicationTarget)}
                </p>
              </div>
              <button
                type="button"
                onClick={closeApplication}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {type === "scholarships" ? (
              <div className="grid gap-4">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Applicant name</span>
                  <input
                    value={applicationForm.applicantName}
                    onChange={(event) => handleApplicationChange("applicantName", event.target.value)}
                    className="ka-input"
                    placeholder="Full name"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Education details</span>
                  <textarea
                    value={applicationForm.educationDetails}
                    onChange={(event) => handleApplicationChange("educationDetails", event.target.value)}
                    rows={3}
                    className="ka-input resize-none"
                    placeholder="Class, course, college, marks, or other relevant education details"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Income details</span>
                  <textarea
                    value={applicationForm.incomeDetails}
                    onChange={(event) => handleApplicationChange("incomeDetails", event.target.value)}
                    rows={3}
                    className="ka-input resize-none"
                    placeholder="Family income or financial background"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Statement</span>
                  <textarea
                    value={applicationForm.statement}
                    onChange={(event) => handleApplicationChange("statement", event.target.value)}
                    rows={4}
                    className="ka-input resize-none"
                    placeholder="Why are you applying?"
                  />
                </label>
              </div>
            ) : (
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Cover letter</span>
                <textarea
                  value={applicationForm.coverLetter}
                  onChange={(event) => handleApplicationChange("coverLetter", event.target.value)}
                  rows={7}
                  className="ka-input resize-none"
                  placeholder="Introduce yourself and explain why you are a good fit."
                />
              </label>
            )}

            <button
              type="submit"
              disabled={applying}
              className="btn-primary mt-6 w-full"
            >
              <FiSend size={16} />
              <span>{applying ? "Submitting" : "Submit Application"}</span>
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
};

export default PublicResourcePage;
