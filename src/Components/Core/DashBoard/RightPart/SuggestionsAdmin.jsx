// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useSelector } from "react-redux";
// import toast from "react-hot-toast";
// import {
//   FaLightbulb,
//   FaSearch,
//   FaFilter,
//   FaSyncAlt,
//   FaEye,
//   FaPaperPlane,
//   FaTrashAlt,
//   FaUserCheck,
//   FaExclamationTriangle,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaHistory,
//   FaComments,
//   FaShieldAlt,
//   FaChevronLeft,
//   FaChevronRight,
//   FaTimes,
//   FaCircle,
// } from "react-icons/fa";
// import {
//   FiClock,
//   FiCheckCircle,
//   FiAlertCircle,
//   FiXCircle,
//   FiUser,
//   FiMessageSquare,
//   FiSend,
//   FiInbox,
//   FiTag,
//   FiFlag,
//   FiFileText,
// } from "react-icons/fi";
// import { apiConnector } from "../../../../services/apiConnector";
// import { suggestionEndpoints } from "../../../../services/apis";

// const {
//   ADMIN_LIST_SUGGESTIONS_API,
//   GET_SUGGESTION_API,
//   ADMIN_UPDATE_STATUS_API,
//   ADMIN_SET_PRIORITY_API,
//   ADMIN_REPLY_API,
//   ADMIN_DELETE_SUGGESTION_API,
// } = suggestionEndpoints;

// const STATUS_CONFIG = {
//   SUBMITTED: {
//     label: "Submitted",
//     labelHi: "नया / प्रस्तुत",
//     color: "text-blue-400",
//     bg: "border-blue-500/30 bg-blue-500/10",
//     badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
//     icon: FiClock,
//   },
//   UNDER_REVIEW: {
//     label: "Under Review",
//     labelHi: "समीक्षाधीन",
//     color: "text-amber-400",
//     bg: "border-amber-500/30 bg-amber-500/10",
//     badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
//     icon: FiClock,
//   },
//   IN_PROGRESS: {
//     label: "In Progress",
//     labelHi: "प्रगति पर",
//     color: "text-purple-400",
//     bg: "border-purple-500/30 bg-purple-500/10",
//     badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
//     icon: FiClock,
//   },
//   RESPONDED: {
//     label: "Responded",
//     labelHi: "उत्तर दिया गया",
//     color: "text-cyan-400",
//     bg: "border-cyan-500/30 bg-cyan-500/10",
//     badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
//     icon: FiCheckCircle,
//   },
//   RESOLVED: {
//     label: "Resolved",
//     labelHi: "समाधान हुआ",
//     color: "text-emerald-400",
//     bg: "border-emerald-500/30 bg-emerald-500/10",
//     badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
//     icon: FiCheckCircle,
//   },
//   CLOSED: {
//     label: "Closed",
//     labelHi: "समाप्त",
//     color: "text-gray-400",
//     bg: "border-gray-500/30 bg-gray-500/10",
//     badge: "bg-gray-500/20 text-gray-300 border-gray-500/30",
//     icon: FiXCircle,
//   },
//   REJECTED: {
//     label: "Rejected",
//     labelHi: "अस्वीकृत",
//     color: "text-red-400",
//     bg: "border-red-500/30 bg-red-500/10",
//     badge: "bg-red-500/20 text-red-300 border-red-500/30",
//     icon: FiXCircle,
//   },
// };

// const PRIORITY_CONFIG = {
//   LOW: { label: "Low", color: "text-gray-300", bg: "bg-gray-700/40 border-gray-600/40" },
//   MEDIUM: { label: "Medium", color: "text-blue-300", bg: "bg-blue-900/40 border-blue-700/40" },
//   HIGH: { label: "High", color: "text-amber-300", bg: "bg-amber-900/40 border-amber-700/40" },
//   URGENT: { label: "Urgent", color: "text-red-300", bg: "bg-red-900/40 border-red-700/40" },
// };

// const CATEGORIES = [
//   "General Suggestion",
//   "Community Improvement",
//   "Member Services",
//   "Family / Family Hub",
//   "Dharamshala",
//   "Monthly Contribution",
//   "Donation / Finance",
//   "Jobs",
//   "Scholarships",
//   "Matrimonial",
//   "Events",
//   "Website / Technical Issue",
//   "Content / Notices",
//   "Other",
// ];

// function getAuthToken() {
//   try {
//     const raw = localStorage.getItem("token");
//     if (raw) {
//       const parsed = JSON.parse(raw);
//       if (typeof parsed === "string") return parsed;
//     }
//   } catch (e) {
//     // ignore
//   }
//   const raw = localStorage.getItem("token");
//   if (raw && typeof raw === "string") {
//     let clean = raw.trim();
//     if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
//       clean = clean.slice(1, -1);
//     }
//     return clean;
//   }
//   const cookieToken = document.cookie
//     .split(";")
//     .map((c) => c.trim())
//     .find((c) => c.startsWith("token="))
//     ?.split("=")?.[1];
//   return cookieToken || "";
// }

// function authHeaders(explicitToken) {
//   const token = explicitToken || getAuthToken();
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// export default function SuggestionsAdmin() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const directId = searchParams.get("id");

//   const [suggestions, setSuggestions] = useState([]);
//   const [stats, setStats] = useState({});
//   const [total, setTotal] = useState(0);
//   const [pages, setPages] = useState(1);
//   const [loading, setLoading] = useState(false);

//   // Filters
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [priorityFilter, setPriorityFilter] = useState("");
//   const [unreadOnly, setUnreadOnly] = useState(false);
//   const [page, setPage] = useState(1);

//   // Active detail modal
//   const [selectedSuggestion, setSelectedSuggestion] = useState(null);
//   const [detailLoading, setDetailLoading] = useState(false);

//   // Action states inside modal
//   const [statusUpdate, setStatusUpdate] = useState("");
//   const [statusReason, setStatusReason] = useState("");
//   const [statusSubmitting, setStatusSubmitting] = useState(false);

//   const [priorityUpdate, setPriorityUpdate] = useState("");
//   const [prioritySubmitting, setPrioritySubmitting] = useState(false);

//   const [replyMessage, setReplyMessage] = useState("");
//   const [replySubmitting, setReplySubmitting] = useState(false);

//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [deleteReason, setDeleteReason] = useState("");
//   const [deleteSubmitting, setDeleteSubmitting] = useState(false);

//   // Active tab in detail modal
//   const [detailTab, setDetailTab] = useState("conversation"); // "conversation" | "history"

//   // Fetch list
//   const fetchSuggestions = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = {
//         page,
//         limit: 15,
//       };
//       if (search.trim()) params.search = search.trim();
//       if (statusFilter) params.status = statusFilter;
//       if (categoryFilter) params.category = categoryFilter;
//       if (priorityFilter) params.priority = priorityFilter;
//       if (unreadOnly) params.unreadOnly = "true";

//       const res = await apiConnector("GET", ADMIN_LIST_SUGGESTIONS_API, null, {
//         headers: authHeaders(),
//         withCredentials: true,
//         params,
//       });

//       if (res?.data?.success) {
//         setSuggestions(res.data.data || []);
//         setStats(res.data.metadata?.stats || {});
//         setTotal(res.data.metadata?.total || 0);
//         setPages(res.data.metadata?.pages || 1);
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to load suggestions.");
//     } finally {
//       setLoading(false);
//     }
//   }, [page, search, statusFilter, categoryFilter, priorityFilter, unreadOnly]);

