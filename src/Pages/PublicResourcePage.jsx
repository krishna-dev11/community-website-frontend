import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiDownload,
  FiHeart,
  FiImage,
  FiSearch,
  FiSend,
  FiX,
  FiZoomIn,
  FiFileText,
  FiExternalLink,
  FiPlus,
  FiCheckCircle,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiPhone,
  FiMail,
  FiAlertTriangle,
  FiFlag,
} from "react-icons/fi";
import { FaYoutube, FaPlay, FaWhatsapp } from "react-icons/fa";
import { apiConnector } from "../services/apiConnector";
import { communityEndpoints, contentEndpoints, opportunityEndpoints } from "../services/apis";
import DocViewer from "../Components/Common/DocViewer";
import { useLanguage } from "../i18n/LanguageContext";

const formatDate = (value) => {
  if (!value) return "Open";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const resourceConfig = {
  notices: {
    title: "Notices & Announcements",
    titleHi: "सूचनाएँ एवं परिपत्र",
    label: "Community Updates",
    labelHi: "आधिकारिक सूचनाएँ",
    description: "Important published updates, circulars, and announcements from the Samaj committee.",
    descriptionHi: "आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन द्वारा प्रकाशित महत्वपूर्ण परिपत्र, सूचनाएँ एवं घोषणाएँ।",
    endpoint: contentEndpoints.NOTICES_API,
    dataKey: "notices",
    empty: "No published notices are available right now.",
    emptyHi: "वर्तमान में कोई प्रकाशित सूचना उपलब्ध नहीं है।",
    accent: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    icon: FiCalendar,
  },
  solutions: {
    title: "Community Solutions",
    titleHi: "समुदाय समाधान",
    label: "Public Solutions",
    labelHi: "प्रकाशित समाधान",
    description: "Real community challenges and their verified resolutions by the Samaj committee.",
    descriptionHi: "समाज के विभिन्न मुद्दों के आधिकारिक एवं प्रमाणित समाधान।",
    endpoint: communityEndpoints.PUBLIC_SOLUTIONS_API,
    dataKey: "solutions",
    empty: "No community solutions have been published yet.",
    emptyHi: "वर्तमान में कोई प्रकाशित समाधान उपलब्ध नहीं है।",
    accent: "border-teal-400/30 bg-teal-500/10 text-teal-200",
    icon: FiFileText,
  },
  publications: {
    title: "Samaj Magazine",
    titleHi: "समाज पत्रिका व स्मारिका",
    label: "Publications",
    labelHi: "प्रकाशन",
    description: "Browse patrika editions and community publications shared by the content team.",
    descriptionHi: "मासिक समाचार पत्रिका, परिचय स्मारिका एवं समाज के डिजिटल प्रकाशन।",
    endpoint: contentEndpoints.PUBLICATIONS_API,
    dataKey: "publications",
    empty: "No published magazines are available right now.",
    emptyHi: "वर्तमान में कोई पत्रिका संस्करण उपलब्ध नहीं है।",
    accent: "border-sky-400/30 bg-sky-500/10 text-sky-200",
    icon: FiBookOpen,
  },
  gallery: {
    title: "Photo & Video Gallery",
    titleHi: "छायाचित्र एवं वीडियो संग्रह",
    label: "Albums",
    labelHi: "एल्बम",
    description: "Community moments, programs, and events collected as public gallery albums.",
    descriptionHi: "समाज के ऐतिहासिक कार्यक्रम, सम्मेलन, प्रतिभा सम्मान एवं सामूहिक गोठ की स्मृतियाँ।",
    endpoint: contentEndpoints.GALLERY_ALBUMS_API,
    dataKey: "albums",
    empty: "No published gallery albums are available right now.",
    emptyHi: "वर्तमान में कोई एल्बम उपलब्ध नहीं है।",
    accent: "border-amber-400/30 bg-amber-500/10 text-amber-100",
    icon: FiImage,
  },
  videos: {
    title: "Samaj Videos",
    titleHi: "समाज वीडियो संग्रह",
    label: "YouTube Videos",
    labelHi: "वीडियो झलकियां",
    description: "Official community video recordings, conventions, and cultural celebrations.",
    descriptionHi: "आदिवासी हल्बा/हल्बी समाज कल्याण समिति के आधिकारिक कार्यक्रम एवं समारोहों के वीडियो।",
    endpoint: contentEndpoints.VIDEOS_API,
    dataKey: "videos",
    empty: "No published videos are available right now.",
    emptyHi: "वर्तमान में कोई वीडियो उपलब्ध नहीं है।",
    accent: "border-red-400/30 bg-red-500/10 text-red-200",
    icon: FaYoutube,
  },
  jobs: {
    title: "Jobs & Careers",
    titleHi: "रोजगार एवं करियर",
    label: "Opportunities",
    labelHi: "अवसर",
    description: "Open career opportunities submitted for Samaj members and moderated by the team.",
    descriptionHi: "समाज के युवाओं के लिए रोजगार एवं करियर के नए अवसर।",
    endpoint: opportunityEndpoints.JOBS_API,
    dataKey: "jobs",
    empty: "No open jobs are available right now.",
    emptyHi: "वर्तमान में कोई रोजगार विज्ञप्ति उपलब्ध नहीं है।",
    accent: "border-violet-400/30 bg-violet-500/10 text-violet-100",
    icon: FiBriefcase,
  },
  scholarships: {
    title: "Scholarships",
    titleHi: "छात्रवृत्ति योजना",
    label: "Education Support",
    labelHi: "शिक्षा संवर्धन",
    description: "Open scholarship schemes with deadlines, eligibility, amount, and available seats.",
    descriptionHi: "मेधावी छात्र-छात्राओं के लिए उच्च शिक्षा छात्रवृत्ति एवं संबल योजनाएँ।",
    endpoint: opportunityEndpoints.SCHOLARSHIPS_API,
    dataKey: "scholarships",
    empty: "No open scholarships are available right now.",
    emptyHi: "वर्तमान में कोई छात्रवृत्ति योजना सक्रिय नहीं है।",
    accent: "border-rose-400/30 bg-rose-500/10 text-rose-100",
    icon: FiBookOpen,
  },
  achievements: {
    title: "Achievements",
    titleHi: "प्रतिभा एवं गौरव",
    label: "Community Pride",
    labelHi: "समाज गौरव",
    description: "Celebrate member achievements across education, business, service, sports, and public life.",
    descriptionHi: "शिक्षा, प्रशासनिक सेवा, खेलकूद व समाज सेवा में उत्कृष्ट उपलब्धि प्राप्त गौरव।",
    endpoint: communityEndpoints.ACHIEVEMENTS_API,
    dataKey: "achievements",
    empty: "No published achievements are available right now.",
    emptyHi: "वर्तमान में कोई उपलब्धि रिकॉर्ड उपलब्ध नहीं है।",
    accent: "border-yellow-400/30 bg-yellow-500/10 text-yellow-100",
    icon: FiAward,
  },
  condolence: {
    title: "Shradhanjali",
    titleHi: "श्रद्धांजलि व पुण्य स्मरण",
    label: "Condolence",
    labelHi: "स्मृति",
    description: "Remember departed community members with dignity, gratitude, and shared prayers.",
    descriptionHi: "दिवंगत समाज बंधुओं के प्रति सादर श्रद्धांजलि एवं पुण्य स्मरण।",
    endpoint: communityEndpoints.SHRADHANJALIS_API,
    dataKey: "shradhanjalis",
    empty: "No published shradhanjali messages are available right now.",
    emptyHi: "वर्तमान में कोई श्रद्धांजलि संदेश उपलब्ध नहीं है।",
    accent: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100",
    icon: FiHeart,
  },
};

const getItemDate = (type, item) => {
  if (type === "scholarships") return item.applicationDeadline;
  if (type === "condolence") return item.dateOfPassing;
  if (type === "gallery") return item.eventDate || item.createdAt;
  if (type === "publications") return item.publishedAt || item.updatedAt;
  if (type === "jobs") return item.expiresAt || item.publishedAt;
  if (type === "solutions") return item.resolvedAt || item.publishedAt || item.createdAt;
  return item.publishedAt || item.createdAt;
};

const getSummary = (type, item) => {
  if (type === "jobs") {
    return [item.companyName, item.location, item.employmentType].filter(Boolean).join(" • ");
  }
  if (type === "scholarships") {
    const amount = item.amount ? `Rs. ${Number(item.amount).toLocaleString("en-IN")}` : null;
    const seats = item.seats ? `${item.approvedCount || 0}/${item.seats} seats` : null;
    return [amount, seats].filter(Boolean).join(" • ");
  }
  if (type === "solutions") {
    return item.category || "Community Solution";
  }
  if (type === "achievements") {
    return [item.achieverName, item.category].filter(Boolean).join(" • ") || "Community achievement";
  }
  if (type === "condolence") {
    return item.dateOfBirth ? `${formatDate(item.dateOfBirth)} - ${formatDate(item.dateOfPassing)}` : "In Loving Memory";
  }
  if (type === "publications") {
    return [item.edition, item.month && item.year ? `${item.month}/${item.year}` : item.year].filter(Boolean).join(" • ");
  }
  if (type === "gallery") {
    return `${item.photoCount || 0} photos`;
  }
  return item.category || "Announcement";
};

const getDescription = (item) => {
  return item.description || item.message || item.eligibility || item.summary || item.solution || "Details will be available soon.";
};

const getRequiredDocument = (scholarship) => {
  const config = scholarship?.requiredDocument || {};
  const name = config.name || scholarship?.requiredDocumentName || "";
  return {
    ...config,
    enabled: Boolean(config.enabled ?? name),
    name,
    instructions: config.instructions || scholarship?.requiredDocumentDescription || "",
  };
};

const getCoverImage = (type, item) => {
  if (type === "videos") return item.thumbnailUrl || (item.videoId ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg` : undefined);
  if (type === "achievements") return item.recipientPhoto?.url || item.image?.url;
  if (type === "condolence") return item.photo?.url;
  if (type === "notices") return item.attachments?.[0]?.url;
  return item.coverImage?.url;
};

const AchievementCard = ({ item, onOpen }) => {
  const imageUrl = getCoverImage("achievements", item);
  const subtitle = [item.organization, item.year].filter(Boolean).join(" · ");

  return (
    <article
      className="group flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 shadow-xl transition-all hover:border-[var(--accent-primary)]/40 hover:shadow-2xl"
      onClick={() => onOpen(item)}
    >
      <div className="aspect-[4/5] w-full overflow-hidden rounded-[1.55rem] bg-white">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.achieverName || item.title}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--surface-elevated)] text-[var(--text-muted)]">
            <FiAward size={42} />
          </div>
        )}
      </div>

      <div className="mt-5 flex min-w-0 flex-1 flex-col">
        <h2 className="line-clamp-1 break-words text-lg font-black leading-tight text-[var(--text-primary)]">
          {item.achieverName || "Community Achiever"}
        </h2>
        <h3 className="mt-2 line-clamp-1 break-words text-base font-black leading-snug text-[var(--accent-primary)]">
          {item.title}
        </h3>
        {subtitle ? (
          <p className="mt-1 line-clamp-1 break-words text-sm font-medium text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
        <p className="mt-4 line-clamp-3 break-words text-sm leading-relaxed text-[var(--text-secondary)]">
          {getDescription(item)}
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
          <span>View Details & Attachments</span>
          <FiArrowRight size={14} />
        </div>
      </div>
    </article>
  );
};

const CondolenceCard = ({ item, onOpen }) => {
  const imageUrl = getCoverImage("condolence", item);
  const lifeDates = item.dateOfBirth
    ? `${formatDate(item.dateOfBirth)} - ${formatDate(item.dateOfPassing)}`
    : formatDate(item.dateOfPassing);

  return (
    <article
      className="group flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 shadow-xl transition-all hover:border-[var(--accent-primary)]/40 hover:shadow-2xl"
      onClick={() => onOpen(item)}
    >
      <div className="aspect-[4/5] w-full overflow-hidden rounded-[1.55rem] bg-white">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.personName || "Shradhanjali photo"}
            className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--surface-elevated)] text-[var(--text-muted)]">
            <FiHeart size={42} />
          </div>
        )}
      </div>

      <div className="mt-5 flex min-w-0 flex-1 flex-col">
        <h2 className="line-clamp-1 break-words text-lg font-black leading-tight text-[var(--text-primary)]">
          {item.personName || "In Loving Memory"}
        </h2>
        <p className="mt-2 line-clamp-1 break-words text-base font-black leading-snug text-[var(--accent-primary)]">
          {lifeDates}
        </p>
        {item.familyInfo ? (
          <p className="mt-1 line-clamp-1 break-words text-sm font-medium text-[var(--text-muted)]">{item.familyInfo}</p>
        ) : null}
        <p className="mt-4 line-clamp-3 break-words text-sm leading-relaxed text-[var(--text-secondary)]">
          {getDescription(item)}
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
          <span>View Details & Attachments</span>
          <FiArrowRight size={14} />
        </div>
      </div>
    </article>
  );
};

const getTitle = (type, item) => {
  if (type === "condolence") return item.personName;
  return item.title || item.achieverName || "Untitled";
};

const EMPLOYMENT_LABELS = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
  OTHER: "Other",
};

const getJobStatus = (job) => {
  if (job.status === "EXPIRED" || (job.expiresAt && new Date(job.expiresAt) <= new Date())) return "Expired";
  if (job.expiresAt && new Date(job.expiresAt).getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000) return "Closing Soon";
  return "Open";
};

const getJobPoster = (job) => {
  const poster = job.postedBy;
  if (!poster) return "";
  return [poster.firstName, poster.lastName].filter(Boolean).join(" ");
};

// ── Helper to sanitize phone for tel/wa links ──────────────────────────────
function cleanPhone(raw) {
  if (!raw) return "";
  return raw.replace(/[^0-9+]/g, "");
}

const CONTACT_LABELS = { PHONE: "Phone", WHATSAPP: "WhatsApp", EMAIL: "Email", ANY: "Any method" };

const JobDetail = ({ job }) => {
  const status = getJobStatus(job);
  const poster = getJobPoster(job);
  const details = [
    ["Salary / Stipend", job.salaryRange],
    ["Experience", job.experienceRequired],
    ["Contact Deadline", job.expiresAt ? formatDate(job.expiresAt) : "Open"],
    ["Posted Date", formatDate(job.publishedAt || job.createdAt)],
  ].filter(([, value]) => value);

  const phone     = job.contactPhone     || "";
  const waNum     = job.contactWhatsApp  || job.contactPhone || "";
  const email     = job.contactEmail     || "";
  const personName = job.contactPersonName || poster || "";
  const phoneClean = cleanPhone(phone);
  const waClean    = cleanPhone(waNum);

  return (
    <div className="space-y-5 min-w-0">
      <div className="grid gap-3 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-[var(--text-primary)]">{value}</p>
          </div>
        ))}
      </div>

      {job.skills?.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span key={skill} className="max-w-full break-words rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)]">{skill}</span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Job Description</h3>
        <p className="whitespace-pre-line break-words text-sm leading-relaxed text-[var(--text-primary)]">{job.description}</p>
      </section>

      {/* ── Job Provider Contact ── */}
      {(personName || phone || email || waNum) && (
        <section className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">Job Provider / Contact</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {personName && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Contact Person</p>
                <p className="mt-0.5 break-words text-sm font-semibold text-[var(--text-primary)]">{personName}</p>
              </div>
            )}
            {job.companyName && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Organization</p>
                <p className="mt-0.5 break-words text-sm font-semibold text-[var(--text-primary)]">{job.companyName}</p>
              </div>
            )}
            {phone && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Phone</p>
                <p className="mt-0.5 break-words text-sm font-semibold text-[var(--text-primary)]">{phone}</p>
              </div>
            )}
            {email && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Email</p>
                <p className="mt-0.5 break-words text-sm font-semibold text-[var(--text-primary)]">{email}</p>
              </div>
            )}
            {waNum && waNum !== phone && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">WhatsApp</p>
                <p className="mt-0.5 break-words text-sm font-semibold text-[var(--text-primary)]">{waNum}</p>
              </div>
            )}
            {job.preferredContactMethod && job.preferredContactMethod !== "ANY" && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Preferred Contact</p>
                <p className="mt-0.5 text-sm font-semibold text-violet-300">{CONTACT_LABELS[job.preferredContactMethod]}</p>
              </div>
            )}
          </div>
          {job.additionalContactNote && (
            <p className="text-xs text-[var(--text-secondary)] break-words italic">{job.additionalContactNote}</p>
          )}

          {/* Contact action buttons */}
          {status !== "Expired" && (
            <div className="flex flex-wrap gap-2 pt-1">
              {phoneClean && (
                <a
                  href={`tel:${phoneClean.startsWith("+") ? phoneClean : `+91${phoneClean}`}`}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                >
                  <FiPhone size={12} /> Call
                </a>
              )}
              {waClean && (
                <a
                  href={`https://wa.me/${waClean.startsWith("+") ? waClean.replace("+", "") : `91${waClean}`}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-bold text-green-300 hover:bg-green-500/20 transition-colors"
                >
                  <FaWhatsapp size={12} /> WhatsApp
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition-colors"
                >
                  <FiMail size={12} /> Email
                </a>
              )}
            </div>
          )}

          {/* Safety notice */}
          <p className="flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[10px] text-amber-300/80">
            <FiAlertTriangle size={12} className="mt-0.5 shrink-0" />
            Please verify job and employer details independently before sharing sensitive personal information or making payments. This listing has been reviewed by Samaj Admin but is not a guarantee of employment.
          </p>
        </section>
      )}

      {status === "Expired" && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400">This job listing has expired and is no longer active.</p>
      )}
    </div>
  );
};

