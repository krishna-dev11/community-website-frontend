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
  FiUserCheck,
} from "react-icons/fi";
import QRCode from "react-qr-code";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

export const generateCardImage = async (cardData, verificationUrl, formattedMemberId) => {
  const canvas = document.createElement("canvas");
  const width = 1000;
  const height = 580;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 1. Background gradient & rounded rectangle
  const radius = 28;
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(0, 0, width, height, radius);
  } else {
    ctx.rect(0, 0, width, height);
  }
  ctx.clip();

  // Background
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, "#0e241c");
  bgGradient.addColorStop(0.5, "#07140e");
  bgGradient.addColorStop(1, "#030a07");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative glow
  const glow = ctx.createRadialGradient(width - 100, 100, 10, width - 100, 100, 350);
  glow.addColorStop(0, "rgba(0, 223, 165, 0.25)");
  glow.addColorStop(1, "rgba(0, 223, 165, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = "#00DFA5";
  ctx.lineWidth = 4;
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

  // Header separator line
  ctx.strokeStyle = "rgba(0, 223, 165, 0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 120);
  ctx.lineTo(width - 40, 120);
  ctx.stroke();

  // Seal box
  ctx.fillStyle = "rgba(245, 158, 11, 0.25)";
  ctx.strokeStyle = "rgba(251, 191, 36, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(40, 30, 60, 60, 12);
  } else {
    ctx.rect(40, 30, 60, 60);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ॐ", 70, 72);

  // Header text
  ctx.textAlign = "left";
  ctx.font = "900 22px sans-serif";
  ctx.fillStyle = "#fbbf24";
  ctx.fillText("SHRI SAMAJ COMMUNITY TRUST", 120, 58);

  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#00DFA5";
  ctx.fillText("OFFICIAL VERIFIED IDENTITY CARD", 120, 84);

  // Active Badge
  ctx.fillStyle = "rgba(0, 223, 165, 0.15)";
  ctx.strokeStyle = "rgba(0, 223, 165, 0.5)";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(width - 160, 42, 120, 36, 18);
  } else {
    ctx.rect(width - 160, 42, 120, 36);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#6ee7b7";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("✓ ACTIVE", width - 100, 65);

  // Load and draw member photo
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

    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(40, 155, 160, 160, 20);
    } else {
      ctx.rect(40, 155, 160, 160);
    }
    ctx.clip();
    ctx.drawImage(img, 40, 155, 160, 160);
    ctx.restore();

    ctx.strokeStyle = "#00DFA5";
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(40, 155, 160, 160, 20);
    } else {
      ctx.rect(40, 155, 160, 160);
    }
    ctx.stroke();
  } catch (e) {}

  // Details
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 30px sans-serif";
  ctx.fillText(cardData.name || "Community Member", 230, 205);

  ctx.fillStyle = "#00DFA5";
  ctx.font = "bold 18px monospace";
  ctx.fillText(formattedMemberId, 230, 245);

  if (cardData.family?.familyName) {
    ctx.fillStyle = "#d1d5db";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Family: ${cardData.family.familyName}`, 230, 285);
  }

  ctx.fillStyle = "#9ca3af";
  ctx.font = "14px sans-serif";
  const issueDate = cardData.issuedAt
    ? new Date(cardData.issuedAt).toLocaleDateString("en-IN")
    : "Active";
  ctx.fillText(`Issued: ${issueDate}  •  Lifetime Validity`, 230, 325);

  // Draw QR code
  const qrSvgEl = document.querySelector("[data-membership-card] svg");
  if (qrSvgEl) {
    try {
      const svgData = new XMLSerializer().serializeToString(qrSvgEl);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const qrImg = new Image();
      await new Promise((resolve) => {
        qrImg.onload = resolve;
        qrImg.onerror = resolve;
        qrImg.src = blobURL;
      });

      // White box for QR code
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(width - 230, 155, 190, 210, 16);
      } else {
        ctx.rect(width - 230, 155, 190, 210);
      }
      ctx.fill();

      ctx.drawImage(qrImg, width - 215, 170, 160, 160);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SCAN TO VERIFY", width - 135, 352);
      URL.revokeObjectURL(blobURL);
    } catch (e) {}
  }

  // Footer line
  ctx.strokeStyle = "rgba(0, 223, 165, 0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 500);
  ctx.lineTo(width - 40, 500);
  ctx.stroke();

  // Footer text
  ctx.textAlign = "left";
  ctx.fillStyle = "#00DFA5";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("🛡 Digital Credential Standard", 40, 540);

  ctx.textAlign = "right";
  ctx.font = "bold 14px monospace";
  ctx.fillText("SMJ-SECURITY-AUTHENTICATED", width - 40, 540);

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
        : "SMJ-MEMBER";

      const imageBase64 = await generateCardImage(cardData, verificationUrl, formattedMemberId);

      // Create PDF in standard landscape format (A6: 148mm x 105mm)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [148, 105],
      });

      // Fit the membership card neatly on the PDF
      pdf.addImage(imageBase64, "PNG", 4, 4, 140, 97);

      // Save PDF directly — most reliable cross-browser method
      const cleanName = (cardData?.name || "Member").replace(/\s+/g, "_");
      pdf.save(`Samaj_Membership_Card_${cleanName}.pdf`);
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
    : "SMJ-MEMBER";

  return createPortal(
    <div className="fixed inset-0 z-[2600] flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[94vh] overflow-y-auto overflow-x-hidden ka-card p-4 sm:p-6 md:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] my-auto rounded-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <FiX size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-4 sm:mb-6 flex items-center gap-3 pr-10">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            <FiShield size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-[var(--text-primary)] truncate">
              Official Digital Membership Card
            </h2>
            <p className="text-[11px] sm:text-xs text-[var(--accent-primary)] font-medium truncate">Samaj Community Verified Identity</p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-[var(--accent-primary)] border-t-transparent" />
            <p className="text-xs text-[var(--text-secondary)]">Generating secure membership card credential...</p>
          </div>
        ) : error || !cardData ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/5 p-6 sm:p-8 text-center">
            <p className="text-sm font-bold text-red-400">{error || "Card not available."}</p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              Official membership cards are generated automatically once your application is approved and verified by the Super Admin.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            {/* THE DIGITAL MEMBERSHIP CARD */}
            <div
              ref={cardRef}
              data-membership-card="true"
              className="w-full min-h-[300px] sm:min-h-[310px] rounded-2xl p-4 sm:p-6 relative overflow-hidden text-white shadow-2xl border-2 border-[#00DFA5]"
              style={{
                backgroundColor: "#07140e",
                backgroundImage: "linear-gradient(135deg, #0d221a 0%, #06140e 60%, #030a07 100%)",
              }}
            >
              {/* Decorative background glows */}
              <div
                style={{
                  position: "absolute",
                  right: "-60px",
                  top: "-60px",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  backgroundColor: "#00DFA5",
                  filter: "blur(60px)",
                  opacity: 0.25,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "-60px",
                  bottom: "-60px",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  backgroundColor: "#19C9C0",
                  filter: "blur(60px)",
                  opacity: 0.15,
                  pointerEvents: "none",
                }}
              />

              {/* Top Header */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "14px",
                  borderBottom: "1px solid rgba(0, 223, 165, 0.3)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* Samaj Logo / Seal */}
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(251, 191, 36, 0.7)",
                      background: "linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(0, 223, 165, 0.2))",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                  >
                    <span style={{ fontSize: "18px", fontWeight: "900", color: "#fbbf24" }}>ॐ</span>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "12px",
                        fontWeight: "900",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#fbbf24",
                        lineHeight: 1.2,
                      }}
                    >
                      SHRI SAMAJ COMMUNITY TRUST
                    </h3>
                    <p
                      style={{
                        fontSize: "9px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#00DFA5",
                        marginTop: "2px",
                      }}
                    >
                      Official Verified Identity Card
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    borderRadius: "999px",
                    padding: "4px 10px",
                    fontSize: "9px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#6ee7b7",
                    border: "1px solid rgba(0, 223, 165, 0.4)",
                    backgroundColor: "rgba(0, 223, 165, 0.15)",
                  }}
                >
                  <FiCheckCircle size={11} /> Active
                </div>
              </div>

              {/* Card Body */}
              <div className="relative mt-4 sm:mt-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-4">
                {/* Member Details & Photo */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                  {/* Member Photo */}
                  <div className="relative shrink-0">
                    <img
                      src={
                        cardData.photo ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cardData.name || "Member")}`
                      }
                      alt={cardData.name}
                      crossOrigin="anonymous"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#00DFA5] shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00DFA5] text-black flex items-center justify-center border-2 border-[#07140e]">
                      <FiUserCheck size={12} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-black text-white leading-tight truncate">
                      {cardData.name}
                    </h4>
                    <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#00DFA5]">
                      {formattedMemberId}
                    </p>

                    {cardData.family?.familyName && (
                      <p className="text-[11px] text-gray-300">
                        Family: <strong className="text-white font-bold">{cardData.family.familyName}</strong>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10px] text-gray-400 mt-1">
                      <span>Issued: {cardData.issuedAt ? new Date(cardData.issuedAt).toLocaleDateString("en-IN") : "Active"}</span>
                      <span>•</span>
                      <span className="text-emerald-300 font-semibold">Lifetime Validity</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center rounded-xl p-2 bg-white border border-[#00DFA5]/50 shadow-md shrink-0 self-center sm:self-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20">
                    <QRCode
                      value={verificationUrl}
                      size={76}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 76 76`}
                    />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-wider text-black mt-1">
                    Scan To Verify
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="relative mt-4 sm:mt-5 flex items-center justify-between pt-2.5 border-t border-[#00DFA5]/25 text-[9px] text-gray-400">
                <span className="flex items-center gap-1 text-[#00DFA5] font-semibold">
                  <FiShield size={10} /> Digital Credential Standard
                </span>
                <span className="font-mono font-bold tracking-wider text-[#00DFA5]">
                  SMJ-SECURITY-AUTHENTICATED
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handlePrint}
                className="btn-secondary !py-2.5 !px-4 !text-xs cursor-pointer"
              >
                <FiPrinter size={14} /> Print
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="btn-primary !py-2.5 !px-5 !text-xs cursor-pointer disabled:opacity-50"
                >
                  <FiDownload size={14} /> {downloading ? "Generating PDF..." : "Download PDF Card"}
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary !py-2.5 !px-4 !text-xs cursor-pointer"
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
