import React, { useEffect, useState } from "react";
import { FiUsers, FiShield, FiPhone, FiMail, FiMapPin, FiSearch } from "react-icons/fi";
import { apiConnector } from "../services/apiConnector";
import { contentEndpoints } from "../services/apis";
import ManagementCommitteeSlider from "../Components/Common/ManagementCommitteeSlider";
import ManagementCommitteeCard from "../Components/Common/ManagementCommitteeCard";
import { realCommitteeMembers, organizationInfo } from "../data/bairwaData";
import { useLanguage } from "../i18n/LanguageContext";
import ModernFooter from "../Components/Core/Home/ModernFooter";

const ManagementCommitteePage = () => {
  const { t, isHindi } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    apiConnector("GET", contentEndpoints.MANAGEMENT_API, null, null, { limit: 50, status: "active" })
      .then((res) => {
        const data = res?.data?.data;
        const list = Array.isArray(data) ? data : data?.members || data?.committee || [];
        if (list.length > 0) {
          setMembers(list);
        } else {
          setMembers(realCommitteeMembers);
        }
      })
      .catch(() => {
        setMembers(realCommitteeMembers);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { key: "ALL", labelHi: "सम्पूर्ण कार्यकारिणी", labelEn: "All Leaders" },
    { key: "संरक्षक मंडल", labelHi: "संरक्षक मंडल", labelEn: "Patron Board" },
    { key: "प्रदेश कार्यकारिणी", labelHi: "प्रदेश कार्यकारिणी", labelEn: "State Executive" },
    { key: "क्षेत्रीय कार्यकारिणी", labelHi: "क्षेत्रीय पदाधिकारी", labelEn: "Regional Officers" },
  ];

  const filteredMembers = members.filter((m) => {
    const matchesCategory =
      activeCategory === "ALL" ||
      m.category === activeCategory ||
      (activeCategory === "संरक्षक मंडल" && (m.role?.includes("PATRON") || m.designation?.includes("संरक्षक")));
    const nameStr = `${m.name || ""} ${m.nameEn || ""} ${m.designation || ""} ${m.designationEn || ""}`.toLowerCase();
    const matchesSearch = !searchQuery || nameStr.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-3.5 py-1 text-xs font-bold text-[var(--accent-primary)] mb-3">
            <FiUsers size={13} />
            <span>{isHindi ? organizationInfo.nameHi : organizationInfo.nameEn}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
            {isHindi ? "संस्था प्रदेश कार्यकारिणी" : "State Executive Committee"}
          </h1>

          <p className="mt-3 text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
            {isHindi
              ? "प्रांतीय बैरवा प्रगति संस्था के सम्मानित संरक्षक, पदाधिकारी एवं कार्यकारिणी सदस्य जो समाज के उत्थान, शिक्षा प्रसार, सामूहिक विवाह व सामाजिक चेतना के लिए सतत समर्पित हैं।"
              : "The revered patrons, office bearers, and executive members of Prantiya Bairwa Pragati Sanstha dedicated to community upliftment, education, and social welfare."}
          </p>

          {/* Quick Office Card */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2.5 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <FiMapPin size={13} className="text-emerald-400" />
              <span>{isHindi ? "प्रधान कार्यालय: सी-57, महेश नगर, जयपुर" : "Head Office: C-57, Mahesh Nagar, Jaipur"}</span>
            </span>
            <span>•</span>
            <a href="tel:+919928260244" className="flex items-center gap-1 font-mono font-bold text-emerald-400 hover:underline">
              <FiPhone size={12} />
              <span>+91 99282 60244</span>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Horizontal Slider Showcase */}
      <section className="py-8 bg-[var(--surface-elevated)]/60 border-y border-[var(--border-subtle)]">
        <ManagementCommitteeSlider
          members={members}
          title={isHindi ? "कार्यकारिणी वीथिका (Carousel Showcase)" : "Executive Leadership Showcase"}
          subtitle={isHindi ? "प्रमुख पदाधिकारी एवं संरक्षक मंडल की संक्षिप्त सूची" : "Key patrons and office bearers"}
        />
      </section>

      {/* Complete Directory Grid with Filtering */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.key
                    ? "bg-[var(--accent-primary)] text-black shadow-md"
                    : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                {isHindi ? cat.labelHi : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-72">
            <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHindi ? "नाम या पद से खोजें..." : "Search name or role..."}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] pl-9 pr-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] transition"
            />
          </div>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {filteredMembers.map((member, idx) => (
            <div key={member._id || idx} className="h-full">
              <ManagementCommitteeCard member={member} />
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12 text-xs text-[var(--text-muted)] bg-[var(--surface-elevated)] rounded-2xl border border-dashed border-[var(--border-subtle)]">
            <FiUsers size={32} className="mx-auto mb-2 text-[var(--text-faint)]" />
            <p>{isHindi ? "कोई पदाधिकारी रिकॉर्ड नहीं मिला।" : "No committee members found matching your search."}</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <ModernFooter />
    </div>
  );
};

export default ManagementCommitteePage;
