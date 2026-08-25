import { FiArrowUpRight } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhone } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";

const ContactSection = () => {
  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text-primary)] overflow-hidden px-8 py-10">

      {/* Watermark text */}
      <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        text-[12rem] font-bold tracking-wider text-[var(--text-primary)]/[0.04] pointer-events-none select-none">
        CONTACT
      </h1>

      {/* Accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] 
        bg-emerald-500/8 blur-[120px]"></div>

      {/* Nav bar */}
      <div className="flex justify-center mb-16">
        <div className="px-6 py-3 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] 
          rounded-full flex items-center gap-6 text-sm">

          <span className="text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)]">Home</span>
          <span className="text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)]">Integrations</span>
          <span className="text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)]">Pricing</span>
          <span className="text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)]">Logs</span>

          <span className="px-3 py-1 bg-[var(--surface-elevated)] rounded-full text-[var(--text-secondary)]">Contact</span>

          <button className="ml-2 px-4 py-1.5 bg-[var(--accent-primary)] text-[#070707] rounded-full 
            flex items-center gap-1 hover:opacity-80 transition font-semibold">
            Get Template <FiArrowUpRight />
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

        {/* Left: info */}
        <div className="space-y-6">

          <div className="inline-flex items-center gap-2 px-4 py-1 bg-[var(--surface-elevated)] border 
            border-[var(--border-subtle)] rounded-full text-sm text-[var(--text-secondary)]">
            ⓘ CONTACT
          </div>

          <h2 className="text-6xl font-bold text-[var(--text-primary)]">Get in touch</h2>
          <p className="text-[var(--text-secondary)] max-w-md">
            Have questions or ready to transform your business with AI automation?
          </p>

          {/* Contact cards */}
          <div className="space-y-4 mt-6">

            <div className="flex items-center justify-between bg-[var(--glass-bg)] backdrop-blur-lg 
              border border-[var(--glass-border)] rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <HiOutlineMail size={20} className="text-[var(--text-muted)]" />
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Email us</p>
                  <p className="text-[var(--text-primary)]">johnnykyurov@gmail.com</p>
                </div>
              </div>
              <button className="p-2 bg-[var(--surface-elevated)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
                <FiArrowUpRight />
              </button>
            </div>

            <div className="flex items-center justify-between bg-[var(--glass-bg)] backdrop-blur-lg 
              border border-[var(--glass-border)] rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <FiPhone size={20} className="text-[var(--text-muted)]" />
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Call us</p>
                  <p className="text-[var(--text-primary)]">(501) 123-4567</p>
                </div>
              </div>
              <button className="p-2 bg-[var(--surface-elevated)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
                <FiArrowUpRight />
              </button>
            </div>

            <div className="flex items-center justify-between bg-[var(--glass-bg)] backdrop-blur-lg 
              border border-[var(--glass-border)] rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <IoLocationOutline size={20} className="text-[var(--text-muted)]" />
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Our location</p>
                  <p className="text-[var(--text-primary)]">Crosby Street, NY, US</p>
                </div>
              </div>
              <button className="p-2 bg-[var(--surface-elevated)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
                <FiArrowUpRight />
              </button>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] 
          rounded-[2.5rem] p-8 space-y-4">

          <input
            type="text"
            placeholder="Name"
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl 
              px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl 
              px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
          />

          <textarea
            rows={5}
            placeholder="Message"
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl 
              px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
          />

          <button className="w-full bg-[var(--accent-primary)] text-[#070707] font-semibold py-3 rounded-xl 
            shadow-[var(--shadow-glow)] hover:opacity-90 transition">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
