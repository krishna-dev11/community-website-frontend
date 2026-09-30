import { useState } from "react";
import {
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiFileText,
  FiHome,
  FiLock,
  FiMail,
  FiMapPin,
  FiShield,
  FiUser,
  FiPhone,
  FiAward,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setSignUpData } from "../../../Slices/Auth";
import { sendOtp, pendingSignupFiles } from "../../../services/Operations/authAPI";
import { ACCOUNT_TYPE } from "../../../Utilities/Constaints";
import FileUploadWithPreview from "../../Common/FileUploadWithPreview";

const registrationSteps = [
  "समाज सदस्यता के लिए व्यक्तिगत एवं सामुदायिक विवरण भरें",
  "आधार / मान्य समाज या सरकारी पहचान दस्तावेज़ अपलोड करें",
  "ईमेल OTP द्वारा अपना ईमेल सत्यापित करें",
  "समिति द्वारा सत्यापन के बाद सदस्यता स्वीकृति",
];

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    dateOfBirth: "",
    gender: "",
    nativePlace: "",
    currentCity: "",
    education: "",
    profession: "",
    gotra: "",
    address: "",
    about: "",
  });

  const [documentFile, setDocumentFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // IMPORTANT: Existing signup / OTP / Redux / upload flow is intentionally unchanged.
  const submitHandler = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("पासवर्ड मेल नहीं खा रहे हैं।");
      return;
    }

    if (!documentFile) {
      toast.error("कृपया आधार / पहचान / सदस्यता सत्यापन दस्तावेज़ अपलोड करें।");
      return;
    }

    // Store binary files in the shared signup container for OTP completion
    pendingSignupFiles.identityDocument = documentFile;
    pendingSignupFiles.photo = photoFile;

    const payload = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      accountType: ACCOUNT_TYPE.MEMBER,
    };

    const otpSent = await dispatch(sendOtp(payload.email));
    if (otpSent) {
      dispatch(setSignUpData(payload));
      navigate("/enterOtp");
    }
  };

  const inputClass =
    "ka-input w-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/15";

  const labelClass =
    "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]";

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 pb-16 pt-24 text-[var(--text-primary)] transition-colors duration-300 sm:px-6 lg:px-8">
      {/* Small scoped fixes for FileUploadWithPreview when the shared component
          contains dark-mode-only text classes. No upload/submit logic changes. */}
      <style>{`
        .signup-upload-theme,
        .signup-upload-theme * {
          --upload-text: var(--text-primary);
          --upload-muted: var(--text-secondary);
        }

        .signup-upload-theme label,
        .signup-upload-theme p,
        .signup-upload-theme span,
        .signup-upload-theme button,
        .signup-upload-theme svg {
          color: var(--upload-text) !important;
        }

        .signup-upload-theme small {
          color: var(--upload-muted) !important;
        }

        .signup-upload-theme [class*="text-white"],
        .signup-upload-theme [class*="text-gray-"],
        .signup-upload-theme [class*="text-slate-"] {
          color: var(--upload-text) !important;
        }

        .signup-upload-theme [class*="border-white"],
        .signup-upload-theme [class*="border-gray-"],
        .signup-upload-theme [class*="border-slate-"] {
          border-color: var(--border) !important;
        }

        .signup-upload-theme [class*="bg-black"],
        .signup-upload-theme [class*="bg-gray-900"],
        .signup-upload-theme [class*="bg-gray-800"] {
          background-color: var(--surface) !important;
        }

        .signup-upload-theme [class*="bg-gray-100"],
        .signup-upload-theme [class*="bg-gray-200"],
        .signup-upload-theme [class*="bg-slate-100"],
        .signup-upload-theme [class*="bg-slate-200"] {
          background-color: var(--surface-elevated) !important;
        }
      `}</style>

      <section className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Left Sidebar Guide */}
        <aside className="ka-card p-6 lg:sticky lg:top-24 lg:self-start">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--accent-primary)]/25 bg-white dark:bg-black/10">
              <img
                src="/logo.png"
                alt="Adivasi Halba/Halbi Samaj Kalyan Samiti Logo"
                className="h-full w-full object-contain p-1.5"
              />
            </div>

            <div className="min-w-0">
              <p className="eyebrow-badge mb-1">Official Samaj Portal</p>
              <h1 className="text-xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
                आदिवासी हलबा/हल्बी समाज
              </h1>
              <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
                कल्याण समिति, उज्जैन
              </p>
            </div>
          </div>

          <div className="mb-6 h-px bg-[var(--border)]" />

          <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            समाज सदस्य पंजीकरण
          </h2>

          <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
            आदिवासी हलबा/हल्बी समाज कल्याण समिति, उज्जैन की सदस्यता के लिए अपना
            विवरण भरें। सत्यापन के लिए वैध पहचान / सदस्यता प्रमाण दस्तावेज़
            आवश्यक है।
          </p>

          <div className="mt-8 grid gap-4">
            {registrationSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-3">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    index === 0
                      ? "bg-[var(--accent-primary)] text-[#070707] shadow-md"
                      : "border border-[var(--border-subtle)] text-[var(--text-muted)]"
                  }`}
                >
                  {index + 1}
                </div>
                <p className="text-xs font-semibold leading-5 text-[var(--text-secondary)]">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary)]/8 p-4 text-xs leading-5 text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--accent-primary)]">🔒 दस्तावेज़ सुरक्षा:</span>{" "}
            आपके द्वारा अपलोड किए गए दस्तावेज़ केवल अधिकृत समाज समिति
            प्रशासकों द्वारा सदस्यता सत्यापन के लिए उपयोग किए जाएंगे।
          </div>

          <div className="mt-7 border-l-2 border-[var(--accent-primary)]/40 pl-4">
            <p className="text-xs italic leading-5 text-[var(--text-muted)]">
              “गर्व से कहो हम आदिवासी हैं, भारत के मूल निवासी हैं”
            </p>
          </div>
        </aside>

        {/* Registration Form */}
        <form
          onSubmit={submitHandler}
          className="ka-card p-6 sm:p-8 shadow-2xl"
        >
          <div className="mb-8 border-b border-[var(--border-subtle)] pb-6">
            <div className="eyebrow-badge mb-4">Step 1 of 2 · Application &amp; Credentials</div>
            <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)] leading-tight">
              अपना <span className="text-[var(--accent-primary)]">समाज प्रोफ़ाइल</span> बनाएं
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)] font-normal">
              Fill in your community details and attach an actual image of your verification document.
            </p>
          </div>

          {/* Section 1: Basic Information */}
          <div className="mb-8">
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">
              1. व्यक्तिगत विवरण
            </h3>
            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className={labelClass}>पहला नाम *</span>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="अपना पहला नाम दर्ज करें"
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>उपनाम *</span>
                <input
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={changeHandler}
                  className={inputClass}
                  placeholder="अपना उपनाम दर्ज करें"
                />
              </label>

              <label>
                <span className={labelClass}>ईमेल पता *</span>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="अपना ईमेल पता दर्ज करें"
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>मोबाइल नंबर *</span>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    required
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>Password *</span>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="मजबूत पासवर्ड बनाएं"
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>Confirm Password *</span>
                <input
                  required
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={changeHandler}
                  className={inputClass}
                  placeholder="पासवर्ड दोबारा दर्ज करें"
                />
              </label>

              <label>
                <span className={labelClass}>जन्म तिथि</span>
                <div className="relative">
                  <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>लिंग</span>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={changeHandler}
                  className={inputClass}
                >
                  <option value="" className="bg-[var(--surface)] text-[var(--text-primary)]">लिंग चुनें</option>
                  <option value="MALE" className="bg-[var(--surface)] text-[var(--text-primary)]">Male</option>
                  <option value="FEMALE" className="bg-[var(--surface)] text-[var(--text-primary)]">Female</option>
                  <option value="OTHER" className="bg-[var(--surface)] text-[var(--text-primary)]">Other</option>
                </select>
              </label>
            </div>
          </div>

          {/* Section 2: Community & Locality */}
          <div className="mb-8 border-t border-[var(--border)] pt-6">
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">
              2. समाज एवं पारिवारिक पृष्ठभूमि
            </h3>
            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className={labelClass}>मूल निवास स्थान</span>
                <div className="relative">
                  <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    name="nativePlace"
                    value={formData.nativePlace}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="मूल गांव / शहर"
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>वर्तमान शहर</span>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    name="currentCity"
                    value={formData.currentCity}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="वर्तमान निवास का शहर"
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>गोत्र</span>
                <div className="relative">
                  <FiAward className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    name="gotra"
                    value={formData.gotra}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="अपना गोत्र दर्ज करें"
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>व्यवसाय / पेशा</span>
                <div className="relative">
                  <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    name="profession"
                    value={formData.profession}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="जैसे व्यवसाय, नौकरी, इंजीनियर, डॉक्टर"
                  />
                </div>
              </label>

              <label className="md:col-span-2">
                <span className={labelClass}>वर्तमान निवास का पता</span>
                <input
                  name="address"
                  value={formData.address}
                  onChange={changeHandler}
                  className={inputClass}
                  placeholder="वर्तमान निवास का पता दर्ज करें"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className={labelClass}>अपने बारे में / परिवार संबंधी जानकारी</span>
              <div className="relative">
                <FiFileText className="absolute left-3.5 top-4 text-[var(--text-muted)]" />
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={changeHandler}
                  rows={3}
                  className={`${inputClass} resize-none pl-10`}
                  placeholder="अपने बारे में या परिवार संबंधी संक्षिप्त जानकारी"
                />
              </div>
            </label>
          </div>

          {/* Section 3: Actual Image Uploads */}
          <div className="mb-8 border-t border-[var(--border)] pt-6">
            <h3 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">
              3. सदस्यता सत्यापन दस्तावेज़ एवं प्रोफ़ाइल फोटो
            </h3>
            <p className="mb-5 text-xs text-[var(--text-muted)]">
              कृपया अपने डिवाइस से वास्तविक दस्तावेज़ / फोटो अपलोड करें। बाहरी लिंक पेस्ट न करें।
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Verification Document Image Upload */}
              <div className="signup-upload-theme rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <FileUploadWithPreview
                  label="Aadhaar / Samaj Verification Document"
                  required={true}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  maxSizeMB={10}
                  helperText="Aadhaar Card, Samaj ID, or valid Government ID"
                  file={documentFile}
                  onFileSelect={(file) => setDocumentFile(file)}
                />
              </div>

              {/* Profile Photo Image Upload */}
              <div className="signup-upload-theme rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <FileUploadWithPreview
                  label="Samaj Profile Photo (Optional)"
                  required={false}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  maxSizeMB={10}
                  helperText="साफ और सामने से लिया गया फोटो"
                  file={photoFile}
                  onFileSelect={(file) => setPhotoFile(file)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary w-full text-sm"
          >
            <span>ईमेल OTP सत्यापित करें एवं आवेदन भेजें</span>
            <FiArrowRight size={17} />
          </button>

          <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
            क्या आपका पहले से स्वीकृत समाज सदस्य खाता है?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-bold text-[var(--accent-primary)] transition-opacity hover:opacity-80"
            >
              यहां लॉगिन करें
            </button>
          </p>
        </form>
      </section>
    </main>
  );
};

export default SignUpForm;
