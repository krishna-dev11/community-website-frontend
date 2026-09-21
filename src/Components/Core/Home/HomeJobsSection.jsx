import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiArrowRight,
  FiCalendar,
  FiAlertCircle,
  FiTag,
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

const JobCard = ({ job, isHindi }) => {
  const deadline = job.expiresAt ? formatDate(job.expiresAt) : null;
  const postedDate = job.publishedAt || job.createdAt ? formatDate(job.publishedAt || job.createdAt) : null;

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg">
      <div>
        {/* Top badge row: Type + Deadline/Posted */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <FiBriefcase size={12} />
            {job.employmentType || (isHindi ? "पूर्णकालिक" : "Full Time")}
          </span>
          {postedDate && (
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <FiCalendar size={11} />
              {postedDate}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[var(--text-primary)] transition-colors group-hover:text-emerald-500 line-clamp-1">
          {job.title}
        </h3>

        {/* Company name */}
        <p className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">
          {job.companyName}
        </p>

        {/* Meta badges: Location, Salary, Experience */}
        <div className="mt-3.5 flex flex-wrap gap-2 text-[11px] text-[var(--text-secondary)]">
          {job.location && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface-raised)] px-2 py-1 border border-[var(--border-subtle)]">
              <FiMapPin size={11} className="text-amber-500" />
              {job.location}
            </span>
          )}
          {job.salaryRange && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface-raised)] px-2 py-1 border border-[var(--border-subtle)]">
              <FiDollarSign size={11} className="text-emerald-500" />
              {job.salaryRange}
            </span>
          )}
          {job.experienceRequired && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface-raised)] px-2 py-1 border border-[var(--border-subtle)]">
              <FiClock size={11} className="text-sky-500" />
              {job.experienceRequired}
            </span>
          )}
        </div>

        {/* Description snippet */}
        {job.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
            {job.description}
          </p>
        )}

        {/* Skills preview if available */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 rounded-md bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--text-muted)] border border-[var(--border-subtle)]"
              >
                <FiTag size={9} />
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="text-[10px] text-[var(--text-muted)] self-center">
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Deadline + CTA */}
      <div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3.5">
        {deadline ? (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            {isHindi ? `अंतिम तिथि: ${deadline}` : `Deadline: ${deadline}`}
          </span>
        ) : (
          <span />
        )}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-transform group-hover:translate-x-1"
        >
          <span>{isHindi ? "विवरण देखें" : "View Job"}</span>
          <FiArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
};

const SkeletonJobCard = () => (
  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 animate-pulse flex flex-col justify-between">
    <div>
      <div className="flex justify-between mb-3">
        <div className="h-5 w-20 bg-[var(--surface-raised)] rounded-full" />
        <div className="h-4 w-16 bg-[var(--surface-raised)] rounded" />
      </div>
      <div className="h-5 w-3/4 bg-[var(--surface-raised)] rounded mb-2" />
      <div className="h-4 w-1/2 bg-[var(--surface-raised)] rounded mb-4" />
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-16 bg-[var(--surface-raised)] rounded" />
        <div className="h-6 w-20 bg-[var(--surface-raised)] rounded" />
      </div>
      <div className="h-3 w-full bg-[var(--surface-raised)] rounded mb-1.5" />
      <div className="h-3 w-4/5 bg-[var(--surface-raised)] rounded" />
    </div>
    <div className="mt-5 border-t border-[var(--border-subtle)] pt-3 flex justify-between">
      <div className="h-3 w-24 bg-[var(--surface-raised)] rounded" />
      <div className="h-4 w-16 bg-[var(--surface-raised)] rounded" />
    </div>
  </div>
);

const HomeJobsSection = () => {
  const { isHindi } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    apiConnector("GET", opportunityEndpoints.JOBS_API, null, null, { limit: 4 })
      .then((res) => {
        if (!isMounted) return;
        const jobList = res?.data?.data?.jobs || [];
        setJobs(jobList);
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
      aria-label="Available Jobs Section"
    >
      {/* Background subtle radial aura */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3">
            <FiBriefcase size={13} />
            <span>{isHindi ? "रोजगार के अवसर" : "Career & Opportunities"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {isHindi ? "उपलब्ध रोजगार के अवसर" : "Available Jobs"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl">
            {isHindi
              ? "समाज के युवाओं एवं सदस्यों के लिए सत्यापित रोजगार एवं करियर के नए अवसर।"
              : "Verified employment and career opportunities curated for community members."}
          </p>
        </div>

        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] transition-all duration-200 hover:border-emerald-500/40 hover:bg-[var(--surface-hover)] hover:text-emerald-600 dark:hover:text-emerald-400 shrink-0"
        >
          <span>{isHindi ? "सभी Jobs देखें" : "View All Jobs"}</span>
          <FiArrowRight size={14} />
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SkeletonJobCard />
          <SkeletonJobCard />
          <SkeletonJobCard />
          <SkeletonJobCard />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FiAlertCircle size={32} className="text-amber-500 mb-2" />
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            {isHindi
              ? "Jobs अभी लोड नहीं हो सके। कृपया कुछ समय बाद पुनः प्रयास करें।"
              : "Could not load jobs at this time. Please try again later."}
          </p>
          <Link to="/jobs" className="text-xs font-bold text-emerald-500 hover:underline">
            {isHindi ? "Jobs पेज पर जाएं →" : "Go to Jobs Page →"}
          </Link>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
            <FiBriefcase size={22} />
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {isHindi
              ? "अभी कोई सक्रिय रोजगार अवसर उपलब्ध नहीं है।"
              : "No open jobs are available right now."}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)] max-w-sm">
            {isHindi
              ? "नई रिक्तियों और करियर अपडेट्स के लिए नियमित रूप से जाँच करते रहें।"
              : "Check back regularly for new vacancies and career announcements."}
          </p>
          <Link
            to="/jobs"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-colors"
          >
            <span>{isHindi ? "Jobs देखें" : "View Jobs"}</span>
            <FiArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {jobs.map((job) => (
            <JobCard key={job._id || job.id} job={job} isHindi={isHindi} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeJobsSection;
