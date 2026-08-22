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
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { paymentEndpoints } from "../../../../services/apis";

const tabs = [
  { key: "campaigns", label: "Campaigns", icon: FaDonate },
  { key: "donations", label: "Donations", icon: FaRupeeSign },
  { key: "contributions", label: "Contributions", icon: FaFileInvoiceDollar },
];

const inputClass =
  "h-11 border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/40";
const textareaClass =
  "min-h-24 resize-none border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/40";

const Button = ({ children, icon: Icon, tone = "neutral", className = "", ...props }) => {
  const tones = {
    neutral: "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20",
    warning: "border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20",
    danger: "border-red-400/30 bg-red-400/10 text-red-200 hover:bg-red-400/20",
  };

  return (
    <button
      {...props}
      className={`inline-flex h-11 items-center justify-center gap-2 border px-4 text-[11px] font-bold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
};

const Field = ({ label, children }) => (
  <label className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
    {children}
  </label>
);

const Status = ({ value }) => (
  <span className="inline-flex w-fit border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-300">
    {value || "UNKNOWN"}
  </span>
);

const Empty = ({ text }) => (
  <div className="border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-gray-500">{text}</div>
);

const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const asset = (url) => (url?.trim() ? { url: url.trim() } : undefined);

const initialCampaign = {
  title: "",
  description: "",
  goalAmount: "",
  startDate: "",
  endDate: "",
  status: "DRAFT",
  coverImageUrl: "",
};

const initialGenerate = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  expectedAmount: "",
  dueDate: "",
};

const FinanceAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [campaignForm, setCampaignForm] = useState(initialCampaign);
  const [generateForm, setGenerateForm] = useState(initialGenerate);
  const [donationFilters, setDonationFilters] = useState({ status: "", campaign: "" });
  const [contributionFilters, setContributionFilters] = useState({
    status: "",
    month: "",
    year: new Date().getFullYear(),
  });
  const [paymentDrafts, setPaymentDrafts] = useState({});

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }),
    [token]
  );

  const loadCampaigns = async () => {
    const response = await apiConnector("GET", paymentEndpoints.ADMIN_DONATION_CAMPAIGNS_API, null, authConfig, { limit: 30 });
    setCampaigns(response.data?.data?.campaigns || []);
  };

  const loadDonations = async () => {
    const params = Object.fromEntries(Object.entries({ ...donationFilters, limit: 50 }).filter(([, value]) => value !== ""));
    const response = await apiConnector("GET", paymentEndpoints.DONATIONS_API, null, authConfig, params);
    setDonations(response.data?.data?.donations || []);
  };

  const loadContributions = async () => {
    const params = Object.fromEntries(Object.entries({ ...contributionFilters, limit: 50 }).filter(([, value]) => value !== ""));
    const response = await apiConnector("GET", paymentEndpoints.CONTRIBUTIONS_API, null, authConfig, params);
    setContributions(response.data?.data?.contributions || []);
  };

  const loaders = useMemo(
    () => ({
      campaigns: loadCampaigns,
      donations: loadDonations,
      contributions: loadContributions,
    }),
    [authConfig, donationFilters, contributionFilters]
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
      await apiConnector(
        "POST",
        paymentEndpoints.DONATION_CAMPAIGNS_API,
        {
          ...campaignForm,
          goalAmount: campaignForm.goalAmount ? Number(campaignForm.goalAmount) : undefined,
          startDate: campaignForm.startDate || undefined,
          endDate: campaignForm.endDate || undefined,
          coverImage: asset(campaignForm.coverImageUrl),
        },
        authConfig
      );
      toast.success("Campaign saved");
      setCampaignForm(initialCampaign);
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

  return (
    <div className="min-h-screen bg-black px-3 py-8 text-white md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">Finance</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Finance Admin</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Manage donation campaigns, inspect payment status, and operate monthly member contributions.
              </p>
            </div>
            <Button icon={FaSyncAlt} onClick={refreshActive} disabled={loading}>
              Refresh
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex h-11 items-center justify-center gap-2 border px-3 text-[11px] font-bold uppercase tracking-widest transition ${
                    selected
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                      : "border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {activeTab === "campaigns" && (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={createCampaign} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                  <h2 className="text-lg font-bold text-white">Create Campaign</h2>
                  <Field label="Title">
                    <input className={inputClass} value={campaignForm.title} onChange={(event) => setCampaignForm((current) => ({ ...current, title: event.target.value }))} required />
                  </Field>
                  <Field label="Description">
                    <textarea className={textareaClass} value={campaignForm.description} onChange={(event) => setCampaignForm((current) => ({ ...current, description: event.target.value }))} required />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Goal Amount">
                      <input type="number" min="0" className={inputClass} value={campaignForm.goalAmount} onChange={(event) => setCampaignForm((current) => ({ ...current, goalAmount: event.target.value }))} />
                    </Field>
                    <Field label="Status">
                      <select className={inputClass} value={campaignForm.status} onChange={(event) => setCampaignForm((current) => ({ ...current, status: event.target.value }))}>
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PAUSED">Paused</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Start Date">
                      <input type="date" className={inputClass} value={campaignForm.startDate} onChange={(event) => setCampaignForm((current) => ({ ...current, startDate: event.target.value }))} />
                    </Field>
                    <Field label="End Date">
                      <input type="date" className={inputClass} value={campaignForm.endDate} onChange={(event) => setCampaignForm((current) => ({ ...current, endDate: event.target.value }))} />
                    </Field>
                  </div>
                  <Field label="Cover Image URL">
                    <input className={inputClass} value={campaignForm.coverImageUrl} onChange={(event) => setCampaignForm((current) => ({ ...current, coverImageUrl: event.target.value }))} />
                  </Field>
                  <Button icon={FaPaperPlane} tone="success" disabled={busyId === "campaign"}>Save Campaign</Button>
                </form>

                <section className="grid gap-3">
                  {campaigns.map((campaign) => {
                    const progress = campaign.goalAmount
                      ? Math.min(100, Math.round((Number(campaign.raisedAmount || 0) / Number(campaign.goalAmount)) * 100))
                      : 0;
                    return (
                      <article key={campaign._id} className="border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="font-bold text-white">{campaign.title}</h3>
                            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{campaign.description}</p>
                            <p className="mt-2 text-xs text-gray-600">{money(campaign.raisedAmount)} raised of {money(campaign.goalAmount)}</p>
                          </div>
                          <Status value={campaign.status} />
                        </div>
                        {campaign.goalAmount ? (
                          <div className="mt-4 h-2 bg-white/10">
                            <div className="h-full bg-emerald-400" style={{ width: `${progress}%` }} />
                          </div>
                        ) : null}
                        <Button icon={FaArchive} tone="danger" className="mt-4 w-full sm:w-auto" onClick={() => archiveCampaign(campaign._id)} disabled={busyId === campaign._id || campaign.status === "ARCHIVED"}>
                          Archive
                        </Button>
                      </article>
                    );
                  })}
                  {campaigns.length === 0 && <Empty text="No donation campaigns found." />}
                </section>
              </div>
            )}

            {activeTab === "donations" && (
              <section className="grid gap-4">
                <div className="grid gap-3 border border-white/10 bg-white/[0.02] p-4 md:grid-cols-[220px_1fr_auto]">
                  <select className={inputClass} value={donationFilters.status} onChange={(event) => setDonationFilters((current) => ({ ...current, status: event.target.value }))}>
                    <option value="">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                  <select className={inputClass} value={donationFilters.campaign} onChange={(event) => setDonationFilters((current) => ({ ...current, campaign: event.target.value }))}>
                    <option value="">All campaigns</option>
                    {campaigns.map((campaign) => <option key={campaign._id} value={campaign._id}>{campaign.title}</option>)}
                  </select>
                  <Button icon={FaSyncAlt} onClick={loadDonations}>Apply</Button>
                </div>

                <div className="grid gap-3">
                  {donations.map((donation) => (
                    <article key={donation._id} className="border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-bold text-white">{money(donation.amount)} {donation.anonymous ? "Anonymous donation" : "Donation"}</h3>
                          <p className="mt-1 text-sm text-gray-500">{donation.campaign?.title || "General donation"} - {donation.receiptNumber || donation.razorpayOrderId}</p>
                          <p className="mt-2 text-xs text-gray-600">{donation.donor?.firstName || donation.donorName || "Donor"} - {formatDate(donation.createdAt)}</p>
                        </div>
                        <Status value={donation.status} />
                      </div>
                    </article>
                  ))}
                  {donations.length === 0 && <Empty text="No donations found for the selected filters." />}
                </div>
              </section>
            )}

            {activeTab === "contributions" && (
              <div className="grid gap-5">
                <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <form onSubmit={generateContributions} className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2">
                      <FaHandHoldingUsd className="text-emerald-300" size={14} />
                      <h2 className="text-lg font-bold text-white">Generate Monthly Contributions</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Month">
                        <input type="number" min="1" max="12" className={inputClass} value={generateForm.month} onChange={(event) => setGenerateForm((current) => ({ ...current, month: event.target.value }))} required />
                      </Field>
                      <Field label="Year">
                        <input type="number" className={inputClass} value={generateForm.year} onChange={(event) => setGenerateForm((current) => ({ ...current, year: event.target.value }))} required />
                      </Field>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Expected Amount">
                        <input type="number" min="1" className={inputClass} value={generateForm.expectedAmount} onChange={(event) => setGenerateForm((current) => ({ ...current, expectedAmount: event.target.value }))} required />
                      </Field>
                      <Field label="Due Date">
                        <input type="date" className={inputClass} value={generateForm.dueDate} onChange={(event) => setGenerateForm((current) => ({ ...current, dueDate: event.target.value }))} required />
                      </Field>
                    </div>
                    <Button icon={FaPaperPlane} tone="success" disabled={busyId === "generate"}>Generate</Button>
                  </form>

                  <div className="grid gap-4 border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2">
                      <FaMoneyBillWave className="text-emerald-300" size={14} />
                      <h2 className="text-lg font-bold text-white">Contribution Filters</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Field label="Status">
                        <select className={inputClass} value={contributionFilters.status} onChange={(event) => setContributionFilters((current) => ({ ...current, status: event.target.value }))}>
                          <option value="">All</option>
                          <option value="PENDING">Pending</option>
                          <option value="PARTIAL">Partial</option>
                          <option value="PAID">Paid</option>
                          <option value="OVERDUE">Overdue</option>
                          <option value="WAIVED">Waived</option>
                        </select>
                      </Field>
                      <Field label="Month">
                        <input type="number" min="1" max="12" className={inputClass} value={contributionFilters.month} onChange={(event) => setContributionFilters((current) => ({ ...current, month: event.target.value }))} />
                      </Field>
                      <Field label="Year">
                        <input type="number" className={inputClass} value={contributionFilters.year} onChange={(event) => setContributionFilters((current) => ({ ...current, year: event.target.value }))} />
                      </Field>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <Button icon={FaSyncAlt} onClick={loadContributions}>Apply Filters</Button>
                      <Button tone="warning" onClick={markOverdue} disabled={busyId === "overdue"}>Mark Overdue</Button>
                    </div>
                  </div>
                </div>

                <section className="grid gap-3">
                  {contributions.map((contribution) => {
                    const remaining = Number(contribution.expectedAmount || 0) - Number(contribution.paidAmount || 0);
                    const draft = paymentDrafts[contribution._id] || {};
                    return (
                      <article key={contribution._id} className="border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="font-bold text-white">
                              {contribution.member?.firstName} {contribution.member?.lastName} - {contribution.month}/{contribution.year}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Paid {money(contribution.paidAmount)} of {money(contribution.expectedAmount)} - due {formatDate(contribution.dueDate)}
                            </p>
                            <p className="mt-2 text-xs text-gray-600">{contribution.family?.familyName || "No family linked"}</p>
                          </div>
                          <Status value={contribution.status} />
                        </div>
                        <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 lg:grid-cols-[150px_170px_1fr_auto_auto]">
                          <input
                            type="number"
                            min="1"
                            max={remaining > 0 ? remaining : undefined}
                            className={inputClass}
                            value={draft.amount || ""}
                            onChange={(event) => setPaymentDrafts((current) => ({ ...current, [contribution._id]: { ...current[contribution._id], amount: event.target.value } }))}
                            placeholder={remaining > 0 ? String(remaining) : "0"}
                            disabled={!["PENDING", "PARTIAL", "OVERDUE"].includes(contribution.status)}
                          />
                          <select
                            className={inputClass}
                            value={draft.mode || "CASH"}
                            onChange={(event) => setPaymentDrafts((current) => ({ ...current, [contribution._id]: { ...current[contribution._id], mode: event.target.value } }))}
                            disabled={!["PENDING", "PARTIAL", "OVERDUE"].includes(contribution.status)}
                          >
                            <option value="CASH">Cash</option>
                            <option value="BANK_TRANSFER">Bank transfer</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="OTHER">Other</option>
                          </select>
                          <input
                            className={inputClass}
                            value={draft.note || ""}
                            onChange={(event) => setPaymentDrafts((current) => ({ ...current, [contribution._id]: { ...current[contribution._id], note: event.target.value } }))}
                            placeholder="Note or waiver reason"
                          />
                          <Button tone="success" onClick={() => recordOfflinePayment(contribution)} disabled={busyId === contribution._id || !["PENDING", "PARTIAL", "OVERDUE"].includes(contribution.status)}>
                            Record
                          </Button>
                          <Button tone="warning" onClick={() => waiveContribution(contribution)} disabled={busyId === contribution._id || ["PAID", "WAIVED"].includes(contribution.status)}>
                            Waive
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                  {contributions.length === 0 && <Empty text="No contributions found for the selected filters." />}
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FinanceAdmin;
