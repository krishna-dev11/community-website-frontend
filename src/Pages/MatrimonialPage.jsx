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
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { apiConnector } from "../services/apiConnector";
import { matrimonialEndpoints } from "../services/apis";
import FileUploadWithPreview from "../Components/Common/FileUploadWithPreview";
import { useLanguage } from "../i18n/LanguageContext";

const inputClass = "ka-input";
const textareaClass = "ka-input !min-h-24 resize-none !py-3";

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

const profileInitials = (name = "Profile") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";

const formatProfileDate = (value) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const normalizePhoneForLink = (phone = "") => String(phone).replace(/[^\d]/g, "");

const ContactActionLinks = ({ phone }) => {
  const digits = normalizePhoneForLink(phone);
  if (!digits) return null;
  const whatsappUrl = `https://wa.me/${digits}`;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <a className="btn-secondary !px-3 !py-2 !text-[11px]" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <a className="btn-secondary !px-3 !py-2 !text-[11px]" href={`tel:${digits}`}>
        Call
      </a>
      <a className="btn-secondary !px-3 !py-2 !text-[11px]" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        WhatsApp Video
      </a>
    </div>
  );
};

const ProtectedContactDetails = ({ contact }) => {
  if (!contact) return null;
  return (
    <div className="mt-2 space-y-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-2 text-xs text-emerald-300">
      {contact.phone ? <p className="flex items-center gap-2"><FiPhone size={13} /> {contact.phone}</p> : null}
      {contact.email ? <p className="flex items-center gap-2"><FiMail size={13} /> {contact.email}</p> : null}
      {contact.address ? <p className="flex items-center gap-2"><FiMapPin size={13} /> {contact.address}</p> : null}
      <ContactActionLinks phone={contact.phone} />
    </div>
  );
};

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
  kul: "",
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

