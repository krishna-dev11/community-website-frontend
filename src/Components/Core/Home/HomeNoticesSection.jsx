import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiArrowRight,
  FiCalendar,
  FiInbox,
  FiPaperclip,
  FiImage,
  FiFileText,
  FiAlertCircle,
  FiUser,
  FiX,
  FiDownload,
  FiExternalLink,
} from "react-icons/fi";
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

/* ─── Extract Notice Image ─── */
const getNoticeImage = (notice) => {
  if (!notice) return null;
  if (notice.image?.url) return notice.image.url;
  if (notice.imageUrl) return notice.imageUrl;
  if (notice.coverImage?.url) return notice.coverImage.url;
  if (Array.isArray(notice.attachments) && notice.attachments.length > 0) {
    const imgAtt = notice.attachments.find(
      (a) =>
        a?.mimeType?.includes("image") ||
        (a?.url && a.url.match(/\.(jpeg|jpg|png|webp|gif|avif|svg)/i))
    );
    if (imgAtt?.url) return imgAtt.url;
    if (notice.attachments[0]?.url && !notice.attachments[0]?.url?.toLowerCase().endsWith(".pdf")) {
      return notice.attachments[0].url;
    }
  }
  return null;
};

/* ─── Extract Notice Documents / PDFs ─── */
const getNoticeDocuments = (notice) => {
  if (!notice) return [];
  const docs = [];
  if (notice.documentUrl) {
    docs.push({ url: notice.documentUrl, name: notice.documentName || "संलग्न दस्तावेज़ (PDF)" });
  }
  if (notice.pdfUrl) {
    docs.push({ url: notice.pdfUrl, name: "PDF दस्तावेज़" });
  }
  if (Array.isArray(notice.attachments)) {
    notice.attachments.forEach((a) => {
      const isImg =
        a?.mimeType?.includes("image") ||
        (a?.url && a.url.match(/\.(jpeg|jpg|png|webp|gif|avif|svg)/i));
      if (!isImg && a?.url) {
        docs.push(a);
      }
    });
  }
  return docs;
};

/* ─── Attachment Indicator Badge ─── */
const AttachmentBadge = ({ notice, isHindi }) => {
  const hasImage = !!getNoticeImage(notice);
  const docs = getNoticeDocuments(notice);
  const hasPdf = docs.length > 0;

  if (!hasImage && !hasPdf) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
      {hasImage && <FiImage size={12} />}
      {hasPdf && <FiFileText size={12} />}
      {hasImage && !hasPdf && (isHindi ? "पोस्टर संलग्न" : "Poster Attached")}
      {hasPdf && !hasImage && (isHindi ? "PDF संलग्न" : "PDF Attached")}
      {hasImage && hasPdf && (isHindi ? "संलग्नक उपलब्ध" : "Attachments Available")}
    </span>
  );
};

