import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  FiEye,
  FiHeart,
  FiMail,
  FiPauseCircle,
  FiPlayCircle,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiShield,
  FiTrash2,
  FiUser,
  FiMapPin,
  FiBriefcase,
  FiBook,
  FiX,
} from "react-icons/fi";
import { apiConnector } from "../services/apiConnector";
import { matrimonialEndpoints } from "../services/apis";
import FileUploadWithPreview from "../Components/Common/FileUploadWithPreview";
import { useLanguage } from "../i18n/LanguageContext";

const inputClass = "ka-input";
const textareaClass = "ka-input !min-h-24 resize-none !py-3";

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
};

const ageFromDate = (value) => {
  if (!value) return null;
  const birth = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return Number.isFinite(age) ? age : null;
};

const profileAge = (profile) => profile?.age || ageFromDate(profile?.dateOfBirth) || null;

const formatProfileValue = (value) => value || "Not shared";

const initialForm = {
  displayName: "",
  gender: "MALE",
  dateOfBirth: "",
  height: "",
  maritalStatus: "NEVER_MARRIED",
  education: "",
  profession: "",
  annualIncome: "",
  currentCity: "",
  nativePlace: "",
  gotra: "",
  about: "",
  expectations: "",
  familyDetails: "",
  phone: "",
  email: "",
  address: "",
  guardianName: "",
  guardianRelation: "",
  guardianPhone: "",
  photoUrl: "",
  status: "PENDING_REVIEW",
};

