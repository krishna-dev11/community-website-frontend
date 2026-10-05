import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCheck,
  FaCopy,
  FaCrown,
  FaSearch,
  FaTimes,
  FaUserPlus,
  FaHeartbeat,
  FaHistory,
  FaRedo,
  FaPlus,
} from "react-icons/fa";
import {
  FiUsers,
  FiPhone,
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiBookOpen,
  FiUser,
  FiTag,
  FiX,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiInfo,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { familyEndpoints } from "../../../../services/apis";

// ---------------------------------------------------------------------------
// Primitive components
// ---------------------------------------------------------------------------
const Input = ({ label, ...props }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
    <input {...props} className="ka-input !h-11 !py-0" />
  </label>
);

const Textarea = ({ label, ...props }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
    <textarea {...props} rows={3} className="ka-input !py-2.5 resize-none" />
  </label>
);

const Select = ({ label, children, ...props }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
    <select {...props} className="ka-input !h-11 !py-0">
      {children}
    </select>
  </label>
);

const Button = ({ children, tone = "neutral", icon: Icon, ...props }) => {
  const toneClasses = {
    neutral: "btn-secondary !py-2.5 !px-4 !text-xs",
    success: "btn-primary !py-2.5 !px-5 !text-xs",
    warning:
      "inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-bold text-xs uppercase tracking-wider px-4 py-2.5 transition-all hover:bg-amber-400/20 disabled:opacity-50 cursor-pointer",
    danger:
      "inline-flex items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 text-red-300 font-bold text-xs uppercase tracking-wider px-4 py-2.5 transition-all hover:bg-red-400/20 disabled:opacity-50 cursor-pointer",
    info:
      "inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-300 font-bold text-xs uppercase tracking-wider px-4 py-2.5 transition-all hover:bg-sky-400/20 disabled:opacity-50 cursor-pointer",
  };
  return (
    <button {...props} className={`${toneClasses[tone]} cursor-pointer`}>
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </button>
  );
};

const Stat = ({ label, value }) => (
  <div className="ka-card p-4">
    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
    <p className="mt-1 text-base font-bold text-[var(--text-primary)] truncate">
      {value || <span className="text-[var(--text-muted)] italic font-normal">Not set</span>}
    </p>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    UNDER_REVIEW: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    APPROVED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    REJECTED: "border-red-400/30 bg-red-400/10 text-red-300",
    REQUIRES_CORRECTION: "border-purple-400/30 bg-purple-400/10 text-purple-300",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${styles[status] || styles.PENDING}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Uploaded file preview (UI-only; does not change upload/submission behavior)
// ---------------------------------------------------------------------------
const FilePreview = ({ file, label = "Preview" }) => {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file || !file.type?.startsWith("image/")) {
      setPreviewUrl("");
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file) return null;

  if (file.type?.startsWith("image/") && previewUrl) {
    return (
      <div className="mt-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-2.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {label}
          </span>
          <span className="max-w-[65%] truncate text-[9px] text-[var(--text-secondary)]" title={file.name}>
            {file.name}
          </span>
        </div>
        <img
          src={previewUrl}
          alt={`${label}: ${file.name}`}
          className="block max-h-48 w-full rounded-lg border border-[var(--border-subtle)] bg-black/10 object-contain"
        />
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-2">
      <FiCheckCircle size={11} className="shrink-0 text-emerald-400" />
      <span className="min-w-0 truncate text-[10px] text-[var(--text-secondary)]" title={file.name}>
        {file.name}
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Request-type labels
// ---------------------------------------------------------------------------
const LIFECYCLE_TYPES = [
  { value: "REPORT_DEATH", label: "Report Death of Member" },
  { value: "HEAD_SUCCESSION", label: "Family Head Succession Request" },
  { value: "HEAD_TRANSFER", label: "Transfer Family Head Role" },
  { value: "MEMBER_TRANSFER", label: "Transfer Member to Another Family" },
  { value: "MARITAL_STATUS_CHANGE", label: "Marital Status Change (Marriage / Divorce)" },
  { value: "PROFILE_CORRECTION", label: "Profile / Name Correction" },
  { value: "ADDRESS_CHANGE", label: "Address Change" },
  { value: "FAMILY_SPLIT", label: "Family Split / Household Separation" },
];

const TYPE_ICONS = {
  REPORT_DEATH: "⚰️",
  HEAD_SUCCESSION: "👑",
  HEAD_TRANSFER: "🔄",
  MEMBER_TRANSFER: "🏠",
  MARITAL_STATUS_CHANGE: "💍",
  PROFILE_CORRECTION: "✏️",
  ADDRESS_CHANGE: "📍",
  FAMILY_SPLIT: "🏗️",
};

// ---------------------------------------------------------------------------
// Report Life Event Modal
// ---------------------------------------------------------------------------
const ReportLifeEventModal = ({ familyId, members, authConfig, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    type: "REPORT_DEATH",
    memberId: "",
    reason: "",
    data: {},
  });
  const [docFile, setDocFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateData = (key, value) => setForm((prev) => ({ ...prev, data: { ...prev.data, [key]: value } }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.type) { toast.error("Select an event type"); return; }
    if (!form.reason.trim()) { toast.error("Please provide a reason / description"); return; }
    setBusy(true);
    try {
      const payload = new FormData();
      payload.append("type", form.type);
      if (form.memberId) payload.append("memberId", form.memberId);
      payload.append("reason", form.reason);
      payload.append("data", JSON.stringify(form.data));
      if (docFile) payload.append("document", docFile);

      await apiConnector(
        "POST",
        familyEndpoints.SUBMIT_LIFECYCLE_REQUEST_API(familyId),
        payload,
        {
          ...authConfig,
          headers: { ...authConfig.headers, "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Life event request submitted for admin review");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to submit request");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Report a Life Event</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Submit for committee review. Documents will be verified.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-[var(--surface-elevated)] transition cursor-pointer">
            <FiX size={16} className="text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-5 grid gap-4">
          <Select label="Event Type" value={form.type} onChange={(e) => update("type", e.target.value)} required>
            {LIFECYCLE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{TYPE_ICONS[t.value]} {t.label}</option>
            ))}
          </Select>

          {/* Affected Member */}
          <Select
            label="Affected Member (optional)"
            value={form.memberId}
            onChange={(e) => update("memberId", e.target.value)}
          >
            <option value="">— Select member if applicable —</option>
            {members.map((m) => {
              const u = m.member;
              return (
                <option key={u?._id} value={u?._id}>
                  {u?.firstName} {u?.lastName} ({u?.memberId || "No ID"})
                </option>
              );
            })}
          </Select>

          {/* Type-specific extra fields */}
          {(form.type === "REPORT_DEATH") && (
            <Input
              label="Date of Death"
              type="date"
              value={form.data.dateOfDeath || ""}
              onChange={(e) => updateData("dateOfDeath", e.target.value)}
            />
          )}
          {(form.type === "HEAD_SUCCESSION" || form.type === "HEAD_TRANSFER") && (
            <Select
              label="Proposed New Head"
              value={form.data.proposedSuccessor || ""}
              onChange={(e) => updateData("proposedSuccessor", e.target.value)}
            >
              <option value="">— Select proposed successor —</option>
              {members.map((m) => {
                const u = m.member;
                return (
                  <option key={u?._id} value={u?._id}>
                    {u?.firstName} {u?.lastName} ({u?.memberId || "No ID"})
                  </option>
                );
              })}
            </Select>
          )}
          {form.type === "MEMBER_TRANSFER" && (
            <Input
              label="Target Family Code"
              placeholder="FAM-XXXXXX"
              value={form.data.targetFamilyCode || ""}
              onChange={(e) => updateData("targetFamilyCode", e.target.value)}
            />
          )}
          {form.type === "MARITAL_STATUS_CHANGE" && (
            <Select
              label="New Marital Status"
              value={form.data.maritalStatus || ""}
              onChange={(e) => updateData("maritalStatus", e.target.value)}
            >
              <option value="">— Select —</option>
              <option value="MARRIED">Married</option>
              <option value="DIVORCED">Divorced / Separated</option>
              <option value="WIDOWED">Widowed</option>
            </Select>
          )}

          <Textarea
            label="Description / Reason *"
            placeholder="Describe the event clearly. Include dates, names, and any relevant details."
            value={form.reason}
            onChange={(e) => update("reason", e.target.value)}
            required
          />

          {/* Document upload */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Supporting Document (Death Cert, Marriage Cert, etc.)
            </span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              className="ka-input !h-auto !py-2.5 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent-primary)] file:text-white file:text-[10px] file:font-bold file:px-3 file:py-1 file:cursor-pointer"
            />
            {docFile && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <FiCheckCircle size={10} /> {docFile.name}
              </span>
            )}
            <FilePreview file={docFile} label="Document Preview" />
          </label>

          <div className="flex gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <Button tone="neutral" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button tone="success" type="submit" disabled={busy} className="flex-1">
              {busy ? "Submitting…" : "Submit for Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Fix & Resubmit Modal (for REJECTED / REQUIRES_CORRECTION members)
// ---------------------------------------------------------------------------
const FixResubmitModal = ({ familyId, member, membership, authConfig, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    firstName: member?.firstName || "",
    lastName: member?.lastName || "",
    relationship: membership?.relationship || "",
    reason: "",
  });
  const [docFile, setDocFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => v && payload.append(k, v));
      if (docFile) payload.append("document", docFile);

      await apiConnector(
        "PUT",
        familyEndpoints.FIX_AND_RESUBMIT_MEMBER_API(familyId, member._id),
        payload,
        {
          ...authConfig,
          headers: { ...authConfig.headers, "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Resubmission sent to admin for review");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to resubmit");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Fix &amp; Resubmit</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Correct the details and resubmit for admin review.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-[var(--surface-elevated)] transition cursor-pointer">
            <FiX size={16} className="text-[var(--text-muted)]" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} required />
            <Input label="Last Name" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} required />
          </div>
          <Input label="Relationship to Head" value={form.relationship} onChange={(e) => setForm((p) => ({ ...p, relationship: e.target.value }))} placeholder="e.g. Son, Daughter, Spouse" />
          <Textarea label="Reason for Correction *" placeholder="Explain what was wrong and what you've corrected." value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} required />
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Updated Document (optional)</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              className="ka-input !h-auto !py-2.5 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent-primary)] file:text-white file:text-[10px] file:font-bold file:px-3 file:py-1 file:cursor-pointer"
            />
            <FilePreview file={docFile} label="Updated Document Preview" />
          </label>
          <div className="flex gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <Button tone="neutral" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button tone="success" type="submit" disabled={busy} className="flex-1">
              {busy ? "Submitting…" : "Resubmit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Add Member Modal (Newborn / Child / Spouse / Relative)
// ---------------------------------------------------------------------------
const AddMemberModal = ({ familyId, authConfig, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    relationship: "SON",
    gender: "MALE",
    dateOfBirth: "",
    contactNumber: "",
    email: "",
    temporaryPassword: "",
    identityNumber: "",
    isMinor: false,
    profession: "",
    education: "",
    gotra: "",
  });
  const [docFile, setDocFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const update = (field, val) => setForm((prev) => ({ ...prev, [field]: val }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    if (!docFile) {
      toast.error("Identity verification document (Aadhaar / Birth Certificate) is required");
      return;
    }
    if (!form.isMinor && !form.temporaryPassword) {
      toast.error("Temporary password is required for adult member setup");
      return;
    }

    setBusy(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          payload.append(k, v);
        }
      });
      payload.append("document", docFile);
      if (photoFile) payload.append("photo", photoFile);

      await apiConnector(
        "POST",
        familyEndpoints.ADD_FAMILY_MEMBER_API(familyId),
        payload,
        {
          ...authConfig,
          headers: { ...authConfig.headers, "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Family member added and submitted for committee verification!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add family member");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Add Family Member</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Add a newborn, child, spouse, or relative. Verification documents are required.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-[var(--surface-elevated)] transition cursor-pointer">
            <FiX size={16} className="text-[var(--text-muted)]" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name *"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
            <Input
              label="Last Name *"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Relationship *"
              value={form.relationship}
              onChange={(e) => update("relationship", e.target.value)}
              required
            >
              <option value="SPOUSE">Spouse (पति / पत्नी)</option>
              <option value="SON">Son (पुत्र)</option>
              <option value="DAUGHTER">Daughter (पुत्री)</option>
              <option value="FATHER">Father (पिता)</option>
              <option value="MOTHER">Mother (माता)</option>
              <option value="BROTHER">Brother (भाई)</option>
              <option value="SISTER">Sister (बहन)</option>
              <option value="GRANDFATHER">Grandfather (दादा / नाना)</option>
              <option value="GRANDMOTHER">Grandmother (दादी / नानी)</option>
              <option value="UNCLE">Uncle (चाचा / मामा)</option>
              <option value="AUNT">Aunt (चाची / मौसी / मामी)</option>
              <option value="OTHER">Other relative</option>
            </Select>

            <Select
              label="Gender *"
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              required
            >
              <option value="MALE">Male (पुरुष)</option>
              <option value="FEMALE">Female (महिला)</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>

          {/* Is Minor Checkbox */}
          <div className="rounded-2xl border border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/5 p-3.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isMinor}
                onChange={(e) => update("isMinor", e.target.checked)}
                className="h-4 w-4 rounded accent-[var(--accent-primary)]"
              />
              <span className="text-xs font-bold text-[var(--text-primary)]">
                नाबालिग सदस्य / नवजात शिशु (Minor or Newborn Child under 18)
              </span>
            </label>
            <p className="mt-1 text-[11px] text-[var(--text-muted)] pl-6">
              {form.isMinor
                ? "नाबालिगों के लिए ईमेल एवं पासवर्ड आवश्यक नहीं है। खाते का नियंत्रण मुख्य अभिभावक (Family Head) के पास रहेगा।"
                : "यदि सदस्य वयस्क (18+) हैं तो उनके लिए लॉगिन संपर्क व पासवर्ड दर्ज करें।"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
            />
            <Input
              label="SSSM / Aadhaar No."
              placeholder="12-digit Aadhaar / SSSM"
              value={form.identityNumber}
              onChange={(e) => update("identityNumber", e.target.value)}
            />
          </div>

          {!form.isMinor && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Contact Number"
                type="tel"
                placeholder="10-digit mobile"
                value={form.contactNumber}
                onChange={(e) => update("contactNumber", e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="member@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
          )}

          {!form.isMinor && (
            <Input
              label="Temporary Password *"
              type="text"
              placeholder="e.g. Member@123"
              value={form.temporaryPassword}
              onChange={(e) => update("temporaryPassword", e.target.value)}
              required={!form.isMinor}
            />
          )}

          <div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                पहचान या जन्म प्रमाण पत्र (Birth Cert / Aadhaar / Document) *
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                required
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                className="ka-input !h-auto !py-2 text-xs"
              />
              <FilePreview file={docFile} label="Identity Document Preview" />
            </label>
          </div>

          <div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                सदस्य फोटो (Photo - Optional)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="ka-input !h-auto !py-2 text-xs"
              />
              <FilePreview file={photoFile} label="Photo Preview" />
            </label>
          </div>

          <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" tone="success" disabled={busy}>
              {busy ? "Adding..." : "Add Member & Submit for Verification"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Nominate Successor Modal
// ---------------------------------------------------------------------------
const NominateSuccessorModal = ({ familyId, members, currentSuccessorId, authConfig, onClose, onSuccess }) => {
  const [selectedId, setSelectedId] = useState(currentSuccessorId || "");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await apiConnector(
        "PATCH",
        familyEndpoints.UPDATE_NOMINEE_API(familyId),
        { memberId: selectedId || null },
        authConfig
      );
      toast.success("Family successor nominee updated");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update nominee");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
              <FaCrown size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Designate Successor Nominee</h3>
              <p className="text-xs text-[var(--text-muted)]">उत्तराधिकारी / मुख्य वारिस का नामांकन</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-[var(--surface-elevated)] transition cursor-pointer">
            <FiX size={16} className="text-[var(--text-muted)]" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <p className="text-xs text-[var(--text-secondary)] leading-5">
            पारिवारिक मुखिया (Family Head) की अनुपस्थिति या देहावसान की स्थिति में यह नामांकित सदस्य स्वतः उत्तराधिकार हेतु प्रस्तावित हो जाएंगे।
          </p>

          <Select
            label="Select Nominee Member"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">— No nominee (Clear designation) —</option>
            {members.map((m) => {
              const u = m.member;
              if (m.role === "FAMILY_ADMIN") return null;
              return (
                <option key={u?._id} value={u?._id}>
                  {u?.firstName} {u?.lastName} ({u?.memberId || "Member"}) - {m.relationship}
                </option>
              );
            })}
          </Select>

          <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" tone="success" disabled={busy}>
              {busy ? "Saving..." : "Save Nominee Designation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main FamilyHub Component
// ---------------------------------------------------------------------------
const FamilyHub = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [familyState, setFamilyState] = useState({ family: null, membership: null, members: [] });
  const [joinRequests, setJoinRequests] = useState([]);
  const [lifecycleRequests, setLifecycleRequests] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [activeTab, setActiveTab] = useState("members");

  // Modals
  const [showLifecycleModal, setShowLifecycleModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showNomineeModal, setShowNomineeModal] = useState(false);
  const [fixResubmitTarget, setFixResubmitTarget] = useState(null); // { member, membership }

  // No-family state
  const [createForm, setCreateForm] = useState({ familyName: "", sssmId: "", state: "", currentCity: "", nativePlace: "" });
  const [search, setSearch] = useState({ q: "", familyCode: "", sssmId: "", state: "" });
  const [families, setFamilies] = useState([]);
  const [joinMessage, setJoinMessage] = useState({});

  const authConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }), [token]);

  const isFamilyAdmin = familyState.membership?.role === "FAMILY_ADMIN";
  const familyId = familyState.family?._id;

  // ------- loaders -------
  const loadMyFamily = async () => {
    setLoading(true);
    try {
      const response = await apiConnector("GET", familyEndpoints.MY_FAMILY_API, null, authConfig);
      const data = response.data?.data || {};
      setFamilyState({
        family: data.family || null,
        membership: data.membership || null,
        members: data.members || [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load family");
    } finally {
      setLoading(false);
    }
  };

  const loadJoinRequests = async () => {
    if (!familyId || !isFamilyAdmin) return;
    try {
      const response = await apiConnector("GET", familyEndpoints.FAMILY_JOIN_REQUESTS_API(familyId), null, authConfig);
      setJoinRequests(response.data?.data?.joinRequests || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load join requests");
    }
  };

  const loadLifecycleRequests = async () => {
    if (!familyId) return;
    try {
      const response = await apiConnector("GET", familyEndpoints.GET_FAMILY_LIFECYCLE_REQUESTS_API(familyId), null, authConfig);
      setLifecycleRequests(response.data?.data?.requests || []);
    } catch {
      // silently ignore
    }
  };

  useEffect(() => { loadMyFamily(); }, []);
  useEffect(() => { loadJoinRequests(); }, [familyId, isFamilyAdmin]);
  useEffect(() => { if (familyId) loadLifecycleRequests(); }, [familyId]);

  // ------- handlers -------
  const updateCreateForm = (key, value) => setCreateForm((c) => ({ ...c, [key]: value }));
  const updateSearch = (key, value) => setSearch((c) => ({ ...c, [key]: value }));

  const createFamily = async (e) => {
    e.preventDefault();
    setBusyId("create");
    try {
      await apiConnector("POST", familyEndpoints.CREATE_FAMILY_API, createForm, authConfig);
      toast.success("Family created");
      setCreateForm({ familyName: "", sssmId: "", state: "", currentCity: "", nativePlace: "" });
      await loadMyFamily();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create family");
    } finally { setBusyId(null); }
  };

  const searchFamilies = async (e) => {
    e.preventDefault();
    const params = Object.fromEntries(Object.entries(search).filter(([, v]) => v));
    if (!params.q && !params.familyCode && !params.sssmId) {
      toast.error("Search by family code, SSSM ID, or family name"); return;
    }
    setBusyId("search");
    try {
      const response = await apiConnector("GET", familyEndpoints.SEARCH_FAMILIES_API, null, authConfig, params);
      setFamilies(response.data?.data?.families || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to search families");
    } finally { setBusyId(null); }
  };

  const requestJoin = async (targetFamilyId) => {
    setBusyId(targetFamilyId);
    try {
      await apiConnector("POST", familyEndpoints.JOIN_FAMILY_API(targetFamilyId), { message: joinMessage[targetFamilyId] || undefined }, authConfig);
      toast.success("Join request sent");
      setJoinMessage((c) => ({ ...c, [targetFamilyId]: "" }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send join request");
    } finally { setBusyId(null); }
  };

  const reviewJoinRequest = async (requestId, action) => {
    setBusyId(requestId);
    try {
      await apiConnector("PATCH", familyEndpoints.REVIEW_FAMILY_JOIN_REQUEST_API(familyId, requestId), { action }, authConfig);
      toast.success("Join request reviewed");
      setJoinRequests((c) => c.filter((r) => r._id !== requestId));
      await loadMyFamily();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to review request");
    } finally { setBusyId(null); }
  };

  const transferAdmin = async (memberId) => {
    setBusyId(memberId);
    try {
      await apiConnector("PATCH", familyEndpoints.TRANSFER_FAMILY_ADMIN_API(familyId), { memberId }, authConfig);
      toast.success("Family admin transferred");
      await loadMyFamily();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to transfer admin");
    } finally { setBusyId(null); }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(familyState.family?.familyCode || "");
      toast.success("Family code copied");
    } catch { toast.error("Unable to copy code"); }
  };

  // ------- tab definitions -------
  const tabs = [
    { id: "members", label: "Members", icon: FiUsers },
    { id: "lifecycle", label: "Life Events", icon: FaHeartbeat },
    { id: "history", label: "Request History", icon: FaHistory },
  ];

  // ------- render -------
  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 text-[var(--text-primary)] md:px-6 transition-colors duration-300">
      {/* Modals */}
      {showLifecycleModal && (
        <ReportLifeEventModal
          familyId={familyId}
          members={familyState.members}
          authConfig={authConfig}
          onClose={() => setShowLifecycleModal(false)}
          onSuccess={loadLifecycleRequests}
        />
      )}
      {fixResubmitTarget && (
        <FixResubmitModal
          familyId={familyId}
          member={fixResubmitTarget.member}
          membership={fixResubmitTarget.membership}
          authConfig={authConfig}
          onClose={() => setFixResubmitTarget(null)}
          onSuccess={loadMyFamily}
        />
      )}
      {showAddMemberModal && (
        <AddMemberModal
          familyId={familyId}
          authConfig={authConfig}
          onClose={() => setShowAddMemberModal(false)}
          onSuccess={loadMyFamily}
        />
      )}
      {showNomineeModal && (
        <NominateSuccessorModal
          familyId={familyId}
          members={familyState.members}
          currentSuccessorId={familyState.family?.successorMemberId?._id || familyState.family?.successorMemberId}
          authConfig={authConfig}
          onClose={() => setShowNomineeModal(false)}
          onSuccess={loadMyFamily}
        />
      )}

      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Page header */}
        <div className="border-b border-[var(--border-subtle)] pb-6">
          <div className="eyebrow-badge mb-2">
            <FiUsers size={13} />
            <span>Household Registry</span>
          </div>
          <h1 className="heading-hero text-[var(--text-primary)]">Family <span className="text-gradient">Hub</span></h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
            Create a household, join an existing family, and manage your family record throughout life events.
          </p>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent" />
          </div>
        ) : familyState.family ? (
          <>
            {/* Family summary card */}
            <section className="ka-card p-4 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">{familyState.family.familyName}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                      {familyState.membership?.role}
                    </span>
                    <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {familyState.family.status}
                    </span>
                    {familyState.family.lifecycleStatus && familyState.family.lifecycleStatus !== "ACTIVE" && (
                      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        {familyState.family.lifecycleStatus?.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button icon={FaCopy} onClick={copyCode}>Copy Code</Button>
                  <Button tone="warning" icon={FaHeartbeat} onClick={() => { setActiveTab("lifecycle"); setShowLifecycleModal(true); }}>
                    Report Life Event
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-5">
                <Stat label="Family Code" value={familyState.family.familyCode} />
                <Stat label="SSSM ID" value={familyState.family.sssmId} />
                <Stat label="City" value={familyState.family.currentCity} />
                <Stat label="Native Place" value={familyState.family.nativePlace} />
                <Stat
                  label="Successor Nominee"
                  value={
                    familyState.family?.successorMemberId
                      ? `${familyState.family.successorMemberId.firstName || ""} ${familyState.family.successorMemberId.lastName || ""}`.trim() || "Designated"
                      : "None"
                  }
                />
              </div>
            </section>

            {/* Tabs */}
            <div className="flex gap-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  id={`family-tab-${tab.id}`}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[var(--accent-primary)] text-white shadow-md"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <tab.icon size={12} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB: Members */}
            {activeTab === "members" && (
              <div className="flex flex-col gap-6">
                {/* Join Requests — admin only */}
                {isFamilyAdmin && joinRequests.length > 0 && (
                  <section className="ka-card p-4 sm:p-6">
                    <div className="flex flex-col gap-1 border-b border-[var(--border-subtle)] pb-4">
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">Join Requests</h2>
                      <p className="text-xs text-[var(--text-muted)]">Approve verified members before they enter your household record.</p>
                    </div>
                    <div className="divide-y divide-[var(--border-subtle)]">
                      {joinRequests.map((request) => (
                        <div key={request._id} className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <img
                              src={request.requestedBy?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${request.requestedBy?.firstName || "Member"}`}
                              alt={`${request.requestedBy?.firstName || "Member"} profile`}
                              className="h-11 w-11 rounded-2xl border border-[var(--border-subtle)] object-cover shadow-sm"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[var(--text-primary)]">{request.requestedBy?.firstName} {request.requestedBy?.lastName}</p>
                              <p className="truncate text-xs text-[var(--text-muted)]">{request.message || request.requestedBy?.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 w-full md:w-64">
                            <Button tone="success" icon={FaCheck} disabled={busyId === request._id} onClick={() => reviewJoinRequest(request._id, "APPROVE")}>Approve</Button>
                            <Button tone="danger" icon={FaTimes} disabled={busyId === request._id} onClick={() => reviewJoinRequest(request._id, "REJECT")}>Reject</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Member cards */}
                <section className="ka-card p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">Household Members</h2>
                      <p className="text-xs text-[var(--text-muted)]">{familyState.members.length} members in this household record</p>
                    </div>
                    {isFamilyAdmin && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button tone="success" icon={FaUserPlus} onClick={() => setShowAddMemberModal(true)}>
                          Add Family Member
                        </Button>
                        <Button tone="neutral" icon={FaCrown} onClick={() => setShowNomineeModal(true)}>
                          Nominate Successor
                        </Button>
                      </div>
                    )}
                  </div>

                  {familyState.members.length === 0 ? (
                    <div className="py-12 text-center text-sm text-[var(--text-muted)]">
                      इस परिवार में अभी कोई अन्य सक्रिय सदस्य उपलब्ध नहीं है।
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      {familyState.members.map((membership) => {
                        const member = membership.member;
                        const details = member?.additionalDetails || {};
                        const fullName = `${member?.firstName || ""} ${member?.lastName || ""}`.trim();
                        const isHead = membership.role === "FAMILY_ADMIN";
                        const needsCorrection =
                          membership.verificationStatus === "REJECTED" ||
                          membership.verificationStatus === "REQUIRES_CORRECTION";

                        return (
                          <article
                            key={membership._id}
                            className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 sm:p-5 transition-all hover:border-[var(--border-strong)] shadow-sm flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="relative shrink-0">
                                    <img
                                      src={member?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || "Member")}`}
                                      alt={fullName}
                                      className="h-14 w-14 rounded-2xl border border-[var(--border-subtle)] object-cover shadow-sm"
                                    />
                                    {isHead && (
                                      <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black shadow-md border-2 border-[var(--surface-elevated)]" title="Family Admin">
                                        <FaCrown size={11} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="text-base font-bold text-[var(--text-primary)] truncate">{fullName}</h3>
                                    {member?.memberId && (
                                      <p className="text-[9px] font-mono font-bold tracking-widest text-[var(--accent-primary)] mt-0.5 opacity-80">{member.memberId}</p>
                                    )}
                                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                        isHead
                                          ? "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                                          : "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30"
                                      }`}>
                                        {isHead ? "Family Admin" : (membership.relationship || "Member")}
                                      </span>
                                      {membership.member?._id === (familyState.family?.successorMemberId?._id || familyState.family?.successorMemberId) && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                                          👑 Nominated Successor
                                        </span>
                                      )}
                                      {member?.accountStatus && (
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                                          member.accountStatus === "ACTIVE"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                            : member.accountStatus === "PENDING"
                                            ? "bg-amber-400/10 text-amber-300 border-amber-400/30"
                                            : "bg-red-400/10 text-red-400 border-red-400/30"
                                        }`}>
                                          {member.accountStatus === "PENDING" ? "Under Review" : member.accountStatus}
                                        </span>
                                      )}
                                      {membership?.verificationStatus && membership.verificationStatus !== "APPROVED" && (
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                                          membership.verificationStatus === "REJECTED" || membership.verificationStatus === "REQUIRES_CORRECTION"
                                            ? "bg-red-400/10 text-red-400 border-red-400/30"
                                            : "bg-sky-400/10 text-sky-400 border-sky-400/30"
                                        }`}>
                                          {membership.verificationStatus.replace(/_/g, " ")}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {isFamilyAdmin && !isHead && (
                                  <button
                                    onClick={() => transferAdmin(member?._id)}
                                    disabled={busyId === member?._id}
                                    className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-50 cursor-pointer shrink-0"
                                  >
                                    Make Admin
                                  </button>
                                )}
                              </div>

                              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                {member?.email && (
                                  <div className="flex items-center gap-2 text-[var(--text-secondary)] min-w-0">
                                    <FiMail className="text-[var(--text-muted)] shrink-0" size={13} />
                                    <span className="truncate" title={member.email}>{member.email}</span>
                                  </div>
                                )}
                                {details.contactNumber && (
                                  <div className="flex items-center gap-2 text-[var(--text-secondary)] min-w-0">
                                    <FiPhone className="text-[var(--text-muted)] shrink-0" size={13} />
                                    <span>{details.contactNumber}</span>
                                  </div>
                                )}
                                {details.profession && (
                                  <div className="flex items-center gap-2 text-[var(--text-secondary)] min-w-0">
                                    <FiBriefcase className="text-[var(--text-muted)] shrink-0" size={13} />
                                    <span className="truncate">Prof: <strong className="text-[var(--text-primary)] font-medium">{details.profession}</strong></span>
                                  </div>
                                )}
                                {details.education && (
                                  <div className="flex items-center gap-2 text-[var(--text-secondary)] min-w-0">
                                    <FiBookOpen className="text-[var(--text-muted)] shrink-0" size={13} />
                                    <span className="truncate">Edu: <strong className="text-[var(--text-primary)] font-medium">{details.education}</strong></span>
                                  </div>
                                )}
                                {details.currentCity && (
                                  <div className="flex items-center gap-2 text-[var(--text-secondary)] min-w-0">
                                    <FiMapPin className="text-[var(--text-muted)] shrink-0" size={13} />
                                    <span className="truncate">City: <strong className="text-[var(--text-primary)] font-medium">{details.currentCity}</strong></span>
                                  </div>
                                )}
                                {details.gotra && (
                                  <div className="flex items-center gap-2 text-[var(--text-secondary)] min-w-0">
                                    <FiTag className="text-[var(--text-muted)] shrink-0" size={13} />
                                    <span>Gotra: <strong className="text-[var(--text-primary)] font-medium">{details.gotra}</strong></span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Rejection note + Fix & Resubmit */}
                            {needsCorrection && membership.rejectionReason && (
                              <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/5 p-3">
                                <div className="flex items-start gap-2">
                                  <FiAlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Admin Feedback</p>
                                    <p className="mt-1 text-xs text-[var(--text-secondary)]">{membership.rejectionReason}</p>
                                  </div>
                                </div>
                                {isFamilyAdmin && (
                                  <Button
                                    tone="info"
                                    icon={FaRedo}
                                    className="mt-3 w-full !justify-center"
                                    onClick={() => setFixResubmitTarget({ member, membership })}
                                  >
                                    Fix &amp; Resubmit
                                  </Button>
                                )}
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

            {/* TAB: Lifecycle Event Form */}
            {activeTab === "lifecycle" && (
              <section className="ka-card p-4 sm:p-6">
                <div className="flex flex-col gap-1 border-b border-[var(--border-subtle)] pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">Report a Life Event</h2>
                      <p className="text-xs text-[var(--text-muted)]">Births, deaths, marriages, transfers — officially record changes to your family record.</p>
                    </div>
                    <Button tone="warning" icon={FaPlus} onClick={() => setShowLifecycleModal(true)}>New Request</Button>
                  </div>
                </div>

                {/* Info grid */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {LIFECYCLE_TYPES.map((t) => (
                    <button
                      key={t.value}
                      id={`lifecycle-btn-${t.value}`}
                      onClick={() => setShowLifecycleModal(true)}
                      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 text-left transition-all hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-primary)]/5 cursor-pointer group"
                    >
                      <div className="text-2xl mb-2">{TYPE_ICONS[t.value]}</div>
                      <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">{t.label}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-400/5 p-4 flex items-start gap-3">
                  <FiInfo size={14} className="text-sky-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-[var(--text-secondary)]">
                    All life event requests are reviewed by the Samaj administration committee. You will receive a notification once reviewed.
                    For urgent matters, please also contact the Samaj office directly. Rejection is never a dead end — you can resubmit with corrections.
                  </p>
                </div>
              </section>
            )}

            {/* TAB: Request History */}
            {activeTab === "history" && (
              <section className="ka-card p-4 sm:p-6">
                <div className="flex flex-col gap-1 border-b border-[var(--border-subtle)] pb-4">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Lifecycle Request History</h2>
                  <p className="text-xs text-[var(--text-muted)]">All life event requests submitted for this family.</p>
                </div>

                {lifecycleRequests.length === 0 ? (
                  <div className="py-12 text-center text-sm text-[var(--text-muted)]">No lifecycle requests yet. Use the Life Events tab to submit one.</div>
                ) : (
                  <div className="mt-4 divide-y divide-[var(--border-subtle)]">
                    {lifecycleRequests.map((req) => (
                      <div key={req._id} className="py-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="text-2xl shrink-0 mt-0.5">{TYPE_ICONS[req.type] || "📋"}</div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-[var(--text-primary)]">
                                {LIFECYCLE_TYPES.find((t) => t.value === req.type)?.label || req.type}
                              </p>
                              <StatusBadge status={req.status} />
                            </div>
                            <p className="text-[10px] font-mono text-[var(--text-muted)]">{req.requestId}</p>
                            {req.member && (
                              <p className="text-xs text-[var(--text-secondary)] mt-1">
                                Member: {req.member.firstName} {req.member.lastName}
                              </p>
                            )}
                            <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{req.reason}</p>
                            {req.adminReason && (
                              <div className="mt-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-2.5">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Admin Response</p>
                                <p className="text-xs text-[var(--text-secondary)]">{req.adminReason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] shrink-0">
                          <FiClock size={10} />
                          {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        ) : (
          /* No family: create or join */
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="ka-card p-4 sm:p-6">
              <div className="border-b border-[var(--border-subtle)] pb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Create Family</h2>
                <p className="text-xs text-[var(--text-muted)]">Start a new household record and become its family admin.</p>
              </div>
              <form onSubmit={createFamily} className="mt-5 grid gap-4">
                <Input label="Family Name" value={createForm.familyName} onChange={(e) => updateCreateForm("familyName", e.target.value)} placeholder="Sharma Family" required />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="SSSM ID" value={createForm.sssmId} onChange={(e) => updateCreateForm("sssmId", e.target.value)} placeholder="SSSM / family id" required />
                  <Input label="State" value={createForm.state} onChange={(e) => updateCreateForm("state", e.target.value)} placeholder="MP" required />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Current City" value={createForm.currentCity} onChange={(e) => updateCreateForm("currentCity", e.target.value)} placeholder="Ujjain" />
                  <Input label="Native Place" value={createForm.nativePlace} onChange={(e) => updateCreateForm("nativePlace", e.target.value)} placeholder="Indore" />
                </div>
                <Button tone="success" disabled={busyId === "create"}>Create Family</Button>
              </form>
            </section>

            <section className="ka-card p-4 sm:p-6">
              <div className="border-b border-[var(--border-subtle)] pb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Find Family</h2>
                <p className="text-xs text-[var(--text-muted)]">Search by family code, SSSM ID, or family name and request access.</p>
              </div>
              <form onSubmit={searchFamilies} className="mt-5 grid gap-4">
                <Input label="Family Code" value={search.familyCode} onChange={(e) => updateSearch("familyCode", e.target.value)} placeholder="FAM-123ABC" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="SSSM ID" value={search.sssmId} onChange={(e) => updateSearch("sssmId", e.target.value)} placeholder="SSSM / family id" />
                  <Input label="State" value={search.state} onChange={(e) => updateSearch("state", e.target.value)} placeholder="MP" />
                </div>
                <Input label="Family Name" value={search.q} onChange={(e) => updateSearch("q", e.target.value)} placeholder="Search by name" />
                <Button icon={FaSearch} disabled={busyId === "search"}>Search</Button>
              </form>

              <div className="mt-5 divide-y divide-[var(--border-subtle)]">
                {families.map((family) => (
                  <article key={family._id} className="py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{family.familyName}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{family.familyCode} — {family.currentCity || "City not set"}</p>
                      </div>
                      <Button icon={FaUserPlus} tone="success" disabled={busyId === family._id} onClick={() => requestJoin(family._id)}>Request</Button>
                    </div>
                    <input
                      value={joinMessage[family._id] || ""}
                      onChange={(e) => setJoinMessage((c) => ({ ...c, [family._id]: e.target.value }))}
                      placeholder="Optional note for family admin"
                      className="ka-input mt-3 !h-10 !text-xs"
                    />
                  </article>
                ))}
                {families.length === 0 && <p className="py-6 text-sm text-[var(--text-muted)]">Search results will appear here.</p>}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyHub;
