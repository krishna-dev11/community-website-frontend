import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaCopy, FaCrown, FaSearch, FaTimes, FaUserPlus } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { familyEndpoints } from "../../../../services/apis";

const Input = ({ label, ...props }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
    <input
      {...props}
      className="ka-input !h-11 !py-0"
    />
  </label>
);

const Button = ({ children, tone = "neutral", icon: Icon, ...props }) => {
  const toneClasses = {
    neutral: "btn-secondary !py-2.5 !px-4 !text-xs",
    success: "btn-primary !py-2.5 !px-5 !text-xs",
    warning: "inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-bold text-xs uppercase tracking-wider px-4 py-2.5 transition-all hover:bg-amber-400/20 disabled:opacity-50 cursor-pointer",
    danger: "inline-flex items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 text-red-300 font-bold text-xs uppercase tracking-wider px-4 py-2.5 transition-all hover:bg-red-400/20 disabled:opacity-50 cursor-pointer",
  };

  return (
    <button
      {...props}
      className={`${toneClasses[tone]} cursor-pointer`}
    >
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </button>
  );
};

const Stat = ({ label, value }) => (
  <div className="ka-card p-4">
    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
    <p className="mt-1 text-base font-bold text-[var(--text-primary)] truncate">{value || <span className="text-[var(--text-muted)] italic font-normal">Not set</span>}</p>
  </div>
);

