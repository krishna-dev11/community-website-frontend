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
  FaPlus,
  FaUpload,
} from "react-icons/fa";
import { FiX, FiCheck, FiTrash2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { contentEndpoints } from "../../../../services/apis";
import FileUploadWithPreview from "../../../Common/FileUploadWithPreview";

const tabs = [
  { key: "notices", label: "Notices", icon: FaBullhorn },
  { key: "publications", label: "Publications / Patrika", icon: FaBookOpen },
  { key: "gallery", label: "Photo Gallery", icon: FaImage },
  { key: "management", label: "Management Committee", icon: FaUsersCog },
  { key: "gotra", label: "Gotra Master", icon: FaLeaf },
  { key: "cms", label: "CMS Pages", icon: FaEdit },
];

const inputClass = "ka-input";
const textareaClass = "ka-input !min-h-24 resize-none !py-3";

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
  <label className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
    {children}
  </label>
);


const Status = ({ value }) => {
  const styles = {
    PUBLISHED: "border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]",
    ACTIVE: "border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]",
    DRAFT: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    ARCHIVED: "border-red-400/30 bg-red-400/10 text-red-300",
    UPDATED: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        styles[value] || "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]"
      }`}
    >
      {value || "UNKNOWN"}
    </span>
  );
};

const Empty = ({ text }) => (
  <div className="ka-card border-dashed px-5 py-8 text-center text-sm text-[var(--text-muted)]">
    {text}
  </div>
);

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const initialNotice = { title: "", description: "", category: "GENERAL", expiresAt: "", status: "DRAFT" };
const initialPublication = {
  title: "",
  description: "",
  month: "",
  year: new Date().getFullYear(),
  edition: "",
  status: "DRAFT",
};
const initialAlbum = { title: "", description: "", eventDate: "", displayOrder: 0, status: "DRAFT" };
const initialManagement = {
  name: "",
  roleTitle: "",
  bio: "",
  phone: "",
  email: "",
  displayOrder: 0,
  status: "ACTIVE",
};
const initialGotra = { name: "", region: "", description: "", status: "ACTIVE" };
const initialCms = { key: "about", title: "", summary: "", body: "", status: "PUBLISHED" };

const ContentAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("notices");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [notices, setNotices] = useState([]);
  const [publications, setPublications] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [management, setManagement] = useState([]);
  const [gotras, setGotras] = useState([]);
  const [cmsPage, setCmsPage] = useState(initialCms);

  const [noticeForm, setNoticeForm] = useState(initialNotice);
  const [noticeAttachmentFile, setNoticeAttachmentFile] = useState(null);

  const [publicationForm, setPublicationForm] = useState(initialPublication);
  const [publicationFile, setPublicationFile] = useState(null);
  const [publicationCoverFile, setPublicationCoverFile] = useState(null);

  const [albumForm, setAlbumForm] = useState(initialAlbum);
  const [albumCoverFile, setAlbumCoverFile] = useState(null);

  const [managementForm, setManagementForm] = useState(initialManagement);
  const [managementImageFile, setManagementImageFile] = useState(null);

  const [gotraForm, setGotraForm] = useState(initialGotra);

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const loadNotices = async () => {
    const response = await apiConnector("GET", contentEndpoints.ADMIN_NOTICES_API, null, authConfig, { limit: 20 });
    setNotices(response.data?.data?.notices || []);
  };

  const loadPublications = async () => {
    const response = await apiConnector("GET", contentEndpoints.ADMIN_PUBLICATIONS_API, null, authConfig, { limit: 20 });
    setPublications(response.data?.data?.publications || []);
  };

  const loadAlbums = async () => {
    const response = await apiConnector("GET", contentEndpoints.GALLERY_ALBUMS_API, null, authConfig, {
      admin: "true",
      limit: 20,
    });
    setAlbums(response.data?.data?.albums || []);
  };

  const loadManagement = async () => {
    const response = await apiConnector("GET", contentEndpoints.MANAGEMENT_API, null, authConfig, {
      includePast: "true",
      limit: 50,
    });
    setManagement(response.data?.data?.members || []);
  };

  const loadGotras = async () => {
    const response = await apiConnector("GET", contentEndpoints.GOTRAS_API, null, authConfig, {
      admin: "true",
      limit: 100,
    });
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

  // Create Notice with optional attachment upload
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

  // Create Publication with PDF File & Cover Image Upload
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

      if (publicationFile instanceof File) {
        formData.append("file", publicationFile);
      }
      if (publicationCoverFile instanceof File) {
        formData.append("coverImage", publicationCoverFile);
      }

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
      const endpoint =
        action === "publish"
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

  // Create Gallery Album with actual Cover Image Upload
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

      if (albumCoverFile instanceof File) {
        formData.append("coverImage", albumCoverFile);
      }

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

  // Create Management Member with actual Photo File Upload
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

      if (managementImageFile instanceof File) {
        formData.append("image", managementImageFile);
      }

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

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow-badge mb-2">
                <FaEdit size={12} />
                <span>Content Engine</span>
              </div>
              <h1 className="heading-hero text-[var(--text-primary)]">Platform <span className="text-gradient">Media & CMS</span></h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
                Publish notices, digital patrika publications, photo gallery albums, management roster, and CMS content with direct file uploads.
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

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
          </div>
        ) : (

          <>
            {/* NOTICES */}
            {activeTab === "notices" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createNotice} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <h2 className="text-lg font-bold text-white">Create Notice / Announcement</h2>
                  <Field label="Title *">
                    <input className={inputClass} value={noticeForm.title} onChange={(event) => setNoticeForm((current) => ({ ...current, title: event.target.value }))} required />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Category">
                      <select className={inputClass} value={noticeForm.category} onChange={(event) => setNoticeForm((current) => ({ ...current, category: event.target.value }))}>
                        <option value="GENERAL" className="bg-gray-900">General</option>
                        <option value="EVENT" className="bg-gray-900">Event</option>
                        <option value="ELECTION" className="bg-gray-900">Election</option>
                        <option value="FINANCIAL" className="bg-gray-900">Financial</option>
                      </select>
                    </Field>
                    <Field label="Expires At">
                      <input type="date" className={inputClass} value={noticeForm.expiresAt} onChange={(event) => setNoticeForm((current) => ({ ...current, expiresAt: event.target.value }))} />
                    </Field>
                  </div>
                  <Field label="Description *">
                    <textarea className={textareaClass} value={noticeForm.description} onChange={(event) => setNoticeForm((current) => ({ ...current, description: event.target.value }))} required />
                  </Field>

                  {/* Actual File Upload for Notice Attachment */}
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
                    <select className={inputClass} value={noticeForm.status} onChange={(event) => setNoticeForm((current) => ({ ...current, status: event.target.value }))}>
                      <option value="DRAFT" className="bg-gray-900">Draft</option>
                      <option value="PUBLISHED" className="bg-gray-900">Published</option>
                    </select>
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "notice"}>Save Notice</Button>
                </form>

                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <h2 className="text-lg font-bold text-white">Notice Roster</h2>
                  <div className="mt-4 grid gap-3">
                    {notices.map((notice) => (
                      <article key={notice._id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="font-bold text-white">{notice.title}</h3>
                            <p className="mt-1 text-xs text-gray-500">{notice.category} · {formatDate(notice.publishedAt || notice.createdAt)}</p>
                          </div>
                          <Status value={notice.status} />
                        </div>
                        <p className="mt-2 text-xs text-gray-400">{notice.description}</p>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          <Button tone="success" onClick={() => publishNotice(notice._id)} disabled={busyId === notice._id || notice.status === "PUBLISHED"}>Publish</Button>
                          <Button icon={FaArchive} tone="danger" onClick={() => archiveNotice(notice._id)} disabled={busyId === notice._id || notice.status === "ARCHIVED"}>Archive</Button>
                        </div>
                      </article>
                    ))}
                    {notices.length === 0 && <Empty text="No notices recorded yet." />}
                  </div>
                </section>
              </div>
            )}

            {/* PUBLICATIONS / PATRIKA */}
            {activeTab === "publications" && (
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <form onSubmit={createPublication} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <h2 className="text-lg font-bold text-white">Publish Patrika / Magazine</h2>
                  <Field label="Title *">
                    <input className={inputClass} value={publicationForm.title} onChange={(event) => setPublicationForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Samaj Sandesh - Diwali Special" required />
                  </Field>
                  <Field label="Description">
                    <textarea className={textareaClass} value={publicationForm.description} onChange={(event) => setPublicationForm((current) => ({ ...current, description: event.target.value }))} />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Month (1-12)">
                      <input type="number" min="1" max="12" className={inputClass} value={publicationForm.month} onChange={(event) => setPublicationForm((current) => ({ ...current, month: event.target.value }))} />
                    </Field>
                    <Field label="Year">
                      <input type="number" className={inputClass} value={publicationForm.year} onChange={(event) => setPublicationForm((current) => ({ ...current, year: event.target.value }))} />
                    </Field>
                    <Field label="Edition / Volume">
                      <input className={inputClass} value={publicationForm.edition} onChange={(event) => setPublicationForm((current) => ({ ...current, edition: event.target.value }))} />
                    </Field>
                  </div>

                  {/* Actual File Uploads for Publication */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                      <FileUploadWithPreview
                        label="Publication PDF File"
                        required={false}
                        accept="application/pdf"
                        maxSizeMB={25}
                        helperText="Full edition PDF file"
                        file={publicationFile}
                        onFileSelect={(file) => setPublicationFile(file)}
                      />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                      <FileUploadWithPreview
                        label="Cover Page Image"
                        required={false}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        maxSizeMB={10}
                        helperText="Front cover thumbnail image"
                        file={publicationCoverFile}
                        onFileSelect={(file) => setPublicationCoverFile(file)}
                      />
                    </div>
                  </div>

                  <Field label="Status">
                    <select className={inputClass} value={publicationForm.status} onChange={(event) => setPublicationForm((current) => ({ ...current, status: event.target.value }))}>
                      <option value="DRAFT" className="bg-gray-900">Draft</option>
                      <option value="PUBLISHED" className="bg-gray-900">Published</option>
                    </select>
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "publication"}>Save Publication</Button>
                </form>

                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <h2 className="text-lg font-bold text-white">Publications Archive</h2>
                  <div className="mt-4 grid gap-3">
                    {publications.map((publication) => (
                      <article key={publication._id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-start gap-3">
                          {publication.coverImage?.url ? (
                            <img src={publication.coverImage.url} alt={publication.title} className="h-20 w-16 shrink-0 rounded-lg object-cover" />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                              <h3 className="font-bold text-white">{publication.title}</h3>
                              <Status value={publication.status} />
                            </div>
                            <p className="text-xs text-gray-500">{publication.edition || "General"} · v{publication.version || 1} · {publication.downloadCount || 0} downloads</p>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          <Button tone="success" onClick={() => updatePublicationStatus(publication._id, "publish")} disabled={busyId === publication._id || ["PUBLISHED", "UPDATED"].includes(publication.status)}>Publish</Button>
                          <Button icon={FaArchive} tone="danger" onClick={() => updatePublicationStatus(publication._id, "archive")} disabled={busyId === publication._id || publication.status === "ARCHIVED"}>Archive</Button>
                        </div>
                      </article>
                    ))}
                    {publications.length === 0 && <Empty text="No publications found." />}
                  </div>
                </section>
              </div>
            )}

            {/* GALLERY */}
            {activeTab === "gallery" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createAlbum} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <h2 className="text-lg font-bold text-white">Create Gallery Album</h2>
                  <Field label="Title *">
                    <input className={inputClass} value={albumForm.title} onChange={(event) => setAlbumForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Annual Samaj Sammelan 2026" required />
                  </Field>
                  <Field label="Description">
                    <textarea className={textareaClass} value={albumForm.description} onChange={(event) => setAlbumForm((current) => ({ ...current, description: event.target.value }))} />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Event Date">
                      <input type="date" className={inputClass} value={albumForm.eventDate} onChange={(event) => setAlbumForm((current) => ({ ...current, eventDate: event.target.value }))} />
                    </Field>
                    <Field label="Display Order">
                      <input type="number" className={inputClass} value={albumForm.displayOrder} onChange={(event) => setAlbumForm((current) => ({ ...current, displayOrder: event.target.value }))} />
                    </Field>
                  </div>

                  {/* Actual File Upload for Album Cover */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                    <FileUploadWithPreview
                      label="Album Cover Photo"
                      required={false}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      maxSizeMB={10}
                      helperText="Featured image for the album"
                      file={albumCoverFile}
                      onFileSelect={(file) => setAlbumCoverFile(file)}
                    />
                  </div>

                  <Field label="Status">
                    <select className={inputClass} value={albumForm.status} onChange={(event) => setAlbumForm((current) => ({ ...current, status: event.target.value }))}>
                      <option value="DRAFT" className="bg-gray-900">Draft</option>
                      <option value="PUBLISHED" className="bg-gray-900">Published</option>
                    </select>
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "album"}>Save Album</Button>
                </form>

                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <h2 className="text-lg font-bold text-white">Albums Roster</h2>
                  <div className="mt-4 grid gap-3">
                    {albums.map((album) => (
                      <article key={album._id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex gap-3">
                          {album.coverImage?.url ? (
                            <img src={album.coverImage.url} alt={album.title} className="h-16 w-20 rounded-lg object-cover" />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                              <h3 className="font-bold text-white">{album.title}</h3>
                              <Status value={album.status} />
                            </div>
                            <p className="text-xs text-gray-500">{album.photoCount || 0} photos · {formatDate(album.eventDate)}</p>
                            <Button icon={FaArchive} tone="danger" className="mt-3 w-full sm:w-auto" onClick={() => archiveAlbum(album._id)} disabled={busyId === album._id || album.status === "ARCHIVED"}>Archive</Button>
                          </div>
                        </div>
                      </article>
                    ))}
                    {albums.length === 0 && <Empty text="No gallery albums found." />}
                  </div>
                </section>
              </div>
            )}

            {/* MANAGEMENT COMMITTEE */}
            {activeTab === "management" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createManagement} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <h2 className="text-lg font-bold text-white">Add Management Committee Member</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Full Name *">
                      <input className={inputClass} value={managementForm.name} onChange={(event) => setManagementForm((current) => ({ ...current, name: event.target.value }))} required />
                    </Field>
                    <Field label="Role Title *">
                      <input className={inputClass} value={managementForm.roleTitle} onChange={(event) => setManagementForm((current) => ({ ...current, roleTitle: event.target.value }))} placeholder="President, Secretary, Trustee" required />
                    </Field>
                  </div>
                  <Field label="Biography">
                    <textarea className={textareaClass} value={managementForm.bio} onChange={(event) => setManagementForm((current) => ({ ...current, bio: event.target.value }))} />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Phone">
                      <input className={inputClass} value={managementForm.phone} onChange={(event) => setManagementForm((current) => ({ ...current, phone: event.target.value }))} />
                    </Field>
                    <Field label="Email">
                      <input className={inputClass} value={managementForm.email} onChange={(event) => setManagementForm((current) => ({ ...current, email: event.target.value }))} />
                    </Field>
                  </div>

                  {/* Actual File Upload for Management Photo */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                    <FileUploadWithPreview
                      label="Member Photo"
                      required={false}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      maxSizeMB={10}
                      helperText="Official portrait photo"
                      file={managementImageFile}
                      onFileSelect={(file) => setManagementImageFile(file)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Display Order">
                      <input type="number" className={inputClass} value={managementForm.displayOrder} onChange={(event) => setManagementForm((current) => ({ ...current, displayOrder: event.target.value }))} />
                    </Field>
                    <Field label="Status">
                      <select className={inputClass} value={managementForm.status} onChange={(event) => setManagementForm((current) => ({ ...current, status: event.target.value }))}>
                        <option value="ACTIVE" className="bg-gray-900">Active</option>
                        <option value="PAST" className="bg-gray-900">Past</option>
                      </select>
                    </Field>
                  </div>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "management"}>Save Member</Button>
                </form>

                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <h2 className="text-lg font-bold text-white">Current Committee Roster</h2>
                  <div className="mt-4 grid gap-3">
                    {management.map((member) => (
                      <article key={member._id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-start gap-3">
                          {member.image?.url ? (
                            <img src={member.image.url} alt={member.name} className="h-14 w-14 rounded-full object-cover" />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="font-bold text-white">{member.name}</h3>
                                <p className="text-xs text-emerald-400">{member.roleTitle}</p>
                              </div>
                              <Status value={member.status} />
                            </div>
                            <Button icon={FaArchive} tone="danger" className="mt-3" onClick={() => archiveManagement(member._id)} disabled={busyId === member._id || member.status === "ARCHIVED"}>Archive</Button>
                          </div>
                        </div>
                      </article>
                    ))}
                    {management.length === 0 && <Empty text="No management committee members listed." />}
                  </div>
                </section>
              </div>
            )}

            {/* GOTRA */}
            {activeTab === "gotra" && (
              <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={createGotra} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <h2 className="text-lg font-bold text-white">Add Gotra Record</h2>
                  <Field label="Gotra Name *">
                    <input className={inputClass} value={gotraForm.name} onChange={(event) => setGotraForm((current) => ({ ...current, name: event.target.value }))} required />
                  </Field>
                  <Field label="Region / Lineage">
                    <input className={inputClass} value={gotraForm.region} onChange={(event) => setGotraForm((current) => ({ ...current, region: event.target.value }))} />
                  </Field>
                  <Field label="Description / History">
                    <textarea className={textareaClass} value={gotraForm.description} onChange={(event) => setGotraForm((current) => ({ ...current, description: event.target.value }))} />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "gotra"}>Save Gotra</Button>
                </form>

                <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <h2 className="text-lg font-bold text-white">Gotra Directory</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {gotras.map((gotra) => (
                      <article key={gotra._id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-white">{gotra.name}</h3>
                            <p className="text-xs text-gray-500">{gotra.region || "All regions"}</p>
                          </div>
                          <Button icon={FaArchive} tone="danger" onClick={() => archiveGotra(gotra._id)} disabled={busyId === gotra._id}>Archive</Button>
                        </div>
                      </article>
                    ))}
                    {gotras.length === 0 && <Empty text="No gotra records recorded." />}
                  </div>
                </section>
              </div>
            )}

            {/* CMS PAGES */}
            {activeTab === "cms" && (
              <form onSubmit={saveCms} className="grid max-w-3xl gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Edit CMS Content</h2>
                  <select
                    className="h-10 rounded-lg border border-white/10 bg-black px-3 text-xs text-white outline-none"
                    value={cmsPage.key}
                    onChange={(event) => {
                      const newKey = event.target.value;
                      loadCms(newKey);
                    }}
                  >
                    <option value="about">About Samaj</option>
                    <option value="history">History & Heritage</option>
                    <option value="mission">Mission & Vision</option>
                  </select>
                </div>

                <Field label="Page Title *">
                  <input className={inputClass} value={cmsPage.title || ""} onChange={(event) => setCmsPage((current) => ({ ...current, title: event.target.value }))} required />
                </Field>
                <Field label="Summary">
                  <textarea className={textareaClass} value={cmsPage.summary || ""} onChange={(event) => setCmsPage((current) => ({ ...current, summary: event.target.value }))} />
                </Field>
                <Field label="Body Content (Markdown / HTML) *">
                  <textarea className="min-h-48 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/50" value={cmsPage.body || ""} onChange={(event) => setCmsPage((current) => ({ ...current, body: event.target.value }))} required />
                </Field>
                <Button icon={FaPaperPlane} tone="success" disabled={busyId === "cms"}>Save CMS Changes</Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContentAdmin;
