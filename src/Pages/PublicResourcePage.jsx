import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiDownload,
  FiHeart,
  FiImage,
  FiSearch,
  FiSend,
  FiX,
  FiZoomIn,
  FiFileText,
  FiExternalLink,
  FiPlus,
  FiCheckCircle,
  FiMapPin,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";
import { apiConnector } from "../services/apiConnector";
import { communityEndpoints, contentEndpoints, opportunityEndpoints } from "../services/apis";
import DocViewer from "../Components/Common/DocViewer";

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
  solutions: {
    title: "Community Solutions",
    label: "Public Solutions",
    description: "Real community challenges and their verified resolutions by the Samaj committee.",
    endpoint: communityEndpoints.PUBLIC_SOLUTIONS_API,
    dataKey: "solutions",
    empty: "No community solutions have been published yet.",
    accent: "border-teal-400/30 bg-teal-500/10 text-teal-200",
    icon: FiFileText,
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
  if (type === "solutions") return item.resolvedAt || item.publishedAt || item.createdAt;
  return item.publishedAt || item.createdAt;
};

const getSummary = (type, item) => {
  if (type === "jobs") {
    return [item.companyName, item.location, item.employmentType].filter(Boolean).join(" • ");
  }
  if (type === "scholarships") {
    const amount = item.amount ? `Rs. ${Number(item.amount).toLocaleString("en-IN")}` : null;
    const seats = item.seats ? `${item.approvedCount || 0}/${item.seats} seats` : null;
    return [amount, seats].filter(Boolean).join(" • ");
  }
  if (type === "solutions") {
    return item.category || "Community Solution";
  }
  if (type === "achievements") {
    return [item.achieverName, item.category].filter(Boolean).join(" • ") || "Community achievement";
  }
  if (type === "condolence") {
    return item.dateOfBirth ? `${formatDate(item.dateOfBirth)} - ${formatDate(item.dateOfPassing)}` : "In Loving Memory";
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
  return item.description || item.message || item.eligibility || item.summary || item.solution || "Details will be available soon.";
};

const getCoverImage = (type, item) => {
  if (type === "achievements") return item.image?.url;
  if (type === "condolence") return item.photo?.url;
  if (type === "notices") return item.attachments?.[0]?.url;
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

  // Modals & Active targets
  const [selectedItem, setSelectedItem] = useState(null); // Detail view modal
  const [applicationTarget, setApplicationTarget] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    applicantName: "",
    educationDetails: "",
    incomeDetails: "",
    statement: "",
  });

  // Post a Job Modal (Requirement 17)
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [submittingJob, setSubmittingJob] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    companyName: "",
    description: "",
    location: "",
    employmentType: "FULL_TIME",
    experienceLevel: "MID",
    salaryRange: "",
    skillsRequired: "",
    contactEmail: "",
    applicationUrl: "",
    expiresAt: "",
  });

  // Gallery album expansion & Lightbox (Requirement 20)
  const [openAlbum, setOpenAlbum] = useState(null);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

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

  const openGalleryAlbum = useCallback(async (album) => {
    setOpenAlbum({ ...album, photos: [] });
    setAlbumLoading(true);
    try {
      const response = await apiConnector("GET", contentEndpoints.GALLERY_PHOTOS_API(album._id), null, null, { limit: 50 });
      const photos = response?.data?.data?.photos || [];
      setOpenAlbum({ ...album, photos });
    } catch {
      setOpenAlbum({ ...album, photos: [] });
    } finally {
      setAlbumLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (lightboxIndex === null) return;
      const count = openAlbum?.photos?.length || 0;
      if (event.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % count);
      if (event.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + count) % count);
      if (event.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, openAlbum]);

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveQuery(query);
  };

  const handlePublicationDownload = async (item) => {
    if (type !== "publications" || !item?._id) return;
    try {
      await apiConnector("POST", contentEndpoints.PUBLICATION_DOWNLOAD_API(item._id));
    } catch {}
    if (item?.file?.url) {
      let downloadUrl = item.file.url;
      if (downloadUrl.includes("cloudinary.com") && downloadUrl.includes("/upload/")) {
        downloadUrl = downloadUrl.replace("/upload/", "/upload/fl_attachment/");
      }
      const cleanTitle = (item.title || "Samaj_Patrika").replace(/[^a-zA-Z0-9_-]/g, "_");
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${cleanTitle}.pdf`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Publication download started");
    } else {
      toast.error("Publication file not found");
    }
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

  const handleJobFormChange = (field, value) => {
    setJobForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitJobOpportunity = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to post a job opportunity.");
      navigate("/login");
      return;
    }
    if (!jobForm.title || !jobForm.companyName || !jobForm.description) {
      toast.error("Title, company name, and description are required.");
      return;
    }

    setSubmittingJob(true);
    const toastId = toast.loading("Submitting job opportunity...");
    try {
      const payload = {
        ...jobForm,
        skillsRequired: jobForm.skillsRequired
          ? jobForm.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };
      await apiConnector("POST", opportunityEndpoints.JOBS_API, payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success("Job opening submitted for committee review!");
      setIsPostingJob(false);
      setJobForm({
        title: "",
        companyName: "",
        description: "",
        location: "",
        employmentType: "FULL_TIME",
        experienceLevel: "MID",
        salaryRange: "",
        skillsRequired: "",
        contactEmail: "",
        applicationUrl: "",
        expiresAt: "",
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit job.");
    } finally {
      toast.dismiss(toastId);
      setSubmittingJob(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 pb-16 pt-28 text-[var(--text-primary)] sm:px-6 lg:px-8 transition-colors duration-300">
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-8 border-b border-[var(--border-subtle)] pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="eyebrow-badge">
              <Icon size={14} />
              <span>{config.label}</span>
            </div>

            {/* Post a Job button for members on Jobs page (Requirement 17) */}
            {type === "jobs" && (
              <button
                onClick={() => {
                  if (!token) {
                    toast.error("Please login to post a job.");
                    navigate("/login");
                    return;
                  }
                  setIsPostingJob(true);
                }}
                className="btn-primary !py-2 !px-4 !text-xs uppercase tracking-wider font-bold cursor-pointer"
              >
                <FiPlus size={14} />
                <span>Post a Job Opening</span>
              </button>
            )}
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
                placeholder="Search keywords..."
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
              <article
                key={item._id}
                className="ka-card flex flex-col justify-between p-0 overflow-hidden group hover:border-[var(--accent-primary)]/40 transition-all cursor-pointer"
                onClick={() => {
                  if (type === "gallery") {
                    openGalleryAlbum(item);
                  } else if (type !== "publications") {
                    setSelectedItem(item);
                  }
                }}
              >
                {["gallery", "publications", "achievements", "condolence", "notices"].includes(type) ? (
                  <div className="aspect-[16/9] bg-[var(--surface-elevated)] overflow-hidden">
                    {getCoverImage(type, item) ? (
                      <img
                        src={getCoverImage(type, item)}
                        alt={getTitle(type, item)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                        <Icon size={36} />
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
                      <span>{formatDate(getItemDate(type, item))}</span>
                      <span className="rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-semibold text-[var(--accent-primary)]">
                        {getSummary(type, item)}
                      </span>
                    </div>

                    <h2 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
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
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingDoc({ url: item.file.url, title: item.title });
                          }}
                          className="btn-secondary !py-2 !px-4 !text-xs w-full sm:w-auto"
                        >
                          <FiFileText size={14} />
                          <span>Read Online</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublicationDownload(item);
                          }}
                          className="btn-primary !py-2.5 !px-5 !text-xs w-full sm:flex-1"
                        >
                          <FiDownload size={15} />
                          <span>Download Edition</span>
                        </button>
                      </div>
                    ) : type === "gallery" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGalleryAlbum(item);
                        }}
                        className="btn-primary !py-2.5 !px-5 !text-xs w-full"
                      >
                        <FiImage size={15} />
                        <span>View {item.photoCount || 0} Photos</span>
                      </button>
                    ) : type === "jobs" || type === "scholarships" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openApplication(item);
                          }}
                          className="btn-primary !py-2.5 !px-4 !text-xs flex-1"
                        >
                          <FiSend size={14} />
                          <span>Apply</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                          className="btn-secondary !py-2.5 !px-3 !text-xs"
                        >
                          Details
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] group-hover:underline">
                        <span>View Details & Attachments</span>
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

      {/* ================= ITEM DETAIL MODAL (Requirement 18, 8, 12, 13) ================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto ka-card p-6 sm:p-8 shadow-2xl border border-[var(--border-strong)]">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <span className="eyebrow-badge mb-2">{config.label}</span>
                <h2 className="mt-1 text-2xl font-bold leading-snug text-[var(--text-primary)]">
                  {getTitle(type, selectedItem)}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                  <span>📅 {formatDate(getItemDate(type, selectedItem))}</span>
                  {selectedItem.category && <span>• 🏷️ {selectedItem.category}</span>}
                  {selectedItem.location && <span>• 📍 {selectedItem.location}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
              {/* Solution Specific View */}
              {type === "solutions" && (
                <>
                  <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-1">
                      Problem Summary
                    </h4>
                    <p className="text-xs sm:text-sm text-[var(--text-primary)]">
                      {selectedItem.problemSummary || selectedItem.description}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                      <FiCheckCircle size={14} /> Official Resolution
                    </h4>
                    <p className="text-xs sm:text-sm text-emerald-200">
                      {selectedItem.solution}
                    </p>
                  </div>

                  {selectedItem.beforeAfterExplanation && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                        Impact & Context
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {selectedItem.beforeAfterExplanation}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* General Description */}
              {type !== "solutions" && (
                <div className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-primary)]">
                  {getDescription(selectedItem)}
                </div>
              )}

              {/* Tribute specific info */}
              {type === "condolence" && selectedItem.familyInfo && (
                <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Family Information
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">{selectedItem.familyInfo}</p>
                </div>
              )}

              {/* Notice Attachments (PDF / Image Preview & Download - Requirement 18) */}
              {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                <div className="pt-4 border-t border-[var(--border-subtle)]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-3">
                    Attached Documents & Media
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedItem.attachments.map((att, idx) => {
                      const isPdf = att.url?.toLowerCase().endsWith(".pdf") || att.mimeType === "application/pdf";
                      return (
                        <div
                          key={att.publicId || idx}
                          className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-bold text-xs">
                              {isPdf ? "PDF" : "IMG"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                                {att.name || `Document #${idx + 1}`}
                              </p>
                              <p className="text-[10px] text-[var(--text-muted)]">Official Attachment</p>
                            </div>
                          </div>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary !py-1.5 !px-3 !text-[10px] shrink-0"
                          >
                            <FiExternalLink size={12} />
                            <span>Open</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Achievement / Supporting Doc */}
              {selectedItem.supportingDocument?.url && (
                <div className="pt-4 border-t border-[var(--border-subtle)]">
                  <a
                    href={selectedItem.supportingDocument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary !py-2 !px-4 !text-xs inline-flex"
                  >
                    <FiDownload size={14} />
                    <span>View Supporting Verification Document</span>
                  </a>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="btn-secondary !py-2.5 !px-6 !text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= POST A JOB MODAL (Requirement 17) ================= */}
      {isPostingJob && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md">
          <form
            onSubmit={submitJobOpportunity}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto ka-card p-6 sm:p-8 shadow-2xl border border-[var(--border-strong)]"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <p className="eyebrow-badge mb-2">Member Hiring</p>
                <h2 className="text-2xl font-bold leading-snug text-[var(--text-primary)]">
                  Post a Job Opportunity
                </h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Submitted jobs enter admin moderation and will be published for community members upon approval.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPostingJob(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Job Title *</span>
                  <input
                    required
                    value={jobForm.title}
                    onChange={(e) => handleJobFormChange("title", e.target.value)}
                    className="ka-input"
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Company / Employer *</span>
                  <input
                    required
                    value={jobForm.companyName}
                    onChange={(e) => handleJobFormChange("companyName", e.target.value)}
                    className="ka-input"
                    placeholder="e.g. TechCorp Solutions"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Employment Type</span>
                  <select
                    value={jobForm.employmentType}
                    onChange={(e) => handleJobFormChange("employmentType", e.target.value)}
                    className="ka-input"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Experience Level</span>
                  <select
                    value={jobForm.experienceLevel}
                    onChange={(e) => handleJobFormChange("experienceLevel", e.target.value)}
                    className="ka-input"
                  >
                    <option value="ENTRY">Entry Level</option>
                    <option value="MID">Mid Level</option>
                    <option value="SENIOR">Senior Level</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Location</span>
                  <input
                    value={jobForm.location}
                    onChange={(e) => handleJobFormChange("location", e.target.value)}
                    className="ka-input"
                    placeholder="e.g. Indore, MP / Remote"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Salary / CTC Range</span>
                  <input
                    value={jobForm.salaryRange}
                    onChange={(e) => handleJobFormChange("salaryRange", e.target.value)}
                    className="ka-input"
                    placeholder="e.g. 6 LPA - 10 LPA"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Contact Email</span>
                  <input
                    type="email"
                    value={jobForm.contactEmail}
                    onChange={(e) => handleJobFormChange("contactEmail", e.target.value)}
                    className="ka-input"
                    placeholder="hr@example.com"
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Required Skills (comma separated)</span>
                <input
                  value={jobForm.skillsRequired}
                  onChange={(e) => handleJobFormChange("skillsRequired", e.target.value)}
                  className="ka-input"
                  placeholder="React, Node.js, TailwindCSS, MongoDB"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Job Description & Requirements *</span>
                <textarea
                  required
                  rows={5}
                  value={jobForm.description}
                  onChange={(e) => handleJobFormChange("description", e.target.value)}
                  className="ka-input resize-none"
                  placeholder="Describe the role responsibilities, qualifications, and how members can apply."
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPostingJob(false)}
                className="btn-secondary !py-2.5 !px-5 !text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingJob}
                className="btn-primary !py-2.5 !px-6 !text-xs cursor-pointer disabled:opacity-50"
              >
                {submittingJob ? "Submitting..." : "Submit Job for Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= GALLERY ALBUM PHOTO VIEWER (Requirement 20) ================= */}
      {openAlbum && (
        <div className="fixed inset-0 z-[1100] flex flex-col bg-[var(--bg)] overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg)]/90 backdrop-blur-md px-4 py-3">
            <button
              onClick={() => { setOpenAlbum(null); setLightboxIndex(null); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <FiArrowLeft size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold text-[var(--text-primary)]">{openAlbum.title}</h2>
              <p className="text-xs text-[var(--text-muted)]">{openAlbum.photos?.length || 0} photos (Max 10 per album)</p>
            </div>
          </div>

          <div className="p-4 pb-16">
            {albumLoading ? (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-2xl bg-[var(--surface)]" />
                ))}
              </div>
            ) : openAlbum.photos?.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center text-[var(--text-muted)]">
                <FiImage size={48} />
                <p className="text-sm">No photos in this album yet.</p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {openAlbum.photos.map((photo, index) => (
                  <button
                    key={photo._id || index}
                    onClick={() => setLightboxIndex(index)}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  >
                    <img
                      src={photo.url || photo.image?.url}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                      <FiZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && openAlbum?.photos?.length > 0 && (() => {
        const photos = openAlbum.photos;
        const photo = photos[lightboxIndex];
        return (
          <div
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/95 px-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              onClick={() => setLightboxIndex(null)}
            >
              <FiX size={20} />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              onClick={(event) => { event.stopPropagation(); setLightboxIndex((i) => (i - 1 + photos.length) % photos.length); }}
            >
              <FiArrowLeft size={20} />
            </button>
            <img
              src={photo.url || photo.image?.url}
              alt={photo.caption || `Photo ${lightboxIndex + 1}`}
              className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              onClick={(event) => { event.stopPropagation(); setLightboxIndex((i) => (i + 1) % photos.length); }}
            >
              <FiArrowRight size={20} />
            </button>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-xs text-white">
              {lightboxIndex + 1} / {photos.length}{photo.caption ? ` — ${photo.caption}` : ""}
            </p>
          </div>
        );
      })()}

      {/* ================= JOB / SCHOLARSHIP APPLICATION MODAL ================= */}
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Applicant Name</span>
                  <input
                    value={applicationForm.applicantName}
                    onChange={(event) => handleApplicationChange("applicantName", event.target.value)}
                    className="ka-input"
                    placeholder="Full name"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Education Details</span>
                  <textarea
                    value={applicationForm.educationDetails}
                    onChange={(event) => handleApplicationChange("educationDetails", event.target.value)}
                    rows={3}
                    className="ka-input resize-none"
                    placeholder="Class, course, college, marks, or other relevant education details"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Income Details</span>
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
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Cover Letter & Experience Summary</span>
                <textarea
                  value={applicationForm.coverLetter}
                  onChange={(event) => handleApplicationChange("coverLetter", event.target.value)}
                  rows={7}
                  className="ka-input resize-none"
                  placeholder="Introduce yourself, mention key skills, past work, and why you are applying."
                />
              </label>
            )}

            <button
              type="submit"
              disabled={applying}
              className="btn-primary mt-6 w-full"
            >
              <FiSend size={16} />
              <span>{applying ? "Submitting..." : "Submit Application"}</span>
            </button>
          </form>
        </div>
      ) : null}

      {/* Document / Publication Viewer */}
      <DocViewer
        isOpen={Boolean(viewingDoc)}
        onClose={() => setViewingDoc(null)}
        url={viewingDoc?.url}
        title={viewingDoc?.title}
      />
    </main>
  );
};

export default PublicResourcePage;