//   useEffect(() => {
//     fetchSuggestions();
//   }, [fetchSuggestions]);

//   // Open detail by id
//   const openDetail = useCallback(async (id) => {
//     setDetailLoading(true);
//     try {
//       const res = await apiConnector("GET", GET_SUGGESTION_API(id), null, {
//         headers: authHeaders(),
//         withCredentials: true,
//       });
//       if (res?.data?.success) {
//         setSelectedSuggestion(res.data.data);
//         setStatusUpdate(res.data.data.status);
//         setPriorityUpdate(res.data.data.priority);
//         setStatusReason("");
//         setReplyMessage("");
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to load suggestion details.");
//     } finally {
//       setDetailLoading(false);
//     }
//   }, []);

//   // Handle direct url param ?id=...
//   useEffect(() => {
//     if (directId) {
//       openDetail(directId);
//     }
//   }, [directId, openDetail]);

//   const closeDetail = () => {
//     setSelectedSuggestion(null);
//     if (searchParams.get("id")) {
//       searchParams.delete("id");
//       setSearchParams(searchParams);
//     }
//   };

//   // Status Change Submit
//   const handleStatusChange = async (e) => {
//     e.preventDefault();
//     if (!statusUpdate) return;
//     if (statusUpdate === "REJECTED" && !statusReason.trim()) {
//       toast.error("Please provide a rejection reason.");
//       return;
//     }
//     setStatusSubmitting(true);
//     try {
//       const res = await apiConnector(
//         "PATCH",
//         ADMIN_UPDATE_STATUS_API(selectedSuggestion._id),
//         { status: statusUpdate, reason: statusReason.trim() },
//         { headers: authHeaders(), withCredentials: true }
//       );
//       if (res?.data?.success) {
//         toast.success(`Status updated to ${statusUpdate}`);
//         setSelectedSuggestion(res.data.data);
//         setStatusReason("");
//         fetchSuggestions();
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to update status.");
//     } finally {
//       setStatusSubmitting(false);
//     }
//   };

//   // Priority Change Submit
//   const handlePriorityChange = async () => {
//     if (!priorityUpdate || priorityUpdate === selectedSuggestion?.priority) return;
//     setPrioritySubmitting(true);
//     try {
//       const res = await apiConnector(
//         "PATCH",
//         ADMIN_SET_PRIORITY_API(selectedSuggestion._id),
//         { priority: priorityUpdate },
//         { headers: authHeaders(), withCredentials: true }
//       );
//       if (res?.data?.success) {
//         toast.success(`Priority set to ${priorityUpdate}`);
//         setSelectedSuggestion(res.data.data);
//         fetchSuggestions();
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to update priority.");
//     } finally {
//       setPrioritySubmitting(false);
//     }
//   };

//   // Admin Reply Submit
//   const handleReplySubmit = async (e) => {
//     e.preventDefault();
//     if (!replyMessage.trim()) {
//       toast.error("Reply message cannot be empty.");
//       return;
//     }
//     setReplySubmitting(true);
//     try {
//       const res = await apiConnector(
//         "POST",
//         ADMIN_REPLY_API(selectedSuggestion._id),
//         { message: replyMessage.trim() },
//         { headers: authHeaders(), withCredentials: true }
//       );
//       if (res?.data?.success) {
//         toast.success("Response sent to member successfully!");
//         setSelectedSuggestion(res.data.data);
//         setReplyMessage("");
//         fetchSuggestions();
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to send response.");
//     } finally {
//       setReplySubmitting(false);
//     }
//   };

//   // Delete Suggestion
//   const handleDeleteSuggestion = async () => {
//     setDeleteSubmitting(true);
//     try {
//       const res = await apiConnector(
//         "DELETE",
//         ADMIN_DELETE_SUGGESTION_API(selectedSuggestion._id),
//         { reason: deleteReason.trim() },
//         { headers: authHeaders(), withCredentials: true }
//       );
//       if (res?.data?.success) {
//         toast.success("Suggestion deleted.");
//         setDeleteModalOpen(false);
//         closeDetail();
//         fetchSuggestions();
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to delete suggestion.");
//     } finally {
//       setDeleteSubmitting(false);
//     }
//   };

//   return (
//     <div className="w-full min-h-screen pb-16 px-4 md:px-8 pt-6 max-w-7xl mx-auto space-y-6">
//       {/* ── Page Header ── */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
//         <div>
//           <div className="flex items-center gap-3">
//             <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-inner">
//               <FaLightbulb size={20} />
//             </div>
//             <div>
//               <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
//                 Member Suggestions Admin
//               </h1>
//               <p className="text-xs text-[var(--text-muted)]">
//                 सुझाव एवं प्रतिक्रिया प्रबंधन — Review, respond, and resolve community feedback
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => fetchSuggestions()}
//             disabled={loading}
//             className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-amber-500/50 hover:text-amber-400 transition-all cursor-pointer text-[var(--text-secondary)] shadow-sm"
//           >
//             <FaSyncAlt className={loading ? "animate-spin" : ""} size={12} />
//             <span>Refresh</span>
//           </button>
//         </div>
//       </div>

//       {/* ── Stats Summary Cards ── */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
//         {[
//           { key: "ALL", label: "Total", val: total, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
//           { key: "SUBMITTED", label: "New Submitted", val: stats.SUBMITTED || 0, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
//           { key: "UNDER_REVIEW", label: "Under Review", val: stats.UNDER_REVIEW || 0, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
//           { key: "IN_PROGRESS", label: "In Progress", val: stats.IN_PROGRESS || 0, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
//           { key: "RESPONDED", label: "Responded", val: stats.RESPONDED || 0, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
//           { key: "RESOLVED", label: "Resolved", val: stats.RESOLVED || 0, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
//         ].map((s) => {
//           const isSelected = statusFilter === s.key || (s.key === "ALL" && !statusFilter);
//           return (
//             <button
//               type="button"
//               key={s.key}
//               onClick={() => {
//                 setStatusFilter(s.key === "ALL" ? "" : s.key);
//                 setPage(1);
//               }}
//               className={`flex min-h-[88px] min-w-0 w-full flex-col justify-center rounded-2xl border p-4 text-left transition-all cursor-pointer hover:scale-[1.02] ${s.bg} ${
//                 isSelected ? "ring-2 ring-amber-400 shadow-md border-amber-400/60" : ""
//               }`}
//             >
//               <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate block">
//                 {s.label}
//               </span>
//               <span className={`mt-2 text-2xl sm:text-3xl font-black leading-none block ${s.color}`}>
//                 {s.val}
//               </span>
//             </button>
//           );
//         })}
//       </div>

//       {/* ── Filters Bar ── */}
//       <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm space-y-3">
//         <div className="flex flex-col md:flex-row items-center gap-3">
//           {/* Search box */}
//           <div className="relative w-full md:flex-1">
//             <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setPage(1);
//               }}
//               placeholder="Search by Suggestion ID (SUG-...), subject, or member name..."
//               className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
//             />
//           </div>

//           {/* Status selector */}
//           <select
//             value={statusFilter}
//             onChange={(e) => {
//               setStatusFilter(e.target.value);
//               setPage(1);
//             }}
//             className="w-full md:w-44 py-2 px-3 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
//           >
//             <option value="">All Statuses (सभी स्थितियां)</option>
//             {Object.keys(STATUS_CONFIG).map((k) => (
//               <option key={k} value={k}>
//                 {STATUS_CONFIG[k].label}
//               </option>
//             ))}
//           </select>

