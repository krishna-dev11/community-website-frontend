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
    <main className="min-h-screen bg-[#071412] px-4 pb-16 pt-28 text-white sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <div className="mb-8 border-b border-white/10 pb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
              <FiHeart size={15} />
              Support Samaj
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
              Donate to Community Campaigns
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/65">
              Choose an active campaign, enter an amount, and complete payment through Razorpay. Final success is confirmed only after the secure payment webhook.
            </p>
          </div>

          <div className="mb-5 flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
            <FiSearch className="ml-2 shrink-0 text-white/45" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search campaigns"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/35"
            />
          </div>

          {error ? (
            <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse rounded-lg border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 px-6 py-12 text-center text-white/60">
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
                    className={`overflow-hidden rounded-lg border p-0 text-left transition ${
                      isSelected
                        ? "border-emerald-400/70 bg-emerald-500/10"
                        : "border-white/10 bg-white/[0.04] hover:border-white/25"
                    }`}
                  >
                    {campaign.coverImage?.url ? (
                      <div className="aspect-[16/8] bg-white/5">
                        <img src={campaign.coverImage.url} alt={campaign.title} className="h-full w-full object-cover" />
                      </div>
                    ) : null}
                    <div className="p-5">
                      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-white/45">
                        <span>{formatDate(campaign.endDate)}</span>
                        {isSelected ? <FiCheckCircle className="text-emerald-300" size={18} /> : null}
                      </div>
                      <h2 className="text-xl font-bold leading-snug tracking-normal text-white">{campaign.title}</h2>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/60">{campaign.description}</p>
                      {campaign.goalAmount ? (
                        <div className="mt-5">
                          <div className="mb-2 flex justify-between text-xs text-white/55">
                            <span>{formatCurrency(campaign.raisedAmount)} raised</span>
                            <span>{formatCurrency(campaign.goalAmount)} goal</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${campaignProgress}%` }} />
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
          <form onSubmit={handleDonate} className="rounded-lg border border-white/10 bg-white/[0.05] p-5 shadow-2xl">
            <div className="mb-5 flex items-start gap-3 border-b border-white/10 pb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-400 text-black">
                <FiCreditCard size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Donation Details</h2>
                <p className="mt-1 text-sm text-white/55">Secure payment through Razorpay.</p>
              </div>
            </div>

            {selectedCampaignData ? (
              <div className="mb-5 rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/35">Selected campaign</p>
                <p className="mt-2 font-bold text-white">{selectedCampaignData.title}</p>
                {selectedCampaignData.goalAmount ? (
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-xs text-white/55">
                      <span>{progressPercent}% funded</span>
                      <span>{formatCurrency(selectedCampaignData.raisedAmount)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <label className="mb-2 block text-sm font-semibold text-white/75">Amount</label>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {amountOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAmount(option)}
                  className={`rounded-lg border px-4 py-3 text-sm font-bold transition ${
                    Number(amount) === option
                      ? "border-emerald-400 bg-emerald-400 text-black"
                      : "border-white/10 bg-white/5 text-white hover:bg-white/10"
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
              className="mb-5 w-full rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
              placeholder="Custom amount"
            />

            <label className="mb-2 block text-sm font-semibold text-white/75">Note</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="mb-5 w-full resize-none rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400"
              placeholder="Optional message"
            />

            <label className="mb-5 flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
                className="h-4 w-4 accent-emerald-400"
              />
              Donate anonymously
            </label>

            <button
              type="submit"
              disabled={paying}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-black uppercase tracking-wider text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiLock size={16} />
              {paying ? "Starting Payment" : `Donate ${formatCurrency(amount)}`}
            </button>

            {!token ? (
              <p className="mt-4 text-center text-xs text-amber-100/80">
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
