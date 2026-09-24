import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { apiConnector } from "../../services/apiConnector";
import { communityEndpoints } from "../../services/apis";
import {
  FiX,
  FiDownload,
  FiPrinter,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

export const generateCardImage = async (cardData, verificationUrl, formattedMemberId) => {
  const canvas = document.createElement("canvas");
  const width = 1000;
  const height = 620;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 1. Premium Ivory/Warm White Card Background & Clean Rounded Border
  const radius = 24;
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(0, 0, width, height, radius);
  } else {
    ctx.rect(0, 0, width, height);
  }
  ctx.clip();

  ctx.fillStyle = "#fafaf9"; // Warm ivory/white
  ctx.fillRect(0, 0, width, height);

  // Subtle forest green & gold border
  ctx.strokeStyle = "#14532d";
  ctx.lineWidth = 3;
  if (typeof ctx.roundRect === "function") {
    ctx.stroke(
      new Path2D(
        `M ${radius} 0 L ${width - radius} 0 Q ${width} 0 ${width} ${radius} L ${width} ${height - radius} Q ${width} ${height} ${width - radius} ${height} L ${radius} ${height} Q 0 ${height} 0 ${height - radius} L 0 ${radius} Q 0 0 ${radius} 0 Z`
      )
    );
  } else {
    ctx.strokeRect(0, 0, width, height);
  }
  ctx.restore();

  // Top Minimal Heritage Accent (Saffron -> White -> Green)
  ctx.fillStyle = "#ea580c"; // Saffron
  ctx.fillRect(320, 20, 120, 4);
  ctx.fillStyle = "#facc15"; // Gold
  ctx.fillRect(445, 20, 60, 4);
  ctx.fillStyle = "#16a34a"; // Green
  ctx.fillRect(510, 20, 120, 4);

  // Load and Draw Public Logo (logo.png)
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve;
      logoImg.src = "/logo.png";
    });

    // Logo background frame
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 1.5;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(40, 25, 75, 75, 10);
      ctx.fill();
      ctx.stroke();
    }
    ctx.drawImage(logoImg, 48, 33, 59, 59);
  } catch (e) {}

  // Header Organization Titles (Strictly as requested)
  ctx.textAlign = "left";
  ctx.font = "900 21px sans-serif";
  ctx.fillStyle = "#14532d"; // Forest green
  ctx.fillText("ADIVASI HALBA/HALBI SAMAJ", 132, 54);
  
  ctx.font = "bold 15px sans-serif";
  ctx.fillStyle = "#334155";
  ctx.fillText("KALYAN SAMITI, UJJAIN", 132, 78);

  // Subtle horizontal header line
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, 115);
  ctx.lineTo(width - 40, 115);
  ctx.stroke();

  // Load and draw Member Photograph
  const photoUrl =
    cardData.photo ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cardData.name || "Member")}`;

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
      img.src = photoUrl;
    });

    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 142, 185, 235);
    ctx.drawImage(img, 42, 144, 181, 231);
  } catch (e) {}

  // Center Member Information Section
  ctx.textAlign = "left";

  // NAME
  ctx.fillStyle = "#475569";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("NAME / नाम:", 255, 162);
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 27px sans-serif";
  ctx.fillText(cardData.name || "KRISHNA GOTHWAL", 255, 196);

  // MEMBER ID
  ctx.fillStyle = "#475569";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("MEMBER ID / आईडी:", 255, 236);
  ctx.fillStyle = "#ea580c"; // Brand accent color for ID
  ctx.font = "bold 22px monospace";
  ctx.fillText(formattedMemberId, 255, 268);

  // ISSUED DATE
  ctx.fillStyle = "#475569";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("ISSUED DATE / जारी तिथि:", 255, 312);
  ctx.fillStyle = "#334155";
  ctx.font = "15px sans-serif";
  const issueDate = cardData.issuedAt
    ? new Date(cardData.issuedAt).toLocaleDateString("en-IN")
    : "22/09/2026";
  ctx.fillText(issueDate, 255, 338);

  // Load and draw QR Code from API directly into Canvas
  try {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verificationUrl)}`;
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      qrImg.onload = resolve;
      qrImg.onerror = resolve;
      qrImg.src = qrApiUrl;
    });

    // QR Code Container Box
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(width - 240, 142, 195, 235, 10);
      ctx.fill();
      ctx.stroke();
    }

    ctx.drawImage(qrImg, width - 220, 155, 155, 155);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCAN TO VERIFY", width - 142, 335);

    ctx.fillStyle = "#64748b";
    ctx.font = "9px sans-serif";
    ctx.fillText("MEMBERSHIP VERIFICATION", width - 142, 352);
  } catch (e) {}

  // Bottom Footer Divider Line
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, 495);
  ctx.lineTo(width - 40, 495);
  ctx.stroke();

  // Bottom Identity Slogan ("समाज की पहचान, हमारा अधिकार")
  ctx.textAlign = "center";
  ctx.fillStyle = "#ea580c"; // Saffron highlight on "समाज"
  ctx.font = "bold 17px sans-serif";
  ctx.fillText("समाज", width / 2 - 120, 545);
  ctx.fillStyle = "#14532d";
  ctx.font = "bold 17px sans-serif";
  ctx.fillText("की पहचान, हमारा अधिकार", width / 2 + 15, 545);

  return canvas.toDataURL("image/png");
};

