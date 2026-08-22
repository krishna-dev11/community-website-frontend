import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  FiEye,
  FiHeart,
  FiPauseCircle,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiShield,
  FiTrash2,
} from "react-icons/fi";
import { apiConnector } from "../services/apiConnector";
import { matrimonialEndpoints } from "../services/apis";

const inputClass = "h-11 rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400";
const textareaClass = "min-h-24 resize-none rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400";

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
    neutral: "border-white/10 bg-white/5 text-white hover:bg-white/10",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20",
    danger: "border-red-400/30 bg-red-400/10 text-red-100 hover:bg-red-400/20",
    solid: "border-emerald-400 bg-emerald-400 text-black hover:bg-emerald-300",
  };

  return (
    <button
      {...props}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-bold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-60 ${tones[tone]} ${className}`}
    >
      {Icon ? <Icon size={15} /> : null}
      {children}
    </button>
  );
};

const Field = ({ label, children }) => (
  <label className="grid gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">{label}</span>
    {children}
  </label>
);

const Status = ({ value }) => (
  <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/65">
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
  photos: form.photoUrl.trim() ? [{ url: form.photoUrl.trim() }] : [],
  submitForReview: true,
});

const MatrimonialPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [interests, setInterests] = useState({ sent: [], received: [] });
  const [contacts, setContacts] = useState({ sent: [], received: [] });
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [form, setForm] = useState(initialForm);
  const [messageDrafts, setMessageDrafts] = useState({});

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const loadMine = async () => {
    const response = await apiConnector("GET", matrimonialEndpoints.MY_PROFILE_API, null, authConfig);
    const profile = response.data?.data?.profile || null;
    setMyProfile(profile);
    setForm(profileToForm(profile));
  };

  const loadProfiles = async () => {
    const params = Object.fromEntries(Object.entries({ q: query, gender, city, limit: 30 }).filter(([, value]) => value));
    const response = await apiConnector("GET", matrimonialEndpoints.PROFILES_API, null, authConfig, params);
    setProfiles(response.data?.data?.profiles || []);
  };

  const loadInterests = async () => {
    const response = await apiConnector("GET", matrimonialEndpoints.MY_INTERESTS_API, null, authConfig);
    setInterests(response.data?.data || { sent: [], received: [] });
  };

  const loadContacts = async () => {
    const response = await apiConnector("GET", matrimonialEndpoints.MY_CONTACT_REQUESTS_API, null, authConfig);
    setContacts(response.data?.data || { sent: [], received: [] });
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

  const saveProfile = async (event) => {
    event.preventDefault();
    setBusyId("profile-save");
    try {
      await apiConnector("POST", matrimonialEndpoints.MY_PROFILE_API, formToPayload(form), authConfig);
      toast.success("Matrimonial profile submitted for review");
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
    setBusyId(profileId);
    try {
      await apiConnector(
        "POST",
        matrimonialEndpoints.EXPRESS_INTEREST_API(profileId),
        { message: messageDrafts[profileId] || undefined },
        authConfig
      );
      toast.success("Interest sent");
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
    <main className="min-h-screen bg-[#071412] px-4 pb-16 pt-28 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="border-b border-white/10 pb-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-100">
            <FiHeart size={15} />
            Matrimonial
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">Matrimonial</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                Create a reviewed profile, browse approved matches, express interest, and request protected contact access.
              </p>
            </div>
            <Button icon={FiRefreshCw} onClick={refreshActive} disabled={loading}>Refresh</Button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { key: "profile", label: "My Profile" },
            { key: "browse", label: "Browse" },
            { key: "interests", label: "Interests" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`h-11 rounded-lg px-4 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === tab.key ? "bg-white text-black" : "border border-white/10 bg-white/5 text-white/65 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-56 animate-pulse rounded-lg border border-white/10 bg-white/5" />
        ) : (
          <>
            {activeTab === "profile" && (
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <form onSubmit={saveProfile} className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold">Profile Details</h2>
                    {myProfile ? <Status value={myProfile.status} /> : null}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Display Name"><input className={inputClass} value={form.displayName} onChange={(event) => updateForm("displayName", event.target.value)} required /></Field>
                    <Field label="Gender">
                      <select className={inputClass} value={form.gender} onChange={(event) => updateForm("gender", event.target.value)}>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </Field>
                    <Field label="Date Of Birth"><input type="date" className={inputClass} value={form.dateOfBirth} onChange={(event) => updateForm("dateOfBirth", event.target.value)} required /></Field>
                    <Field label="Marital Status">
                      <select className={inputClass} value={form.maritalStatus} onChange={(event) => updateForm("maritalStatus", event.target.value)}>
                        <option value="NEVER_MARRIED">Never married</option>
                        <option value="DIVORCED">Divorced</option>
                        <option value="WIDOWED">Widowed</option>
                        <option value="SEPARATED">Separated</option>
                      </select>
                    </Field>
                    <Field label="Height"><input className={inputClass} value={form.height} onChange={(event) => updateForm("height", event.target.value)} /></Field>
                    <Field label="Education"><input className={inputClass} value={form.education} onChange={(event) => updateForm("education", event.target.value)} /></Field>
                    <Field label="Profession"><input className={inputClass} value={form.profession} onChange={(event) => updateForm("profession", event.target.value)} /></Field>
                    <Field label="Annual Income"><input className={inputClass} value={form.annualIncome} onChange={(event) => updateForm("annualIncome", event.target.value)} /></Field>
                    <Field label="Current City"><input className={inputClass} value={form.currentCity} onChange={(event) => updateForm("currentCity", event.target.value)} /></Field>
                    <Field label="Native Place"><input className={inputClass} value={form.nativePlace} onChange={(event) => updateForm("nativePlace", event.target.value)} /></Field>
                    <Field label="Gotra"><input className={inputClass} value={form.gotra} onChange={(event) => updateForm("gotra", event.target.value)} /></Field>
                    <Field label="Photo URL"><input className={inputClass} value={form.photoUrl} onChange={(event) => updateForm("photoUrl", event.target.value)} /></Field>
                  </div>
                  <Field label="About"><textarea className={textareaClass} value={form.about} onChange={(event) => updateForm("about", event.target.value)} /></Field>
                  <Field label="Expectations"><textarea className={textareaClass} value={form.expectations} onChange={(event) => updateForm("expectations", event.target.value)} /></Field>
                  <Field label="Family Details"><textarea className={textareaClass} value={form.familyDetails} onChange={(event) => updateForm("familyDetails", event.target.value)} /></Field>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Protected Phone"><input className={inputClass} value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} /></Field>
                    <Field label="Protected Email"><input className={inputClass} value={form.email} onChange={(event) => updateForm("email", event.target.value)} /></Field>
                    <Field label="Protected Address"><input className={inputClass} value={form.address} onChange={(event) => updateForm("address", event.target.value)} /></Field>
                    <Field label="Guardian Name"><input className={inputClass} value={form.guardianName} onChange={(event) => updateForm("guardianName", event.target.value)} /></Field>
                    <Field label="Guardian Relation"><input className={inputClass} value={form.guardianRelation} onChange={(event) => updateForm("guardianRelation", event.target.value)} /></Field>
                    <Field label="Guardian Phone"><input className={inputClass} value={form.guardianPhone} onChange={(event) => updateForm("guardianPhone", event.target.value)} /></Field>
                  </div>
                  <Button type="submit" icon={FiSend} tone="solid" disabled={busyId === "profile-save"}>Submit For Review</Button>
                </form>

                <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                  <h2 className="text-xl font-bold">Profile Controls</h2>
                  {myProfile ? (
                    <div className="mt-4 grid gap-4">
                      {myProfile.photos?.[0]?.url ? <img src={myProfile.photos[0].url} alt={myProfile.displayName} className="aspect-video w-full rounded-lg object-cover" /> : null}
                      <div>
                        <h3 className="text-2xl font-bold">{myProfile.displayName}</h3>
                        <p className="mt-2 text-sm text-white/55">{myProfile.education || "Education not set"} - {myProfile.profession || "Profession not set"}</p>
                        <p className="mt-2 text-sm text-white/55">{myProfile.currentCity || "City not set"} - age {ageFromDate(myProfile.dateOfBirth) || "N/A"}</p>
                      </div>
                      {myProfile.reviewReason ? <p className="rounded-lg border border-amber-400/25 bg-amber-400/10 p-3 text-sm text-amber-100">{myProfile.reviewReason}</p> : null}
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button icon={FiPauseCircle} onClick={() => pauseOrResume(myProfile.status !== "PAUSED")} disabled={busyId === "visibility" || !["APPROVED", "PAUSED"].includes(myProfile.status)}>
                          {myProfile.status === "PAUSED" ? "Resume" : "Pause"}
                        </Button>
                        <Button icon={FiTrash2} tone="danger" onClick={removeProfile} disabled={busyId === "remove"}>Remove</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 rounded-lg border border-dashed border-white/10 p-6 text-sm text-white/55">No matrimonial profile yet.</p>
                  )}
                </section>
              </div>
            )}

            {activeTab === "browse" && (
              <section className="grid gap-5">
                <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 lg:grid-cols-[1fr_180px_180px_auto]">
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3">
                    <FiSearch className="text-white/35" />
                    <input className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search profile" />
                  </div>
                  <select className={inputClass} value={gender} onChange={(event) => setGender(event.target.value)}>
                    <option value="">All genders</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <input className={inputClass} value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" />
                  <Button icon={FiSearch} onClick={loadProfiles}>Search</Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {profiles.map((profile) => (
                    <article key={profile._id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                      {profile.photos?.[0]?.url ? <img src={profile.photos[0].url} alt={profile.displayName} className="mb-4 aspect-video w-full rounded-lg object-cover" /> : null}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-bold">{profile.displayName}</h2>
                          <p className="mt-1 text-sm text-white/55">{ageFromDate(profile.dateOfBirth) || "N/A"} yrs - {profile.currentCity || "City not set"}</p>
                          <p className="mt-2 text-sm text-white/55">{profile.education || "Education not set"} - {profile.profession || "Profession not set"}</p>
                        </div>
                        <Status value={profile.gotra || "Gotra"} />
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/60">{profile.about || "No profile note added."}</p>
                      <textarea
                        className={`${textareaClass} mt-4 min-h-20`}
                        value={messageDrafts[profile._id] || ""}
                        onChange={(event) => setMessageDrafts((current) => ({ ...current, [profile._id]: event.target.value }))}
                        placeholder="Optional interest message"
                      />
                      <Button className="mt-3 w-full" icon={FiHeart} tone="solid" onClick={() => expressInterest(profile._id)} disabled={busyId === profile._id}>
                        Express Interest
                      </Button>
                    </article>
                  ))}
                  {profiles.length === 0 ? <div className="rounded-lg border border-dashed border-white/10 p-8 text-sm text-white/55">No approved profiles found.</div> : null}
                </div>
              </section>
            )}

            {activeTab === "interests" && (
              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                  <h2 className="text-xl font-bold">Received Interests</h2>
                  <div className="mt-4 grid gap-3">
                    {interests.received?.map((interest) => (
                      <article key={interest._id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold">{interest.fromProfile?.displayName || "Profile"}</h3>
                            <p className="mt-1 text-sm text-white/55">{interest.message || interest.responseMessage || "No message"}</p>
                          </div>
                          <Status value={interest.status} />
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <Button tone="success" onClick={() => respondInterest(interest._id, "ACCEPT")} disabled={interest.status !== "PENDING" || busyId === interest._id}>Accept</Button>
                          <Button tone="danger" onClick={() => respondInterest(interest._id, "REJECT")} disabled={interest.status !== "PENDING" || busyId === interest._id}>Reject</Button>
                        </div>
                      </article>
                    ))}
                    {interests.received?.length === 0 ? <p className="text-sm text-white/50">No received interests.</p> : null}
                  </div>
                </section>

                <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                  <h2 className="text-xl font-bold">Sent Interests</h2>
                  <div className="mt-4 grid gap-3">
                    {interests.sent?.map((interest) => (
                      <article key={interest._id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold">{interest.toProfile?.displayName || "Profile"}</h3>
                            <p className="mt-1 text-sm text-white/55">{interest.message || "No message"}</p>
                          </div>
                          <Status value={interest.status} />
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <Button icon={FiShield} onClick={() => requestContact(interest._id)} disabled={interest.status !== "ACCEPTED" || busyId === `contact-${interest._id}`}>
                            Contact
                          </Button>
                          <Button tone="danger" onClick={() => respondInterest(interest._id, "WITHDRAW")} disabled={!["PENDING", "ACCEPTED"].includes(interest.status) || busyId === interest._id}>Withdraw</Button>
                        </div>
                      </article>
                    ))}
                    {interests.sent?.length === 0 ? <p className="text-sm text-white/50">No sent interests.</p> : null}
                  </div>
                </section>

                <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
                  <h2 className="text-xl font-bold">Contact Requests</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {contacts.received?.map((request) => (
                      <article key={request._id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold">{request.requesterProfile?.displayName || "Requester"}</h3>
                            <p className="mt-1 text-sm text-white/55">{request.message || "Requested contact access"}</p>
                          </div>
                          <Status value={request.status} />
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <Button tone="success" onClick={() => reviewContact(request._id, "APPROVE")} disabled={request.status !== "PENDING" || busyId === request._id}>Approve</Button>
                          <Button tone="danger" onClick={() => reviewContact(request._id, "REJECT")} disabled={request.status !== "PENDING" || busyId === request._id}>Reject</Button>
                        </div>
                      </article>
                    ))}
                    {contacts.sent?.map((request) => (
                      <article key={request._id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold">{request.targetProfile?.displayName || "Target profile"}</h3>
                            <p className="mt-1 text-sm text-white/55">Contact request sent</p>
                          </div>
                          <Status value={request.status} />
                        </div>
                      </article>
                    ))}
                    {!contacts.received?.length && !contacts.sent?.length ? <p className="text-sm text-white/50">No contact requests.</p> : null}
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default MatrimonialPage;
