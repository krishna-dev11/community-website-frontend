import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaChevronLeft, FaChevronRight, FaSearch, FaSyncAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { profileEndpoints } from "../../../../services/apis";

const DirectoryField = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{label}</p>
    <p className="mt-1 truncate text-sm text-gray-200">{value || "Hidden"}</p>
  </div>
);

const MemberDirectory = () => {
  const { token } = useSelector((state) => state.auth);
  const [members, setMembers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: "",
    city: "",
    profession: "",
    page: 1,
    limit: 12,
  });

  const authConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }), [token]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined)
      );
      const response = await apiConnector("GET", profileEndpoints.MEMBER_DIRECTORY_API, null, authConfig, params);
      setMembers(response.data?.data?.members || []);
      setMeta(response.data?.meta || { page: filters.page, pages: 1, total: 0 });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load member directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [filters.page]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  };

  const submitSearch = (event) => {
    event.preventDefault();
    fetchMembers();
  };

  const changePage = (nextPage) => {
    setFilters((current) => ({
      ...current,
      page: Math.min(Math.max(nextPage, 1), Math.max(meta.pages || 1, 1)),
    }));
  };

  return (
    <div className="min-h-screen bg-black px-3 py-8 text-white md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">Members</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Member Directory</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Search active members while respecting each member's field-level privacy settings.
            </p>
          </div>

          <form onSubmit={submitSearch} className="grid gap-3 md:grid-cols-[1.3fr_0.8fr_0.8fr_auto]">
            <label className="flex h-11 min-w-0 items-center gap-3 border border-white/10 bg-white/[0.03] px-3">
              <FaSearch className="text-gray-500" size={13} />
              <input
                value={filters.q}
                onChange={(event) => updateFilter("q", event.target.value)}
                placeholder="Search name, profession, city"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
              />
            </label>
            <input
              value={filters.city}
              onChange={(event) => updateFilter("city", event.target.value)}
              placeholder="City"
              className="h-11 border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/40"
            />
            <input
              value={filters.profession}
              onChange={(event) => updateFilter("profession", event.target.value)}
              placeholder="Profession"
              className="h-11 border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/40"
            />
            <button className="inline-flex h-11 items-center justify-center gap-2 border border-emerald-400/30 bg-emerald-400/10 px-4 text-[11px] font-bold uppercase tracking-widest text-emerald-200 transition hover:bg-emerald-400/20">
              <FaSyncAlt size={12} />
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : members.length === 0 ? (
          <div className="border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-sm font-semibold text-white">No members found</p>
            <p className="mt-1 text-xs text-gray-500">Try a broader search or clear one of the filters.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <article key={member._id} className="border border-white/10 bg-white/[0.025] p-4 transition hover:border-emerald-400/30 hover:bg-white/[0.04]">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <img
                    src={member.imageUrl}
                    alt={`${member.firstName || "Member"} profile`}
                    className="h-12 w-12 rounded-full border border-white/10 object-cover"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-white">{member.firstName} {member.lastName}</h2>
                    <p className="truncate text-xs text-gray-500">{member.family?.familyName || "No family linked"}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <DirectoryField label="City" value={member.profile?.currentCity} />
                  <DirectoryField label="Profession" value={member.profile?.profession} />
                  <DirectoryField label="Phone" value={member.profile?.contactNumber} />
                  <DirectoryField label="Email" value={member.profile?.email} />
                  <DirectoryField label="Gotra" value={member.profile?.gotra} />
                  <DirectoryField label="Native" value={member.profile?.nativePlace} />
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 text-sm text-gray-400 md:flex-row md:items-center md:justify-between">
          <p>{meta.total || 0} members found</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changePage((meta.page || filters.page) - 1)}
              disabled={(meta.page || 1) <= 1}
              className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.03] text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft size={12} />
            </button>
            <span className="px-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              Page {meta.page || filters.page} of {Math.max(meta.pages || 1, 1)}
            </span>
            <button
              onClick={() => changePage((meta.page || filters.page) + 1)}
              disabled={(meta.page || 1) >= Math.max(meta.pages || 1, 1)}
              className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.03] text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDirectory;
