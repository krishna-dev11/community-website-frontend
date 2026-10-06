import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiAward, FiClock, FiMapPin, FiPhone, FiSearch, FiUsers } from "react-icons/fi";
import ManagementCommitteeCard from "../Components/Common/ManagementCommitteeCard";
import { foundingCommittee1979, organizationInfo } from "../data/halbaData";
import { useLanguage } from "../i18n/LanguageContext";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { useScrollReveal } from "../Utilities/useScrollReveal";
import { apiConnector } from "../services/apiConnector";
import { contentEndpoints } from "../services/apis";

const ManagementCommitteePage = () => {
  const { isHindi } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [memberError, setMemberError] = useState("");
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadMembers = async () => {
      setLoadingMembers(true);
      setMemberError("");
      try {
        const response = await apiConnector("GET", contentEndpoints.MANAGEMENT_API, null, null, { limit: 200 });
        setMembers(response.data?.data?.members || []);
      } catch (error) {
        setMemberError(error.response?.data?.message || "Unable to load management committee members");
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, []);

  const categories = useMemo(() => {
    const roles = Array.from(new Set(members.map((member) => member.roleTitle).filter(Boolean)));
    return [
      { key: "ALL", labelHi: "All Members", labelEn: "All Members" },
      ...roles.map((role) => ({ key: role, labelHi: role, labelEn: role })),
    ];
  }, [members]);

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return members.filter((member) => {
      const matchesCategory = activeCategory === "ALL" || member.roleTitle === activeCategory;
      const searchBlob = `${member.name || ""} ${member.roleTitle || ""} ${member.bio || ""}`.toLowerCase();
      return matchesCategory && (!query || searchBlob.includes(query));
    });
  }, [activeCategory, members, searchQuery]);

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300"
    >
      <section className="relative overflow-hidden px-4 pb-14 pt-24 sm:px-6 sm:pt-32 lg:px-8">
        <div className="absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent-primary)]/5 blur-[110px] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="reveal mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
            <FiUsers size={13} />
            <span>{isHindi ? organizationInfo.nameHi : organizationInfo.nameEn}</span>
          </div>

          <h1 className="reveal mb-4 text-2xl font-black leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl">
            Current <span className="gradient-text-brand">Executive Committee</span>
          </h1>

          <p className="reveal reveal-delay-1 mx-auto max-w-3xl text-xs font-normal leading-relaxed text-[var(--text-secondary)] sm:text-base">
            The current patrons, office bearers and executive members. This list is managed dynamically from the committee CMS.
          </p>

          <div className="reveal reveal-delay-2 mt-7 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-5 py-2.5 text-xs text-[var(--text-secondary)] shadow-sm">
            <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <FiMapPin size={13} className="text-emerald-400" />
              {isHindi ? organizationInfo.headOffice.addressHi : organizationInfo.headOffice.addressEn}
            </span>
            <span className="opacity-40">-</span>
            <a href="tel:+919926018058" className="flex items-center gap-1 font-mono font-bold text-emerald-400 hover:underline">
              <FiPhone size={12} />
              {organizationInfo.headOffice.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="reveal flex flex-col items-center justify-between gap-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 sm:flex-row">
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => setActiveCategory(category.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeCategory === category.key
                    ? "bg-[var(--accent-primary)] text-black shadow-sm shadow-[var(--accent-primary)]/30"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
                }`}
              >
                {isHindi ? category.labelHi : category.labelEn}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, role..."
              className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] py-2 pl-9 pr-3 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition-colors focus:border-[var(--accent-primary)]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {loadingMembers ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]" />
            ))}
          </div>
        ) : memberError ? (
          <div className="rounded-3xl border border-red-400/20 bg-red-400/5 px-6 py-12 text-center text-sm text-red-300">
            {memberError}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--border-subtle)] px-6 py-16 text-center text-sm text-[var(--text-muted)]">
            {members.length === 0 ? "No active committee members have been published yet." : "No results found."}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMembers.map((member, index) => (
              <div key={member._id} className={`reveal reveal-delay-${Math.min(index % 8 + 1, 8)}`}>
                <ManagementCommitteeCard member={member} />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="section-glow-divider reveal mx-4 sm:mx-auto" />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="reveal hover-lift ka-card rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-[var(--surface-elevated)] p-6 sm:p-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
              <FiClock size={15} />
              <span>Historic foundation - 14 March 1979</span>
            </div>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              Founding Committee 1979
            </span>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-black text-[var(--text-primary)] sm:text-2xl">
              {isHindi ? foundingCommittee1979.titleHi : foundingCommittee1979.titleEn}
            </h2>
            <p className="max-w-4xl text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
              {isHindi ? foundingCommittee1979.descriptionHi : foundingCommittee1979.descriptionEn}
            </p>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {foundingCommittee1979.officeBearers.map((officeBearer, index) => (
              <div key={index} className="reveal rounded-2xl border border-amber-500/20 bg-[var(--surface)] p-4 hover-lift">
                <span className="block text-[10px] font-bold uppercase text-amber-400">{officeBearer.roleHi}</span>
                <p className="text-sm font-bold text-[var(--text-primary)]">{officeBearer.nameHi}</p>
              </div>
            ))}
          </div>

          <div className="reveal rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
            <span className="mb-3 flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <FiAward size={13} className="text-amber-400" />
              Founding Executive Members (1979):
            </span>
            <div className="flex flex-wrap gap-2">
              {foundingCommittee1979.executiveMembers.map((name, index) => (
                <span key={index} className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-amber-500/30 hover:text-amber-300">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ModernFooter />
    </div>
  );
};

export default ManagementCommitteePage;
