import React, { useEffect, useRef, useState } from "react";
import {
  FiUsers, FiShield, FiPhone, FiMail, FiMapPin, FiClock, FiSearch, FiStar, FiAward,
} from "react-icons/fi";
import ManagementCommitteeCard from "../Components/Common/ManagementCommitteeCard";
import { realCommitteeMembers, foundingCommittee1979, organizationInfo } from "../data/halbaData";
import { useLanguage } from "../i18n/LanguageContext";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { useScrollReveal } from "../Utilities/useScrollReveal";

const ManagementCommitteePage = () => {
  const { isHindi } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { key: "ALL", labelHi: "सम्पूर्ण कार्यकारिणी", labelEn: "All Leaders" },
    { key: "मुख्य पदाधिकारी", labelHi: "मुख्य पदाधिकारी", labelEn: "Key Office Bearers" },
    { key: "पदाधिकारी", labelHi: "पदाधिकारी", labelEn: "Office Bearers" },
    { key: "कार्यकारिणी सदस्य", labelHi: "कार्यकारिणी सदस्य", labelEn: "Executive Members" },
    { key: "संरक्षक मंडल", labelHi: "संरक्षक मंडल", labelEn: "Patron Board" },
  ];

  const filteredMembers = realCommitteeMembers.filter((m) => {
    const matchesCategory =
      activeCategory === "ALL" ||
      m.category === activeCategory ||
      (activeCategory === "संरक्षक मंडल" && (m.role?.includes("SANRAKSHAK") || m.designation?.includes("संरक्षक")));
    const nameStr = `${m.name || ""} ${m.nameEn || ""} ${m.designation || ""} ${m.designationEn || ""}`.toLowerCase();
    const matchesSearch = !searchQuery || nameStr.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300"
    >
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative pt-24 sm:pt-32 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] rounded-full bg-[var(--accent-primary)]/5 blur-[110px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 mb-5">
            <FiUsers size={13} />
            <span>{isHindi ? organizationInfo.nameHi : organizationInfo.nameEn}</span>
          </div>

          <h1 className="reveal text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight mb-4">
            {isHindi
              ? <>वर्तमान <span className="gradient-text-brand">कार्यकारिणी समिति</span></>
              : <>Current <span className="gradient-text-brand">Executive Committee</span></>}
          </h1>

          <p className="reveal reveal-delay-1 text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto font-normal">
            {isHindi
              ? "आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन के वर्तमान संरक्षक, पदाधिकारी एवं कार्यकारिणी सदस्य (कार्यभार ग्रहण: 25.01.2025) जो समाज के सर्वांगीण विकास हेतु समर्पित हैं।"
              : "The dedicated patrons, office bearers, and executive members of Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain (joined 25.01.2025) serving community development and Dharamshala governance."}
          </p>

          {/* Address Pill */}
          <div className="reveal reveal-delay-2 mt-7 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-5 py-2.5 text-xs text-[var(--text-secondary)] shadow-sm">
            <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <FiMapPin size={13} className="text-emerald-400" />
              {isHindi ? organizationInfo.headOffice.addressHi : organizationInfo.headOffice.addressEn}
            </span>
            <span className="opacity-40">•</span>
            <a href="tel:+919926018058" className="flex items-center gap-1 font-mono font-bold text-emerald-400 hover:underline">
              <FiPhone size={12} />
              {organizationInfo.headOffice.phoneDisplay}
            </a>
          </div>

          {/* Stats strip */}
          <div className="reveal reveal-delay-3 mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
            <div className="text-center">
              <p className="text-xl font-black text-[var(--accent-primary)] font-mono">{realCommitteeMembers.length}</p>
              <p className="text-[10px] text-[var(--text-secondary)]">{isHindi ? "कुल सदस्य" : "Total Members"}</p>
            </div>
            <div className="text-center border-x border-[var(--border-subtle)]">
              <p className="text-xl font-black text-sky-400 font-mono">2025</p>
              <p className="text-[10px] text-[var(--text-secondary)]">{isHindi ? "कार्यभार वर्ष" : "Charge Year"}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-amber-400 font-mono">45+</p>
              <p className="text-[10px] text-[var(--text-secondary)]">{isHindi ? "वर्षों की सेवा" : "Years Service"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── FILTER BAR ───────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-8">
        <div className="reveal flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActiveCategory(c.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeCategory === c.key
                    ? "bg-[var(--accent-primary)] text-black shadow-sm shadow-[var(--accent-primary)]/30"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]"
                }`}
              >
                {isHindi ? c.labelHi : c.labelEn}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHindi ? "नाम या पद से खोजें..." : "Search by name, role..."}
              className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
          </div>
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="mt-3 text-xs text-[var(--text-muted)] px-1">
            {filteredMembers.length} {isHindi ? "परिणाम मिले" : "results found"}
          </p>
        )}
      </section>

      {/* ───────────────── COMMITTEE CARDS ───────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)] text-sm">
            {isHindi ? "कोई परिणाम नहीं मिला।" : "No results found."}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member, idx) => (
              <div
                key={member._id}
                className={`reveal reveal-delay-${Math.min(idx % 8 + 1, 8)}`}
              >
                <ManagementCommitteeCard member={member} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="section-glow-divider reveal mx-4 sm:mx-auto" />

      {/* ───────────────── 1979 FOUNDING COMMITTEE ───────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="reveal hover-lift ka-card p-6 sm:p-10 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-[var(--surface-elevated)]">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-5 mb-6">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <FiClock size={15} />
              <span>{isHindi ? "संस्था का ऐतिहासिक आधार • 14 मार्च 1979" : "HISTORIC FOUNDATION • 14 MARCH 1979"}</span>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
              {isHindi ? "प्रथम कार्यकारिणी समिति" : "Founding Committee 1979"}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mb-2">
              {isHindi ? foundingCommittee1979.titleHi : foundingCommittee1979.titleEn}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-4xl">
              {isHindi ? foundingCommittee1979.descriptionHi : foundingCommittee1979.descriptionEn}
            </p>
          </div>

          {/* Founding Office Bearers */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {foundingCommittee1979.officeBearers.map((ob, idx) => (
              <div
                key={idx}
                className={`reveal ${["reveal-delay-1","reveal-delay-2","reveal-delay-3","reveal-delay-4"][idx] || ""} p-4 rounded-2xl border border-amber-500/20 bg-[var(--surface)] space-y-1.5 hover-lift`}
              >
                <span className="text-[10px] font-bold uppercase text-amber-400 block">{ob.roleHi}</span>
                <p className="font-bold text-sm text-[var(--text-primary)]">{ob.nameHi}</p>
              </div>
            ))}
          </div>

          {/* Founding Executive Members */}
          <div className="reveal p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]">
            <span className="flex items-center gap-2 font-bold text-xs text-[var(--text-primary)] mb-3">
              <FiAward size={13} className="text-amber-400" />
              {isHindi ? "प्रथम कार्यकारिणी सदस्य (1979):" : "Founding Executive Members (1979):"}
            </span>
            <div className="flex flex-wrap gap-2">
              {foundingCommittee1979.executiveMembers.map((name, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs hover:border-amber-500/30 hover:text-amber-300 transition-colors cursor-default"
                >
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
