import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiAward,
  FiUsers,
  FiHeart,
  FiBookOpen,
  FiArrowRight,
  FiCheckCircle,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { organizationInfo, realCommunityObjectives } from "../data/bairwaData";
import { useLanguage } from "../i18n/LanguageContext";

const AboutPage = () => {
  const { t, isHindi } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[var(--bg)] text-[var(--text-primary)] overflow-x-hidden font-sans transition-colors duration-300">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative pt-28 sm:pt-32 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-4">
          <FiShield size={13} />
          <span>{isHindi ? organizationInfo.nameHi : organizationInfo.nameEn}</span>
        </div>

        <h1 className="heading-hero text-[var(--text-primary)] mb-4">
          {isHindi ? "एकता, सेवा एवं सामाजिक उत्थान का संकल्प" : "A Legacy of Unity, Seva & Social Upliftment"}
        </h1>

        <p className="text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal max-w-3xl mx-auto">
          {isHindi ? organizationInfo.missionHi : organizationInfo.missionEn}
        </p>

        {/* Head Office Pill */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-bold">
            <FiMapPin size={13} className="text-emerald-400" />
            <span>{isHindi ? organizationInfo.headOffice.addressHi : organizationInfo.headOffice.addressEn}</span>
          </span>
          <span>•</span>
          <a href="tel:+919928260244" className="font-mono font-bold text-emerald-400 hover:underline">
            {organizationInfo.headOffice.phone}
          </a>
        </div>
      </section>

      {/* ================= 2. ORGANIZATION INTRODUCTION ================= */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="ka-card p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 flex items-center justify-center font-black text-2xl text-[var(--accent-primary)] shadow-sm">
              ब
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
              {isHindi ? "संस्था का स्वरूप एवं कार्यक्षेत्र" : "Sanstha Profile & Scope"}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
              {isHindi
                ? "प्रांतीय बैरवा प्रगति संस्था एक पंजीकृत सामाजिक संगठन है, जो बैरवा समाज के बंधुओं द्वारा संचालित है। संस्था का मुख्य उद्देश्य समाज में शिक्षा का प्रसार, युवक-युवती परिचय सम्मेलनों के माध्यम से सामूहिक विवाह, प्रतिभा सम्मान, विचार गोष्ठियाँ एवं कुरीतियों का निवारण करना है।"
                : "Prantiya Bairwa Pragati Sanstha is a registered community organization dedicated to promoting education, facilitating youth matrimonial alliances, organizing mass marriages, student felicitations, and cultural seminars across Rajasthan and India."}
            </p>
          </div>

          <div className="flex flex-col items-start space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-primary)]">
              {isHindi ? "प्रमुख सामाजिक गतिविधियाँ" : "Major Social Activities"}
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)] leading-snug">
              {isHindi ? "सामूहिक सहभागिता और समाज सेवा" : "Collective Participation & Service"}
            </h2>

            <div className="space-y-2.5 w-full text-xs text-[var(--text-secondary)]">
              {[
                isHindi ? "वार्षिक युवक-युवती परिचय सम्मेलन एवं स्मारिका प्रकाशन" : "Annual Youth Matrimonial Conferences & Souvenirs",
                isHindi ? "10वीं, 11वीं एवं 12वीं के मेधावी छात्र-छात्राओं का प्रतिभा सम्मान" : "State-level Felicitation for Meritorious Students (80%+)",
                isHindi ? "महर्षि बालीनाथ जी जयंती एवं सामाजिक चेतना कार्यक्रम" : "Maharshi Balinath Jayanti & Social Reform Programs",
                isHindi ? "सामूहिक गोठ, रक्तदान शिविर एवं पर्यावरण संरक्षण पौधारोपण" : "Community Feasts, Blood Donation & Tree Plantation Drives",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <FiCheckCircle className="text-emerald-400 shrink-0" size={15} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link to="/management-committee" className="btn-primary text-xs">
                <span>{t("secLeadership")}</span>
                <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. GUIDING OBJECTIVES ================= */}
      <section className="py-16 bg-[var(--surface-elevated)]/60 border-y border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="eyebrow-badge mx-auto mb-2">
            <FiAward size={13} />
            <span>{t("secObjectives")}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "संस्था के मूल सामाजिक संकल्प" : "Our Core Objectives"}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {realCommunityObjectives.map((obj) => (
            <div key={obj.id} className="ka-card p-5 rounded-2xl border border-[var(--border-subtle)] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[var(--accent-primary)] mb-2 block">
                  #0{obj.id}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-1">
                  {isHindi ? obj.titleHi : obj.titleEn}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {obj.descHi}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <ModernFooter />
    </div>
  );
};

export default AboutPage;
