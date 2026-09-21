import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaYoutube, FaPlay } from "react-icons/fa";
import {
  FiArrowRight,
  FiCalendar,
  FiCamera,
  FiImage,
  FiTag,
  FiX,
  FiExternalLink,
  FiMaximize2,
  FiAlertCircle,
} from "react-icons/fi";
import { apiConnector } from "../../../services/apiConnector";
import { contentEndpoints } from "../../../services/apis";
import { useLanguage } from "../../../i18n/LanguageContext";

const TABS = [
  { id: "all",    labelHi: "सभी",   labelEn: "All",    icon: null },
  { id: "photos", labelHi: "फोटो",  labelEn: "Photos", icon: FiCamera },
  { id: "videos", labelHi: "वीडियो", labelEn: "Videos", icon: FaPlay },
];

const formatDate = (val) => {
  if (!val) return "";
  try {
    return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return ""; }
};

/* ─── Photo Card ─── */
const PhotoCard = ({ album, onOpen }) => (
  <article
    onClick={() => album.coverImage?.url && onOpen(album)}
    className={`group relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-sm hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300 ${album.coverImage?.url ? "cursor-pointer" : ""}`}
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface)]">
      {album.coverImage?.url ? (
        <img
          src={album.coverImage.url}
          alt={album.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
          <FiImage size={28} className="text-cyan-500/50 mb-1.5" />
          <span className="text-[10px] font-semibold text-[var(--text-muted)]">{album.title}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {/* Type badge */}
      <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[10px] font-bold text-cyan-300">
        <FiCamera size={10} /> फोटो
      </span>

      {album.photoCount > 0 && (
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white">
          <FiImage size={10} /> {album.photoCount}
        </span>
      )}

      <div className="absolute bottom-0 inset-x-0 p-3 text-white">
        <h4 className="text-xs font-black line-clamp-1 group-hover:text-cyan-300 transition-colors">{album.title}</h4>
        {album.eventDate && (
          <p className="text-[10px] text-white/60 mt-0.5 flex items-center gap-1">
            <FiCalendar size={9} />
            {new Date(album.eventDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </p>
        )}
      </div>
    </div>
  </article>
);

/* ─── Video Card ─── */
const VideoCard = ({ video, onPlay, isHindi }) => {
  const thumbUrl = video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
  return (
    <article className="group rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-sm hover:shadow-lg hover:border-red-500/25 transition-all duration-300">
      <div
        onClick={() => onPlay(video)}
        className="relative aspect-video overflow-hidden bg-black cursor-pointer"
      >
        <img
          src={thumbUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        {/* Type badge */}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[10px] font-bold text-red-300">
          <FaPlay size={8} /> वीडियो
        </span>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300 shadow-lg">
            <FaPlay size={16} className="ml-1" />
          </div>
        </div>

        {video.eventName && (
          <div className="absolute bottom-0 inset-x-0 p-2.5 text-white">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-black/60 backdrop-blur-md rounded px-1.5 py-0.5">
              <FiTag size={9} className="text-red-400" />
              <span className="truncate max-w-[120px]">{video.eventName}</span>
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h4
          onClick={() => onPlay(video)}
          className="text-xs sm:text-sm font-bold text-[var(--text-primary)] line-clamp-2 leading-snug cursor-pointer hover:text-red-500 transition-colors mb-1.5"
        >
          {video.title}
        </h4>
        {video.eventDate && (
          <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mb-2">
            <FiCalendar size={9} />
            {formatDate(video.eventDate)}
          </p>
        )}
        <a
          href={video.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-red-500/30 bg-red-500/8 text-[10px] font-bold text-red-500 hover:bg-red-500/15 transition-colors"
        >
          <FaYoutube size={11} />
          <span>{isHindi ? "YouTube पर देखें" : "Watch on YouTube"}</span>
          <FiExternalLink size={9} />
        </a>
      </div>
    </article>
  );
};

/* ─── Skeleton Card ─── */
const SkeletonCard = () => (
  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-[var(--surface-raised)]" />
    <div className="p-3 space-y-2">
      <div className="h-3 w-3/4 rounded bg-[var(--surface-raised)]" />
      <div className="h-2.5 w-1/2 rounded bg-[var(--surface-raised)]" />
    </div>
  </div>
);

/* ─── Video Player Modal ─── */
const VideoModal = ({ video, onClose, isHindi }) => {
  if (!video) return null;
  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/88 backdrop-blur-md p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 sm:p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
              {video.eventName || (isHindi ? "समाज वीडियो" : "Samaj Video")}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate mt-0.5">{video.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1`}
            title={video.title}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-[var(--text-secondary)] line-clamp-1 flex-1 min-w-0 mr-3">
            {video.description || video.title}
          </p>
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary !py-2 !px-3.5 !text-xs inline-flex items-center gap-1.5 shrink-0"
          >
            <FaYoutube size={13} className="text-red-500" />
            <span>{isHindi ? "YouTube पर खोलें" : "Open on YouTube"}</span>
            <FiExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─── Photo Lightbox Modal ─── */
const PhotoModal = ({ album, onClose }) => {
  if (!album) return null;
  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/88 backdrop-blur-md p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full rounded-2xl overflow-hidden bg-[var(--surface-elevated)] border border-white/15 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-black/70 text-white hover:bg-black/90 cursor-pointer"
        >
          <FiX size={16} />
        </button>
        {album.coverImage?.url && (
          <img
            src={album.coverImage.url}
            alt={album.title}
            className="w-full object-contain max-h-[80vh]"
          />
        )}
        <div className="p-3 bg-[var(--surface-elevated)] border-t border-[var(--border-subtle)]">
          <h4 className="text-sm font-bold text-[var(--text-primary)]">{album.title}</h4>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const HomeMediaSection = () => {
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [albums, setAlbums] = useState([]);
  const [videos, setVideos] = useState([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [albumsError, setAlbumsError] = useState(false);
  const [videosError, setVideosError] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [tabTransition, setTabTransition] = useState(true);

  // Fetch gallery albums
  useEffect(() => {
    let isMounted = true;
    setAlbumsLoading(true);
    setAlbumsError(false);
    apiConnector("GET", contentEndpoints.GALLERY_ALBUMS_API, null, null, { limit: 6 })
      .then((res) => {
        if (!isMounted) return;
        setAlbums(res?.data?.data?.albums || []);
      })
      .catch(() => { if (isMounted) setAlbumsError(true); })
      .finally(() => { if (isMounted) setAlbumsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  // Fetch videos
  useEffect(() => {
    let isMounted = true;
    setVideosLoading(true);
    setVideosError(false);
    apiConnector("GET", contentEndpoints.VIDEOS_API, null, null, { limit: 4 })
      .then((res) => {
        if (!isMounted) return;
        setVideos(res?.data?.data?.videos || []);
      })
      .catch(() => { if (isMounted) setVideosError(true); })
      .finally(() => { if (isMounted) setVideosLoading(false); });
    return () => { isMounted = false; };
  }, []);

  // Handle tab change with transition
  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setActiveTab(tabId); return; }
    setTabTransition(false);
    setTimeout(() => { setActiveTab(tabId); setTabTransition(true); }, 180);
  };

  const isLoading = activeTab === "all"
    ? (albumsLoading && videosLoading)
    : activeTab === "photos" ? albumsLoading : videosLoading;

  // Build "all" grid: interleave photos and videos (max 8)
  const allItems = [];
  let ai = 0, vi = 0;
  while (allItems.length < 8 && (ai < albums.length || vi < videos.length)) {
    if (ai < albums.length) allItems.push({ type: "photo", data: albums[ai++] });
    if (allItems.length < 8 && vi < videos.length) allItems.push({ type: "video", data: videos[vi++] });
  }

  const renderContent = () => {
    // Loading
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
        </div>
      );
    }

    // Error
    if (
      (activeTab === "all" && albumsError && videosError) ||
      (activeTab === "photos" && albumsError) ||
      (activeTab === "videos" && videosError)
    ) {
      return (
        <div className="py-12 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50">
          <FiAlertCircle size={28} className="mx-auto text-[var(--text-muted)] mb-3" />
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            {isHindi ? "झलकियाँ लोड नहीं हो सकीं। कृपया कुछ समय बाद पुनः प्रयास करें।" : "Media could not be loaded. Please try again later."}
          </p>
        </div>
      );
    }

    // Photos tab
    if (activeTab === "photos") {
      if (albums.length === 0) return (
        <div className="py-12 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50">
          <FiCamera size={28} className="mx-auto text-cyan-500/50 mb-3" />
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {isHindi ? "अभी कोई फोटो उपलब्ध नहीं है।" : "No photos available yet."}
          </p>
        </div>
      );
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {albums.map((album) => (
            <PhotoCard key={album._id} album={album} onOpen={setSelectedAlbum} />
          ))}
        </div>
      );
    }

    // Videos tab
    if (activeTab === "videos") {
      if (videos.length === 0) return (
        <div className="py-12 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50">
          <FaYoutube size={32} className="mx-auto text-red-500/50 mb-3" />
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {isHindi ? "अभी कोई वीडियो उपलब्ध नहीं है।" : "No videos available yet."}
          </p>
        </div>
      );
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} onPlay={setSelectedVideo} isHindi={isHindi} />
          ))}
        </div>
      );
    }

    // All tab
    if (allItems.length === 0) return (
      <div className="py-12 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50">
        <FiImage size={28} className="mx-auto text-[var(--text-muted)] mb-3" />
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {isHindi ? "अभी कोई कार्यक्रम झलकी उपलब्ध नहीं है।" : "No event highlights available yet."}
        </p>
      </div>
    );
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {allItems.map((item, idx) =>
          item.type === "photo"
            ? <PhotoCard key={`p-${item.data._id}`} album={item.data} onOpen={setSelectedAlbum} />
            : <VideoCard key={`v-${item.data._id}`} video={item.data} onPlay={setSelectedVideo} isHindi={isHindi} />
        )}
      </div>
    );
  };

  return (
    <section className="py-10 sm:py-14">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            <FiCamera size={13} />
            <span>{isHindi ? "हमारे कार्यक्रम" : "Our Programs"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "समाज के कार्यक्रम एवं झलकियाँ" : "Samaj Programs & Highlights"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            {isHindi
              ? "समाज में आयोजित विभिन्न कार्यक्रमों, आयोजनों और सामुदायिक गतिविधियों की यादगार झलकियाँ देखें।"
              : "Browse memorable highlights from various programs, events and community activities."}
          </p>
        </div>

        {(albums.length > 0 || videos.length > 0) && (
          <Link
            to="/gallery"
            className="btn-secondary !py-2.5 !px-5 !text-xs inline-flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <span>{isHindi ? "सभी झलकियाँ" : "All Highlights"}</span>
            <FiArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* ── Segmented Tab Control ── */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {Icon && <Icon size={12} />}
                {isHindi ? tab.labelHi : tab.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content Area (with fade transition) ── */}
      <div
        style={{
          opacity: tabTransition ? 1 : 0,
          transform: tabTransition ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
        }}
      >
        {renderContent()}
      </div>

      {/* ── Bottom CTAs ── */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        {albums.length > 0 && (
          <Link to="/gallery" className="btn-secondary !py-2 !px-4 !text-xs inline-flex items-center gap-1.5">
            <FiCamera size={13} />
            <span>{isHindi ? "पूरी गैलरी देखें" : "View Full Gallery"}</span>
            <FiArrowRight size={12} />
          </Link>
        )}
        {videos.length > 0 && (
          <Link to="/videos" className="btn-secondary !py-2 !px-4 !text-xs inline-flex items-center gap-1.5">
            <FaYoutube size={13} className="text-red-500" />
            <span>{isHindi ? "सभी वीडियो देखें" : "View All Videos"}</span>
            <FiArrowRight size={12} />
          </Link>
        )}
      </div>

      {/* ── Modals ── */}
      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} isHindi={isHindi} />
      <PhotoModal album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />
    </section>
  );
};

export default HomeMediaSection;
