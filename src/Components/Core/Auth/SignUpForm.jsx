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
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setSignUpData } from "../../../Slices/Auth";
import { sendOtp, pendingSignupFiles } from "../../../services/Operations/authAPI";
import { ACCOUNT_TYPE } from "../../../Utilities/Constaints";
import FileUploadWithPreview from "../../Common/FileUploadWithPreview";

const registrationSteps = [
  "Submit personal & verification details",
  "Upload Samaj / Government ID Document",
  "Verify Email with OTP",
  "Committee Review & Card Issuance",
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

  const submitHandler = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!documentFile) {
      toast.error("Please upload your identity / membership verification document image");
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

  const inputClass = "ka-input";
  const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]";

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 pb-16 pt-28 text-[var(--text-primary)] sm:px-6 lg:px-8 transition-colors duration-300">
      <section className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left Sidebar Guide */}
        <aside className="ka-card p-6 lg:sticky lg:top-28 lg:self-start">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
              <FiShield size={22} />
            </div>
            <div>
              <p className="eyebrow-badge mb-1">Official Samaj Portal</p>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                Member Registration
              </h1>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[var(--text-secondary)] font-normal">
            Register as a community member. To preserve community integrity, all applicants must upload a valid verification document image for committee approval.
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

          <div className="mt-8 rounded-2xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary)]/8 p-4 text-xs leading-relaxed text-[var(--accent-primary)]">
            <span className="font-bold">🔒 Privacy Guarantee:</span> Uploaded verification documents are stored in a private vault and accessible exclusively by authorized verification committee administrators.
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
              Create your <span className="text-gradient">Samaj profile</span>
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)] font-normal">
              Fill in your community details and attach an actual image of your verification document.
            </p>
          </div>

          {/* Section 1: Basic Information */}
          <div className="mb-8">
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">
              1. Personal Details
            </h3>
            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className={labelClass}>First name *</span>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="Enter first name"
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>Last name *</span>
                <input
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={changeHandler}
                  className={inputClass}
                  placeholder="Enter last name"
                />
              </label>

              <label>
                <span className={labelClass}>Email address *</span>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="you@example.com"
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>Contact Number *</span>
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
                    placeholder="Create a strong password"
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
                  placeholder="Re-enter password"
                />
              </label>

              <label>
                <span className={labelClass}>Date of birth</span>
                <div className="relative">
                  <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
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
                <span className={labelClass}>Gender</span>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={changeHandler}
                  className={inputClass}
                >
                  <option value="" className="bg-gray-900 text-white">Select gender</option>
                  <option value="MALE" className="bg-gray-900 text-white">Male</option>
                  <option value="FEMALE" className="bg-gray-900 text-white">Female</option>
                  <option value="OTHER" className="bg-gray-900 text-white">Other</option>
                </select>
              </label>
            </div>
          </div>

          {/* Section 2: Community & Locality */}
          <div className="mb-8 border-t border-white/10 pt-6">
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-emerald-400/90">
              2. Community & Background
            </h3>
            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className={labelClass}>Native Place</span>
                <div className="relative">
                  <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    name="nativePlace"
                    value={formData.nativePlace}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="Ancestral / Native village or town"
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>Current City</span>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    name="currentCity"
                    value={formData.currentCity}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="City of residence"
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>Gotra</span>
                <div className="relative">
                  <FiAward className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    name="gotra"
                    value={formData.gotra}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="Your gotra"
                  />
                </div>
              </label>

              <label>
                <span className={labelClass}>Profession</span>
                <div className="relative">
                  <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    name="profession"
                    value={formData.profession}
                    onChange={changeHandler}
                    className={`${inputClass} pl-10`}
                    placeholder="e.g. Business, Engineer, Doctor"
                  />
                </div>
              </label>

              <label className="md:col-span-2">
                <span className={labelClass}>Residential Address</span>
                <input
                  name="address"
                  value={formData.address}
                  onChange={changeHandler}
                  className={inputClass}
                  placeholder="Full residential address"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className={labelClass}>About / Introduction / Family References</span>
              <div className="relative">
                <FiFileText className="absolute left-3.5 top-4 text-white/40" />
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={changeHandler}
                  rows={3}
                  className={`${inputClass} resize-none pl-10`}
                  placeholder="Brief introduction or reference for verification committee"
                />
              </div>
            </label>
          </div>

          {/* Section 3: Actual Image Uploads */}
          <div className="mb-8 border-t border-white/10 pt-6">
            <h3 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-400/90">
              3. Verification Document & Profile Photo
            </h3>
            <p className="mb-5 text-xs text-white/50">
              Please select and upload actual image files from your device. Do not paste external links.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Verification Document Image Upload */}
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <FileUploadWithPreview
                  label="Verification Document Image"
                  required={true}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  maxSizeMB={10}
                  helperText="Aadhar, Samaj ID, or Govt ID"
                  file={documentFile}
                  onFileSelect={(file) => setDocumentFile(file)}
                />
              </div>

              {/* Profile Photo Image Upload */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                <FileUploadWithPreview
                  label="Profile Photo (Optional)"
                  required={false}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  maxSizeMB={10}
                  helperText="Clear frontal portrait"
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
            <span>Verify with Email OTP &amp; Submit</span>
            <FiArrowRight size={17} />
          </button>

          <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
            Already have an approved account?{" "}
            <Link to="/login" className="font-bold text-[var(--accent-primary)] hover:opacity-80 transition-opacity">
              Log in here
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default SignUpForm;
