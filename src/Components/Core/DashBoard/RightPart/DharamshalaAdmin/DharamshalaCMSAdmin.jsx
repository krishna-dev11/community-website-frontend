import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaBuilding, FaCamera, FaCheck, FaCheckCircle, FaEdit, FaExclamationTriangle, FaHotel, FaPlus, FaTimesCircle, FaTrash } from "react-icons/fa";
import { FiArrowLeft, FiArrowRight, FiLoader, FiUpload, FiX, FiChevronRight } from "react-icons/fi";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../../services/apiConnector";
import { dharamshalaAdminEndpoints as API } from "../../../../../services/apis.jsx";
import { Button, Field, StatusBadge, inputClass, textareaClass } from "./common.jsx";

const toRupees = (p) => (p ? (p / 100).toFixed(0) : "");
const toPaise = (r) => Math.round(Number(r) * 100) || 0;

const DEFAULT_POLICY = [
  { hoursBeforeCheckIn: 168, refundPercent: 100 },
  { hoursBeforeCheckIn: 72, refundPercent: 50 },
  { hoursBeforeCheckIn: 0, refundPercent: 0 },
];

const WIZARD_STEPS = [
  { id: "basic", label: "Basic Info" },
  { id: "address", label: "Address" },
  { id: "booking", label: "Booking Config" },
  { id: "cancellation", label: "Cancellation" },
  { id: "amenities", label: "Amenities" },
];

export default function DharamshalaCMSAdmin() {
  const { token } = useSelector((s) => s.auth);
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiConnector("GET", API.LIST_PROPERTIES_API, null, { Authorization: `Bearer ${token}` });
      setProperties(res.data?.data?.dharamshalas || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (view === "list") fetchProperties(); }, [view, fetchProperties]);

  if (view === "create")
    return <CreatePropertyWizard token={token} onSuccess={(id) => { setSelectedId(id); setView("detail"); fetchProperties(); }} onCancel={() => setView("list")} />;

  if (view === "detail" && selectedId)
    return <PropertyDetailEditor token={token} propertyId={selectedId} onBack={() => { setView("list"); fetchProperties(); }} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[var(--text-primary)]">Dharamshala Properties</h2>
          <p className="text-xs text-[var(--text-muted)]">Manage community guest-house properties, room types, and availability.</p>
        </div>
        <Button tone="success" icon={FaPlus} onClick={() => setView("create")}>New Property</Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16 text-[var(--text-muted)]"><FiLoader className="animate-spin mr-2" /> Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-16 text-center">
          <FaHotel size={36} className="text-[var(--text-muted)]" />
          <p className="font-semibold text-[var(--text-secondary)]">No properties yet</p>
          <p className="text-xs text-[var(--text-muted)]">Click "New Property" to set up your first dharamshala.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {properties.map((p) => <PropertyCard key={p._id} property={p} onClick={() => { setSelectedId(p._id); setView("detail"); }} />)}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property: p, onClick }) {
  return (
    <button onClick={onClick} className="group w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 text-left transition hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-primary)]/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">{p.name}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{p.code} - {p.address?.city || "unknown city"}</p>
        </div>
        <StatusBadge value={p.status} />
      </div>
      <div className="mt-3 flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
        <span><span className="font-bold text-[var(--text-secondary)]">{p.roomTypesCount || 0}</span> room types</span>
        <span><span className="font-bold text-[var(--text-secondary)]">{p.totalUnits || 0}</span> units</span>
        <span><span className="font-bold text-[var(--text-secondary)]">{p.images?.length || 0}</span> photos</span>
        <FiChevronRight size={12} className="ml-auto opacity-40 group-hover:opacity-100" />
      </div>
    </button>
  );
}

