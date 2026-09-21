import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiImage, FiArrowLeft, FiArrowRight, FiCamera, FiX, FiZoomIn } from "react-icons/fi";
import { apiConnector } from "../../../services/apiConnector";
import { contentEndpoints } from "../../../services/apis";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeGallerySection = () => {
  const { isHindi } = useLanguage();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  useEffect(() => {
    const modalOpen = Boolean(selectedAlbum || selectedImageIndex !== null);
    if (!modalOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedAlbum, selectedImageIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (selectedImageIndex === null || !selectedAlbum?.photos?.length) return;
      if (event.key === "Escape") setSelectedImageIndex(null);
      if (event.key === "ArrowLeft") {
        setSelectedImageIndex((index) => (index - 1 + selectedAlbum.photos.length) % selectedAlbum.photos.length);
      }
      if (event.key === "ArrowRight") {
        setSelectedImageIndex((index) => (index + 1) % selectedAlbum.photos.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAlbum, selectedImageIndex]);

  const openAlbum = async (album) => {
    setSelectedImageIndex(null);
    setSelectedAlbum({ ...album, photos: [] });
    setAlbumLoading(true);
    try {
      const response = await apiConnector("GET", contentEndpoints.GALLERY_PHOTOS_API(album._id), null, null, { limit: 50 });
      setSelectedAlbum({ ...album, photos: response?.data?.data?.photos || [] });
    } catch {
      setSelectedAlbum({ ...album, photos: [] });
    } finally {
      setAlbumLoading(false);
    }
  };

  const closeAlbum = () => {
    setSelectedImageIndex(null);
    setSelectedAlbum(null);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiConnector("GET", contentEndpoints.GALLERY_ALBUMS_API, null, null, { limit: 6 })
      .then((res) => {
        if (!isMounted) return;
        const fetched = res?.data?.data?.albums || [];
        setAlbums(fetched);
      })
      .catch(() => {
        if (!isMounted) return;
        setAlbums([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-500 dark:text-cyan-400 mb-2">
            <FiCamera size={13} />
            <span>{isHindi ? "छायाचित्र संग्रह" : "Photo Gallery"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "हमारी यादें" : "Our Memories"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {isHindi
              ? "समाज के कार्यक्रमों और यादगार पलों की झलक"
              : "Glance through community conventions, cultural gatherings, and memorable moments"}
          </p>
        </div>

        {albums.length > 0 && (
          <Link
            to="/gallery"
            className="btn-secondary !py-2.5 !px-5 !text-xs inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <span>{isHindi ? "पूरी गैलरी देखें" : "View Full Gallery"}</span>
            <FiArrowRight size={14} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="aspect-[4/3] rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] animate-pulse"
            />
          ))}
        </div>
      ) : albums.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3">
            <FiImage size={26} />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {isHindi ? "समाज के छायाचित्र जल्द ही यहां उपलब्ध होंगे" : "Samaj gallery photos will be available here soon"}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mt-1.5 font-normal">
            {isHindi
              ? "समिति के आगामी सम्मेलनों और सामाजिक आयोजनों की उच्च-गुणवत्ता छायाचित्र गैलरी शीघ्र जोड़ी जा रही है।"
              : "Photo albums from official community gatherings and cultural celebrations are being curated."}
          </p>
          <div className="mt-5">
            <Link to="/gallery" className="btn-secondary !py-2 !px-4 !text-xs">
              <span>{isHindi ? "गैलरी अनुभाग देखें" : "Open Gallery Page"}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
          {albums.map((album) => {
            const coverUrl = album.coverImage?.url;
            return (
              <div
                key={album._id}
                onClick={() => openAlbum(album)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-elevated)] cursor-pointer shadow-sm hover:shadow-xl transition-all"
              >
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={album.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--surface-raised)] to-[var(--surface-elevated)] text-[var(--text-muted)] p-4 text-center">
                    <FiImage size={32} className="mb-2 text-cyan-500/60" />
                    <span className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{album.title}</span>
                  </div>
                )}

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                {/* Photo Count Chip */}
                {album.photoCount > 0 && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center gap-1">
                    <FiImage size={10} />
                    <span>{album.photoCount}</span>
                  </div>
                )}

                {/* Bottom Content */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-white">
                  <h4 className="text-xs sm:text-sm font-black line-clamp-1 group-hover:text-cyan-300 transition-colors">
                    {album.title}
                  </h4>
                  {album.eventDate && (
                    <p className="text-[10px] sm:text-[11px] text-white/70 mt-0.5">
                      {new Date(album.eventDate).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedAlbum && (
        <div className="fixed inset-0 z-[1100] flex flex-col bg-[var(--bg)]">
          <div className="sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur-md">
            <button type="button" onClick={closeAlbum} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Close album">
              <FiX size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold text-[var(--text-primary)]">{selectedAlbum.title}</h2>
              <p className="text-xs text-[var(--text-muted)]">
                {selectedAlbum.photos?.length || 0} {(selectedAlbum.photos?.length || 0) === 1 ? "Photo" : "Photos"}
                {selectedAlbum.eventDate && ` · ${new Date(selectedAlbum.eventDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`}
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-12 sm:p-6">
            {albumLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-square animate-pulse rounded-2xl bg-[var(--surface-elevated)]" />)}
              </div>
            ) : selectedAlbum.photos?.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {selectedAlbum.photos.map((photo, index) => (
                  <button key={photo._id || index} type="button" onClick={() => setSelectedImageIndex(index)} className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]">
                    <img src={photo.image?.url || photo.url} alt={photo.caption || `Photo ${index + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white transition-colors group-hover:bg-black/25"><FiZoomIn size={24} className="opacity-0 transition-opacity group-hover:opacity-100" /></span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--text-muted)]"><FiImage size={44} /><p className="mt-3 text-sm">No photos available in this album.</p></div>
            )}
          </div>
        </div>
      )}

      {selectedImageIndex !== null && selectedAlbum?.photos?.length > 0 && (() => {
        const photos = selectedAlbum.photos;
        const photo = photos[selectedImageIndex];
        const imageUrl = photo.image?.url || photo.url;
        return (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/95 px-4" onClick={() => setSelectedImageIndex(null)}>
            <button type="button" onClick={() => setSelectedImageIndex(null)} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20" aria-label="Close image viewer"><FiX size={20} /></button>
            <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedImageIndex((index) => (index - 1 + photos.length) % photos.length); }} className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 sm:left-6" aria-label="Previous image"><FiArrowLeft size={22} /></button>
            <img src={imageUrl} alt={photo.caption || `Photo ${selectedImageIndex + 1}`} className="max-h-[86vh] max-w-[calc(100vw-96px)] object-contain" onClick={(event) => event.stopPropagation()} />
            <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedImageIndex((index) => (index + 1) % photos.length); }} className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 sm:right-6" aria-label="Next image"><FiArrowRight size={22} /></button>
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-xs text-white">{selectedImageIndex + 1} / {photos.length}</p>
          </div>
        );
      })()}
    </section>
  );
};

export default HomeGallerySection;