const JobCard = ({ job, onDetails }) => {
  const status = getJobStatus(job);
  const poster = getJobPoster(job);
  const statusClass = status === "Expired"
    ? "border-red-500/30 bg-red-500/10 text-red-400"
    : status === "Closing Soon"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";

  const details = [
    ["Salary / Stipend", job.salaryRange, FiDollarSign],
    ["Experience", job.experienceRequired, FiClock],
    ["Deadline", job.expiresAt ? formatDate(job.expiresAt) : "Open", FiCalendar],
  ].filter(([, value]) => value);

  const hasContact = job.contactPhone || job.contactEmail || job.contactWhatsApp;

  return (
    <article className="group flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-lg">
      <div className="min-w-0">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 break-words text-lg font-black leading-snug text-[var(--text-primary)] group-hover:text-violet-400">{job.title}</h2>
            <p className="mt-1 break-words text-sm font-semibold text-[var(--text-secondary)]">{job.companyName}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>{status}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[var(--text-secondary)]">
          {job.location && <span className="max-w-full break-words rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-2 py-1">📍 {job.location}</span>}
          {job.employmentType && <span className="max-w-full break-words rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-2 py-1">💼 {EMPLOYMENT_LABELS[job.employmentType] || job.employmentType}</span>}
          {hasContact && <span className="max-w-full break-words rounded-lg border border-violet-500/25 bg-violet-500/5 px-2 py-1 text-violet-300">📞 Contact available</span>}
        </div>

        {job.description && <p className="mt-4 line-clamp-4 break-words text-sm leading-relaxed text-[var(--text-secondary)]">{job.description}</p>}

        {details.length > 0 && (
          <div className="mt-4 grid min-w-0 gap-2 sm:grid-cols-3">
            {details.map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
                <p className="mt-1 break-words text-xs font-semibold text-[var(--text-primary)]">{value}</p>
              </div>
            ))}
          </div>
        )}

        {job.skills?.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Required Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.slice(0, 6).map((skill) => <span key={skill} className="max-w-full break-words rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2.5 py-1 text-[10px] text-[var(--text-secondary)]">{skill}</span>)}
              {job.skills.length > 6 && <span className="self-center text-[10px] text-[var(--text-muted)]">+{job.skills.length - 6} more</span>}
            </div>
          </div>
        )}

        {poster && <p className="mt-3 break-words text-[10px] text-[var(--text-muted)]">Posted by {poster}</p>}
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-4 sm:flex-row">
        <button type="button" onClick={onDetails} className="btn-primary !w-full !py-2.5 !px-4 !text-xs sm:flex-1">View Details &amp; Contact</button>
      </div>
    </article>
  );
};