//           {/* Category selector */}
//           <select
//             value={categoryFilter}
//             onChange={(e) => {
//               setCategoryFilter(e.target.value);
//               setPage(1);
//             }}
//             className="w-full md:w-44 py-2 px-3 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
//           >
//             <option value="">All Categories (सभी श्रेणियां)</option>
//             {CATEGORIES.map((c) => (
//               <option key={c} value={c}>
//                 {c}
//               </option>
//             ))}
//           </select>

//           {/* Priority selector */}
//           <select
//             value={priorityFilter}
//             onChange={(e) => {
//               setPriorityFilter(e.target.value);
//               setPage(1);
//             }}
//             className="w-full md:w-36 py-2 px-3 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
//           >
//             <option value="">All Priorities</option>
//             {Object.keys(PRIORITY_CONFIG).map((p) => (
//               <option key={p} value={p}>
//                 {PRIORITY_CONFIG[p].label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Secondary quick toggles */}
//         <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]/60 text-xs">
//           <div className="flex items-center gap-4">
//             <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--text-secondary)]">
//               <input
//                 type="checkbox"
//                 checked={unreadOnly}
//                 onChange={(e) => {
//                   setUnreadOnly(e.target.checked);
//                   setPage(1);
//                 }}
//                 className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-0 focus:ring-offset-0 bg-[var(--bg)] border-gray-600 cursor-pointer"
//               />
//               <span className="flex items-center gap-1.5">
//                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
//                 Unread Member Replies Only
//               </span>
//             </label>
//           </div>

//           {(search || statusFilter || categoryFilter || priorityFilter || unreadOnly) && (
//             <button
//               onClick={() => {
//                 setSearch("");
//                 setStatusFilter("");
//                 setCategoryFilter("");
//                 setPriorityFilter("");
//                 setUnreadOnly(false);
//                 setPage(1);
//               }}
//               className="text-amber-400 hover:text-amber-300 text-xs underline font-medium cursor-pointer"
//             >
//               Clear All Filters
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ── Suggestions Table / List ── */}
//       <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="py-24 flex flex-col items-center justify-center gap-3">
//             <FaSyncAlt className="animate-spin text-amber-400 text-2xl" />
//             <p className="text-xs text-[var(--text-muted)]">Loading suggestions...</p>
//           </div>
//         ) : suggestions.length === 0 ? (
//           <div className="py-24 flex flex-col items-center justify-center text-center px-4">
//             <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
//               <FiInbox size={26} />
//             </div>
//             <h3 className="font-bold text-sm text-[var(--text-primary)]">No Suggestions Found</h3>
//             <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1">
//               There are no suggestions matching the current filter criteria.
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-xs">
//               <thead className="bg-[var(--bg)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
//                 <tr>
//                   <th className="py-3.5 px-4">ID & Subject</th>
//                   <th className="py-3.5 px-4">Category</th>
//                   <th className="py-3.5 px-4">Submitted By</th>
//                   <th className="py-3.5 px-4">Priority</th>
//                   <th className="py-3.5 px-4">Status</th>
//                   <th className="py-3.5 px-4">Date</th>
//                   <th className="py-3.5 px-4 text-right">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-[var(--border-subtle)]/60">
//                 {suggestions.map((s) => {
//                   const statusCfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.SUBMITTED;
//                   const priorityCfg = PRIORITY_CONFIG[s.priority] || PRIORITY_CONFIG.MEDIUM;
//                   const StatusIcon = statusCfg.icon;

//                   return (
//                     <tr
//                       key={s._id}
//                       className="hover:bg-[var(--bg)]/40 transition-colors group cursor-pointer"
//                       onClick={() => openDetail(s._id)}
//                     >
//                       {/* ID & Subject */}
//                       <td className="py-3.5 px-4 max-w-xs">
//                         <div className="flex items-center gap-2">
//                           <span className="font-mono font-bold text-amber-400 tracking-tight text-[11px]">
//                             {s.suggestionId}
//                           </span>
//                           {s.hasUnreadMemberResponse && (
//                             <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
//                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//                               New Reply
//                             </span>
//                           )}
//                         </div>
//                         <p className="font-semibold text-[var(--text-primary)] truncate mt-0.5 group-hover:text-amber-300 transition-colors">
//                           {s.subject}
//                         </p>
//                       </td>

//                       {/* Category */}
//                       <td className="py-3.5 px-4">
//                         <span className="inline-block text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--bg)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-lg">
//                           {s.category}
//                         </span>
//                       </td>

//                       {/* Submitted By */}
//                       <td className="py-3.5 px-4">
//                         <div className="flex items-center gap-2">
//                           {s.memberPhoto ? (
//                             <img
//                               src={s.memberPhoto}
//                               alt=""
//                               className="w-6 h-6 rounded-full object-cover border border-amber-500/30"
//                             />
//                           ) : (
//                             <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-300">
//                               {s.memberName ? s.memberName[0].toUpperCase() : "M"}
//                             </div>
//                           )}
//                           <div>
//                             <p className="font-medium text-[var(--text-primary)] leading-tight">{s.memberName}</p>
//                             {s.memberId && <p className="text-[10px] text-[var(--text-muted)] font-mono">{s.memberId}</p>}
//                           </div>
//                         </div>
//                       </td>

//                       {/* Priority */}
//                       <td className="py-3.5 px-4">
//                         <span
//                           className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityCfg.bg} ${priorityCfg.color}`}
//                         >
//                           {priorityCfg.label}
//                         </span>
//                       </td>

//                       {/* Status */}
//                       <td className="py-3.5 px-4">
//                         <span
//                           className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusCfg.badge}`}
//                         >
//                           <StatusIcon size={10} />
//                           {statusCfg.label}
//                         </span>
//                       </td>

//                       {/* Date */}
//                       <td className="py-3.5 px-4 text-[var(--text-muted)] text-[11px] whitespace-nowrap">
//                         {new Date(s.createdAt).toLocaleDateString("en-IN", {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric",
//                         })}
//                       </td>

//                       {/* Action */}
//                       <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
//                         <button
//                           onClick={() => openDetail(s._id)}
//                           className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
//                         >
//                           <FaEye size={11} />
//                           <span>Review</span>
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* ── Pagination ── */}
//         {!loading && suggestions.length > 0 && (
//           <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
//             <span>
//               Showing {suggestions.length} of {total} suggestions
//             </span>
//             <div className="flex items-center gap-2">
//               <button
//                 disabled={page <= 1}
//                 onClick={() => setPage((p) => Math.max(p - 1, 1))}
//                 className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
//               >
//                 <FaChevronLeft size={10} />
//               </button>
//               <span className="font-semibold text-[var(--text-primary)]">
//                 {page} / {pages}
//               </span>
//               <button
//                 disabled={page >= pages}
//                 onClick={() => setPage((p) => Math.min(p + 1, pages))}
//                 className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
//               >
//                 <FaChevronRight size={10} />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Suggestion Detail Modal ── */}
//       {selectedSuggestion && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
//           <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[var(--surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden">
//             {/* Modal Header */}
//             <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4 bg-[var(--bg)]/50">
//               <div className="flex items-center gap-3">
//                 <span className="font-mono font-extrabold text-base text-amber-400">
//                   {selectedSuggestion.suggestionId}
//                 </span>
//                 <span
//                   className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
//                     (STATUS_CONFIG[selectedSuggestion.status] || STATUS_CONFIG.SUBMITTED).badge
//                   }`}
//                 >
//                   {(STATUS_CONFIG[selectedSuggestion.status] || STATUS_CONFIG.SUBMITTED).label}
//                 </span>
//                 <span
//                   className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
//                     (PRIORITY_CONFIG[selectedSuggestion.priority] || PRIORITY_CONFIG.MEDIUM).bg
//                   } ${(PRIORITY_CONFIG[selectedSuggestion.priority] || PRIORITY_CONFIG.MEDIUM).color}`}
//                 >
//                   {selectedSuggestion.priority}
//                 </span>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setDeleteModalOpen(true)}
//                   className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
//                   title="Delete suggestion"
//                 >
//                   <FaTrashAlt size={13} />
//                 </button>
//                 <button
//                   onClick={closeDetail}
//                   className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
//                 >
//                   <FaTimes size={15} />
//                 </button>
//               </div>
//             </div>

