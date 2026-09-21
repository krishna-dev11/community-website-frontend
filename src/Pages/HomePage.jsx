import React, { useEffect, useState, useRef } from "react";
import { FiArrowUp } from "react-icons/fi";
import DynamicShowcaseSlider from "../Components/Core/Home/DynamicShowcaseSlider";
import HomeLiveTicker from "../Components/Core/Home/HomeLiveTicker";
import HomeHero from "../Components/Core/Home/HomeHero";
import HomeQuickActions from "../Components/Core/Home/HomeQuickActions";
import HomeAboutSection from "../Components/Core/Home/HomeAboutSection";
import HomePillarsSection from "../Components/Core/Home/HomePillarsSection";
import HomeHistoryTimeline from "../Components/Core/Home/HomeHistoryTimeline";
import HomeEventsSection from "../Components/Core/Home/HomeEventsSection";
import HomeMediaSection from "../Components/Core/Home/HomeMediaSection";
import HomeJobsSection from "../Components/Core/Home/HomeJobsSection";
import HomeScholarshipsSection from "../Components/Core/Home/HomeScholarshipsSection";
import HomeMatrimonialSection from "../Components/Core/Home/HomeMatrimonialSection";
import HomePatrikaSection from "../Components/Core/Home/HomePatrikaSection";
import HomeDharamshalaSection from "../Components/Core/Home/HomeDharamshalaSection";
import HomeServicesSection from "../Components/Core/Home/HomeServicesSection";
import HomeCommitteeSection from "../Components/Core/Home/HomeCommitteeSection";
import HomeNoticesSection from "../Components/Core/Home/HomeNoticesSection";
import HomeContributionCTA from "../Components/Core/Home/HomeContributionCTA";
import HomeHeritageFaithSection from "../Components/Core/Home/HomeHeritageFaithSection";
import HomeContactLocationSection from "../Components/Core/Home/HomeContactLocationSection";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { apiConnector } from "../services/apiConnector";
import { communityEndpoints, paymentEndpoints } from "../services/apis";
import { useLanguage } from "../i18n/LanguageContext";

/**
 * RevealSection — Lightweight IntersectionObserver wrapper for smooth viewport reveal.
 * Respects prefers-reduced-motion automatically via CSS.
 */