function CreatePropertyWizard({ token, onSuccess, onCancel }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [amenityCatalogue, setAmenityCatalogue] = useState([]);
  const [form, setForm] = useState({
    name: "", code: "", slug: "", tagline: "", description: "",
    line1: "", line2: "", city: "Ujjain", state: "Madhya Pradesh", pincode: "", landmark: "", mapUrl: "",
    phone: "", whatsapp: "", email: "",
    bookingMode: "INSTANT", advancePercent: "30", balanceDueAt: "CHECK_IN",
    minStayNights: "1", maxStayNights: "30",
    checkInTime: "12:00 PM", checkOutTime: "10:00 AM",
    cancellationPolicy: DEFAULT_POLICY.map((t) => ({ ...t })),
    selectedAmenityIds: [],
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (step === 4) {
      apiConnector("GET", API.LIST_AMENITIES_API, null, { Authorization: `Bearer ${token}` })
        .then((r) => setAmenityCatalogue(r.data?.data?.amenities || []))
        .catch(() => {});
    }
  }, [step, token]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), code: form.code.trim(), slug: form.slug.trim(),
        tagline: form.tagline.trim(), description: form.description.trim(),
        address: { line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode, landmark: form.landmark, mapUrl: form.mapUrl },
        contact: { phones: form.phone ? [form.phone] : [], whatsapp: form.whatsapp, email: form.email },
        bookingConfig: { bookingMode: form.bookingMode, advancePercent: Number(form.advancePercent), balanceDueAt: form.balanceDueAt, minNights: Number(form.minStayNights), maxNights: Number(form.maxStayNights) },
        policies: { checkInTime: form.checkInTime, checkOutTime: form.checkOutTime, idRequired: true },
        cancellationPolicy: form.cancellationPolicy,
        amenityIds: form.selectedAmenityIds,
      };
      const res = await apiConnector("POST", API.CREATE_PROPERTY_API, payload, { Authorization: `Bearer ${token}` });
      toast.success("Dharamshala draft created!");
      onSuccess(res.data?.data?.dharamshala?._id);
    } catch (e) {
      const validationDetails = e?.response?.data?.details;
      const detailMessage = validationDetails && typeof validationDetails === "object"
        ? Object.values(validationDetails).map((detail) => detail?.message).filter(Boolean).join(". ")
        : "";
      toast.error(detailMessage || e?.response?.data?.message || "Failed to create property");
    } finally {
      setSaving(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.name.trim().length >= 3;
    if (step === 1) return form.city.trim().length > 0;
    return true;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
          <FiArrowLeft size={14} />
        </button>
        <div>
          <h2 className="text-lg font-black text-[var(--text-primary)]">New Dharamshala Property</h2>
          <p className="text-xs text-[var(--text-muted)]">Step {step + 1} of {WIZARD_STEPS.length} - {WIZARD_STEPS[step].label}</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s.id} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-[var(--accent-primary)]" : "bg-white/10"}`} />
        ))}
      </div>
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5">
        {step === 0 && <StepBasicInfo form={form} set={set} />}
        {step === 1 && <StepAddress form={form} set={set} />}
        {step === 2 && <StepBookingConfig form={form} set={set} />}
        {step === 3 && <StepCancellationPolicy form={form} set={set} />}
        {step === 4 && <StepAmenities form={form} set={set} catalogue={amenityCatalogue} />}
      </div>
      <div className="flex items-center justify-between">
        <Button tone="neutral" icon={FiArrowLeft} onClick={() => setStep((s) => s - 1)} disabled={step === 0}>Back</Button>
        {step < WIZARD_STEPS.length - 1
          ? <Button tone="success" icon={FiArrowRight} onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>Continue</Button>
          : <Button tone="success" icon={FaCheck} onClick={handleSubmit} disabled={saving || !canNext()}>{saving ? "Creating..." : "Create Draft"}</Button>
        }
      </div>
    </div>
  );
}

function StepBasicInfo({ form, set }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-[var(--text-primary)]">Basic Information</h3>
      <Field label="Property Name *"><input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Samaj Dharamshala Ujjain" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Property Code"><input className={inputClass} value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="Auto-generated" /></Field>
        <Field label="URL Slug"><input className={inputClass} value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} placeholder="Auto-generated" /></Field>
      </div>
      <Field label="Tagline"><input className={inputClass} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Short catchy description" /></Field>
      <Field label="Description"><textarea className={textareaClass} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Full description..." /></Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Contact Phone"><input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 9876543210" /></Field>
        <Field label="WhatsApp"><input className={inputClass} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+91 9876543210" /></Field>
        <Field label="Email"><input className={inputClass} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="dharamshala@samaj.org" /></Field>
      </div>
    </div>
  );
}

