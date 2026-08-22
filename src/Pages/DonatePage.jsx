import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiCheckCircle, FiCreditCard, FiHeart, FiLock, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnector";
import { paymentEndpoints } from "../services/apis";

const amountOptions = [501, 1100, 2100, 5100];

const formatCurrency = (value) => {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
  if (!value) return "Ongoing";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const DonatePage = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState(1100);
  const [anonymous, setAnonymous] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const selectedCampaignData = useMemo(() => {
    return campaigns.find((campaign) => campaign._id === selectedCampaign);
  }, [campaigns, selectedCampaign]);

  useEffect(() => {
    let mounted = true;

    const loadCampaigns = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiConnector("GET", paymentEndpoints.DONATION_CAMPAIGNS_API, null, null, {
          page: 1,
          limit: 12,
          ...(query.trim() ? { q: query.trim() } : {}),
        });
        if (!mounted) return;
        const nextCampaigns = response?.data?.data?.campaigns || [];
        setCampaigns(nextCampaigns);
        setSelectedCampaign((current) => current || nextCampaigns[0]?._id || "");
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Could not load donation campaigns.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCampaigns();
    return () => {
      mounted = false;
    };
  }, [query]);

  const donationPayload = {
    amount: Number(amount),
    campaign: selectedCampaign || undefined,
    donorName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    donorEmail: user?.email,
    donorPhone: user?.phoneNumber,
    anonymous,
    note,
  };

  const handleDonate = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Please login to donate securely.");
      navigate("/login");
      return;
    }

    if (!amount || Number(amount) < 1) {
      toast.error("Donation amount must be at least Rs. 1.");
      return;
    }

    setPaying(true);
    const toastId = toast.loading("Creating payment order...");

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error("Razorpay checkout could not be loaded.");
      }

      const response = await apiConnector(
        "POST",
        paymentEndpoints.CREATE_DONATION_ORDER_API,
        donationPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const data = response?.data?.data;
      if (!data?.order || !data?.key) {
        throw new Error("Payment order is incomplete.");
      }

      const checkout = new window.Razorpay({
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency || "INR",
        name: "Samaj Community",
        description: selectedCampaignData?.title || "Community donation",
        order_id: data.order.id,
        prefill: {
          name: donationPayload.donorName,
          email: donationPayload.donorEmail,
          contact: donationPayload.donorPhone,
        },
        notes: {
          campaign: selectedCampaign || "",
          donation: data.donation?._id || "",
        },
        theme: {
          color: "#10b981",
        },
        handler: () => {
          toast.success("Payment submitted. Receipt will update after bank confirmation.");
        },
        modal: {
          ondismiss: () => toast("Payment cancelled."),
        },
      });

      checkout.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Could not start donation payment.");
    } finally {
      toast.dismiss(toastId);
      setPaying(false);
    }
  };

  const progressPercent = selectedCampaignData?.goalAmount
    ? Math.min(100, Math.round((Number(selectedCampaignData.raisedAmount || 0) / Number(selectedCampaignData.goalAmount)) * 100))
    : 0;

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 pb-16 pt-28 text-[var(--text-primary)] sm:px-6 lg:px-8 transition-colors duration-300">
      <section className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <div className="mb-8 border-b border-[var(--border-subtle)] pb-8">
            <div className="eyebrow-badge mb-5">
              <FiHeart size={14} />
              <span>Support Samaj</span>
            </div>
            <h1 className="heading-hero text-[var(--text-primary)] mb-3">
              Donate to <span className="text-gradient">Community Campaigns</span>
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-secondary)] font-normal">
              Choose an active campaign, enter an amount, and complete payment through Razorpay. Final success is confirmed only after the secure payment webhook.
            </p>
          </div>

          <div className="mb-6 flex min-w-0 items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
            <FiSearch className="ml-2 shrink-0 text-[var(--text-muted)]" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search campaigns"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] border-none shadow-none focus:ring-0"
            />
          </div>

          {error ? (
            <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)]" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="ka-card p-12 text-center text-[var(--text-muted)]">
              No active donation campaigns are available right now.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {campaigns.map((campaign) => {
                const isSelected = selectedCampaign === campaign._id;
                const campaignProgress = campaign.goalAmount
                  ? Math.min(100, Math.round((Number(campaign.raisedAmount || 0) / Number(campaign.goalAmount)) * 100))
                  : 0;

                return (
                  <button
                    key={campaign._id}
                    type="button"
                    onClick={() => setSelectedCampaign(campaign._id)}
                    className={`ka-card p-0 text-left transition cursor-pointer ${
                      isSelected
                        ? "!border-[var(--accent-primary)] shadow-lg"
                        : "hover:border-[var(--accent-primary)]/40"
                    }`}
                  >
                    {campaign.coverImage?.url ? (
                      <div className="aspect-[16/8] bg-[var(--surface-elevated)] overflow-hidden">
                        <img src={campaign.coverImage.url} alt={campaign.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                      </div>
                    ) : null}
                    <div className="p-6">
                      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
                        <span>{formatDate(campaign.endDate)}</span>
                        {isSelected ? <FiCheckCircle className="text-[var(--accent-primary)]" size={18} /> : null}
                      </div>
                      <h2 className="text-xl font-bold leading-snug tracking-tight text-[var(--text-primary)]">{campaign.title}</h2>
                      <p className="mt-2 line-clamp-3 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">{campaign.description}</p>
                      {campaign.goalAmount ? (
                        <div className="mt-5">
                          <div className="mb-2 flex justify-between text-xs text-[var(--text-muted)]">
                            <span>{formatCurrency(campaign.raisedAmount)} raised</span>
                            <span>{formatCurrency(campaign.goalAmount)} goal</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-elevated)]">
                            <div className="h-full rounded-full bg-[var(--accent-primary)]" style={{ width: `${campaignProgress}%` }} />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <form onSubmit={handleDonate} className="ka-card p-6 sm:p-7 shadow-2xl">
            <div className="mb-5 flex items-start gap-3 border-b border-[var(--border-subtle)] pb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                <FiCreditCard size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Donation Details</h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Secure payment through Razorpay.</p>
              </div>
            </div>

            {selectedCampaignData ? (
              <div className="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent-primary)] font-bold">Selected campaign</p>
                <p className="mt-1 font-bold text-[var(--text-primary)] text-sm">{selectedCampaignData.title}</p>
                {selectedCampaignData.goalAmount ? (
                  <div className="mt-3">
                    <div className="mb-2 flex justify-between text-xs text-[var(--text-muted)]">
                      <span>{progressPercent}% funded</span>
                      <span>{formatCurrency(selectedCampaignData.raisedAmount)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                      <div className="h-full rounded-full bg-[var(--accent-primary)]" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Amount (INR)</label>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {amountOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAmount(option)}
                  className={`rounded-2xl border py-3 text-xs font-bold transition cursor-pointer ${
                    Number(amount) === option
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[#070707] shadow-md"
                      : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]/40"
                  }`}
                >
                  {formatCurrency(option)}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="ka-input mb-4"
              placeholder="Custom amount"
            />

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Note / Message</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="ka-input mb-4 resize-none"
              placeholder="Optional message"
            />

            <label className="mb-5 flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-3 text-xs font-medium text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
                className="h-4 w-4 accent-[var(--accent-primary)] rounded"
              />
              Donate anonymously
            </label>

            <button
              type="submit"
              disabled={paying}
              className="btn-primary w-full"
            >
              <FiLock size={16} />
              <span>{paying ? "Starting Payment" : `Donate ${formatCurrency(amount)}`}</span>
            </button>

            {!token ? (
              <p className="mt-4 text-center text-xs text-amber-500 font-medium">
                Login is required before creating a secure donation order.
              </p>
            ) : null}
          </form>
        </aside>
      </section>
    </main>
  );
};

export default DonatePage;
