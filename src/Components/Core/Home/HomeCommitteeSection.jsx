import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiArrowRight, FiUser } from "react-icons/fi";
import { apiConnector } from "../../../services/apiConnector";
import { contentEndpoints } from "../../../services/apis";
import { realCommitteeMembers } from "../../../data/halbaData";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeCommitteeSection = () => {
  const { isHindi } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiConnector("GET", contentEndpoints.MANAGEMENT_API, null, null, {
      limit: 8,
      status: "active",
    })
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data?.data;
        const list = Array.isArray(data) ? data : data?.members || data?.committee || [];
        setMembers(list.slice(0, 4));
      })
      .catch(() => {
        if (!isMounted) return;
        setMembers([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            <FiUsers size={13} />
            <span>{isHindi ? "समिति नेतृत्व" : "Executive Leadership"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "समाज का नेतृत्व" : "Leadership of the Samaj"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {isHindi
              ? "आदिवासी हलबा/हलबी समाज कल्याण समिति, उज्जैन के मुख्य पदाधिकारी"
              : "Executive office bearers dedicated to community welfare and administration"}
          </p>
        </div>

        <Link
          to="/management-committee"
          className="btn-secondary !py-2.5 !px-5 !text-xs inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <span>{isHindi ? "पूरी समिति देखें" : "View Full Committee"}</span>
          <FiArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-[var(--surface-elevated)] animate-pulse border border-[var(--border-subtle)]" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-3 border border-emerald-500/20">
            <FiUsers size={22} />
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {isHindi
              ? "वर्तमान में समिति सदस्यों की सूची उपलब्ध नहीं है।"
              : "No committee members listed currently."}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)] max-w-md">
            {isHindi
              ? "आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन के संगठनात्मक पदाधिकारियों का विवरण जल्द उपलब्ध कराया जाएगा।"
              : "Executive office bearers and committee roster will be updated shortly."}
          </p>
          <Link
            to="/management-committee"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow transition-colors"
          >
            <span>{isHindi ? "पूरी समिति देखें" : "View Full Committee"}</span>
            <FiArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {members.map((member, idx) => {
            const photoUrl = member.photo?.url || member.image?.url || member.avatarUrl;
            const name = isHindi ? member.name : member.nameEn || member.name;
            const designation = isHindi
              ? member.designation || member.roleTitle || "पदाधिकारी"
              : member.designationEn || member.roleTitle || "Executive Member";

            return (
              <div
                key={member._id || idx}
                className="group p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-emerald-500/40 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface)] mb-4 flex items-center justify-center">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--surface-raised)] to-[var(--surface)] text-[var(--text-muted)]">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xl mb-1">
                          {name.charAt(0)}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                          {isHindi ? "सत्यापित पदाधिकारी" : "Office Bearer"}
                        </span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-emerald-300 border border-white/10 text-[9px] font-bold">
                      उज्जैन समिति
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
                    {name}
                  </h3>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {designation}
                  </p>
                  {member.bio && (
                    <p className="text-[11px] text-[var(--text-secondary)] mt-2 line-clamp-3 leading-relaxed font-normal">
                      {member.bio}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                  <Link
                    to="/management-committee"
                    className="text-xs font-bold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{isHindi ? "परिचय देखें" : "View Details"}</span>
                    <FiArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HomeCommitteeSection;