const FamilyHub = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [familyState, setFamilyState] = useState({ family: null, membership: null, members: [] });
  const [joinRequests, setJoinRequests] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [createForm, setCreateForm] = useState({
    familyName: "",
    sssmId: "",
    state: "",
    currentCity: "",
    nativePlace: "",
  });
  const [search, setSearch] = useState({ q: "", familyCode: "", sssmId: "", state: "" });
  const [families, setFamilies] = useState([]);
  const [joinMessage, setJoinMessage] = useState({});

  const authConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }), [token]);

  const isFamilyAdmin = familyState.membership?.role === "FAMILY_ADMIN";
  const familyId = familyState.family?._id;

  const loadMyFamily = async () => {
    setLoading(true);
    try {
      const response = await apiConnector("GET", familyEndpoints.MY_FAMILY_API, null, authConfig);
      const data = response.data?.data || {};
      setFamilyState({
        family: data.family || null,
        membership: data.membership || null,
        members: data.members || [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load family");
    } finally {
      setLoading(false);
    }
  };

  const loadJoinRequests = async () => {
    if (!familyId || !isFamilyAdmin) return;
    try {
      const response = await apiConnector("GET", familyEndpoints.FAMILY_JOIN_REQUESTS_API(familyId), null, authConfig);
      setJoinRequests(response.data?.data?.joinRequests || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load join requests");
    }
  };

  useEffect(() => {
    loadMyFamily();
  }, []);

  useEffect(() => {
    loadJoinRequests();
  }, [familyId, isFamilyAdmin]);

  const updateCreateForm = (key, value) => {
    setCreateForm((current) => ({ ...current, [key]: value }));
  };

  const updateSearch = (key, value) => {
    setSearch((current) => ({ ...current, [key]: value }));
  };

  const createFamily = async (event) => {
    event.preventDefault();
    setBusyId("create");
    try {
      await apiConnector("POST", familyEndpoints.CREATE_FAMILY_API, createForm, authConfig);
      toast.success("Family created");
      setCreateForm({ familyName: "", sssmId: "", state: "", currentCity: "", nativePlace: "" });
      await loadMyFamily();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create family");
    } finally {
      setBusyId(null);
    }
  };

  const searchFamilies = async (event) => {
    event.preventDefault();
    const params = Object.fromEntries(Object.entries(search).filter(([, value]) => value));
    if (!params.q && !params.familyCode && !params.sssmId) {
      toast.error("Search by family code, SSSM ID, or family name");
      return;
    }
    setBusyId("search");
    try {
      const response = await apiConnector("GET", familyEndpoints.SEARCH_FAMILIES_API, null, authConfig, params);
      setFamilies(response.data?.data?.families || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to search families");
    } finally {
      setBusyId(null);
    }
  };

  const requestJoin = async (targetFamilyId) => {
    setBusyId(targetFamilyId);
    try {
      await apiConnector(
        "POST",
        familyEndpoints.JOIN_FAMILY_API(targetFamilyId),
        { message: joinMessage[targetFamilyId] || undefined },
        authConfig
      );
      toast.success("Join request sent");
      setJoinMessage((current) => ({ ...current, [targetFamilyId]: "" }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send join request");
    } finally {
      setBusyId(null);
    }
  };

  const reviewJoinRequest = async (requestId, action) => {
    setBusyId(requestId);
    try {
      await apiConnector(
        "PATCH",
        familyEndpoints.REVIEW_FAMILY_JOIN_REQUEST_API(familyId, requestId),
        { action },
        authConfig
      );
      toast.success("Join request reviewed");
      setJoinRequests((current) => current.filter((request) => request._id !== requestId));
      await loadMyFamily();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to review request");
    } finally {
      setBusyId(null);
    }
  };

  const transferAdmin = async (memberId) => {
    setBusyId(memberId);
    try {
      await apiConnector("PATCH", familyEndpoints.TRANSFER_FAMILY_ADMIN_API(familyId), { memberId }, authConfig);
      toast.success("Family admin transferred");
      await loadMyFamily();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to transfer admin");
    } finally {
      setBusyId(null);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(familyState.family?.familyCode || "");
      toast.success("Family code copied");
    } catch {
      toast.error("Unable to copy code");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="border-b border-[var(--border-subtle)] pb-6">
          <div className="eyebrow-badge mb-2">
            <FiUsers size={13} />
            <span>Household Registry</span>
          </div>
          <h1 className="heading-hero text-[var(--text-primary)]">Family <span className="text-gradient">Hub</span></h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
            Create a household, join an existing family, and manage requests as the family admin.
          </p>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
          </div>
        ) : familyState.family ? (
          <>
            <section className="ka-card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">{familyState.family.familyName}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                      {familyState.membership?.role}
                    </span>
                    <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {familyState.family.status}
                    </span>
                  </div>
                </div>
                <Button icon={FaCopy} onClick={copyCode}>Copy Code</Button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                <Stat label="Family Code" value={familyState.family.familyCode} />
                <Stat label="SSSM ID" value={familyState.family.sssmId} />
                <Stat label="City" value={familyState.family.currentCity} />
                <Stat label="Native Place" value={familyState.family.nativePlace} />
              </div>
            </section>

            {isFamilyAdmin && (
              <section className="ka-card p-6">
                <div className="flex flex-col gap-1 border-b border-[var(--border-subtle)] pb-4">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Join Requests</h2>
                  <p className="text-xs text-[var(--text-muted)]">Approve verified members before they enter your household record.</p>
                </div>

                {joinRequests.length === 0 ? (
                  <p className="py-6 text-sm text-[var(--text-muted)]">No pending join requests.</p>
                ) : (
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {joinRequests.map((request) => (
                      <div key={request._id} className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={request.requestedBy?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${request.requestedBy?.firstName || "Member"}`}
                            alt={`${request.requestedBy?.firstName || "Member"} profile`}
                            className="h-11 w-11 rounded-2xl border border-[var(--border-subtle)] object-cover shadow-sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[var(--text-primary)]">{request.requestedBy?.firstName} {request.requestedBy?.lastName}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{request.message || request.requestedBy?.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 md:w-64">
                          <Button tone="success" icon={FaCheck} disabled={busyId === request._id} onClick={() => reviewJoinRequest(request._id, "APPROVE")}>Approve</Button>
                          <Button tone="danger" icon={FaTimes} disabled={busyId === request._id} onClick={() => reviewJoinRequest(request._id, "REJECT")}>Reject</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="ka-card p-6">
              <div className="flex flex-col gap-1 border-b border-[var(--border-subtle)] pb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Household Members</h2>
                <p className="text-xs text-[var(--text-muted)]">{familyState.members.length} active family members</p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {familyState.members.map((membership) => (
                  <article key={membership._id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={membership.member?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${membership.member?.firstName || "Member"}`}
                        alt={`${membership.member?.firstName || "Member"} profile`}
                        className="h-11 w-11 rounded-2xl border border-[var(--border-subtle)] object-cover shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[var(--text-primary)]">{membership.member?.firstName} {membership.member?.lastName}</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">{membership.member?.additionalDetails?.profession || membership.member?.email}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {membership.role === "FAMILY_ADMIN" && <FaCrown className="text-amber-400" size={15} />}
                      {isFamilyAdmin && membership.role !== "FAMILY_ADMIN" && (
                        <button
                          onClick={() => transferAdmin(membership.member?._id)}
                          disabled={busyId === membership.member?._id}
                          className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] disabled:opacity-50 cursor-pointer"
                        >
                          Make Admin
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="ka-card p-6">
              <div className="border-b border-[var(--border-subtle)] pb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Create Family</h2>
                <p className="text-xs text-[var(--text-muted)]">Start a new household record and become its family admin.</p>
              </div>
              <form onSubmit={createFamily} className="mt-5 grid gap-4">
                <Input label="Family Name" value={createForm.familyName} onChange={(event) => updateCreateForm("familyName", event.target.value)} placeholder="Sharma Family" required />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="SSSM ID" value={createForm.sssmId} onChange={(event) => updateCreateForm("sssmId", event.target.value)} placeholder="SSSM / family id" required />
                  <Input label="State" value={createForm.state} onChange={(event) => updateCreateForm("state", event.target.value)} placeholder="MP" required />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Current City" value={createForm.currentCity} onChange={(event) => updateCreateForm("currentCity", event.target.value)} placeholder="Ujjain" />
                  <Input label="Native Place" value={createForm.nativePlace} onChange={(event) => updateCreateForm("nativePlace", event.target.value)} placeholder="Indore" />
                </div>
                <Button tone="success" disabled={busyId === "create"}>Create Family</Button>
              </form>
            </section>

            <section className="ka-card p-6">
              <div className="border-b border-[var(--border-subtle)] pb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Find Family</h2>
                <p className="text-xs text-[var(--text-muted)]">Search by family code, SSSM ID, or family name and request access.</p>
              </div>
              <form onSubmit={searchFamilies} className="mt-5 grid gap-4">
                <Input label="Family Code" value={search.familyCode} onChange={(event) => updateSearch("familyCode", event.target.value)} placeholder="FAM-123ABC" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="SSSM ID" value={search.sssmId} onChange={(event) => updateSearch("sssmId", event.target.value)} placeholder="SSSM / family id" />
                  <Input label="State" value={search.state} onChange={(event) => updateSearch("state", event.target.value)} placeholder="MP" />
                </div>
                <Input label="Family Name" value={search.q} onChange={(event) => updateSearch("q", event.target.value)} placeholder="Search by name" />
                <Button icon={FaSearch} disabled={busyId === "search"}>Search</Button>
              </form>

              <div className="mt-5 divide-y divide-[var(--border-subtle)]">
                {families.map((family) => (
                  <article key={family._id} className="py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{family.familyName}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{family.familyCode} - {family.currentCity || "City not set"}</p>
                      </div>
                      <Button icon={FaUserPlus} tone="success" disabled={busyId === family._id} onClick={() => requestJoin(family._id)}>Request</Button>
                    </div>
                    <input
                      value={joinMessage[family._id] || ""}
                      onChange={(event) => setJoinMessage((current) => ({ ...current, [family._id]: event.target.value }))}
                      placeholder="Optional note for family admin"
                      className="ka-input mt-3 !h-10 !text-xs"
                    />
                  </article>
                ))}
                {families.length === 0 && <p className="py-6 text-sm text-[var(--text-muted)]">Search results will appear here.</p>}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyHub;