const Button = ({ children, className = "", tone = "neutral", icon: Icon, ...props }) => {
  const tones = {
    neutral: "btn-secondary !py-2 !px-4 !text-xs",
    success: "btn-primary !py-2 !px-5 !text-xs",
    danger: "inline-flex items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all hover:bg-red-500/20 disabled:opacity-50 cursor-pointer",
    solid: "btn-primary !py-2.5 !px-5 !text-xs",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${tones[tone] || tones.neutral} ${className}`}
    >
      {Icon ? <Icon size={14} /> : null}
      <span>{children}</span>
    </button>
  );
};

const Field = ({ label, children }) => (
  <label className="grid gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
    {children}
  </label>
);

const Status = ({ value }) => (
  <span className="inline-flex w-fit rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
    {value || "UNKNOWN"}
  </span>
);

const profileToForm = (profile) => ({
  ...initialForm,
  displayName: profile?.displayName || "",
  gender: profile?.gender || "MALE",
  dateOfBirth: profile?.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : "",
  height: profile?.height || "",
  maritalStatus: profile?.maritalStatus || "NEVER_MARRIED",
  education: profile?.education || "",
  profession: profile?.profession || "",
  annualIncome: profile?.annualIncome || "",
  currentCity: profile?.currentCity || "",
  nativePlace: profile?.nativePlace || "",
  gotra: profile?.gotra || "",
  about: profile?.about || "",
  expectations: profile?.expectations || "",
  familyDetails: profile?.familyDetails || "",
  phone: profile?.protectedContact?.phone || "",
  email: profile?.protectedContact?.email || "",
  address: profile?.protectedContact?.address || "",
  guardianName: profile?.guardian?.name || "",
  guardianRelation: profile?.guardian?.relation || "",
  guardianPhone: profile?.guardian?.phone || "",
  photoUrl: profile?.photos?.[0]?.url || "",
  status: profile?.status || "PENDING_REVIEW",
});

const formToPayload = (form) => ({
  displayName: form.displayName,
  gender: form.gender,
  dateOfBirth: form.dateOfBirth,
  height: form.height,
  maritalStatus: form.maritalStatus,
  education: form.education,
  profession: form.profession,
  annualIncome: form.annualIncome,
  currentCity: form.currentCity,
  nativePlace: form.nativePlace,
  gotra: form.gotra,
  about: form.about,
  expectations: form.expectations,
  familyDetails: form.familyDetails,
  protectedContact: {
    phone: form.phone,
    email: form.email,
    address: form.address,
  },
  guardian: {
    name: form.guardianName,
    relation: form.guardianRelation,
    phone: form.guardianPhone,
  },
});

const MatrimonialPage = () => {
  const { token } = useSelector((state) => state.auth);
  const { t, isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState("browse");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [interests, setInterests] = useState({ sent: [], received: [] });
  const [contacts, setContacts] = useState({ sent: [], received: [] });
  const [filters, setFilters] = useState({ gender: "", city: "", gotra: "", profession: "", q: "" });
  const [form, setForm] = useState(initialForm);
  const [matrimonialPhotoFile, setMatrimonialPhotoFile] = useState(null);
  const [messageDrafts, setMessageDrafts] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileDetailLoading, setProfileDetailLoading] = useState(false);
  const [protectedContactUnlocked, setProtectedContactUnlocked] = useState(false);
  const [interestSentIds, setInterestSentIds] = useState([]);

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const loadMine = async () => {
    try {
      const response = await apiConnector("GET", matrimonialEndpoints.MY_PROFILE_API, null, authConfig);
      const profile = response.data?.data?.profile || null;
      setMyProfile(profile);
      if (profile) setForm(profileToForm(profile));
    } catch {
      setMyProfile(null);
    }
  };

  const loadProfiles = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined)
      );
      const response = await apiConnector("GET", matrimonialEndpoints.PROFILES_API, null, authConfig, {
        ...params,
        limit: 24,
      });
      setProfiles(response.data?.data?.profiles || []);
    } catch {
      setProfiles([]);
    }
  };

  const loadInterests = async () => {
    try {
      const response = await apiConnector("GET", matrimonialEndpoints.MY_INTERESTS_API, null, authConfig);
      setInterests(response.data?.data || { sent: [], received: [] });
    } catch {
      setInterests({ sent: [], received: [] });
    }
  };

  const loadContacts = async () => {
    try {
      const response = await apiConnector("GET", matrimonialEndpoints.MY_CONTACT_REQUESTS_API, null, authConfig);
      setContacts(response.data?.data || { sent: [], received: [] });
    } catch {
      setContacts({ sent: [], received: [] });
    }
  };

  const refreshActive = async () => {
    setLoading(true);
    try {
      if (activeTab === "profile") await loadMine();
      if (activeTab === "browse") await loadProfiles();
      if (activeTab === "interests") {
        await loadInterests();
        await loadContacts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load matrimonial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshActive();
  }, [activeTab]);

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const openProfileDetail = async (profileId) => {
    setProfileDetailLoading(true);
    setProtectedContactUnlocked(false);
    setSelectedProfile(null);
    try {
      const response = await apiConnector("GET", matrimonialEndpoints.PROFILE_API(profileId), null, authConfig);
      setSelectedProfile(response.data?.data?.profile || null);
      setProtectedContactUnlocked(Boolean(response.data?.data?.protectedContactUnlocked));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load profile details");
    } finally {
      setProfileDetailLoading(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setBusyId("profile-save");
    try {
      const formData = new FormData();
      Object.entries(formToPayload(form)).forEach(([k, v]) => {
        if (typeof v === "object" && v !== null) {
          formData.append(k, JSON.stringify(v));
        } else if (v !== undefined && v !== null && v !== "") {
          formData.append(k, String(v));
        }
      });

      if (matrimonialPhotoFile instanceof File) {
        formData.append("photo", matrimonialPhotoFile);
      }

      await apiConnector("POST", matrimonialEndpoints.MY_PROFILE_API, formData, authConfig);
      toast.success("Matrimonial profile submitted for review");
      setMatrimonialPhotoFile(null);
      await loadMine();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save matrimonial profile");
    } finally {
      setBusyId(null);
    }
  };

  const pauseOrResume = async (pause) => {
    setBusyId("visibility");
    try {
      await apiConnector("PATCH", matrimonialEndpoints.PROFILE_VISIBILITY_API, { pause }, authConfig);
      toast.success(pause ? "Profile paused" : "Profile resumed");
      await loadMine();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update visibility");
    } finally {
      setBusyId(null);
    }
  };

  const removeProfile = async () => {
    setBusyId("remove");
    try {
      await apiConnector("DELETE", matrimonialEndpoints.MY_PROFILE_API, { reason: "Removed from dashboard" }, authConfig);
      toast.success("Profile removed");
      setMyProfile(null);
      setForm(initialForm);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to remove profile");
    } finally {
      setBusyId(null);
    }
  };

  const expressInterest = async (profileId) => {
    if (busyId === profileId || interestSentIds.includes(profileId)) return;
    setBusyId(profileId);
    try {
      await apiConnector(
        "POST",
        matrimonialEndpoints.EXPRESS_INTEREST_API(profileId),
        { message: messageDrafts[profileId] || undefined },
        authConfig
      );
      toast.success("Interest sent");
      setInterestSentIds((current) => (current.includes(profileId) ? current : [...current, profileId]));
      setMessageDrafts((current) => ({ ...current, [profileId]: "" }));
      await loadProfiles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send interest");
    } finally {
      setBusyId(null);
    }
  };

  const respondInterest = async (interestId, action) => {
    setBusyId(interestId);
    try {
      await apiConnector("PATCH", matrimonialEndpoints.RESPOND_INTEREST_API(interestId), { action }, authConfig);
      toast.success("Interest updated");
      await loadInterests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update interest");
    } finally {
      setBusyId(null);
    }
  };

  const requestContact = async (interestId) => {
    setBusyId(`contact-${interestId}`);
    try {
      await apiConnector("POST", matrimonialEndpoints.REQUEST_CONTACT_API(interestId), { message: "Requesting contact details" }, authConfig);
      toast.success("Contact request sent");
      await loadContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to request contact");
    } finally {
      setBusyId(null);
    }
  };

  const reviewContact = async (requestId, action) => {
    setBusyId(requestId);
    try {
      await apiConnector("PATCH", matrimonialEndpoints.REVIEW_CONTACT_REQUEST_API(requestId), { action }, authConfig);
      toast.success("Contact request updated");
      await loadContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update contact request");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 pb-16 pt-24 text-[var(--text-primary)] sm:px-6 lg:px-8 transition-colors duration-300">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="border-b border-[var(--border-subtle)] pb-6">
          <div className="eyebrow-badge mb-3">
            <FiHeart size={14} />
            <span>{isHindi ? "वैवाहिक मंच" : "Matrimonial"}</span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="heading-hero text-[var(--text-primary)] mb-2">
                {isHindi ? "वैवाहिक " : "Matrimonial "}<span className="text-gradient">{isHindi ? "परिचय मंच" : "Portal"}</span>
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-6 text-[var(--text-secondary)] font-normal">
                {isHindi
                  ? "बैरवा समाज के सत्यापित युवक-युवतियों के बायोडाटा देखें, रुचि प्रेषित करें एवं अभिभावकों से संपर्क स्थापित करें।"
                  : "Create a reviewed profile, browse approved matches within Samaj, express mutual interest, and request verified contact details."}
              </p>
            </div>
            <Button icon={FiRefreshCw} onClick={refreshActive} disabled={loading}>
              {isHindi ? "ताज़ा करें" : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { key: "browse", label: isHindi ? "रिश्ते देखें" : "Browse Matches" },
            { key: "profile", label: isHindi ? "मेरी प्रोफ़ाइल" : "My Profile" },
            { key: "interests", label: isHindi ? "रुचि व अनुरोध" : "Interests & Requests" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`h-11 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[var(--accent-primary)] text-[#070707] shadow-md"
                  : "border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
          </div>
        ) : (
          <>
            {/* TAB: BROWSE PROFILES */}
            {activeTab === "browse" && (
              <section className="grid gap-5">
                <div className="ka-card p-4 grid gap-3 lg:grid-cols-[1fr_160px_160px_auto]">
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3">
                    <FiSearch className="text-[var(--text-muted)]" />
                    <input
                      className="h-10 min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] border-none shadow-none focus:ring-0"
                      value={filters.q}
                      onChange={(event) => setFilters((c) => ({ ...c, q: event.target.value }))}
                      placeholder={isHindi ? "नाम, व्यवसाय, शहर खोजें..." : "Search name, profession, city"}
                    />
                  </div>
                  <select
                    className={inputClass}
                    value={filters.gender}
                    onChange={(event) => setFilters((c) => ({ ...c, gender: event.target.value }))}
                  >
                    <option value="">{isHindi ? "सभी लिंग" : "All Genders"}</option>
                    <option value="MALE">{isHindi ? "वर (पुरुष)" : "Groom (Male)"}</option>
                    <option value="FEMALE">{isHindi ? "वधू (महिला)" : "Bride (Female)"}</option>
                    <option value="OTHER">{isHindi ? "अन्य" : "Other"}</option>
                  </select>
                  <input
                    className={inputClass}
                    value={filters.city}
                    onChange={(event) => setFilters((c) => ({ ...c, city: event.target.value }))}
                    placeholder="Filter by city"
                  />
                  <Button icon={FiSearch} onClick={loadProfiles}>Search</Button>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {profiles.map((profile) => (
                    <article key={profile._id} className="ka-card p-5 flex flex-col justify-between">
                      <div>
                        {profile.photos?.[0]?.url ? (
                          <div className="mb-4 aspect-[9/16] max-h-80 w-full rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-sm">
                            <img
                              src={profile.photos[0].url}
                              alt={profile.displayName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="mb-4 flex aspect-[9/16] max-h-80 w-full items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                            <FiUser size={48} />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">{profile.displayName}</h2>
                            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                              {profileAge(profile) || "N/A"} yrs • {profile.gender === "FEMALE" ? "Bride" : "Groom"}
                            </p>
                          </div>
                          <Status value={profile.gotra || "Gotra"} />
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-[var(--text-secondary)]">
                          <p className="flex items-center gap-1.5 text-[var(--accent-primary)] font-medium">
                            <FiBriefcase size={12} /> {profile.profession || "Profession not set"} • {profile.education || "Education not set"}
                          </p>
                          <p className="flex items-center gap-1.5 text-[var(--text-muted)]">
                            <FiMapPin size={12} /> {profile.currentCity || "City not set"} {profile.nativePlace ? `(Native: ${profile.nativePlace})` : ""}
                          </p>
                        </div>

                        {profile.about ? (
                          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-[var(--text-muted)]">
                            {profile.about}
                          </p>
                        ) : null}
                      </div>

                      <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
                        <textarea
                          className={`${textareaClass} !min-h-16 text-xs`}
                          value={messageDrafts[profile._id] || ""}
                          onChange={(event) => setMessageDrafts((current) => ({ ...current, [profile._id]: event.target.value }))}
                          placeholder="Optional personal message..."
                        />
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <Button
                            icon={FiEye}
                            type="button"
                            onClick={() => openProfileDetail(profile._id)}
                            disabled={profileDetailLoading}
                          >
                            View Profile
                          </Button>
                          <Button
                            icon={FiHeart}
                            tone="success"
                            type="button"
                            onClick={() => expressInterest(profile._id)}
                            disabled={busyId === profile._id || interestSentIds.includes(profile._id)}
                          >
                            {busyId === profile._id ? "Sending..." : interestSentIds.includes(profile._id) ? "Interest Sent" : "Express Interest"}
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {profiles.length === 0 ? (
                  <div className="ka-card p-12 text-center rounded-3xl border-dashed">
                    <FiHeart size={36} className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
                    <h3 className="text-base font-bold text-[var(--text-primary)]">No Approved Profiles Found</h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Profiles will appear here once submitted and verified by Samaj administrators.
                    </p>
                  </div>
                ) : null}
              </section>
            )}

            {/* TAB: MY PROFILE */}
            {activeTab === "profile" && (
              <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                <form onSubmit={saveProfile} className="grid gap-4 ka-card p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">My Matrimonial Profile</h2>
                      <p className="text-xs text-[var(--text-secondary)]">Keep your bio and contact details updated for verification.</p>
                    </div>
                    {myProfile ? <Status value={myProfile.status} /> : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Display Name">
                      <input className={inputClass} value={form.displayName} onChange={(event) => updateForm("displayName", event.target.value)} required />
                    </Field>
                    <Field label="Gender">
                      <select className={inputClass} value={form.gender} onChange={(event) => updateForm("gender", event.target.value)}>
                        <option value="MALE">Male (Groom)</option>
                        <option value="FEMALE">Female (Bride)</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </Field>
                    <Field label="Date Of Birth">
                      <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(event) => updateForm("dateOfBirth", event.target.value)} required />
                    </Field>
                    <Field label="Marital Status">
                      <select className={inputClass} value={form.maritalStatus} onChange={(event) => updateForm("maritalStatus", event.target.value)}>
                        <option value="NEVER_MARRIED">Never Married</option>
                        <option value="DIVORCED">Divorced</option>
                        <option value="WIDOWED">Widowed</option>
                        <option value="SEPARATED">Separated</option>
                      </select>
                    </Field>
                    <Field label="Height (e.g. 5ft 9in)">
                      <input className={inputClass} value={form.height} onChange={(event) => updateForm("height", event.target.value)} />
                    </Field>
                    <Field label="Gotra / Sub-caste">
                      <input className={inputClass} value={form.gotra} onChange={(event) => updateForm("gotra", event.target.value)} />
                    </Field>
                    <Field label="Highest Education">
                      <input className={inputClass} value={form.education} onChange={(event) => updateForm("education", event.target.value)} />
                    </Field>
                    <Field label="Profession / Occupation">
                      <input className={inputClass} value={form.profession} onChange={(event) => updateForm("profession", event.target.value)} />
                    </Field>
                    <Field label="Annual Income (Rs.)">
                      <input className={inputClass} value={form.annualIncome} onChange={(event) => updateForm("annualIncome", event.target.value)} />
                    </Field>
                    <Field label="Current City">
                      <input className={inputClass} value={form.currentCity} onChange={(event) => updateForm("currentCity", event.target.value)} />
                    </Field>
                    <Field label="Native Place / Village">
                      <input className={inputClass} value={form.nativePlace} onChange={(event) => updateForm("nativePlace", event.target.value)} />
                    </Field>
                    <Field label="Guardian Name">
                      <input className={inputClass} value={form.guardianName} onChange={(event) => updateForm("guardianName", event.target.value)} />
                    </Field>
                  </div>

                  <Field label="About Yourself">
                    <textarea className={textareaClass} value={form.about} onChange={(event) => updateForm("about", event.target.value)} placeholder="Introduce yourself, hobbies, values..." />
                  </Field>

                  <Field label="Partner Expectations">
                    <textarea className={textareaClass} value={form.expectations} onChange={(event) => updateForm("expectations", event.target.value)} placeholder="What are you looking for in a life partner..." />
                  </Field>

                  <div className="border-t border-[var(--border-subtle)] pt-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--accent-primary)] mb-3">Protected Contact Details (Revealed Only on Approval)</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Direct Phone">
                        <input className={inputClass} value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} />
                      </Field>
                      <Field label="Direct Email">
                        <input className={inputClass} value={form.email} onChange={(event) => updateForm("email", event.target.value)} />
                      </Field>
                    </div>
                  </div>

                  <Field label="Residential Address (Protected)">
                    <textarea
                      className={textareaClass}
                      value={form.address}
                      onChange={(event) => updateForm("address", event.target.value)}
                      placeholder="Full address — shared only after approved contact access"
                    />
                  </Field>

                  <div className="border-t border-[var(--border-subtle)] pt-4">
                    <Field label="Profile Photo">
                      <FileUploadWithPreview
                        file={matrimonialPhotoFile}
                        onFileSelect={setMatrimonialPhotoFile}
                        existingUrl={form.photoUrl}
                        label="Upload Matrimonial Photo (9:16 Portrait Recommended)"
                      />
                    </Field>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-[var(--border-subtle)] pt-4">
                    <Button
                      icon={FiSend}
                      tone="solid"
                      type="submit"
                      disabled={busyId === "profile-save"}
                    >
                      {busyId === "profile-save"
                        ? "Submitting..."
                        : myProfile
                          ? "Update Profile"
                          : "Submit For Review"}
                    </Button>
                    {myProfile ? (
                      <>
                        <Button
                          icon={myProfile.status === "PAUSED" ? FiPlayCircle : FiPauseCircle}
                          type="button"
                          onClick={() => pauseOrResume(myProfile.status !== "PAUSED")}
                          disabled={busyId === "visibility"}
                        >
                          {busyId === "visibility"
                            ? "Updating..."
                            : myProfile.status === "PAUSED"
                              ? "Resume Profile"
                              : "Pause Profile"}
                        </Button>
                        <Button
                          tone="danger"
                          type="button"
                          onClick={removeProfile}
                          disabled={busyId === "remove"}
                        >
                          {busyId === "remove" ? "Deleting..." : "Delete Profile"}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </form>

                {/* Profile Card Preview */}
                <div className="ka-card p-6 h-fit sticky top-28">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">Profile Status</h3>
                  {myProfile ? (
                    <div className="space-y-3 text-xs text-[var(--text-secondary)]">
                      <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                        <span>Verification Status</span>
                        <Status value={myProfile.status} />
                      </div>
                      <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                        <span>Display Name</span>
                        <strong className="text-[var(--text-primary)]">{myProfile.displayName}</strong>
                      </div>
                      <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                        <span>City</span>
                        <span>{myProfile.currentCity || "Not set"}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-3">
                        {myProfile.status === "PENDING_REVIEW"
                          ? "Your profile is currently awaiting approval by the matrimonial moderator."
                          : myProfile.status === "APPROVED"
                          ? "Your profile is active and visible to verified community members."
                          : "Your profile is currently paused or requires correction."}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)]">
                      You have not created a matrimonial profile yet. Fill in the form on the left to get started.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: INTERESTS & CONTACT REQUESTS */}
            {activeTab === "interests" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="ka-card p-5">
                  <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Received Interests</h2>
                  <div className="grid gap-3">
                    {interests.received?.map((interest) => (
                      <article key={interest._id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-sm text-[var(--text-primary)]">{interest.fromProfile?.displayName || "Profile"}</h3>
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">{interest.message || "Expressed interest in your profile"}</p>
                          </div>
                          <Status value={interest.status} />
                        </div>
                        {interest.status === "PENDING" ? (
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <Button tone="success" onClick={() => respondInterest(interest._id, "ACCEPT")} disabled={busyId === interest._id}>Accept</Button>
                            <Button tone="danger" onClick={() => respondInterest(interest._id, "REJECT")} disabled={busyId === interest._id}>Reject</Button>
                          </div>
                        ) : null}
                      </article>
                    ))}
                    {interests.received?.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] py-4 text-center">No received interests.</p>
                    ) : null}
                  </div>
                </section>

                <section className="ka-card p-5">
                  <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Sent Interests</h2>
                  <div className="grid gap-3">
                    {interests.sent?.map((interest) => (
                      <article key={interest._id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-sm text-[var(--text-primary)]">{interest.toProfile?.displayName || "Profile"}</h3>
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">{interest.message || "Interest expressed"}</p>
                          </div>
                          <Status value={interest.status} />
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {interest.status === "ACCEPTED" ? (
                            <Button icon={FiShield} tone="success" onClick={() => requestContact(interest._id)} disabled={busyId === `contact-${interest._id}`}>
                              Request Phone/Email
                            </Button>
                          ) : null}
                          {["PENDING", "ACCEPTED"].includes(interest.status) ? (
                            <Button tone="danger" onClick={() => respondInterest(interest._id, "WITHDRAW")} disabled={busyId === interest._id}>Withdraw</Button>
                          ) : null}
                        </div>
                      </article>
                    ))}
                    {interests.sent?.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] py-4 text-center">No sent interests.</p>
                    ) : null}
                  </div>
                </section>

                <section className="ka-card p-5 lg:col-span-2">
                  <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Protected Contact Requests</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {contacts.received?.map((request) => (
                      <article key={request._id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-sm text-[var(--text-primary)]">{request.requesterProfile?.displayName || "Member"}</h3>
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">Requested phone and email access</p>
                            {request.status === "APPROVED" && request.requesterProfile?.protectedContact ? (
                              <div className="mt-2 text-xs font-mono text-[var(--accent-primary)] space-y-1">
                                <p>📞 {request.requesterProfile.protectedContact.phone || "No phone"}</p>
                                <p>✉️ {request.requesterProfile.protectedContact.email || "No email"}</p>
                                {request.requesterProfile.protectedContact.address && (
                                  <p>📍 {request.requesterProfile.protectedContact.address}</p>
                                )}
                              </div>
                            ) : null}
                          </div>
                          <Status value={request.status} />
                        </div>
                        {request.status === "PENDING" ? (
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <Button tone="success" onClick={() => reviewContact(request._id, "APPROVE")} disabled={busyId === request._id}>Approve</Button>
                            <Button tone="danger" onClick={() => reviewContact(request._id, "REJECT")} disabled={busyId === request._id}>Reject</Button>
                          </div>
                        ) : null}
                      </article>
                    ))}

                    {contacts.sent?.map((request) => (
                      <article key={request._id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-sm text-[var(--text-primary)]">{request.targetProfile?.displayName || "Profile"}</h3>
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">Contact Request: {request.status}</p>
                            {request.status === "APPROVED" && request.targetProfile?.protectedContact ? (
                              <div className="mt-2 text-xs font-mono text-[var(--accent-primary)] space-y-1">
                                <p>📞 {request.targetProfile.protectedContact.phone || "No phone"}</p>
                                <p>✉️ {request.targetProfile.protectedContact.email || "No email"}</p>
                                {request.targetProfile.protectedContact.address && (
                                  <p>📍 {request.targetProfile.protectedContact.address}</p>
                                )}
                              </div>
                            ) : null}
                          </div>
                          <Status value={request.status} />
                        </div>
                      </article>
                    ))}

                    {!contacts.received?.length && !contacts.sent?.length ? (
                      <p className="text-xs text-[var(--text-muted)] py-4 text-center col-span-2">No contact requests.</p>
                    ) : null}
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </section>

      {(selectedProfile || profileDetailLoading) && (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="ka-card relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[var(--border-subtle)] p-5 shadow-2xl sm:p-7">
            <button
              type="button"
              onClick={() => {
                setSelectedProfile(null);
                setProfileDetailLoading(false);
                setProtectedContactUnlocked(false);
              }}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
              aria-label="Close profile details"
            >
              <FiX size={18} />
            </button>

            {profileDetailLoading ? (
              <div className="flex min-h-80 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <div>
                  <div className="aspect-[9/16] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
                    {selectedProfile?.photos?.[0]?.url ? (
                      <img src={selectedProfile.photos[0].url} alt={selectedProfile.displayName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
                        <FiUser size={48} />
                      </div>
                    )}
                  </div>
                  <Button
                    className="mt-4 w-full"
                    icon={FiHeart}
                    tone="success"
                    type="button"
                    onClick={() => expressInterest(selectedProfile._id)}
                    disabled={busyId === selectedProfile?._id || interestSentIds.includes(selectedProfile?._id)}
                  >
                    {busyId === selectedProfile?._id ? "Sending Interest..." : interestSentIds.includes(selectedProfile?._id) ? "Interest Sent" : "Express Interest"}
                  </Button>
                </div>

                <div className="min-w-0 pr-8 sm:pr-10">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                    <div>
                      <h2 className="text-2xl font-black text-[var(--text-primary)]">{selectedProfile?.displayName}</h2>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                        {profileAge(selectedProfile) || "N/A"} yrs • {selectedProfile?.gender === "FEMALE" ? "Bride" : "Groom"} • {formatProfileValue(selectedProfile?.maritalStatus)}
                      </p>
                    </div>
                    <Status value={selectedProfile?.status === "APPROVED" ? "Verified" : selectedProfile?.status} />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Height", selectedProfile?.height],
                      ["Gotra", selectedProfile?.gotra],
                      ["Education", selectedProfile?.education],
                      ["Profession", selectedProfile?.profession],
                      ["Annual Income", selectedProfile?.annualIncome],
                      ["Current City", selectedProfile?.currentCity],
                      ["Native Place", selectedProfile?.nativePlace],
                      ["Guardian", [selectedProfile?.guardian?.name, selectedProfile?.guardian?.relation].filter(Boolean).join(" - ")],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
                        <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{formatProfileValue(value)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-4">
                    {selectedProfile?.about ? (
                      <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">About</h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{selectedProfile.about}</p>
                      </section>
                    ) : null}
                    {selectedProfile?.expectations ? (
                      <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">Partner Expectations</h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{selectedProfile.expectations}</p>
                      </section>
                    ) : null}
                  </div>

                  <div className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                      <FiShield size={16} />
                      <span>Protected Contact</span>
                    </div>
                    {protectedContactUnlocked && selectedProfile?.protectedContact ? (
                      <div className="mt-3 grid gap-2 text-xs text-[var(--text-secondary)]">
                        {selectedProfile.protectedContact.phone ? <p className="flex items-center gap-2"><FiPhone size={13} /> {selectedProfile.protectedContact.phone}</p> : null}
                        {selectedProfile.protectedContact.email ? <p className="flex items-center gap-2"><FiMail size={13} /> {selectedProfile.protectedContact.email}</p> : null}
                        {selectedProfile.protectedContact.address ? <p className="flex items-center gap-2"><FiMapPin size={13} /> {selectedProfile.protectedContact.address}</p> : null}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                        Phone, email, exact address, and guardian contact details are hidden until mutual interest and approved contact access.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default MatrimonialPage;
