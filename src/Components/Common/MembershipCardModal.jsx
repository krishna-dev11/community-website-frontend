import React, { useEffect, useState, useRef } from "react";
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

  if (!isOpen) return null;

  const verificationUrl = cardData?.memberId
    ? `${window.location.origin}/verify-member/${cardData.memberId}`
    : `${window.location.origin}/verify-member/sample`;

  const formattedMemberId = cardData?.memberId
    ? `SMJ-${String(cardData.memberId).slice(-8).toUpperCase()}`
    : "SMJ-MEMBER";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl ka-card p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <FiX size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            <FiShield size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Official Digital Membership Card
            </h2>
            <p className="text-xs text-[var(--accent-primary)] font-medium">Samaj Community Verified Identity</p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-[var(--accent-primary)] border-t-transparent" />
            <p className="text-xs text-[var(--text-secondary)]">Generating secure membership card credential...</p>
          </div>
        ) : error || !cardData ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/5 p-8 text-center">
            <p className="text-sm font-bold text-red-400">{error || "Card not available."}</p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              Official membership cards are generated automatically once your application is approved and verified by the Super Admin.
            </p>
          </div>
        ) : (
          <div>
            {/* THE DIGITAL MEMBERSHIP CARD */}
            <div
              ref={cardRef}
              data-membership-card="true"
              style={{
                width: "100%",
                minHeight: "310px",
                backgroundColor: "#07140e",
                backgroundImage: "linear-gradient(135deg, #0d221a 0%, #06140e 60%, #030a07 100%)",
                border: "2px solid #00DFA5",
                borderRadius: "16px",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
                color: "#ffffff",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
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
              <div
                style={{
                  position: "relative",
                  marginTop: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                {/* Member Details */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flex: 1 }}>
                  {/* Member Photo */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <img
                      src={
                        cardData.photo ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cardData.name || "Member")}`
                      }
                      alt={cardData.name}
                      crossOrigin="anonymous"
                      style={{
                        width: "90px",
                        height: "90px",
                        borderRadius: "14px",
                        objectFit: "cover",
                        border: "2px solid #00DFA5",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-6px",
                        right: "-6px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        backgroundColor: "#00DFA5",
                        color: "#000000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1.5px solid #07140e",
                      }}
                    >
                      <FiUserCheck size={12} />
                    </div>
                  </div>

                  <div style={{ textAlign: "left", display: "flex", flexDirection: "col", gap: "4px" }}>
                    <h4 style={{ fontSize: "17px", fontWeight: "900", color: "#ffffff", lineHeight: 1.2 }}>
                      {cardData.name}
                    </h4>
                    <p
                      style={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#00DFA5",
                        marginTop: "2px",
                      }}
                    >
                      {formattedMemberId}
                    </p>

                    {cardData.family?.familyName && (
                      <p style={{ fontSize: "11px", color: "#d1d5db", marginTop: "4px" }}>
                        Family: <strong style={{ color: "#ffffff", fontWeight: "700" }}>{cardData.family.familyName}</strong>
                      </p>
                    )}

                    <div style={{ display: "flex", gap: "8px", fontSize: "10px", color: "#9ca3af", marginTop: "6px" }}>
                      <span>Issued: {cardData.issuedAt ? new Date(cardData.issuedAt).toLocaleDateString("en-IN") : "Active"}</span>
                      <span>•</span>
                      <span style={{ color: "#6ee7b7", fontWeight: "600" }}>Lifetime Validity</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Container */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRadius: "12px",
                    padding: "8px",
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(0, 223, 165, 0.5)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ width: "76px", height: "76px" }}>
                    <QRCode
                      value={verificationUrl}
                      size={76}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 76 76`}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "8px",
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#000000",
                      marginTop: "4px",
                    }}
                  >
                    Scan To Verify
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div
                style={{
                  position: "relative",
                  marginTop: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "10px",
                  borderTop: "1px solid rgba(0, 223, 165, 0.25)",
                  fontSize: "9px",
                  color: "#9ca3af",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#00DFA5" }}>
                  <FiShield size={10} /> Digital Credential Standard
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: "700",
                    letterSpacing: "0.08em",
                    color: "#00DFA5",
                  }}
                >
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
    </div>
  );
};

export default MembershipCardModal;
