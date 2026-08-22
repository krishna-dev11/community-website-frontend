// import React from "react";
// import { FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaArrowUp } from "react-icons/fa";
// import { FiArrowUpRight } from "react-icons/fi";
// import { Link } from "react-router-dom";

// const FooterLink = ({ to, children }) => (
//   <li>
//     <Link to={to} className="text-[#6b7280] hover:text-[#ffffff] transition-all duration-300 flex items-center gap-1 group">
//       <span className="w-0 h-[1px] bg-[#10b981] group-hover:w-3 transition-all"></span>
//       {children}
//     </Link>
//   </li>
// );

// const ModernFooter = () => {
//   const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

//   return (
//     <footer className="relative bg-[#000000] text-[#ffffff] pt-24 pb-12 px-6 overflow-hidden border-t border-[#ffffff]/5 font-sans">
      
      
//       <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 select-none pointer-events-none z-0">
//         <h1 className="text-[10rem] md:text-[18rem] font-bold text-[#ffffff]/[0.02] tracking-[0.1em] uppercase leading-none">
//           Bold Voice
//         </h1>
//       </div>

//       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[#10b981]/5 blur-[120px] rounded-full pointer-events-none" />

//       <div className="relative z-10 max-w-7xl mx-auto">
        
        
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-20">
//           <div className="flex flex-col gap-6">
            
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-[#6A0DAD]/20 flex items-center justify-center border border-[#6A0DAD]/30 shadow-lg shrink-0">
//                 <span className="text-[#ffffff] font-black text-lg">B</span>
//               </div>
//               <h2 className="text-3xl font-bold bg-gradient-to-r from-[#ffffff] to-[#6b7280] bg-clip-text text-transparent tracking-tight">
//                 Bold Voice Spoken English
//               </h2>
//             </div>
            
            
//             <p className="text-[#9ca3af] text-lg max-w-md font-light leading-relaxed">
//               With <span className="text-[#10b981] font-medium">22 years of excellence</span>, we help students 
//               build confidence in spoken English, personality development, and communication skills 
//               through practical learning methods.
//             </p>
            
//             <div className="flex gap-4 mt-4">
//               {[FaYoutube, FaInstagram, FaTwitter, FaLinkedin].map((Icon, i) => (
//                 <div key={i} className="w-10 h-10 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center cursor-pointer hover:bg-[#ffffff] hover:text-[#000000] transition-all duration-500 shadow-lg">
//                   <Icon size={18} />
//                 </div>
//               ))}
//             </div>
//           </div>

          
//           <div className="bg-[#ffffff]/[0.02] border border-[#ffffff]/5 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
//             <div className="absolute top-0 right-0 w-24 h-24 bg-[#6A0DAD]/10 blur-3xl rounded-full" />
            
//             <h3 className="text-[#ffffff] font-bold text-xl mb-4 flex items-center gap-2 uppercase tracking-tighter">
//               Get Admission Updates <FiArrowUpRight className="text-[#10b981]" />
//             </h3>
            
//             <p className="text-[#6b7280] text-xs font-bold uppercase tracking-widest mb-6">
//               Receive course details & batch notifications.
//             </p>
            
//             <div className="flex bg-[#ffffff]/5 border border-[#ffffff]/10 rounded-2xl p-2 focus-within:border-[#ffffff]/20 transition-all shadow-inner">
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 className="bg-transparent outline-none text-[#ffffff] px-4 py-2 w-full text-sm placeholder-[#4b5563]"
//               />
//               <button className="bg-[#ffffff] text-[#000000] px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#10b981] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
//                 Subscribe
//               </button>
//             </div>
//           </div>
//         </div>

        
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-10 border-t border-[#ffffff]/5 pt-12">
          
//           <div>
//             <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#10b981] mb-6">Quick Links</h4>
//             <ul className="space-y-4 text-xs font-bold tracking-widest uppercase">
//               <FooterLink to="/">Home</FooterLink>
//               <FooterLink to="/courses">Courses</FooterLink>
//               <FooterLink to="/about">About Institute</FooterLink>
//               <FooterLink to="/contact">Contact</FooterLink>
//             </ul>
//           </div>

//           <div>
//             <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#10b981] mb-6">Our Programs</h4>
//             <ul className="space-y-4 text-xs text-[#6b7280] font-bold tracking-widest uppercase">
//               <li className="hover:text-[#ffffff] transition-colors cursor-pointer">Foundation English</li>
//               <li className="hover:text-[#ffffff] transition-colors cursor-pointer">Fluent English</li>
//               <li className="hover:text-[#ffffff] transition-colors cursor-pointer">Business English</li>
//               <li className="hover:text-[#ffffff] transition-colors cursor-pointer">Handwriting Course</li>
//             </ul>
//           </div>

//           <div className="col-span-2 flex flex-col items-end justify-end">
//             <button 
//               onClick={scrollToTop}
//               className="relative w-14 h-14 rounded-2xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center hover:bg-[#10b981] hover:text-[#000000] transition-all duration-500 group shadow-2xl"
//             >
//               <div className="absolute -inset-2 bg-[#10b981]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
//               <FaArrowUp size={20} className="relative z-10 group-hover:-translate-y-1 transition-transform" />
//             </button>
//             <p className="text-[#4b5563] text-[9px] mt-4 font-bold uppercase tracking-[0.4em]">Back to Top</p>
//           </div>
//         </div>

        
//         <div className="border-t border-[#ffffff]/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-bold tracking-[0.3em] text-[#4b5563]">
//           <p>© {new Date().getFullYear()} BOLD VOICE SPOKEN ENGLISH INSTITUTE. ALL RIGHTS RESERVED.</p>
//           <div className="flex gap-8 uppercase">
//             <span className="hover:text-[#ffffff] cursor-pointer transition-colors">Privacy Policy</span>
//             <span className="hover:text-[#ffffff] cursor-pointer transition-colors">Terms & Conditions</span>
//           </div>
//         </div>

//       </div>
//     </footer>
//   );
// };

// export default ModernFooter;






import React from "react";
import {
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
  FaArrowUp,
  FaFacebookF,
} from "react-icons/fa";
import { FiArrowUpRight, FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-300 flex items-center gap-1 group"
    >
      <span className="w-0 h-[1px] bg-[var(--accent-primary)] group-hover:w-3 transition-all duration-300"></span>
      {children}
    </Link>
  </li>
);

const ExternalFooterLink = ({ href, children }) => (
  <li>
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-300 flex items-center gap-1 group"
    >
      <span className="w-0 h-[1px] bg-[var(--accent-primary)] group-hover:w-3 transition-all duration-300"></span>
      {children}
    </a>
  </li>
);

const ModernFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="relative bg-[var(--bg)] text-[var(--text-primary)] pt-24 pb-10 px-6 overflow-hidden border-t border-[var(--border-subtle)] font-sans">

      {/* Background Watermark */}
      <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 select-none pointer-events-none z-0">
        <h1 className="text-[8rem] md:text-[15rem] lg:text-[18rem] font-bold text-[var(--text-primary)]/[0.02] tracking-[0.08em] uppercase leading-none whitespace-nowrap">
          SAMAJ
        </h1>
      </div>

      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[var(--accent-primary)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* =========================================================
            TOP SECTION
        ========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-20">

          {/* Samaj Identity */}
          <div className="flex flex-col gap-6">

            {/* Logo + Name */}
            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-primary)]/20 shadow-lg shrink-0">
                <span className="text-[var(--accent-primary)] font-black text-xl">
                  S
                </span>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent tracking-tight">
                  Samaj
                </h2>

                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)] mt-1">
                  Community • Unity • Progress
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-[var(--text-secondary)] text-base md:text-lg max-w-xl font-light leading-relaxed">
              Connecting our community through{" "}
              <span className="text-[var(--accent-primary)] font-medium">
                people, families, opportunities and collective progress.
              </span>{" "}
              Discover members, events, businesses, education, careers,
              community services and more — all in one place.
            </p>

            {/* Quick CTA */}
            <div className="flex flex-wrap gap-3 mt-2">

              <Link
                to="/join-samaj"
                className="btn-primary !px-5 !py-3 !text-[11px] !min-h-[40px] uppercase tracking-widest font-bold inline-flex items-center gap-2"
              >
                Join Samaj
                <FiArrowUpRight size={14} />
              </Link>

              <Link
                to="/member-directory"
                className="btn-secondary !px-5 !py-3 !text-[11px] !min-h-[40px] uppercase tracking-widest font-bold inline-flex items-center gap-2"
              >
                Explore Members
              </Link>

            </div>

            {/* Social Media */}
            <div className="flex gap-3 mt-3">

              {[
                {
                  icon: FaInstagram,
                  href: "#",
                  label: "Instagram",
                },
                {
                  icon: FaFacebookF,
                  href: "#",
                  label: "Facebook",
                },
                {
                  icon: FaYoutube,
                  href: "#",
                  label: "YouTube",
                },
                {
                  icon: FaTwitter,
                  href: "#",
                  label: "Twitter",
                },
                {
                  icon: FaLinkedin,
                  href: "#",
                  label: "LinkedIn",
                },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center cursor-pointer hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] text-[var(--text-secondary)] transition-all duration-300 shadow-sm"
                >
                  <Icon size={17} />
                </a>
              ))}

            </div>
          </div>


          {/* Important Community Links */}
          <div className="grid grid-cols-2 gap-8">

            {/* Community */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-6">
                Community
              </h4>

              <ul className="space-y-4 text-xs font-bold tracking-widest uppercase">
                <FooterLink to="/">Home</FooterLink>
                <FooterLink to="/about">About Samaj</FooterLink>
                <FooterLink to="/member-directory">Members</FooterLink>
                <FooterLink to="/family-directory">Families</FooterLink>
                <FooterLink to="/family-tree">Family Tree</FooterLink>
                <FooterLink to="/committee">Committee</FooterLink>
              </ul>
            </div>


            {/* Discover */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-6">
                Discover
              </h4>

              <ul className="space-y-4 text-xs font-bold tracking-widest uppercase">
                <FooterLink to="/events">Events</FooterLink>
                <FooterLink to="/notices">Notices</FooterLink>
                <FooterLink to="/news">Samaj News</FooterLink>
                <FooterLink to="/achievements">Achievements</FooterLink>
                <FooterLink to="/gallery">Gallery</FooterLink>
                <FooterLink to="/publications">Publications</FooterLink>
              </ul>
            </div>

          </div>
        </div>


        {/* =========================================================
            SERVICES SECTION
        ========================================================== */}

        <div className="border-t border-[var(--border-subtle)] pt-12 mb-12">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

            {/* Opportunities */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-6">
                Opportunities
              </h4>

              <ul className="space-y-4 text-xs font-bold tracking-widest uppercase">
                <FooterLink to="/scholarships">Scholarships</FooterLink>
                <FooterLink to="/jobs">Jobs & Career</FooterLink>
                <FooterLink to="/business-directory">Businesses</FooterLink>
                <FooterLink to="/groups">Community Groups</FooterLink>
              </ul>
            </div>


            {/* Community Services */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-6">
                Community Services
              </h4>

              <ul className="space-y-4 text-xs font-bold tracking-widest uppercase">
                <FooterLink to="/medical-help">Medical Help</FooterLink>
                <FooterLink to="/blood-donors">Blood Donors</FooterLink>
                <FooterLink to="/community-help">Community Help</FooterLink>
                <FooterLink to="/senior-support">Senior Support</FooterLink>
              </ul>
            </div>


            {/* Support */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-6">
                Support
              </h4>

              <ul className="space-y-4 text-xs font-bold tracking-widest uppercase">
                <FooterLink to="/donations">Contribute</FooterLink>
                <FooterLink to="/financial-transparency">Financial Transparency</FooterLink>
                <FooterLink to="/facilities">Community Facilities</FooterLink>
                <FooterLink to="/grievances">Raise a Grievance</FooterLink>
              </ul>
            </div>


            {/* Member */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-6">
                Member Area
              </h4>

              <ul className="space-y-4 text-xs font-bold tracking-widest uppercase">
                <FooterLink to="/login">Member Login</FooterLink>
                <FooterLink to="/join-samaj">Join Samaj</FooterLink>
                <FooterLink to="/digital-id">Digital ID Card</FooterLink>
                <FooterLink to="/matrimonial">Matrimonial</FooterLink>
              </ul>
            </div>

          </div>
        </div>


        {/* =========================================================
            CONTACT / AI / ARCHIVE CARD
        ========================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">

          {/* AI Assistant */}
          <Link
            to="/ai-assistant"
            className="group relative overflow-hidden bg-[var(--surface)] border border-[var(--border-subtle)] rounded-3xl p-6 hover:border-[var(--accent-primary)]/40 hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-primary)]/10 blur-3xl rounded-full" />

            <div className="relative z-10">
              <p className="text-[var(--accent-primary)] text-[9px] font-bold uppercase tracking-[0.3em] mb-3">
                Need Information?
              </p>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
                Ask Samaj Assistant
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Find verified information about members, events, businesses,
                scholarships and community services.
              </p>
              <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-4 group-hover:text-[var(--accent-primary)] transition-colors">
                Ask Assistant
                <FiArrowUpRight />
              </div>
            </div>
          </Link>


          {/* Archive */}
          <Link
            to="/archive"
            className="group bg-[var(--surface)] border border-[var(--border-subtle)] rounded-3xl p-6 hover:border-[var(--accent-primary)]/40 hover:shadow-lg transition-all duration-300"
          >
            <p className="text-[var(--accent-primary)] text-[9px] font-bold uppercase tracking-[0.3em] mb-3">
              Our History
            </p>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
              Digital Samaj Archive
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Explore our history, leadership, old photographs, documents,
              stories and achievements.
            </p>
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-4 group-hover:text-[var(--accent-primary)] transition-colors">
              Explore Archive
              <FiArrowUpRight />
            </div>
          </Link>


          {/* Contact */}
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-3xl p-6">
            <p className="text-[var(--accent-primary)] text-[9px] font-bold uppercase tracking-[0.3em] mb-3">
              Get In Touch
            </p>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              Samaj Office
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              For membership, community services, events and other official
              Samaj enquiries.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-4 hover:text-[var(--accent-primary)] transition-colors"
            >
              Contact Us
              <FiArrowUpRight />
            </Link>
          </div>

        </div>


        {/* =========================================================
            BACK TO TOP
        ========================================================== */}

        <div className="flex flex-col items-center justify-center mb-12">
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="relative w-14 h-14 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center hover:bg-[var(--accent-primary)] hover:text-[#070707] transition-all duration-300 group shadow-xl cursor-pointer"
          >
            <div className="absolute -inset-2 bg-[var(--accent-primary)]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <FaArrowUp
              size={18}
              className="relative z-10 group-hover:-translate-y-1 transition-transform"
            />
          </button>
          <p className="text-[var(--text-muted)] text-[9px] mt-4 font-bold uppercase tracking-[0.4em]">
            Back to Top
          </p>
        </div>


        {/* =========================================================
            BOTTOM
        ========================================================== */}

        <div className="border-t border-[var(--border-subtle)] pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-bold tracking-[0.25em] text-[var(--text-muted)] uppercase text-center md:text-left">
            © {new Date().getFullYear()} SAMAJ COMMUNITY PLATFORM. ALL RIGHTS RESERVED.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-[9px] font-bold tracking-[0.2em] text-[var(--text-muted)] uppercase">
            <Link
              to="/privacy-policy"
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/community-guidelines"
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Community Guidelines
            </Link>
          </div>
        </div>

        {/* Made With */}
        <div className="flex justify-center items-center gap-2 mt-8 text-[9px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
          Built for the Community
          <FiHeart
            size={11}
            className="text-[var(--accent-primary)]"
          />
          With Unity
        </div>

      </div>
    </footer>
  );
};

export default ModernFooter;