//             {/* Modal Body (Scrollable) */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {/* Member & Meta Bar */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border-subtle)]">
//                 <div>
//                   <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Submitted By</p>
//                   <p className="font-semibold text-xs text-[var(--text-primary)] mt-0.5">
//                     {selectedSuggestion.memberName || "Unknown"}
//                   </p>
//                   {selectedSuggestion.memberId && (
//                     <p className="text-[10px] font-mono text-amber-400">{selectedSuggestion.memberId}</p>
//                   )}
//                 </div>

//                 <div>
//                   <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Category</p>
//                   <p className="font-semibold text-xs text-[var(--text-primary)] mt-0.5">
//                     {selectedSuggestion.category}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Submitted Date</p>
//                   <p className="font-semibold text-xs text-[var(--text-primary)] mt-0.5">
//                     {new Date(selectedSuggestion.createdAt).toLocaleString("en-IN", {
//                       day: "numeric",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </p>
//                 </div>
//               </div>

//               {/* Subject & Description */}
//               <div className="space-y-2">
//                 <h2 className="text-base font-bold text-[var(--text-primary)] leading-snug">
//                   {selectedSuggestion.subject}
//                 </h2>
//                 <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
//                   {selectedSuggestion.description}
//                 </div>
//               </div>

//               {/* Resolution or Rejection Notice if applicable */}
//               {selectedSuggestion.status === "RESOLVED" && selectedSuggestion.resolutionNote && (
//                 <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
//                   <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
//                     <FaCheckCircle size={13} />
//                     Resolution Note (समाधान विवरण)
//                   </p>
//                   <p className="text-xs text-emerald-200/90 whitespace-pre-wrap">
//                     {selectedSuggestion.resolutionNote}
//                   </p>
//                 </div>
//               )}

//               {selectedSuggestion.status === "REJECTED" && selectedSuggestion.rejectionReason && (
//                 <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25">
//                   <p className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-1">
//                     <FaTimesCircle size={13} />
//                     Rejection Reason (अस्वीकृति का कारण)
//                   </p>
//                   <p className="text-xs text-red-200/90 whitespace-pre-wrap">
//                     {selectedSuggestion.rejectionReason}
//                   </p>
//                 </div>
//               )}

//               {/* Admin Controls Box: Status & Priority management */}
//               <div className="p-4 rounded-2xl bg-[var(--bg)] border border-amber-500/20 space-y-4">
//                 <p className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
//                   <FaShieldAlt size={12} />
//                   Administrative Controls
//                 </p>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* Status update form */}
//                   <form onSubmit={handleStatusChange} className="space-y-2">
//                     <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Update Status</label>
//                     <div className="flex gap-2">
//                       <select
//                         value={statusUpdate}
//                         onChange={(e) => setStatusUpdate(e.target.value)}
//                         className="flex-1 py-1.5 px-3 text-xs rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-amber-400 cursor-pointer"
//                       >
//                         {Object.keys(STATUS_CONFIG).map((k) => (
//                           <option key={k} value={k}>
//                             {STATUS_CONFIG[k].label}
//                           </option>
//                         ))}
//                       </select>
//                       <button
//                         type="submit"
//                         disabled={statusSubmitting || statusUpdate === selectedSuggestion.status}
//                         className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
//                       >
//                         {statusSubmitting ? "Saving..." : "Save"}
//                       </button>
//                     </div>

//                     {(statusUpdate === "RESOLVED" || statusUpdate === "REJECTED") && (
//                       <div className="pt-2">
//                         <textarea
//                           value={statusReason}
//                           onChange={(e) => setStatusReason(e.target.value)}
//                           placeholder={
//                             statusUpdate === "RESOLVED"
//                               ? "Optional resolution note for member..."
//                               : "Reason for rejection (required for member visibility)..."
//                           }
//                           rows={2}
//                           className="w-full p-2.5 text-xs rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:border-amber-400"
//                         />
//                       </div>
//                     )}
//                   </form>

//                   {/* Priority update form */}
//                   <div className="space-y-2">
//                     <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Update Priority</label>
//                     <div className="flex gap-2">
//                       <select
//                         value={priorityUpdate}
//                         onChange={(e) => setPriorityUpdate(e.target.value)}
//                         className="flex-1 py-1.5 px-3 text-xs rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-amber-400 cursor-pointer"
//                       >
//                         {Object.keys(PRIORITY_CONFIG).map((p) => (
//                           <option key={p} value={p}>
//                             {PRIORITY_CONFIG[p].label}
//                           </option>
//                         ))}
//                       </select>
//                       <button
//                         type="button"
//                         onClick={handlePriorityChange}
//                         disabled={prioritySubmitting || priorityUpdate === selectedSuggestion.priority}
//                         className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
//                       >
//                         {prioritySubmitting ? "Updating..." : "Update"}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Tabs: Conversation vs Activity History */}
//               <div className="space-y-4">
//                 <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-bold">
//                   <button
//                     onClick={() => setDetailTab("conversation")}
//                     className={`flex items-center gap-1.5 pb-2 -mb-2 border-b-2 transition-all cursor-pointer ${
//                       detailTab === "conversation"
//                         ? "border-amber-400 text-amber-400"
//                         : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
//                     }`}
//                   >
//                     <FaComments size={13} />
//                     <span>Conversation & Replies ({selectedSuggestion.messages?.length || 0})</span>
//                   </button>

//                   <button
//                     onClick={() => setDetailTab("history")}
//                     className={`flex items-center gap-1.5 pb-2 -mb-2 border-b-2 transition-all cursor-pointer ml-4 ${
//                       detailTab === "history"
//                         ? "border-amber-400 text-amber-400"
//                         : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
//                     }`}
//                   >
//                     <FaHistory size={12} />
//                     <span>Audit / Activity History ({selectedSuggestion.activityHistory?.length || 0})</span>
//                   </button>
//                 </div>

