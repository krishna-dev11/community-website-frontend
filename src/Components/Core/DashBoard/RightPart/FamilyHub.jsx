import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaCopy, FaCrown, FaSearch, FaTimes, FaUserPlus } from "react-icons/fa";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { familyEndpoints } from "../../../../services/apis";

const Input = ({ label, ...props }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
    <input
      {...props}
      className="h-11 border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/40"
    />
  </label>
);

const Button = ({ children, tone = "neutral", icon: Icon, ...props }) => {
  const tones = {
    neutral: "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20",
    warning: "border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20",
    danger: "border-red-400/30 bg-red-400/10 text-red-200 hover:bg-red-400/20",
  };

  return (
    <button
      {...props}
      className={`inline-flex h-11 items-center justify-center gap-2 border px-4 text-[11px] font-bold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
};

const Stat = ({ label, value }) => (
  <div className="border border-white/10 bg-white/[0.025] p-4">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
    <p className="mt-1 text-lg font-bold text-white">{value || "Not set"}</p>
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
    <div className="min-h-screen bg-black px-3 py-8 text-white md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="border-b border-white/10 pb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">Family</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Family Hub</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Create a household, join an existing family, and manage requests as the family admin.
          </p>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : familyState.family ? (
          <>
            <section className="border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{familyState.family.familyName}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                      {familyState.membership?.role}
                    </span>
                    <span className="border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                      {familyState.family.status}
                    </span>
                  </div>
                </div>
                <Button icon={FaCopy} onClick={copyCode}>Copy Code</Button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <Stat label="Family Code" value={familyState.family.familyCode} />
                <Stat label="SSSM ID" value={familyState.family.sssmId} />
                <Stat label="City" value={familyState.family.currentCity} />
                <Stat label="Native Place" value={familyState.family.nativePlace} />
              </div>
            </section>

            {isFamilyAdmin && (
              <section className="border border-white/10 bg-white/[0.02] p-5">
                <div className="flex flex-col gap-1 border-b border-white/10 pb-4">
                  <h2 className="text-lg font-bold text-white">Join Requests</h2>
                  <p className="text-xs text-gray-500">Approve verified members before they enter your household record.</p>
                </div>

                {joinRequests.length === 0 ? (
                  <p className="py-6 text-sm text-gray-500">No pending join requests.</p>
                ) : (
                  <div className="divide-y divide-white/10">
                    {joinRequests.map((request) => (
                      <div key={request._id} className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={request.requestedBy?.imageUrl}
                            alt={`${request.requestedBy?.firstName || "Member"} profile`}
                            className="h-11 w-11 rounded-full border border-white/10 object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">{request.requestedBy?.firstName} {request.requestedBy?.lastName}</p>
                            <p className="truncate text-xs text-gray-500">{request.message || request.requestedBy?.email}</p>
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

            <section className="border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-col gap-1 border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white">Members</h2>
                <p className="text-xs text-gray-500">{familyState.members.length} active family members</p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {familyState.members.map((membership) => (
                  <article key={membership._id} className="flex items-center justify-between gap-3 border border-white/10 bg-black p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={membership.member?.imageUrl}
                        alt={`${membership.member?.firstName || "Member"} profile`}
                        className="h-11 w-11 rounded-full border border-white/10 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{membership.member?.firstName} {membership.member?.lastName}</p>
                        <p className="truncate text-xs text-gray-500">{membership.member?.additionalDetails?.profession || membership.member?.email}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {membership.role === "FAMILY_ADMIN" && <FaCrown className="text-amber-300" size={14} />}
                      {isFamilyAdmin && membership.role !== "FAMILY_ADMIN" && (
                        <button
                          onClick={() => transferAdmin(membership.member?._id)}
                          disabled={busyId === membership.member?._id}
                          className="border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-300 transition hover:bg-white/[0.08] disabled:opacity-50"
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
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="border border-white/10 bg-white/[0.02] p-5">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white">Create Family</h2>
                <p className="text-xs text-gray-500">Start a new household record and become its family admin.</p>
              </div>
              <form onSubmit={createFamily} className="mt-4 grid gap-4">
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

            <section className="border border-white/10 bg-white/[0.02] p-5">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white">Find Family</h2>
                <p className="text-xs text-gray-500">Search by family code, SSSM ID, or family name and request access.</p>
              </div>
              <form onSubmit={searchFamilies} className="mt-4 grid gap-4">
                <Input label="Family Code" value={search.familyCode} onChange={(event) => updateSearch("familyCode", event.target.value)} placeholder="FAM-123ABC" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="SSSM ID" value={search.sssmId} onChange={(event) => updateSearch("sssmId", event.target.value)} placeholder="SSSM / family id" />
                  <Input label="State" value={search.state} onChange={(event) => updateSearch("state", event.target.value)} placeholder="MP" />
                </div>
                <Input label="Family Name" value={search.q} onChange={(event) => updateSearch("q", event.target.value)} placeholder="Search by name" />
                <Button icon={FaSearch} disabled={busyId === "search"}>Search</Button>
              </form>

              <div className="mt-5 divide-y divide-white/10">
                {families.map((family) => (
                  <article key={family._id} className="py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">{family.familyName}</p>
                        <p className="mt-1 text-xs text-gray-500">{family.familyCode} - {family.currentCity || "City not set"}</p>
                      </div>
                      <Button icon={FaUserPlus} tone="success" disabled={busyId === family._id} onClick={() => requestJoin(family._id)}>Request</Button>
                    </div>
                    <input
                      value={joinMessage[family._id] || ""}
                      onChange={(event) => setJoinMessage((current) => ({ ...current, [family._id]: event.target.value }))}
                      placeholder="Optional note for family admin"
                      className="mt-3 h-10 w-full border border-white/10 bg-white/[0.03] px-3 text-xs text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/40"
                    />
                  </article>
                ))}
                {families.length === 0 && <p className="py-6 text-sm text-gray-500">Search results will appear here.</p>}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyHub;
