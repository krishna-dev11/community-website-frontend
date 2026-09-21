import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaYoutube, FaPlay } from "react-icons/fa";
import { FiArrowRight, FiCalendar, FiTag, FiX, FiExternalLink } from "react-icons/fi";
import { apiConnector } from "../../../services/apiConnector";
import { contentEndpoints } from "../../../services/apis";
import { useLanguage } from "../../../i18n/LanguageContext";

const formatDate = (val) => {
  if (!val) return "";
  try {
    return new Date(val).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const SamajVideosSection = () => {
  const { isHindi } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiConnector("GET", contentEndpoints.VIDEOS_API, null, null, { limit: 6 })
      .then((res) => {
        if (!isMounted) return;
        const fetchedVideos = res?.data?.data?.videos || [];
        setVideos(fetchedVideos);
      })
      .catch(() => {
        if (!isMounted) return;
        setVideos([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-bold text-red-500 mb-3">
            <FaYoutube size={14} />
            <span>{isHindi ? "समाज वीडियो दर्शन" : "Samaj Videos"}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "समाज के कार्यक्रम — वीडियो झलक" : "Samaj Events — Video Highlights"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 max-w-2xl font-normal">
            {isHindi
              ? "हमारे कार्यक्रमों, समारोहों और सामुदायिक गतिविधियों की वीडियो झलक।"
              : "Video highlights from our community programs, conventions, and cultural gatherings."}
          </p>
        </div>

        {videos.length > 0 && (
          <Link
            to="/videos"
            className="btn-secondary !text-xs !py-2.5 !px-5 inline-flex items-center gap-2 self-start md:self-auto shrink-0"
          >
            <span>{isHindi ? "सभी वीडियो देखें" : "View All Videos"}</span>
            <FiArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="ka-card p-5 rounded-3xl border border-[var(--border-subtle)] animate-pulse space-y-4"
            >
              <div className="aspect-video w-full rounded-2xl bg-[var(--surface-raised)]" />
              <div className="h-5 w-3/4 rounded-md bg-[var(--surface-raised)]" />
              <div className="h-4 w-1/2 rounded-md bg-[var(--surface-raised)]" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        /* Empty State */
        <div className="ka-card p-8 sm:p-12 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)]/40">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
            <FaYoutube size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1.5">
            {isHindi ? "समाज के वीडियो जल्द ही यहां उपलब्ध होंगे" : "Samaj videos will be available here soon"}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
            {isHindi
              ? "हमारे कार्यक्रमों और सामुदायिक गतिविधियों के वीडियो शीघ्र जोड़े जा रहे हैं।"
              : "Official video recordings of community activities and celebrations will be added soon."}
          </p>
        </div>
      ) : (
        /* 2-Card Desktop Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {videos.slice(0, 4).map((video) => {
            const thumbUrl =
              video.thumbnailUrl ||
              `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;

            return (
              <article
                key={video._id}
                className="group ka-card rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 sm:p-5 shadow-lg transition-all duration-300 hover:border-red-500/40 hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  {/* YouTube Thumbnail Card with Play Overlay */}
                  <div
                    onClick={() => setSelectedVideo(video)}
                    className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black/90 cursor-pointer shadow-inner"
                    title={video.title}
                  >
                    <img
                      src={thumbUrl}
                      alt={video.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* YouTube Red Play Button Badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        aria-label={`Watch video: ${video.title}`}
                        className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-red-500 cursor-pointer"
                      >
                        <FaPlay size={20} className="ml-1" />
                      </button>
                    </div>

                    {/* Top Badges: Event or Duration/Date */}
                    {(video.eventName || video.eventDate) && (
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        {video.eventName ? (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                            <FiTag size={11} className="text-red-400" />
                            <span className="truncate max-w-[180px]">{video.eventName}</span>
                          </span>
                        ) : <span />}

                        {video.eventDate && (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-medium text-gray-300 backdrop-blur-md">
                            <FiCalendar size={11} />
                            <span>{formatDate(video.eventDate)}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Video Meta & Title */}
                  <div className="pt-4 space-y-2">
                    <h3
                      onClick={() => setSelectedVideo(video)}
                      className="text-sm sm:text-base font-bold text-[var(--text-primary)] line-clamp-2 leading-snug cursor-pointer group-hover:text-red-500 transition-colors"
                      title={video.title}
                    >
                      {video.title}
                    </h3>

                    {video.description && (
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed font-normal">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(video)}
                    className="inline-flex items-center gap-1.5 font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
                  >
                    <FaPlay size={10} />
                    <span>{isHindi ? "यहाँ देखें" : "Play Video"}</span>
                  </button>

                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
                  >
                    <FaYoutube size={13} />
                    <span>{isHindi ? "YouTube पर देखें" : "Watch on YouTube"}</span>
                    <FiExternalLink size={11} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Video Player (Loaded on demand, zero background lag) */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 sm:p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                  {selectedVideo.eventName || (isHindi ? "आधिकारिक वीडियो" : "Samaj Video")}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate mt-0.5">
                  {selectedVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                aria-label="Close video player"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Embedded Responsive Player */}
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-inner">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.videoId}?autoplay=1`}
                title={selectedVideo.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 sm:max-w-xl font-normal">
                {selectedVideo.description || selectedVideo.title}
              </p>
              <a
                href={selectedVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary !py-2 !px-4 !text-xs inline-flex items-center gap-2 self-start sm:self-auto shrink-0"
              >
                <FaYoutube size={14} className="text-red-500" />
                <span>{isHindi ? "YouTube पर खोलें" : "Open in YouTube"}</span>
                <FiExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SamajVideosSection;