//                 {/* Tab: Conversation */}
//                 {detailTab === "conversation" && (
//                   <div className="space-y-4">
//                     {/* Message list */}
//                     <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
//                       {(!selectedSuggestion.messages || selectedSuggestion.messages.length === 0) ? (
//                         <div className="text-center py-8 text-xs text-[var(--text-muted)]">
//                           No replies or follow-up messages yet.
//                         </div>
//                       ) : (
//                         selectedSuggestion.messages.map((m, idx) => {
//                           const isAdmin = m.senderType === "ADMIN";
//                           return (
//                             <div
//                               key={idx}
//                               className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
//                             >
//                               <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] mb-1 px-1">
//                                 <span className="font-bold text-[var(--text-secondary)]">
//                                   {m.senderName || (isAdmin ? "Admin" : "Member")}
//                                 </span>
//                                 {m.senderRole && (
//                                   <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-medium">
//                                     {m.senderRole}
//                                   </span>
//                                 )}
//                                 <span>•</span>
//                                 <span>
//                                   {new Date(m.createdAt).toLocaleTimeString("en-IN", {
//                                     hour: "2-digit",
//                                     minute: "2-digit",
//                                   })}
//                                 </span>
//                               </div>

//                               <div
//                                 className={`max-w-[85%] p-3.5 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed shadow-sm ${
//                                   isAdmin
//                                     ? "bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-tr-sm"
//                                     : "bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm"
//                                 }`}
//                               >
//                                 {m.message}
//                               </div>
//                             </div>
//                           );
//                         })
//                       )}
//                     </div>

//                     {/* Admin Reply Form */}
//                     {!["CLOSED", "REJECTED"].includes(selectedSuggestion.status) ? (
//                       <form onSubmit={handleReplySubmit} className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
//                         <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
//                           <FiMessageSquare size={13} />
//                           Send Official Admin Response to Member
//                         </label>
//                         <div className="flex gap-2">
//                           <textarea
//                             value={replyMessage}
//                             onChange={(e) => setReplyMessage(e.target.value)}
//                             placeholder="Type your official administrative response here. Member will receive an in-app notification..."
//                             rows={3}
//                             className="flex-1 p-3 text-xs rounded-2xl bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:border-amber-400"
//                           />
//                         </div>
//                         <div className="flex justify-end">
//                           <button
//                             type="submit"
//                             disabled={replySubmitting || !replyMessage.trim()}
//                             className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
//                           >
//                             <FaPaperPlane size={11} />
//                             <span>{replySubmitting ? "Sending..." : "Send Response"}</span>
//                           </button>
//                         </div>
//                       </form>
//                     ) : (
//                       <p className="text-xs text-[var(--text-muted)] italic text-center py-2">
//                         This suggestion is currently {selectedSuggestion.status.toLowerCase()}. Reopen or update status to send more responses.
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 {/* Tab: Activity History */}
//                 {detailTab === "history" && (
//                   <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
//                     {selectedSuggestion.activityHistory?.map((act, idx) => (
//                       <div
//                         key={idx}
//                         className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border-subtle)] text-xs"
//                       >
//                         <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
//                         <div className="flex-1">
//                           <div className="flex items-center justify-between gap-2">
//                             <span className="font-bold text-amber-300 text-[11px]">{act.action}</span>
//                             <span className="text-[10px] text-[var(--text-muted)]">
//                               {new Date(act.timestamp).toLocaleString("en-IN", {
//                                 day: "numeric",
//                                 month: "short",
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                               })}
//                             </span>
//                           </div>
//                           <p className="text-[var(--text-secondary)] mt-0.5 text-[11px]">{act.details}</p>
//                           {act.actorName && (
//                             <p className="text-[10px] text-[var(--text-muted)] mt-0.5">By: {act.actorName}</p>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="px-6 py-3 border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg)]/50 text-xs text-[var(--text-muted)]">
//               <span>Samaj Suggestion System • Official Record</span>
//               <button
//                 onClick={closeDetail}
//                 className="px-4 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-amber-400 font-semibold cursor-pointer"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Soft Delete Confirmation Modal ── */}
//       {deleteModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
//           <div className="w-full max-w-md bg-[var(--surface)] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
//                 <FaExclamationTriangle size={18} />
//               </div>
//               <div>
//                 <h3 className="font-bold text-sm text-[var(--text-primary)]">Delete Suggestion?</h3>
//                 <p className="text-[11px] text-[var(--text-muted)]">
//                   Suggestion {selectedSuggestion?.suggestionId} will be archived/soft-deleted.
//                 </p>
//               </div>
//             </div>

//             <div>
//               <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
//                 Deletion Reason (Required for Audit Log)
//               </label>
//               <textarea
//                 value={deleteReason}
//                 onChange={(e) => setDeleteReason(e.target.value)}
//                 placeholder="Spam, duplicate, inappropriate content, or administrative cleanup..."
//                 rows={3}
//                 className="w-full mt-1.5 p-2.5 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-red-400"
//               />
//             </div>

//             <div className="flex items-center justify-end gap-3 pt-2">
//               <button
//                 type="button"
//                 onClick={() => setDeleteModalOpen(false)}
//                 className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg)] border border-[var(--border-subtle)] hover:bg-white/5 cursor-pointer"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={handleDeleteSuggestion}
//                 disabled={deleteSubmitting}
//                 className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 cursor-pointer shadow-md"
//               >
//                 {deleteSubmitting ? "Deleting..." : "Confirm Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }









import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FaLightbulb,
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaEye,
  FaPaperPlane,
  FaTrashAlt,
  FaUserCheck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaComments,
  FaShieldAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCircle,
} from "react-icons/fa";
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiUser,
  FiMessageSquare,
  FiSend,
  FiInbox,
  FiTag,
  FiFlag,
  FiFileText,
} from "react-icons/fi";
import { apiConnector } from "../../../../services/apiConnector";
import { suggestionEndpoints } from "../../../../services/apis";

const {
  ADMIN_LIST_SUGGESTIONS_API,
  GET_SUGGESTION_API,
  ADMIN_UPDATE_STATUS_API,
  ADMIN_SET_PRIORITY_API,
  ADMIN_REPLY_API,
  ADMIN_DELETE_SUGGESTION_API,
} = suggestionEndpoints;

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Submitted",
    labelHi: "नया / प्रस्तुत",
    color: "text-blue-400",
    bg: "border-blue-500/30 bg-blue-500/10",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: FiClock,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    labelHi: "समीक्षाधीन",
    color: "text-amber-400",
    bg: "border-amber-500/30 bg-amber-500/10",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: FiClock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    labelHi: "प्रगति पर",
    color: "text-purple-400",
    bg: "border-purple-500/30 bg-purple-500/10",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    icon: FiClock,
  },
  RESPONDED: {
    label: "Responded",
    labelHi: "उत्तर दिया गया",
    color: "text-cyan-400",
    bg: "border-cyan-500/30 bg-cyan-500/10",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    icon: FiCheckCircle,
  },
  RESOLVED: {
    label: "Resolved",
    labelHi: "समाधान हुआ",
    color: "text-emerald-400",
    bg: "border-emerald-500/30 bg-emerald-500/10",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: FiCheckCircle,
  },
  CLOSED: {
    label: "Closed",
    labelHi: "समाप्त",
    color: "text-gray-400",
    bg: "border-gray-500/30 bg-gray-500/10",
    badge: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    icon: FiXCircle,
  },
  REJECTED: {
    label: "Rejected",
    labelHi: "अस्वीकृत",
    color: "text-red-400",
    bg: "border-red-500/30 bg-red-500/10",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    icon: FiXCircle,
  },
};


const STATUS_KEYS = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "IN_PROGRESS",
  "RESPONDED",
  "RESOLVED",
];

