import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiMapPin, FiArrowRight, FiInbox } from "react-icons/fi";
import { apiConnector } from "../../../services/apiConnector";
import { contentEndpoints } from "../../../services/apis";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeEventsSection = () => {
  const { isHindi } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Fetch notices that are tagged as events or programs
    apiConnector("GET", contentEndpoints.NOTICES_API, null, null, { limit: 6 })
      .then((res) => {
        if (!isMounted) return;
        const allNotices = res?.data?.data?.notices || [];
        // Filter for event/program category if present
        const filtered = allNotices.filter((n) => {
          const cat = (n.category || "").toLowerCase();
          return cat.includes("event") || cat.includes("कार्यक्रम") || cat.includes("समारोह");
        });
        setEvents(filtered);
      })
      .catch(() => {
        if (!isMounted) return;
        setEvents([]);
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            <FiCalendar size={13} />
            <span>{isHindi ? "सामुदायिक गतिविधियां" : "Programs & Events"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "आगामी एवं नवीनतम कार्यक्रम" : "Latest Programs & Events"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {isHindi
              ? "समाज द्वारा आयोजित किए जाने वाले सामाजिक, सांस्कृतिक व संगठनात्मक कार्यक्रम"
              : "Community gatherings, cultural conventions, and official meetings"}
          </p>
        </div>

        {events.length > 0 && (
          <Link
            to="/notices"
            className="btn-secondary !py-2.5 !px-5 !text-xs inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <span>{isHindi ? "सभी कार्यक्रम देखें" : "View All Events"}</span>
            <FiArrowRight size={14} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] animate-pulse space-y-3"
            >
              <div className="h-4 w-1/3 rounded bg-[var(--surface-raised)]" />
              <div className="h-5 w-3/4 rounded bg-[var(--surface-raised)]" />
              <div className="h-12 w-full rounded bg-[var(--surface-raised)]" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Professional Empty State as strictly instructed: NO demo events */
        <div className="p-8 sm:p-12 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
            <FiInbox size={26} />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {isHindi
              ? "वर्तमान में कोई आगामी कार्यक्रम निर्धारित नहीं है"
              : "No upcoming programs are scheduled at present"}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mt-1.5 leading-relaxed font-normal">
            {isHindi
              ? "नवीन कार्यक्रमों, सम्मेलनों और बैठकों की आधिकारिक सूचना शीघ्र ही परिपत्र व सूचना पटल पर प्रकाशित की जाएगी।"
              : "Official dates and schedules for upcoming community conventions will be announced here soon."}
          </p>
          <div className="mt-5">
            <Link to="/notices" className="btn-secondary !py-2 !px-4 !text-xs">
              <span>{isHindi ? "सूचना पटल देखें" : "Check Notices"}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="group p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
                  <span className="font-bold text-emerald-500 uppercase tracking-wider text-[10px]">
                    {event.category || "कार्यक्रम"}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiCalendar size={12} />
                    {new Date(event.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <h3 className="text-base font-black text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors line-clamp-2">
                  {event.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-3 leading-relaxed">
                  {event.content}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <FiMapPin size={12} />
                  <span>{isHindi ? "उज्जैन" : "Ujjain"}</span>
                </span>
                <Link
                  to="/notices"
                  className="text-xs font-bold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1"
                >
                  <span>{isHindi ? "विवरण देखें" : "View Details"}</span>
                  <FiArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeEventsSection;
