import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiSend,
  FiCheckCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { organizationInfo } from "../data/bairwaData";
import { useLanguage } from "../i18n/LanguageContext";

const ContactUsPage = () => {
  const { t, isHindi } = useLanguage();
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
      toast.success(
        isHindi
          ? "धन्यवाद! आपका संदेश प्रांतीय बैरवा प्रगति संस्था सचिवालय को भेज दिया गया है।"
          : "Thank you! Your message has been sent to the Sanstha Secretariat."
      );
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
      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-4">
          <FiMail size={13} />
          <span>{isHindi ? organizationInfo.nameHi : organizationInfo.nameEn}</span>
        </div>
        <h1 className="heading-hero text-[var(--text-primary)] mb-3">
          {isHindi ? "संस्था सचिवालय से संपर्क करें" : "Get in Touch with Secretariat"}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-normal">
          {isHindi
            ? "सदस्यता पंजीकरण, वैवाहिक सत्यापन, छात्रवृत्ति आवेदन या संस्था संबंधी किसी भी जानकारी के लिए हमारे प्रधान कार्यालय से संपर्क करें।"
            : "For membership registration, matrimonial verification, scholarship applications, or inquiries, reach out directly to our central secretariat."}
        </p>
      </section>

      {/* Main Content Grid */}
      <section className="py-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Col: Contact Information Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="ka-card p-6 flex flex-col gap-6 rounded-3xl border border-[var(--border-subtle)]">
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-3">
                {isHindi ? "आधिकारिक सचिवालय संपर्क" : "Official Secretariat Information"}
              </h2>

              <div className="space-y-4 text-xs">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center shrink-0">
                    <FiMapPin size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-0.5">
                      {isHindi ? "प्रधान कार्यालय पता" : "Head Office Address"}
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {isHindi ? organizationInfo.headOffice.addressHi : organizationInfo.headOffice.addressEn}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center shrink-0">
                    <FiPhone size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-0.5">
                      {isHindi ? "दूरभाष / मोबाइल" : "Helpline Phone"}
                    </h3>
                    <a href="tel:+919928260244" className="font-mono font-bold text-emerald-400 hover:underline">
                      {organizationInfo.headOffice.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center shrink-0">
                    <FiMail size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-0.5">
                      {isHindi ? "ईमेल संपर्क" : "Email Address"}
                    </h3>
                    <a href="mailto:contact@bairwasamaaj.com" className="text-[var(--text-secondary)] hover:text-emerald-400">
                      {organizationInfo.headOffice.email}
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center shrink-0">
                    <FiClock size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-0.5">
                      {isHindi ? "कार्यालय समय" : "Office Hours"}
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      {isHindi ? organizationInfo.headOffice.hoursHi : organizationInfo.headOffice.hoursEn}
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Quick Helpline */}
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <a
                  href="https://wa.me/919928260244"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold"
                >
                  <FaWhatsapp size={16} />
                  <span>{isHindi ? "व्हाट्सएप हेल्पलाइन चैट" : "WhatsApp Helpline"}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Col: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="ka-card p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)]">
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-1">
                {isHindi ? "ऑनलाइन संदेश / सुझाव भेजें" : "Send an Inquiry Message"}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-6 font-normal">
                {isHindi
                  ? "कृपया अपना संदेश भरें, संस्था प्रतिनिधि यथाशीघ्र आपसे संपर्क करेंगे।"
                  : "Fill in your details and our secretariat representative will connect with you."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                      {isHindi ? "पूरा नाम *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder={isHindi ? "आपका नाम" : "Your Name"}
                      className="ka-input !py-2.5 !text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                      {isHindi ? "मोबाइल नंबर *" : "Mobile Number *"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+91 99282 60244"
                      className="ka-input !py-2.5 !text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                    {isHindi ? "ईमेल पता" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@example.com"
                    className="ka-input !py-2.5 !text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                    {isHindi ? "विषय" : "Subject"}
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className="ka-input !py-2.5 !text-xs"
                  >
                    <option value="General Inquiry">{isHindi ? "सामान्य पूछताछ" : "General Inquiry"}</option>
                    <option value="Membership">{isHindi ? "सदस्यता संबंधी" : "Membership Query"}</option>
                    <option value="Matrimonial">{isHindi ? "परिचय सम्मेलन / वैवाहिक" : "Matrimonial Conference"}</option>
                    <option value="Scholarship">{isHindi ? "छात्रवृत्ति योजना" : "Scholarship Aid"}</option>
                    <option value="Suggestion">{isHindi ? "सुझाव एवं विचार" : "Suggestions"}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">
                    {isHindi ? "संदेश विवरण *" : "Message Details *"}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder={isHindi ? "अपना संदेश यहाँ लिखें..." : "Write your message here..."}
                    className="ka-input !py-2.5 !text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full !py-3 flex items-center justify-center gap-2 text-xs"
                >
                  <FiSend size={14} />
                  <span>{submitting ? (isHindi ? "भेजा जा रहा है..." : "Sending...") : (isHindi ? "संदेश प्रेषित करें" : "Send Message")}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <ModernFooter />
    </div>
  );
};

export default ContactUsPage;
