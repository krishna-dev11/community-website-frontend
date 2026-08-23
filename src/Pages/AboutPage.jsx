import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiShield,
  FiAward,
  FiUsers,
  FiHeart,
  FiBookOpen,
  FiArrowRight,
  FiCheckCircle,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import ImageSkeleton from "../Components/Common/ImageSkeleton";

const AboutPage = () => {
  const { token } = useSelector((state) => state.auth);

  return (
    <div className="w-full min-h-screen bg-[var(--bg)] text-[var(--text-primary)] overflow-x-hidden font-sans transition-colors duration-300">
      {/* Background Glows */}
      <div className="page-gradient-glow left-[-100px] top-0 opacity-40" />
      <div className="page-gradient-glow right-[-100px] top-[700px] opacity-30" />

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow-badge mx-auto mb-4">
            <FiShield size={13} />
            <span>About Samaj Community</span>
          </div>

          <h1 className="heading-hero text-[var(--text-primary)] mb-5">
            A Legacy of Unity, Service & <br />
            <span className="text-gradient">Cultural Heritage</span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
            For generations, our Samaj has worked tirelessly to unite families, support our youth in higher education, protect ancestral values, and provide social security to every member across India and abroad.
          </p>
        </div>
      </section>

      {/* ================= 2. FOUNDING STORY & HERITAGE ================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <ImageSkeleton
              aspectRatio="aspect-[16/11]"
              label="Historical Samaj Convention & Elders"
              subLabel="Archive photograph placeholder"
              rounded="rounded-3xl"
            />
          </div>

          <div className="flex flex-col items-start">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-primary)] mb-2">
              Our Roots & History
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-4 leading-snug">
              Preserving Gotra Traditions & Fostering Brotherhood
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Established as an all-India registered community trust, the Samaj was founded by community visionaries who recognized the need for an organized platform to maintain genealogical records, provide student scholarships, and establish pilgrim guest houses (Dharamshalas).
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
              Today, with modern technology, our digital portal brings every family into one transparent network while safeguarding member privacy and Gotra lineages.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-[var(--border-subtle)]">
              <div>
                <p className="text-2xl font-black text-[var(--accent-primary)]">1952</p>
                <p className="text-xs text-[var(--text-muted)]">Founding Year</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[var(--text-primary)]">All-India</p>
                <p className="text-xs text-[var(--text-muted)]">Registered Community Trust</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. MISSION, VISION & CORE VALUES ================= */}
      <section className="py-20 bg-[var(--surface-elevated)] border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="eyebrow-badge mx-auto mb-3">
              <FiAward size={13} />
              <span>Guiding Principles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Our Mission, Vision & Core Values
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="ka-card p-6 flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center mb-4">
                  <FiUsers size={22} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Family Unity & Brotherhood</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2.5">
                  Bringing every Samaj household together into a verified genealogical network, fostering lifelong bonds, and ensuring no family is left behind.
                </p>
              </div>
            </div>

            <div className="ka-card p-6 flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                  <FaGraduationCap size={22} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Youth Education & Merit Aid</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2.5">
                  Ensuring no bright student in the community drops out due to financial hardship through transparent, direct scholarship grants and career guidance.
                </p>
              </div>
            </div>

            <div className="ka-card p-6 flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                  <FiHeart size={22} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Selfless Seva & Social Welfare</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2.5">
                  Providing pilgrim Dharamshala accommodations, senior citizen medical relief pools, and community assistance during emergency times.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. MILESTONES & TIMELINE ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="eyebrow-badge mx-auto mb-3">
            <FiCalendar size={13} />
            <span>Community Journey</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            Milestones of Our Samaj
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { year: "1952", title: "Trust Established", desc: "First official all-India registration and constitution adopted by community elders." },
            { year: "1978", title: "First Samaj Bhawan", desc: "Inauguration of the flagship Haridwar Dharamshala for community pilgrims." },
            { year: "2005", title: "Scholarship Endowment", desc: "Creation of the dedicated higher education fund assisting hundreds of college students." },
            { year: "2026", title: "Digital Community Portal", desc: "Launch of the official web application with verified digital ID cards and matrimonial system." },
          ].map((item, idx) => (
            <div key={idx} className="ka-card p-6 flex flex-col">
              <span className="text-2xl font-black text-[var(--accent-primary)] font-mono mb-2">
                {item.year}
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">{item.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 5. MANAGEMENT & TRUSTEE PREVIEW ================= */}
      <section className="py-20 bg-[var(--surface-elevated)] border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="eyebrow-badge mx-auto mb-3">
              <FiShield size={13} />
              <span>Governing Council</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Executive Committee & Trustees
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[var(--text-secondary)]">
              Elected community leaders serving honorary terms to oversee social welfare, Dharamshala facilities, and education funds.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: "National President", title: "Shri Ramswaroop Gothwal", tenure: "Executive Council" },
              { role: "General Secretary", title: "Shri Mahaveer Prasad Verma", tenure: "Executive Council" },
              { role: "Treasurer & Finance", title: "Shri Kailash Chand Sharma", tenure: "Executive Council" },
              { role: "Matrimonial Moderator", title: "Smt. Shanti Devi Gothwal", tenure: "Welfare Committee" },
            ].map((member, idx) => (
              <div key={idx} className="ka-card p-5 text-center flex flex-col items-center">
                <ImageSkeleton
                  aspectRatio="aspect-square"
                  label="Trustee Portrait"
                  subLabel={member.title}
                  rounded="rounded-2xl"
                  className="w-32 h-32 mb-4"
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                  {member.role}
                </span>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mt-1">{member.title}</h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">{member.tenure}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 6. JOIN CTA ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="ka-card p-10 sm:p-14 bg-gradient-to-br from-[var(--surface-raised)] via-[var(--surface)] to-[var(--surface-elevated)]">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-3">
            Be Part of Our Growing Samaj Family
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto mb-8 leading-relaxed font-normal">
            Register your family profile today to receive your digital membership card, apply for scholarships, or connect with verified matrimonial profiles.
          </p>

          {!token ? (
            <Link to="/signup" className="btn-primary inline-flex">
              <span>Register as a Member</span>
              <FiArrowRight size={16} />
            </Link>
          ) : (
            <Link to="/dashboard/directory" className="btn-primary inline-flex">
              <span>Explore Member Directory</span>
              <FiArrowRight size={16} />
            </Link>
          )}
        </div>
      </section>

      <ModernFooter />
    </div>
  );
};

export default AboutPage;
