import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiCheck,
  FiDownload,
  FiEye,
  FiFileText,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiX,
} from "react-icons/fi";
import { FaMoneyBillWave, FaReceipt, FaRupeeSign } from "react-icons/fa";
import { apiConnector } from "../../../../services/apiConnector";
import { familyContributionEndpoints } from "../../../../services/apis";
import ReceiptModal from "../../../Common/ReceiptModal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const statusStyles = {
  PAID: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  PAID_AHEAD: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  UP_TO_DATE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  DUE: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  PARTIAL: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  OVERDUE: "border-red-500/30 bg-red-500/10 text-red-300",
  ADVANCE: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  SUCCESS: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  FAILED: "border-red-500/30 bg-red-500/10 text-red-300",
};

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const compactStatus = (value) => String(value || "NA").replaceAll("_", " ");
const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};
const ymLabel = (year, month) => (year && month ? `${MONTH_NAMES[Number(month) - 1]} ${year}` : "—");
const memberName = (member) =>
  member?.name || [member?.firstName, member?.middleName, member?.lastName].filter(Boolean).join(" ").trim() || "Member";
const badgeClass = (status) =>
  `inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${statusStyles[status] || "border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)]"}`;
const generateReceipt = () => {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `FCR-CASH-${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
};

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
    {children}
  </label>
);

const FamilyContributionsAdmin = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const authConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, pages: 1 });
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    method: "ALL",
    month: "",
    year: "",
    fromDate: "",
    toDate: "",
  });

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const [isCashOpen, setIsCashOpen] = useState(false);
  const [cashFamilyId, setCashFamilyId] = useState("");
  const [cashQuote, setCashQuote] = useState(null);
  const [cashLoading, setCashLoading] = useState(false);
  const [cashForm, setCashForm] = useState({
    payerId: "",
    targetMonth: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
    amountRupees: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    collectorName: `${user?.firstName || "Admin"} ${user?.lastName || ""}`.trim(),
    receiptNumber: generateReceipt(),
    paymentReference: "",
    notes: "Offline family monthly contribution collected in cash.",
  });

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const selectedCashFamily = useMemo(
    () => accounts.find((item) => String(item.family?._id) === String(cashFamilyId)),
    [accounts, cashFamilyId]
  );

  useEffect(() => {
    if (!isCashOpen || !selectedCashFamily) return;
    const selectedMemberExists = (selectedCashFamily.members || []).some((member) => String(member._id) === String(cashForm.payerId));
    if (selectedMemberExists) return;
    const payer = selectedCashFamily.members?.find((m) => m.role === "FAMILY_ADMIN" || m.relationship === "SELF") || selectedCashFamily.members?.[0];
    setCashForm((cur) => ({ ...cur, payerId: payer?._id || "" }));
  }, [cashForm.payerId, isCashOpen, selectedCashFamily]);

  const fetchAccounts = useCallback(async (page = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.status !== "ALL") params.status = filters.status;
      if (filters.method !== "ALL") params.paymentMethod = filters.method;
      if (filters.month && filters.year) {
        params.month = filters.month;
        params.year = filters.year;
      }
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;

      const res = await apiConnector("GET", familyContributionEndpoints.ADMIN_ACCOUNTS_API, null, authConfig, params);
      if (res?.data?.success) {
        setAccounts(res.data.data.accounts || []);
        setMetrics(res.data.data.metrics || null);
        setPagination(res.data.data.pagination || res.data.data.meta || { page, limit: 30, total: 0, pages: 1 });
      }
    } catch (error) {
      console.error("Family contribution account load failed:", error);
      toast.error(error?.response?.data?.message || "Failed to load family contribution ledger");
    } finally {
      setLoading(false);
    }
  }, [authConfig, filters, token]);

  useEffect(() => {
    fetchAccounts(1);
  }, [fetchAccounts]);

  const openDetail = async (familyId) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await apiConnector("GET", familyContributionEndpoints.ADMIN_ACCOUNT_DETAIL_API(familyId), null, authConfig);
      if (res?.data?.success) setDetailData(res.data.data);
    } catch (error) {
      console.error("Family ledger detail failed:", error);
      toast.error(error?.response?.data?.message || "Failed to load detailed family ledger");
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCash = (account) => {
    const nextYear = account?.paidThrough?.nextDueYear || currentYear;
    const nextMonth = account?.paidThrough?.nextDueMonth || currentMonth;
    const payer = account?.members?.find((m) => m.role === "FAMILY_ADMIN" || m.relationship === "SELF") || account?.members?.[0];
    setCashFamilyId(account?.family?._id || "");
    setCashQuote(null);
    setCashForm({
      payerId: payer?._id || "",
      targetMonth: `${nextYear}-${String(nextMonth).padStart(2, "0")}`,
      amountRupees: "",
      paymentDate: new Date().toISOString().slice(0, 10),
      collectorName: `${user?.firstName || "Admin"} ${user?.lastName || ""}`.trim(),
      receiptNumber: generateReceipt(),
      paymentReference: "",
      notes: "Offline family monthly contribution collected in cash.",
    });
    setIsCashOpen(true);
  };

  const fetchCashQuote = useCallback(async () => {
    if (!isCashOpen || !cashFamilyId || !cashForm.targetMonth) return;
    const [year, month] = cashForm.targetMonth.split("-").map(Number);
    setCashLoading(true);
    try {
      const res = await apiConnector(
        "POST",
        familyContributionEndpoints.ADMIN_QUOTE_API(cashFamilyId),
        { toYear: year, toMonth: month },
        authConfig
      );
      if (res?.data?.success) {
        const quote = res.data.data.quote || res.data.data;
        setCashQuote(quote);
        setCashForm((cur) => ({ ...cur, amountRupees: quote.netPayableRupees || quote.grossPayableRupees || "" }));
      }
    } catch (error) {
      setCashQuote(null);
      toast.error(error?.response?.data?.message || "Unable to calculate covered months");
    } finally {
      setCashLoading(false);
    }
  }, [authConfig, cashFamilyId, cashForm.targetMonth, isCashOpen]);

  useEffect(() => {
    fetchCashQuote();
  }, [fetchCashQuote]);

  const submitCash = async (event) => {
    event.preventDefault();
    if (!cashFamilyId || !cashForm.payerId || !cashForm.amountRupees) {
      toast.error("Select family, paying member, and amount before confirming");
      return;
    }
    const [toYear, toMonth] = cashForm.targetMonth.split("-").map(Number);
    setCashLoading(true);
    try {
      const res = await apiConnector(
        "POST",
        familyContributionEndpoints.RECORD_CASH_API(cashFamilyId),
        {
          payerId: cashForm.payerId,
          amountRupees: Number(cashForm.amountRupees),
          toYear,
          toMonth,
          paymentDate: cashForm.paymentDate,
          collectorName: cashForm.collectorName,
          receiptNumber: cashForm.receiptNumber,
          paymentReference: cashForm.paymentReference || cashForm.receiptNumber,
          notes: cashForm.notes,
        },
        authConfig
      );
      if (res?.data?.success) {
        toast.success(`Cash contribution recorded. Receipt ${res.data.data.receiptNumber}`);
        setIsCashOpen(false);
        await fetchAccounts(pagination.page);
        if (res.data.data.payment?._id) await openReceipt(res.data.data.payment._id);
      }
    } catch (error) {
      console.error("Cash contribution failed:", error);
      toast.error(error?.response?.data?.message || "Failed to record cash contribution");
    } finally {
      setCashLoading(false);
    }
  };

  const reconcileAll = async () => {
    if (!window.confirm("Reconcile all active family contribution ledgers now?")) return;
    const id = toast.loading("Reconciling family ledgers...");
    try {
      const res = await apiConnector("POST", familyContributionEndpoints.RECONCILE_ALL_API, null, authConfig);
      toast.dismiss(id);
      toast.success(res?.data?.message || "Family ledgers reconciled");
      fetchAccounts(1);
    } catch (error) {
      toast.dismiss(id);
      toast.error(error?.response?.data?.message || "Reconciliation failed");
    }
  };

  const openReceipt = async (paymentId) => {
    const id = toast.loading("Loading receipt...");
    try {
      const res = await apiConnector("GET", familyContributionEndpoints.GET_RECEIPT_API(paymentId), null, authConfig);
      toast.dismiss(id);
      if (res?.data?.success) {
        setSelectedReceipt(res.data.data.receipt);
        setIsReceiptOpen(true);
      }
    } catch (error) {
      toast.dismiss(id);
      toast.error(error?.response?.data?.message || "Failed to load receipt");
    }
  };

  const exportCsv = () => {
    const headers = [
      "Family", "Family Code", "Head", "Members", "Paid Through", "Next Due",
      "Total Paid", "Outstanding", "Advance", "Status", "Last Payment Date", "Last Method",
    ];
    const rows = accounts.map((account) => [
      account.family?.familyName,
      account.family?.familyId || account.family?.familyCode,
      account.currentHeadName,
      (account.members || []).map((m) => `${m.name} (${m.relationship})`).join("; "),
      account.paidThrough?.display,
      account.paidThrough?.nextDueDisplay,
      account.totalPaidRupees,
      account.totalOutstandingRupees,
      account.advanceCreditRupees,
      account.statusLabel,
      formatDate(account.lastPayment?.paymentDate),
      account.lastPayment?.paymentMethod,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `family_contribution_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const kpis = [
    { label: "Total Families", value: metrics?.totalFamilies ?? metrics?.totalAccounts, tone: "border-l-cyan-400", hint: "Contribution accounts" },
    { label: "Active Families", value: metrics?.activeFamilies, tone: "border-l-emerald-400", hint: "Verified active" },
    { label: "Up-to-Date", value: metrics?.upToDateFamilies, tone: "border-l-green-400", hint: "No pending dues" },
    { label: "Pending Dues", value: metrics?.pendingFamilies, tone: "border-l-amber-400", hint: "Balance due" },
    { label: "Overdue", value: metrics?.overdueFamilies ?? metrics?.overdueCount, tone: "border-l-red-400", hint: "Needs follow-up" },
    { label: "Total Collected", value: formatMoney(metrics?.totalCollectedRupees), tone: "border-l-emerald-400", hint: "Lifetime verified" },
    { label: "Outstanding", value: formatMoney(metrics?.totalOutstandingRupees), tone: "border-l-orange-400", hint: "Principal + fines" },
    { label: "Advance Credit", value: formatMoney(metrics?.totalAdvanceCreditRupees), tone: "border-l-cyan-400", hint: "Prepaid balance" },
    { label: "This Month", value: formatMoney(metrics?.currentMonthCollectionRupees), tone: "border-l-sky-400", hint: `${metrics?.currentMonthPaymentCount || 0} payments` },
    { label: "Collection %", value: `${metrics?.collectionPercentage ?? 0}%`, tone: "border-l-green-400", hint: "Paid vs payable" },
  ];

  return (
    <div className="w-full space-y-6 text-[var(--text-primary)]">
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
              <FaRupeeSign />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)]">Family Contribution Ledger</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Family-level dues, paid-through tracking, member payer visibility, cash collections, receipts, and audit-ready summaries.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => openCash(accounts[0] || null)} className="btn-primary !flex !items-center !gap-1.5 !px-4 !py-2 !text-xs">
              <FaMoneyBillWave size={13} />
              <span>Record Cash</span>
            </button>
            <button type="button" onClick={reconcileAll} className="btn-secondary !flex !items-center !gap-1.5 !px-3.5 !py-2 !text-xs">
              <FiRefreshCw size={13} />
              <span>Reconcile</span>
            </button>
            <button type="button" onClick={exportCsv} className="btn-secondary !flex !items-center !gap-1.5 !px-3.5 !py-2 !text-xs">
              <FiDownload size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map((item) => (
          <div key={item.label} className={`ka-card border-l-4 ${item.tone} p-4`}>
            <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">{item.label}</span>
            <strong className="mt-1 block text-xl font-black text-[var(--text-primary)] sm:text-2xl">{item.value ?? 0}</strong>
            <span className="text-[10px] text-[var(--text-muted)]">{item.hint}</span>
          </div>
        ))}
      </div>

      <div className="ka-card space-y-4 p-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
          <FiFilter size={13} />
          <span>Search & Filters</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          <div className="relative xl:col-span-2">
            <FiSearch className="absolute left-3 top-3 text-[var(--text-muted)]" size={14} />
            <input
              value={filters.search}
              onChange={(e) => setFilters((cur) => ({ ...cur, search: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && fetchAccounts(1)}
              placeholder="Family, head, member, code, receipt, transaction"
              className="ka-input !h-10 !pl-9 !text-xs"
            />
          </div>
          <select value={filters.status} onChange={(e) => setFilters((cur) => ({ ...cur, status: e.target.value }))} className="ka-input !h-10 !text-xs">
            <option value="ALL">All Status</option>
            <option value="UP_TO_DATE">Paid / Up-to-date</option>
            <option value="PENDING">Due / Pending</option>
            <option value="OVERDUE">Overdue</option>
            <option value="ADVANCE">Advance</option>
          </select>
          <select value={filters.method} onChange={(e) => setFilters((cur) => ({ ...cur, method: e.target.value }))} className="ka-input !h-10 !text-xs">
            <option value="ALL">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="ONLINE">Online</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
          </select>
          <select value={filters.month} onChange={(e) => setFilters((cur) => ({ ...cur, month: e.target.value }))} className="ka-input !h-10 !text-xs">
            <option value="">Any Month</option>
            {MONTH_NAMES.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
          </select>
          <input type="number" value={filters.year} onChange={(e) => setFilters((cur) => ({ ...cur, year: e.target.value }))} placeholder="Year" className="ka-input !h-10 !text-xs" />
          <button type="button" onClick={() => fetchAccounts(1)} className="btn-primary !h-10 !text-xs">Apply</button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input type="date" value={filters.fromDate} onChange={(e) => setFilters((cur) => ({ ...cur, fromDate: e.target.value }))} className="ka-input !h-10 !text-xs" />
          <input type="date" value={filters.toDate} onChange={(e) => setFilters((cur) => ({ ...cur, toDate: e.target.value }))} className="ka-input !h-10 !text-xs" />
          <button
            type="button"
            onClick={() => setFilters({ search: "", status: "ALL", method: "ALL", month: "", year: "", fromDate: "", toDate: "" })}
            className="btn-secondary !h-10 !text-xs"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="ka-card p-4 xl:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-[var(--text-primary)]">
            <FiFileText className="text-emerald-300" />
            Monthly Collection Report
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(metrics?.monthlyReport || []).slice(0, 8).map((item) => (
              <div key={`${item.year}-${item.month}`} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
                <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">{item.label}</span>
                <strong className="mt-1 block text-sm text-emerald-300">{formatMoney(item.amountRupees)}</strong>
                <span className="text-[10px] text-[var(--text-muted)]">{item.count} payment(s)</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ka-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-[var(--text-primary)]">
            <FaMoneyBillWave className="text-cyan-300" />
            Cash vs Online
          </h3>
          <div className="space-y-2">
            {(metrics?.methodBreakdown || []).map((item) => (
              <div key={item.method} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-xs">
                <span className="font-bold uppercase text-[var(--text-secondary)]">{item.method}</span>
                <span className="font-black text-[var(--text-primary)]">{formatMoney(item.amountRupees)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ka-card overflow-hidden border border-[var(--border-subtle)]">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-xs text-[var(--text-muted)]">
            <FiRefreshCw className="animate-spin" />
            <span>Loading family contribution ledger...</span>
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-10 text-center">
            <FiAlertCircle className="mx-auto mb-2 text-2xl text-amber-300" />
            <p className="font-bold text-[var(--text-primary)]">No family records found</p>
            <p className="text-xs text-[var(--text-muted)]">Try clearing filters or reconcile active families.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-xs">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3">Family / Head / Members</th>
                  <th className="px-3 py-3">Monthly</th>
                  <th className="px-3 py-3">Paid Through</th>
                  <th className="px-3 py-3">Next Due</th>
                  <th className="px-3 py-3">Paid</th>
                  <th className="px-3 py-3">Outstanding</th>
                  <th className="px-3 py-3">Advance</th>
                  <th className="px-3 py-3">Last Payment</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {accounts.map((account) => (
                  <tr key={account._id} className="bg-[var(--surface)]/50 align-top transition hover:bg-[var(--surface-elevated)]">
                    <td className="px-4 py-4">
                      <div className="font-black text-[var(--text-primary)]">{account.family?.familyName || "Family"}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-emerald-300">{account.family?.familyId || account.family?.familyCode || account.familyCode}</div>
                      <div className="mt-2 text-[11px] text-[var(--text-muted)]">
                        Head: <span className="font-bold text-[var(--text-secondary)]">{account.currentHeadName || "Not assigned"}</span>
                      </div>
                      <div className="mt-2 flex max-w-lg flex-wrap gap-1">
                        {(account.members || []).slice(0, 4).map((member) => (
                          <span key={member._id} className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                            {member.name} · {member.relationship}
                          </span>
                        ))}
                        {(account.members || []).length > 4 && (
                          <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">+{account.members.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 font-black text-[var(--text-primary)]">{formatMoney(account.monthlyContributionRupees || 60)}</td>
                    <td className="px-3 py-4 text-[var(--text-secondary)]">{account.paidThrough?.display || "None"}</td>
                    <td className="px-3 py-4 font-bold text-amber-300">{account.paidThrough?.nextDueDisplay || "—"}</td>
                    <td className="px-3 py-4 font-black text-emerald-300">{formatMoney(account.totalPaidRupees)}</td>
                    <td className="px-3 py-4 font-black text-amber-300">{formatMoney(account.totalOutstandingRupees)}</td>
                    <td className="px-3 py-4 font-black text-cyan-300">{formatMoney(account.advanceCreditRupees)}</td>
                    <td className="px-3 py-4">
                      {account.lastPayment ? (
                        <div className="space-y-0.5">
                          <div className="font-bold text-[var(--text-primary)]">{formatMoney(account.lastPayment.amountRupees)}</div>
                          <div className="text-[10px] text-[var(--text-muted)]">{formatDate(account.lastPayment.paymentDate)}</div>
                          <div className="text-[10px] uppercase text-[var(--text-secondary)]">{account.lastPayment.paymentMethod} · {account.lastPayment.payerName}</div>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-4"><span className={badgeClass(account.statusLabel)}>{compactStatus(account.statusLabel)}</span></td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openDetail(account.family?._id)} className="btn-secondary !flex !items-center !gap-1 !px-2.5 !py-1.5 !text-[11px]">
                          <FiEye size={12} />
                          <span>Ledger</span>
                        </button>
                        <button type="button" onClick={() => openCash(account)} className="btn-primary !px-2.5 !py-1.5 !text-[11px]">Cash</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] p-3 text-xs text-[var(--text-muted)]">
          <span>Page {pagination.page} of {pagination.pages || 1} · {pagination.total || accounts.length} families</span>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => fetchAccounts(pagination.page - 1)} className="btn-secondary !px-3 !py-1.5 !text-xs disabled:opacity-40">Previous</button>
            <button disabled={pagination.page >= pagination.pages} onClick={() => fetchAccounts(pagination.page + 1)} className="btn-secondary !px-3 !py-1.5 !text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {isDetailOpen && (
        <div className="fixed inset-0 z-2000 flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm">
          <div className="my-6 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">Detailed Family Ledger</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {detailData?.family?.familyName || "Family"} · {detailData?.family?.familyCode || detailData?.family?.familyId || ""}
                </p>
              </div>
              <button type="button" onClick={() => setIsDetailOpen(false)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]">
                <FiX size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center gap-2 p-12 text-xs text-[var(--text-muted)]">
                <FiRefreshCw className="animate-spin" />
                <span>Loading complete ledger...</span>
              </div>
            ) : detailData && (
              <div className="space-y-5 overflow-y-auto p-4">
                <div className="grid gap-3 lg:grid-cols-4">
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 lg:col-span-2">
                    <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Family Members</div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {(detailData.members || []).map((member) => (
                        <div key={member._id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-3 text-xs">
                          <div className="font-black text-[var(--text-primary)]">{member.name}</div>
                          <div className="mt-0.5 text-[10px] uppercase text-[var(--text-muted)]">{member.relationship} · {member.memberId || "No ID"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                    <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">Paid Through</span>
                    <strong className="mt-2 block text-xl text-emerald-300">{ymLabel(detailData.reconciliation?.paidThroughYear, detailData.reconciliation?.paidThroughMonth)}</strong>
                    <span className="text-[10px] text-[var(--text-muted)]">Next due: {ymLabel(detailData.reconciliation?.nextDueYear, detailData.reconciliation?.nextDueMonth)}</span>
                  </div>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                    <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">Balance</span>
                    <strong className="mt-2 block text-xl text-amber-300">{formatMoney(detailData.reconciliation?.totalOutstandingRupees)}</strong>
                    <span className="text-[10px] text-cyan-300">Advance: {formatMoney(detailData.reconciliation?.advanceCreditRupees)}</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                  <table className="w-full min-w-[1040px] text-left text-xs">
                    <thead className="bg-[var(--surface-elevated)] text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                      <tr>
                        <th className="px-3 py-3">Month</th>
                        <th className="px-3 py-3">Amount Due</th>
                        <th className="px-3 py-3">Amount Paid</th>
                        <th className="px-3 py-3">Payment Date</th>
                        <th className="px-3 py-3">Method</th>
                        <th className="px-3 py-3">Receipt / Txn</th>
                        <th className="px-3 py-3">Paid By</th>
                        <th className="px-3 py-3">Adjustment</th>
                        <th className="px-3 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {(detailData.timeline || detailData.ledgerEntries || []).map((entry) => {
                        const firstPayment = entry.payments?.[0];
                        return (
                          <tr key={entry._id} className="align-top hover:bg-[var(--surface-elevated)]/60">
                            <td className="px-3 py-3 font-black text-[var(--text-primary)]">{ymLabel(entry.contributionYear, entry.contributionMonth)}</td>
                            <td className="px-3 py-3">{formatMoney(entry.amountDueRupees ?? entry.totalPayableRupees)}</td>
                            <td className="px-3 py-3 font-black text-emerald-300">{formatMoney(entry.amountPaidRupees ?? entry.allocatedRupees)}</td>
                            <td className="px-3 py-3 text-[var(--text-muted)]">{formatDate(firstPayment?.paymentDate, true)}</td>
                            <td className="px-3 py-3 uppercase">{firstPayment?.paymentMethod || "—"}</td>
                            <td className="px-3 py-3">
                              {firstPayment?._id ? (
                                <button type="button" onClick={() => openReceipt(firstPayment._id)} className="font-mono text-[10px] font-bold text-emerald-300 hover:underline">
                                  {firstPayment.receiptNumber || firstPayment.transactionId || "View Receipt"}
                                </button>
                              ) : "—"}
                            </td>
                            <td className="px-3 py-3">{firstPayment?.paidBy?.name || "—"}</td>
                            <td className="px-3 py-3">{entry.adjustmentRupees ? `Waived ${formatMoney(entry.adjustmentRupees)}` : "—"}</td>
                            <td className="px-3 py-3"><span className={badgeClass(entry.status)}>{compactStatus(entry.status)}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-black"><FaReceipt className="text-emerald-300" /> Online & Cash Payments</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-left text-xs">
                      <thead className="text-[10px] uppercase text-[var(--text-muted)]">
                        <tr>
                          <th className="py-2">Receipt</th>
                          <th className="py-2">Payer</th>
                          <th className="py-2">Amount</th>
                          <th className="py-2">Date / Time</th>
                          <th className="py-2">Method</th>
                          <th className="py-2">Transaction / Reference</th>
                          <th className="py-2">Collector</th>
                          <th className="py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)]">
                        {(detailData.payments || []).map((payment) => (
                          <tr key={payment._id}>
                            <td className="py-2 font-mono font-bold">{payment.receiptNumber || "—"}</td>
                            <td className="py-2">{payment.payerName || memberName(payment.payer)}</td>
                            <td className="py-2 font-black text-emerald-300">{formatMoney(payment.amountRupees)}</td>
                            <td className="py-2">{formatDate(payment.paymentDate, true)}</td>
                            <td className="py-2 uppercase">{payment.paymentMethod}</td>
                            <td className="py-2 font-mono text-[10px]">{payment.transactionId || "—"}</td>
                            <td className="py-2">{payment.collectorName || "—"}</td>
                            <td className="py-2 text-right">
                              {payment.status === "SUCCESS" && (
                                <button type="button" onClick={() => openReceipt(payment._id)} className="btn-secondary !px-2.5 !py-1 !text-[10px]">View Receipt</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isCashOpen && (
        <div className="fixed inset-0 z-2000 flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm">
          <div className="my-6 w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">Record Cash Contribution</h3>
                <p className="text-xs text-[var(--text-muted)]">Authoritative month coverage and balances are calculated by the backend.</p>
              </div>
              <button type="button" onClick={() => setIsCashOpen(false)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={submitCash} className="grid gap-4 p-4 md:grid-cols-2">
              <Field label="Family">
                <select value={cashFamilyId} onChange={(e) => setCashFamilyId(e.target.value)} className="ka-input !h-10 !text-xs" required>
                  <option value="">Select family</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account.family?._id}>
                      {account.family?.familyName} ({account.family?.familyId || account.family?.familyCode})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Paying Family Member">
                <select value={cashForm.payerId} onChange={(e) => setCashForm((cur) => ({ ...cur, payerId: e.target.value }))} className="ka-input !h-10 !text-xs" required>
                  <option value="">Select payer</option>
                  {(selectedCashFamily?.members || []).map((member) => (
                    <option key={member._id} value={member._id}>{member.name} - {member.relationship}</option>
                  ))}
                </select>
              </Field>
              <Field label="Pay Until Month">
                <input type="month" value={cashForm.targetMonth} onChange={(e) => setCashForm((cur) => ({ ...cur, targetMonth: e.target.value }))} className="ka-input !h-10 !text-xs" required />
              </Field>
              <Field label="Amount Collected">
                <input type="number" min="1" value={cashForm.amountRupees} onChange={(e) => setCashForm((cur) => ({ ...cur, amountRupees: e.target.value }))} className="ka-input !h-10 !text-xs !font-black" required />
              </Field>

              {cashQuote && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs md:col-span-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <FiShield className="text-emerald-300" />
                    <strong className="text-emerald-300">Backend Quote:</strong>
                    <span>{cashQuote.monthCount || 0} month(s)</span>
                    <span>· Principal {formatMoney(cashQuote.totalPrincipalRupees)}</span>
                    <span>· Fine {formatMoney(cashQuote.totalLateFineRupees)}</span>
                    <span>· Credit {formatMoney(cashQuote.availableCreditRupees)}</span>
                    <span>· Net {formatMoney(cashQuote.netPayableRupees)}</span>
                  </div>
                  {cashQuote.monthBreakdown?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {cashQuote.monthBreakdown.map((month) => (
                        <span key={month.ledgerId || `${month.year}-${month.month}`} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 text-[10px]">
                          {month.monthName} {month.year}: {formatMoney(month.totalRupees)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Field label="Payment Date">
                <input type="date" value={cashForm.paymentDate} onChange={(e) => setCashForm((cur) => ({ ...cur, paymentDate: e.target.value }))} className="ka-input !h-10 !text-xs" required />
              </Field>
              <Field label="Collector / Staff Name">
                <input value={cashForm.collectorName} onChange={(e) => setCashForm((cur) => ({ ...cur, collectorName: e.target.value }))} className="ka-input !h-10 !text-xs" required />
              </Field>
              <Field label="Receipt Number">
                <input value={cashForm.receiptNumber} onChange={(e) => setCashForm((cur) => ({ ...cur, receiptNumber: e.target.value }))} className="ka-input !h-10 !font-mono !text-xs" required />
              </Field>
              <Field label="Reference ID">
                <input value={cashForm.paymentReference} onChange={(e) => setCashForm((cur) => ({ ...cur, paymentReference: e.target.value }))} className="ka-input !h-10 !text-xs" placeholder="Optional cash book / UPI ref" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Notes">
                  <textarea rows={3} value={cashForm.notes} onChange={(e) => setCashForm((cur) => ({ ...cur, notes: e.target.value }))} className="ka-input !min-h-[84px] !resize-none !py-2 !text-xs" />
                </Field>
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--border-subtle)] pt-4 md:col-span-2">
                <button type="button" onClick={() => setIsCashOpen(false)} className="btn-secondary !px-4 !py-2 !text-xs">Cancel</button>
                <button type="submit" disabled={cashLoading} className="btn-primary !flex !items-center !gap-1.5 !px-5 !py-2 !text-xs disabled:opacity-50">
                  {cashLoading ? <FiRefreshCw className="animate-spin" /> : <FiCheck />}
                  <span>{cashLoading ? "Saving..." : "Confirm Collection"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ReceiptModal isOpen={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} receipt={selectedReceipt} />
    </div>
  );
};

export default FamilyContributionsAdmin;
