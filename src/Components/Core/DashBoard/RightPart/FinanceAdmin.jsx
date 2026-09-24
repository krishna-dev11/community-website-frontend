import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArchive,
  FaDonate,
  FaFileInvoiceDollar,
  FaHandHoldingUsd,
  FaMoneyBillWave,
  FaPaperPlane,
  FaRupeeSign,
  FaSyncAlt,
} from "react-icons/fa";
import { FiCheckCircle, FiClock, FiSearch } from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { paymentEndpoints } from "../../../../services/apis";
import FileUploadWithPreview from "../../../Common/FileUploadWithPreview";
import MonthlyContributionsAdmin from "./MonthlyContributionsAdmin";

// ─── Module navigation tabs ────────────────────────────────────────────────
const tabs = [
  { key: "campaigns",     label: "Campaigns",     icon: FaDonate            },
  { key: "donations",     label: "Donations",     icon: FaRupeeSign         },
  { key: "contributions", label: "Monthly Contributions", icon: FaFileInvoiceDollar },
];

// ─── Status configs per module ─────────────────────────────────────────────
const MODULE_STATUS_CONFIG = {
  campaigns: [
    { key: "ACTIVE",   label: "Active Drives" },
    { key: "DRAFT",    label: "Drafts"        },
    { key: "PAUSED",   label: "Paused"        },
    { key: "ARCHIVED", label: "Archived"      },
    { key: "ALL",      label: "All"           },
  ],
  donations: [
    { key: "SUCCESS",  label: "Successful" },
    { key: "PENDING",  label: "Pending"    },
    { key: "FAILED",   label: "Failed"     },
    { key: "REFUNDED", label: "Refunded"   },
    { key: "ALL",      label: "All"        },
  ],
  contributions: [
    { key: "PENDING",  label: "Needs Payment" },
    { key: "OVERDUE",  label: "Overdue"       },
    { key: "PARTIAL",  label: "Partial"       },
    { key: "PAID",     label: "Paid"          },
    { key: "WAIVED",   label: "Waived"        },
    { key: "ALL",      label: "All"           },
  ],
};

const DONE_STATUSES = new Set([
  "PAID", "WAIVED", "SUCCESS", "ARCHIVED", "REFUNDED",
]);

const MODULE_DEFAULT_STATUS = {
  campaigns:     "ACTIVE",
  donations:     "SUCCESS",
  contributions: "PENDING",
};

const inputClass = "ka-input";
const textareaClass = "ka-input !min-h-24 resize-none !py-3";

// ─── Shared UI primitives ───────────────────────────────────────────────────
const Button = ({ children, icon: Icon, tone = "neutral", className = "", ...props }) => {
  const toneClasses = {
    neutral: "btn-secondary !py-2 !px-4 !text-xs",
    success: "btn-primary !py-2 !px-5 !text-xs",
    warning: "inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all hover:bg-amber-400/20 disabled:opacity-50 cursor-pointer",
    danger:  "inline-flex items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 text-red-300 font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all hover:bg-red-400/20 disabled:opacity-50 cursor-pointer",
  };
  return (
    <button
      {...props}
      className={`${toneClasses[tone] || toneClasses.neutral} ${className} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </button>
  );
};

const Field = ({ label, children }) => (
  <label className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
    {children}
  </label>
);

const StatusBadge = ({ value }) => {
  const colorMap = {
    ACTIVE:   "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    SUCCESS:  "border-green-400/40 bg-green-400/10 text-green-300",
    PAID:     "border-green-400/40 bg-green-400/10 text-green-300",
    PENDING:  "border-amber-400/40 bg-amber-400/10 text-amber-300",
    PARTIAL:  "border-sky-400/40 bg-sky-400/10 text-sky-300",
    OVERDUE:  "border-red-400/40 bg-red-400/10 text-red-300",
    FAILED:   "border-red-400/40 bg-red-400/10 text-red-300",
    DRAFT:    "border-purple-400/40 bg-purple-400/10 text-purple-300",
    PAUSED:   "border-orange-400/40 bg-orange-400/10 text-orange-300",
    ARCHIVED: "border-gray-500/40 bg-gray-500/10 text-gray-400",
    WAIVED:   "border-gray-500/40 bg-gray-500/10 text-gray-400",
    REFUNDED: "border-indigo-400/40 bg-indigo-400/10 text-indigo-300",
  };
  return (
    <span
      className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        colorMap[value] || "border-white/10 bg-white/5 text-gray-400"
      }`}
    >
      {value || "UNKNOWN"}
    </span>
  );
};

