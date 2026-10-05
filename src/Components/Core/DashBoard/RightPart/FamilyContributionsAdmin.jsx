import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiFileText,
  FiRefreshCw,
  FiUsers,
  FiX,
  FiEye,
  FiSettings,
  FiDollarSign,
  FiShield,
  FiSliders,
  FiCheck,
} from "react-icons/fi";
import { FaRupeeSign, FaReceipt, FaMoneyBillWave, FaHandHoldingUsd } from "react-icons/fa";
import { apiConnector } from "../../../../services/apiConnector";
import { familyContributionEndpoints } from "../../../../services/apis";
import ReceiptModal from "../../../Common/ReceiptModal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const FamilyContributionsAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token]
  );

  // States
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paginationMeta, setPaginationMeta] = useState({ page: 1, limit: 30, total: 0, pages: 1 });

  // Detail Modal
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Record Cash Payment Modal
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashFamily, setCashFamily] = useState(null);
  const [cashTarget, setCashTarget] = useState("");
  const [cashQuote, setCashQuote] = useState(null);
  const [quotingCash, setQuotingCash] = useState(false);
  const [recordingCash, setRecordingCash] = useState(false);
  const [cashForm, setCashForm] = useState({
    amount: "",
    receiptNumber: "",
    notes: "",
  });

  // Waive Fine Modal / State
  const [waivingFine, setWaivingFine] = useState(false);
  const [waiveEntry, setWaiveEntry] = useState(null);
  const [waiveReason, setWaiveReason] = useState("");
  const [isWaiveModalOpen, setIsWaiveModalOpen] = useState(false);

  // Rate Settings Modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [rateSettings, setRateSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    amountRupees: 60,
    lateFineRupees: 2,
    dueDayEnd: 10,
    lateFineEnabled: true,
    effectiveFromYear: new Date().getFullYear(),
    effectiveFromMonth: new Date().getMonth() + 1,
    description: "",
  });

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Reconcile Action State
  const [reconcilingId, setReconcilingId] = useState(null);
  const [reconcilingAll, setReconcilingAll] = useState(false);

  // 1. Fetch Accounts List & Summary
  const fetchAccounts = useCallback(async (page = 1) => {
    if (!token) return;
    try {
      setLoading(true);
      const params = {
        page,
        limit: 30,
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;

      const res = await apiConnector(
        "GET",
        familyContributionEndpoints.ADMIN_ACCOUNTS_API,
        null,
        authConfig,
        params
      );

      if (res?.data?.success) {
        setAccounts(res.data.data.accounts || []);
        setMetrics(res.data.data.metrics || null);
        if (res.data.data.pagination) {
          setPaginationMeta(res.data.data.pagination);
        }
      }
    } catch (err) {
      console.error("Error fetching family accounts:", err);
      toast.error(err?.response?.data?.message || "Failed to load family contribution accounts");
    } finally {
      setLoading(false);
    }
  }, [token, authConfig, searchQuery, statusFilter]);

  useEffect(() => {
    fetchAccounts(1);
  }, [fetchAccounts]);

  // 2. Open Family Detail Modal
  const handleOpenDetail = async (familyId) => {
    setSelectedFamilyId(familyId);
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await apiConnector(
        "GET",
        familyContributionEndpoints.ADMIN_ACCOUNT_DETAIL_API(familyId),
        null,
        authConfig
      );
      if (res?.data?.success) {
        setDetailData(res.data.data);
      }
    } catch (err) {
      console.error("Error loading account detail:", err);
      toast.error(err?.response?.data?.message || "Failed to load family detail");
    } finally {
      setLoadingDetail(false);
    }
  };

  // 3. Open Cash Payment Modal
  const handleOpenCashModal = (familyAccount) => {
    setCashFamily(familyAccount);
    const nextY = familyAccount.paidThrough?.nextDueYear || new Date().getFullYear();
    const nextM = familyAccount.paidThrough?.nextDueMonth || new Date().getMonth() + 1;
    setCashTarget(`${nextY}-${nextM}`);
    setCashForm({
      amount: "",
      receiptNumber: `CASH-${Date.now().toString().slice(-6)}`,
      notes: "Offline monthly contribution collected in cash.",
    });
    setIsCashModalOpen(true);
  };

  // Fetch Quote for Cash Payment
  useEffect(() => {
    if (!isCashModalOpen || !cashFamily || !cashTarget) return;

    const [yStr, mStr] = cashTarget.split("-");
    const toYear = parseInt(yStr, 10);
    const toMonth = parseInt(mStr, 10);

    const getQuote = async () => {
      try {
        setQuotingCash(true);
        const res = await apiConnector(
          "POST",
          familyContributionEndpoints.GET_QUOTE_API,
          { toYear, toMonth, familyId: cashFamily.family?._id },
          authConfig
        );
        if (res?.data?.success) {
          setCashQuote(res.data.data);
          setCashForm((prev) => ({
            ...prev,
            amount: res.data.data.netPayableRupees || "",
          }));
        }
      } catch (err) {
        console.error("Error fetching quote for cash:", err);
      } finally {
        setQuotingCash(false);
      }
    };

    getQuote();
  }, [isCashModalOpen, cashFamily, cashTarget, authConfig]);

  // Submit Cash Payment
  const handleSubmitCash = async (e) => {
    e.preventDefault();
    if (!cashFamily || !cashTarget || !cashForm.amount) {
      toast.error("Please fill all required cash payment fields");
      return;
    }

    const [yStr, mStr] = cashTarget.split("-");
    const toYear = parseInt(yStr, 10);
    const toMonth = parseInt(mStr, 10);

    try {
      setRecordingCash(true);
      const res = await apiConnector(
        "POST",
        familyContributionEndpoints.RECORD_CASH_API(cashFamily.family?._id),
        {
          amountRupees: Number(cashForm.amount),
          toYear,
          toMonth,
          receiptNumber: cashForm.receiptNumber,
          notes: cashForm.notes,
        },
        authConfig
      );

      if (res?.data?.success) {
        toast.success("Offline cash payment recorded and allocated successfully!");
        setIsCashModalOpen(false);
        fetchAccounts(paginationMeta.page);
        if (selectedFamilyId === cashFamily.family?._id) {
          handleOpenDetail(selectedFamilyId);
        }
      }
    } catch (err) {
      console.error("Error recording cash payment:", err);
      toast.error(err?.response?.data?.message || "Failed to record cash payment");
    } finally {
      setRecordingCash(false);
    }
  };

  // 4. Open Waive Fine Modal
  const handleOpenWaiveModal = (entry) => {
    setWaiveEntry(entry);
    setWaiveReason("");
    setIsWaiveModalOpen(true);
  };

  // Submit Fine Waiver
  const handleSubmitWaiveFine = async (e) => {
    e.preventDefault();
    if (!waiveEntry || !waiveReason.trim() || !selectedFamilyId) {
      toast.error("Please provide a valid documented reason for fine waiver");
      return;
    }

    try {
      setWaivingFine(true);
      const res = await apiConnector(
        "POST",
        familyContributionEndpoints.WAIVE_FINE_API(selectedFamilyId),
        {
          year: waiveEntry.contributionYear,
          month: waiveEntry.contributionMonth,
          reason: waiveReason.trim(),
        },
        authConfig
      );

      if (res?.data?.success) {
        toast.success("Late fine waived and audited successfully!");
        setIsWaiveModalOpen(false);
        handleOpenDetail(selectedFamilyId);
        fetchAccounts(paginationMeta.page);
      }
    } catch (err) {
      console.error("Error waiving fine:", err);
      toast.error(err?.response?.data?.message || "Failed to waive late fine");
    } finally {
      setWaivingFine(false);
    }
  };

  // 5. Open Settings Modal
  const handleOpenSettings = async () => {
    setIsSettingsModalOpen(true);
    try {
      const res = await apiConnector(
        "GET",
        familyContributionEndpoints.GET_SETTINGS_API,
        null,
        authConfig
      );
      if (res?.data?.success) {
        const cfg = res.data.data.activeConfig;
        setRateSettings(res.data.data);
        if (cfg) {
          setSettingsForm({
            amountRupees: cfg.amountRupees || cfg.amount || 60,
            lateFineRupees: cfg.lateFineAmountRupees || 2,
            dueDayEnd: cfg.dueDayEnd || 10,
            lateFineEnabled: cfg.lateFineEnabled !== false,
            effectiveFromYear: new Date().getFullYear(),
            effectiveFromMonth: new Date().getMonth() + 1,
            description: cfg.description || "",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      toast.error("Failed to load contribution settings");
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await apiConnector(
        "POST",
        familyContributionEndpoints.UPDATE_SETTINGS_API,
        settingsForm,
        authConfig
      );

      if (res?.data?.success) {
        toast.success("Contribution rate configuration updated!");
        setIsSettingsModalOpen(false);
        fetchAccounts(paginationMeta.page);
      }
    } catch (err) {
      console.error("Error updating settings:", err);
      toast.error(err?.response?.data?.message || "Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // 6. Single Family Reconcile
  const handleReconcileSingle = async (familyId) => {
    setReconcilingId(familyId);
    try {
      const res = await apiConnector(
        "POST",
        familyContributionEndpoints.RECONCILE_FAMILY_API(familyId),
        null,
        authConfig
      );
      if (res?.data?.success) {
        toast.success("Family account ledger reconciled!");
        fetchAccounts(paginationMeta.page);
        if (selectedFamilyId === familyId) {
          handleOpenDetail(familyId);
        }
      }
    } catch (err) {
      console.error("Reconciliation failed:", err);
      toast.error("Reconciliation failed");
    } finally {
      setReconcilingId(null);
    }
  };

  // 7. Bulk Reconcile All
  const handleReconcileAll = async () => {
    if (!window.confirm("Are you sure you want to reconcile all active family contribution ledgers? This will recompute all paid-through statuses.")) {
      return;
    }
    setReconcilingAll(true);
    try {
      const res = await apiConnector(
        "POST",
        familyContributionEndpoints.RECONCILE_ALL_API,
        null,
        authConfig
      );
      if (res?.data?.success) {
        toast.success(`Successfully reconciled ${res.data.data.reconciledCount} family accounts!`);
        fetchAccounts(1);
      }
    } catch (err) {
      console.error("Bulk reconcile failed:", err);
      toast.error("Bulk reconcile failed");
    } finally {
      setReconcilingAll(false);
    }
  };

  // View Receipt Modal
  const handleViewReceipt = async (paymentId) => {
    const toastId = toast.loading("Loading receipt...");
    try {
      const res = await apiConnector(
        "GET",
        familyContributionEndpoints.GET_RECEIPT_API(paymentId),
        null,
        authConfig
      );
      toast.dismiss(toastId);
      if (res?.data?.success) {
        setSelectedReceipt(res.data.data.receipt);
        setIsReceiptModalOpen(true);
      }
    } catch (err) {
      toast.dismiss(toastId);
      console.error("Receipt load failed:", err);
      toast.error("Failed to load receipt");
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-[var(--text-primary)]">
      {/* Top Controls & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Family Contribution <span className="text-gradient">Ledger</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Automated family-level recurring contributions (₹60/month). Continuous paid-through tracking with zero gaps.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleOpenSettings}
            className="btn-secondary !py-2 !px-3.5 !text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FiSettings size={13} />
            <span>Rate Settings</span>
          </button>

          <button
            type="button"
            onClick={handleReconcileAll}
            disabled={reconcilingAll}
            className="btn-secondary !py-2 !px-3.5 !text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Bulk recompute all family ledgers"
          >
            <FiRefreshCw size={13} className={reconcilingAll ? "animate-spin" : ""} />
            <span>Reconcile All</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="ka-card p-4 border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Total Families
          </span>
          <div className="mt-1 text-2xl font-black text-[var(--text-primary)]">
            {metrics?.totalAccounts || 0}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Active registered</span>
        </div>

        <div className="ka-card p-4 border-l-4 border-l-green-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Up to Date
          </span>
          <div className="mt-1 text-2xl font-black text-green-400">
            {metrics?.upToDate || 0}
          </div>
          <span className="text-[10px] text-green-500/80">No pending dues</span>
        </div>

        <div className="ka-card p-4 border-l-4 border-l-red-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Overdue
          </span>
          <div className="mt-1 text-2xl font-black text-red-400">
            {metrics?.overdue || 0}
          </div>
          <span className="text-[10px] text-red-500/80">Action required</span>
        </div>

        <div className="ka-card p-4 border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Total Outstanding
          </span>
          <div className="mt-1 text-2xl font-black text-amber-400">
            ₹{metrics?.totalOutstandingRupees || 0}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Principal + Fines</span>
        </div>

        <div className="ka-card p-4 border-l-4 border-l-purple-500 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Advance Credits
          </span>
          <div className="mt-1 text-2xl font-black text-purple-400">
            ₹{metrics?.totalAdvanceCreditRupees || 0}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Pre-paid balance</span>
        </div>
      </div>

      {/* Search & Status Tabs */}
      <div className="ka-card p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { key: "ALL", label: "All" },
            { key: "UP_TO_DATE", label: "Up to Date" },
            { key: "OVERDUE", label: "Overdue" },
            { key: "IN_ADVANCE", label: "In Advance" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
                statusFilter === tab.key
                  ? "bg-[var(--accent-primary)] text-slate-950 shadow-sm"
                  : "border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3.5 top-3 text-[var(--text-muted)]" size={14} />
          <input
            type="text"
            placeholder="Search Family Code or Head..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
      </div>

      {/* Main Family Accounts Table */}
      <div className="ka-card overflow-hidden border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-secondary)]">
            <thead className="bg-[var(--surface-elevated)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">Family / Head</th>
                <th className="py-3 px-3">Village / City</th>
                <th className="py-3 px-3">Paid Through</th>
                <th className="py-3 px-3">Next Due</th>
                <th className="py-3 px-3">Outstanding</th>
                <th className="py-3 px-3">Advance Credit</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    <FiRefreshCw className="animate-spin inline-block mr-2" />
                    Loading family contribution records...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[var(--text-muted)]">
                    No family accounts matched your filters.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => {
                  const isUpToDate = acc.statusCategory === "UP_TO_DATE";
                  const isOverdue = acc.statusCategory === "OVERDUE";
                  const isInAdvance = acc.statusCategory === "IN_ADVANCE";

                  let badgeColor = "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
                  if (isOverdue) badgeColor = "border-red-500/30 bg-red-500/10 text-red-400";
                  else if (isInAdvance) badgeColor = "border-purple-500/30 bg-purple-500/10 text-purple-400";

                  return (
                    <tr key={acc._id} className="hover:bg-[var(--surface)]/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--text-primary)]">
                          {acc.family?.familyName || "Samaj Family"}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 font-mono">
                          <span>{acc.family?.familyId || acc.family?.familyCode || "CODE-N/A"}</span>
                          <span>•</span>
                          <span className="text-[var(--text-secondary)] font-sans">
                            {acc.currentHead ? `${acc.currentHead.firstName} ${acc.currentHead.lastName || ""}` : "No Head Assigned"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-xs">
                        {acc.family?.village || acc.family?.city || "—"}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-emerald-400">
                          {acc.paidThrough?.paidThroughDisplay || "None"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`font-semibold ${isOverdue ? "text-red-400" : "text-sky-300"}`}>
                          {acc.paidThrough
                            ? `${MONTH_NAMES[acc.paidThrough.nextDueMonth - 1]?.slice(0, 3)} ${acc.paidThrough.nextDueYear}`
                            : "—"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-red-400">
                        ₹{acc.totalOutstandingRupees || 0}
                      </td>

                      <td className="py-3.5 px-3 font-bold text-purple-400">
                        ₹{acc.advanceCreditRupees || 0}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {acc.statusCategory ? acc.statusCategory.replace("_", " ") : "ACTIVE"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(acc.family?._id)}
                            className="btn-secondary !py-1 !px-2.5 !text-[11px] flex items-center gap-1 cursor-pointer"
                            title="View Month Ledger"
                          >
                            <FiEye size={12} />
                            <span>Ledger</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenCashModal(acc)}
                            className="btn-primary !py-1 !px-2.5 !text-[11px] flex items-center gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-500"
                            title="Record Cash Payment"
                          >
                            <FaRupeeSign size={10} />
                            <span>Cash</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReconcileSingle(acc.family?._id)}
                            disabled={reconcilingId === acc.family?._id}
                            className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition cursor-pointer disabled:opacity-50"
                            title="Recalculate Paid-Through"
                          >
                            <FiRefreshCw size={12} className={reconcilingId === acc.family?._id ? "animate-spin" : ""} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL 1: FAMILY DETAILED LEDGER
      ══════════════════════════════════════════════════════════════ */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface)]">
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)]">
                  {detailData?.family?.familyName || "Family"} Contribution Ledger
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Code: {detailData?.family?.familyId || detailData?.family?.familyCode} • Head: {detailData?.family?.head?.firstName || "Unassigned"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingDetail ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                  <FiRefreshCw className="animate-spin inline-block mr-2" />
                  Loading detailed history...
                </div>
              ) : (
                <>
                  {/* Status Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--surface)] p-3.5 rounded-xl border border-[var(--border-subtle)] text-xs">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Paid Through:</span>
                      <span className="text-sm font-black text-emerald-400">{detailData?.paidThrough?.paidThroughDisplay || "None"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Next Due:</span>
                      <span className="text-sm font-black text-sky-400">
                        {detailData?.paidThrough
                          ? `${MONTH_NAMES[detailData.paidThrough.nextDueMonth - 1]?.slice(0, 3)} ${detailData.paidThrough.nextDueYear}`
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Outstanding:</span>
                      <span className="text-sm font-black text-red-400">₹{detailData?.account?.outstandingTotalRupees || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Advance Credit:</span>
                      <span className="text-sm font-black text-purple-400">₹{detailData?.account?.advanceCreditRupees || 0}</span>
                    </div>
                  </div>

                  {/* Monthly Ledger Timeline */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                      Monthly Obligation Records ({detailData?.timeline?.length || 0})
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[var(--surface)] text-[10px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                          <tr>
                            <th className="py-2.5 px-3">Month</th>
                            <th className="py-2.5 px-3">Principal</th>
                            <th className="py-2.5 px-3">Fine</th>
                            <th className="py-2.5 px-3">Total Payable</th>
                            <th className="py-2.5 px-3">Allocated</th>
                            <th className="py-2.5 px-3">Remaining</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                          {detailData?.timeline?.map((item) => (
                            <tr key={item._id} className="hover:bg-[var(--surface)]/40 transition">
                              <td className="py-2.5 px-3 font-bold text-[var(--text-primary)]">
                                {MONTH_NAMES[item.contributionMonth - 1]} {item.contributionYear}
                              </td>
                              <td className="py-2.5 px-3">₹{item.contributionAmountRupees}</td>
                              <td className="py-2.5 px-3 text-red-400">
                                {item.lateFineAmountRupees > 0 ? `+ ₹${item.lateFineAmountRupees}` : "—"}
                                {item.waivedFineRupees > 0 && (
                                  <span className="text-[10px] text-emerald-400 block font-normal">(Waived ₹{item.waivedFineRupees})</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">₹{item.totalPayableRupees}</td>
                              <td className="py-2.5 px-3 font-semibold text-emerald-400">₹{item.allocatedRupees}</td>
                              <td className="py-2.5 px-3 font-black text-amber-400">₹{item.remainingRupees}</td>
                              <td className="py-2.5 px-3">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                                  item.status === "PAID" || item.status === "PAID_AHEAD"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                    : item.status === "OVERDUE"
                                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {item.lateFineAmountRupees > 0 && item.waivedFineRupees === 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenWaiveModal(item)}
                                    className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 text-[10px] font-bold uppercase cursor-pointer"
                                  >
                                    Waive Fine
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment History */}
                  {detailData?.payments && detailData.payments.length > 0 && (
                    <div className="pt-3 border-t border-[var(--border-subtle)]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                        Payment Receipts ({detailData.payments.length})
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[var(--surface)] text-[10px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                            <tr>
                              <th className="py-2 px-3">Receipt No</th>
                              <th className="py-2 px-3">Date</th>
                              <th className="py-2 px-3">Amount</th>
                              <th className="py-2 px-3">Method</th>
                              <th className="py-2 px-3">Status</th>
                              <th className="py-2 px-3 text-right">Receipt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-subtle)]">
                            {detailData.payments.map((p) => (
                              <tr key={p._id}>
                                <td className="py-2.5 px-3 font-mono font-bold text-[var(--text-primary)]">{p.receiptNumber}</td>
                                <td className="py-2.5 px-3">{p.receiptDate ? new Date(p.receiptDate).toLocaleDateString("en-IN") : "—"}</td>
                                <td className="py-2.5 px-3 font-bold text-emerald-400">₹{p.amountRupees}</td>
                                <td className="py-2.5 px-3 text-[10px] uppercase font-bold">{p.paymentMethod}</td>
                                <td className="py-2.5 px-3 text-emerald-400 font-bold">{p.status}</td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleViewReceipt(p._id)}
                                    className="btn-secondary !py-0.5 !px-2 !text-[10px]"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL 2: RECORD OFFLINE CASH PAYMENT
      ══════════════════════════════════════════════════════════════ */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface)]">
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)]">
                  Record Offline Cash Payment
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Family: {cashFamily?.family?.familyName} ({cashFamily?.family?.familyId})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCashModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitCash} className="p-6 space-y-4">
              {/* Target Month Selector */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Pay Until (Target Month):
                </label>
                <input
                  type="month"
                  value={cashTarget}
                  onChange={(e) => setCashTarget(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
                  required
                />
              </div>

              {/* Live Quote Breakdown */}
              {cashQuote && (
                <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs space-y-1">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Months Covered:</span>
                    <span className="font-bold text-[var(--text-primary)]">{cashQuote.monthCount} month(s)</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Principal Total:</span>
                    <span className="font-bold text-[var(--text-primary)]">₹{cashQuote.totalPrincipalRupees}</span>
                  </div>
                  {cashQuote.totalLateFineRupees > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Late Fines:</span>
                      <span className="font-bold">+ ₹{cashQuote.totalLateFineRupees}</span>
                    </div>
                  )}
                  {cashQuote.availableCreditRupees > 0 && (
                    <div className="flex justify-between text-purple-400 font-semibold">
                      <span>Available Credit Offset:</span>
                      <span>- ₹{cashQuote.availableCreditRupees}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-baseline">
                    <span className="font-bold uppercase text-[var(--text-primary)]">Calculated Net Due:</span>
                    <span className="text-base font-black text-emerald-400">₹{cashQuote.netPayableRupees}</span>
                  </div>
                </div>
              )}

              {/* Amount Collected */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Amount Collected (₹):
                </label>
                <input
                  type="number"
                  min="1"
                  value={cashForm.amount}
                  onChange={(e) => setCashForm({ ...cashForm, amount: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
                  required
                />
              </div>

              {/* Receipt Number */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Offline Receipt Number:
                </label>
                <input
                  type="text"
                  value={cashForm.receiptNumber}
                  onChange={(e) => setCashForm({ ...cashForm, receiptNumber: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Notes / Reference:
                </label>
                <textarea
                  rows={2}
                  value={cashForm.notes}
                  onChange={(e) => setCashForm({ ...cashForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCashModalOpen(false)}
                  className="btn-secondary !py-2 !px-4 !text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingCash || quotingCash}
                  className="btn-primary !py-2 !px-5 !text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {recordingCash ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck size={14} />
                      <span>Confirm & Record</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL 3: WAIVE LATE FINE
      ══════════════════════════════════════════════════════════════ */}
      {isWaiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-black text-[var(--text-primary)]">
              Waive Late Fine
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Month: {MONTH_NAMES[waiveEntry?.contributionMonth - 1]} {waiveEntry?.contributionYear} • Fine: ₹{waiveEntry?.lateFineAmountRupees}
            </p>

            <form onSubmit={handleSubmitWaiveFine} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Reason for Waiver (Mandatory for Audit Trail):
                </label>
                <textarea
                  rows={3}
                  value={waiveReason}
                  onChange={(e) => setWaiveReason(e.target.value)}
                  placeholder="e.g. Medical hardship, committee approved exemption..."
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWaiveModalOpen(false)}
                  className="btn-secondary !py-2 !px-4 !text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={waivingFine || !waiveReason.trim()}
                  className="btn-primary !py-2 !px-5 !text-xs cursor-pointer disabled:opacity-50"
                >
                  {waivingFine ? "Waiving..." : "Confirm Waiver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL 4: CONTRIBUTION RATE SETTINGS
      ══════════════════════════════════════════════════════════════ */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface)]">
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)]">
                  Contribution Rate & Fine Configuration
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Configures Samaj-wide baseline rules. All arithmetic stored in paise.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Monthly Contribution (₹):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settingsForm.amountRupees}
                    onChange={(e) => setSettingsForm({ ...settingsForm, amountRupees: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Late Fine per Month (₹):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settingsForm.lateFineRupees}
                    onChange={(e) => setSettingsForm({ ...settingsForm, lateFineRupees: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Due Day Grace Period End (Day of Month, e.g. 10):
                </label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={settingsForm.dueDayEnd}
                  onChange={(e) => setSettingsForm({ ...settingsForm, dueDayEnd: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Reason / Revision Description:
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.description}
                  onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                  placeholder="e.g. Annual general body meeting rate revision..."
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="btn-secondary !py-2 !px-4 !text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="btn-primary !py-2 !px-5 !text-xs cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? "Saving Settings..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default FamilyContributionsAdmin;
