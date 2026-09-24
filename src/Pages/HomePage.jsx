import React, { useEffect, useState, useRef } from "react";
import { FiArrowUp } from "react-icons/fi";

import SamajHeroSlider from "../Components/Core/Home/SamajHeroSlider";
import HomeLiveTicker from "../Components/Core/Home/HomeLiveTicker";
import HomeQuickActions from "../Components/Core/Home/HomeQuickActions";
import HomeAboutSection from "../Components/Core/Home/HomeAboutSection";
import HomeHistoryTimeline from "../Components/Core/Home/HomeHistoryTimeline";
import HomeMediaSection from "../Components/Core/Home/HomeMediaSection";
import HomeGallerySection from "../Components/Core/Home/HomeGallerySection";
import SamajVideosSection from "../Components/Core/Home/SamajVideosSection";
import DynamicShowcaseSlider from "../Components/Core/Home/DynamicShowcaseSlider";
import HomeDharamshalaSection from "../Components/Core/Home/HomeDharamshalaSection";
import HomeCommitteeSection from "../Components/Core/Home/HomeCommitteeSection";
import HomeNoticesSection from "../Components/Core/Home/HomeNoticesSection";
import HomeJobsSection from "../Components/Core/Home/HomeJobsSection";
import HomeScholarshipsSection from "../Components/Core/Home/HomeScholarshipsSection";
import HomeMatrimonialSection from "../Components/Core/Home/HomeMatrimonialSection";
import HomePatrikaSection from "../Components/Core/Home/HomePatrikaSection";
import HomeContributionCTA from "../Components/Core/Home/HomeContributionCTA";
import HomeContactLocationSection from "../Components/Core/Home/HomeContactLocationSection";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { apiConnector } from "../services/apiConnector";
import { communityEndpoints, paymentEndpoints } from "../services/apis";
import { useLanguage } from "../i18n/LanguageContext";

/**
 * RevealSection — Lightweight IntersectionObserver scroll-reveal wrapper.
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
      { threshold: 0.06, rootMargin: "0px 0px -30px 0px" }
    );
    const currentTarget = domRef.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => { if (currentTarget) observer.unobserve(currentTarget); };
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
 * Simple thin section divider.
 */
const SectionDivider = () => (
  <hr className="border-stone-200 dark:border-stone-800" />
);

/**
 * HomePage — Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain
 * -------------------------------------------------------------------
 * Simple, clean, trustworthy community portal homepage.
 * Visual priority: Image Slider → Content sections.
 * No luxury landing page aesthetics.
 */
const HomePage = () => {
  const { isHindi } = useLanguage();
  const [achievements, setAchievements] = useState([]);
  const [supporters, setSupporters] = useState([]);
  const [supporterCampaign, setSupporterCampaign] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    // SEO
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

    apiConnector("GET", communityEndpoints.ACHIEVEMENTS_API, null, null, { limit: 12 })
      .then((res) => { if (isMounted) setAchievements(res?.data?.data?.achievements || []); })
      .catch(() => { if (isMounted) setAchievements([]); });

    apiConnector("GET", paymentEndpoints.PUBLIC_SUPPORTERS_API, null, null, { limit: 12 })
      .then((res) => {
        if (!isMounted) return;
        setSupporters(res?.data?.data?.supporters || []);
        setSupporterCampaign(res?.data?.data?.campaign || null);
      })
      .catch(() => { if (isMounted) { setSupporters([]); setSupporterCampaign(null); } });

    const handleScroll = () => setShowBackToTop(window.scrollY > 450);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => { isMounted = false; window.removeEventListener("scroll", handleScroll); };
  }, [isHindi]);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      <main className="relative pt-16 sm:pt-20 pb-12">

        {/* ─── 0. NOTICE TICKER ────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
          <HomeLiveTicker />
        </div>

        {/* ─── 1. HERO IMAGE SLIDER ────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-5">
          <SamajHeroSlider />
        </div>

        {/* ─── 2. QUICK ACTION LINKS ───────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-8 sm:mt-10">
          <RevealSection>
            <HomeQuickActions />
          </RevealSection>
        </div>

        {/* ─── 3. ABOUT SAMAJ ──────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <HomeAboutSection />
          </RevealSection>
        </div>

        {/* ─── 4. HISTORY TIMELINE ─────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <HomeHistoryTimeline />
          </RevealSection>
        </div>

        {/* ─── 5. NOTICES / UPDATES ────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <HomeNoticesSection />
          </RevealSection>
        </div>

        {/* ─── 6. PHOTO GALLERY ────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <HomeGallerySection />
          </RevealSection>
        </div>

        {/* ─── 7. YOUTUBE / VIDEOS ─────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <SamajVideosSection />
          </RevealSection>
        </div>

        {/* ─── 8. SAMAJ PRIDE / ACHIEVEMENTS ──────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
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
        </div>

        {/* ─── 9. DHARAMSHALA ──────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <HomeDharamshalaSection />
          </RevealSection>
        </div>

        {/* ─── 10. MANAGEMENT COMMITTEE ────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <HomeCommitteeSection />
          </RevealSection>
        </div>

        {/* ─── 11. JOBS / SCHOLARSHIPS / MATRIMONIAL ───────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <HomeJobsSection />
          </RevealSection>
        </div>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <HomeScholarshipsSection />
          </RevealSection>
        </div>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <HomeMatrimonialSection />
          </RevealSection>
        </div>

        {/* ─── 12. SAMAJ PATRIKA ───────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <HomePatrikaSection />
          </RevealSection>
        </div>

        {/* ─── 13. COMMUNITY SUPPORTERS ────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
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
        </div>

        {/* ─── 14. CONTRIBUTION / SUPPORT CTA ─────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <HomeContributionCTA />
          </RevealSection>
        </div>

        {/* ─── 15. CONTACT + LOCATION ──────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <SectionDivider />
          <RevealSection className="mt-10 sm:mt-12">
            <HomeContactLocationSection />
          </RevealSection>
        </div>

      </main>

      {/* Floating Back to Top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={isHindi ? "पृष्ठ के शीर्ष पर जाएं" : "Back to top"}
        className={`fixed bottom-5 left-5 md:bottom-6 md:left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 shadow-md hover:bg-[#14532d] hover:border-[#14532d] hover:text-white transition-all duration-300 cursor-pointer ${
          showBackToTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <FiArrowUp size={18} />
      </button>

      <ModernFooter />
    </div>
  );
};

export default HomePage;