const ScholarshipDetail = ({ scholarship }) => (
  <div className="space-y-5 min-w-0">
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        ["Amount", scholarship.amount ? `Rs. ${Number(scholarship.amount).toLocaleString("en-IN")}` : "Not disclosed"],
        ["Available Seats", scholarship.seats],
        ["Application Deadline", formatDate(scholarship.applicationDeadline)],
        ["Published Date", formatDate(scholarship.publishedAt || scholarship.createdAt)],
      ].filter(([, value]) => value).map(([label, value]) => (
        <div key={label} className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
          <p className="mt-1 break-words text-sm font-semibold text-[var(--text-primary)]">{value}</p>
        </div>
      ))}
    </div>
    <section>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Full Description</h3>
      <p className="whitespace-pre-line break-words text-sm leading-relaxed text-[var(--text-primary)]">{scholarship.description}</p>
    </section>
    {scholarship.eligibility && (
      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Eligibility</h3>
        <p className="whitespace-pre-line break-words text-sm leading-relaxed text-[var(--text-primary)]">{scholarship.eligibility}</p>
      </section>
    )}
    {scholarship.requiredDocument?.enabled && (
      <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-500">Required Document</h3>
        <p className="break-words text-sm font-semibold text-[var(--text-primary)]">{scholarship.requiredDocument.name}</p>
        {scholarship.requiredDocument.instructions && <p className="mt-1 whitespace-pre-line break-words text-xs text-[var(--text-secondary)]">{scholarship.requiredDocument.instructions}</p>}
        {scholarship.requiredDocument.file?.url && <a href={scholarship.requiredDocument.file.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-bold text-[var(--accent-primary)] hover:underline">View reference document</a>}
      </section>
    )}
  </div>
);

const PublicResourcePage = ({ type }) => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { isHindi } = useLanguage();
  const rawConfig = resourceConfig[type] || resourceConfig.notices;
  const config = {
    ...rawConfig,
    title: isHindi ? rawConfig.titleHi || rawConfig.title : rawConfig.title,
    label: isHindi ? rawConfig.labelHi || rawConfig.label : rawConfig.label,
    description: isHindi ? rawConfig.descriptionHi || rawConfig.description : rawConfig.description,
    empty: isHindi ? rawConfig.emptyHi || rawConfig.empty : rawConfig.empty,
  };
  const Icon = config.icon;
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals & Active targets
  const [selectedItem, setSelectedItem] = useState(null); // Detail view modal
  const [viewingVideo, setViewingVideo] = useState(null);
  const [applicationTarget, setApplicationTarget] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    applicantName: "",
    educationDetails: "",
    incomeDetails: "",
    statement: "",
  });
  const [applicationDocument, setApplicationDocument] = useState(null);
  const [myScholarshipApplications, setMyScholarshipApplications] = useState([]);
  const [downloadingPublicationId, setDownloadingPublicationId] = useState(null);

  // Post a Job Modal
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [submittingJob, setSubmittingJob] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    companyName: "",
    description: "",
    location: "",
    employmentType: "FULL_TIME",
    experienceRequired: "",
    salaryRange: "",
    skills: "",
    contactPersonName: "",
    contactPhone: "",
    contactEmail: "",
    contactWhatsApp: "",
    preferredContactMethod: "ANY",
    additionalContactNote: "",
    expiresAt: "",
  });

  // Report Job state
  const [reportTarget, setReportTarget] = useState(null);
  const [reportForm, setReportForm] = useState({ reason: "", description: "" });
  const [submittingReport, setSubmittingReport] = useState(false);

  // Gallery album expansion & Lightbox (Requirement 20)
  const [openAlbum, setOpenAlbum] = useState(null);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const params = useMemo(() => {
    const next = { page: 1, limit: type === "gallery" ? 12 : 10 };
    if (activeQuery.trim()) next.q = activeQuery.trim();
    return next;
  }, [activeQuery, type]);

  useEffect(() => {
    let mounted = true;

    const loadResources = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiConnector("GET", config.endpoint, null, null, params);
        if (!mounted) return;
        setItems(response?.data?.data?.[config.dataKey] || []);
        setMeta(response?.data?.meta || null);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Could not load this section.");
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadResources();
    return () => {
      mounted = false;
    };
  }, [config.dataKey, config.endpoint, params]);

  useEffect(() => {
    if (type !== "scholarships" || !token) return undefined;
    let mounted = true;
    apiConnector("GET", opportunityEndpoints.MY_SCHOLARSHIP_APPLICATIONS_API, null, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
      .then((response) => { if (mounted) setMyScholarshipApplications(response?.data?.data?.applications || []); })
      .catch(() => { if (mounted) setMyScholarshipApplications([]); });
    return () => { mounted = false; };
  }, [type, token]);

  useEffect(() => {
    const modalOpen = Boolean(selectedItem || applicationTarget || viewingVideo || openAlbum);
    if (!modalOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selectedItem, applicationTarget, viewingVideo, openAlbum]);

  const openGalleryAlbum = useCallback(async (album) => {
    setOpenAlbum({ ...album, photos: [] });
    setAlbumLoading(true);
    try {
      const response = await apiConnector("GET", contentEndpoints.GALLERY_PHOTOS_API(album._id), null, null, { limit: 50 });
      const photos = response?.data?.data?.photos || [];
      setOpenAlbum({ ...album, photos });
    } catch {
      setOpenAlbum({ ...album, photos: [] });
    } finally {
      setAlbumLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (lightboxIndex === null) return;
      const count = openAlbum?.photos?.length || 0;
      if (event.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % count);
      if (event.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + count) % count);
      if (event.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, openAlbum]);

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveQuery(query);
  };

  const handlePublicationRead = (item) => {
    if (type !== "publications" || !item?._id) return;
    if (!item.file?.url) {
      toast.error("Publication PDF is not available.");
      return;
    }
    const pdfUrl = contentEndpoints.PUBLICATION_VIEW_FILE_API(item._id);
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const handlePublicationDownload = async (item) => {
    if (type !== "publications" || !item?._id || downloadingPublicationId) return;
    if (!item.file?.url) {
      toast.error("Publication PDF is not available.");
      return;
    }
    setDownloadingPublicationId(item._id);
    try {
      const response = await fetch(contentEndpoints.PUBLICATION_DOWNLOAD_FILE_API(item._id));
      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      if (!response.ok || !contentType.includes("application/pdf")) {
        let errMessage = "Unable to download publication PDF.";
        try {
          const errData = await response.json();
          if (errData?.message) errMessage = errData.message;
        } catch {}
        throw new Error(response.status === 404 ? "Publication file not found." : errMessage);
      }
      const blob = await response.blob();
      if (blob.size < 5 || (blob.type && !blob.type.includes("application/pdf") && !blob.type.includes("application/octet-stream"))) {
        throw new Error("Publication file is not a valid PDF.");
      }
      const cleanTitle = String(item.title || "Samaj_Patrika")
        .trim()
        .replace(/[\\/:*?"<>|]+/g, "-")
        .slice(0, 100) || "Samaj_Patrika";
      const objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${cleanTitle}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      await apiConnector("POST", contentEndpoints.PUBLICATION_DOWNLOAD_API(item._id)).catch(() => {});
      toast.success("Publication PDF downloaded");
    } catch (error) {
      toast.error(error.message || "Unable to download publication PDF.");
    } finally {
      setDownloadingPublicationId(null);
    }
  };

  const openApplication = (item) => {
    if (!token) {
      toast.error("Please login to apply.");
      navigate("/login");
      return;
    }

    const existingApplication = myScholarshipApplications.find((application) => application.scholarship?._id === item._id || application.scholarship === item._id);
    if (type === "scholarships" && existingApplication) {
      toast(existingApplication.status === "SUBMITTED" ? "Application under review" : `Application ${existingApplication.status.toLowerCase()}`);
      return;
    }
    setApplicationTarget({ ...item, requiredDocument: getRequiredDocument(item) });
    setApplicationForm({
      coverLetter: "",
      applicantName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      educationDetails: "",
      incomeDetails: "",
      statement: "",
    });
    setApplicationDocument(null);
  };

  const closeApplication = () => {
    if (!applying) setApplicationTarget(null);
  };

  const handleApplicationChange = (field, value) => {
    setApplicationForm((current) => ({ ...current, [field]: value }));
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    if (!applicationTarget?._id) return;

    const isScholarship = type === "scholarships";
        if (isScholarship && applicationTarget.requiredDocument?.enabled && !applicationDocument) {
          toast.error("Please upload the required document before submitting your application.");
          return;
        }
    if (isScholarship && (!applicationForm.applicantName || !applicationForm.statement)) {
      toast.error("Applicant name and statement are required.");
      return;
    }

    const endpoint = isScholarship
      ? opportunityEndpoints.APPLY_SCHOLARSHIP_API(applicationTarget._id)
      : opportunityEndpoints.APPLY_JOB_API(applicationTarget._id);

    const body = isScholarship
      ? (() => {
          const formData = new FormData();
          formData.append("applicantName", applicationForm.applicantName);
          formData.append("educationDetails", applicationForm.educationDetails);
          formData.append("incomeDetails", applicationForm.incomeDetails);
          formData.append("statement", applicationForm.statement);
          if (applicationDocument) formData.append("documents", applicationDocument);
          return formData;
        })()
      : {
          coverLetter: applicationForm.coverLetter,
        };

    setApplying(true);
    const toastId = toast.loading("Submitting application...");
    try {
      await apiConnector("POST", endpoint, body, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success(isScholarship ? "Scholarship application submitted." : "Job application submitted.");
      setApplicationTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not submit application.");
    } finally {
      toast.dismiss(toastId);
      setApplying(false);
    }
  };

  const handleJobFormChange = (field, value) => {
    setJobForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitJobOpportunity = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to post a job opportunity.");
      navigate("/login");
      return;
    }
    if (!jobForm.title || !jobForm.companyName || !jobForm.description) {
      toast.error("Title, company name, and description are required.");
      return;
    }
    if (!jobForm.contactPersonName?.trim()) {
      toast.error("Contact person name is required.");
      return;
    }
    if (!jobForm.contactPhone?.trim() && !jobForm.contactEmail?.trim()) {
      toast.error("Please provide at least a phone number or email for job seekers to contact you.");
      return;
    }
    if (!declarationAccepted) {
      toast.error("Please accept the declaration before submitting.");
      return;
    }

    setSubmittingJob(true);
    const toastId = toast.loading("Submitting job for review...");
    try {
      const payload = {
        ...jobForm,
        skills: jobForm.skills ? jobForm.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        declarationAccepted: true,
      };
      await apiConnector("POST", opportunityEndpoints.JOBS_API, payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success("Job submitted! It will be visible after Samaj Admin approval.");
      setIsPostingJob(false);
      setDeclarationAccepted(false);
      setJobForm({
        title: "", companyName: "", description: "", location: "",
        employmentType: "FULL_TIME", experienceRequired: "", salaryRange: "",
        skills: "", contactPersonName: "", contactPhone: "", contactEmail: "",
        contactWhatsApp: "", preferredContactMethod: "ANY", additionalContactNote: "",
        expiresAt: "",
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit job.");
    } finally {
      toast.dismiss(toastId);
      setSubmittingJob(false);
    }
  };

  const submitJobReport = async (e) => {
    e.preventDefault();
    if (!reportTarget?._id || !reportForm.reason) return;
    setSubmittingReport(true);
    const toastId = toast.loading("Submitting report...");
    try {
      await apiConnector("POST", opportunityEndpoints.REPORT_JOB_API(reportTarget._id), reportForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success("Report submitted. The admin team will review it.");
      setReportTarget(null);
      setReportForm({ reason: "", description: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not submit report.");
    } finally {
      toast.dismiss(toastId);
      setSubmittingReport(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 pb-16 pt-28 text-[var(--text-primary)] sm:px-6 lg:px-8 transition-colors duration-300">
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-8 border-b border-[var(--border-subtle)] pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="eyebrow-badge">
              <Icon size={14} />
              <span>{config.label}</span>
            </div>

            {/* Post a Job & My Job Posts buttons for members on Jobs page */}
            {type === "jobs" && (
              <div className="flex flex-wrap items-center gap-2">
                {token && (
                  <button
                    onClick={() => navigate("/dashboard/my-jobs")}
                    className="btn-secondary !py-2 !px-4 !text-xs uppercase tracking-wider font-bold cursor-pointer"
                  >
                    <FiBriefcase size={14} />
                    <span>{isHindi ? "मेरे जॉब पोस्ट" : "My Job Posts"}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!token) {
                      toast.error("Please login to post a job.");
                      navigate("/login");
                      return;
                    }
                    setIsPostingJob(true);
                  }}
                  className="btn-primary !py-2 !px-4 !text-xs uppercase tracking-wider font-bold cursor-pointer"
                >
                  <FiPlus size={14} />
                  <span>{isHindi ? "नौकरी पोस्ट करें" : "Post a Job Opening"}</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <h1 className="heading-hero text-[var(--text-primary)] mb-2">
                {config.title}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)] font-normal">
                {config.description}
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex min-w-0 items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
              <FiSearch className="ml-2 shrink-0 text-[var(--text-muted)]" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={isHindi ? "कीवर्ड से खोजें..." : "Search keywords..."}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] border-none shadow-none focus:ring-0"
              />
              <button type="submit" className="btn-primary !py-2 !px-4 !text-xs uppercase tracking-wider font-bold">
                {isHindi ? "खोजें" : "Search"}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {type === "scholarships" && token && myScholarshipApplications.length > 0 && (
          <section className="mb-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-[var(--text-primary)]">My Scholarship Applications</h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Track submitted documents and review decisions.</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {myScholarshipApplications.map((application) => (
                <div key={application._id} className="min-w-0 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 break-words text-sm font-bold text-[var(--text-primary)]">{application.scholarship?.title || "Scholarship"}</h3>
                    <span className="shrink-0 rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-primary)]">{application.status === "SUBMITTED" ? "PENDING" : application.status}</span>
                  </div>
                  <p className="mt-2 text-[11px] text-[var(--text-muted)]">Submitted: {application.createdAt ? new Date(application.createdAt).toLocaleDateString("en-IN") : "Not available"}</p>
                  {application.requiredDocument?.name && <p className="mt-1 break-words text-xs text-[var(--text-secondary)]">Document: {application.requiredDocument.name} ✓</p>}
                  {application.reviewReason && <p className="mt-2 break-words rounded-lg bg-red-500/10 px-2.5 py-2 text-xs text-red-400">Review note: {application.reviewReason}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="ka-card p-12 text-center text-[var(--text-muted)]">
            {config.empty}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              type === "jobs" ? (
                <JobCard
                  key={item._id}
                  job={item}
                  onDetails={() => setSelectedItem(item)}
                />
              ) : type === "achievements" ? (
                <AchievementCard
                  key={item._id}
                  item={item}
                  onOpen={setSelectedItem}
                />
              ) : type === "condolence" ? (
                <CondolenceCard
                  key={item._id}
                  item={item}
                  onOpen={setSelectedItem}
                />
              ) : <article
                key={item._id}
                className="ka-card flex min-w-0 flex-col justify-between overflow-hidden p-0 group hover:border-[var(--accent-primary)]/40 transition-all cursor-pointer"
                onClick={() => {
                  if (type === "gallery") {
                    openGalleryAlbum(item);
                  } else if (type === "publications") {
                    if (item.file?.url) {
                      window.open(contentEndpoints.PUBLICATION_VIEW_FILE_API(item._id), "_blank", "noopener,noreferrer");
                    } else {
                      toast.error("Publication PDF is not available.");
                    }
                  } else {
                    setSelectedItem(item);
                  }
                }}
              >
                {["gallery", "publications", "achievements", "condolence", "notices"].includes(type) ? (
                  <div className={`aspect-[16/9] overflow-hidden bg-[var(--surface-elevated)] ${type === "achievements" ? "flex items-center justify-center p-3 sm:p-4" : ""}`}>
                    {getCoverImage(type, item) ? (
                      <img
                        src={getCoverImage(type, item)}
                        alt={getTitle(type, item)}
                        className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${type === "achievements" ? "object-contain" : "object-cover"}`}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                        <Icon size={36} />
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
                      <span>{formatDate(getItemDate(type, item))}</span>
                      <span className="rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-semibold text-[var(--accent-primary)]">
                        {getSummary(type, item)}
                      </span>
                    </div>

                    <h2 className="line-clamp-2 break-words text-lg font-bold leading-snug tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                      {getTitle(type, item)}
                    </h2>
                    <p className="mt-2 line-clamp-3 break-words text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                      {getDescription(item)}
                    </p>

                    {item.skills?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="rounded-full bg-[var(--surface-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
                    {type === "publications" ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        {item.file?.url ? (
                          <a
                            href={contentEndpoints.PUBLICATION_VIEW_FILE_API(item._id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="btn-secondary !py-2 !px-4 !text-xs w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
                          >
                            <FiFileText size={14} />
                            <span>Read Online</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.error("Publication PDF is not available.");
                            }}
                            className="btn-secondary !py-2 !px-4 !text-xs w-full sm:w-auto opacity-60 cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                          >
                            <FiFileText size={14} />
                            <span>PDF unavailable</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublicationDownload(item);
                          }}
                          disabled={downloadingPublicationId === item._id || !item.file?.url}
                          className="btn-primary !py-2.5 !px-5 !text-xs w-full sm:flex-1 inline-flex items-center justify-center gap-1.5"
                        >
                          <FiDownload size={15} />
                          <span>{downloadingPublicationId === item._id ? "Downloading..." : "Download Edition"}</span>
                        </button>
                      </div>
                    ) : type === "gallery" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGalleryAlbum(item);
                        }}
                        className="btn-primary !py-2.5 !px-5 !text-xs w-full"
                      >
                        <FiImage size={15} />
                        <span>View {item.photoCount || 0} Photos</span>
                      </button>
                    ) : type === "videos" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingVideo(item);
                          }}
                          className="btn-primary !py-2.5 !px-4 !text-xs flex-1 inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FaPlay size={11} />
                          <span>Play Video</span>
                        </button>
                        <a
                          href={item.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="btn-secondary !py-2.5 !px-3 !text-xs text-red-500 inline-flex items-center gap-1.5"
                          title="Watch on YouTube"
                        >
                          <FaYoutube size={14} />
                          <span className="hidden sm:inline">YouTube</span>
                        </a>
                      </div>
                    ) : type === "jobs" || type === "scholarships" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openApplication(item);
                          }}
                          disabled={type === "scholarships" && myScholarshipApplications.some((application) => application.scholarship?._id === item._id || application.scholarship === item._id)}
                          className="btn-primary !py-2.5 !px-4 !text-xs flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FiSend size={14} />
                          <span>{type === "scholarships" && myScholarshipApplications.some((application) => application.scholarship?._id === item._id || application.scholarship === item._id) ? "Already Applied" : "Apply"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                          className="btn-secondary !py-2.5 !px-3 !text-xs"
                        >
                          Details
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] group-hover:underline">
                        <span>View Details & Attachments</span>
                        <FiArrowRight size={14} />
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {meta?.total !== undefined && !loading ? (
          <p className="mt-8 text-xs font-medium text-[var(--text-muted)]">
            Showing {items.length} of {meta.total} records
          </p>
        ) : null}
      </section>

      {/* ================= ITEM DETAIL MODAL (Requirement 18, 8, 12, 13) ================= */}
{selectedItem && (
  <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md">
    {/* Add flex flex-col and max-h-[92vh] with overflow-hidden on the card container */}
    <div className="flex flex-col max-h-[92vh] w-full max-w-3xl ka-card p-0 shadow-2xl border border-[var(--border-strong)] overflow-hidden">
      
      {/* 1. Fixed Header */}
      <div className="p-6 sm:p-8 pb-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4 shrink-0">
        <div className="min-w-0">
          <span className="eyebrow-badge mb-2">{config.label}</span>
          <h2 className="mt-1 break-words text-2xl font-bold leading-snug text-[var(--text-primary)]">
            {getTitle(type, selectedItem)}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 break-words text-xs text-[var(--text-muted)]">
            <span>📅 {formatDate(getItemDate(type, selectedItem))}</span>
            {selectedItem.category && <span>• 🏷️ {selectedItem.category}</span>}
            {selectedItem.location && <span>• 📍 {selectedItem.location}</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelectedItem(null)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* 2. Scrollable Body Content (Yeh scroll karega!) */}
      <div className="p-6 sm:p-8 overflow-y-auto min-w-0 space-y-6 break-words text-sm leading-relaxed text-[var(--text-secondary)] flex-1">
        {type === "jobs" && <JobDetail job={selectedItem} />}
        {type === "scholarships" && <ScholarshipDetail scholarship={selectedItem} />}

        {/* Solutions / Description / Attachments code jo tera pehle tha... */}
        {type === "solutions" && (
          <>
            {/* ... same solution content ... */}
          </>
        )}

        {type !== "solutions" && type !== "jobs" && type !== "scholarships" && (
          <div className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-primary)]">
            {getDescription(selectedItem)}
          </div>
        )}

        {/* Attachments & other details */}
        {selectedItem.attachments && selectedItem.attachments.length > 0 && (
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-3">
              Attached Documents & Media
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* map items */}
            </div>
          </div>
        )}
      </div>

      {/* 3. Fixed Footer */}
      <div className="p-4 sm:p-6 pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 shrink-0 bg-[var(--surface)]">
        {/* Report button — only for logged-in members on published jobs */}
        {type === "jobs" && token && selectedItem && (
          <button
            type="button"
            onClick={() => { setReportTarget(selectedItem); setSelectedItem(null); }}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <FiFlag size={10} /> Report Job
          </button>
        )}
        <button
          type="button"
          onClick={() => setSelectedItem(null)}
          className="btn-secondary !py-2.5 !px-6 !text-xs cursor-pointer ml-auto"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}

      {/* ================= POST A JOB MODAL ================= */}
      {isPostingJob && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md">
          <form
            onSubmit={submitJobOpportunity}
            className="flex flex-col max-h-[92vh] w-full max-w-2xl ka-card p-0 shadow-2xl border border-[var(--border-strong)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 pb-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4 shrink-0">
              <div>
                <p className="eyebrow-badge mb-2">Community Job Board</p>
                <h2 className="text-2xl font-bold leading-snug text-[var(--text-primary)]">Post a Job Opening</h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Your posting will be reviewed by Samaj Admin before going live.</p>
              </div>
              <button type="button" onClick={() => setIsPostingJob(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                <FiX size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">
              {/* Job Information */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">Job Information</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Job Title *</span>
                  <input required value={jobForm.title} onChange={(e) => handleJobFormChange("title", e.target.value)} className="ka-input" placeholder="e.g. Senior Frontend Developer" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Company / Organization *</span>
                  <input required value={jobForm.companyName} onChange={(e) => handleJobFormChange("companyName", e.target.value)} className="ka-input" placeholder="e.g. ABC Technologies Pvt. Ltd." />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Employment Type</span>
                  <select value={jobForm.employmentType} onChange={(e) => handleJobFormChange("employmentType", e.target.value)} className="ka-input">
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Experience Required</span>
                  <input value={jobForm.experienceRequired} onChange={(e) => handleJobFormChange("experienceRequired", e.target.value)} className="ka-input" placeholder="e.g. 2+ years" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Location</span>
                  <input value={jobForm.location} onChange={(e) => handleJobFormChange("location", e.target.value)} className="ka-input" placeholder="e.g. Indore, MP" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Salary / CTC</span>
                  <input value={jobForm.salaryRange} onChange={(e) => handleJobFormChange("salaryRange", e.target.value)} className="ka-input" placeholder="e.g. 4–8 LPA" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Listing Expires At</span>
                  <input type="date" value={jobForm.expiresAt} onChange={(e) => handleJobFormChange("expiresAt", e.target.value)} className="ka-input" />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Required Skills (comma separated)</span>
                <input value={jobForm.skills} onChange={(e) => handleJobFormChange("skills", e.target.value)} className="ka-input" placeholder="React, Node.js, MongoDB" />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Job Description *</span>
                <textarea required rows={5} value={jobForm.description} onChange={(e) => handleJobFormChange("description", e.target.value)} className="ka-input resize-y" placeholder="Describe the role, responsibilities, and requirements." />
              </label>

              {/* Job Provider Contact */}
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Job Provider / Contact Details</p>
                <p className="text-[10px] text-[var(--text-muted)]">These details will be shown to job seekers on the public listing after Admin approval. Only provide information you are comfortable sharing publicly.</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Contact Person Name *</span>
                    <input required value={jobForm.contactPersonName} onChange={(e) => handleJobFormChange("contactPersonName", e.target.value)} className="ka-input" placeholder="e.g. Rahul Tarnekar" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Phone Number *</span>
                    <input type="tel" value={jobForm.contactPhone} onChange={(e) => handleJobFormChange("contactPhone", e.target.value)} className="ka-input" placeholder="9876543210" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Email Address</span>
                    <input type="email" value={jobForm.contactEmail} onChange={(e) => handleJobFormChange("contactEmail", e.target.value)} className="ka-input" placeholder="hr@example.com" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">WhatsApp Number</span>
                    <input type="tel" value={jobForm.contactWhatsApp} onChange={(e) => handleJobFormChange("contactWhatsApp", e.target.value)} className="ka-input" placeholder="Same as phone or different" />
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Preferred Contact Method</span>
                  <select value={jobForm.preferredContactMethod} onChange={(e) => handleJobFormChange("preferredContactMethod", e.target.value)} className="ka-input">
                    <option value="ANY">Any method</option>
                    <option value="PHONE">Phone call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Additional Instructions (optional)</span>
                  <textarea rows={2} value={jobForm.additionalContactNote} onChange={(e) => handleJobFormChange("additionalContactNote", e.target.value)} className="ka-input resize-y" placeholder="e.g. Call between 10am–6pm only" />
                </label>
              </div>

              {/* Declaration */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent-primary)]"
                />
                <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  I confirm that the job information and contact details provided are accurate to the best of my knowledge, and I understand that the posting will be reviewed by the Samaj Admin before publication.
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="p-5 sm:p-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsPostingJob(false)} className="btn-secondary !py-2.5 !px-5 !text-xs cursor-pointer">Cancel</button>
              <button type="submit" disabled={submittingJob} className="btn-primary !py-2.5 !px-6 !text-xs cursor-pointer disabled:opacity-50">
                {submittingJob ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= GALLERY ALBUM PHOTO VIEWER (Requirement 20) ================= */}
      {openAlbum && (
        <div className="fixed inset-0 z-[1100] flex flex-col bg-[var(--bg)] overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg)]/90 backdrop-blur-md px-4 py-3">
            <button
              onClick={() => { setOpenAlbum(null); setLightboxIndex(null); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <FiArrowLeft size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold text-[var(--text-primary)]">{openAlbum.title}</h2>
              <p className="text-xs text-[var(--text-muted)]">{openAlbum.photos?.length || 0} photos (Max 10 per album)</p>
            </div>
          </div>

          <div className="p-4 pb-16">
            {albumLoading ? (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-2xl bg-[var(--surface)]" />
                ))}
              </div>
            ) : openAlbum.photos?.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center text-[var(--text-muted)]">
                <FiImage size={48} />
                <p className="text-sm">No photos in this album yet.</p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {openAlbum.photos.map((photo, index) => (
                  <button
                    key={photo._id || index}
                    onClick={() => setLightboxIndex(index)}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  >
                    <img
                      src={photo.url || photo.image?.url}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                      <FiZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && openAlbum?.photos?.length > 0 && (() => {
        const photos = openAlbum.photos;
        const photo = photos[lightboxIndex];
        return (
          <div
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/95 px-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              onClick={() => setLightboxIndex(null)}
            >
              <FiX size={20} />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              onClick={(event) => { event.stopPropagation(); setLightboxIndex((i) => (i - 1 + photos.length) % photos.length); }}
            >
              <FiArrowLeft size={20} />
            </button>
            <img
              src={photo.url || photo.image?.url}
              alt={photo.caption || `Photo ${lightboxIndex + 1}`}
              className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              onClick={(event) => { event.stopPropagation(); setLightboxIndex((i) => (i + 1) % photos.length); }}
            >
              <FiArrowRight size={20} />
            </button>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-xs text-white">
              {lightboxIndex + 1} / {photos.length}{photo.caption ? ` — ${photo.caption}` : ""}
            </p>
          </div>
        );
      })()}

      {/* ================= SCHOLARSHIP APPLICATION MODAL (jobs no longer use this) ================= */}
      {applicationTarget && type === "scholarships" ? (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden bg-black/75 px-3 py-4 backdrop-blur-md sm:px-4 sm:py-6">
          <form
            onSubmit={submitApplication}
            className="ka-card flex max-h-[calc(100dvh-20px)] min-h-0 w-full max-w-2xl flex-col overflow-hidden border border-[var(--border-strong)] p-0 shadow-2xl sm:max-h-[calc(100dvh-32px)]"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 sm:p-8">
              <div>
                <p className="eyebrow-badge mb-2">Scholarship Application</p>
                <h2 className="mt-1 text-2xl font-bold leading-snug text-[var(--text-primary)]">{applicationTarget.title}</h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{getSummary(type, applicationTarget)}</p>
              </div>
              <button type="button" onClick={closeApplication} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                <FiX size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 custom-scrollbar [-webkit-overflow-scrolling:touch] sm:p-8">
              <div className="grid gap-4">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Applicant Name</span>
                  <input value={applicationForm.applicantName} onChange={(event) => handleApplicationChange("applicantName", event.target.value)} className="ka-input" placeholder="Full name" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Education Details</span>
                  <textarea value={applicationForm.educationDetails} onChange={(event) => handleApplicationChange("educationDetails", event.target.value)} rows={3} className="ka-input resize-y" placeholder="Class, course, college, marks" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Income Details</span>
                  <textarea value={applicationForm.incomeDetails} onChange={(event) => handleApplicationChange("incomeDetails", event.target.value)} rows={3} className="ka-input resize-y" placeholder="Family income or financial background" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Statement</span>
                  <textarea value={applicationForm.statement} onChange={(event) => handleApplicationChange("statement", event.target.value)} rows={4} className="ka-input resize-y" placeholder="Why are you applying?" />
                </label>
                {getRequiredDocument(applicationTarget).enabled && (
                  <div className="grid gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                    <div className="flex items-start gap-3">
                      <FiFileText className="mt-0.5 shrink-0 text-emerald-500" size={18} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Required Document *</p>
                        <p className="mt-1 break-words text-sm font-semibold text-emerald-500">{getRequiredDocument(applicationTarget).name}</p>
                        {getRequiredDocument(applicationTarget).instructions && <p className="mt-1 whitespace-pre-line break-words text-xs text-[var(--text-secondary)]">{getRequiredDocument(applicationTarget).instructions}</p>}
                        {applicationTarget.requiredDocument.file?.url && <a href={applicationTarget.requiredDocument.file.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-bold text-[var(--accent-primary)] hover:underline">View reference document</a>}
                      </div>
                    </div>
                    <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => {
                      const file = event.target.files?.[0];
                      const allowed = ["application/pdf", "image/jpeg", "image/png"];
                      if (file && (!allowed.includes(file.type) || file.size > 15 * 1024 * 1024)) {
                        toast.error("Please select a PDF, JPG, or PNG file up to 15 MB."); event.target.value = ""; setApplicationDocument(null); return;
                      }
                      setApplicationDocument(file || null);
                    }} className="ka-input !py-2 text-xs" required />
                    {applicationDocument && <p className="break-words text-xs text-emerald-500">Selected: {applicationDocument.name}</p>}
                  </div>
                )}
                <button type="submit" disabled={applying} className="btn-primary w-full">
                  <FiSend size={16} />
                  <span>{applying ? "Submitting..." : "Submit Application"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {/* ================= REPORT JOB MODAL ================= */}
      {reportTarget && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md">
          <form onSubmit={submitJobReport} className="w-full max-w-md ka-card p-6 sm:p-8 shadow-2xl border border-[var(--border-strong)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow-badge mb-2">Report Job</p>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{reportTarget.title}</h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{reportTarget.companyName}</p>
              </div>
              <button type="button" onClick={() => setReportTarget(null)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                <FiX size={18} />
              </button>
            </div>
            <div className="grid gap-4">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Reason *</span>
                <select required value={reportForm.reason} onChange={(e) => setReportForm((p) => ({ ...p, reason: e.target.value }))} className="ka-input">
                  <option value="">Select a reason...</option>
                  <option value="FAKE_SUSPICIOUS">Fake / Suspicious job</option>
                  <option value="INCORRECT_INFO">Incorrect information</option>
                  <option value="INVALID_CONTACT">Contact information invalid</option>
                  <option value="SPAM">Spam</option>
                  <option value="DUPLICATE">Duplicate posting</option>
                  <option value="MISLEADING">Misleading salary / details</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Additional details (optional)</span>
                <textarea rows={3} value={reportForm.description} onChange={(e) => setReportForm((p) => ({ ...p, description: e.target.value }))} className="ka-input resize-y" placeholder="Describe what you noticed..." />
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setReportTarget(null)} className="btn-secondary flex-1 !py-2.5 !text-xs">Cancel</button>
                <button type="submit" disabled={submittingReport} className="btn-primary flex-1 !py-2.5 !text-xs disabled:opacity-50">
                  {submittingReport ? "Reporting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Video Modal Player */}
      {viewingVideo && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setViewingVideo(null)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)] truncate pr-4">{viewingVideo.title}</h3>
              <button
                type="button"
                onClick={() => setViewingVideo(null)}
                className="h-8 w-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${viewingVideo.videoId}?autoplay=1`}
                title={viewingVideo.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[var(--text-muted)]">{viewingVideo.eventName || ""}</span>
              <a
                href={viewingVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-red-500 hover:underline"
              >
                <FaYoutube size={14} /> Watch on YouTube
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PublicResourcePage;
