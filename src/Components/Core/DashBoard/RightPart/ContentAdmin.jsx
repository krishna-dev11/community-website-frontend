import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArchive,
  FaBookOpen,
  FaBullhorn,
  FaEdit,
  FaImage,
  FaLeaf,
  FaPaperPlane,
  FaSyncAlt,
  FaUsersCog,
  FaUpload,
  FaYoutube,
  FaPlay,
} from "react-icons/fa";
import { FiX, FiTrash2, FiClock, FiCheckCircle, FiSearch, FiEye } from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { contentEndpoints } from "../../../../services/apis";
import FileUploadWithPreview from "../../../Common/FileUploadWithPreview";

// ─── Top-level tabs ────────────────────────────────────────────────────────
const tabs = [
  { key: "notices",      label: "Notices",                 icon: FaBullhorn },
  { key: "publications", label: "Publications / Patrika",  icon: FaBookOpen },
  { key: "gallery",      label: "Photo Gallery",           icon: FaImage    },
  { key: "videos",       label: "YouTube Videos",          icon: FaYoutube  },
  { key: "management",   label: "Management Committee",    icon: FaUsersCog },
  { key: "gotra",        label: "Gotra Master",            icon: FaLeaf     },
  { key: "cms",          label: "CMS Pages",               icon: FaEdit     },
];

// ─── Status configs per module ─────────────────────────────────────────────
const MODULE_STATUS_CONFIG = {
  notices: [
    { key: "DRAFT",     label: "Drafts (Needs Action)" },
    { key: "PUBLISHED", label: "Published"             },
    { key: "ARCHIVED",  label: "Archived"              },
    { key: "ALL",       label: "All"                   },
  ],
  publications: [
    { key: "DRAFT",     label: "Drafts (Needs Action)" },
    { key: "PUBLISHED", label: "Published"             },
    { key: "UPDATED",   label: "Updated"               },
    { key: "ARCHIVED",  label: "Archived"              },
    { key: "ALL",       label: "All"                   },
  ],
  gallery: [
    { key: "DRAFT",     label: "Drafts (Needs Action)" },
    { key: "PUBLISHED", label: "Published"             },
    { key: "ARCHIVED",  label: "Archived"              },
    { key: "ALL",       label: "All"                   },
  ],
  videos: [
    { key: "PUBLISHED", label: "Published on Site"     },
    { key: "DRAFT",     label: "Drafts (Hidden)"       },
    { key: "ALL",       label: "All"                   },
  ],
  management: [
    { key: "ACTIVE",    label: "Active Committee"      },
    { key: "PAST",      label: "Past Members"          },
    { key: "ARCHIVED",  label: "Archived"              },
    { key: "ALL",       label: "All"                   },
  ],
};

const DONE_STATUSES = new Set(["ARCHIVED", "PAST"]);

const MODULE_DEFAULT_STATUS = {
  notices:      "DRAFT",
  publications: "DRAFT",
  gallery:      "DRAFT",
  videos:       "PUBLISHED",
  management:   "ACTIVE",
};

const inputClass = "ka-input";
const textareaClass = "ka-input !min-h-24 resize-none !py-3";

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
  <label className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
    {children}
  </label>
);

