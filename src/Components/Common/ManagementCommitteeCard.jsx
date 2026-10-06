import React, { useState } from "react";
import { FiInfo, FiMail, FiPhone, FiShield, FiUser, FiX } from "react-icons/fi";
import { useLanguage } from "../../i18n/LanguageContext";

const ManagementCommitteeCard = ({ member }) => {
  const { isHindi } = useLanguage();
  const [showBioModal, setShowBioModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!member) return null;

  const displayName = isHindi ? member.name || member.nameEn : member.nameEn || member.name;
  const displayDesignation = isHindi
    ? member.designation || member.roleTitle || member.designationEn
    : member.designationEn || member.roleTitle || member.designation;
  const displayTenure = isHindi ? member.tenure || member.tenureEn : member.tenureEn || member.tenure;
  const contactPhone = member.contact?.phone || member.phone;
  const contactEmail = member.contact?.email || member.email;

  const rawPhoto =
    (typeof member.image === "string" && member.image ? member.image : member.image?.url) ||
    (typeof member.photo === "string" && member.photo ? member.photo : member.photo?.url) ||
    member.photoUrl ||
    member.imageUrl ||
    member.profilePhoto ||
    member.avatar ||
    "";
  const photoUrl = imgError ? "" : rawPhoto;

  return (
    <>
      <div className="group relative flex h-full w-full select-none flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3 shadow-md transition-all duration-300 hover:border-[var(--accent-primary)]/40 hover:shadow-lg hover:shadow-emerald-500/5 sm:p-3.5">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-black/40 shadow-inner">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={displayName}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[var(--surface-raised)] to-[var(--surface)] p-3 text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-inner sm:h-14 sm:w-14">
                <FiUser size={24} />
              </div>
              <span className="line-clamp-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {displayDesignation || "Member"}
              </span>
              <span className="mt-1 text-[8px] text-[var(--text-faint)]">Photo coming soon</span>
            </div>
          )}

          {member.category && (
            <div className="absolute left-2 top-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
                <FiShield size={9} />
                <span className="max-w-[110px] truncate">{member.category}</span>
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex min-w-0 flex-1 flex-col justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-xs font-black leading-snug text-[var(--text-primary)] sm:text-sm" title={displayName}>
              {displayName}
            </h3>
            <p className="mt-0.5 truncate text-[10.5px] font-bold text-[var(--accent-primary)] sm:text-xs" title={displayDesignation}>
              {displayDesignation}
            </p>
            {displayTenure && (
              <p className="mt-0.5 truncate text-[9px] text-[var(--text-muted)]">{displayTenure}</p>
            )}
          </div>

          {(contactPhone || contactEmail || member.bio) && (
            <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--border-subtle)] pt-2">
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-[var(--surface-raised)] px-2 py-1.5 text-[9px] font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-primary)]"
                  title={`Call ${contactPhone}`}
                >
                  <FiPhone size={10} className="shrink-0" />
                  <span className="truncate">{contactPhone}</span>
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-raised)] text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-primary)]"
                  title={`Email ${contactEmail}`}
                >
                  <FiMail size={11} />
                </a>
              )}
              {member.bio && (
                <button
                  type="button"
                  onClick={() => setShowBioModal(true)}
                  className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] transition-colors hover:bg-[var(--accent-primary)]/20"
                  title="View details"
                >
                  <FiInfo size={11} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showBioModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowBioModal(false)}
              className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-white"
            >
              <FiX size={16} />
            </button>

            <div className="mb-4 flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4 pr-8">
              {photoUrl ? (
                <img src={photoUrl} alt={displayName} className="h-14 w-14 rounded-full border border-[var(--border-subtle)] object-cover object-top" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                  <FiUser size={24} />
                </div>
              )}
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)]">{displayName}</h3>
                <p className="mt-0.5 truncate text-xs font-bold text-[var(--accent-primary)]">{displayDesignation}</p>
                {displayTenure && <p className="text-[10px] text-[var(--text-muted)]">{displayTenure}</p>}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border-t border-[var(--border-subtle)] pt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              <p>{member.bio}</p>
            </div>

            {contactPhone && (
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-xs">
                <span className="text-[var(--text-muted)]">Contact:</span>
                <a href={`tel:${contactPhone}`} className="font-mono font-bold text-[var(--accent-primary)]">
                  {contactPhone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ManagementCommitteeCard;