const SummaryCards = ({ data, config, customCards }) => {
  if (customCards) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {customCards.map((card) => (
          <div key={card.label} className={`rounded-2xl border ${card.border} bg-[var(--surface-elevated)] px-4 py-3`}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{card.label}</p>
            <p className={`mt-0.5 text-xl font-black ${card.textColor}`}>{card.value}</p>
          </div>
        ))}
      </div>
    );
  }

  const counts = {};
  data.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });

  const actionKey = config[0]?.key;
  const midKeys   = config.slice(1, -1).filter((c) => !DONE_STATUSES.has(c.key) && c.key !== "ALL").map((c) => c.key);
  const doneKeys  = config.filter((c) => DONE_STATUSES.has(c.key)).map((c) => c.key);

  const cards = [
    { label: "Total",          value: data.length,                                                  textColor: "text-[var(--text-primary)]", border: "border-[var(--border-subtle)]" },
    { label: "Needs Action",   value: actionKey ? (counts[actionKey] || 0) : 0,                     textColor: "text-amber-300",              border: "border-amber-400/20" },
    { label: "In Progress/Mid", value: midKeys.reduce((s, k) => s + (counts[k] || 0), 0),          textColor: "text-sky-300",                border: "border-sky-400/20" },
    { label: "Completed/Done", value: doneKeys.reduce((s, k) => s + (counts[k] || 0), 0),          textColor: "text-emerald-300",            border: "border-emerald-400/20" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-2xl border ${card.border} bg-[var(--surface-elevated)] px-4 py-3`}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{card.label}</p>
          <p className={`mt-0.5 text-2xl font-black ${card.textColor}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

const StatusTabBar = ({ data, config, activeKey, onChange }) => {
  const counts = { ALL: data.length };
  data.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });

  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {config.map((tab) => {
        const count    = tab.key === "ALL" ? data.length : (counts[tab.key] || 0);
        const isActive = activeKey === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex-shrink-0 h-8 rounded-full px-3.5 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-[var(--accent-primary)] text-[#070707] shadow-sm"
                : "border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label} ({count})
          </button>
        );
      })}
    </div>
  );
};

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3">
    <FiSearch size={13} className="text-[var(--text-muted)] shrink-0" />
    <input
      className="h-9 min-w-0 flex-1 border-none bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const ModuleEmptyState = ({ statusKey, moduleLabel }) => {
  const isActionable = !DONE_STATUSES.has(statusKey) && statusKey !== "ALL";
  if (isActionable) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 py-12 text-center">
        <FiCheckCircle size={26} className="text-emerald-400" />
        <p className="text-sm font-semibold text-emerald-300">All settled!</p>
        <p className="text-xs text-[var(--text-muted)]">No pending {moduleLabel} require your attention.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-12 text-center">
      <FiClock size={26} className="text-[var(--text-muted)]" />
      <p className="text-sm font-semibold text-[var(--text-secondary)]">No records found</p>
      <p className="text-xs text-[var(--text-muted)]">No {moduleLabel} matching this status.</p>
    </div>
  );
};

const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not set";

const initialCampaign = { title: "", description: "", goalAmount: "", startDate: "", endDate: "", status: "ACTIVE" };
const initialGenerate = { month: new Date().getMonth() + 1, year: new Date().getFullYear(), expectedAmount: "", dueDate: "" };