/* ─── Notice Detail Modal ─── */
const NoticeDetailModal = ({ notice, onClose, isHindi }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  if (!notice) return null;

  const imageUrl = getNoticeImage(notice);
  const documents = getNoticeDocuments(notice);
  const issuedBy = notice.issuedBy || notice.department || (isHindi ? "समिति सचिवालय" : "Secretariat");
  const publishedDate = notice.publishedAt || notice.date || notice.createdAt;
  const description = notice.description || notice.content || notice.body || notice.summary;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 mb-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
              {notice.category || (isHindi ? "आधिकारिक सूचना" : "Official Notice")}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-snug">
              {notice.title}
            </h2>
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
              {publishedDate && (
                <span className="flex items-center gap-1">
                  <FiCalendar size={13} className="text-emerald-500" />
                  <span>{formatDate(publishedDate)}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <FiUser size={13} className="text-amber-500" />
                <span>{issuedBy}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Poster / Image Preview (object-contain so text is never cropped) */}
        {imageUrl && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-2 sm:p-4">
            <div className="relative flex items-center justify-center max-h-[60vh] overflow-hidden rounded-xl bg-black/20">
              <img
                src={imageUrl}
                alt={notice.title}
                className="max-h-[58vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
              <span>{isHindi ? "आधिकारिक सूचना पोस्टर / पत्र" : "Official Notice Poster"}</span>
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>{isHindi ? "पूर्ण आकार में देखें" : "View Full Size"}</span>
                <FiExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        {/* Notice Detailed Content */}
        {description && (
          <div className="mb-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
              {isHindi ? "विस्तृत विवरण / परिपत्र पाठ" : "Notice Details"}
            </h4>
            <div className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-primary)] font-normal">
              {description}
            </div>
          </div>
        )}

        {/* Documents / PDF Attachments */}
        {documents.length > 0 && (
          <div className="mb-6 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
              <FiPaperclip size={14} className="text-amber-500" />
              <span>{isHindi ? "संलग्न दस्तावेज़ (PDF / Attachments)" : "Attached Documents"}</span>
            </h4>
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-3 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                    <FiFileText size={18} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                      {doc.name || (isHindi ? `दस्तावेज़ ${idx + 1}` : `Document ${idx + 1}`)}
                    </p>
                    {doc.size && (
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {Math.round(doc.size / 1024)} KB
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-colors"
                >
                  <FiDownload size={13} />
                  <span>{isHindi ? "डाउनलोड" : "Download"}</span>
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-5">
          <Link
            to="/notices"
            onClick={onClose}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <span>{isHindi ? "सभी प्रकाशित सूचनाएं देखें" : "View All Notices"}</span>
            <FiArrowRight size={13} />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-5 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            {isHindi ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Notice Card ─── */
const NoticeCard = ({ notice, isHindi, onSelect }) => {
  const imageUrl = getNoticeImage(notice);
  const issuedBy = notice.issuedBy || notice.department || (isHindi ? "समिति सचिवालय" : "Secretariat");
  const description = notice.description || notice.content || notice.body || notice.summary;
  const dateDisplay = formatDate(notice.publishedAt || notice.date || notice.createdAt);

  return (
    <article
      onClick={() => onSelect(notice)}
      className="group flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg cursor-pointer"
    >
      <div>
        {/* Notice Poster / Image Preview (object-contain so text is not cropped) */}
        {imageUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--surface)] border-b border-[var(--border-subtle)] p-2 flex items-center justify-center">
            <img
              src={imageUrl}
              alt={notice.title}
              loading="lazy"
              className="h-full w-full object-contain rounded-lg group-hover:scale-[1.02] transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.parentElement.style.display = "none";
              }}
            />
            <div className="absolute top-3 right-3 rounded-full border border-black/20 bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
              <span className="flex items-center gap-1">
                <FiImage size={10} />
                <span>{isHindi ? "पोस्टर" : "Poster"}</span>
              </span>
            </div>
          </div>
        ) : null}

        <div className="p-5 flex flex-col">
          {/* Category + Date row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-block px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider shrink-0">
              {notice.category || (isHindi ? "सूचना" : "Notice")}
            </span>
            {dateDisplay && (
              <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] shrink-0">
                <FiCalendar size={11} />
                {dateDisplay}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors line-clamp-2 leading-snug mb-2">
            {notice.title}
          </h3>

          {/* Description preview */}
          {description ? (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-3">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {/* Card Footer: IssuedBy + Attachment + "पूरा पढ़ें →" */}
      <div className="p-5 pt-0 mt-auto">
        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <FiUser size={11} />
              <span className="truncate max-w-[120px]">{issuedBy}</span>
            </span>
            <AttachmentBadge notice={notice} isHindi={isHindi} />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(notice);
            }}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>{isHindi ? "पूरा पढ़ें" : "Read Full"}</span>
            <FiArrowRight size={12} />
          </button>
        </div>
      </div>
    </article>
  );
};

/* ─── Skeleton Loader ─── */
const SkeletonNotice = () => (
  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] overflow-hidden animate-pulse flex flex-col justify-between">
    <div>
      <div className="aspect-[16/9] w-full bg-[var(--surface-raised)]" />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded-full bg-[var(--surface-raised)]" />
          <div className="h-3.5 w-20 rounded bg-[var(--surface-raised)]" />
        </div>
        <div className="h-5 w-4/5 rounded bg-[var(--surface-raised)]" />
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded bg-[var(--surface-raised)]" />
          <div className="h-3 w-5/6 rounded bg-[var(--surface-raised)]" />
        </div>
      </div>
    </div>
    <div className="p-5 pt-0">
      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-[var(--surface-raised)]" />
        <div className="h-3 w-16 rounded bg-[var(--surface-raised)]" />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN NOTICES SECTION
   ══════════════════════════════════════════════════════════════ */
const HomeNoticesSection = () => {
  const { isHindi } = useLanguage();
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    apiConnector("GET", contentEndpoints.NOTICES_API, null, null, { limit: 3 })
      .then((res) => {
        if (!isMounted) return;
        setNotices(res?.data?.data?.notices || []);
      })
      .catch(() => {
        if (!isMounted) return;
        setError(true);
        setNotices([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      className="relative w-full rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6 sm:p-8 lg:p-10 transition-colors duration-300"
      aria-label="Latest Notices and Circulars Section"
    >
      {/* Background subtle radial aura */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5" />

      {/* ── Section Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between mb-8 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3">
            <FiBookOpen size={13} />
            <span>{isHindi ? "आधिकारिक सूचना पटल" : "Official Notice Board"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {isHindi ? "नवीनतम परिपत्र एवं सूचनाएँ" : "Latest Notices & Circulars"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl">
            {isHindi
              ? "समिति के महत्वपूर्ण निर्णय, परिपत्र, बैठक प्रस्ताव और सार्वजनिक घोषणाएं।"
              : "Official circulars, meeting resolutions, and community announcements."}
          </p>
        </div>

        <Link
          to="/notices"
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] transition-all duration-200 hover:border-emerald-500/40 hover:bg-[var(--surface-hover)] hover:text-emerald-600 dark:hover:text-emerald-400 shrink-0"
        >
          <span>{isHindi ? "सभी सूचनाएं देखें" : "View All Notices"}</span>
          <FiArrowRight size={14} />
        </Link>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          <SkeletonNotice />
          <SkeletonNotice />
          <SkeletonNotice />
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50">
          <FiAlertCircle size={26} className="mx-auto text-amber-500 mb-3" />
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            {isHindi
              ? "सूचनाएँ लोड नहीं हो सकीं। कृपया कुछ समय बाद पुनः प्रयास करें।"
              : "Notices could not be loaded. Please try again later."}
          </p>
          <Link
            to="/notices"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-colors"
          >
            <span>{isHindi ? "सूचना अनुभाग देखें" : "Open Notices Page"}</span>
          </Link>
        </div>
      ) : notices.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
            <FiInbox size={26} />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {isHindi ? "अभी कोई नवीन सूचना उपलब्ध नहीं है।" : "No notices published at present"}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mt-1.5">
            {isHindi
              ? "समिति की आगामी बैठकों व निर्णयों के नए परिपत्र यहां प्रकाशित किए जाएंगे।"
              : "Official announcements and meeting circulars will be posted here as soon as approved."}
          </p>
          <div className="mt-5">
            <Link
              to="/notices"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-colors"
            >
              <span>{isHindi ? "सूचना अनुभाग देखें" : "Open Notices Page"}</span>
              <FiArrowRight size={13} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <NoticeCard
              key={notice._id || notice.id}
              notice={notice}
              isHindi={isHindi}
              onSelect={setSelectedNotice}
            />
          ))}
        </div>
      )}

      {/* ── Notice Detail Modal ── */}
      {selectedNotice && (
        <NoticeDetailModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
          isHindi={isHindi}
        />
      )}
    </section>
  );
};

export default HomeNoticesSection;
