import { useState, useId } from "react";
import {
  FiArrowRight,
  FiArrowLeft,
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
  FiUsers,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
} from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setSignUpData } from "../../../Slices/Auth";
import {
  sendOtp,
  verifyOtp,
  signUp,
  pendingSignupFiles,
} from "../../../services/Operations/authAPI";
import { ACCOUNT_TYPE } from "../../../Utilities/Constaints";
import FileUploadWithPreview from "../../Common/FileUploadWithPreview";

const RELATIONSHIP_OPTIONS = [
  { value: "SPOUSE", label: "पति / पत्नी (Spouse)" },
  { value: "SON", label: "पुत्र (Son)" },
  { value: "DAUGHTER", label: "पुत्री (Daughter)" },
  { value: "FATHER", label: "पिता (Father)" },
  { value: "MOTHER", label: "माता (Mother)" },
  { value: "BROTHER", label: "भाई (Brother)" },
  { value: "SISTER", label: "बहन (Sister)" },
  { value: "GRANDFATHER", label: "दादा / नाना (Grandfather)" },
  { value: "GRANDMOTHER", label: "दादी / नानी (Grandmother)" },
  { value: "OTHER", label: "अन्य संबंधी (Other Relative)" },
];

const SignUpForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionToken = useId();

  const [currentStep, setCurrentStep] = useState(1);

  // 1. Family Head Information
  const [headData, setHeadData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "MALE",
    nativePlace: "",
    currentCity: "",
    education: "",
    profession: "",
    gotra: "",
    address: "",
    about: "",
    identityNumber: "", // Aadhaar / Govt ID number for duplicate prevention
  });

  const [headDocFile, setHeadDocFile] = useState(null);
  const [headPhotoFile, setHeadPhotoFile] = useState(null);
  const [headOtp, setHeadOtp] = useState("");
  const [headOtpSent, setHeadOtpSent] = useState(false);
  const [headOtpVerified, setHeadOtpVerified] = useState(false);

  // 2. Family Household Details
  const [familyData, setFamilyData] = useState({
    familyName: "",
    sssmId: "",
    state: "MADHYA PRADESH",
    currentCity: "",
    nativePlace: "",
    nomineeIndex: "",
  });

  // 3. Family Members
  const [members, setMembers] = useState([]);
  const [expandedMemberIndex, setExpandedMemberIndex] = useState(null);

  const handleHeadChange = (e) => {
    const { name, value } = e.target;
    setHeadData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFamilyChange = (e) => {
    const { name, value } = e.target;
    setFamilyData((prev) => ({ ...prev, [name]: value }));
  };

  // Add Family Member
  const addMember = () => {
    const newMemberIndex = members.length;
    setMembers((prev) => [
      ...prev,
      {
        firstName: "",
        lastName: headData.lastName || "",
        relationship: "SON",
        dateOfBirth: "",
        gender: "MALE",
        contactNumber: headData.contactNumber || "",
        email: headData.email || "",
        temporaryPassword: "Temp@" + Math.floor(1000 + Math.random() * 9000),
        identityNumber: "",
        profession: "",
        education: "",
        gotra: headData.gotra || "",
        docFile: null,
        photoFile: null,
        otp: "",
        otpSent: false,
        otpVerified: false,
      },
    ]);
    setExpandedMemberIndex(newMemberIndex);
  };

  const removeMember = (indexToRemove) => {
    setMembers((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (familyData.nomineeIndex === String(indexToRemove)) {
      setFamilyData((prev) => ({ ...prev, nomineeIndex: "" }));
    }
  };

  const handleMemberChange = (index, field, value) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // OTP Handlers for Head
  const handleSendHeadOtp = async () => {
    if (!headData.email && !headData.contactNumber) {
      toast.error("कृपया सत्यापन के लिए ईमेल या मोबाइल नंबर दर्ज करें।");
      return;
    }
    const contact = headData.email || headData.contactNumber;
    const sent = await dispatch(
      sendOtp(contact, {
        purpose: "REGISTRATION_CONTACT_VERIFICATION",
        memberKey: "head",
        sessionToken,
      })
    );
    if (sent) setHeadOtpSent(true);
  };

  const handleVerifyHeadOtp = async () => {
    if (!headOtp) {
      toast.error("कृपया प्राप्त ओटीपी दर्ज करें।");
      return;
    }
    const contact = headData.email || headData.contactNumber;
    const verified = await dispatch(
      verifyOtp(contact, headOtp, {
        purpose: "REGISTRATION_CONTACT_VERIFICATION",
        memberKey: "head",
        sessionToken,
      })
    );
    if (verified) setHeadOtpVerified(true);
  };

  // OTP Handlers for Family Members
  const handleSendMemberOtp = async (index) => {
    const member = members[index];
    const contact = member.email || member.contactNumber || headData.email;
    if (!contact) {
      toast.error("सदस्य के लिए ईमेल या मोबाइल नंबर आवश्यक है।");
      return;
    }
    const sent = await dispatch(
      sendOtp(contact, {
        purpose: "MEMBER_CONTACT_VERIFICATION",
        memberKey: `member_${index}`,
        sessionToken,
      })
    );
    if (sent) {
      handleMemberChange(index, "otpSent", true);
    }
  };

  const handleVerifyMemberOtp = async (index) => {
    const member = members[index];
    const contact = member.email || member.contactNumber || headData.email;
    if (!member.otp) {
      toast.error("कृपया सदस्य के लिए प्राप्त ओटीपी दर्ज करें।");
      return;
    }
    const verified = await dispatch(
      verifyOtp(contact, member.otp, {
        purpose: "MEMBER_CONTACT_VERIFICATION",
        memberKey: `member_${index}`,
        sessionToken,
      })
    );
    if (verified) {
      handleMemberChange(index, "otpVerified", true);
    }
  };

  // Step Navigations & Validations
  const nextStep = () => {
    if (currentStep === 1) {
      if (!headData.firstName || !headData.lastName) {
        toast.error("कृपया परिवार के मुखिया का पूरा नाम दर्ज करें।");
        return;
      }
      if (!headData.email) {
        toast.error("कृपया परिवार के मुखिया का ईमेल पता दर्ज करें।");
        return;
      }
      if (!headData.contactNumber) {
        toast.error("कृपया मोबाइल नंबर दर्ज करें।");
        return;
      }
      if (!headData.identityNumber) {
        toast.error("कृपया आधार / पहचान पत्र संख्या दर्ज करें (डुप्लीकेट रोकने हेतु आवश्यक)।");
        return;
      }
      if (!headDocFile) {
        toast.error("कृपया परिवार के मुखिया का पहचान दस्तावेज़ (आधार / समाज कार्ड) अपलोड करें।");
        return;
      }
    }

    if (currentStep === 2) {
      if (!familyData.familyName || !familyData.sssmId) {
        toast.error("कृपया परिवार का नाम और समग्र / राशन आईडी दर्ज करें।");
        return;
      }
    }

    if (currentStep === 3) {
      // Validate all members have documents and verified contact
      for (let i = 0; i < members.length; i += 1) {
        const mem = members[i];
        if (!mem.firstName || !mem.lastName) {
          toast.error(`सदस्य #${i + 1} का नाम अधूरा है।`);
          return;
        }
        if (!mem.identityNumber) {
          toast.error(`सदस्य #${i + 1} (${mem.firstName}) का पहचान / आधार क्रमांक दर्ज करें।`);
          return;
        }
        if (!mem.docFile) {
          toast.error(`सदस्य #${i + 1} (${mem.firstName}) का सत्यापन दस्तावेज़ अपलोड करना अनिवार्य है।`);
          return;
        }
        if (!mem.otpVerified) {
          toast.error(`सदस्य #${i + 1} (${mem.firstName}) का ओटीपी संपर्क सत्यापन अनिवार्य है।`);
          return;
        }
      }
    }

    if (currentStep === 4) {
      if (!headData.password || headData.password !== headData.confirmPassword) {
        toast.error("पासवर्ड और कन्फर्म पासवर्ड मेल खाने चाहिए।");
        return;
      }
      if (!headOtpVerified) {
        toast.error("कृपया मुखिया के संपर्क सत्यापन हेतु ओटीपी सत्यापित करें।");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Family Application Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!headOtpVerified) {
      toast.error("कृपया परिवार के मुखिया का ओटीपी सत्यापन पूरा करें।");
      return;
    }

    // Set files in pendingSignupFiles
    pendingSignupFiles.identityDocument = headDocFile;
    pendingSignupFiles.photo = headPhotoFile;
    pendingSignupFiles.memberFiles = {};

    members.forEach((mem, index) => {
      pendingSignupFiles.memberFiles[index] = {
        doc: mem.docFile,
        photo: mem.photoFile,
      };
    });

    const membersPayload = members.map((mem) => ({
      firstName: mem.firstName,
      lastName: mem.lastName,
      relationship: mem.relationship,
      dateOfBirth: mem.dateOfBirth,
      gender: mem.gender,
      contactNumber: mem.contactNumber,
      email: mem.email,
      temporaryPassword: mem.temporaryPassword,
      identityNumber: mem.identityNumber,
      profession: mem.profession,
      education: mem.education,
      gotra: mem.gotra,
    }));

    const finalPayload = {
      ...headData,
      email: headData.email.trim().toLowerCase(),
      isFamilyRegistration: true,
      familyName: familyData.familyName,
      sssmId: familyData.sssmId,
      state: familyData.state,
      currentCity: familyData.currentCity || headData.currentCity,
      nativePlace: familyData.nativePlace || headData.nativePlace,
      nomineeIndex: familyData.nomineeIndex !== "" ? Number(familyData.nomineeIndex) : undefined,
      members: membersPayload,
      sessionToken,
      accountType: ACCOUNT_TYPE.MEMBER,
    };

    dispatch(signUp(finalPayload, headOtp, navigate));
  };

  const inputClass =
    "ka-input w-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/15";

  const labelClass =
    "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]";

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 pb-20 pt-24 text-[var(--text-primary)] transition-colors duration-300 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header Banner */}
        <div className="mb-8 rounded-3xl border border-[var(--accent-primary)]/25 bg-[var(--surface-elevated)] p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--accent-primary)]">
                <FiUsers size={12} />
                <span>Family-Centric Samaj Registration</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                पारिवारिक सदस्यता <span className="text-gradient">पंजीकरण पोर्टल</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                परिवार के केवल एक मुखिया (Family Head) संपूर्ण परिवार का पंजीकरण करें। प्रत्येक सदस्य का पृथक दस्तावेज़ सत्यापन होगा।
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-xs font-bold text-[var(--text-muted)]">Already registered?</span>
              <div className="mt-1">
                <Link to="/login" className="btn-secondary !py-1.5 !px-3.5 !text-xs font-bold">
                  लॉगिन करें
                </Link>
              </div>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="mt-6 grid grid-cols-5 gap-2 border-t border-[var(--border-subtle)] pt-4 text-center">
            {[
              "1. मुखिया विवरण",
              "2. परिवार जानकारी",
              "3. परिवार सदस्य",
              "4. सुरक्षा व ओटीपी",
              "5. समीक्षा व जमा करें",
            ].map((title, idx) => {
              const stepNumber = idx + 1;
              const isActive = currentStep === stepNumber;
              const isDone = currentStep > stepNumber;
              return (
                <div key={title} className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
                      isActive
                        ? "bg-[var(--accent-primary)] text-black shadow-lg scale-110"
                        : isDone
                        ? "bg-emerald-500 text-white"
                        : "border border-[var(--border)] text-[var(--text-muted)] bg-[var(--surface)]"
                    }`}
                  >
                    {isDone ? <FiCheck size={14} /> : stepNumber}
                  </div>
                  <span className="mt-1.5 hidden text-[10px] font-bold text-[var(--text-secondary)] sm:block truncate max-w-[100px]">
                    {title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content Container */}
        <form onSubmit={handleSubmit} className="ka-card p-6 sm:p-8 shadow-2xl">
          {/* ================= STEP 1: FAMILY HEAD DETAILS ================= */}
          {currentStep === 1 && (
            <div>
              <div className="mb-6 border-b border-[var(--border-subtle)] pb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                  Step 1 of 5 · Primary Applicant
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  परिवार के मुखिया का विवरण (Family Head Details)
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  मुखिया का व्यक्तिगत विवरण एवं पहचान पत्र दर्ज करें। आधार संख्या डुप्लीकेट रोकने हेतु एन्क्रिप्टेड हैश के रूप में सुरक्षित रहेगी।
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className={labelClass}>पहला नाम (First Name) *</span>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      required
                      name="firstName"
                      value={headData.firstName}
                      onChange={handleHeadChange}
                      className={`${inputClass} pl-10`}
                      placeholder="पहला नाम दर्ज करें"
                    />
                  </div>
                </label>

                <label>
                  <span className={labelClass}>उपनाम (Last Name) *</span>
                  <input
                    required
                    name="lastName"
                    value={headData.lastName}
                    onChange={handleHeadChange}
                    className={inputClass}
                    placeholder="उपनाम दर्ज करें"
                  />
                </label>

                <label>
                  <span className={labelClass}>ईमेल पता (Email Address) *</span>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      required
                      type="email"
                      name="email"
                      value={headData.email}
                      onChange={handleHeadChange}
                      className={`${inputClass} pl-10`}
                      placeholder="मुखिया का ईमेल पता"
                    />
                  </div>
                </label>

                <label>
                  <span className={labelClass}>मोबाइल नंबर (Mobile Number) *</span>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      required
                      name="contactNumber"
                      value={headData.contactNumber}
                      onChange={handleHeadChange}
                      className={`${inputClass} pl-10`}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </label>

                <label>
                  <span className={labelClass}>आधार / मान्य सरकारी पहचान क्रमांक * (Unique Check)</span>
                  <div className="relative">
                    <FiShield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--accent-primary)]" />
                    <input
                      required
                      name="identityNumber"
                      value={headData.identityNumber}
                      onChange={handleHeadChange}
                      className={`${inputClass} pl-10 border-[var(--accent-primary)]/40`}
                      placeholder="जैसे आधार क्रमांक 1234 5678 9012"
                    />
                  </div>
                  <span className="text-[9px] text-[var(--text-muted)] mt-1 block">
                    🔒 संवेदनशील डेटा: आधार संख्या सुरक्षित हैश (SHA-256) में जांची जाती है।
                  </span>
                </label>

                <label>
                  <span className={labelClass}>जन्म तिथि (Date of Birth)</span>
                  <div className="relative">
                    <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={headData.dateOfBirth}
                      onChange={handleHeadChange}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </label>

                <label>
                  <span className={labelClass}>लिंग (Gender)</span>
                  <select
                    name="gender"
                    value={headData.gender}
                    onChange={handleHeadChange}
                    className={inputClass}
                  >
                    <option value="MALE">Male (पुरुष)</option>
                    <option value="FEMALE">Female (महिला)</option>
                    <option value="OTHER">Other (अन्य)</option>
                  </select>
                </label>

                <label>
                  <span className={labelClass}>गोत्र (Gotra)</span>
                  <div className="relative">
                    <FiAward className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      name="gotra"
                      value={headData.gotra}
                      onChange={handleHeadChange}
                      className={`${inputClass} pl-10`}
                      placeholder="अपना गोत्र दर्ज करें"
                    />
                  </div>
                </label>

                <label>
                  <span className={labelClass}>मूल निवास (Native Place)</span>
                  <div className="relative">
                    <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      name="nativePlace"
                      value={headData.nativePlace}
                      onChange={handleHeadChange}
                      className={`${inputClass} pl-10`}
                      placeholder="मूल गांव / कस्बा"
                    />
                  </div>
                </label>

                <label>
                  <span className={labelClass}>वर्तमान शहर (Current City)</span>
                  <div className="relative">
                    <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      name="currentCity"
                      value={headData.currentCity}
                      onChange={handleHeadChange}
                      className={`${inputClass} pl-10`}
                      placeholder="वर्तमान निवास का शहर"
                    />
                  </div>
                </label>

                <label className="md:col-span-2">
                  <span className={labelClass}>वर्तमान पूर्ण पता (Address)</span>
                  <input
                    name="address"
                    value={headData.address}
                    onChange={handleHeadChange}
                    className={inputClass}
                    placeholder="वर्तमान निवास का पूरा पता"
                  />
                </label>
              </div>

              {/* Head Documents */}
              <div className="mt-8 border-t border-[var(--border-subtle)] pt-6">
                <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-[var(--accent-primary)]">
                  मुखिया के दस्तावेज़ (Verification Documents)
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <FileUploadWithPreview
                    id="head_doc_upload"
                    label="आधार / समाज सत्यापन दस्तावेज़ *"
                    file={headDocFile}
                    onFileSelect={setHeadDocFile}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    required
                    isDocument
                    helperText="Aadhaar Card, Samaj ID, or valid Govt ID (Max 10MB)"
                  />

                  <FileUploadWithPreview
                    id="head_photo_upload"
                    label="मुखिया की प्रोफ़ाइल फोटो"
                    file={headPhotoFile}
                    onFileSelect={setHeadPhotoFile}
                    accept="image/jpeg,image/png,image/webp"
                    helperText="Passport style photo (Max 10MB)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: FAMILY HOUSEHOLD DETAILS ================= */}
          {currentStep === 2 && (
            <div>
              <div className="mb-6 border-b border-[var(--border-subtle)] pb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                  Step 2 of 5 · Household Record
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  परिवार की जानकारी (Family Information)
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  समाज में आपका परिवार एक स्थाई इकाई (Family ID) के रूप में पंजीकृत रहेगा।
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className={labelClass}>परिवार का नाम (Family Name) *</span>
                  <div className="relative">
                    <FiUsers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--accent-primary)]" />
                    <input
                      required
                      name="familyName"
                      value={familyData.familyName}
                      onChange={handleFamilyChange}
                      className={`${inputClass} pl-10`}
                      placeholder="जैसे: गोठवाल परिवार (Gothwal Family)"
                    />
                  </div>
                </label>

                <label>
                  <span className={labelClass}>समग्र / राशन / परिवार आईडी (SSSM or Family ID) *</span>
                  <input
                    required
                    name="sssmId"
                    value={familyData.sssmId}
                    onChange={handleFamilyChange}
                    className={inputClass}
                    placeholder="जैसे 12345678"
                  />
                </label>

                <label>
                  <span className={labelClass}>राज्य (State) *</span>
                  <input
                    required
                    name="state"
                    value={familyData.state}
                    onChange={handleFamilyChange}
                    className={inputClass}
                    placeholder="MADHYA PRADESH"
                  />
                </label>

                <label>
                  <span className={labelClass}>वर्तमान शहर / जिला (City / District)</span>
                  <input
                    name="currentCity"
                    value={familyData.currentCity || headData.currentCity}
                    onChange={handleFamilyChange}
                    className={inputClass}
                    placeholder="जैसे: उज्जैन (Ujjain)"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className={labelClass}>मूल स्थान (Ancestral Native Place)</span>
                  <input
                    name="nativePlace"
                    value={familyData.nativePlace || headData.nativePlace}
                    onChange={handleFamilyChange}
                    className={inputClass}
                    placeholder="मूल गांव / पूर्वजों का स्थान"
                  />
                </label>
              </div>

              <div className="mt-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                <div className="flex items-start gap-3">
                  <FiShield className="mt-0.5 shrink-0 text-emerald-400" size={18} />
                  <div className="text-xs leading-5 text-[var(--text-secondary)]">
                    <p className="font-bold text-[var(--text-primary)]">स्थाई परिवार कोड (Permanent Family ID)</p>
                    पंजीकरण के बाद एक यूनिक कोड (उदा. FAM-12345) प्राप्त होगा जो परिवार के सभी सदस्यों के लिए स्थाई रहेगा।
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: FAMILY MEMBERS ================= */}
          {currentStep === 3 && (
            <div>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                    Step 3 of 5 · Dependent &amp; Family Members
                  </p>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                    परिवार के अन्य सदस्य जोड़ें ({members.length} सदस्य)
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    प्रत्येक सदस्य को अलग से सदस्य आईडी, अस्थायी पासवर्ड एवं स्वतंत्र दस्तावेज़ सत्यापन मिलेगा।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addMember}
                  className="btn-primary inline-flex items-center gap-2 !py-2.5 !px-4 !text-xs cursor-pointer self-start sm:self-auto"
                >
                  <FiPlus size={14} />
                  <span>सदस्य जोड़ें (+ Add Member)</span>
                </button>
              </div>

              {members.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center bg-[var(--surface-elevated)]/50">
                  <FiUsers size={32} className="mx-auto text-[var(--text-muted)] mb-2" />
                  <p className="text-sm font-bold text-[var(--text-primary)]">कोई अन्य सदस्य नहीं जोड़ा गया है</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
                    यदि आपके परिवार में अन्य सदस्य (पत्नी, बच्चे, माता-पिता आदि) हैं, तो उन्हें अभी जोड़ें ताकि उन्हें अलग से पंजीकरण न करना पड़े।
                  </p>
                  <button
                    type="button"
                    onClick={addMember}
                    className="mt-4 btn-secondary !py-2 !px-4 !text-xs"
                  >
                    + परिवार सदस्य जोड़ें
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member, idx) => {
                    const isExpanded = expandedMemberIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] overflow-hidden shadow-sm"
                      >
                        {/* Member Card Header */}
                        <div
                          onClick={() => setExpandedMemberIndex(isExpanded ? null : idx)}
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--surface)]/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold text-xs">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[var(--text-primary)]">
                                {member.firstName || `सदस्य #${idx + 1}`} {member.lastName}
                                <span className="ml-2 text-xs font-normal text-[var(--accent-primary)]">
                                  ({RELATIONSHIP_OPTIONS.find((r) => r.value === member.relationship)?.label || member.relationship})
                                </span>
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                                <span className={member.docFile ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                                  {member.docFile ? "✓ दस्तावेज़ संलग्न" : "⚠️ दस्तावेज़ शेष"}
                                </span>
                                <span>·</span>
                                <span className={member.otpVerified ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                                  {member.otpVerified ? "✓ ओटीपी सत्यापित" : "⚠️ ओटीपी लंबित"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMember(idx);
                              }}
                              className="p-1.5 text-red-400 hover:text-red-300 transition-colors cursor-pointer rounded-lg hover:bg-red-400/10"
                              title="हटाएं"
                            >
                              <FiTrash2 size={16} />
                            </button>
                            {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                          </div>
                        </div>

                        {/* Member Form Details (Collapsible) */}
                        {isExpanded && (
                          <div className="border-t border-[var(--border-subtle)] p-5 space-y-5 bg-[var(--surface)]/30">
                            <div className="grid gap-4 md:grid-cols-3">
                              <label>
                                <span className={labelClass}>संबंध (Relationship) *</span>
                                <select
                                  value={member.relationship}
                                  onChange={(e) => handleMemberChange(idx, "relationship", e.target.value)}
                                  className={inputClass}
                                >
                                  {RELATIONSHIP_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label>
                                <span className={labelClass}>पहला नाम (First Name) *</span>
                                <input
                                  value={member.firstName}
                                  onChange={(e) => handleMemberChange(idx, "firstName", e.target.value)}
                                  className={inputClass}
                                  placeholder="पहला नाम"
                                />
                              </label>

                              <label>
                                <span className={labelClass}>उपनाम (Last Name) *</span>
                                <input
                                  value={member.lastName}
                                  onChange={(e) => handleMemberChange(idx, "lastName", e.target.value)}
                                  className={inputClass}
                                  placeholder="उपनाम"
                                />
                              </label>

                              <label>
                                <span className={labelClass}>आधार / पहचान पत्र क्रमांक * (Uniqueness Check)</span>
                                <input
                                  value={member.identityNumber}
                                  onChange={(e) => handleMemberChange(idx, "identityNumber", e.target.value)}
                                  className={`${inputClass} border-[var(--accent-primary)]/30`}
                                  placeholder="Aadhaar / Govt ID"
                                />
                              </label>

                              <label>
                                <span className={labelClass}>जन्म तिथि (DOB)</span>
                                <input
                                  type="date"
                                  value={member.dateOfBirth}
                                  onChange={(e) => handleMemberChange(idx, "dateOfBirth", e.target.value)}
                                  className={inputClass}
                                />
                              </label>

                              <label>
                                <span className={labelClass}>लिंग (Gender)</span>
                                <select
                                  value={member.gender}
                                  onChange={(e) => handleMemberChange(idx, "gender", e.target.value)}
                                  className={inputClass}
                                >
                                  <option value="MALE">Male</option>
                                  <option value="FEMALE">Female</option>
                                  <option value="OTHER">Other</option>
                                </select>
                              </label>

                              <label>
                                <span className={labelClass}>मोबाइल नंबर</span>
                                <input
                                  value={member.contactNumber}
                                  onChange={(e) => handleMemberChange(idx, "contactNumber", e.target.value)}
                                  className={inputClass}
                                  placeholder="+91..."
                                />
                              </label>

                              <label>
                                <span className={labelClass}>ईमेल (साझा हो सकता है)</span>
                                <input
                                  type="email"
                                  value={member.email}
                                  onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
                                  className={inputClass}
                                  placeholder="ईमेल पता"
                                />
                              </label>

                              <label>
                                <span className={labelClass}>अस्थायी पासवर्ड (Temporary Password) *</span>
                                <input
                                  value={member.temporaryPassword}
                                  onChange={(e) => handleMemberChange(idx, "temporaryPassword", e.target.value)}
                                  className={inputClass}
                                  placeholder="Temp@123"
                                />
                                <span className="text-[9px] text-[var(--text-muted)] mt-1 block">
                                  प्रथम लॉगिन पर सदस्य को अपना निजी पासवर्ड बदलना अनिवार्य होगा।
                                </span>
                              </label>
                            </div>

                            {/* Individual Contact OTP for Member */}
                            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-2">
                                सदस्य संपर्क सत्यापन (Mandatory Individual OTP)
                              </p>
                              {member.otpVerified ? (
                                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
                                  <FiCheckCircle size={14} />
                                  <span>सत्यापित (Contact Verified)</span>
                                </div>
                              ) : (
                                <div className="flex flex-wrap items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleSendMemberOtp(idx)}
                                    className="btn-secondary !py-2 !px-3.5 !text-xs"
                                  >
                                    {member.otpSent ? "ओटीपी पुनः भेजें" : "ओटीपी भेजें (Send OTP)"}
                                  </button>
                                  {member.otpSent && (
                                    <div className="flex items-center gap-2">
                                      <input
                                        value={member.otp}
                                        onChange={(e) => handleMemberChange(idx, "otp", e.target.value)}
                                        placeholder="6-अंकीय OTP"
                                        className="ka-input !h-9 !w-32 !py-0 text-center font-mono"
                                        maxLength={6}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleVerifyMemberOtp(idx)}
                                        className="btn-primary !py-2 !px-3.5 !text-xs"
                                      >
                                        सत्यापित करें
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Member Individual Document & Photo */}
                            <div className="grid gap-4 md:grid-cols-2 pt-2">
                              <FileUploadWithPreview
                                id={`member_doc_${idx}`}
                                label={`सदस्य #${idx + 1} का सत्यापन दस्तावेज़ *`}
                                file={member.docFile}
                                onFileSelect={(file) => handleMemberChange(idx, "docFile", file)}
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                required
                                isDocument
                                helperText="Individual Aadhaar / Govt ID of this member"
                              />

                              <FileUploadWithPreview
                                id={`member_photo_${idx}`}
                                label={`सदस्य #${idx + 1} की फोटो`}
                                file={member.photoFile}
                                onFileSelect={(file) => handleMemberChange(idx, "photoFile", file)}
                                accept="image/jpeg,image/png,image/webp"
                                helperText="Profile picture (Optional)"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Nominate Successor Option */}
              {members.length > 0 && (
                <div className="mt-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                  <label className="block">
                    <span className={labelClass}>उत्तराधिकारी / नामिती का चयन (Nominate Successor - Optional)</span>
                    <select
                      value={familyData.nomineeIndex}
                      onChange={(e) => setFamilyData((prev) => ({ ...prev, nomineeIndex: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">कोई चयन नहीं (Admin controlled)</option>
                      {members.map((m, idx) => (
                        <option key={idx} value={String(idx)}>
                          {m.firstName} {m.lastName} ({RELATIONSHIP_OPTIONS.find((r) => r.value === m.relationship)?.label})
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-[var(--text-muted)] mt-1.5 block">
                      💡 केवल वरीयता दर्ज होगी। भविष्य में मुखिया परिवर्तन प्रशासनिक सत्यापन के बाद ही मान्य होगा।
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 4: SECURITY & HEAD OTP ================= */}
          {currentStep === 4 && (
            <div>
              <div className="mb-6 border-b border-[var(--border-subtle)] pb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                  Step 4 of 5 · Account Security &amp; OTP
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  मुखिया खाता सुरक्षा एवं सत्यापन
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  मुखिया अपने खाते के लिए पासवर्ड सेट करें तथा ईमेल/फ़ोन पर प्राप्त ओटीपी सत्यापित करें।
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className={labelClass}>पासवर्ड बनाएं (Create Password) *</span>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      required
                      type="password"
                      name="password"
                      value={headData.password}
                      onChange={handleHeadChange}
                      className={`${inputClass} pl-10`}
                      placeholder="मजबूत पासवर्ड"
                    />
                  </div>
                </label>

                <label>
                  <span className={labelClass}>पासवर्ड पुनः दर्ज करें (Confirm Password) *</span>
                  <input
                    required
                    type="password"
                    name="confirmPassword"
                    value={headData.confirmPassword}
                    onChange={handleHeadChange}
                    className={inputClass}
                    placeholder="पासवर्ड दोबारा दर्ज करें"
                  />
                </label>
              </div>

              {/* Head OTP Box */}
              <div className="mt-8 rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/8 p-6">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <FiShield className="text-[var(--accent-primary)]" />
                  <span>मुखिया संपर्क सत्यापन (Family Head OTP Verification)</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4">
                  आपके पंजीकृत ईमेल <strong>{headData.email}</strong> पर 6-अंकीय सत्यापन कोड भेजा जाएगा।
                </p>

                {headOtpVerified ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400">
                    <FiCheckCircle size={16} />
                    <span>ईमेल एवं संपर्क सफलतापूर्वक सत्यापित! (Verified)</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSendHeadOtp}
                      className="btn-secondary !py-2.5 !px-5 !text-xs font-bold"
                    >
                      {headOtpSent ? "ओटीपी पुनः भेजें (Resend)" : "ओटीपी भेजें (Send OTP)"}
                    </button>

                    {headOtpSent && (
                      <div className="flex items-center gap-2">
                        <input
                          value={headOtp}
                          onChange={(e) => setHeadOtp(e.target.value)}
                          placeholder="6-अंकीय OTP"
                          className="ka-input !h-10 !w-36 !py-0 text-center font-mono text-sm tracking-widest"
                          maxLength={6}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyHeadOtp}
                          className="btn-primary !py-2.5 !px-5 !text-xs font-bold"
                        >
                          सत्यापित करें
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 5: REVIEW & FINAL SUBMIT ================= */}
          {currentStep === 5 && (
            <div>
              <div className="mb-6 border-b border-[var(--border-subtle)] pb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                  Step 5 of 5 · Final Verification &amp; Submit
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  आवेदन समीक्षा एवं अंतिम जमा (Review &amp; Submit)
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  कृपया विवरण की पुष्टि करें। जमा करने के बाद समाज समिति द्वारा प्रत्येक सदस्य के दस्तावेज़ का पृथक सत्यापन किया जाएगा।
                </p>
              </div>

              {/* Summary Cards */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-3">
                    परिवार का सारांश (Family Overview)
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 text-xs">
                    <div>
                      <span className="text-[var(--text-muted)] block">परिवार का नाम:</span>
                      <span className="font-bold text-[var(--text-primary)] text-sm">{familyData.familyName}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block">समग्र / राशन आईडी:</span>
                      <span className="font-bold text-[var(--text-primary)]">{familyData.sssmId}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block">राज्य / शहर:</span>
                      <span className="font-bold text-[var(--text-primary)]">{familyData.state}, {familyData.currentCity || headData.currentCity}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block">कुल सदस्य:</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        {1 + members.length} व्यक्ति (1 मुखिया + {members.length} सदस्य)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-3">
                    परिवार के मुखिया (Family Head)
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[var(--accent-primary)]/20 flex items-center justify-center font-bold text-base text-[var(--accent-primary)]">
                      {headData.firstName[0]}
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-[var(--text-primary)] text-sm">
                        {headData.firstName} {headData.lastName}
                      </p>
                      <p className="text-[var(--text-muted)]">
                        {headData.email} · {headData.contactNumber}
                      </p>
                      <p className="text-emerald-400 font-bold mt-1">
                        ✓ पहचान पत्र अपलोड · ✓ संपर्क सत्यापित
                      </p>
                    </div>
                  </div>
                </div>

                {members.length > 0 && (
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-3">
                      सम्मिलित परिवार सदस्य ({members.length})
                    </h3>
                    <div className="divide-y divide-[var(--border-subtle)] text-xs">
                      {members.map((mem, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[var(--text-primary)]">
                              {idx + 1}. {mem.firstName} {mem.lastName}
                            </span>
                            <span className="text-[var(--text-muted)] ml-2">
                              ({RELATIONSHIP_OPTIONS.find((r) => r.value === mem.relationship)?.label})
                            </span>
                          </div>
                          <span className="text-emerald-400 font-bold text-[11px]">
                            ✓ दस्तावेज़ व ओटीपी पूर्ण
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-[var(--border-subtle)] pt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary !py-2.5 !px-5 !text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <FiArrowLeft size={14} />
                <span>पिछला (Previous)</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary !py-2.5 !px-6 !text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>आगे बढ़ें (Next Step)</span>
                <FiArrowRight size={14} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary !py-3 !px-8 !text-sm font-black inline-flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-transform"
              >
                <FiCheckCircle size={16} />
                <span>संपूर्ण परिवार आवेदन जमा करें (Submit Family Application)</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
};

export default SignUpForm;