// ============================================================================
//  FinanceAdmin Main Component
// ============================================================================
const FinanceAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [loading, setLoading]     = useState(false);
  const [busyId, setBusyId]       = useState(null);

  const [campaigns, setCampaigns]         = useState([]);
  const [donations, setDonations]         = useState([]);
  const [contributions, setContributions] = useState([]);

  const [campaignForm, setCampaignForm]         = useState(initialCampaign);
  const [campaignCoverFile, setCampaignCoverFile] = useState(null);
  const [generateForm, setGenerateForm]         = useState(initialGenerate);
  const [paymentDrafts, setPaymentDrafts]       = useState({});

  // ── Per-module status filters and search ──────────────────────────────────
  const [statusFilters, setStatusFilters] = useState({ ...MODULE_DEFAULT_STATUS });
  const [moduleSearch, setModuleSearch]   = useState({
    campaigns: "", donations: "", contributions: "",
  });

  const setFilter = (mod, key) => setStatusFilters((prev) => ({ ...prev, [mod]: key }));
  const setSearch = (mod, val) => setModuleSearch((prev) => ({ ...prev, [mod]: val }));

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const loadCampaigns = async () => {
    const response = await apiConnector("GET", paymentEndpoints.ADMIN_DONATION_CAMPAIGNS_API, null, authConfig, { limit: 100 });
    setCampaigns(response.data?.data?.campaigns || []);
  };

  const loadDonations = async () => {
    const response = await apiConnector("GET", paymentEndpoints.DONATIONS_API, null, authConfig, { limit: 100 });
    setDonations(response.data?.data?.donations || []);
  };

  const loadContributions = async () => {
    const response = await apiConnector("GET", paymentEndpoints.CONTRIBUTIONS_API, null, authConfig, { limit: 100 });
    setContributions(response.data?.data?.contributions || []);
  };

  const loaders = useMemo(
    () => ({
      campaigns: loadCampaigns,
      donations: loadDonations,
      contributions: loadContributions,
    }),
    [authConfig]
  );

  const refreshActive = async () => {
    setLoading(true);
    try {
      await loaders[activeTab]();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load finance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshActive();
  }, [activeTab]);

  const createCampaign = async (event) => {
    event.preventDefault();
    setBusyId("campaign");
    try {
      const formData = new FormData();
      formData.append("title", campaignForm.title);
      formData.append("description", campaignForm.description);
      if (campaignForm.goalAmount) formData.append("goalAmount", Number(campaignForm.goalAmount));
      if (campaignForm.startDate) formData.append("startDate", campaignForm.startDate);
      if (campaignForm.endDate) formData.append("endDate", campaignForm.endDate);
      formData.append("status", campaignForm.status);
      if (campaignCoverFile instanceof File) formData.append("coverImage", campaignCoverFile);

      await apiConnector("POST", paymentEndpoints.DONATION_CAMPAIGNS_API, formData, authConfig);
      toast.success("Campaign saved successfully");
      setCampaignForm(initialCampaign);
      setCampaignCoverFile(null);
      await loadCampaigns();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save campaign");
    } finally {
      setBusyId(null);
    }
  };

  const archiveCampaign = async (campaignId) => {
    setBusyId(campaignId);
    try {
      await apiConnector("PATCH", paymentEndpoints.ARCHIVE_DONATION_CAMPAIGN_API(campaignId), { reason: "Archived from dashboard" }, authConfig);
      toast.success("Campaign archived");
      await loadCampaigns();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to archive campaign");
    } finally {
      setBusyId(null);
    }
  };

  const generateContributions = async (event) => {
    event.preventDefault();
    setBusyId("generate");
    try {
      const response = await apiConnector(
        "POST",
        paymentEndpoints.GENERATE_CONTRIBUTIONS_API,
        {
          month: Number(generateForm.month),
          year: Number(generateForm.year),
          expectedAmount: Number(generateForm.expectedAmount),
          dueDate: generateForm.dueDate,
        },
        authConfig
      );
      const result = response.data?.data || {};
      toast.success(`Generated ${result.created || 0}, skipped ${result.skipped || 0}`);
      await loadContributions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to generate contributions");
    } finally {
      setBusyId(null);
    }
  };

  const markOverdue = async () => {
    setBusyId("overdue");
    try {
      const response = await apiConnector("POST", paymentEndpoints.MARK_OVERDUE_CONTRIBUTIONS_API, null, authConfig);
      toast.success(`${response.data?.data?.modifiedCount || 0} contribution(s) marked overdue`);
      await loadContributions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to mark overdue");
    } finally {
      setBusyId(null);
    }
  };

  const recordOfflinePayment = async (contribution) => {
    const draft = paymentDrafts[contribution._id] || {};
    const amount = Number(draft.amount);
    if (!amount || amount < 1) {
      toast.error("Enter a valid payment amount");
      return;
    }
    setBusyId(contribution._id);
    try {
      await apiConnector(
        "PATCH",
        paymentEndpoints.OFFLINE_CONTRIBUTION_PAYMENT_API(contribution._id),
        { amount, mode: draft.mode || "CASH", note: draft.note || undefined },
        authConfig
      );
      toast.success("Offline payment recorded");
      setPaymentDrafts((current) => ({ ...current, [contribution._id]: {} }));
      await loadContributions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to record payment");
    } finally {
      setBusyId(null);
    }
  };

  const waiveContribution = async (contribution) => {
    const draft = paymentDrafts[contribution._id] || {};
    setBusyId(contribution._id);
    try {
      await apiConnector(
        "PATCH",
        paymentEndpoints.WAIVE_CONTRIBUTION_API(contribution._id),
        { reason: draft.note || "Waived from dashboard" },
        authConfig
      );
      toast.success("Contribution waived");
      await loadContributions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to waive contribution");
    } finally {
      setBusyId(null);
    }
  };

  // ── Filtered data sets ────────────────────────────────────────────────────
  const filteredCampaigns = useMemo(() => {
    const statusKey = statusFilters.campaigns;
    const query = (moduleSearch.campaigns || "").trim().toLowerCase();
    return campaigns.filter((c) => {
      const matchStatus = statusKey === "ALL" || c.status === statusKey;
      const searchBlob  = `${c.title} ${c.description}`.toLowerCase();
      return matchStatus && (!query || searchBlob.includes(query));
    });
  }, [campaigns, statusFilters.campaigns, moduleSearch.campaigns]);

  const filteredDonations = useMemo(() => {
    const statusKey = statusFilters.donations;
    const query = (moduleSearch.donations || "").trim().toLowerCase();
    return donations.filter((d) => {
      const matchStatus = statusKey === "ALL" || d.status === statusKey;
      const searchBlob  = [
        d.donorName, d.donor?.firstName, d.donor?.lastName, d.donor?.email,
        d.campaign?.title, d.receiptNumber, d.razorpayOrderId,
      ].filter(Boolean).join(" ").toLowerCase();
      return matchStatus && (!query || searchBlob.includes(query));
    });
  }, [donations, statusFilters.donations, moduleSearch.donations]);

  const filteredContributions = useMemo(() => {
    const statusKey = statusFilters.contributions;
    const query = (moduleSearch.contributions || "").trim().toLowerCase();
    return contributions.filter((c) => {
      const matchStatus = statusKey === "ALL" || c.status === statusKey;
      const searchBlob  = [
        c.member?.firstName, c.member?.lastName, c.member?.email,
        c.family?.familyName, `${c.month}/${c.year}`,
      ].filter(Boolean).join(" ").toLowerCase();
      return matchStatus && (!query || searchBlob.includes(query));
    });
  }, [contributions, statusFilters.contributions, moduleSearch.contributions]);

  // Donation Stats custom summary
  const donationStats = useMemo(() => {
    const successTotal = donations
      .filter((d) => d.status === "SUCCESS")
      .reduce((s, d) => s + Number(d.amount || 0), 0);
    const successCount = donations.filter((d) => d.status === "SUCCESS").length;
    const pendingCount = donations.filter((d) => ["PENDING", "FAILED"].includes(d.status)).length;

    return [
      { label: "Total Transactions", value: donations.length, textColor: "text-[var(--text-primary)]", border: "border-[var(--border-subtle)]" },
      { label: "Funds Collected",    value: money(successTotal), textColor: "text-emerald-300", border: "border-emerald-400/20" },
      { label: "Successful",         value: successCount,      textColor: "text-green-300",   border: "border-green-400/20" },
      { label: "Pending / Failed",   value: pendingCount,      textColor: "text-amber-300",   border: "border-amber-400/20" },
    ];
  }, [donations]);

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow-badge mb-2">
                <FaFileInvoiceDollar size={12} />
                <span>Financial Ops</span>
              </div>
              <h1 className="heading-hero text-[var(--text-primary)]">
                Finance <span className="text-gradient">Admin</span>
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
                Manage donation campaigns, inspect payment status, and operate monthly member contributions.
              </p>
            </div>
            <Button icon={FaSyncAlt} onClick={refreshActive} disabled={loading}>Refresh</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex h-10 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    active
                      ? "bg-[var(--accent-primary)] text-[#070707] shadow-md"
                      : "border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════════════
                CAMPAIGNS
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "campaigns" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createCampaign} className="grid h-fit gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Launch Donation Campaign</h2>
                  <Field label="Campaign Title *"><input className={inputClass} value={campaignForm.title} onChange={(e) => setCampaignForm((cur) => ({ ...cur, title: e.target.value }))} placeholder="e.g. Samaj Bhavan Renovation Drive" required /></Field>
                  <Field label="Description *"><textarea className={textareaClass} value={campaignForm.description} onChange={(e) => setCampaignForm((cur) => ({ ...cur, description: e.target.value }))} placeholder="Purpose of this donation drive..." required /></Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Target Goal (Rs.)"><input type="number" min="0" className={inputClass} value={campaignForm.goalAmount} onChange={(e) => setCampaignForm((cur) => ({ ...cur, goalAmount: e.target.value }))} placeholder="500000" /></Field>
                    <Field label="Status">
                      <select className={inputClass} value={campaignForm.status} onChange={(e) => setCampaignForm((cur) => ({ ...cur, status: e.target.value }))}>
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PAUSED">Paused</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Start Date"><input type="date" className={inputClass} value={campaignForm.startDate} onChange={(e) => setCampaignForm((cur) => ({ ...cur, startDate: e.target.value }))} /></Field>
                    <Field label="End Date"><input type="date" className={inputClass} value={campaignForm.endDate} onChange={(e) => setCampaignForm((cur) => ({ ...cur, endDate: e.target.value }))} /></Field>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                    <FileUploadWithPreview label="Campaign Cover Image" required={false} accept="image/jpeg,image/jpg,image/png,image/webp" maxSizeMB={10} helperText="Drive banner image" file={campaignCoverFile} onFileSelect={(f) => setCampaignCoverFile(f)} />
                  </div>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "campaign"}>Save Campaign</Button>
                </form>

                <section className="grid content-start gap-3">
                  <SummaryCards data={campaigns} config={MODULE_STATUS_CONFIG.campaigns} />
                  <div className="flex flex-col gap-2">
                    <StatusTabBar
                      data={campaigns}
                      config={MODULE_STATUS_CONFIG.campaigns}
                      activeKey={statusFilters.campaigns}
                      onChange={(k) => setFilter("campaigns", k)}
                    />
                    <SearchBar
                      value={moduleSearch.campaigns}
                      onChange={(v) => setSearch("campaigns", v)}
                      placeholder="Search campaign title, description..."
                    />
                  </div>

                  {filteredCampaigns.length === 0 ? (
                    <ModuleEmptyState statusKey={statusFilters.campaigns} moduleLabel="campaigns" />
                  ) : (
                    <div className="grid gap-3">
                      {filteredCampaigns.map((campaign) => {
                        const progress = campaign.goalAmount
                          ? Math.min(100, Math.round((Number(campaign.raisedAmount || 0) / Number(campaign.goalAmount)) * 100))
                          : 0;
                        const isDone = DONE_STATUSES.has(campaign.status);

                        return (
                          <article key={campaign._id} className={`rounded-2xl border p-4 sm:p-5 transition ${isDone ? "border-white/5 bg-white/[0.01] opacity-75" : "border-white/10 bg-white/[0.02]"}`}>
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className={`font-bold ${isDone ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>{campaign.title}</h3>
                                  <StatusBadge value={campaign.status} />
                                </div>
                                <p className="mt-1 line-clamp-2 text-xs text-gray-500">{campaign.description}</p>
                                <p className="mt-2 text-xs font-semibold text-[var(--accent-primary)]">
                                  {money(campaign.raisedAmount)} raised of {money(campaign.goalAmount)} ({progress}%)
                                </p>
                              </div>
                            </div>

                            {campaign.goalAmount ? (
                              <div className="mt-3 h-2 rounded-full overflow-hidden bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                                <div className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full transition-all" style={{ width: `${progress}%` }} />
                              </div>
                            ) : null}

                            {campaign.status !== "ARCHIVED" && (
                              <div className="mt-4 border-t border-white/10 pt-3">
                                <Button icon={FaArchive} tone="danger" onClick={() => archiveCampaign(campaign._id)} disabled={busyId === campaign._id}>
                                  Archive Campaign
                                </Button>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                DONATIONS
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "donations" && (
              <section className="grid gap-4">
                <SummaryCards customCards={donationStats} />

                <div className="flex flex-col gap-2">
                  <StatusTabBar
                    data={donations}
                    config={MODULE_STATUS_CONFIG.donations}
                    activeKey={statusFilters.donations}
                    onChange={(k) => setFilter("donations", k)}
                  />
                  <SearchBar
                    value={moduleSearch.donations}
                    onChange={(v) => setSearch("donations", v)}
                    placeholder="Search donor name, campaign, receipt or order ID..."
                  />
                </div>

                {filteredDonations.length === 0 ? (
                  <ModuleEmptyState statusKey={statusFilters.donations} moduleLabel="donations" />
                ) : (
                  <div className="grid gap-3">
                    {filteredDonations.map((donation) => {
                      const isDone = DONE_STATUSES.has(donation.status);
                      return (
                        <article key={donation._id} className={`rounded-2xl border p-4 sm:p-5 transition ${isDone ? "border-white/5 bg-white/[0.01]" : "border-white/10 bg-white/[0.02]"}`}>
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-bold text-base text-[var(--text-primary)]">
                                  {money(donation.amount)}
                                  <span className="text-xs font-normal text-gray-400 ml-2">
                                    {donation.anonymous ? "(Anonymous Contribution)" : ""}
                                  </span>
                                </h3>
                                <StatusBadge value={donation.status} />
                              </div>
                              <p className="text-xs text-[var(--text-secondary)] font-medium">
                                Campaign: {donation.campaign?.title || "General Donation Fund"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Donor: {donation.donor?.firstName ? `${donation.donor.firstName} ${donation.donor.lastName || ""}` : (donation.donorName || "Anonymous")} · {formatDate(donation.createdAt)}
                              </p>
                              <p className="mt-1 font-mono text-[11px] text-gray-600">
                                Ref: {donation.receiptNumber || donation.razorpayOrderId || donation._id}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ══════════════════════════════════════════════════════════════
                CONTRIBUTIONS (MONTHLY SAMaj CONTRIBUTIONS MANAGEMENT)
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "contributions" && (
              <MonthlyContributionsAdmin />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FinanceAdmin;