const StatusBadge = ({ value }) => {
  const styles = {
    PUBLISHED: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    ACTIVE:    "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    DRAFT:     "border-amber-400/40 bg-amber-400/10 text-amber-300",
    UPDATED:   "border-sky-400/40 bg-sky-400/10 text-sky-300",
    PAST:      "border-indigo-400/40 bg-indigo-400/10 text-indigo-300",
    ARCHIVED:  "border-red-400/40 bg-red-400/10 text-red-300",
  };
  return (
    <span
      className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        styles[value] || "border-white/10 bg-white/5 text-gray-400"
      }`}
    >
      {value || "UNKNOWN"}
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
    { label: "Draft / Action", value: actionKey ? (counts[actionKey] || 0) : 0,                   textColor: "text-amber-300",              border: "border-amber-400/20" },
    { label: "Active / Live", value: midKeys.reduce((s, k) => s + (counts[k] || 0), 0),          textColor: "text-emerald-300",            border: "border-emerald-400/20" },
    { label: "Archived / Past", value: doneKeys.reduce((s, k) => s + (counts[k] || 0), 0),       textColor: "text-gray-400",               border: "border-gray-500/20" },
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
        <p className="text-xs text-[var(--text-muted)]">No {moduleLabel} require action right now.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-12 text-center">
      <FiClock size={26} className="text-[var(--text-muted)]" />
      <p className="text-sm font-semibold text-[var(--text-secondary)]">No records found</p>
      <p className="text-xs text-[var(--text-muted)]">No {moduleLabel} matching this status.</p>
    </div>
  );
};

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const initialNotice = { title: "", description: "", category: "GENERAL", expiresAt: "", status: "DRAFT" };
const initialPublication = { title: "", description: "", month: "", year: new Date().getFullYear(), edition: "", status: "DRAFT" };
const initialAlbum = { title: "", description: "", eventDate: "", displayOrder: 0, status: "DRAFT" };
const initialVideo = { title: "", youtubeUrl: "", description: "", eventName: "", eventDate: "", displayOrder: 0, status: "PUBLISHED" };
const initialManagement = { name: "", roleTitle: "", bio: "", phone: "", email: "", displayOrder: 0, status: "ACTIVE" };
const initialGotra = { name: "", region: "", description: "", status: "ACTIVE" };
const initialCms = { key: "about", title: "", summary: "", body: "", status: "PUBLISHED" };

// ============================================================================
//  ContentAdmin Main Component
// ============================================================================
const ContentAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("notices");
  const [loading, setLoading]     = useState(false);
  const [busyId, setBusyId]       = useState(null);

  const [notices, setNotices]           = useState([]);
  const [publications, setPublications] = useState([]);
  const [albums, setAlbums]             = useState([]);
  const [videos, setVideos]             = useState([]);
  const [management, setManagement]     = useState([]);
  const [gotras, setGotras]             = useState([]);
  const [cmsPage, setCmsPage]           = useState(initialCms);

  // Forms and File states
  const [noticeForm, setNoticeForm]                     = useState(initialNotice);
  const [noticeAttachmentFile, setNoticeAttachmentFile] = useState(null);

  const [publicationForm, setPublicationForm]           = useState(initialPublication);
  const [publicationFile, setPublicationFile]           = useState(null);
  const [publicationCoverFile, setPublicationCoverFile] = useState(null);

  const [albumForm, setAlbumForm]                       = useState(initialAlbum);
  const [albumCoverFile, setAlbumCoverFile]             = useState(null);
  const [selectedAlbumForPhotos, setSelectedAlbumForPhotos] = useState("");
  const [photoFiles, setPhotoFiles]                     = useState([]);
  const [photoFilesInput, setPhotoFilesInput]           = useState(null);

  const [videoForm, setVideoForm]                       = useState(initialVideo);
  const [editingVideoId, setEditingVideoId]             = useState(null);
  const [previewVideo, setPreviewVideo]                 = useState(null);

  const [managementForm, setManagementForm]             = useState(initialManagement);
  const [managementImageFile, setManagementImageFile]   = useState(null);

  const [gotraForm, setGotraForm]                       = useState(initialGotra);

  // ── Per-module status filters and search ──────────────────────────────────
  const [statusFilters, setStatusFilters] = useState({ ...MODULE_DEFAULT_STATUS });
  const [moduleSearch, setModuleSearch]   = useState({
    notices: "", publications: "", gallery: "", videos: "", management: "", gotra: "",
  });

  const setFilter = (mod, key) => setStatusFilters((prev) => ({ ...prev, [mod]: key }));
  const setSearch = (mod, val) => setModuleSearch((prev) => ({ ...prev, [mod]: val }));

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const loadNotices = async () => {
    const response = await apiConnector("GET", contentEndpoints.ADMIN_NOTICES_API, null, authConfig, { limit: 100 });
    setNotices(response.data?.data?.notices || []);
  };

  const loadPublications = async () => {
    const response = await apiConnector("GET", contentEndpoints.ADMIN_PUBLICATIONS_API, null, authConfig, { limit: 100 });
    setPublications(response.data?.data?.publications || []);
  };

  const loadAlbums = async () => {
    const response = await apiConnector("GET", contentEndpoints.GALLERY_ALBUMS_API, null, authConfig, { admin: "true", limit: 100 });
    setAlbums(response.data?.data?.albums || []);
  };

  const loadVideos = async () => {
    const response = await apiConnector("GET", contentEndpoints.ADMIN_VIDEOS_API, null, authConfig, { limit: 100 });
    setVideos(response.data?.data?.videos || []);
  };

  const loadManagement = async () => {
    const response = await apiConnector("GET", contentEndpoints.MANAGEMENT_API, null, authConfig, { includePast: "true", limit: 100 });
    setManagement(response.data?.data?.members || []);
  };

  const loadGotras = async () => {
    const response = await apiConnector("GET", contentEndpoints.GOTRAS_API, null, authConfig, { admin: "true", limit: 200 });
    setGotras(response.data?.data?.gotras || []);
  };

  const loadCms = async (key = "about") => {
    try {
      const response = await apiConnector("GET", contentEndpoints.CMS_CONTENT_API(key), null, authConfig);
      setCmsPage(response.data?.data?.content || { ...initialCms, key });
    } catch {
      setCmsPage({ ...initialCms, key });
    }
  };

  const refreshActive = async () => {
    setLoading(true);
    try {
      if (activeTab === "notices") await loadNotices();
      if (activeTab === "publications") await loadPublications();
      if (activeTab === "gallery") await loadAlbums();
      if (activeTab === "videos") await loadVideos();
      if (activeTab === "management") await loadManagement();
      if (activeTab === "gotra") await loadGotras();
      if (activeTab === "cms") await loadCms(cmsPage.key || "about");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load content data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshActive();
  }, [activeTab]);

  const createNotice = async (event) => {
    event.preventDefault();
    setBusyId("notice");
    try {
      const formData = new FormData();
      formData.append("title", noticeForm.title);
      formData.append("description", noticeForm.description);
      formData.append("category", noticeForm.category);
      if (noticeForm.expiresAt) formData.append("expiresAt", noticeForm.expiresAt);
      formData.append("status", noticeForm.status);
      if (noticeAttachmentFile instanceof File) {
        formData.append("attachments", noticeAttachmentFile);
      }
      await apiConnector("POST", contentEndpoints.NOTICES_API, formData, authConfig);
      toast.success("Notice saved successfully");
      setNoticeForm(initialNotice);
      setNoticeAttachmentFile(null);
      await loadNotices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save notice");
    } finally {
      setBusyId(null);
    }
  };

  const publishNotice = async (noticeId) => {
    setBusyId(noticeId);
    try {
      await apiConnector("PATCH", contentEndpoints.PUBLISH_NOTICE_API(noticeId), null, authConfig);
      toast.success("Notice published");
      await loadNotices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to publish notice");
    } finally {
      setBusyId(null);
    }
  };

  const archiveNotice = async (noticeId) => {
    setBusyId(noticeId);
    try {
      await apiConnector("PATCH", contentEndpoints.ARCHIVE_NOTICE_API(noticeId), { reason: "Archived from dashboard" }, authConfig);
      toast.success("Notice archived");
      await loadNotices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to archive notice");
    } finally {
      setBusyId(null);
    }
  };

  const createPublication = async (event) => {
    event.preventDefault();
    setBusyId("publication");
    try {
      const formData = new FormData();
      formData.append("title", publicationForm.title);
      formData.append("description", publicationForm.description || "");
      if (publicationForm.month) formData.append("month", Number(publicationForm.month));
      if (publicationForm.year) formData.append("year", Number(publicationForm.year));
      if (publicationForm.edition) formData.append("edition", publicationForm.edition);
      formData.append("status", publicationForm.status);
      if (publicationFile instanceof File) formData.append("file", publicationFile);
      if (publicationCoverFile instanceof File) formData.append("coverImage", publicationCoverFile);

      await apiConnector("POST", contentEndpoints.PUBLICATIONS_API, formData, authConfig);
      toast.success("Publication saved");
      setPublicationForm(initialPublication);
      setPublicationFile(null);
      setPublicationCoverFile(null);
      await loadPublications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save publication");
    } finally {
      setBusyId(null);
    }
  };

  const updatePublicationStatus = async (publicationId, action) => {
    setBusyId(publicationId);
    try {
      const endpoint = action === "publish"
        ? contentEndpoints.PUBLISH_PUBLICATION_API(publicationId)
        : contentEndpoints.ARCHIVE_PUBLICATION_API(publicationId);
      await apiConnector("PATCH", endpoint, action === "archive" ? { reason: "Archived from dashboard" } : null, authConfig);
      toast.success(action === "publish" ? "Publication published" : "Publication archived");
      await loadPublications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update publication");
    } finally {
      setBusyId(null);
    }
  };

  const createAlbum = async (event) => {
    event.preventDefault();
    setBusyId("album");
    try {
      const formData = new FormData();
      formData.append("title", albumForm.title);
      formData.append("description", albumForm.description || "");
      if (albumForm.eventDate) formData.append("eventDate", albumForm.eventDate);
      formData.append("displayOrder", Number(albumForm.displayOrder || 0));
      formData.append("status", albumForm.status);
      if (albumCoverFile instanceof File) formData.append("coverImage", albumCoverFile);

      await apiConnector("POST", contentEndpoints.GALLERY_ALBUMS_API, formData, authConfig);
      toast.success("Gallery album created");
      setAlbumForm(initialAlbum);
      setAlbumCoverFile(null);
      await loadAlbums();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save album");
    } finally {
      setBusyId(null);
    }
  };

  const archiveAlbum = async (albumId) => {
    setBusyId(albumId);
    try {
      await apiConnector("PATCH", contentEndpoints.ARCHIVE_GALLERY_ALBUM_API(albumId), { reason: "Archived from dashboard" }, authConfig);
      toast.success("Album archived");
      await loadAlbums();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to archive album");
    } finally {
      setBusyId(null);
    }
  };

  const addPhotosToAlbum = async (event) => {
    event.preventDefault();
    if (!selectedAlbumForPhotos) { toast.error("Select an album first"); return; }
    if (photoFiles.length === 0) { toast.error("Select at least one photo"); return; }
    setBusyId("add-photos");
    try {
      const formData = new FormData();
      photoFiles.forEach((file) => formData.append("photos", file));
      await apiConnector("POST", contentEndpoints.GALLERY_PHOTOS_API(selectedAlbumForPhotos), formData, authConfig);
      toast.success(`${photoFiles.length} photo(s) uploaded to album`);
      setPhotoFiles([]);
      setSelectedAlbumForPhotos("");
      if (photoFilesInput) photoFilesInput.value = "";
      await loadAlbums();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to upload photos");
    } finally {
      setBusyId(null);
    }
  };

  const createManagement = async (event) => {
    event.preventDefault();
    setBusyId("management");
    try {
      const formData = new FormData();
      formData.append("name", managementForm.name);
      formData.append("roleTitle", managementForm.roleTitle);
      formData.append("bio", managementForm.bio || "");
      formData.append("phone", managementForm.phone || "");
      formData.append("email", managementForm.email || "");
      formData.append("displayOrder", Number(managementForm.displayOrder || 0));
      formData.append("status", managementForm.status);
      if (managementImageFile instanceof File) formData.append("image", managementImageFile);

      await apiConnector("POST", contentEndpoints.MANAGEMENT_API, formData, authConfig);
      toast.success("Management member saved");
      setManagementForm(initialManagement);
      setManagementImageFile(null);
      await loadManagement();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save management member");
    } finally {
      setBusyId(null);
    }
  };

  const archiveManagement = async (memberId) => {
    setBusyId(memberId);
    try {
      await apiConnector("PATCH", contentEndpoints.ARCHIVE_MANAGEMENT_MEMBER_API(memberId), { reason: "Archived from dashboard" }, authConfig);
      toast.success("Management member archived");
      await loadManagement();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to archive management member");
    } finally {
      setBusyId(null);
    }
  };

  const createGotra = async (event) => {
    event.preventDefault();
    setBusyId("gotra");
    try {
      await apiConnector("POST", contentEndpoints.GOTRAS_API, gotraForm, authConfig);
      toast.success("Gotra saved");
      setGotraForm(initialGotra);
      await loadGotras();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save gotra");
    } finally {
      setBusyId(null);
    }
  };

  const archiveGotra = async (gotraId) => {
    setBusyId(gotraId);
    try {
      await apiConnector("PATCH", contentEndpoints.ARCHIVE_GOTRA_API(gotraId), { reason: "Archived from dashboard" }, authConfig);
      toast.success("Gotra archived");
      await loadGotras();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to archive gotra");
    } finally {
      setBusyId(null);
    }
  };

  const saveCms = async (event) => {
    event.preventDefault();
    setBusyId("cms");
    try {
      await apiConnector("POST", contentEndpoints.CMS_CONTENT_API(cmsPage.key), cmsPage, authConfig);
      toast.success("CMS page saved");
      await loadCms(cmsPage.key);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save CMS page");
    } finally {
      setBusyId(null);
    }
  };

  // ── Filtered data sets ────────────────────────────────────────────────────
  const filteredNotices = useMemo(() => {
    const statusKey = statusFilters.notices;
    const query = (moduleSearch.notices || "").trim().toLowerCase();
    return notices.filter((n) => {
      const matchStatus = statusKey === "ALL" || n.status === statusKey;
      const searchBlob  = `${n.title} ${n.description} ${n.category}`.toLowerCase();
      return matchStatus && (!query || searchBlob.includes(query));
    });
  }, [notices, statusFilters.notices, moduleSearch.notices]);

  const filteredPublications = useMemo(() => {
    const statusKey = statusFilters.publications;
    const query = (moduleSearch.publications || "").trim().toLowerCase();
    return publications.filter((p) => {
      const matchStatus = statusKey === "ALL" || p.status === statusKey;
      const searchBlob  = `${p.title} ${p.description || ""} ${p.edition || ""} ${p.year || ""}`.toLowerCase();
      return matchStatus && (!query || searchBlob.includes(query));
    });
  }, [publications, statusFilters.publications, moduleSearch.publications]);

  const filteredAlbums = useMemo(() => {
    const statusKey = statusFilters.gallery;
    const query = (moduleSearch.gallery || "").trim().toLowerCase();
    return albums.filter((a) => {
      const matchStatus = statusKey === "ALL" || a.status === statusKey;
      const searchBlob  = `${a.title} ${a.description || ""}`.toLowerCase();
      return matchStatus && (!query || searchBlob.includes(query));
    });
  }, [albums, statusFilters.gallery, moduleSearch.gallery]);

  const filteredVideos = useMemo(() => {
    const statusKey = statusFilters.videos;
    const query = (moduleSearch.videos || "").trim().toLowerCase();
    return videos.filter((v) => {
      const matchStatus = statusKey === "ALL" || v.status === statusKey;
      const searchBlob  = `${v.title} ${v.description || ""} ${v.eventName || ""}`.toLowerCase();
      return matchStatus && (!query || searchBlob.includes(query));
    });
  }, [videos, statusFilters.videos, moduleSearch.videos]);

  const filteredManagement = useMemo(() => {
    const statusKey = statusFilters.management;
    const query = (moduleSearch.management || "").trim().toLowerCase();
    return management.filter((m) => {
      const matchStatus = statusKey === "ALL" || m.status === statusKey;
      const searchBlob  = `${m.name} ${m.roleTitle} ${m.phone || ""} ${m.email || ""}`.toLowerCase();
      return matchStatus && (!query || searchBlob.includes(query));
    });
  }, [management, statusFilters.management, moduleSearch.management]);

  const filteredGotras = useMemo(() => {
    const query = (moduleSearch.gotra || "").trim().toLowerCase();
    return gotras.filter((g) => {
      const searchBlob = `${g.name} ${g.region || ""} ${g.description || ""}`.toLowerCase();
      return !query || searchBlob.includes(query);
    });
  }, [gotras, moduleSearch.gotra]);

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow-badge mb-2">
                <FaEdit size={12} />
                <span>Content Engine</span>
              </div>
              <h1 className="heading-hero text-[var(--text-primary)]">
                Platform <span className="text-gradient">Media & CMS</span>
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
                Publish notices, digital patrika publications, photo gallery albums, management roster, and CMS content with direct file uploads.
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

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════════════
                NOTICES
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "notices" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createNotice} className="grid h-fit gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Create Notice / Circular</h2>
                  <Field label="Title *"><input className={inputClass} value={noticeForm.title} onChange={(e) => setNoticeForm((cur) => ({ ...cur, title: e.target.value }))} placeholder="Notice title..." required /></Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Category">
                      <select className={inputClass} value={noticeForm.category} onChange={(e) => setNoticeForm((cur) => ({ ...cur, category: e.target.value }))}>
                        <option value="GENERAL">General</option>
                        <option value="EVENT">Event</option>
                        <option value="ELECTION">Election</option>
                        <option value="FINANCIAL">Financial</option>
                      </select>
                    </Field>
                    <Field label="Expires At"><input type="date" className={inputClass} value={noticeForm.expiresAt} onChange={(e) => setNoticeForm((cur) => ({ ...cur, expiresAt: e.target.value }))} /></Field>
                  </div>
                  <Field label="Description *"><textarea className={textareaClass} value={noticeForm.description} onChange={(e) => setNoticeForm((cur) => ({ ...cur, description: e.target.value }))} placeholder="Detailed text..." required /></Field>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                    <FileUploadWithPreview
                      label="Attachment (PDF / Image)"
                      required={false}
                      accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
                      maxSizeMB={15}
                      helperText="Circular PDF or flyer image"
                      file={noticeAttachmentFile}
                      onFileSelect={(file) => setNoticeAttachmentFile(file)}
                    />
                  </div>

                  <Field label="Initial Status">
                    <select className={inputClass} value={noticeForm.status} onChange={(e) => setNoticeForm((cur) => ({ ...cur, status: e.target.value }))}>
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "notice"}>Save Notice</Button>
                </form>

                <section className="grid content-start gap-3">
                  <SummaryCards data={notices} config={MODULE_STATUS_CONFIG.notices} />
                  <div className="flex flex-col gap-2">
                    <StatusTabBar
                      data={notices}
                      config={MODULE_STATUS_CONFIG.notices}
                      activeKey={statusFilters.notices}
                      onChange={(k) => setFilter("notices", k)}
                    />
                    <SearchBar
                      value={moduleSearch.notices}
                      onChange={(v) => setSearch("notices", v)}
                      placeholder="Search title, category, description..."
                    />
                  </div>

                  {filteredNotices.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.notices} moduleLabel="notices" />
                  ) : (
                    <div className="grid gap-3">
                      {filteredNotices.map((notice) => {
                        const isDone = DONE_STATUSES.has(notice.status);
                        return (
                          <article key={notice._id} className={`rounded-2xl border p-5 transition ${isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"}`}>
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className={`font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>{notice.title}</h3>
                                  <StatusBadge value={notice.status} />
                                </div>
                                <p className="text-xs text-gray-500">{notice.category} · {formatDate(notice.publishedAt || notice.createdAt)}</p>
                              </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">{notice.description}</p>
                            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                              {notice.status !== "PUBLISHED" && (
                                <Button tone="success" onClick={() => publishNotice(notice._id)} disabled={busyId === notice._id}>Publish</Button>
                              )}
                              {notice.status !== "ARCHIVED" && (
                                <Button icon={FaArchive} tone="danger" onClick={() => archiveNotice(notice._id)} disabled={busyId === notice._id}>Archive</Button>
                              )}
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
                PUBLICATIONS / PATRIKA
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "publications" && (
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <form onSubmit={createPublication} className="grid h-fit gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Publish Patrika / Magazine</h2>
                  <Field label="Title *"><input className={inputClass} value={publicationForm.title} onChange={(e) => setPublicationForm((cur) => ({ ...cur, title: e.target.value }))} placeholder="e.g. Samaj Sandesh - Diwali Special" required /></Field>
                  <Field label="Description"><textarea className={textareaClass} value={publicationForm.description} onChange={(e) => setPublicationForm((cur) => ({ ...cur, description: e.target.value }))} /></Field>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Month (1-12)"><input type="number" min="1" max="12" className={inputClass} value={publicationForm.month} onChange={(e) => setPublicationForm((cur) => ({ ...cur, month: e.target.value }))} /></Field>
                    <Field label="Year"><input type="number" className={inputClass} value={publicationForm.year} onChange={(e) => setPublicationForm((cur) => ({ ...cur, year: e.target.value }))} /></Field>
                    <Field label="Edition / Volume"><input className={inputClass} value={publicationForm.edition} onChange={(e) => setPublicationForm((cur) => ({ ...cur, edition: e.target.value }))} /></Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                      <FileUploadWithPreview label="Publication PDF File" required={false} accept="application/pdf" maxSizeMB={25} helperText="Full edition PDF file" file={publicationFile} onFileSelect={(f) => setPublicationFile(f)} />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                      <FileUploadWithPreview label="Cover Page Image" required={false} accept="image/jpeg,image/jpg,image/png,image/webp" maxSizeMB={10} helperText="Front cover thumbnail" file={publicationCoverFile} onFileSelect={(f) => setPublicationCoverFile(f)} />
                    </div>
                  </div>

                  <Field label="Status">
                    <select className={inputClass} value={publicationForm.status} onChange={(e) => setPublicationForm((cur) => ({ ...cur, status: e.target.value }))}>
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "publication"}>Save Publication</Button>
                </form>

                <section className="grid content-start gap-3">
                  <SummaryCards data={publications} config={MODULE_STATUS_CONFIG.publications} />
                  <div className="flex flex-col gap-2">
                    <StatusTabBar
                      data={publications}
                      config={MODULE_STATUS_CONFIG.publications}
                      activeKey={statusFilters.publications}
                      onChange={(k) => setFilter("publications", k)}
                    />
                    <SearchBar
                      value={moduleSearch.publications}
                      onChange={(v) => setSearch("publications", v)}
                      placeholder="Search title, edition, year..."
                    />
                  </div>

                  {filteredPublications.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.publications} moduleLabel="publications" />
                  ) : (
                    <div className="grid gap-3">
                      {filteredPublications.map((publication) => {
                        const isDone = DONE_STATUSES.has(publication.status);
                        return (
                          <article key={publication._id} className={`rounded-2xl border p-5 transition ${isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"}`}>
                            <div className="flex items-start gap-3">
                              {publication.coverImage?.url ? (
                                <img src={publication.coverImage.url} alt={publication.title} className="h-20 w-16 shrink-0 rounded-lg object-cover" />
                              ) : null}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                                  <h3 className={`font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>{publication.title}</h3>
                                  <StatusBadge value={publication.status} />
                                </div>
                                <p className="text-xs text-gray-500">{publication.edition || "General"} · v{publication.version || 1} · {publication.downloadCount || 0} downloads</p>
                                {publication.file?.url && (
                                  <a
                                    href={contentEndpoints.PUBLICATION_VIEW_FILE_API(publication._id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:underline mt-2 font-semibold"
                                  >
                                    <FaBookOpen size={12} />
                                    <span>View Uploaded PDF</span>
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                              {!["PUBLISHED", "UPDATED"].includes(publication.status) && (
                                <Button tone="success" onClick={() => updatePublicationStatus(publication._id, "publish")} disabled={busyId === publication._id}>Publish</Button>
                              )}
                              {publication.status !== "ARCHIVED" && (
                                <Button icon={FaArchive} tone="danger" onClick={() => updatePublicationStatus(publication._id, "archive")} disabled={busyId === publication._id}>Archive</Button>
                              )}
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
                PHOTO GALLERY
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "gallery" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createAlbum} className="grid h-fit gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Create Gallery Album</h2>
                  <Field label="Title *"><input className={inputClass} value={albumForm.title} onChange={(e) => setAlbumForm((cur) => ({ ...cur, title: e.target.value }))} placeholder="e.g. Annual Samaj Sammelan 2026" required /></Field>
                  <Field label="Description"><textarea className={textareaClass} value={albumForm.description} onChange={(e) => setAlbumForm((cur) => ({ ...cur, description: e.target.value }))} /></Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Event Date"><input type="date" className={inputClass} value={albumForm.eventDate} onChange={(e) => setAlbumForm((cur) => ({ ...cur, eventDate: e.target.value }))} /></Field>
                    <Field label="Display Order"><input type="number" className={inputClass} value={albumForm.displayOrder} onChange={(e) => setAlbumForm((cur) => ({ ...cur, displayOrder: e.target.value }))} /></Field>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                    <FileUploadWithPreview label="Album Cover Photo" required={false} accept="image/jpeg,image/jpg,image/png,image/webp" maxSizeMB={10} helperText="Featured image for the album" file={albumCoverFile} onFileSelect={(f) => setAlbumCoverFile(f)} />
                  </div>

                  <Field label="Status">
                    <select className={inputClass} value={albumForm.status} onChange={(e) => setAlbumForm((cur) => ({ ...cur, status: e.target.value }))}>
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "album"}>Save Album</Button>
                </form>

                <section className="grid content-start gap-4">
                  <SummaryCards data={albums} config={MODULE_STATUS_CONFIG.gallery} />
                  <div className="flex flex-col gap-2">
                    <StatusTabBar
                      data={albums}
                      config={MODULE_STATUS_CONFIG.gallery}
                      activeKey={statusFilters.gallery}
                      onChange={(k) => setFilter("gallery", k)}
                    />
                    <SearchBar
                      value={moduleSearch.gallery}
                      onChange={(v) => setSearch("gallery", v)}
                      placeholder="Search album title, description..."
                    />
                  </div>

                  {filteredAlbums.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.gallery} moduleLabel="gallery albums" />
                  ) : (
                    <div className="grid gap-3">
                      {filteredAlbums.map((album) => {
                        const isDone = DONE_STATUSES.has(album.status);
                        return (
                          <article key={album._id} className={`rounded-2xl border p-5 transition ${isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"}`}>
                            <div className="flex gap-3">
                              {album.coverImage?.url ? (
                                <img src={album.coverImage.url} alt={album.title} className="h-16 w-20 rounded-lg object-cover shrink-0" />
                              ) : null}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                                  <h3 className={`font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>{album.title}</h3>
                                  <StatusBadge value={album.status} />
                                </div>
                                <p className="text-xs text-gray-500">{album.photoCount || 0} photos · {formatDate(album.eventDate)}</p>
                                {album.status !== "ARCHIVED" && (
                                  <Button icon={FaArchive} tone="danger" className="mt-3" onClick={() => archiveAlbum(album._id)} disabled={busyId === album._id}>Archive</Button>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Photos to Existing Album form */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <FaUpload className="text-emerald-300" size={13} />
                      <h2 className="text-sm font-bold text-[var(--text-primary)]">Add Photos to Album</h2>
                    </div>
                    <form onSubmit={addPhotosToAlbum} className="grid gap-3">
                      <Field label="Select Album">
                        <select className={inputClass} value={selectedAlbumForPhotos} onChange={(e) => setSelectedAlbumForPhotos(e.target.value)} required>
                          <option value="">Choose album...</option>
                          {albums.filter((a) => a.status !== "ARCHIVED").map((a) => (
                            <option key={a._id} value={a._id}>{a.title} ({a.photoCount || 0}/10 photos)</option>
                          ))}
                        </select>
                      </Field>
                      <Field label={`Select Photos (max 10, ${photoFiles.length} selected)`}>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          multiple
                          ref={(el) => setPhotoFilesInput(el)}
                          onChange={(e) => {
                            const selected = Array.from(e.target.files || []);
                            if (selected.length > 10) { toast.error("Maximum 10 photos per upload batch"); e.target.value = ""; return; }
                            setPhotoFiles(selected);
                          }}
                          className="ka-input file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent-primary)] file:px-3 file:py-1 file:text-xs file:font-bold file:text-[#070707] file:cursor-pointer"
                        />
                      </Field>
                      {photoFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {photoFiles.map((file, idx) => (
                            <img key={idx} src={URL.createObjectURL(file)} alt={file.name} className="h-14 w-16 rounded-lg object-cover border border-white/10" />
                          ))}
                        </div>
                      )}
                      <Button icon={FaUpload} tone="success" disabled={busyId === "add-photos" || photoFiles.length === 0 || !selectedAlbumForPhotos}>
                        {busyId === "add-photos" ? "Uploading..." : `Upload ${photoFiles.length || 0} Photo(s)`}
                      </Button>
                    </form>
                  </div>
                </section>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                YOUTUBE VIDEOS
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "videos" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const match = videoForm.youtubeUrl.trim().match(/(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                    if (!match) { toast.error("Please provide a valid YouTube URL"); return; }
                    setBusyId("video");
                    try {
                      const payload = {
                        title: videoForm.title.trim(),
                        youtubeUrl: videoForm.youtubeUrl.trim(),
                        description: videoForm.description ? videoForm.description.trim() : "",
                        eventName: videoForm.eventName ? videoForm.eventName.trim() : "",
                        eventDate: videoForm.eventDate || undefined,
                        displayOrder: Number(videoForm.displayOrder || 0),
                        status: videoForm.status,
                      };
                      if (editingVideoId) {
                        await apiConnector("PATCH", contentEndpoints.VIDEO_API(editingVideoId), payload, authConfig);
                        toast.success("YouTube video updated");
                      } else {
                        await apiConnector("POST", contentEndpoints.VIDEOS_API, payload, authConfig);
                        toast.success("YouTube video added");
                      }
                      setVideoForm(initialVideo);
                      setEditingVideoId(null);
                      await loadVideos();
                    } catch (error) {
                      toast.error(error.response?.data?.message || "Unable to save video");
                    } finally {
                      setBusyId(null);
                    }
                  }}
                  className="grid h-fit gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[var(--text-primary)]">
                      {editingVideoId ? "Edit YouTube Video" : "Add YouTube Video"}
                    </h2>
                    {editingVideoId && (
                      <button type="button" onClick={() => { setEditingVideoId(null); setVideoForm(initialVideo); }} className="text-xs text-amber-400 underline cursor-pointer">
                        Cancel Edit
                      </button>
                    )}
                  </div>
                  <Field label="Video Title *"><input className={inputClass} value={videoForm.title} onChange={(e) => setVideoForm((cur) => ({ ...cur, title: e.target.value }))} placeholder="Title..." required /></Field>
                  <Field label="YouTube URL *"><input className={inputClass} value={videoForm.youtubeUrl} onChange={(e) => setVideoForm((cur) => ({ ...cur, youtubeUrl: e.target.value }))} placeholder="https://www.youtube.com/watch?v=..." required /></Field>
                  <Field label="Short Description"><textarea className={textareaClass} value={videoForm.description} onChange={(e) => setVideoForm((cur) => ({ ...cur, description: e.target.value }))} placeholder="Brief summary..." /></Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Event Name"><input className={inputClass} value={videoForm.eventName} onChange={(e) => setVideoForm((cur) => ({ ...cur, eventName: e.target.value }))} placeholder="e.g. Sammelan" /></Field>
                    <Field label="Event Date"><input type="date" className={inputClass} value={videoForm.eventDate} onChange={(e) => setVideoForm((cur) => ({ ...cur, eventDate: e.target.value }))} /></Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Display Order"><input type="number" className={inputClass} value={videoForm.displayOrder} onChange={(e) => setVideoForm((cur) => ({ ...cur, displayOrder: e.target.value }))} /></Field>
                    <Field label="Status *">
                      <select className={inputClass} value={videoForm.status} onChange={(e) => setVideoForm((cur) => ({ ...cur, status: e.target.value }))}>
                        <option value="PUBLISHED">Published (Visible on Home)</option>
                        <option value="DRAFT">Draft (Hidden)</option>
                      </select>
                    </Field>
                  </div>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "video"}>
                    {editingVideoId ? "Update Video" : "Save Video"}
                  </Button>
                </form>

                <section className="grid content-start gap-3">
                  <SummaryCards data={videos} config={MODULE_STATUS_CONFIG.videos} />
                  <div className="flex flex-col gap-2">
                    <StatusTabBar
                      data={videos}
                      config={MODULE_STATUS_CONFIG.videos}
                      activeKey={statusFilters.videos}
                      onChange={(k) => setFilter("videos", k)}
                    />
                    <SearchBar
                      value={moduleSearch.videos}
                      onChange={(v) => setSearch("videos", v)}
                      placeholder="Search video title, event, description..."
                    />
                  </div>

                  {filteredVideos.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.videos} moduleLabel="videos" />
                  ) : (
                    <div className="grid gap-3">
                      {filteredVideos.map((video) => (
                        <article key={video._id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-3">
                          <div className="flex gap-3 items-start">
                            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black cursor-pointer group" onClick={() => setPreviewVideo(video)}>
                              <img src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`} alt={video.title} className="h-full w-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <FaPlay size={14} className="text-red-500" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                <h3 className="font-bold text-sm text-[var(--text-primary)] leading-snug line-clamp-2">{video.title}</h3>
                                <StatusBadge value={video.status} />
                              </div>
                              {video.eventName && <p className="mt-1 text-xs text-amber-300 font-medium">{video.eventName}</p>}
                              {video.description && <p className="mt-1 text-xs text-gray-400 line-clamp-2">{video.description}</p>}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                            <button type="button" onClick={() => setPreviewVideo(video)} className="btn-secondary !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5 cursor-pointer">
                              <FiEye size={12} /><span>Preview</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingVideoId(video._id);
                                setVideoForm({
                                  title: video.title || "",
                                  youtubeUrl: video.youtubeUrl || "",
                                  description: video.description || "",
                                  eventName: video.eventName || "",
                                  eventDate: video.eventDate ? new Date(video.eventDate).toISOString().split("T")[0] : "",
                                  displayOrder: video.displayOrder ?? 0,
                                  status: video.status || "DRAFT",
                                });
                              }}
                              className="btn-secondary !py-1.5 !px-3 !text-xs text-sky-300 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                setBusyId(video._id);
                                try {
                                  const isPub = video.status === "PUBLISHED";
                                  await apiConnector("PATCH", isPub ? contentEndpoints.UNPUBLISH_VIDEO_API(video._id) : contentEndpoints.PUBLISH_VIDEO_API(video._id), null, authConfig);
                                  toast.success(isPub ? "Unpublished" : "Published");
                                  await loadVideos();
                                } catch (err) { toast.error("Status update failed"); }
                                finally { setBusyId(null); }
                              }}
                              disabled={busyId === video._id}
                              className={`!py-1.5 !px-3 !text-xs rounded-full font-bold uppercase transition cursor-pointer ${
                                video.status === "PUBLISHED" ? "border border-amber-400/30 bg-amber-400/10 text-amber-300" : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                              }`}
                            >
                              {video.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!window.confirm(`Delete "${video.title}"?`)) return;
                                setBusyId(video._id);
                                try {
                                  await apiConnector("DELETE", contentEndpoints.DELETE_VIDEO_API(video._id), null, authConfig);
                                  toast.success("Deleted");
                                  await loadVideos();
                                } catch { toast.error("Delete failed"); }
                                finally { setBusyId(null); }
                              }}
                              disabled={busyId === video._id}
                              className="inline-flex items-center gap-1 text-red-300 ml-auto text-xs font-bold hover:underline cursor-pointer"
                            >
                              <FiTrash2 size={12} /><span>Delete</span>
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MANAGEMENT COMMITTEE
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "management" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createManagement} className="grid h-fit gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Add Management Member</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Full Name *"><input className={inputClass} value={managementForm.name} onChange={(e) => setManagementForm((cur) => ({ ...cur, name: e.target.value }))} required /></Field>
                    <Field label="Role Title *"><input className={inputClass} value={managementForm.roleTitle} onChange={(e) => setManagementForm((cur) => ({ ...cur, roleTitle: e.target.value }))} placeholder="President, Secretary, Trustee..." required /></Field>
                  </div>
                  <Field label="Biography"><textarea className={textareaClass} value={managementForm.bio} onChange={(e) => setManagementForm((cur) => ({ ...cur, bio: e.target.value }))} /></Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Phone"><input className={inputClass} value={managementForm.phone} onChange={(e) => setManagementForm((cur) => ({ ...cur, phone: e.target.value }))} /></Field>
                    <Field label="Email"><input className={inputClass} value={managementForm.email} onChange={(e) => setManagementForm((cur) => ({ ...cur, email: e.target.value }))} /></Field>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                    <FileUploadWithPreview label="Member Photo" required={false} accept="image/jpeg,image/jpg,image/png,image/webp" maxSizeMB={10} helperText="Portrait photo" file={managementImageFile} onFileSelect={(f) => setManagementImageFile(f)} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Display Order"><input type="number" className={inputClass} value={managementForm.displayOrder} onChange={(e) => setManagementForm((cur) => ({ ...cur, displayOrder: e.target.value }))} /></Field>
                    <Field label="Status">
                      <select className={inputClass} value={managementForm.status} onChange={(e) => setManagementForm((cur) => ({ ...cur, status: e.target.value }))}>
                        <option value="ACTIVE">Active</option>
                        <option value="PAST">Past</option>
                      </select>
                    </Field>
                  </div>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "management"}>Save Member</Button>
                </form>

                <section className="grid content-start gap-3">
                  <SummaryCards data={management} config={MODULE_STATUS_CONFIG.management} />
                  <div className="flex flex-col gap-2">
                    <StatusTabBar
                      data={management}
                      config={MODULE_STATUS_CONFIG.management}
                      activeKey={statusFilters.management}
                      onChange={(k) => setFilter("management", k)}
                    />
                    <SearchBar
                      value={moduleSearch.management}
                      onChange={(v) => setSearch("management", v)}
                      placeholder="Search member name, role, phone, email..."
                    />
                  </div>

                  {filteredManagement.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.management} moduleLabel="management members" />
                  ) : (
                    <div className="grid gap-3">
                      {filteredManagement.map((member) => (
                        <article key={member._id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-start gap-3">
                          {member.image?.url ? (
                            <img src={member.image.url} alt={member.name} className="h-14 w-14 rounded-full object-cover shrink-0 border border-white/10" />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="font-bold text-sm text-[var(--text-primary)]">{member.name}</h3>
                                <p className="text-xs text-emerald-400 font-medium">{member.roleTitle}</p>
                              </div>
                              <StatusBadge value={member.status} />
                            </div>
                            {(member.phone || member.email) && (
                              <p className="mt-1 text-xs text-gray-400">{[member.phone, member.email].filter(Boolean).join(" · ")}</p>
                            )}
                            {member.status !== "ARCHIVED" && (
                              <Button icon={FaArchive} tone="danger" className="mt-3" onClick={() => archiveManagement(member._id)} disabled={busyId === member._id}>Archive</Button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                GOTRA MASTER
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "gotra" && (
              <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={createGotra} className="grid h-fit gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Add Gotra Record</h2>
                  <Field label="Gotra Name *"><input className={inputClass} value={gotraForm.name} onChange={(e) => setGotraForm((cur) => ({ ...cur, name: e.target.value }))} placeholder="Gotra name..." required /></Field>
                  <Field label="Region / Lineage"><input className={inputClass} value={gotraForm.region} onChange={(e) => setGotraForm((cur) => ({ ...cur, region: e.target.value }))} placeholder="Region or sub-caste lineage..." /></Field>
                  <Field label="Description / History"><textarea className={textareaClass} value={gotraForm.description} onChange={(e) => setGotraForm((cur) => ({ ...cur, description: e.target.value }))} placeholder="Historical notes..." /></Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "gotra"}>Save Gotra</Button>
                </form>

                <section className="grid content-start gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Registered Gotras</p>
                      <p className="mt-0.5 text-2xl font-black text-[var(--accent-primary)]">{gotras.length}</p>
                    </div>
                    <div className="w-full sm:w-64">
                      <SearchBar
                        value={moduleSearch.gotra}
                        onChange={(v) => setSearch("gotra", v)}
                        placeholder="Search gotra name, region..."
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredGotras.map((gotra) => (
                      <article key={gotra._id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-sm text-[var(--text-primary)]">{gotra.name}</h3>
                            <p className="text-xs text-gray-500">{gotra.region || "All regions"}</p>
                          </div>
                          <Button icon={FaArchive} tone="danger" onClick={() => archiveGotra(gotra._id)} disabled={busyId === gotra._id}>Archive</Button>
                        </div>
                      </article>
                    ))}
                    {filteredGotras.length === 0 && <ModuleEmptyState statusKey="ALL" moduleLabel="gotra records" />}
                  </div>
                </section>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                CMS PAGES
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "cms" && (
              <form onSubmit={saveCms} className="grid max-w-3xl gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Edit CMS Static Content</h2>
                  <select
                    className="h-10 rounded-xl border border-white/10 bg-black px-3 text-xs text-white outline-none w-full sm:w-auto"
                    value={cmsPage.key}
                    onChange={(e) => loadCms(e.target.value)}
                  >
                    <option value="about">About Samaj</option>
                    <option value="history">History & Heritage</option>
                    <option value="mission">Mission & Vision</option>
                  </select>
                </div>
                <Field label="Page Title *"><input className={inputClass} value={cmsPage.title || ""} onChange={(e) => setCmsPage((cur) => ({ ...cur, title: e.target.value }))} required /></Field>
                <Field label="Summary"><textarea className={textareaClass} value={cmsPage.summary || ""} onChange={(e) => setCmsPage((cur) => ({ ...cur, summary: e.target.value }))} /></Field>
                <Field label="Body Content (Markdown / HTML) *">
                  <textarea className="min-h-48 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 font-mono text-sm text-white outline-none focus:border-emerald-400/50" value={cmsPage.body || ""} onChange={(e) => setCmsPage((cur) => ({ ...cur, body: e.target.value }))} required />
                </Field>
                <Button icon={FaPaperPlane} tone="success" disabled={busyId === "cms"}>Save CMS Changes</Button>
              </form>
            )}
          </>
        )}

        {/* ── Video Preview Modal ────────────────────────────────────────── */}
        {previewVideo && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-gray-950 p-4 sm:p-5 shadow-2xl max-h-[92dvh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white truncate pr-4">{previewVideo.title}</h3>
                <button onClick={() => setPreviewVideo(null)} className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer">
                  <FiX size={16} />
                </button>
              </div>
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${previewVideo.videoId}?autoplay=1`}
                  title={previewVideo.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">{previewVideo.eventName}</span>
                <a href={previewVideo.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 font-bold hover:underline inline-flex items-center gap-1">
                  <FaYoutube size={14} /> Watch on YouTube
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentAdmin;
