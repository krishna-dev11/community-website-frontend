import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiUsers,
  FiShield,
  FiHeart,
  FiBookOpen,
  FiBriefcase,
  FiAward,
  FiArrowRight,
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiPhone,
  FiMail,
  FiLayers,
  FiSun,
  FiClock,
} from "react-icons/fi";
import { FaWhatsapp, FaGraduationCap } from "react-icons/fa";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import ManagementCommitteeSlider from "../Components/Common/ManagementCommitteeSlider";
import HeroCarousel from "../Components/Core/Home/HeroCarousel";
import DynamicShowcaseSlider from "../Components/Core/Home/DynamicShowcaseSlider";
import { apiConnector } from "../services/apiConnector";
import { contentEndpoints, paymentEndpoints, communityEndpoints } from "../services/apis";
import {
  organizationInfo,
  historicalMilestones,
  balinathData,
  realCommunityObjectives,
  realCommitteeMembers,
} from "../data/bairwaData";
import { useLanguage } from "../i18n/LanguageContext";

const HomePage = () => {
  const { token } = useSelector((state) => state.auth);
  const { t, isHindi } = useLanguage();

  const [campaigns, setCampaigns] = useState([]);
  const [notices, setNotices] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [supporters, setSupporters] = useState([]);
  const [supporterCampaign, setSupporterCampaign] = useState(null);
  const [managementMembers, setManagementMembers] = useState([]);

  useEffect(() => {
    // Fetch live campaigns for the donation section
    apiConnector("GET", paymentEndpoints.DONATION_CAMPAIGNS_API, null, null, { limit: 3 })
      .then((res) => setCampaigns(res?.data?.data?.campaigns || []))
      .catch(() => {});

    // Fetch official notices/events
    apiConnector("GET", contentEndpoints.NOTICES_API, null, null, { limit: 3 })
      .then((res) => setNotices(res?.data?.data?.notices || []))
      .catch(() => {});

    // Fetch published Samaj Pride entries
    apiConnector("GET", communityEndpoints.ACHIEVEMENTS_API, null, null, { limit: 12 })
      .then((res) => setAchievements(res?.data?.data?.achievements || []))
      .catch(() => {});

    // Fetch verified public supporters from successful donations only
    apiConnector("GET", paymentEndpoints.PUBLIC_SUPPORTERS_API, null, null, { limit: 12 })
      .then((res) => {
        setSupporters(res?.data?.data?.supporters || []);
        setSupporterCampaign(res?.data?.data?.campaign || null);
      })
      .catch(() => {
        setSupporters([]);
        setSupporterCampaign(null);
      });

    // Fetch Management Committee members
    apiConnector("GET", contentEndpoints.MANAGEMENT_API, null, null, { limit: 15, status: "active" })
      .then((res) => {
        const data = res?.data?.data;
        const members = Array.isArray(data) ? data : data?.members || data?.committee || [];
        if (members.length > 0) {
          setManagementMembers(members);
        } else {
          setManagementMembers(realCommitteeMembers);
        }
      })
      .catch(() => {
        setManagementMembers(realCommitteeMembers);
      });
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* ================= 1. HERO SECTION (IMAGE-FIRST CAROUSEL) ================= */}
      <section className="relative pt-20 sm:pt-24 pb-4 sm:pb-8 px-3 sm:px-6 lg:px-8 max-w-[1550px] mx-auto">
        <HeroCarousel />
      </section>

      {/* ================= 2. MANAGEMENT COMMITTEE SHOWCASE SLIDER ================= */}
      <section className="py-16 sm:py-20 bg-[var(--surface-elevated)]/60 border-y border-[var(--border-subtle)]">
        <ManagementCommitteeSlider
          members={managementMembers}
          title={t("secLeadership")}
          subtitle={t("secLeadershipSub")}
        />
        <div className="mt-8 text-center">
          <Link to="/management-committee" className="btn-secondary text-xs inline-flex items-center gap-2">
            <span>{t("secViewAllCommittee")}</span>
            <FiArrowRight size={14} />
          </Link>
        </div>
      </section>

      {achievements.length > 0 && (
        <section className="py-16 sm:py-20 bg-[var(--surface)]">
          <DynamicShowcaseSlider
            type="achievements"
            items={achievements}
            title={isHindi ? "समाज गौरव" : "Samaj Pride"}
            subtitle={isHindi ? "समाज के प्रकाशित उपलब्धि सम्मान और प्रेरक कार्य।" : "Published achievements and inspiring contributions from our community members."}
            cta={{ to: "/achievements", label: isHindi ? "सभी उपलब्धियां" : "View All" }}
          />
        </section>
      )}

      {supporters.length > 0 && (
        <section className="py-16 sm:py-20 bg-[var(--surface-elevated)]/60 border-y border-[var(--border-subtle)]">
          <DynamicShowcaseSlider
            type="supporters"
            items={supporters}
            title={isHindi ? "समुदाय सहयोगी" : "Community Supporters"}
            subtitle={
              supporterCampaign?.title
                ? `${supporterCampaign.title} - ${isHindi ? "सफल सहयोग देने वाले सदस्य" : "members who have contributed successfully"}`
                : isHindi
                ? "सफल सहयोग देने वाले सदस्यों का सम्मान।"
                : "Recognizing members who have contributed successfully."
            }
            cta={{ to: "/donate", label: isHindi ? "सहयोग करें" : "Contribute" }}
          />
        </section>
      )}

      {/* ================= 3. MAHARSHI BALINATH JI MAHARAJ ================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="ka-card p-6 sm:p-10 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[var(--surface-raised)] to-[var(--surface-elevated)]">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 mb-3">
                <FiSun size={13} />
                <span>{isHindi ? "बैरवा समाज के पूज्य संत" : "Revered Spiritual Saint"}</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
                {isHindi ? balinathData.titleHi : balinathData.titleEn}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-300 mt-1">
                {isHindi ? balinathData.subtitleHi : balinathData.subtitleEn}
              </p>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-3 mb-6 font-normal">
                {isHindi
                  ? "जन्म: मण्डावरी धाम (तहसील लालसोट, जिला दौसा)। पूज्य महर्षि बालीनाथ जी महाराज ने शिक्षा, नशा मुक्ति, कुरीतियों के उन्मूलन एवं स्वावलंबन का मार्ग प्रशस्त किया। मण्डावरी धाम समाज का परम पावन तीर्थ स्थल है।"
                  : "Born in Mandawari (Lalsot, Dausa), Maharshi Balinath Ji Maharaj championed education, de-addiction, social reform, and agricultural self-reliance. Mandawari Dham is the sacred pilgrimage site of Bairwa Samaaj."}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/balinath" className="btn-primary text-xs">
                  <span>{isHindi ? "बालीनाथ जी महाराज का जीवन दर्शन" : "Explore Life & Teachings"}</span>
                  <FiArrowRight size={14} />
                </Link>
                <Link to="/history" className="btn-secondary text-xs">
                  <span>{t("navHistory")}</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-52 sm:w-64 aspect-[9/16] rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-black/60 relative group shadow-2xl">
                <img
                  src="/balinathjimaharaj.jpg"
                  alt="महर्षि बालीनाथ जी महाराज"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                    {isHindi ? "मण्डावरी धाम (दौसा)" : "Mandawari Dham (Dausa)"}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    {isHindi ? "परम पूज्य महर्षि बालीनाथ जी महाराज" : "Maharshi Balinath Ji Maharaj"}
                  </h4>
                  <p className="text-[10px] text-amber-200/80 mt-1">
                    {isHindi ? "वार्षिक जयंती: 31 दिसंबर" : "Annual Jayanti: 31 Dec"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. OUR JOURNEY (HISTORICAL TIMELINE) ================= */}
      <section className="py-16 sm:py-20 bg-[var(--surface-elevated)]/60 border-y border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-3">
            <FiClock size={13} />
            <span>{t("secJourney")}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "संस्था की ऐतिहासिक यात्रा एवं उपलब्धियाँ" : "Historic Milestones of Our Journey"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
            {t("secJourneySub")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {historicalMilestones.map((m, idx) => (
            <div key={idx} className="ka-card p-5 rounded-2xl border border-[var(--border-subtle)] flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-mono font-black text-sm mb-3">
                  {m.year}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-2 leading-snug">
                  {isHindi ? m.titleHi : m.titleEn}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {isHindi ? m.descHi : m.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 5. COMMUNITY OBJECTIVES ================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-3.5 py-1 text-xs font-bold text-[var(--accent-primary)] mb-3">
            <FiShield size={13} />
            <span>{t("secObjectives")}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "समाज सेवा व उत्थान के मुख्य संकल्प" : "Core Objectives & Social Commitments"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
            {t("secObjectivesSub")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {realCommunityObjectives.map((obj) => (
            <div key={obj.id} className="ka-card p-5 rounded-2xl border border-[var(--border-subtle)] flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-bold text-xs mb-3">
                  0{obj.id}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-1.5">
                  {isHindi ? obj.titleHi : obj.titleEn}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {isHindi ? obj.descHi : obj.descHi}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/gotras" className="btn-secondary text-xs inline-flex items-center gap-2">
            <FiLayers size={14} />
            <span>{t("secGotras")} (101 गोत्र)</span>
          </Link>
        </div>
      </section>

      {/* ================= 6. NOTICES & ANNOUNCEMENTS ================= */}
      {notices.length > 0 && (
        <section className="py-16 bg-[var(--surface-elevated)]/60 border-y border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="eyebrow-badge mb-2">
                <FiBookOpen size={13} />
                <span>{t("navNotices")}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                {isHindi ? "नवीनतम परिपत्र एवं सूचनाएँ" : "Latest Notices & Circulars"}
              </h2>
            </div>
            <Link to="/notices" className="btn-secondary text-xs">
              <span>{isHindi ? "सभी सूचनाएँ देखें" : "View All Notices"}</span>
              <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {notices.map((notice) => (
              <article key={notice._id} className="ka-card p-5 rounded-2xl border border-[var(--border-subtle)] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {notice.category || "सूचना"}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mt-1 line-clamp-2">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-3 leading-relaxed">
                    {notice.content}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>{new Date(notice.createdAt).toLocaleDateString("en-IN")}</span>
                  <Link to="/notices" className="font-bold text-[var(--accent-primary)] hover:underline">
                    {t("btnReadMore")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ================= 7. WELFARE & SCHOLARSHIP FUND ================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-4">
              <FiHeart size={13} />
              <span>{t("secWelfare")}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-3">
              {isHindi ? "शिक्षा प्रोत्साहन एवं सामाजिक सहायता कोष" : "Education Aid & Social Welfare Fund"}
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6 font-normal">
              {isHindi
                ? "प्रांतीय बैरवा प्रगति संस्था द्वारा प्राप्त सहयोग सीधे मेधावी छात्र-छात्राओं की छात्रवृत्ति, जरूरतमंद परिवारों की चिकित्सा सहायता एवं सामूहिक विवाह कार्यक्रमों में उपयोग किया जाता है।"
                : "Contributions received by Prantiya Bairwa Pragati Sanstha directly fund student scholarships, medical emergency relief for needy families, and mass marriage programs."}
            </p>

            <Link to="/donate" className="btn-primary">
              <FiHeart size={15} />
              <span>{t("secDonationBtn")}</span>
            </Link>
          </div>

          <div className="lg:col-span-6">
            <div className="ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">
                {isHindi ? "सक्रिय सहायता अभियान" : "Active Welfare Initiatives"}
              </h3>

              {[
                { titleHi: "बैरवा छात्रवृत्ति एवं प्रतिभा प्रोत्साहन कोष", titleEn: "Bairwa Student Scholarship Fund" },
                { titleHi: "सामूहिक विवाह एवं परिचय सम्मेलन संबल", titleEn: "Mass Marriage & Youth Meet Assistance" },
                { titleHi: "जरूरतमंद परिवार चिकित्सा एवं आपातकालीन सहायता", titleEn: "Emergency Medical Relief for Families" },
              ].map((c, i) => (
                <div key={i} className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">{isHindi ? c.titleHi : c.titleEn}</span>
                  <Link to="/donate" className="text-xs font-bold text-[var(--accent-primary)] hover:underline">
                    {t("navDonate")}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. DIRECT CONTACT CTA ================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="ka-card p-8 sm:p-12 text-center rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-raised)] to-[var(--surface-elevated)]">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-2">
            {isHindi ? "संस्था सचिवालय से संपर्क करें" : "Contact the Central Secretariat"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto mb-6 leading-relaxed font-normal">
            {isHindi
              ? "सदस्यता, परिचय सम्मेलन, छात्रवृत्ति या संस्था संबंधी जानकारी हेतु हमारे प्रधान कार्यालय से संपर्क करें।"
              : "For membership, youth conferences, scholarships, or general queries, contact our head office."}
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3.5">
            <a
              href="https://wa.me/919928260244"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity"
            >
              <FaWhatsapp size={16} />
              <span>WhatsApp Helpline</span>
            </a>

            <a
              href="tel:+919928260244"
              className="btn-secondary !py-2.5 !px-5 !text-xs"
            >
              <FiPhone size={14} />
              <span>+91 99282 60244</span>
            </a>

            <Link to="/contact" className="btn-secondary !py-2.5 !px-5 !text-xs">
              <FiMail size={14} />
              <span>{t("navContact")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 9. FOOTER ================= */}
      <ModernFooter />
    </div>
  );
};

export default HomePage;