function normalizeStatusKey(value) {
  return String(value || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
}

/**
 * The API may return status statistics under different metadata keys
 * (stats / statusCounts / statistics / counts) or with lowercase keys.
 * This helper normalizes all of those formats.
 *
 * If the API sends an empty/zero stats object while the list itself contains
 * records, we safely fall back to counting the records returned by the API.
 */
function getStatusStats(metadata, rows = []) {
  const raw =
    metadata?.stats ??
    metadata?.statusCounts ??
    metadata?.statistics ??
    metadata?.counts ??
    {};

  const normalized = {
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    IN_PROGRESS: 0,
    RESPONDED: 0,
    RESOLVED: 0,
  };

  let foundNumericStat = false;

  const readCount = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (value && typeof value === "object") {
      const candidates = [
        value.count,
        value.total,
        value.value,
        value._count,
      ];

      const numeric = candidates.find(
        (item) => typeof item === "number" && Number.isFinite(item)
      );

      if (numeric !== undefined) return numeric;
    }

    return null;
  };

  // Supports:
  // { RESPONDED: 2 }
  // { responded: 2 }
  // { RESPONDED: { count: 2 } }
  if (raw && !Array.isArray(raw) && typeof raw === "object") {
    Object.entries(raw).forEach(([key, value]) => {
      const status = normalizeStatusKey(key);

      if (!STATUS_KEYS.includes(status)) return;

      const count = readCount(value);

      if (count !== null) {
        normalized[status] = count;
        foundNumericStat = true;
      }
    });
  }

  // Also supports:
  // [{ status: "RESPONDED", count: 2 }]
  if (Array.isArray(raw)) {
    raw.forEach((item) => {
      const status = normalizeStatusKey(item?.status || item?.key);
      const count = readCount(item?.count ?? item?.total ?? item?.value);

      if (STATUS_KEYS.includes(status) && count !== null) {
        normalized[status] = count;
        foundNumericStat = true;
      }
    });
  }

  // If backend stats are missing/wrong/empty, count the actual rows.
  const listStats = {
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    IN_PROGRESS: 0,
    RESPONDED: 0,
    RESOLVED: 0,
  };

  rows.forEach((row) => {
    const status = normalizeStatusKey(row?.status);

    if (Object.prototype.hasOwnProperty.call(listStats, status)) {
      listStats[status] += 1;
    }
  });

  const apiStatsAreEmpty =
    !foundNumericStat ||
    Object.values(normalized).every((count) => Number(count) === 0);

  if (apiStatsAreEmpty && rows.length > 0) {
    return listStats;
  }

  return normalized;
}


const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "text-gray-300", bg: "bg-gray-700/40 border-gray-600/40" },
  MEDIUM: { label: "Medium", color: "text-blue-300", bg: "bg-blue-900/40 border-blue-700/40" },
  HIGH: { label: "High", color: "text-amber-300", bg: "bg-amber-900/40 border-amber-700/40" },
  URGENT: { label: "Urgent", color: "text-red-300", bg: "bg-red-900/40 border-red-700/40" },
};

const CATEGORIES = [
  "General Suggestion",
  "Community Improvement",
  "Member Services",
  "Family / Family Hub",
  "Dharamshala",
  "Monthly Contribution",
  "Donation / Finance",
  "Jobs",
  "Scholarships",
  "Matrimonial",
  "Events",
  "Website / Technical Issue",
  "Content / Notices",
  "Other",
];

function getAuthToken() {
  try {
    const raw = localStorage.getItem("token");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "string") return parsed;
    }
  } catch (e) {
    // ignore
  }
  const raw = localStorage.getItem("token");
  if (raw && typeof raw === "string") {
    let clean = raw.trim();
    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
      clean = clean.slice(1, -1);
    }
    return clean;
  }
  const cookieToken = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="))
    ?.split("=")?.[1];
  return cookieToken || "";
}

