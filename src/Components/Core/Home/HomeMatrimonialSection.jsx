import React from "react";
import { Link } from "react-router-dom";
import {
  FiHeart,
  FiShield,
  FiUsers,
  FiLock,
  FiCheckCircle,
  FiArrowRight,
  FiCompass,
} from "react-icons/fi";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeMatrimonialSection = () => {
  const { isHindi } = useLanguage();

  const trustPoints = [
    {
      icon: FiShield,
      titleHi: "समाज आधारित सुरक्षित मंच",
      titleEn: "Community-Verified Network",
      descHi: "केवल आदिवासी हल्बा/हल्बी समाज के सत्यापित सदस्यों के लिए मर्यादित मंच।",
      descEn: "Dignified and secure platform exclusively for Halba/Halbi community members.",
    },
    {
      icon: FiLock,
      titleHi: "पूर्ण गोपनीयता एवं सुरक्षा",
      titleEn: "100% Privacy Protection",
      descHi: "व्यक्तिगत संपर्क एवं परिवार विवरण बिना आपकी अनुमति किसी को प्रदर्शित नहीं होते।",
      descEn: "Personal contact and family details remain strictly private until mutual consent.",
    },
    {
      icon: FiUsers,
      titleHi: "पारिवारिक सहभागिता",
      titleEn: "Family-Centered Process",
      descHi: "माता-पिता एवं अभिभावकों की सहमति और परंपरा के अनुरूप संबंध की पहल।",
      descEn: "Encouraging parental involvement and traditional family-grounded alliances.",
    },
    {
      icon: FiCompass,
      titleHi: "गोत्र व परंपरा का सम्मान",
      titleEn: "Gotra & Heritage Alignment",
      descHi: "समाज के 32+ गोत्रों एवं पारिवारिक पृष्ठभूमि के आधार पर सटीक मिलान।",
      descEn: "Accurate matching based on ancestral Gotra, education, and cultural values.",
    },
  ];

  return (
    <section
      className="relative w-full overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6 sm:p-8 lg:p-12 transition-colors duration-300"
      aria-label="Community Matrimonial Section"
    >
      {/* Subtle decorative radial gradients */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Heading, Subtitle & Trust Pillars */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 mb-3">
            <FiHeart size={13} />
            <span>{isHindi ? "समाज का वैवाहिक मंच" : "Community Matrimonial"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
            {isHindi
              ? "जीवनसाथी की तलाश, अपने समाज के बीच"
              : "Finding Life Partners Within Our Community"}
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
            {isHindi
              ? "आदिवासी हल्बा/हल्बी समाज के युवक-युवतियों के लिए विश्वास, मर्यादा और संस्कृति के अनुकूल सुरक्षित एवं पारदर्शी वैवाहिक परिचय मंच।"
              : "A trusted, private, and culturally grounded platform designed to help Halba/Halbi community members find compatible life partners."}
          </p>

          {/* 4 Trust Feature Points Grid */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {trustPoints.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 transition-all duration-300 hover:border-rose-500/30 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {isHindi ? item.titleHi : item.titleEn}
                      </h4>
                      <p className="mt-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        {isHindi ? item.descHi : item.descEn}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/matrimonial"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:from-rose-500 hover:to-amber-500 transition-all duration-300 hover:scale-[1.02]"
            >
              <span>{isHindi ? "वैवाहिक मंच देखें" : "Explore Matrimonial Hub"}</span>
              <FiArrowRight size={15} />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-5 py-3 text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:border-rose-500/30 hover:bg-[var(--surface-hover)] transition-colors"
            >
              <span>{isHindi ? "समिति से संपर्क करें" : "Contact Committee"}</span>
            </Link>
          </div>
        </div>

        {/* Right Column: How it Works / Interactive Community Invitation Card */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl border-2 border-rose-500/20 bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--surface)] p-6 sm:p-8 shadow-xl">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-rose-500">
                  {isHindi ? "सरल एवं सुरक्षित प्रक्रिया" : "Simple & Secure Steps"}
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                  {isHindi ? "वैवाहिक मंच पर कैसे जुड़ें?" : "How to Participate"}
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                <FiHeart size={20} />
              </div>
            </div>

            {/* 3 Step Timeline */}
            <div className="space-y-5">
              <div className="flex items-start gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-black text-white">
                  1
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    {isHindi ? "सदस्य लॉगिन एवं प्रोफ़ाइल बनाएं" : "Login & Register Profile"}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {isHindi
                      ? "लॉगिन कर अपने अथवा परिवार के सदस्य का वैवाहिक विवरण भरें।"
                      : "Create and update verified biodata with family consent."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-white">
                  2
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    {isHindi ? "गोत्र, शिक्षा व स्थान से मिलान" : "Browse by Gotra & Criteria"}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {isHindi
                      ? "समाज के योग्य युवक-युवतियों की प्रोफ़ाइल एवं गोत्र की जाँच करें।"
                      : "Search compatible profiles by education, Gotra, city and profession."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">
                  3
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    {isHindi ? "सुरक्षित संपर्क निवेदन भेजें" : "Send Confidential Request"}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {isHindi
                      ? "रुचि व्यक्त करें; दोनों परिवारों की स्वीकृति पर ही संपर्क साझा होगा।"
                      : "Express interest safely; contact details unlock only upon mutual approval."}
                  </p>
                </div>
              </div>
            </div>

            {/* Note about Privacy */}
            <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 flex items-start gap-2.5">
              <FiCheckCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-snug">
                {isHindi
                  ? "गोपनीयता नियम: किसी भी सदस्य का फोन या पता सार्वजनिक नहीं किया जाता।"
                  : "Privacy First: No personal phone numbers or home addresses are exposed publicly."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeMatrimonialSection;