const MembershipCardModal = ({ isOpen, onClose }) => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchCard() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiConnector(
          "GET",
          communityEndpoints.MEMBERSHIP_CARD_API,
          null,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
          }
        );
        if (res?.data?.success && res?.data?.data?.card) {
          setCardData(res.data.data.card);
        } else {
          setError(res?.data?.message || "Failed to fetch membership card");
        }
      } catch (err) {
        console.error("Fetch card error:", err);
        setError(
          err?.response?.data?.message ||
            "Membership card is currently available only for approved ACTIVE members."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCard();
  }, [isOpen, token]);

  const handleDownloadCard = async () => {
    if (!cardData) return;
    try {
      setDownloading(true);
      const verificationUrl = cardData?.memberId
        ? `${window.location.origin}/verify-member/${cardData.memberId}`
        : `${window.location.origin}/verify-member/sample`;

      const formattedMemberId = cardData?.memberId
        ? `SMJ-${String(cardData.memberId).slice(-8).toUpperCase()}`
        : "SMJ-0C0C49DA";

      const imageBase64 = await generateCardImage(cardData, verificationUrl, formattedMemberId);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [148, 105],
      });

      pdf.addImage(imageBase64, "PNG", 4, 4, 140, 97);

      const cleanName = (cardData?.name || "Member").replace(/\s+/g, "_");
      pdf.save(`Adivasi_Halba_Halbi_Samaj_ID_${cleanName}.pdf`);
      toast.success("Membership card PDF downloaded successfully!");
    } catch (err) {
      console.error("Download card error:", err);
      toast.error("Failed to generate PDF. Try printing instead.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || typeof document === "undefined") return null;

  const verificationUrl = cardData?.memberId
    ? `${window.location.origin}/verify-member/${cardData.memberId}`
    : `${window.location.origin}/verify-member/sample`;

  const formattedMemberId = cardData?.memberId
    ? `SMJ-${String(cardData.memberId).slice(-8).toUpperCase()}`
    : "SMJ-0C0C49DA";

  return createPortal(
    <div className="fixed inset-0 z-[2600] flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto overflow-x-hidden ka-card p-4 sm:p-6 md:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] my-auto rounded-2xl border border-slate-700 bg-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 z-25 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 transition-all hover:bg-slate-700 hover:text-white cursor-pointer"
        >
          <FiX size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-4 sm:mb-6 flex items-center gap-3 pr-10">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <FiShield size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white truncate">
              Official Community Membership ID Card
            </h2>
            <p className="text-[11px] sm:text-xs text-emerald-400 font-medium truncate">Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain</p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-400 border-t-transparent" />
            <p className="text-xs text-slate-400">Generating premium membership card...</p>
          </div>
        ) : error || !cardData ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/5 p-6 sm:p-8 text-center">
            <p className="text-sm font-bold text-red-400">{error || "Card not available."}</p>
            <p className="mt-2 text-xs text-slate-400">
              Official membership cards are generated automatically once your application is approved and verified by the Super Admin.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            {/* THE ENHANCED PREMIUM COMMUNITY CARD UI */}
            <div
              ref={cardRef}
              data-membership-card="true"
              className="w-full min-h-[330px] sm:min-h-[350px] rounded-2xl p-4 sm:p-6 relative overflow-hidden text-slate-900 shadow-2xl border-2 border-emerald-900/30 bg-[#fafaf9]"
            >
              {/* Top Header Section */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1.5px solid #cbd5e1",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1.5px solid #14532d",
                      backgroundColor: "#ffffff",
                      overflow: "hidden",
                    }}
                  >
                    <img src="/logo.png" alt="Samaj Logo" style={{ width: "38px", height: "38px", objectFit: "contain" }} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "13px",
                        fontWeight: "900",
                        textTransform: "uppercase",
                        color: "#14532d",
                        lineHeight: 1.2,
                        letterSpacing: "0.02em",
                      }}
                    >
                      ADIVASI HALBA/HALBI SAMAJ
                    </h3>
                    <p
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        color: "#334155",
                        marginTop: "2px",
                      }}
                    >
                      KALYAN SAMITI, UJJAIN
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    borderRadius: "999px",
                    padding: "4px 10px",
                    fontSize: "9px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    color: "#15803d",
                    border: "1px solid #bbf7d0",
                    backgroundColor: "#f0fdf4",
                  }}
                >
                  <FiCheckCircle size={11} /> Verified Active
                </div>
              </div>

              {/* Card Body Grid Layout */}
              <div className="relative mt-4 sm:mt-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                {/* Member Photo & Details */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 flex-1 min-w-0 w-full sm:w-auto">
                  <div className="relative shrink-0 p-1 bg-white rounded-lg border-2 border-emerald-900/30 shadow-sm">
                    <img
                      src={
                        cardData.photo ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cardData.name || "Member")}`
                      }
                      alt={cardData.name}
                      crossOrigin="anonymous"
                      className="w-20 h-24 sm:w-24 sm:h-28 rounded object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Name / नाम</span>
                      <h4 className="text-base sm:text-lg font-black leading-tight truncate" style={{ color: "#0f172a" }}>
                        {cardData.name}
                      </h4>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Member ID / आईडी</span>
                      <p className="font-mono text-xs sm:text-sm font-extrabold text-orange-600">
                        {formattedMemberId}
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-500 mt-0.5">
                      <span className="font-semibold">Issued Date / जारी तिथि:</span>{" "}
                      <span className="text-slate-700">{cardData.issuedAt ? new Date(cardData.issuedAt).toLocaleDateString("en-IN") : "22/09/2026"}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Container UI */}
                <div className="flex flex-col items-center rounded-xl p-2.5 bg-white border border-slate-300 shadow-sm shrink-0 self-center sm:self-auto">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`}
                    alt="Verification QR"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded"
                  />
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-900 mt-1.5">
                    SCAN TO VERIFY
                  </span>
                  <span className="text-[7px] font-medium text-slate-500">
                    MEMBERSHIP VERIFICATION
                  </span>
                </div>
              </div>

              {/* Card Footer Tagline */}
              <div className="relative mt-4 sm:mt-5 flex items-center justify-center pt-3 border-t border-slate-200 text-center">
                <span className="text-[11px] font-extrabold text-slate-900 tracking-wide">
                  <span className="text-orange-600">समाज</span> की पहचान, हमारा अधिकार
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                onClick={handlePrint}
                className="btn-secondary !py-2.5 !px-4 !text-xs cursor-pointer justify-center"
              >
                <FiPrinter size={14} /> Print
              </button>

              <div className="flex items-center gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
                <button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="btn-primary !py-2.5 !px-5 !text-xs cursor-pointer disabled:opacity-50 justify-center"
                >
                  <FiDownload size={14} /> {downloading ? "Generating..." : "Download PDF"}
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary !py-2.5 !px-4 !text-xs cursor-pointer justify-center"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default MembershipCardModal;