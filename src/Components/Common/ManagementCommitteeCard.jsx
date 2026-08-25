import React, { useState } from "react";
import { FiPhone, FiMail, FiShield, FiUser, FiInfo, FiX } from "react-icons/fi";
import { useLanguage } from "../../i18n/LanguageContext";

const ManagementCommitteeCard = ({ member }) => {
  const { t, isHindi } = useLanguage();
  const [showBioModal, setShowBioModal] = useState(false);

  if (!member) return null;

  const displayName = isHindi ? member.name || member.nameEn : member.nameEn || member.name;
  const displayDesignation = isHindi
    ? member.designation || member.designationEn
    : member.designationEn || member.designation;
  const displayTenure = isHindi ? member.tenure || member.tenureEn : member.tenureEn || member.tenure;
  const photoUrl = member.photo?.url || member.imageUrl;

  return (
    <>
      <div className="group relative flex flex-col justify-between w-full h-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/40 rounded-2xl p-3 sm:p-3.5 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-emerald-500/5 select-none">
        {/* Top: 9:16 Portrait Image Container */}
        <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-black/40 border border-[var(--border-subtle)] shadow-inner">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={displayName}
              loading="lazy"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 bg-gradient-to-b from-[var(--surface-raised)] to-[var(--surface)]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)] mb-2 shadow-inner">
                <FiUser size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] line-clamp-1">
                {displayDesignation || "पदाधिकारी"}
              </span>
              <span className="text-[8px] text-[var(--text-faint)] mt-1">
                {isHindi ? "चित्र शीघ्र उपलब्ध होगा" : "Photo coming soon"}
              </span>
            </div>
          )}

          {/* Role / Category Badge on Top of Image */}
          {member.category && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 border border-white/10">
                <FiShield size={9} />
                <span className="truncate max-w-[110px]">{member.category}</span>
              </span>
            </div>
          )}
        </div>

        {/* Bottom: Typography & Info Details */}
        <div className="mt-3 flex flex-col flex-1 justify-between min-w-0">
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] leading-snug truncate" title={displayName}>
              {displayName}
            </h3>
            <p className="text-[10.5px] sm:text-xs font-bold text-[var(--accent-primary)] mt-0.5 truncate" title={displayDesignation}>
              {displayDesignation}
            </p>
            {displayTenure && (
              <p className="text-[9px] text-[var(--text-muted)] mt-0.5 truncate">
                {displayTenure}
              </p>
            )}
          </div>

          {/* Action Row: Phone & Bio Info */}
          <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-1.5 text-[10px]">
            {member.contact?.phone ? (
              <a
                href={`tel:${member.contact.phone}`}
                className="inline-flex items-center gap-1 font-bold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors px-1 py-0.5 rounded shrink-0"
                title={`Call ${member.contact.phone}`}
              >
                <FiPhone size={10} className="text-emerald-400" />
                <span className="text-[9px]">{member.contact.phone}</span>
              </a>
            ) : (
              <span className="text-[9px] text-[var(--text-faint)]">प्रांतीय प्रगति संस्था</span>
            )}

            {member.bio && (
              <button
                type="button"
                onClick={() => setShowBioModal(true)}
                className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer shrink-0 ml-auto"
                title="View bio"
              >
                <FiInfo size={10} />
                <span>{isHindi ? "विवरण" : "Bio"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bio Modal Dialog */}
      {showBioModal && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md ka-card p-5 sm:p-6 rounded-2xl border border-[var(--border-strong)] shadow-2xl bg-[var(--surface)]">
            <button
              type="button"
              onClick={() => setShowBioModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            >
              <FiX size={15} />
            </button>

            <div className="flex items-center gap-3 pr-8 mb-4">
              <div className="w-12 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--accent-primary)]">
                    <FiUser size={20} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-black text-[var(--text-primary)] leading-tight truncate">
                  {displayName}
                </h4>
                <p className="text-xs font-bold text-[var(--accent-primary)] mt-0.5 truncate">
                  {displayDesignation}
                </p>
                {displayTenure && (
                  <p className="text-[10px] text-[var(--text-muted)]">{displayTenure}</p>
                )}
              </div>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-secondary)] leading-relaxed max-h-60 overflow-y-auto">
              <p>{member.bio}</p>
            </div>

            {member.contact?.phone && (
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">{isHindi ? "संपर्क:" : "Contact:"}</span>
                <a href={`tel:${member.contact.phone}`} className="font-mono font-bold text-[var(--accent-primary)]">
                  {member.contact.phone}
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
