import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiDownload,
  FiCalendar,
  FiArrowRight,
  FiAlertCircle,
  FiFileText,
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

const PublicationCard = ({ publication, isHindi }) => {
  const coverUrl = publication.coverImage?.url;
  const publishedDate = publication.publishedAt || publication.createdAt ? formatDate(publication.publishedAt || publication.createdAt) : null;
  const editionInfo = [publication.edition, publication.month && publication.year ? `${publication.month}/${publication.year}` : publication.year].filter(Boolean).join(" • ");

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-lg">
      <div>
        {/* Cover Preview */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--surface)] border-b border-[var(--border-subtle)]">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={publication.title}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement.classList.add("flex", "items-center", "justify-center", "bg-sky-500/10");
              }}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-sky-500/10 to-indigo-500/10 p-4 text-center">
              <FiBookOpen size={36} className="text-sky-500/60 mb-2" />
              <span className="text-xs font-bold text-[var(--text-secondary)] line-clamp-1">
                {publication.title}
              </span>
            </div>
          )}

          {editionInfo && (
            <span className="absolute top-3 left-3 rounded-full border border-sky-500/30 bg-sky-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-white">
              {editionInfo}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {publishedDate && (
            <div className="mb-2 flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <FiCalendar size={11} />
              <span>{publishedDate}</span>
            </div>
          )}

          <h3 className="text-base font-bold text-[var(--text-primary)] transition-colors group-hover:text-sky-500 line-clamp-1">
            {publication.title}
          </h3>

          {publication.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
              {publication.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer: Action */}
      <div className="p-5 pt-0 mt-auto">
        <div className="border-t border-[var(--border-subtle)] pt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
            <FiFileText size={12} />
            <span>{isHindi ? "डिजिटल संस्करण" : "Digital Issue"}</span>
          </span>

          {publication.file?.url ? (
            <a
              href={contentEndpoints.PUBLICATION_VIEW_FILE_API(publication._id || publication.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform"
            >
              <span>{isHindi ? "पत्रिका पढ़ें" : "Read Edition"}</span>
              <FiArrowRight size={13} />
            </a>
          ) : (
            <Link
              to="/publications"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform"
            >
              <span>{isHindi ? "पत्रिका देखें" : "View Edition"}</span>
              <FiArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

const SkeletonPublicationCard = () => (
  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] overflow-hidden animate-pulse flex flex-col justify-between">
    <div>
      <div className="aspect-[16/10] w-full bg-[var(--surface-raised)]" />
      <div className="p-5">
        <div className="h-3 w-20 bg-[var(--surface-raised)] rounded mb-3" />
        <div className="h-5 w-4/5 bg-[var(--surface-raised)] rounded mb-2" />
        <div className="h-3 w-full bg-[var(--surface-raised)] rounded mb-1.5" />
        <div className="h-3 w-3/4 bg-[var(--surface-raised)] rounded" />
      </div>
    </div>
    <div className="p-5 pt-0">
      <div className="border-t border-[var(--border-subtle)] pt-3 flex justify-between">
        <div className="h-4 w-20 bg-[var(--surface-raised)] rounded" />
        <div className="h-4 w-16 bg-[var(--surface-raised)] rounded" />
      </div>
    </div>
  </div>
);

const HomePatrikaSection = () => {
  const { isHindi } = useLanguage();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    apiConnector("GET", contentEndpoints.PUBLICATIONS_API, null, null, { limit: 3 })
      .then((res) => {
        if (!isMounted) return;
        const list = res?.data?.data?.publications || [];
        setPublications(list);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      className="relative w-full rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6 sm:p-8 lg:p-10 transition-colors duration-300"
      aria-label="Samaj Patrika and Publications Section"
    >
      {/* Background subtle radial aura */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-sky-500/5 via-transparent to-amber-500/5" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-bold text-sky-600 dark:text-sky-400 mb-3">
            <FiBookOpen size={13} />
            <span>{isHindi ? "समाज की पत्रिका" : "Samaj Patrika"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {isHindi ? "समाज पत्रिका व स्मारिका" : "Samaj Patrika & Publications"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl">
            {isHindi
              ? "समाज की गतिविधियों, उपलब्धियों, विचारों और महत्वपूर्ण घटनाओं का आधिकारिक प्रकाशन।"
              : "Official community magazine, souvenirs, and digital publications showcasing community milestones."}
          </p>
        </div>

        <Link
          to="/publications"
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] transition-all duration-200 hover:border-sky-500/40 hover:bg-[var(--surface-hover)] hover:text-sky-600 dark:hover:text-sky-400 shrink-0"
        >
          <span>{isHindi ? "सभी पत्रिकाएँ देखें" : "View All Editions"}</span>
          <FiArrowRight size={14} />
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonPublicationCard />
          <SkeletonPublicationCard />
          <SkeletonPublicationCard />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FiAlertCircle size={32} className="text-amber-500 mb-2" />
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            {isHindi
              ? "पत्रिका संस्करण अभी लोड नहीं हो सके। कृपया कुछ समय बाद पुनः प्रयास करें।"
              : "Could not load publications at this time. Please try again later."}
          </p>
          <Link to="/publications" className="text-xs font-bold text-sky-500 hover:underline">
            {isHindi ? "पत्रिका पेज पर जाएं →" : "Go to Publications Page →"}
          </Link>
        </div>
      ) : publications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10 text-sky-500 mb-3">
            <FiBookOpen size={22} />
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {isHindi
              ? "वर्तमान में कोई प्रकाशित पत्रिका उपलब्ध नहीं है।"
              : "No publications available right now."}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)] max-w-sm">
            {isHindi
              ? "नई स्मारिका एवं पत्रिका संस्करण प्रकाशित होते ही यहाँ उपलब्ध होंगे।"
              : "Upcoming souvenirs and magazine issues will be published here soon."}
          </p>
          <Link
            to="/publications"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-sky-500 transition-colors"
          >
            <span>{isHindi ? "प्रकाशन देखें" : "View Publications"}</span>
            <FiArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((pub) => (
            <PublicationCard key={pub._id || pub.id} publication={pub} isHindi={isHindi} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomePatrikaSection;