const initialFilters = {
  q: "",
  gender: "",
  gotra: "",
  kul: "",
  minAge: "",
  maxAge: "",
  city: "",
  nativePlace: "",
  minIncome: "",
  maxIncome: "",
  profession: "",
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
  kul: profile?.kul || "",
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
  kul: form.kul,
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
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState("browse");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [interests, setInterests] = useState({ sent: [], received: [] });
  const [contacts, setContacts] = useState({ sent: [], received: [] });
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [filterOptions, setFilterOptions] = useState({ gotras: [], kuls: [], cities: [], nativePlaces: [] });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [matrimonialPhotoFile, setMatrimonialPhotoFile] = useState(null);
  const [messageDrafts, setMessageDrafts] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileDetailLoading, setProfileDetailLoading] = useState(false);
  const [interestProfileModal, setInterestProfileModal] = useState(null);
  const [interestProfileLoading, setInterestProfileLoading] = useState(false);
  const [protectedContactUnlocked, setProtectedContactUnlocked] = useState(false);
  const [interestSentIds, setInterestSentIds] = useState([]);

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (appliedFilters.q?.trim()) {
      chips.push({ key: "q", label: `Search: "${appliedFilters.q.trim()}"` });
    }
    if (appliedFilters.gender) {
      const gLabel = appliedFilters.gender === "MALE" ? "Groom" : appliedFilters.gender === "FEMALE" ? "Bride" : "Other";
      chips.push({ key: "gender", label: `Gender: ${gLabel}` });
    }
    if (appliedFilters.gotra?.trim()) {
      chips.push({ key: "gotra", label: `Gotra: ${appliedFilters.gotra.trim()}` });
    }
    if (appliedFilters.kul?.trim()) {
      chips.push({ key: "kul", label: `Kul: ${appliedFilters.kul.trim()}` });
    }
    if (appliedFilters.minAge || appliedFilters.maxAge) {
      chips.push({
        key: "age",
        label: `Age: ${appliedFilters.minAge || "18"} - ${appliedFilters.maxAge || "Any"}`,
      });
    }
    if (appliedFilters.city?.trim()) {
      chips.push({ key: "city", label: `City: ${appliedFilters.city.trim()}` });
    }
    if (appliedFilters.nativePlace?.trim()) {
      chips.push({ key: "nativePlace", label: `Native: ${appliedFilters.nativePlace.trim()}` });
    }
    if (appliedFilters.minIncome || appliedFilters.maxIncome) {
      const minText = appliedFilters.minIncome ? `₹${Number(appliedFilters.minIncome).toLocaleString("en-IN")}` : "₹0";
      const maxText = appliedFilters.maxIncome ? `₹${Number(appliedFilters.maxIncome).toLocaleString("en-IN")}` : "Any";
      chips.push({ key: "income", label: `Income: ${minText} - ${maxText}` });
    }
    return chips;
  }, [appliedFilters]);

  const removeFilterChip = (key) => {
    let updated;
    if (key === "age") {
      updated = { ...filters, minAge: "", maxAge: "" };
    } else if (key === "income") {
      updated = { ...filters, minIncome: "", maxIncome: "" };
    } else {
      updated = { ...filters, [key]: "" };
    }
    setFilters(updated);
    loadProfiles(1, updated);
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
    loadProfiles(1, initialFilters);
  };

  const selectedProfileContactApproved = useMemo(() => {
    if (!selectedProfile?._id) return false;
    return contacts.sent?.some((request) => {
      const targetId = request.targetProfile?._id || request.targetProfile;
      return request.status === "APPROVED" && String(targetId) === String(selectedProfile._id);
    });
  }, [contacts.sent, selectedProfile?._id]);

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

  const loadFilterOptions = async () => {
    try {
      const response = await apiConnector("GET", matrimonialEndpoints.FILTERS_API, null, authConfig);
      if (response.data?.data) {
        setFilterOptions({
          gotras: response.data.data.gotras || [],
          kuls: response.data.data.kuls || [],
          cities: response.data.data.cities || [],
          nativePlaces: response.data.data.nativePlaces || [],
        });
      }
    } catch {
      // Ignore error gracefully
    }
  };

  const loadProfiles = async (pageToLoad = 1, filtersToApply = filters) => {
    try {
      const params = Object.fromEntries(
        Object.entries(filtersToApply).filter(([, v]) => v !== "" && v !== undefined && v !== null)
      );
      const response = await apiConnector("GET", matrimonialEndpoints.PROFILES_API, null, authConfig, {
        ...params,
        page: pageToLoad,
        limit: 12,
      });
      setProfiles(response.data?.data?.profiles || []);
      setTotalPages(response.data?.meta?.pages || 1);
      setTotalProfiles(response.data?.meta?.total || 0);
      setPage(pageToLoad);
      setAppliedFilters(filtersToApply);
    } catch {
      setProfiles([]);
      setTotalPages(1);
      setTotalProfiles(0);
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
      if (activeTab === "browse") {
        await Promise.all([loadProfiles(1, filters), loadFilterOptions()]);
      }
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

  useEffect(() => {
    const modalOpen = Boolean(selectedProfile || profileDetailLoading || interestProfileModal || interestProfileLoading);
    if (!modalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedProfile, profileDetailLoading, interestProfileModal, interestProfileLoading]);

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const openProfileDetail = async (profileId) => {
    setProfileDetailLoading(true);
    setProtectedContactUnlocked(false);
    setSelectedProfile(null);
    try {
      await loadContacts().catch(() => {});
      const response = await apiConnector("GET", matrimonialEndpoints.PROFILE_API(profileId), null, authConfig);
      setSelectedProfile(response.data?.data?.profile || null);
      setProtectedContactUnlocked(Boolean(response.data?.data?.protectedContactUnlocked));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load profile details");
    } finally {
      setProfileDetailLoading(false);
    }
  };

  const openReceivedInterestProfile = async (interest) => {
    setInterestProfileLoading(true);
    setInterestProfileModal(null);
    try {
      const response = await apiConnector("GET", matrimonialEndpoints.RECEIVED_INTEREST_PROFILE_API(interest._id), null, authConfig);
      setInterestProfileModal({
        interest: response.data?.data?.interest || interest,
        profile: response.data?.data?.profile || interest.fromProfile,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load sender profile");
    } finally {
      setInterestProfileLoading(false);
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
                  ? "हल्बा/हल्बी समाज के सत्यापित युवक-युवतियों के बायोडाटा देखें, रुचि प्रेषित करें एवं अभिभावकों से संपर्क स्थापित करें।"
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    loadProfiles(1, filters);
                  }}
                  className="ka-card p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                    <div className="flex items-center gap-2">
                      <FiFilter className="text-[var(--accent-primary)]" size={16} />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        {isHindi ? "वैवाहिक खोज एवं फ़िल्टर" : "Matrimonial Match Filters"}
                      </h2>
                      {activeFilterChips.length > 0 && (
                        <span className="inline-flex items-center justify-center rounded-full bg-[var(--accent-primary)] px-2 py-0.5 text-[10px] font-black text-black">
                          {activeFilterChips.length}
                        </span>
                      )}
                    </div>
                    {activeFilterChips.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                      >
                        {isHindi ? "सभी फ़िल्टर साफ़ करें" : "Clear All Filters"}
                      </button>
                    )}
                  </div>

                  {/* Filter Grid - Row 1 */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label={isHindi ? "नाम या कीवर्ड" : "Search Keyword"}>
                      <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3">
                        <FiSearch className="text-[var(--text-muted)] shrink-0" />
                        <input
                          className="h-10 min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] border-none shadow-none focus:ring-0"
                          value={filters.q}
                          onChange={(e) => setFilters((c) => ({ ...c, q: e.target.value }))}
                          placeholder={isHindi ? "नाम, पेशा या शहर..." : "Name, profession, city..."}
                        />
                      </div>
                    </Field>

                    <Field label={isHindi ? "लिंग" : "Gender"}>
                      <select
                        className={inputClass}
                        value={filters.gender}
                        onChange={(e) => setFilters((c) => ({ ...c, gender: e.target.value }))}
                      >
                        <option value="">{isHindi ? "सभी लिंग" : "All Genders"}</option>
                        <option value="MALE">{isHindi ? "वर (पुरुष)" : "Groom (Male)"}</option>
                        <option value="FEMALE">{isHindi ? "वधू (महिला)" : "Bride (Female)"}</option>
                        <option value="OTHER">{isHindi ? "अन्य" : "Other"}</option>
                      </select>
                    </Field>

                    <Field label={isHindi ? "गोत्र" : "Gotra"}>
                      <select
                        className={inputClass}
                        value={filters.gotra}
                        onChange={(e) => setFilters((c) => ({ ...c, gotra: e.target.value }))}
                      >
                        <option value="">{isHindi ? "सभी गोत्र" : "All Gotras"}</option>
                        {filterOptions.gotras?.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label={isHindi ? "कुल" : "Kul"}>
                      <select
                        className={inputClass}
                        value={filters.kul}
                        onChange={(e) => setFilters((c) => ({ ...c, kul: e.target.value }))}
                      >
                        <option value="">{isHindi ? "सभी कुल" : "All Kuls"}</option>
                        {filterOptions.kuls?.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  {/* Filter Grid - Row 2 */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label={isHindi ? "आयु सीमा (वर्ष)" : "Age Range (Years)"}>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="18"
                          max="100"
                          className={inputClass}
                          value={filters.minAge}
                          onChange={(e) => setFilters((c) => ({ ...c, minAge: e.target.value }))}
                          placeholder={isHindi ? "न्यूनतम (18)" : "Min (18)"}
                        />
                        <input
                          type="number"
                          min="18"
                          max="100"
                          className={inputClass}
                          value={filters.maxAge}
                          onChange={(e) => setFilters((c) => ({ ...c, maxAge: e.target.value }))}
                          placeholder={isHindi ? "अधिकतम" : "Max"}
                        />
                      </div>
                    </Field>

                    <Field label={isHindi ? "वर्तमान शहर" : "Current City"}>
                      <input
                        list="city-filter-options"
                        className={inputClass}
                        value={filters.city}
                        onChange={(e) => setFilters((c) => ({ ...c, city: e.target.value }))}
                        placeholder={isHindi ? "शहर चुनें या लिखें..." : "Select or type city..."}
                      />
                      <datalist id="city-filter-options">
                        {filterOptions.cities?.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </Field>

                    <Field label={isHindi ? "मूल निवास / गाँव" : "Native Place / Village"}>
                      <input
                        list="native-filter-options"
                        className={inputClass}
                        value={filters.nativePlace}
                        onChange={(e) => setFilters((c) => ({ ...c, nativePlace: e.target.value }))}
                        placeholder={isHindi ? "गाँव / मूल निवास..." : "Village / native place..."}
                      />
                      <datalist id="native-filter-options">
                        {filterOptions.nativePlaces?.map((n) => (
                          <option key={n} value={n} />
                        ))}
                      </datalist>
                    </Field>

                    <Field label={isHindi ? "वार्षिक आय सीमा (₹)" : "Annual Income (₹)"}>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="50000"
                          min="0"
                          className={inputClass}
                          value={filters.minIncome}
                          onChange={(e) => setFilters((c) => ({ ...c, minIncome: e.target.value }))}
                          placeholder="Min ₹"
                        />
                        <input
                          type="number"
                          step="50000"
                          min="0"
                          className={inputClass}
                          value={filters.maxIncome}
                          onChange={(e) => setFilters((c) => ({ ...c, maxIncome: e.target.value }))}
                          placeholder="Max ₹"
                        />
                      </div>
                    </Field>
                  </div>

                  {/* Active Filter Chips */}
                  {activeFilterChips.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                      <span className="text-[11px] font-bold text-[var(--text-muted)]">Active:</span>
                      {activeFilterChips.map((chip) => (
                        <span
                          key={chip.key}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent-primary)]"
                        >
                          <span>{chip.label}</span>
                          <button
                            type="button"
                            onClick={() => removeFilterChip(chip.key)}
                            className="rounded-full hover:bg-[var(--accent-primary)]/20 p-0.5 cursor-pointer text-[var(--accent-primary)]"
                            aria-label={`Remove ${chip.label}`}
                          >
                            <FiX size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Submit / Clear Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-[var(--text-muted)]">
                      {totalProfiles} {totalProfiles === 1 ? "profile found" : "profiles found"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        onClick={clearAllFilters}
                        disabled={activeFilterChips.length === 0}
                      >
                        {isHindi ? "फ़िल्टर हटाएं" : "Clear Filters"}
                      </Button>
                      <Button
                        icon={FiSearch}
                        tone="solid"
                        type="submit"
                      >
                        {isHindi ? "फ़िल्टर लागू करें" : "Search / Apply"}
                      </Button>
                    </div>
                  </div>
                </form>

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
                          <div className="flex flex-col items-end gap-1">
                            <Status value={profile.gotra || "Gotra"} />
                            {profile.kul ? (
                              <span className="inline-flex w-fit rounded-full border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                Kul: {profile.kul}
                              </span>
                            ) : null}
                          </div>
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => loadProfiles(page - 1, appliedFilters)}
                      disabled={page <= 1}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <FiChevronLeft size={14} />
                      <span>{isHindi ? "पिछला" : "Previous"}</span>
                    </button>
                    <span className="text-xs font-bold text-[var(--text-muted)]">
                      {isHindi ? `पृष्ठ ${page} / ${totalPages}` : `Page ${page} of ${totalPages}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => loadProfiles(page + 1, appliedFilters)}
                      disabled={page >= totalPages}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>{isHindi ? "अगला" : "Next"}</span>
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                )}

                {profiles.length === 0 ? (
                  <div className="ka-card p-12 text-center rounded-3xl border-dashed space-y-3">
                    <FiHeart size={36} className="mx-auto text-[var(--text-muted)] opacity-50" />
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      {activeFilterChips.length > 0 ? "No Matching Profiles Found" : "No Approved Profiles Found"}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                      {activeFilterChips.length > 0
                        ? "Try adjusting or clearing some filters to broaden your search results."
                        : "Profiles will appear here once submitted and verified by Samaj administrators."}
                    </p>
                    {activeFilterChips.length > 0 && (
                      <div className="pt-2">
                        <Button onClick={clearAllFilters} tone="solid">
                          {isHindi ? "सभी फ़िल्टर साफ़ करें" : "Clear Filters"}
                        </Button>
                      </div>
                    )}
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
                    <Field label="Gotra">
                      <input className={inputClass} value={form.gotra} onChange={(event) => updateForm("gotra", event.target.value)} placeholder="e.g. Gothwal" />
                    </Field>
                    <Field label="Kul">
                      <input className={inputClass} value={form.kul} onChange={(event) => updateForm("kul", event.target.value)} placeholder="e.g. Kul Name" />
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
                      <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                        <span>Gotra</span>
                        <span>{myProfile.gotra || "Not set"}</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                        <span>Kul</span>
                        <span>{myProfile.kul || "Not set"}</span>
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
                    {interests.received?.map((interest) => {
                      const sender = interest.fromProfile;
                      const photoUrl = sender?.photos?.[0]?.url;
                      const summary = [
                        profileAge(sender) ? `${profileAge(sender)} yrs` : null,
                        sender?.height,
                        sender?.currentCity,
                      ].filter(Boolean).join(" · ");

                      return (
                        <article key={interest._id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex aspect-[4/5] w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-2 sm:w-24 md:w-28">
                              {photoUrl ? (
                                <img src={photoUrl} alt={sender?.displayName || "Matrimonial profile"} className="h-full w-full object-contain" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-xl bg-[var(--surface-raised)] text-lg font-black text-[var(--accent-primary)]">
                                  {profileInitials(sender?.displayName)}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="break-words font-bold text-sm text-[var(--text-primary)]">{sender?.displayName || "Profile"}</h3>
                                  {summary ? <p className="mt-1 text-xs font-semibold text-[var(--accent-primary)]">{summary}</p> : null}
                                  <div className="mt-2 grid gap-1 text-xs text-[var(--text-secondary)]">
                                    <p>{sender?.education || "Education not provided"}</p>
                                    <p>{sender?.profession || "Profession not provided"}</p>
                                    <p>{sender?.gotra || "Gotra not provided"}</p>
                                  </div>
                                  <p className="mt-2 break-words text-xs text-[var(--text-secondary)]">{interest.message || "Expressed interest in your profile"}</p>
                                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">Requested: {formatProfileDate(interest.createdAt)}</p>
                                </div>
                                <Status value={interest.status} />
                              </div>

                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <Button type="button" icon={FiEye} onClick={() => openReceivedInterestProfile(interest)} disabled={interestProfileLoading}>
                                  View Full Profile
                                </Button>
                                {interest.status === "PENDING" ? (
                                  <>
                                    <Button tone="success" onClick={() => respondInterest(interest._id, "ACCEPT")} disabled={busyId === interest._id}>Accept</Button>
                                    <Button tone="danger" onClick={() => respondInterest(interest._id, "REJECT")} disabled={busyId === interest._id}>Reject</Button>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                    {interests.received?.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] py-4 text-center">No received interests.</p>
                    ) : null}
                  </div>
                </section>

                <section className="ka-card p-5">
                  <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Sent Interests</h2>
                  <div className="grid gap-3">
                    {interests.sent?.map((interest) => {
                      const recipient = interest.toProfile;
                      const photoUrl = recipient?.photos?.[0]?.url;

                      return (
                        <article key={interest._id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex aspect-[4/5] w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-2 sm:w-24 md:w-28">
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={recipient?.displayName || "Matrimonial profile"}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-xl bg-[var(--surface-raised)] text-lg font-black text-[var(--accent-primary)]">
                                  {profileInitials(recipient?.displayName)}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="break-words font-bold text-sm text-[var(--text-primary)]">{recipient?.displayName || "Profile"}</h3>
                                  <p className="mt-1 break-words text-xs text-[var(--text-secondary)]">{interest.message || "Interest expressed"}</p>
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
                            </div>
                          </div>
                        </article>
                      );
                    })}
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
                              <ProtectedContactDetails contact={request.requesterProfile.protectedContact} />
                            ) : request.status === "APPROVED" ? (
                              <p className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-2 text-xs text-emerald-300">
                                Approved. Contact details are not provided by this member.
                              </p>
                            ) : null}
                            {request.status === "APPROVED" && request.targetProfile?.protectedContact?.phone ? (
                              <ContactActionLinks phone={request.targetProfile.protectedContact.phone} />
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
                            {request.status === "APPROVED" && request.targetProfile?.protectedContact?.phone ? (
                              <ContactActionLinks phone={request.targetProfile.protectedContact.phone} />
                            ) : null}
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
        <div className="fixed inset-0 z-[2200] flex items-center justify-center overflow-hidden bg-black/70 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
          <div className="ka-card flex max-h-[calc(100vh-2rem)] min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] shadow-2xl sm:max-h-[90vh]">
            <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface)] p-5 sm:p-7">
              <div className="min-w-0 pr-10">
                <p className="eyebrow-badge mb-2">Matrimonial Profile</p>
                <h2 className="break-words text-xl font-black text-[var(--text-primary)] sm:text-2xl">
                  {profileDetailLoading ? "Loading Profile" : selectedProfile?.displayName}
                </h2>
                {selectedProfile && (
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                    <span>{profileAge(selectedProfile) || "N/A"} yrs</span>
                    <span>•</span>
                    <span>{selectedProfile.gender === "FEMALE" ? "Bride" : "Groom"}</span>
                    <Status value={selectedProfile.status === "APPROVED" ? "Verified" : selectedProfile.status} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProfile(null);
                  setProfileDetailLoading(false);
                  setProtectedContactUnlocked(false);
                }}
                className="absolute right-4 top-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] sm:right-6 sm:top-6"
                aria-label="Close profile details"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 custom-scrollbar sm:p-7">
            {profileDetailLoading ? (
              <div className="flex min-h-80 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <div>
                  <div className="mx-auto aspect-[9/16] max-h-[42vh] w-full max-w-[280px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] lg:mx-0">
                    {selectedProfile?.photos?.[0]?.url ? (
                      <img src={selectedProfile.photos[0].url} alt={selectedProfile.displayName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
                        <FiUser size={48} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-0 pr-8 sm:pr-10">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                    <div>
                      <h2 className="text-2xl font-black text-[var(--text-primary)]">{selectedProfile?.displayName}</h2>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                        {profileAge(selectedProfile) || "N/A"} yrs • {selectedProfile?.gender === "FEMALE" ? "Bride" : "Groom"} • {formatProfileValue(selectedProfile?.maritalStatus)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Height", selectedProfile?.height],
                      ["Gotra", selectedProfile?.gotra],
                      ["Kul", selectedProfile?.kul],
                      ["Education", selectedProfile?.education],
                      ["Profession", selectedProfile?.profession],
                      ["Annual Income", selectedProfile?.annualIncome],
                      ["Current City", selectedProfile?.currentCity],
                      ["Native Place", selectedProfile?.nativePlace],
                      ["Guardian", [selectedProfile?.guardian?.name, selectedProfile?.guardian?.relation].filter(Boolean).join(" - ")],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
                        <p className="mt-1 break-words text-sm font-bold text-[var(--text-primary)]">{formatProfileValue(value)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-4">
                    {selectedProfile?.about ? (
                      <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">About</h3>
                        <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-[var(--text-secondary)]">{selectedProfile.about}</p>
                      </section>
                    ) : null}
                    {selectedProfile?.expectations ? (
                      <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">Partner Expectations</h3>
                        <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-[var(--text-secondary)]">{selectedProfile.expectations}</p>
                      </section>
                    ) : null}
                  </div>

                  <div className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                      <FiShield size={16} />
                      <span>Protected Contact</span>
                    </div>
                    {protectedContactUnlocked && selectedProfileContactApproved && selectedProfile?.protectedContact ? (
                      <div className="mt-3 grid gap-2 text-xs text-[var(--text-secondary)]">
                        {selectedProfile.protectedContact.phone ? <p className="flex items-center gap-2"><FiPhone size={13} /> {selectedProfile.protectedContact.phone}</p> : null}
                        {selectedProfile.protectedContact.email ? <p className="flex items-center gap-2"><FiMail size={13} /> {selectedProfile.protectedContact.email}</p> : null}
                        {selectedProfile.protectedContact.address ? <p className="flex items-center gap-2"><FiMapPin size={13} /> {selectedProfile.protectedContact.address}</p> : null}
                        {selectedProfile.guardian?.phone ? <p className="flex items-center gap-2"><FiPhone size={13} /> Guardian: {selectedProfile.guardian.phone}</p> : null}
                        {selectedProfile.guardian?.email ? <p className="flex items-center gap-2"><FiMail size={13} /> Guardian: {selectedProfile.guardian.email}</p> : null}
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

            {selectedProfile && (
              <div className="flex shrink-0 justify-end border-t border-[var(--border-subtle)] bg-[var(--surface)] p-4 sm:p-5">
                <Button
                  className="w-full sm:w-auto"
                  icon={FiHeart}
                  tone="success"
                  type="button"
                  onClick={() => expressInterest(selectedProfile._id)}
                  disabled={busyId === selectedProfile?._id || interestSentIds.includes(selectedProfile?._id)}
                >
                  {busyId === selectedProfile?._id ? "Sending Interest..." : interestSentIds.includes(selectedProfile?._id) ? "Interest Sent" : "Express Interest"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      {(interestProfileModal || interestProfileLoading) && (
        <div className="fixed inset-0 z-[2300] flex items-center justify-center overflow-hidden bg-black/70 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
          <div className="ka-card flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden border border-[var(--border-strong)] bg-[var(--surface)] shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface)] p-5 sm:p-6">
              <div>
                <p className="inline-flex rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]">
                  Received Interest Profile
                </p>
                <h2 className="mt-3 text-xl font-black text-[var(--text-primary)] sm:text-2xl">
                  {interestProfileLoading ? "Loading Profile" : interestProfileModal?.profile?.displayName || "Matrimonial Profile"}
                </h2>
                {interestProfileModal?.interest ? (
                  <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">
                    Interest sent on {formatProfileDate(interestProfileModal.interest.createdAt)} · {interestProfileModal.interest.status}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setInterestProfileModal(null);
                  setInterestProfileLoading(false);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                aria-label="Close interest profile"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 custom-scrollbar sm:p-6">
              {interestProfileLoading ? (
                <div className="flex min-h-80 items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                  <div>
                    <div className="mx-auto flex aspect-[4/5] w-full max-w-[260px] items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-2 lg:mx-0">
                      {interestProfileModal?.profile?.photos?.[0]?.url ? (
                        <img src={interestProfileModal.profile.photos[0].url} alt={interestProfileModal.profile.displayName} className="h-full w-full object-contain" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-xl bg-[var(--surface-raised)] text-3xl font-black text-[var(--accent-primary)]">
                          {profileInitials(interestProfileModal?.profile?.displayName)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 space-y-5">
                    <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[var(--accent-primary)]">Profile Header</h3>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                          ["Full Name", interestProfileModal?.profile?.displayName],
                          ["Age", interestProfileModal?.profile?.age ? `${interestProfileModal.profile.age} yrs` : null],
                          ["Date of Birth", formatProfileDate(interestProfileModal?.profile?.dateOfBirth)],
                          ["Gender", interestProfileModal?.profile?.gender],
                          ["Height", interestProfileModal?.profile?.height],
                          ["Marital Status", interestProfileModal?.profile?.maritalStatus],
                          ["Profile ID", interestProfileModal?.profile?._id],
                          ["Verification", interestProfileModal?.profile?.status],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
                            <p className="mt-1 break-words text-sm font-bold text-[var(--text-primary)]">{formatProfileValue(value)}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {[
                      {
                        title: "Personal Details",
                        rows: [
                          ["Current City", interestProfileModal?.profile?.currentCity],
                          ["Native Place", interestProfileModal?.profile?.nativePlace],
                        ],
                      },
                      {
                        title: "Community & Family",
                        rows: [
                          ["Gotra", interestProfileModal?.profile?.gotra],
                          ["Kul", interestProfileModal?.profile?.kul],
                          ["Family Details", interestProfileModal?.profile?.familyDetails],
                          ["Guardian", [interestProfileModal?.profile?.guardian?.name, interestProfileModal?.profile?.guardian?.relation].filter(Boolean).join(" - ")],
                        ],
                      },
                      {
                        title: "Education & Career",
                        rows: [
                          ["Education", interestProfileModal?.profile?.education],
                          ["Profession", interestProfileModal?.profile?.profession],
                          ["Annual Income", interestProfileModal?.profile?.annualIncome],
                        ],
                      },
                    ].map((section) => (
                      <section key={section.title} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--accent-primary)]">{section.title}</h3>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {section.rows.map(([label, value]) => (
                            <div key={label}>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
                              <p className="mt-1 whitespace-pre-line break-words text-sm font-semibold text-[var(--text-primary)]">{formatProfileValue(value)}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}

                    <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[var(--accent-primary)]">About Me</h3>
                      <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-[var(--text-secondary)]">{formatProfileValue(interestProfileModal?.profile?.about)}</p>
                    </section>

                    <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[var(--accent-primary)]">Partner Expectations</h3>
                      <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-[var(--text-secondary)]">{formatProfileValue(interestProfileModal?.profile?.expectations)}</p>
                    </section>
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 justify-end border-t border-[var(--border-subtle)] bg-[var(--surface)] p-4">
              <Button type="button" onClick={() => setInterestProfileModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MatrimonialPage;
