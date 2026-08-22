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
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { contentEndpoints } from "../../../../services/apis";

const tabs = [
  { key: "notices", label: "Notices", icon: FaBullhorn },
  { key: "publications", label: "Publications", icon: FaBookOpen },
  { key: "gallery", label: "Gallery", icon: FaImage },
  { key: "management", label: "Management", icon: FaUsersCog },
  { key: "gotra", label: "Gotra", icon: FaLeaf },
  { key: "cms", label: "CMS", icon: FaEdit },
];

const inputClass =
  "h-11 border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/40";
const textareaClass =
  "min-h-24 resize-none border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/40";

const Button = ({ children, icon: Icon, tone = "neutral", className = "", ...props }) => {
  const tones = {
    neutral: "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20",
    warning: "border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20",
    danger: "border-red-400/30 bg-red-400/10 text-red-200 hover:bg-red-400/20",
  };

  return (
    <button
      {...props}
      className={`inline-flex h-11 items-center justify-center gap-2 border px-4 text-[11px] font-bold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
};

const Field = ({ label, children }) => (
  <label className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
    {children}
  </label>
);

const Status = ({ value }) => (
  <span className="inline-flex w-fit border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-300">
    {value || "UNKNOWN"}
  </span>
);

const Empty = ({ text }) => (
  <div className="border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-gray-500">{text}</div>
);

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const asset = (url, name) => (url?.trim() ? { url: url.trim(), name } : undefined);

const initialNotice = { title: "", description: "", category: "GENERAL", expiresAt: "", status: "DRAFT", attachmentUrl: "" };
const initialPublication = {
  title: "",
  description: "",
  month: "",
  year: new Date().getFullYear(),
  edition: "",
  fileUrl: "",
  coverImageUrl: "",
  status: "DRAFT",
};
const initialAlbum = { title: "", description: "", eventDate: "", coverImageUrl: "", displayOrder: 0, status: "DRAFT" };
const initialManagement = { name: "", roleTitle: "", bio: "", phone: "", email: "", imageUrl: "", displayOrder: 0, status: "ACTIVE" };
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
  const [noticeForm, setNoticeForm] = useState(initialNotice);
  const [publicationForm, setPublicationForm] = useState(initialPublication);
  const [albumForm, setAlbumForm] = useState(initialAlbum);
  const [managementForm, setManagementForm] = useState(initialManagement);
  const [gotraForm, setGotraForm] = useState(initialGotra);
  const [cmsForm, setCmsForm] = useState(initialCms);

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const loadNotices = async () => {
    const response = await apiConnector("GET", contentEndpoints.ADMIN_NOTICES_API, null, authConfig, { limit: 30 });
    setNotices(response.data?.data?.notices || []);
  };

  const loadPublications = async () => {
    const response = await apiConnector("GET", contentEndpoints.ADMIN_PUBLICATIONS_API, null, authConfig, { limit: 30 });
    setPublications(response.data?.data?.publications || []);
  };

  const loadAlbums = async () => {
    const response = await apiConnector("GET", contentEndpoints.GALLERY_ALBUMS_API, null, authConfig, { admin: "true", limit: 30 });
    setAlbums(response.data?.data?.albums || []);
  };

  const loadManagement = async () => {
    const response = await apiConnector("GET", contentEndpoints.MANAGEMENT_API, null, authConfig, { includePast: "true", limit: 30 });
    setManagement(response.data?.data?.members || []);
  };

  const loadGotras = async () => {
    const response = await apiConnector("GET", contentEndpoints.GOTRAS_API, null, authConfig, { limit: 50 });
    setGotras(response.data?.data?.gotras || []);
  };

  const loadCms = async () => {
    if (!cmsForm.key.trim()) return;
    try {
      const response = await apiConnector("GET", contentEndpoints.CMS_CONTENT_API(cmsForm.key), null, authConfig);
      const content = response.data?.data?.content;
      if (content) {
        setCmsForm({
          key: content.key || cmsForm.key,
          title: content.title || "",
          summary: content.summary || "",
          body: content.body || "",
          status: content.status || "PUBLISHED",
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) toast.error(error.response?.data?.message || "Unable to load CMS content");
    }
  };

  const loaders = useMemo(
    () => ({
      notices: loadNotices,
      publications: loadPublications,
      gallery: loadAlbums,
      management: loadManagement,
      gotra: loadGotras,
      cms: loadCms,
    }),
    [authConfig, cmsForm.key]
  );

  const refreshActive = async () => {
    setLoading(true);
    try {
      await loaders[activeTab]();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load content admin data");
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
    const attachments = asset(noticeForm.attachmentUrl, `${noticeForm.title} attachment`);
    try {
      await apiConnector(
        "POST",
        contentEndpoints.NOTICES_API,
        { ...noticeForm, expiresAt: noticeForm.expiresAt || undefined, attachments: attachments ? [attachments] : [] },
        authConfig
      );
      toast.success("Notice saved");
      setNoticeForm(initialNotice);
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
      await apiConnector(
        "POST",
        contentEndpoints.PUBLICATIONS_API,
        {
          ...publicationForm,
          month: publicationForm.month ? Number(publicationForm.month) : undefined,
          year: publicationForm.year ? Number(publicationForm.year) : undefined,
          file: asset(publicationForm.fileUrl, `${publicationForm.title} file`),
          coverImage: asset(publicationForm.coverImageUrl, `${publicationForm.title} cover`),
        },
        authConfig
      );
      toast.success("Publication saved");
      setPublicationForm(initialPublication);
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
      await apiConnector(
        "POST",
        contentEndpoints.GALLERY_ALBUMS_API,
        {
          ...albumForm,
          displayOrder: Number(albumForm.displayOrder || 0),
          coverImage: asset(albumForm.coverImageUrl, `${albumForm.title} cover`),
        },
        authConfig
      );
      toast.success("Gallery album saved");
      setAlbumForm(initialAlbum);
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

  const createManagement = async (event) => {
    event.preventDefault();
    setBusyId("management");
    try {
      await apiConnector(
        "POST",
        contentEndpoints.MANAGEMENT_API,
        {
          ...managementForm,
          displayOrder: Number(managementForm.displayOrder || 0),
          image: asset(managementForm.imageUrl, `${managementForm.name} photo`),
        },
        authConfig
      );
      toast.success("Management member saved");
      setManagementForm(initialManagement);
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
      await apiConnector("PUT", contentEndpoints.CMS_CONTENT_API(cmsForm.key), cmsForm, authConfig);
      toast.success("CMS content saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save CMS content");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black px-3 py-8 text-white md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">Content</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Content Admin</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Publish notices, patrika editions, gallery albums, committee profiles, gotra records, and CMS pages.
              </p>
            </div>
            <Button icon={FaSyncAlt} onClick={refreshActive} disabled={loading}>
              Refresh
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex h-11 items-center justify-center gap-2 border px-3 text-[11px] font-bold uppercase tracking-widest transition ${
                    selected
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                      : "border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon size={12} />
                  {tab.label}
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
            {activeTab === "notices" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createNotice} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Create Notice</h2>
                  <Field label="Title">
                    <input className={inputClass} value={noticeForm.title} onChange={(event) => setNoticeForm((current) => ({ ...current, title: event.target.value }))} required />
                  </Field>
                  <Field label="Description">
                    <textarea className={textareaClass} value={noticeForm.description} onChange={(event) => setNoticeForm((current) => ({ ...current, description: event.target.value }))} required />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Category">
                      <input className={inputClass} value={noticeForm.category} onChange={(event) => setNoticeForm((current) => ({ ...current, category: event.target.value }))} />
                    </Field>
                    <Field label="Expires At">
                      <input type="date" className={inputClass} value={noticeForm.expiresAt} onChange={(event) => setNoticeForm((current) => ({ ...current, expiresAt: event.target.value }))} />
                    </Field>
                  </div>
                  <Field label="Attachment URL">
                    <input className={inputClass} value={noticeForm.attachmentUrl} onChange={(event) => setNoticeForm((current) => ({ ...current, attachmentUrl: event.target.value }))} />
                  </Field>
                  <Field label="Status">
                    <select className={inputClass} value={noticeForm.status} onChange={(event) => setNoticeForm((current) => ({ ...current, status: event.target.value }))}>
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "notice"}>Save Notice</Button>
                </form>

                <section className="grid gap-3">
                  {notices.map((notice) => (
                    <article key={notice._id} className="border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-bold text-white">{notice.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-500">{notice.description}</p>
                          <p className="mt-2 text-xs text-gray-600">{notice.category} - expires {formatDate(notice.expiresAt)}</p>
                        </div>
                        <Status value={notice.status} />
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <Button tone="success" onClick={() => publishNotice(notice._id)} disabled={busyId === notice._id || notice.status === "PUBLISHED"}>Publish</Button>
                        <Button icon={FaArchive} tone="danger" onClick={() => archiveNotice(notice._id)} disabled={busyId === notice._id || notice.status === "ARCHIVED"}>Archive</Button>
                      </div>
                    </article>
                  ))}
                  {notices.length === 0 && <Empty text="No notices found." />}
                </section>
              </div>
            )}

            {activeTab === "publications" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createPublication} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Create Publication</h2>
                  <Field label="Title">
                    <input className={inputClass} value={publicationForm.title} onChange={(event) => setPublicationForm((current) => ({ ...current, title: event.target.value }))} required />
                  </Field>
                  <Field label="Description">
                    <textarea className={textareaClass} value={publicationForm.description} onChange={(event) => setPublicationForm((current) => ({ ...current, description: event.target.value }))} />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Month">
                      <input type="number" min="1" max="12" className={inputClass} value={publicationForm.month} onChange={(event) => setPublicationForm((current) => ({ ...current, month: event.target.value }))} />
                    </Field>
                    <Field label="Year">
                      <input type="number" className={inputClass} value={publicationForm.year} onChange={(event) => setPublicationForm((current) => ({ ...current, year: event.target.value }))} />
                    </Field>
                    <Field label="Edition">
                      <input className={inputClass} value={publicationForm.edition} onChange={(event) => setPublicationForm((current) => ({ ...current, edition: event.target.value }))} />
                    </Field>
                  </div>
                  <Field label="PDF/File URL">
                    <input className={inputClass} value={publicationForm.fileUrl} onChange={(event) => setPublicationForm((current) => ({ ...current, fileUrl: event.target.value }))} />
                  </Field>
                  <Field label="Cover Image URL">
                    <input className={inputClass} value={publicationForm.coverImageUrl} onChange={(event) => setPublicationForm((current) => ({ ...current, coverImageUrl: event.target.value }))} />
                  </Field>
                  <Field label="Status">
                    <select className={inputClass} value={publicationForm.status} onChange={(event) => setPublicationForm((current) => ({ ...current, status: event.target.value }))}>
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "publication"}>Save Publication</Button>
                </form>

                <section className="grid gap-3">
                  {publications.map((publication) => (
                    <article key={publication._id} className="border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-bold text-white">{publication.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{publication.edition || "Edition not set"} - v{publication.version || 1}</p>
                          <p className="mt-2 text-xs text-gray-600">{publication.month || "--"}/{publication.year || "----"} - {publication.downloadCount || 0} downloads</p>
                        </div>
                        <Status value={publication.status} />
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <Button tone="success" onClick={() => updatePublicationStatus(publication._id, "publish")} disabled={busyId === publication._id || ["PUBLISHED", "UPDATED"].includes(publication.status)}>Publish</Button>
                        <Button icon={FaArchive} tone="danger" onClick={() => updatePublicationStatus(publication._id, "archive")} disabled={busyId === publication._id || publication.status === "ARCHIVED"}>Archive</Button>
                      </div>
                    </article>
                  ))}
                  {publications.length === 0 && <Empty text="No publications found." />}
                </section>
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createAlbum} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Create Gallery Album</h2>
                  <Field label="Title">
                    <input className={inputClass} value={albumForm.title} onChange={(event) => setAlbumForm((current) => ({ ...current, title: event.target.value }))} required />
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
                  <Field label="Cover Image URL">
                    <input className={inputClass} value={albumForm.coverImageUrl} onChange={(event) => setAlbumForm((current) => ({ ...current, coverImageUrl: event.target.value }))} />
                  </Field>
                  <Field label="Status">
                    <select className={inputClass} value={albumForm.status} onChange={(event) => setAlbumForm((current) => ({ ...current, status: event.target.value }))}>
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "album"}>Save Album</Button>
                </form>

                <section className="grid gap-3">
                  {albums.map((album) => (
                    <article key={album._id} className="border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex gap-3">
                        {album.coverImage?.url ? <img src={album.coverImage.url} alt={album.title} className="h-16 w-20 object-cover" /> : null}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h3 className="font-bold text-white">{album.title}</h3>
                              <p className="mt-1 text-sm text-gray-500">{album.photoCount || 0} photos - {formatDate(album.eventDate)}</p>
                            </div>
                            <Status value={album.status} />
                          </div>
                          <Button icon={FaArchive} tone="danger" className="mt-4 w-full sm:w-auto" onClick={() => archiveAlbum(album._id)} disabled={busyId === album._id || album.status === "ARCHIVED"}>Archive</Button>
                        </div>
                      </div>
                    </article>
                  ))}
                  {albums.length === 0 && <Empty text="No gallery albums found." />}
                </section>
              </div>
            )}

            {activeTab === "management" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createManagement} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Add Management Member</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Name">
                      <input className={inputClass} value={managementForm.name} onChange={(event) => setManagementForm((current) => ({ ...current, name: event.target.value }))} required />
                    </Field>
                    <Field label="Role Title">
                      <input className={inputClass} value={managementForm.roleTitle} onChange={(event) => setManagementForm((current) => ({ ...current, roleTitle: event.target.value }))} required />
                    </Field>
                  </div>
                  <Field label="Bio">
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
                  <Field label="Image URL">
                    <input className={inputClass} value={managementForm.imageUrl} onChange={(event) => setManagementForm((current) => ({ ...current, imageUrl: event.target.value }))} />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Display Order">
                      <input type="number" className={inputClass} value={managementForm.displayOrder} onChange={(event) => setManagementForm((current) => ({ ...current, displayOrder: event.target.value }))} />
                    </Field>
                    <Field label="Status">
                      <select className={inputClass} value={managementForm.status} onChange={(event) => setManagementForm((current) => ({ ...current, status: event.target.value }))}>
                        <option value="ACTIVE">Active</option>
                        <option value="PAST">Past</option>
                      </select>
                    </Field>
                  </div>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "management"}>Save Member</Button>
                </form>

                <section className="grid gap-3">
                  {management.map((member) => (
                    <article key={member._id} className="border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex items-start gap-3">
                        {member.image?.url ? <img src={member.image.url} alt={member.name} className="h-14 w-14 rounded-full object-cover" /> : null}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h3 className="font-bold text-white">{member.name}</h3>
                              <p className="mt-1 text-sm text-gray-500">{member.roleTitle}</p>
                            </div>
                            <Status value={member.status} />
                          </div>
                          <Button icon={FaArchive} tone="danger" className="mt-4 w-full sm:w-auto" onClick={() => archiveManagement(member._id)} disabled={busyId === member._id || member.status === "ARCHIVED"}>Archive</Button>
                        </div>
                      </div>
                    </article>
                  ))}
                  {management.length === 0 && <Empty text="No management members found." />}
                </section>
              </div>
            )}

            {activeTab === "gotra" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createGotra} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Add Gotra</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Name">
                      <input className={inputClass} value={gotraForm.name} onChange={(event) => setGotraForm((current) => ({ ...current, name: event.target.value }))} required />
                    </Field>
                    <Field label="Region">
                      <input className={inputClass} value={gotraForm.region} onChange={(event) => setGotraForm((current) => ({ ...current, region: event.target.value }))} />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea className={textareaClass} value={gotraForm.description} onChange={(event) => setGotraForm((current) => ({ ...current, description: event.target.value }))} />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "gotra"}>Save Gotra</Button>
                </form>

                <section className="grid gap-3">
                  {gotras.map((gotra) => (
                    <article key={gotra._id} className="border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-bold text-white">{gotra.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">{gotra.region || "Region not set"}</p>
                          <p className="mt-2 line-clamp-2 text-xs text-gray-600">{gotra.description}</p>
                        </div>
                        <Button icon={FaArchive} tone="danger" onClick={() => archiveGotra(gotra._id)} disabled={busyId === gotra._id}>Archive</Button>
                      </div>
                    </article>
                  ))}
                  {gotras.length === 0 && <Empty text="No gotra records found." />}
                </section>
              </div>
            )}

            {activeTab === "cms" && (
              <form onSubmit={saveCms} className="mx-auto grid max-w-4xl gap-4 border border-white/10 bg-white/[0.02] p-5">
                <h2 className="text-lg font-bold text-white">CMS Page Editor</h2>
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                  <Field label="Key">
                    <input className={inputClass} value={cmsForm.key} onChange={(event) => setCmsForm((current) => ({ ...current, key: event.target.value }))} required />
                  </Field>
                  <Button type="button" icon={FaSyncAlt} onClick={loadCms} className="self-end">Load</Button>
                </div>
                <Field label="Title">
                  <input className={inputClass} value={cmsForm.title} onChange={(event) => setCmsForm((current) => ({ ...current, title: event.target.value }))} required />
                </Field>
                <Field label="Summary">
                  <input className={inputClass} value={cmsForm.summary} onChange={(event) => setCmsForm((current) => ({ ...current, summary: event.target.value }))} />
                </Field>
                <Field label="Body">
                  <textarea className="min-h-64 resize-y border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/40" value={cmsForm.body} onChange={(event) => setCmsForm((current) => ({ ...current, body: event.target.value }))} required />
                </Field>
                <Field label="Status">
                  <select className={inputClass} value={cmsForm.status} onChange={(event) => setCmsForm((current) => ({ ...current, status: event.target.value }))}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </Field>
                <Button icon={FaPaperPlane} tone="success" disabled={busyId === "cms"}>Save CMS Content</Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContentAdmin;