function authHeaders(explicitToken) {
  const token = explicitToken || getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function SuggestionsAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const directId = searchParams.get("id");

  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState({});
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Active detail modal
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Action states inside modal
  const [statusUpdate, setStatusUpdate] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [priorityUpdate, setPriorityUpdate] = useState("");
  const [prioritySubmitting, setPrioritySubmitting] = useState(false);

  const [replyMessage, setReplyMessage] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Active tab in detail modal
  const [detailTab, setDetailTab] = useState("conversation"); // "conversation" | "history"

  // Fetch list
  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
      };

      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (unreadOnly) params.unreadOnly = "true";

      const res = await apiConnector("GET", ADMIN_LIST_SUGGESTIONS_API, null, {
        headers: authHeaders(),
        withCredentials: true,
        params,
      });

      if (res?.data?.success) {
        const rows = Array.isArray(res.data.data) ? res.data.data : [];
        const metadata = res.data.metadata || {};

        // Normalize the status statistics so the top cards always match
        // the status values used by the table.
        const normalizedStats = getStatusStats(metadata, rows);

        setSuggestions(rows);
        setStats(normalizedStats);

        // Never show "Showing 2 of 0" when the API returns rows.
        const apiTotal = Number(metadata.total);
        const safeTotal =
          Number.isFinite(apiTotal) && apiTotal > 0
            ? apiTotal
            : rows.length;

        setTotal(safeTotal);

        const apiPages = Number(metadata.pages);
        const safePages =
          Number.isFinite(apiPages) && apiPages > 0
            ? apiPages
            : Math.max(1, Math.ceil(safeTotal / params.limit));

        setPages(safePages);
      } else {
        setSuggestions([]);
        setStats({});
        setTotal(0);
        setPages(1);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load suggestions."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, categoryFilter, priorityFilter, unreadOnly]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Open detail by id
  const openDetail = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const res = await apiConnector("GET", GET_SUGGESTION_API(id), null, {
        headers: authHeaders(),
        withCredentials: true,
      });
      if (res?.data?.success) {
        setSelectedSuggestion(res.data.data);
        setStatusUpdate(res.data.data.status);
        setPriorityUpdate(res.data.data.priority);
        setStatusReason("");
        setReplyMessage("");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load suggestion details.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Handle direct url param ?id=...
  useEffect(() => {
    if (directId) {
      openDetail(directId);
    }
  }, [directId, openDetail]);

  const closeDetail = () => {
    setSelectedSuggestion(null);
    if (searchParams.get("id")) {
      searchParams.delete("id");
      setSearchParams(searchParams);
    }
  };

  // Status Change Submit
  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!statusUpdate) return;
    if (statusUpdate === "REJECTED" && !statusReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    setStatusSubmitting(true);
    try {
      const res = await apiConnector(
        "PATCH",
        ADMIN_UPDATE_STATUS_API(selectedSuggestion._id),
        { status: statusUpdate, reason: statusReason.trim() },
        { headers: authHeaders(), withCredentials: true }
      );
      if (res?.data?.success) {
        toast.success(`Status updated to ${statusUpdate}`);
        setSelectedSuggestion(res.data.data);
        setStatusReason("");
        fetchSuggestions();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status.");
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Priority Change Submit
  const handlePriorityChange = async () => {
    if (!priorityUpdate || priorityUpdate === selectedSuggestion?.priority) return;
    setPrioritySubmitting(true);
    try {
      const res = await apiConnector(
        "PATCH",
        ADMIN_SET_PRIORITY_API(selectedSuggestion._id),
        { priority: priorityUpdate },
        { headers: authHeaders(), withCredentials: true }
      );
      if (res?.data?.success) {
        toast.success(`Priority set to ${priorityUpdate}`);
        setSelectedSuggestion(res.data.data);
        fetchSuggestions();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update priority.");
    } finally {
      setPrioritySubmitting(false);
    }
  };

  // Admin Reply Submit
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error("Reply message cannot be empty.");
      return;
    }
    setReplySubmitting(true);
    try {
      const res = await apiConnector(
        "POST",
        ADMIN_REPLY_API(selectedSuggestion._id),
        { message: replyMessage.trim() },
        { headers: authHeaders(), withCredentials: true }
      );
      if (res?.data?.success) {
        toast.success("Response sent to member successfully!");
        setSelectedSuggestion(res.data.data);
        setReplyMessage("");
        fetchSuggestions();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send response.");
    } finally {
      setReplySubmitting(false);
    }
  };

  // Delete Suggestion
  const handleDeleteSuggestion = async () => {
    setDeleteSubmitting(true);
    try {
      const res = await apiConnector(
        "DELETE",
        ADMIN_DELETE_SUGGESTION_API(selectedSuggestion._id),
        { reason: deleteReason.trim() },
        { headers: authHeaders(), withCredentials: true }
      );
      if (res?.data?.success) {
        toast.success("Suggestion deleted.");
        setDeleteModalOpen(false);
        closeDetail();
        fetchSuggestions();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete suggestion.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-16 px-4 md:px-8 pt-6 max-w-7xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-inner">
              <FaLightbulb size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                Member Suggestions Admin
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                सुझाव एवं प्रतिक्रिया प्रबंधन — Review, respond, and resolve community feedback
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSuggestions()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-amber-500/50 hover:text-amber-400 transition-all cursor-pointer text-[var(--text-secondary)] shadow-sm"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} size={12} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Stats Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {[
          { key: "ALL", label: "Total", val: total, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          { key: "SUBMITTED", label: "New Submitted", val: stats.SUBMITTED || 0, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { key: "UNDER_REVIEW", label: "Under Review", val: stats.UNDER_REVIEW || 0, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          { key: "IN_PROGRESS", label: "In Progress", val: stats.IN_PROGRESS || 0, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          { key: "RESPONDED", label: "Responded", val: stats.RESPONDED || 0, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
          { key: "RESOLVED", label: "Resolved", val: stats.RESOLVED || 0, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
        ].map((s) => {
          const isSelected = statusFilter === s.key || (s.key === "ALL" && !statusFilter);
          return (
            <button
              type="button"
              key={s.key}
              onClick={() => {
                setStatusFilter(s.key === "ALL" ? "" : s.key);
                setPage(1);
              }}
              className={`flex min-h-[88px] min-w-0 w-full flex-col justify-center rounded-2xl border p-4 text-left transition-all cursor-pointer hover:scale-[1.02] ${s.bg} ${
                isSelected ? "ring-2 ring-amber-400 shadow-md border-amber-400/60" : ""
              }`}
            >
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate block">
                {s.label}
              </span>
              <span className={`mt-2 text-2xl sm:text-3xl font-black leading-none block ${s.color}`}>
                {s.val}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative w-full md:flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Suggestion ID (SUG-...), subject, or member name..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-44 py-2 px-3 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
          >
            <option value="">All Statuses (सभी स्थितियां)</option>
            {Object.keys(STATUS_CONFIG).map((k) => (
              <option key={k} value={k}>
                {STATUS_CONFIG[k].label}
              </option>
            ))}
          </select>

          {/* Category selector */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-44 py-2 px-3 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
          >
            <option value="">All Categories (सभी श्रेणियां)</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Priority selector */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-36 py-2 px-3 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
          >
            <option value="">All Priorities</option>
            {Object.keys(PRIORITY_CONFIG).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_CONFIG[p].label}
              </option>
            ))}
          </select>
        </div>

        {/* Secondary quick toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]/60 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => {
                  setUnreadOnly(e.target.checked);
                  setPage(1);
                }}
                className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-0 focus:ring-offset-0 bg-[var(--bg)] border-gray-600 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Unread Member Replies Only
              </span>
            </label>
          </div>

          {(search || statusFilter || categoryFilter || priorityFilter || unreadOnly) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setCategoryFilter("");
                setPriorityFilter("");
                setUnreadOnly(false);
                setPage(1);
              }}
              className="text-amber-400 hover:text-amber-300 text-xs underline font-medium cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Suggestions Table / List ── */}
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <FaSyncAlt className="animate-spin text-amber-400 text-2xl" />
            <p className="text-xs text-[var(--text-muted)]">Loading suggestions...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <FiInbox size={26} />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">No Suggestions Found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1">
              There are no suggestions matching the current filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">ID & Subject</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Submitted By</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]/60">
                {suggestions.map((s) => {
                  const statusCfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.SUBMITTED;
                  const priorityCfg = PRIORITY_CONFIG[s.priority] || PRIORITY_CONFIG.MEDIUM;
                  const StatusIcon = statusCfg.icon;

                  return (
                    <tr
                      key={s._id}
                      className="hover:bg-[var(--bg)]/40 transition-colors group cursor-pointer"
                      onClick={() => openDetail(s._id)}
                    >
                      {/* ID & Subject */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 tracking-tight text-[11px]">
                            {s.suggestionId}
                          </span>
                          {s.hasUnreadMemberResponse && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              New Reply
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-[var(--text-primary)] truncate mt-0.5 group-hover:text-amber-300 transition-colors">
                          {s.subject}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--bg)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-lg">
                          {s.category}
                        </span>
                      </td>

                      {/* Submitted By */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {s.memberPhoto ? (
                            <img
                              src={s.memberPhoto}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover border border-amber-500/30"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-300">
                              {s.memberName ? s.memberName[0].toUpperCase() : "M"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-[var(--text-primary)] leading-tight">{s.memberName}</p>
                            {s.memberId && <p className="text-[10px] text-[var(--text-muted)] font-mono">{s.memberId}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityCfg.bg} ${priorityCfg.color}`}
                        >
                          {priorityCfg.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusCfg.badge}`}
                        >
                          <StatusIcon size={10} />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[var(--text-muted)] text-[11px] whitespace-nowrap">
                        {new Date(s.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openDetail(s._id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <FaEye size={11} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && suggestions.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <span>
              Showing {suggestions.length} of {total} suggestions
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <FaChevronLeft size={10} />
              </button>
              <span className="font-semibold text-[var(--text-primary)]">
                {page} / {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(p + 1, pages))}
                className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Suggestion Detail Modal ── */}
      {selectedSuggestion && (
        <div className="fixed inset-0 z-2000 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[var(--surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4 bg-[var(--bg)]/50">
              <div className="flex items-center gap-3">
                <span className="font-mono font-extrabold text-base text-amber-400">
                  {selectedSuggestion.suggestionId}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    (STATUS_CONFIG[selectedSuggestion.status] || STATUS_CONFIG.SUBMITTED).badge
                  }`}
                >
                  {(STATUS_CONFIG[selectedSuggestion.status] || STATUS_CONFIG.SUBMITTED).label}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    (PRIORITY_CONFIG[selectedSuggestion.priority] || PRIORITY_CONFIG.MEDIUM).bg
                  } ${(PRIORITY_CONFIG[selectedSuggestion.priority] || PRIORITY_CONFIG.MEDIUM).color}`}
                >
                  {selectedSuggestion.priority}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Delete suggestion"
                >
                  <FaTrashAlt size={13} />
                </button>
                <button
                  onClick={closeDetail}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <FaTimes size={15} />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Member & Meta Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border-subtle)]">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Submitted By</p>
                  <p className="font-semibold text-xs text-[var(--text-primary)] mt-0.5">
                    {selectedSuggestion.memberName || "Unknown"}
                  </p>
                  {selectedSuggestion.memberId && (
                    <p className="text-[10px] font-mono text-amber-400">{selectedSuggestion.memberId}</p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Category</p>
                  <p className="font-semibold text-xs text-[var(--text-primary)] mt-0.5">
                    {selectedSuggestion.category}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Submitted Date</p>
                  <p className="font-semibold text-xs text-[var(--text-primary)] mt-0.5">
                    {new Date(selectedSuggestion.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Subject & Description */}
              <div className="space-y-2">
                <h2 className="text-base font-bold text-[var(--text-primary)] leading-snug">
                  {selectedSuggestion.subject}
                </h2>
                <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                  {selectedSuggestion.description}
                </div>
              </div>

              {/* Resolution or Rejection Notice if applicable */}
              {selectedSuggestion.status === "RESOLVED" && selectedSuggestion.resolutionNote && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <FaCheckCircle size={13} />
                    Resolution Note (समाधान विवरण)
                  </p>
                  <p className="text-xs text-emerald-200/90 whitespace-pre-wrap">
                    {selectedSuggestion.resolutionNote}
                  </p>
                </div>
              )}

              {selectedSuggestion.status === "REJECTED" && selectedSuggestion.rejectionReason && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25">
                  <p className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-1">
                    <FaTimesCircle size={13} />
                    Rejection Reason (अस्वीकृति का कारण)
                  </p>
                  <p className="text-xs text-red-200/90 whitespace-pre-wrap">
                    {selectedSuggestion.rejectionReason}
                  </p>
                </div>
              )}

              {/* Admin Controls Box: Status & Priority management */}
              <div className="p-4 rounded-2xl bg-[var(--bg)] border border-amber-500/20 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <FaShieldAlt size={12} />
                  Administrative Controls
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status update form */}
                  <form onSubmit={handleStatusChange} className="space-y-2">
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Update Status</label>
                    <div className="flex gap-2">
                      <select
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value)}
                        className="flex-1 py-1.5 px-3 text-xs rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {Object.keys(STATUS_CONFIG).map((k) => (
                          <option key={k} value={k}>
                            {STATUS_CONFIG[k].label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={statusSubmitting || statusUpdate === selectedSuggestion.status}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                      >
                        {statusSubmitting ? "Saving..." : "Save"}
                      </button>
                    </div>

                    {(statusUpdate === "RESOLVED" || statusUpdate === "REJECTED") && (
                      <div className="pt-2">
                        <textarea
                          value={statusReason}
                          onChange={(e) => setStatusReason(e.target.value)}
                          placeholder={
                            statusUpdate === "RESOLVED"
                              ? "Optional resolution note for member..."
                              : "Reason for rejection (required for member visibility)..."
                          }
                          rows={2}
                          className="w-full p-2.5 text-xs rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </form>

                  {/* Priority update form */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">Update Priority</label>
                    <div className="flex gap-2">
                      <select
                        value={priorityUpdate}
                        onChange={(e) => setPriorityUpdate(e.target.value)}
                        className="flex-1 py-1.5 px-3 text-xs rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {Object.keys(PRIORITY_CONFIG).map((p) => (
                          <option key={p} value={p}>
                            {PRIORITY_CONFIG[p].label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handlePriorityChange}
                        disabled={prioritySubmitting || priorityUpdate === selectedSuggestion.priority}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        {prioritySubmitting ? "Updating..." : "Update"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs: Conversation vs Activity History */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs font-bold">
                  <button
                    onClick={() => setDetailTab("conversation")}
                    className={`flex items-center gap-1.5 pb-2 -mb-2 border-b-2 transition-all cursor-pointer ${
                      detailTab === "conversation"
                        ? "border-amber-400 text-amber-400"
                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <FaComments size={13} />
                    <span>Conversation & Replies ({selectedSuggestion.messages?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setDetailTab("history")}
                    className={`flex items-center gap-1.5 pb-2 -mb-2 border-b-2 transition-all cursor-pointer ml-4 ${
                      detailTab === "history"
                        ? "border-amber-400 text-amber-400"
                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <FaHistory size={12} />
                    <span>Audit / Activity History ({selectedSuggestion.activityHistory?.length || 0})</span>
                  </button>
                </div>

                {/* Tab: Conversation */}
                {detailTab === "conversation" && (
                  <div className="space-y-4">
                    {/* Message list */}
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {(!selectedSuggestion.messages || selectedSuggestion.messages.length === 0) ? (
                        <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                          No replies or follow-up messages yet.
                        </div>
                      ) : (
                        selectedSuggestion.messages.map((m, idx) => {
                          const isAdmin = m.senderType === "ADMIN";
                          return (
                            <div
                              key={idx}
                              className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                            >
                              <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] mb-1 px-1">
                                <span className="font-bold text-[var(--text-secondary)]">
                                  {m.senderName || (isAdmin ? "Admin" : "Member")}
                                </span>
                                {m.senderRole && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-medium">
                                    {m.senderRole}
                                  </span>
                                )}
                                <span>•</span>
                                <span>
                                  {new Date(m.createdAt).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              <div
                                className={`max-w-[85%] p-3.5 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed shadow-sm ${
                                  isAdmin
                                    ? "bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-tr-sm"
                                    : "bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm"
                                }`}
                              >
                                {m.message}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Admin Reply Form */}
                    {!["CLOSED", "REJECTED"].includes(selectedSuggestion.status) ? (
                      <form onSubmit={handleReplySubmit} className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                        <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                          <FiMessageSquare size={13} />
                          Send Official Admin Response to Member
                        </label>
                        <div className="flex gap-2">
                          <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your official administrative response here. Member will receive an in-app notification..."
                            rows={3}
                            className="flex-1 p-3 text-xs rounded-2xl bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={replySubmitting || !replyMessage.trim()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                          >
                            <FaPaperPlane size={11} />
                            <span>{replySubmitting ? "Sending..." : "Send Response"}</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)] italic text-center py-2">
                        This suggestion is currently {selectedSuggestion.status.toLowerCase()}. Reopen or update status to send more responses.
                      </p>
                    )}
                  </div>
                )}

                {/* Tab: Activity History */}
                {detailTab === "history" && (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {selectedSuggestion.activityHistory?.map((act, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border-subtle)] text-xs"
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-amber-300 text-[11px]">{act.action}</span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {new Date(act.timestamp).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-[var(--text-secondary)] mt-0.5 text-[11px]">{act.details}</p>
                          {act.actorName && (
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">By: {act.actorName}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg)]/50 text-xs text-[var(--text-muted)]">
              <span>Samaj Suggestion System • Official Record</span>
              <button
                onClick={closeDetail}
                className="px-4 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-amber-400 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Soft Delete Confirmation Modal ── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--surface)] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <FaExclamationTriangle size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Delete Suggestion?</h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Suggestion {selectedSuggestion?.suggestionId} will be archived/soft-deleted.
                </p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                Deletion Reason (Required for Audit Log)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Spam, duplicate, inappropriate content, or administrative cleanup..."
                rows={3}
                className="w-full mt-1.5 p-2.5 text-xs rounded-xl bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg)] border border-[var(--border-subtle)] hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSuggestion}
                disabled={deleteSubmitting}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 cursor-pointer shadow-md"
              >
                {deleteSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
