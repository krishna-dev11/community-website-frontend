import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaRedo, FaSearch, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { adminEndpoints } from "../../../../services/apis";

const statusStyles = {
  PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  CORRECTION_REQUESTED: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  ACTIVE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  REJECTED: "border-red-400/30 bg-red-400/10 text-red-200",
};

const ActionButton = ({ children, icon: Icon, tone = "neutral", ...props }) => {
  const tones = {
    neutral: "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20",
    warning: "border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20",
    danger: "border-red-400/30 bg-red-400/10 text-red-200 hover:bg-red-400/20",
  };

  return (
    <button
      {...props}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-[11px] font-bold uppercase tracking-widest transition ${tones[tone]} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
};

const EmptyState = () => (
  <div className="border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
    <p className="text-sm font-semibold text-white">No pending registrations</p>
    <p className="mt-1 text-xs text-gray-500">New member applications will appear here for review.</p>
  </div>
);

const AdminRegistrationQueue = () => {
  const { token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeUserId, setActiveUserId] = useState(null);
  const [reasonByUser, setReasonByUser] = useState({});

  const authConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }), [token]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await apiConnector("GET", adminEndpoints.PENDING_REGISTRATIONS_API, null, authConfig);
      setUsers(response.data?.data?.users || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load registration queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchText = `${user.firstName || ""} ${user.lastName || ""} ${user.email || ""} ${user.additionalDetails?.currentCity || ""}`.toLowerCase();
    return searchText.includes(query.trim().toLowerCase());
  });

  const reviewUser = async (userId, action) => {
    setActiveUserId(userId);
    try {
      await apiConnector(
        "PATCH",
        adminEndpoints.REVIEW_REGISTRATION_API(userId),
        { action, reason: reasonByUser[userId] || undefined },
        authConfig
      );
      toast.success("Registration updated");
      setUsers((current) => current.filter((user) => user._id !== userId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Review action failed");
    } finally {
      setActiveUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black px-3 py-8 text-white md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">Admin</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Registration Queue</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Review pending members, request corrections, or reject incomplete applications.
            </p>
          </div>

          <label className="flex h-11 min-w-0 items-center gap-3 border border-white/10 bg-white/[0.03] px-3 md:w-80">
            <FaSearch className="text-gray-500" size={13} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, city"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
            />
          </label>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden border border-white/10">
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_1.3fr] gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 md:grid">
              <span>Applicant</span>
              <span>Community Info</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            <div className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <div key={user._id} className="grid gap-4 bg-black px-4 py-5 md:grid-cols-[1.4fr_1fr_1fr_1.3fr] md:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={user.imageUrl}
                      alt={`${user.firstName || "Member"} profile`}
                      className="h-12 w-12 shrink-0 rounded-full border border-white/10 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{user.firstName} {user.lastName}</p>
                      <p className="truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs md:block">
                    <p className="text-gray-500">City <span className="text-gray-300">{user.additionalDetails?.currentCity || "Not set"}</span></p>
                    <p className="text-gray-500">Profession <span className="text-gray-300">{user.additionalDetails?.profession || "Not set"}</span></p>
                  </div>

                  <div>
                    <span className={`inline-flex border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${statusStyles[user.accountStatus] || "border-white/10 bg-white/[0.03] text-gray-300"}`}>
                      {user.accountStatus}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <input
                      value={reasonByUser[user._id] || ""}
                      onChange={(event) => setReasonByUser((current) => ({ ...current, [user._id]: event.target.value }))}
                      placeholder="Reason or note"
                      className="h-10 border border-white/10 bg-white/[0.03] px-3 text-xs text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/40"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <ActionButton icon={FaCheck} tone="success" disabled={activeUserId === user._id} onClick={() => reviewUser(user._id, "APPROVE")}>Approve</ActionButton>
                      <ActionButton icon={FaRedo} tone="warning" disabled={activeUserId === user._id} onClick={() => reviewUser(user._id, "REQUEST_CORRECTION")}>Fix</ActionButton>
                      <ActionButton icon={FaTimes} tone="danger" disabled={activeUserId === user._id} onClick={() => reviewUser(user._id, "REJECT")}>Reject</ActionButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRegistrationQueue;