const RevealSection = ({ children, className = "" }) => {
  const domRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const currentTarget = domRef.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`scroll-reveal ${isVisible ? "is-revealed" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Traditional Thematic Narrative Divider between major story chapters.
 */
const ThematicDivider = ({ label }) => (
  <div className="heritage-story-divider" aria-hidden="true">
    <span>♦ ❖ ♦</span>
    {label && <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</span>}
    <span>♦ ❖ ♦</span>
  </div>
);

/**
 * HomePage Component — Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain
 * -------------------------------------------------------------------
 * Official digital community portal assembling all core sections in
 * thoughtful narrative sequence with verified milestones, real backend integrations,
 * and zero fake statistics or demo data.
 */
const HomePage = () => {
  const { isHindi } = useLanguage();

  const [achievements, setAchievements] = useState([]);
  const [supporters, setSupporters] = useState([]);
  const [supporterCampaign, setSupporterCampaign] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    // Dynamic SEO title & description
    document.title = isHindi
      ? "आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन | Official Portal"
      : "Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Official community platform of Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain — explore our history, heritage, community activities, Dharamshala, leadership and social initiatives."
      );
    }

    let isMounted = true;

    // Fetch Samaj Pride / Achievements
    apiConnector("GET", communityEndpoints.ACHIEVEMENTS_API, null, null, { limit: 12 })
      .then((res) => {
        if (!isMounted) return;
        setAchievements(res?.data?.data?.achievements || []);
      })
      .catch(() => {
        if (!isMounted) return;
        setAchievements([]);
      });

    // Fetch Community Supporters
    apiConnector("GET", paymentEndpoints.PUBLIC_SUPPORTERS_API, null, null, { limit: 12 })
      .then((res) => {
        if (!isMounted) return;
        setSupporters(res?.data?.data?.supporters || []);
        setSupporterCampaign(res?.data?.data?.campaign || null);
      })
      .catch(() => {
        if (!isMounted) return;
        setSupporters([]);
        setSupporterCampaign(null);
      });

    // Scroll listener for back-to-top button (passive)
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHindi]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Main Container with comfortable responsive spacing */}
      <main className="relative pt-20 sm:pt-24 pb-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        {/* ================= 0. LIVE TICKER ================= */}
        <RevealSection>
          <HomeLiveTicker />
        </RevealSection>

        {/* ================= 1. HERO SECTION ================= */}
        <HomeHero />

        {/* ================= 2. QUICK ACTION CARDS ================= */}
        <RevealSection>
          <HomeQuickActions />
        </RevealSection>

        {/* ================= 3. ABOUT SAMAJ & SAMITI SECTION ================= */}
        <RevealSection>
          <HomeAboutSection />
        </RevealSection>

        {/* ================= 4. MISSION / COMMUNITY PILLARS ================= */}
        <RevealSection>
          <HomePillarsSection />
        </RevealSection>

        {/* ================= 5. HISTORICAL JOURNEY (1979 - PRESENT) ================= */}
        <RevealSection>
          <HomeHistoryTimeline />
        </RevealSection>

        {/* Thematic Narrative Divider: Foundation -> Activities */}
        <ThematicDivider label={isHindi ? "सामुदायिक गतिविधियाँ एवं स्मृतियाँ" : "Community Life & Memories"} />

        {/* ================= 6. LATEST PROGRAMS / EVENTS ================= */}


        {/* ================= 7. COMMUNITY MEDIA (फोटो एवं वीडियो झलकियाँ) ================= */}
        <RevealSection>
          <HomeMediaSection />
        </RevealSection>

        {/* ================= 8. SAMAJ PRIDE / ACHIEVEMENTS ================= */}
        <RevealSection className="py-2 border-t border-[var(--border-subtle)]">
          <DynamicShowcaseSlider
            type="achievements"
            items={achievements}
            title={isHindi ? "हमारा गौरव" : "Samaj Pride"}
            subtitle={
              isHindi
                ? "समाज के प्रकाशित उपलब्धि सम्मान, शैक्षणिक गौरव और प्रेरक कार्य।"
                : "Published achievements, academic honors, and inspiring community contributions."
            }
            cta={{ to: "/achievements", label: isHindi ? "सभी उपलब्धियां देखें" : "View All Achievements" }}
          />
        </RevealSection>

        {/* ================= 9. COMMUNITY SUPPORTERS ================= */}
        <RevealSection className="py-2 border-t border-[var(--border-subtle)]">
          <DynamicShowcaseSlider
            type="supporters"
            items={supporters}
            title={isHindi ? "समुदाय सहयोगी" : "Community Supporters"}
            subtitle={
              supporterCampaign?.title
                ? `${supporterCampaign.title} - ${isHindi ? "सफल सहयोग देने वाले सदस्य" : "members who have contributed successfully"}`
                : isHindi
                ? "सफल सहयोग देने वाले सदस्यों का सम्मान।"
                : "Recognizing members who have contributed successfully to community funds."
            }
            cta={{ to: "/donate", label: isHindi ? "सहयोग करें" : "Contribute" }}
          />
        </RevealSection>

        {/* Thematic Narrative Divider: Activities -> Community Facilities */}
        <ThematicDivider label={isHindi ? "सामुदायिक संबल एवं सुविधाएं" : "Facilities & Social Welfare"} />

        {/* ================= 10. DHARAMSHALA SECTION ================= */}
        <RevealSection>
          <HomeDharamshalaSection />
        </RevealSection>

        {/* ================= 11. COMMUNITY SERVICES ================= */}
       

        {/* ================= 12. CURRENT COMMITTEE ================= */}
        <RevealSection>
          <HomeCommitteeSection />
        </RevealSection>

        {/* ================= 13. LATEST NOTICES ================= */}
        <RevealSection>
          <HomeNoticesSection />
        </RevealSection>

        {/* Thematic Narrative Divider: Services -> Opportunities */}
        <ThematicDivider label={isHindi ? "कल्याणकारी अवसर एवं संसाधन" : "Opportunities & Resources"} />

        {/* ================= 14. AVAILABLE JOBS ================= */}
        <RevealSection>
          <HomeJobsSection />
        </RevealSection>

        {/* ================= 15. SCHOLARSHIPS & EDUCATION SUPPORT ================= */}
        <RevealSection>
          <HomeScholarshipsSection />
        </RevealSection>

        {/* ================= 16. COMMUNITY MATRIMONIAL ================= */}
        <RevealSection>
          <HomeMatrimonialSection />
        </RevealSection>

        {/* ================= 17. SAMAJ PATRIKA & PUBLICATIONS ================= */}
        <RevealSection>
          <HomePatrikaSection />
        </RevealSection>

        {/* Thematic Narrative Divider: Opportunities -> Faith & Connection */}
        <ThematicDivider label={isHindi ? "सहयोग, आस्था एवं संपर्क" : "Contribution, Faith & Contact"} />

        {/* ================= 18. CONTRIBUTION / SUPPORT CTA ================= */}
        <RevealSection>
          <HomeContributionCTA />
        </RevealSection>

        {/* ================= 19. HERITAGE / FAITH SECTION ================= */}
        <RevealSection>
          <HomeHeritageFaithSection />
        </RevealSection>

        {/* ================= 20. CONTACT + LOCATION ================= */}
        <RevealSection>
          <HomeContactLocationSection />
        </RevealSection>
      </main>

      {/* Floating Back to Top Button (Placed on bottom-left to avoid chatbot collision) */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label={isHindi ? "पृष्ठ के शीर्ष पर जाएं" : "Back to top"}
        className={`fixed bottom-5 left-5 md:bottom-6 md:left-6 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/90 text-[var(--text-primary)] shadow-xl backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-600 hover:text-white cursor-pointer ${
          showBackToTop
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-6 opacity-0 pointer-events-none"
        }`}
      >
        <FiArrowUp size={18} />
      </button>

      {/* Modern Preserved Footer */}
      <ModernFooter />
    </div>
  );
};

export default HomePage;
