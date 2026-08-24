import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiMessageSquare,
} from "react-icons/fi";
import { FaWhatsapp, FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";
import ModernFooter from "../Components/Core/Home/ModernFooter";

const ContactUsPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      toast.success("Thank you! Your message has been sent to the Samaj Secretariat.");
      setForm({
        fullName: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
      });
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="relative w-full min-h-screen bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300 font-sans overflow-x-hidden">
      {/* Background glow */}
      <div className="overflow-hidden pointer-events-none absolute inset-0 z-0">
        <div className="page-gradient-glow -left-20 top-0 opacity-40" />
      </div>

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="eyebrow-badge mx-auto mb-4">
          <FiMail size={13} />
          <span>Samaj Secretariat Helpdesk</span>
        </div>
        <h1 className="heading-hero text-[var(--text-primary)] mb-3">
          Get in Touch with <span className="text-gradient">Our Samaj</span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-normal">
          Have queries about member registration, matrimonial verification, scholarship applications, or Dharamshala bookings? Reach out directly to our committee representatives.
        </p>
      </section>

      {/* Main Content Grid */}
      <section className="py-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Col: Contact Information Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="ka-card p-6 flex flex-col gap-6">
              <h2 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-3">
                Official Secretariat Information
              </h2>

              <div className="space-y-4 text-xs">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center shrink-0">
                    <FiMapPin size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">Samaj Bhawan Head Office</h3>
                    <p className="text-[var(--text-secondary)] mt-1 leading-relaxed">
                      Community Center Road, Sector 5, New Delhi - 110001, India
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-[var(--info)]/10 text-[var(--info)] border border-[var(--info)]/20 flex items-center justify-center shrink-0">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">Official Phone Numbers</h3>
                    <p className="text-[var(--text-secondary)] mt-1">
                      +91 98765 43210 / +91 11 2345 6789
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Available Mon - Sat, 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <FiMail size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">Email Support</h3>
                    <p className="text-[var(--text-secondary)] mt-1">
                      helpdesk@samajportal.org
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Typical response time: Within 24-48 hours
                    </p>
                  </div>
                </div>

                {/* Timings */}
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <FiClock size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">Working Hours</h3>
                    <p className="text-[var(--text-secondary)] mt-1">
                      Monday to Saturday: 9:00 AM to 6:00 PM
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Sunday: Closed (Emergency line available)
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Action */}
              <div className="pt-2">
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity"
                >
                  <FaWhatsapp size={16} />
                  <span>Chat on Official WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Social Media Channels */}
            <div className="ka-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Official Social Media Channels
              </h3>
              <div className="flex gap-2.5">
                {[
                  { icon: FaWhatsapp, href: "https://wa.me/919876543210", label: "WhatsApp", color: "#25D366" },
                  { icon: FaFacebookF, href: "#", label: "Facebook", color: "#1877F2" },
                  { icon: FaYoutube, href: "#", label: "YouTube", color: "#FF0000" },
                  { icon: FaInstagram, href: "#", label: "Instagram", color: "#E4405F" },
                ].map(({ icon: Icon, href, label, color }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="h-10 w-10 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-primary)] flex items-center justify-center transition-all"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Contact Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="ka-card p-6 sm:p-8 flex flex-col gap-4">
              <div className="border-b border-[var(--border-subtle)] pb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Send Us a Direct Message</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Fill in the details below and the Secretariat team will get back to you.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Full Name *
                  </span>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Enter your name"
                    className="ka-input"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Phone Number *
                  </span>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="ka-input"
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Email Address *
                  </span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="name@example.com"
                    className="ka-input"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Query Category *
                  </span>
                  <select
                    value={form.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className="ka-input"
                  >
                    <option value="General Inquiry">General Samaj Inquiry</option>
                    <option value="Membership & Verification">Membership & Verification</option>
                    <option value="Matrimonial Assistance">Matrimonial Assistance</option>
                    <option value="Scholarship Application">Scholarship Application</option>
                    <option value="Dharamshala Booking">Dharamshala Booking</option>
                    <option value="Donation & Seva">Donation & Seva Inquiry</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Your Message *
                </span>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Describe your inquiry or issue in detail..."
                  className="ka-input resize-none"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full mt-2"
              >
                <FiSend size={15} />
                <span>{submitting ? "Sending Message..." : "Submit Inquiry to Samaj"}</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      <ModernFooter />
    </div>
  );
};

export default ContactUsPage;
