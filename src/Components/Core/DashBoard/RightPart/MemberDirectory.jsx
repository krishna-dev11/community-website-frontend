import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaChevronLeft, FaChevronRight, FaSearch, FaSyncAlt } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { profileEndpoints } from "../../../../services/apis";

const DirectoryField = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
    <p className="mt-0.5 truncate text-xs sm:text-sm font-medium text-[var(--text-primary)]">{value || <span className="text-[var(--text-muted)] italic font-normal">Hidden</span>}</p>
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
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <div className="eyebrow-badge mb-2">
              <FiUsers size={13} />
              <span>Verified Directory</span>
            </div>
            <h1 className="heading-hero text-[var(--text-primary)]">Member <span className="text-gradient">Directory</span></h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
              Search active members while respecting each member's field-level privacy settings.
            </p>
          </div>

          <form onSubmit={submitSearch} className="grid gap-3 md:grid-cols-[1.3fr_0.8fr_0.8fr_auto]">
            <label className="flex h-11 min-w-0 items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4">
              <FaSearch className="text-[var(--text-muted)] shrink-0" size={13} />
              <input
                value={filters.q}
                onChange={(event) => updateFilter("q", event.target.value)}
                placeholder="Search name, profession, city"
                className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] border-none shadow-none focus:ring-0"
              />
            </label>
            <input
              value={filters.city}
              onChange={(event) => updateFilter("city", event.target.value)}
              placeholder="City"
              className="ka-input !h-11 !py-0"
            />
            <input
              value={filters.profession}
              onChange={(event) => updateFilter("profession", event.target.value)}
              placeholder="Profession"
              className="ka-input !h-11 !py-0"
            />
            <button type="submit" className="btn-primary !h-11 !py-0 !px-5 !text-xs">
              <FaSyncAlt size={12} />
              <span>Search</span>
            </button>
          </form>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)]" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="ka-card border-dashed px-6 py-12 text-center">
            <p className="text-sm font-bold text-[var(--text-primary)]">No members found</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Try a broader search or clear one of the filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <article key={member._id} className="ka-card p-5">
                <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
                  <img
                    src={member.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${member.firstName || "Member"}`}
                    alt={`${member.firstName || "Member"} profile`}
                    className="h-12 w-12 rounded-2xl border border-[var(--border-subtle)] object-cover shadow-sm"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-[var(--text-primary)]">{member.firstName} {member.lastName}</h2>
                    <p className="truncate text-xs text-[var(--accent-primary)] font-medium">{member.family?.familyName || "Independent Member"}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3.5">
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

        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-4 text-xs font-medium text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <p>{meta.total || 0} members found</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changePage((meta.page || filters.page) - 1)}
              disabled={(meta.page || 1) <= 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <FaChevronLeft size={11} />
            </button>
            <span className="px-3 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Page {meta.page || filters.page} of {Math.max(meta.pages || 1, 1)}
            </span>
            <button
              onClick={() => changePage((meta.page || filters.page) + 1)}
              disabled={(meta.page || 1) >= Math.max(meta.pages || 1, 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <FaChevronRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDirectory;

