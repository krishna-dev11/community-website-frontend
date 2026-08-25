import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiLayers, FiCheckCircle, FiInfo } from "react-icons/fi";
import { bairwaGotrasList } from "../data/bairwaData";
import { useLanguage } from "../i18n/LanguageContext";
import ModernFooter from "../Components/Core/Home/ModernFooter";

const GotraDirectoryPage = () => {
  const { t, isHindi } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedChar, setSelectedChar] = useState("ALL");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const firstChars = useMemo(() => {
    const chars = new Set();
    bairwaGotrasList.forEach((g) => {
      if (g.original) chars.add(g.original.charAt(0));
    });
    return ["ALL", ...Array.from(chars).sort()];
  }, []);

  const filteredGotras = useMemo(() => {
    return bairwaGotrasList.filter((g) => {
      const matchSearch =
        !search ||
        g.original.toLowerCase().includes(search.toLowerCase()) ||
        g.prevalent.toLowerCase().includes(search.toLowerCase());
      const matchChar = selectedChar === "ALL" || g.original.startsWith(selectedChar);
      return matchSearch && matchChar;
    });
  }, [search, selectedChar]);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Hero Header */}
      <section className="relative pt-24 sm:pt-28 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-3.5 py-1 text-xs font-bold text-[var(--accent-primary)] mb-3">
          <FiLayers size={13} />
          <span>{isHindi ? "प्रामाणिक सामाजिक गोत्र सूची (101 गोत्र)" : "Authentic Gotra Directory (101 Gotras)"}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
          {isHindi ? "बैरवा समाज के गोत्र" : "Bairwa Samaaj Gotra Directory"}
        </h1>

        <p className="mt-3 text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
          {isHindi
            ? "बैरवा समाज के 101 मूल एवं संशोधित / प्रचलित गोत्रों की प्रामाणिक, वर्णानुक्रम एवं खोज-योग्य निर्देशिका।"
            : "Authentic, searchable alphabetical directory of 101 original and prevalent gotras of Bairwa Samaaj."}
        </p>

        {/* Search Input */}
        <div className="mt-6 max-w-md mx-auto relative">
          <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isHindi ? "गोत्र का नाम खोजें (उदा. गोठवाल, बैण्डवाल, कुवाल)..." : "Search gotra name..."}
            className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] pl-11 pr-4 py-3 text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] shadow-sm transition"
          />
        </div>

        {/* Alphabet Filter Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 max-w-3xl mx-auto">
          {firstChars.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => setSelectedChar(ch)}
              className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedChar === ch
                  ? "bg-[var(--accent-primary)] text-black"
                  : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]"
              }`}
            >
              {ch === "ALL" ? (isHindi ? "सभी" : "All") : ch}
            </button>
          ))}
        </div>
      </section>

      {/* Directory Grid / Table */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4 text-xs text-[var(--text-muted)]">
          <span>{isHindi ? `कुल परिणाम: ${filteredGotras.length} गोत्र` : `Results: ${filteredGotras.length} gotras`}</span>
          <span>{isHindi ? "मूल व प्रचलित स्वरूप" : "Original & Prevalent"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGotras.map((gotra) => (
            <div
              key={gotra.id}
              className="ka-card p-3.5 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/40 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--accent-primary)] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {gotra.id}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    {gotra.original}
                  </h3>
                  {gotra.prevalent !== gotra.original && (
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {isHindi ? "प्रचलित: " : "Prevalent: "}
                      <span className="text-[var(--text-secondary)]">{gotra.prevalent}</span>
                    </p>
                  )}
                </div>
              </div>
              <FiCheckCircle size={14} className="text-emerald-400 shrink-0" />
            </div>
          ))}
        </div>

        {filteredGotras.length === 0 && (
          <div className="text-center py-16 ka-card rounded-2xl border border-dashed border-[var(--border-subtle)]">
            <FiInfo size={32} className="mx-auto text-[var(--text-faint)] mb-2" />
            <p className="text-xs text-[var(--text-muted)]">
              {isHindi ? "आपके खोज मापदंड से कोई गोत्र नहीं मिला।" : "No gotra found matching your search."}
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <ModernFooter />
    </div>
  );
};

export default GotraDirectoryPage;
