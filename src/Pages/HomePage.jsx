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
  FiChevronRight,
  FiPhone,
  FiMail,
  FiHome,
  FiLayers,
  FiMessageSquare,
  FiImage,
} from "react-icons/fi";
import { FaWhatsapp, FaGraduationCap, FaHeart as FaHeartSolid, FaRupeeSign } from "react-icons/fa";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import ImageSkeleton from "../Components/Common/ImageSkeleton";
import { apiConnector } from "../services/apiConnector";
import { contentEndpoints, paymentEndpoints, communityEndpoints } from "../services/apis";

const HomePage = () => {
  const { token } = useSelector((state) => state.auth);
  const [campaigns, setCampaigns] = useState([]);
  const [notices, setNotices] = useState([]);
  const [achievements, setAchievements] = useState([]);
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

    // Fetch achievements
    apiConnector("GET", communityEndpoints.ACHIEVEMENTS_API, null, null, { limit: 3 })
      .then((res) => setAchievements(res?.data?.data?.achievements || []))
      .catch(() => {});

    // Fetch Management Committee members
    apiConnector("GET", contentEndpoints.MANAGEMENT_API, null, null, { limit: 12, status: "active" })
      .then((res) => {
        const data = res?.data?.data;
        const members = Array.isArray(data) ? data : data?.members || data?.committee || [];
        setManagementMembers(members);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Background ambient glows strictly contained to prevent layout expansion */}
      <div className="overflow-hidden pointer-events-none absolute inset-0 z-0">
        <div className="page-gradient-glow -left-20 top-0 opacity-40" />
        <div className="page-gradient-glow -right-20 top-[620px] opacity-30" />
      </div>

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative pt-24 sm:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="eyebrow-badge mb-4">
              <FiShield size={13} />
              <span>Official Samaj Community Portal</span>
            </div>

            <h1 className="heading-hero text-[var(--text-primary)] mb-4 sm:mb-5">
              Uniting Families, <br />
              <span className="text-gradient">Empowering Our Samaj</span>
            </h1>

            <p className="text-sm sm:text-lg text-[var(--text-secondary)] font-normal leading-relaxed max-w-2xl mb-6 sm:mb-8">
              Welcome to the official digital platform of our Samaj. Connect with verified families across India, discover matrimonial alliances, support student scholarships, access Dharamshala bookings, and preserve our cultural heritage together.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              {!token ? (
                <Link to="/signup" className="btn-primary w-full sm:w-auto">
                  <span>Join Samaj & Register</span>
                  <FiArrowRight size={16} />
                </Link>
              ) : (
                <Link to="/dashboard/my-profile" className="btn-primary w-full sm:w-auto">
                  <span>Open Member Dashboard</span>
                  <FiArrowRight size={16} />
                </Link>
              )}

              <Link to="/about" className="btn-secondary w-full sm:w-auto">
                <span>Explore Samaj History</span>
              </Link>
            </div>

            {/* Quick Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 sm:pt-10 mt-6 sm:mt-10 border-t border-[var(--border-subtle)] w-full text-center sm:text-left">
              <div>
                <p className="text-base sm:text-2xl font-black text-[var(--text-primary)]">100%</p>
                <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5">Verified Members</p>
              </div>
              <div>
                <p className="text-base sm:text-2xl font-black text-[var(--accent-primary)]">Digital ID</p>
                <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5">Membership Cards</p>
              </div>
              <div>
                <p className="text-base sm:text-2xl font-black text-[var(--text-primary)]">Direct Aid</p>
                <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5">Education & Seva</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Area with Image Skeleton */}
          <div className="lg:col-span-5 relative">
            <div className="relative z-10 ka-card p-4 sm:p-6 shadow-2xl">
              <ImageSkeleton
                aspectRatio="aspect-[4/3]"
                label="Samaj Maha Sammelan & Heritage"
                subLabel="Official Community Gathering Photo Placeholder"
                rounded="rounded-2xl"
              />

              <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-black">
                    🏛️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">All-India Samaj Parishad</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Preserving heritage since 1952</p>
                  </div>
                </div>
                <Link to="/about" className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1">
                  Learn <FiChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. SAMAJ HIGHLIGHTS & STATISTICS ================= */}
      <section className="py-12 bg-[var(--surface-elevated)] border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center mb-3">
                <FiUsers size={22} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">15,000+</h3>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-bold mt-1">Verified Members</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-2xl bg-[var(--info)]/10 text-[var(--info)] flex items-center justify-center mb-3">
                <FiLayers size={22} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">3,200+</h3>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-bold mt-1">Registered Families</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                <FaGraduationCap size={22} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">450+</h3>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-bold mt-1">Students Awarded Aid</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                <FiHome size={22} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">8 Bhawans</h3>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-bold mt-1">Dharamshala Facilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. ABOUT SAMAJ PREVIEW ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <ImageSkeleton
              aspectRatio="aspect-[16/10]"
              label="Samaj Bhawan & Cultural Hall"
              subLabel="Community Center Photo Placeholder"
              rounded="rounded-3xl"
            />
          </div>

          <div className="order-1 lg:order-2 flex flex-col items-start">
            <div className="eyebrow-badge mb-4">
              <FiBookOpen size={13} />
              <span>Our Vision & Legacy</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] mb-4">
              Rooted in Tradition, <br />
              <span className="text-gradient">Committed to Future Generations</span>
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              For decades, our Samaj has stood as a beacon of mutual support, cultural pride, and collective welfare. We believe that when families stay connected, our youth thrive in education and careers, and our seniors receive the honor they deserve.
            </p>

            <div className="space-y-3 mb-8 w-full">
              {[
                "Preserving our ancestral Gotra lineages, traditions, and festivals.",
                "Fostering youth education through transparent merit scholarships.",
                "Safe, verified matrimonial matchmaking without commercial brokers.",
                "Subsidized lodging at prominent pilgrim towns via Samaj Dharamshalas.",
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-2.5 text-xs text-[var(--text-primary)]">
                  <FiCheckCircle className="text-[var(--accent-primary)] mt-0.5 shrink-0" size={15} />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <Link to="/about" className="btn-secondary">
              <span>Read Full History & Trustees</span>
              <FiArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 4. CORE COMMUNITY FEATURES ================= */}
      <section className="py-20 bg-[var(--surface-elevated)] border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="eyebrow-badge mx-auto mb-4">
              <FiLayers size={13} />
              <span>Platform Modules</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
              Integrated Community Services
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[var(--text-secondary)]">
              Everything verified members need to participate in Samaj activities, support students, and stay updated.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Member Directory",
                desc: "Search and connect with verified Samaj members across cities, professions, and native villages.",
                icon: FiUsers,
                color: "var(--accent-primary)",
                path: "/dashboard/directory",
              },
              {
                title: "Family Hub & SSSM ID",
                desc: "Manage household profiles, family head details, and genealogical relationships in one secure place.",
                icon: FiLayers,
                color: "#22d3ee",
                path: "/dashboard/family",
              },
              {
                title: "Matrimonial Portal",
                desc: "Verified profiles with privacy-protected contact requests, gotra matching, and moderator reviews.",
                icon: FaHeartSolid,
                color: "#f472b6",
                path: "/matrimonial",
              },
              {
                title: "Educational Scholarships",
                desc: "Apply for Samaj educational grants and merit awards with transparent committee evaluation.",
                icon: FaGraduationCap,
                color: "#fbbf24",
                path: "/scholarships",
              },
              {
                title: "Jobs & Careers",
                desc: "Community employment opportunities, internships, and hiring recommendations for youth.",
                icon: FiBriefcase,
                color: "#60a5fa",
                path: "/jobs",
              },
              {
                title: "Dharamshala Bookings",
                desc: "Check room availability and request subsidized stay at official Samaj Bhawans across India.",
                icon: FiHome,
                color: "#a78bfa",
                path: "/dashboard/community",
              },
              {
                title: "Community Issues & Polls",
                desc: "Raise local concerns, track resolution status, and vote on important community decisions.",
                icon: FiMessageSquare,
                color: "#34d399",
                path: "/dashboard/community",
              },
              {
                title: "Official Digital ID Card",
                desc: "Download verified Samaj membership cards with secure QR code verification.",
                icon: FiShield,
                color: "var(--accent-primary)",
                path: "/dashboard/my-profile",
              },
              {
                title: "Donations & Seva",
                desc: "Contribute to education funds, bhawan maintenance, and social assistance with instant receipts.",
                icon: FiHeart,
                color: "#f87171",
                path: "/donate",
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  to={card.path}
                  className="ka-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-200 text-decoration-none group"
                >
                  <div>
                    <div
                      className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4 border"
                      style={{
                        backgroundColor: `${card.color}15`,
                        borderColor: `${card.color}30`,
                        color: card.color,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2 font-normal">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-bold text-[var(--accent-primary)]">
                    <span>Access Module</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 5. UPCOMING EVENTS & CIRCULARS ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="eyebrow-badge mb-3">
              <FiCalendar size={13} />
              <span>Notices & Events</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Latest Circulars & Announcements
            </h2>
          </div>
          <Link to="/notices" className="btn-secondary text-xs">
            <span>View All Notices</span>
            <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {notices.length > 0 ? (
            notices.map((notice) => (
              <article key={notice._id} className="ka-card p-5 flex flex-col justify-between">
                <div>
                  <ImageSkeleton
                    aspectRatio="aspect-[16/9]"
                    label="Notice Attachment"
                    subLabel="Official circular photo"
                    rounded="rounded-2xl"
                    className="mb-4"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                    {notice.category || "General Notice"}
                  </span>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mt-1.5 line-clamp-2">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-3 leading-relaxed">
                    {notice.content}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>{new Date(notice.createdAt).toLocaleDateString("en-IN")}</span>
                  <Link to="/notices" className="font-bold text-[var(--accent-primary)] hover:underline">
                    Read More
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <>
              {[
                { title: "Annual Samaj General Body Meeting 2026", date: "15 Oct 2026", cat: "Samaj Sabha" },
                { title: "Merit Scholarship Applications Open for 2026-27", date: "01 Nov 2026", cat: "Scholarship" },
                { title: "Shri Krishna Janmashtami Mahotsav & Pujan", date: "28 Aug 2026", cat: "Cultural Festival" },
              ].map((item, idx) => (
                <article key={idx} className="ka-card p-5 flex flex-col justify-between">
                  <div>
                    <ImageSkeleton
                      aspectRatio="aspect-[16/9]"
                      label="Event Banner Placeholder"
                      subLabel="Samaj program poster"
                      rounded="rounded-2xl"
                      className="mb-4"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                      {item.cat}
                    </span>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mt-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Official notification for Samaj members regarding timing, venue arrangements, and participation guidelines.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>{item.date}</span>
                    <Link to="/notices" className="font-bold text-[var(--accent-primary)] hover:underline">
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </>
          )}
        </div>
      </section>

      {/* ================= 6. COMMUNITY ACHIEVEMENTS ================= */}
      <section className="py-20 bg-[var(--surface-elevated)] border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="eyebrow-badge mb-3">
                <FiAward size={13} />
                <span>Pride of Samaj</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                Community Achievements & Milestones
              </h2>
            </div>
            <Link to="/achievements" className="btn-secondary text-xs">
              <span>View All Achievements</span>
              <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {achievements.length > 0 ? (
              achievements.map((ach) => (
                <div key={ach._id} className="ka-card p-5 flex flex-col justify-between">
                  <div>
                    {ach.recipientPhoto?.url || ach.image?.url ? (
                      <div className="mb-4 w-full aspect-[9/16] max-h-72 rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-md">
                        <img
                          src={ach.recipientPhoto?.url || ach.image?.url}
                          alt={ach.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <ImageSkeleton
                        aspectRatio="aspect-[9/16]"
                        label="Achievement Photo"
                        subLabel="Honoree certificate/photo"
                        rounded="rounded-2xl"
                        className="mb-4 max-h-72"
                      />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                      {ach.category || "Honour"}
                    </span>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">{ach.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-3 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                    <span>Honoree: <strong className="text-[var(--text-primary)]">{ach.achieverName || ach.member?.firstName || "Community Member"}</strong></span>
                    {ach.year && <span className="font-mono text-[var(--accent-primary)] font-bold">{ach.year}</span>}
                  </div>
                </div>
              ))
            ) : (
              <>
                {[
                  { title: "Dr. Rameshwar Gothwal awarded National Medical Excellence", desc: "Recognized by the Ministry of Health for exemplary service in rural community healthcare." },
                  { title: "Pooja Verma clears UPSC Civil Services Examination", desc: "Secured All-India Rank 142 and selected for Indian Administrative Service (IAS)." },
                  { title: "Rajesh Sharma wins Gold at National Youth Athletics", desc: "Represented state at the Khelo India Games and broke the 400m track record." },
                ].map((item, idx) => (
                  <div key={idx} className="ka-card p-5 flex flex-col justify-between">
                    <div>
                      <ImageSkeleton
                        aspectRatio="aspect-[9/16]"
                        label="Member Milestone Placeholder"
                        subLabel="Achievement photo will be added here"
                        rounded="rounded-2xl"
                        className="mb-4 max-h-72"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                        Samaj Gaurav
                      </span>
                      <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">{item.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                      Verified Samaj Recognition
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ================= 7. DONATIONS & SEVA INITIATIVES ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="eyebrow-badge mb-4">
              <FiHeart size={13} />
              <span>Community Seva & Welfare</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] mb-4">
              Support Our Educational & Social Funds
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6 font-normal">
              Every rupee donated is directly deployed toward needy student scholarships, medical emergency relief for Samaj families, and the maintenance of pilgrim Dharamshalas. We provide instant tax-deductible receipts for all online contributions.
            </p>

            <div className="space-y-3 mb-8 w-full">
              {[
                "100% transparent fund utilization reviewed by the elected Trust committee.",
                "Direct bank disbursement to student tuition accounts.",
                "Instant electronic receipt generated upon successful donation.",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-[var(--text-primary)]">
                  <FiCheckCircle className="text-[var(--accent-primary)] shrink-0" size={15} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Link to="/donate" className="btn-primary">
              <FiHeart size={15} />
              <span>Donate Online Now</span>
            </Link>
          </div>

          <div className="lg:col-span-6">
            <div className="ka-card p-6">
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">
                Active Welfare Campaigns
              </h3>

              <div className="space-y-4">
                {campaigns.length > 0 ? (
                  campaigns.map((camp) => (
                    <div key={camp._id} className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{camp.title}</h4>
                        <span className="text-[10px] font-bold text-[var(--accent-primary)]">
                          Rs. {Number(camp.raisedAmount || 0).toLocaleString("en-IN")} raised
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                        <div
                          className="h-full rounded-full bg-[var(--accent-primary)]"
                          style={{
                            width: `${camp.goalAmount ? Math.min(100, Math.round(((camp.raisedAmount || 0) / camp.goalAmount) * 100)) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {[
                      { title: "Samaj Higher Education Scholarship Fund 2026", raised: "Rs. 4,80,000", goal: "Rs. 10,00,000", pct: 48 },
                      { title: "Haridwar Samaj Bhawan Renovation Project", raised: "Rs. 8,20,000", goal: "Rs. 15,00,000", pct: 54 },
                      { title: "Senior Citizen Emergency Medical Relief Pool", raised: "Rs. 3,10,000", goal: "Rs. 5,00,000", pct: 62 },
                    ].map((camp, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">{camp.title}</h4>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Goal: {camp.goal}</p>
                          </div>
                          <span className="text-xs font-bold text-[var(--accent-primary)] font-mono">
                            {camp.raised}
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                          <div
                            className="h-full rounded-full bg-[var(--accent-primary)]"
                            style={{ width: `${camp.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. DHARAMSHALA & GUEST HOUSE PREVIEW ================= */}
      <section className="py-20 bg-[var(--surface-elevated)] border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="eyebrow-badge mx-auto mb-4">
              <FiHome size={13} />
              <span>Pilgrim Lodging</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
              Samaj Dharamshala Network
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[var(--text-secondary)]">
              Clean, affordable, and family-friendly accommodation reserved for verified Samaj members.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { city: "Haridwar, Uttarakhand", name: "Shri Samaj Bhawan & Yatri Niwas", rooms: "24 AC / Non-AC Rooms", dist: "200m from Har Ki Pauri" },
              { city: "Mathura - Vrindavan, UP", name: "Samaj Seva Sadan & Hall", rooms: "18 AC Rooms & Banquet", dist: "Near Prem Mandir" },
              { city: "Pushkar, Rajasthan", name: "Samaj Vishram Griha", rooms: "15 Rooms & Dining Hall", dist: "Close to Brahma Temple" },
            ].map((dh, idx) => (
              <div key={idx} className="ka-card p-5 flex flex-col justify-between">
                <div>
                  <ImageSkeleton
                    aspectRatio="aspect-[16/10]"
                    label={`${dh.city} Bhawan`}
                    subLabel="Guest house photo placeholder"
                    rounded="rounded-2xl"
                    className="mb-4"
                  />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                    {dh.city}
                  </p>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">
                    {dh.name}
                  </h3>
                  <div className="mt-3 space-y-1 text-xs text-[var(--text-muted)]">
                    <p>🛏️ {dh.rooms}</p>
                    <p>📍 {dh.dist}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)]">Subsidized Member Rates</span>
                  <Link to="/dharamshala" className="text-xs font-bold text-[var(--accent-primary)] hover:underline">
                    Check Dates →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SAMAJ PRIDE / OUR ACHIEVERS CAROUSEL ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="eyebrow-badge mb-3">
              <FiAward size={13} />
              <span>Community Pride</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Samaj Pride & Achievers
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
              Celebrating verified community stars in academics, public service, sports, and entrepreneurship.
            </p>
          </div>
          <Link to="/achievements" className="btn-secondary text-xs">
            <span>View All Achievers</span>
            <FiArrowRight size={14} />
          </Link>
        </div>

        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((item) => (
              <div key={item._id} className="ka-card p-5 flex flex-col justify-between group hover:border-[var(--accent-primary)]/40 transition-all">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative shrink-0">
                      <img
                        src={item.image?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.achieverName || "Achiever")}`}
                        alt={item.achieverName}
                        className="h-16 w-16 rounded-2xl object-cover border-2 border-[var(--accent-primary)]/40 shadow-md group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-primary)] text-black font-bold text-[10px]" title="Verified Achiever">
                        ✓
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="rounded-md bg-[var(--accent-primary)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                        {item.category || "Honor"}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-[var(--text-primary)] truncate">
                        {item.achieverName}
                      </h3>
                      {item.year && (
                        <p className="text-[11px] text-[var(--text-muted)]">Year: {item.year}</p>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>{item.organization || "Samaj Certified"}</span>
                  <Link to="/achievements" className="text-xs font-bold text-[var(--accent-primary)] hover:underline">
                    Read Story →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Aarav Gothwal", title: "IAS Rank 42 - UPSC CSE", cat: "Civil Services", yr: "2025", desc: "Secured All India Rank 42 in the Civil Services Examination, serving as Assistant Collector." },
              { name: "Priya Sharma", title: "Gold Medalist - IIT Bombay", cat: "Academics", yr: "2025", desc: "Awarded President's Gold Medal for academic excellence in Computer Science and Engineering." },
              { name: "Rohan Verma", title: "National Badminton Champion", cat: "Sports", yr: "2024", desc: "Won gold in the National U-21 Men's Singles championship representing state." },
            ].map((mock, idx) => (
              <div key={idx} className="ka-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-2xl bg-[var(--accent-primary)]/10 border-2 border-[var(--accent-primary)]/30 flex items-center justify-center text-[var(--accent-primary)] font-black text-xl">
                      {mock.name[0]}
                    </div>
                    <div>
                      <span className="rounded-md bg-[var(--accent-primary)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                        {mock.cat}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-[var(--text-primary)]">
                        {mock.name}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)]">Year: {mock.yr}</p>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                    {mock.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {mock.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Samaj Pride Verified</span>
                  <Link to="/achievements" className="text-xs font-bold text-[var(--accent-primary)] hover:underline">
                    View Story →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= 9. COMMUNITY GALLERY PREVIEW ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="eyebrow-badge mb-3">
              <FiImage size={13} />
              <span>Memories & Media</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Photo & Video Gallery
            </h2>
          </div>
          <Link to="/gallery" className="btn-secondary text-xs">
            <span>View Full Gallery</span>
            <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "National Youth Conference 2025",
            "Maha Pujan & Ganga Aarti",
            "Annual Sports & Athletics Meet",
            "Samaj Mahila Mandal Sammelan",
          ].map((title, idx) => (
            <div key={idx} className="ka-card p-3 flex flex-col">
              <ImageSkeleton
                aspectRatio="aspect-[4/3]"
                label={`Album Photo #${idx + 1}`}
                subLabel={title}
                rounded="rounded-xl"
              />
              <p className="mt-2 text-xs font-bold text-[var(--text-primary)] truncate text-center">
                {title}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 10. MEMBERSHIP VERIFICATION CTA ================= */}
      <section className="py-20 bg-[var(--surface-elevated)] border-y border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="eyebrow-badge mx-auto mb-4">
            <FiShield size={13} />
            <span>Digital Identity</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] mb-4">
            Get Your Official Digital Samaj Membership Card
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto mb-10 font-normal">
            Join thousands of registered Samaj members. Registration is verified by local Samaj moderators to maintain platform authenticity and protect family privacy.
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-left mb-10">
            <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]">
              <div className="h-8 w-8 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-black text-xs flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Online Registration</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Submit basic family details and upload identity verification document.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]">
              <div className="h-8 w-8 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-black text-xs flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Committee Approval</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Administrators inspect application details in the verification queue.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]">
              <div className="h-8 w-8 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-black text-xs flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Download Card (PDF)</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Instant access to digital membership card with verified QR seal.
              </p>
            </div>
          </div>

          {!token ? (
            <Link to="/signup" className="btn-primary inline-flex">
              <span>Start Registration</span>
              <FiArrowRight size={16} />
            </Link>
          ) : (
            <Link to="/dashboard/my-profile" className="btn-primary inline-flex">
              <span>View My Membership Card</span>
              <FiArrowRight size={16} />
            </Link>
          )}
        </div>
      </section>

      {/* ================= 11. MANAGEMENT COMMITTEE ================= */}
      <section className="py-20 bg-[var(--surface-elevated)] border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="eyebrow-badge mb-3">
                <FiUsers size={13} />
                <span>Our Leadership</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                Samaj Management Committee
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl">
                Our elected committee members dedicate their time and expertise to serve the community and uphold our shared values.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {(managementMembers.length > 0 ? managementMembers : [
              { name: "Smt. Priya Sharma", designation: "President", tenure: "2024–2026" },
              { name: "Shri Ramesh Gupta", designation: "Vice President", tenure: "2024–2026" },
              { name: "Smt. Kavita Joshi", designation: "Secretary", tenure: "2024–2026" },
              { name: "Shri Mahesh Verma", designation: "Joint Secretary", tenure: "2024–2026" },
              { name: "Smt. Sunita Agarwal", designation: "Treasurer", tenure: "2024–2026" },
              { name: "Shri Anil Gothwal", designation: "Executive Member", tenure: "2024–2026" },
            ]).map((member, idx) => (
              <div
                key={member._id || idx}
                className="group flex flex-col items-center text-center gap-3 ka-card p-4 rounded-2xl hover:border-[var(--accent-primary)]/40 transition-all duration-300"
              >
                {/* Portrait Image */}
                <div className="w-full aspect-[9/16] max-h-44 sm:max-h-52 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-md group-hover:shadow-emerald-500/10 transition-shadow">
                  {member.photo?.url ? (
                    <img
                      src={member.photo.url}
                      alt={member.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/15 flex items-center justify-center">
                          <FiUsers size={20} className="text-[var(--accent-primary)]" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2">
                          {member.name?.split(" ")[1]?.[0] || ""}{member.name?.split(" ")[2]?.[0] || ""}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="w-full min-w-0">
                  <p className="text-[11px] sm:text-xs font-black text-[var(--text-primary)] truncate leading-snug">
                    {member.name}
                  </p>
                  <p className="text-[10px] font-bold text-[var(--accent-primary)] mt-0.5 truncate">
                    {member.designation}
                  </p>
                  {member.tenure && (
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5 truncate">
                      {member.tenure}
                    </p>
                  )}
                  {member.contact?.phone && (
                    <a
                      href={`tel:${member.contact.phone}`}
                      className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      <FiPhone size={9} />
                      <span className="truncate">{member.contact.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 12. DIRECT CONTACT CTA ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="ka-card p-8 sm:p-12 text-center relative overflow-hidden bg-gradient-to-br from-[var(--surface-raised)] via-[var(--surface)] to-[var(--surface-elevated)]">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-3">
            Have Questions or Need Assistance?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto mb-8 leading-relaxed font-normal">
            Our Samaj Central Secretariat team is available Monday to Saturday to assist you with registration, matrimonial profiles, or scholarships.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity"
            >
              <FaWhatsapp size={16} />
              <span>WhatsApp Helpdesk</span>
            </a>

            <Link to="/contact" className="btn-secondary">
              <FiMail size={15} />
              <span>Contact Secretariat</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 12. FOOTER ================= */}
      <ModernFooter />
    </div>
  );
};

export default HomePage;
