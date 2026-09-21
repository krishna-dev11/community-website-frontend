import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiAward,
  FiCalendar,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
  FiUsers,
} from "react-icons/fi";
import { apiConnector } from "../../../services/apiConnector";
import { opportunityEndpoints } from "../../../services/apis";
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

const ScholarshipCard = ({ scholarship, isHindi }) => {
  const deadline = scholarship.applicationDeadline ? formatDate(scholarship.applicationDeadline) : null;
  const amountDisplay = scholarship.amount
    ? `₹${Number(scholarship.amount).toLocaleString("en-IN")}`
    : null;

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-lg">
      <div>
        {/* Top badge row: Category/Provider + Amount */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
            <FiAward size={12} />
            {scholarship.provider || (isHindi ? "समिति सहयोग" : "Samiti Support")}
          </span>
          {amountDisplay && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
              {amountDisplay}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[var(--text-primary)] transition-colors group-hover:text-amber-500 line-clamp-2 leading-snug">
          {scholarship.title}
        </h3>

        {/* Seats or Education level if present */}
        <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-[var(--text-secondary)]">
          {scholarship.seats && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface-raised)] px-2 py-1 border border-[var(--border-subtle)]">
              <FiUsers size={11} className="text-amber-500" />
              <span>{scholarship.seats} {isHindi ? "उपलब्ध सीटें" : "seats"}</span>
            </span>
          )}
          {scholarship.educationLevel && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface-raised)] px-2 py-1 border border-[var(--border-subtle)]">
              <FiBookOpen size={11} className="text-emerald-500" />
              <span>{scholarship.educationLevel}</span>
            </span>
          )}
        </div>

        {/* Eligibility or description snippet */}
        {(scholarship.eligibility || scholarship.description) && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {isHindi ? "पात्रता: " : "Eligibility: "}
            </span>
            {scholarship.eligibility || scholarship.description}
          </p>
        )}
      </div>

      {/* Card Footer: Deadline + CTA */}
      <div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3.5">
        {deadline ? (
          <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            <FiCalendar size={11} />
            <span>{isHindi ? `अंतिम तिथि: ${deadline}` : `Deadline: ${deadline}`}</span>
          </span>
        ) : (
          <span />
        )}
        <Link
          to="/scholarships"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 transition-transform group-hover:translate-x-1"
        >
          <span>{isHindi ? "योजना देखें" : "View Details"}</span>
          <FiArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
};

const SkeletonScholarshipCard = () => (
  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 animate-pulse flex flex-col justify-between">
    <div>
      <div className="flex justify-between mb-3">
        <div className="h-5 w-24 bg-[var(--surface-raised)] rounded-full" />
        <div className="h-5 w-16 bg-[var(--surface-raised)] rounded-full" />
      </div>
      <div className="h-5 w-4/5 bg-[var(--surface-raised)] rounded mb-2" />
      <div className="h-4 w-3/5 bg-[var(--surface-raised)] rounded mb-3" />
      <div className="h-3 w-full bg-[var(--surface-raised)] rounded mb-1.5" />
      <div className="h-3 w-4/5 bg-[var(--surface-raised)] rounded" />
    </div>
    <div className="mt-5 border-t border-[var(--border-subtle)] pt-3 flex justify-between">
      <div className="h-3 w-24 bg-[var(--surface-raised)] rounded" />
      <div className="h-4 w-16 bg-[var(--surface-raised)] rounded" />
    </div>
  </div>
);

const HomeScholarshipsSection = () => {
  const { isHindi } = useLanguage();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    apiConnector("GET", opportunityEndpoints.SCHOLARSHIPS_API, null, null, { limit: 4 })
      .then((res) => {
        if (!isMounted) return;
        const list = res?.data?.data?.scholarships || [];
        setScholarships(list);
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
      aria-label="Scholarships and Education Support Section"
    >
      {/* Background subtle radial aura */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-3">
            <FiBookOpen size={13} />
            <span>{isHindi ? "शिक्षा संवर्धन एवं संबल" : "Education & Scholarships"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {isHindi ? "छात्रवृत्ति एवं शिक्षा सहायता" : "Scholarships & Education Support"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl">
            {isHindi
              ? "समाज के मेधावी छात्र-छात्राओं के लिए उच्च शिक्षा छात्रवृत्ति एवं संबल योजनाएं।"
              : "Educational assistance, scholarship facilitation, and financial aid for community students."}
          </p>
        </div>

        <Link
          to="/scholarships"
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] transition-all duration-200 hover:border-amber-500/40 hover:bg-[var(--surface-hover)] hover:text-amber-600 dark:hover:text-amber-400 shrink-0"
        >
          <span>{isHindi ? "सभी Scholarships देखें" : "View All Scholarships"}</span>
          <FiArrowRight size={14} />
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SkeletonScholarshipCard />
          <SkeletonScholarshipCard />
          <SkeletonScholarshipCard />
          <SkeletonScholarshipCard />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FiAlertCircle size={32} className="text-amber-500 mb-2" />
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            {isHindi
              ? "छात्रवृत्ति योजनाएं अभी लोड नहीं हो सकीं। कृपया कुछ समय बाद पुनः प्रयास करें।"
              : "Could not load scholarships at this time. Please try again later."}
          </p>
          <Link to="/scholarships" className="text-xs font-bold text-amber-500 hover:underline">
            {isHindi ? "Scholarships पेज पर जाएं →" : "Go to Scholarships Page →"}
          </Link>
        </div>
      ) : scholarships.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-3">
            <FiBookOpen size={22} />
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {isHindi
              ? "अभी कोई सक्रिय छात्रवृत्ति उपलब्ध नहीं है।"
              : "No active scholarships available right now."}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)] max-w-sm">
            {isHindi
              ? "समिति द्वारा नए सत्र के लिए छात्रवृत्ति योजनाएं शीघ्र घोषित की जाएंगी।"
              : "New scholarship schemes for the upcoming academic session will be announced soon."}
          </p>
          <Link
            to="/scholarships"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-500 transition-colors"
          >
            <span>{isHindi ? "Scholarships देखें" : "View Scholarships"}</span>
            <FiArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {scholarships.map((sch) => (
            <ScholarshipCard key={sch._id || sch.id} scholarship={sch} isHindi={isHindi} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeScholarshipsSection;