function StepAddress({ form, set }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-[var(--text-primary)]">Address Details</h3>
      <Field label="Address Line 1"><input className={inputClass} value={form.line1} onChange={(e) => set("line1", e.target.value)} placeholder="Street / locality" /></Field>
      <Field label="Address Line 2"><input className={inputClass} value={form.line2} onChange={(e) => set("line2", e.target.value)} placeholder="Area / colony (optional)" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City *"><input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Ujjain" /></Field>
        <Field label="State"><input className={inputClass} value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Madhya Pradesh" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="PIN Code"><input className={inputClass} value={form.pincode} onChange={(e) => set("pincode", e.target.value)} placeholder="456001" /></Field>
        <Field label="Landmark"><input className={inputClass} value={form.landmark} onChange={(e) => set("landmark", e.target.value)} placeholder="Near Mahakal Temple" /></Field>
      </div>
      <Field label="Google Maps URL"><input className={inputClass} value={form.mapUrl} onChange={(e) => set("mapUrl", e.target.value)} placeholder="https://maps.google.com/..." /></Field>
    </div>
  );
}

function StepBookingConfig({ form, set }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-[var(--text-primary)]">Booking Configuration</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Booking Mode">
          <select className={inputClass} value={form.bookingMode} onChange={(e) => set("bookingMode", e.target.value)}>
            <option value="INSTANT">Instant Confirm</option>
            <option value="REQUIRES_APPROVAL">Request to Book</option>
          </select>
        </Field>
        <Field label="Advance Payment %"><input className={inputClass} type="number" min={0} max={100} value={form.advancePercent} onChange={(e) => set("advancePercent", e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Balance Due At">
          <select className={inputClass} value={form.balanceDueAt} onChange={(e) => set("balanceDueAt", e.target.value)}>
            <option value="CHECK_IN">Check-In</option>
            <option value="CHECK_OUT">Check-Out</option>
          </select>
        </Field>
        <Field label="Min Stay (nights)"><input className={inputClass} type="number" min={1} value={form.minStayNights} onChange={(e) => set("minStayNights", e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Max Stay (nights)"><input className={inputClass} type="number" min={1} value={form.maxStayNights} onChange={(e) => set("maxStayNights", e.target.value)} /></Field>
        <div />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Check-In Time"><input className={inputClass} value={form.checkInTime} onChange={(e) => set("checkInTime", e.target.value)} placeholder="12:00 PM" /></Field>
        <Field label="Check-Out Time"><input className={inputClass} value={form.checkOutTime} onChange={(e) => set("checkOutTime", e.target.value)} placeholder="10:00 AM" /></Field>
      </div>
    </div>
  );
}

function StepCancellationPolicy({ form, set }) {
  const updateTier = (idx, key, val) => { const u = form.cancellationPolicy.map((t, i) => i === idx ? { ...t, [key]: val } : t); set("cancellationPolicy", u); };
  const addTier = () => set("cancellationPolicy", [...form.cancellationPolicy, { hoursBeforeCheckIn: 24, refundPercent: 0 }]);
  const removeTier = (idx) => set("cancellationPolicy", form.cancellationPolicy.filter((_, i) => i !== idx));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[var(--text-primary)]">Cancellation Policy</h3>
        <Button tone="neutral" icon={FaPlus} onClick={addTier} type="button">Add Tier</Button>
      </div>
      <p className="text-xs text-[var(--text-muted)]">Define refund % by hours before check-in. Applied top-to-bottom.</p>
      <div className="flex flex-col gap-2">
        {form.cancellationPolicy.map((tier, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-3">
            <Field label="Hours before check-in"><input className={inputClass} type="number" min={0} value={tier.hoursBeforeCheckIn} onChange={(e) => updateTier(i, "hoursBeforeCheckIn", Number(e.target.value))} /></Field>
            <Field label="Refund %"><input className={inputClass} type="number" min={0} max={100} value={tier.refundPercent} onChange={(e) => updateTier(i, "refundPercent", Number(e.target.value))} /></Field>
            <button type="button" onClick={() => removeTier(i)} className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-lg text-red-400 hover:bg-red-400/10 cursor-pointer"><FiX size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepAmenities({ form, set, catalogue }) {
  const toggle = (id) => { const ids = form.selectedAmenityIds; set("selectedAmenityIds", ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]); };
  const grouped = catalogue.reduce((acc, a) => { (acc[a.category] = acc[a.category] || []).push(a); return acc; }, {});
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-[var(--text-primary)]">Amenities</h3>
      <p className="text-xs text-[var(--text-muted)]">Select amenities available at this property. Changeable later.</p>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {items.map((a) => {
              const sel = form.selectedAmenityIds.includes(a._id);
              return (
                <button key={a._id} type="button" onClick={() => toggle(a._id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${sel ? "border-[var(--accent-primary)]/50 bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]" : "border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
                  {sel && <FaCheck size={9} />}{a.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {catalogue.length === 0 && <p className="text-xs text-[var(--text-muted)] italic">Loading amenities...</p>}
    </div>
  );
}

function PropertyDetailEditor({ token, propertyId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const headers = { Authorization: `Bearer ${token}` };

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiConnector("GET", API.GET_PROPERTY_API(propertyId), null, headers);
      setData(res.data?.data || null);
    } catch (e) { toast.error("Failed to load property"); }
    finally { setLoading(false); }
  }, [propertyId, token]);

  useEffect(() => { refresh(); }, [refresh]);

  if (loading || !data) return (
    <div className="flex items-center justify-center py-20 text-[var(--text-muted)]"><FiLoader className="animate-spin mr-2" /> Loading...</div>
  );

  const { dharamshala, roomTypes, checklist } = data;
  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "rooms", label: `Rooms & Halls (${roomTypes?.length || 0})` },
    { key: "photos", label: `Photos (${dharamshala.images?.length || 0})` },
    { key: "publish", label: "Publish" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <button onClick={onBack} className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
          <FiArrowLeft size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-[var(--text-primary)]">{dharamshala.name}</h2>
            <StatusBadge value={dharamshala.status} />
          </div>
          <p className="text-xs text-[var(--text-muted)]">{dharamshala.code} - {dharamshala.address?.city}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${activeTab === t.key ? "bg-[var(--accent-primary)] text-[#070707]" : "border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {activeTab === "overview" && <OverviewTab dharamshala={dharamshala} token={token} onRefresh={refresh} />}
      {activeTab === "rooms" && <RoomsTab dharamshala={dharamshala} roomTypes={roomTypes} token={token} onRefresh={refresh} />}
      {activeTab === "photos" && <PhotosTab dharamshala={dharamshala} token={token} onRefresh={refresh} />}
      {activeTab === "publish" && <PublishTab dharamshala={dharamshala} checklist={checklist} token={token} onRefresh={refresh} />}
    </div>
  );
}

const InfoRow = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="w-28 shrink-0 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
    <span className="text-xs text-[var(--text-primary)]">{value}</span>
  </div>
);

function OverviewTab({ dharamshala: d, token, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: d.name || "", tagline: d.tagline || "", description: d.description || "",
    phone: d.contact?.phones?.[0] || "", whatsapp: d.contact?.whatsapp || "", email: d.contact?.email || "",
    city: d.address?.city || "", state: d.address?.state || "", pincode: d.address?.pincode || "",
    line1: d.address?.line1 || "", landmark: d.address?.landmark || "", mapUrl: d.address?.mapUrl || "",
    checkInTime: d.policies?.checkInTime || "12:00 PM", checkOutTime: d.policies?.checkOutTime || "10:00 AM",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const headers = { Authorization: `Bearer ${token}` };

  const save = async () => {
    setSaving(true);
    try {
      await apiConnector("PATCH", API.UPDATE_PROPERTY_API(d._id), {
        name: form.name, tagline: form.tagline, description: form.description,
        contact: { phones: [form.phone], whatsapp: form.whatsapp, email: form.email },
        address: { line1: form.line1, city: form.city, state: form.state, pincode: form.pincode, landmark: form.landmark, mapUrl: form.mapUrl },
        policies: { checkInTime: form.checkInTime, checkOutTime: form.checkOutTime },
      }, headers);
      toast.success("Property updated");
      setEditing(false);
      onRefresh();
    } catch (e) { toast.error(e?.response?.data?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[var(--text-primary)]">Property Details</h3>
        {!editing
          ? <Button tone="neutral" icon={FaEdit} onClick={() => setEditing(true)}>Edit</Button>
          : <div className="flex gap-2"><Button tone="neutral" onClick={() => setEditing(false)}>Cancel</Button><Button tone="success" icon={FaCheck} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></div>
        }
      </div>
      {editing ? (
        <div className="flex flex-col gap-3">
          <Field label="Name"><input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Tagline"><input className={inputClass} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
          <Field label="Description"><textarea className={textareaClass} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Phone"><input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="WhatsApp"><input className={inputClass} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
            <Field label="Email"><input className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Address Line 1"><input className={inputClass} value={form.line1} onChange={(e) => set("line1", e.target.value)} /></Field>
            <Field label="City"><input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="State"><input className={inputClass} value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
            <Field label="PIN"><input className={inputClass} value={form.pincode} onChange={(e) => set("pincode", e.target.value)} /></Field>
            <Field label="Landmark"><input className={inputClass} value={form.landmark} onChange={(e) => set("landmark", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-In Time"><input className={inputClass} value={form.checkInTime} onChange={(e) => set("checkInTime", e.target.value)} /></Field>
            <Field label="Check-Out Time"><input className={inputClass} value={form.checkOutTime} onChange={(e) => set("checkOutTime", e.target.value)} /></Field>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <InfoRow label="Name" value={d.name} />
          <InfoRow label="Code" value={d.code} />
          <InfoRow label="Tagline" value={d.tagline || "—"} />
          <InfoRow label="Description" value={d.description || "—"} />
          <InfoRow label="Phone" value={d.contact?.phones?.[0] || "—"} />
          <InfoRow label="WhatsApp" value={d.contact?.whatsapp || "—"} />
          <InfoRow label="Email" value={d.contact?.email || "—"} />
          <InfoRow label="Address" value={[d.address?.line1, d.address?.city, d.address?.state, d.address?.pincode].filter(Boolean).join(", ") || "—"} />
          <InfoRow label="Landmark" value={d.address?.landmark || "—"} />
          <InfoRow label="Check-In" value={d.policies?.checkInTime || "—"} />
          <InfoRow label="Check-Out" value={d.policies?.checkOutTime || "—"} />
          <InfoRow label="Booking Mode" value={d.bookingConfig?.bookingMode || "—"} />
          <InfoRow label="Advance %" value={(d.bookingConfig?.advancePercent || 0) + "%"} />
        </div>
      )}
    </div>
  );
}

function RoomsTab({ dharamshala, roomTypes, token, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const headers = { Authorization: `Bearer ${token}` };

  const deactivate = async (rtId) => {
    if (!window.confirm("Deactivate this room type?")) return;
    try { await apiConnector("DELETE", API.DELETE_ROOM_TYPE_API(dharamshala._id, rtId), null, headers); toast.success("Deactivated"); onRefresh(); }
    catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[var(--text-primary)]">Room Types and Halls</h3>
        <Button tone="success" icon={FaPlus} onClick={() => { setEditingRoom(null); setShowForm(true); }}>Add Room / Hall</Button>
      </div>
      {showForm && (
        <RoomTypeForm dharamshalaId={dharamshala._id} token={token} initial={editingRoom}
          onSuccess={() => { setShowForm(false); setEditingRoom(null); onRefresh(); }}
          onCancel={() => { setShowForm(false); setEditingRoom(null); }} />
      )}
      <div className="flex flex-col gap-3">
        {(roomTypes || []).map((rt) => (
          <div key={rt._id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[var(--text-primary)]">{rt.name}</p>
                  <StatusBadge value={rt.category} />
                  {!rt.isActive && <StatusBadge value="ARCHIVED" />}
                </div>
                <p className="text-xs text-[var(--text-muted)]">{rt.description}</p>
              </div>
              <div className="flex gap-2">
                <Button tone="neutral" icon={FaEdit} onClick={() => { setEditingRoom(rt); setShowForm(true); }} />
                {rt.isActive && <Button tone="danger" icon={FaTrash} onClick={() => deactivate(rt._id)} />}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] sm:grid-cols-4">
              <span>Units: <span className="font-bold text-[var(--text-secondary)]">{rt.totalUnits}</span></span>
              <span>Capacity: <span className="font-bold text-[var(--text-secondary)]">{rt.capacity?.base}-{rt.capacity?.max}</span></span>
              <span>Member: <span className="font-bold text-emerald-400">Rs.{toRupees(rt.pricing?.memberPricePaise)}</span></span>
              <span>Public: <span className="font-bold text-amber-400">Rs.{toRupees(rt.pricing?.publicPricePaise)}</span></span>
            </div>
          </div>
        ))}
        {(!roomTypes || roomTypes.length === 0) && (
          <p className="py-8 text-center text-xs text-[var(--text-muted)]">No room types yet. Add your first room or hall.</p>
        )}
      </div>
    </div>
  );
}

function RoomTypeForm({ dharamshalaId, token, initial, onSuccess, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: initial?.name || "", category: initial?.category || "ROOM",
    description: initial?.description || "",
    totalUnits: initial?.totalUnits || 1,
    capacityBase: initial?.capacity?.base || 2,
    capacityMax: initial?.capacity?.max || 4,
    bedConfig: initial?.bedConfig || "1 Double Bed",
    memberPrice: toRupees(initial?.pricing?.memberPricePaise),
    publicPrice: toRupees(initial?.pricing?.publicPricePaise),
    extraGuestMember: toRupees(initial?.pricing?.extraGuestMemberPaise),
    extraGuestPublic: toRupees(initial?.pricing?.extraGuestPublicPaise),
    deposit: toRupees(initial?.pricing?.depositPaise),
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const headers = { Authorization: `Bearer ${token}` };

  const uploadRoomImages = async (roomTypeId) => {
    if (!selectedFiles.length || !roomTypeId) return;

    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const fd = new FormData();
        fd.append("image", file);
        await apiConnector("POST", API.UPLOAD_ROOM_TYPE_IMAGES_API(dharamshalaId, roomTypeId), fd, {
          ...headers,
          "Content-Type": "multipart/form-data",
        });
      }
      toast.success(`${selectedFiles.length} room photo(s) uploaded`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to upload room photos");
      throw e;
    } finally {
      setUploading(false);
      setSelectedFiles([]);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteRoomImage = async (imageId) => {
    if (!initial?._id || !imageId) return;
    if (!window.confirm("Remove this room photo?")) return;
    try {
      await apiConnector("DELETE", API.DELETE_ROOM_TYPE_IMAGE_API(dharamshalaId, initial._id, imageId), null, headers);
      toast.success("Room photo removed");
      onSuccess();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to remove photo");
    }
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Room name is required");
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), category: form.category, description: form.description,
        totalUnits: Number(form.totalUnits),
        capacity: { base: Number(form.capacityBase), max: Number(form.capacityMax) },
        bedConfig: form.bedConfig,
        pricing: {
          memberPricePaise: toPaise(form.memberPrice), publicPricePaise: toPaise(form.publicPrice),
          extraGuestMemberPaise: toPaise(form.extraGuestMember), extraGuestPublicPaise: toPaise(form.extraGuestPublic),
          depositPaise: toPaise(form.deposit),
        },
      };

      let roomTypeId = initial?._id;
      if (initial?._id) {
        await apiConnector("PATCH", API.UPDATE_ROOM_TYPE_API(dharamshalaId, initial._id), payload, headers);
        toast.success("Room type updated");
      } else {
        const response = await apiConnector("POST", API.CREATE_ROOM_TYPE_API(dharamshalaId), payload, headers);
        roomTypeId = response?.data?.data?.roomType?._id || response?.data?.data?._id;
        toast.success("Room type added");
      }

      if (roomTypeId) {
        await uploadRoomImages(roomTypeId);
      }

      onSuccess();
    } catch (e) { toast.error(e?.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const existingImages = Array.isArray(initial?.images) ? initial.images : [];

  return (
    <div className="rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5 p-4 flex flex-col gap-4">
      <h4 className="font-bold text-[var(--text-primary)]">{initial ? "Edit Room Type" : "New Room Type / Hall"}</h4>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *"><input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Standard Room" /></Field>
        <Field label="Category">
          <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
            <option value="ROOM">Room</option>
            <option value="HALL">Hall / Banquet</option>
            <option value="DORMITORY">Dormitory</option>
            <option value="SUITE">Suite</option>
          </select>
        </Field>
      </div>
      <Field label="Description"><textarea className={textareaClass} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Total Units"><input className={inputClass} type="number" min={1} value={form.totalUnits} onChange={(e) => set("totalUnits", e.target.value)} /></Field>
        <Field label="Base Capacity"><input className={inputClass} type="number" min={1} value={form.capacityBase} onChange={(e) => set("capacityBase", e.target.value)} /></Field>
        <Field label="Max Capacity"><input className={inputClass} type="number" min={1} value={form.capacityMax} onChange={(e) => set("capacityMax", e.target.value)} /></Field>
      </div>
      <Field label="Bed Config"><input className={inputClass} value={form.bedConfig} onChange={(e) => set("bedConfig", e.target.value)} placeholder="e.g. 1 Double Bed" /></Field>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Pricing (Rs. per night)</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Member Price Rs."><input className={inputClass} type="number" min={0} value={form.memberPrice} onChange={(e) => set("memberPrice", e.target.value)} placeholder="0" /></Field>
        <Field label="Public Price Rs."><input className={inputClass} type="number" min={0} value={form.publicPrice} onChange={(e) => set("publicPrice", e.target.value)} placeholder="0" /></Field>
        <Field label="Deposit Rs."><input className={inputClass} type="number" min={0} value={form.deposit} onChange={(e) => set("deposit", e.target.value)} placeholder="0" /></Field>
        <Field label="Extra Guest Member Rs."><input className={inputClass} type="number" min={0} value={form.extraGuestMember} onChange={(e) => set("extraGuestMember", e.target.value)} placeholder="0" /></Field>
        <Field label="Extra Guest Public Rs."><input className={inputClass} type="number" min={0} value={form.extraGuestPublic} onChange={(e) => set("extraGuestPublic", e.target.value)} placeholder="0" /></Field>
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Room Photos</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => setSelectedFiles(Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/")))}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)]/50 hover:text-[var(--accent-primary)]"
          >
            <FiUpload size={12} /> Add Photos
          </button>
        </div>

        {((initial?.images && initial.images.length > 0) || selectedFiles.length > 0) ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(initial?.images || []).map((img) => (
              <div key={img._id || img.publicId} className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                <img src={img.url} alt={img.caption || form.name} className="h-24 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => deleteRoomImage(img._id)}
                  className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500/90 text-white group-hover:flex cursor-pointer"
                  aria-label="Delete room photo"
                >
                  <FiX size={10} />
                </button>
              </div>
            ))}
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-xl border border-dashed border-[var(--accent-primary)]/40 bg-black/10">
                <img src={URL.createObjectURL(file)} alt={file.name} className="h-24 w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-[var(--accent-primary)] px-1.5 py-0.5 text-[8px] font-bold text-black uppercase">New</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/5 px-3 py-6 text-center text-[11px] text-[var(--text-muted)]">
            No room photos yet. Upload one or more images to showcase this room/hall.
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button tone="neutral" onClick={onCancel}>Cancel</Button>
        <Button tone="success" icon={FaCheck} onClick={save} disabled={saving || uploading}>{saving ? "Saving..." : uploading ? "Uploading..." : "Save Room Type"}</Button>
      </div>
    </div>
  );
}function PhotosTab({ dharamshala, token, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const headers = { Authorization: `Bearer ${token}` };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("image", file);
        await apiConnector("POST", API.UPLOAD_IMAGES_API(dharamshala._id), fd, {
          ...headers, "Content-Type": "multipart/form-data",
        });
      }
      toast.success(`${files.length} photo(s) uploaded`);
      onRefresh();
    } catch (e) { toast.error(e?.response?.data?.message || "Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm("Remove this photo?")) return;
    try { await apiConnector("DELETE", API.DELETE_IMAGE_API(dharamshala._id, imageId), null, headers); toast.success("Photo removed"); onRefresh(); }
    catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[var(--text-primary)]">Property Photos</h3>
        <div>
          <input type="file" ref={fileRef} accept="image/*" multiple className="hidden" onChange={handleUpload} />
          <Button tone="success" icon={FiUpload} onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Photos"}
          </Button>
        </div>
      </div>
      {(dharamshala.images || []).length === 0 ? (
        <div onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 py-16 text-center hover:border-[var(--accent-primary)]/30">
          <FaCamera size={32} className="text-[var(--text-muted)]" />
          <p className="text-sm font-semibold text-[var(--text-secondary)]">No photos yet</p>
          <p className="text-xs text-[var(--text-muted)]">Click to upload property photos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {(dharamshala.images || []).map((img) => (
            <div key={img._id} className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)]">
              <img src={img.url} alt={img.caption} className="h-32 w-full object-cover" />
              {img.isCover && (
                <span className="absolute left-2 top-2 rounded-full bg-[var(--accent-primary)] px-2 py-0.5 text-[9px] font-bold text-black uppercase">Cover</span>
              )}
              <button onClick={() => deleteImage(img._id)}
                className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500/90 text-white group-hover:flex cursor-pointer">
                <FiX size={10} />
              </button>
              <p className="truncate px-2 py-1 text-[10px] text-[var(--text-muted)]">{img.caption}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PublishTab({ dharamshala, checklist, token, onRefresh }) {
  const [saving, setSaving] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const publish = async () => {
    setSaving(true);
    try { await apiConnector("POST", API.PUBLISH_PROPERTY_API(dharamshala._id), null, headers); toast.success("Dharamshala is now LIVE!"); onRefresh(); }
    catch (e) { toast.error(e?.response?.data?.message || "Cannot publish yet"); }
    finally { setSaving(false); }
  };

  const archive = async () => {
    if (!window.confirm("Archive this property? It will be hidden from public booking.")) return;
    setSaving(true);
    try { await apiConnector("POST", API.ARCHIVE_PROPERTY_API(dharamshala._id), null, headers); toast.success("Property archived"); onRefresh(); }
    catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const { canPublish, checklist: items } = checklist || { canPublish: false, checklist: [] };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5">
        <h3 className="mb-4 font-bold text-[var(--text-primary)]">Publish Checklist</h3>
        <div className="flex flex-col gap-3">
          {(items || []).map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              {item.passed
                ? <FaCheckCircle size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                : <FaTimesCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
              }
              <div>
                <p className={`text-sm font-semibold ${item.passed ? "text-[var(--text-primary)]" : "text-red-300"}`}>{item.label}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        {!canPublish && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3">
            <FaExclamationTriangle size={12} className="mt-0.5 shrink-0 text-amber-400" />
            <p className="text-xs text-amber-300">Complete all checklist items before publishing. Guests cannot book until the property is published.</p>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {dharamshala.status !== "PUBLISHED" && (
          <Button tone="success" icon={FaBuilding} onClick={publish} disabled={saving || !canPublish}>
            {saving ? "Publishing..." : "Publish Property"}
          </Button>
        )}
        {dharamshala.status === "PUBLISHED" && (
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300">
            <FaCheckCircle size={12} /> Property is LIVE - guests can book
          </div>
        )}
        {dharamshala.status !== "ARCHIVED" && (
          <Button tone="danger" onClick={archive} disabled={saving}>Archive Property</Button>
        )}
      </div>
    </div>
  );
}
