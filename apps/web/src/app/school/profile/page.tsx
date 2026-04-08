"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap, ChevronLeft, Building2, MapPin, Phone, Globe,
  FileText, Save, Plus, X, CheckCircle, AlertCircle,
  Loader2, Shield, BookOpen, Info
} from "lucide-react";
import { api } from "@/lib/api";
import { useUser } from "@/lib/useUser";

const BOARDS = [
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE" },
  { value: "STATE", label: "State Board" },
  { value: "IB", label: "IB" },
  { value: "IGCSE", label: "IGCSE" },
  { value: "NIOS", label: "NIOS" },
  { value: "OTHER", label: "Other" },
];
const SCHOOL_TYPES = [
  { value: "GOVERNMENT", label: "Government" },
  { value: "PRIVATE", label: "Private" },
  { value: "AIDED", label: "Aided" },
  { value: "INTERNATIONAL", label: "International" },
];
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Chandigarh",
];

type Toast = { type: "success" | "error"; message: string };

export default function SchoolProfilePage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [verificationStatus, setVerificationStatus] = useState("UNVERIFIED");

  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "", state: "",
    pincode: "", landmark: "", board: "CBSE", type: "PRIVATE",
    description: "", website: "", logoUrl: "",
    udiseCode: "", registrationNo: "",
  });

  useEffect(() => {
    if (userLoading) return;
    if (!user) { router.push("/auth/login"); return; }

    api.get<{ school: any; stats: any }>("/api/schools/me")
      .then((res) => {
        const s = res.school;
        setVerificationStatus(s.verificationStatus || "UNVERIFIED");
        setForm({
          name: s.name || "",
          phone: s.phone || "",
          address: s.address || "",
          city: s.city || "",
          state: s.state || "",
          pincode: s.pincode || "",
          landmark: s.landmark || "",
          board: s.board || "CBSE",
          type: s.type || "PRIVATE",
          description: s.description || "",
          website: s.website || "",
          logoUrl: s.logoUrl || "",
          udiseCode: s.udiseCode || "",
          registrationNo: s.registrationNo || "",
        });
      })
      .catch(() => showToast("error", "Failed to load school profile"))
      .finally(() => setIsLoading(false));
  }, [user, userLoading]);

  const showToast = (type: Toast["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("error", "School name is required"); return; }
    if (!form.city.trim() || !form.state.trim()) { showToast("error", "City and State are required"); return; }
    setIsSaving(true);
    try {
      await api.put("/api/schools/me", form as any);
      showToast("success", "School profile updated successfully! 🎉");
    } catch (err: any) {
      showToast("error", err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const completionItems = [
    { label: "School Name", done: !!form.name },
    { label: "Description", done: !!form.description },
    { label: "Logo", done: !!form.logoUrl },
    { label: "Website", done: !!form.website },
    { label: "UDISE Code", done: !!form.udiseCode },
    { label: "Address", done: !!form.address },
  ];
  const completedCount = completionItems.filter(i => i.done).length;
  const completionPct = Math.round((completedCount / completionItems.length) * 100);

  const verificationBadge: Record<string, { label: string; color: string; bg: string }> = {
    UNVERIFIED:        { label: "Unverified", color: "#92400e", bg: "#fef3c7" },
    EMAIL_VERIFIED:    { label: "Email Verified", color: "#1e40af", bg: "#dbeafe" },
    UDISE_SUBMITTED:   { label: "UDISE Submitted", color: "#4338ca", bg: "#e0e7ff" },
    DOCUMENT_VERIFIED: { label: "Docs Verified", color: "#065f46", bg: "#d1fae5" },
    FULLY_VERIFIED:    { label: "Fully Verified ✓", color: "#065f46", bg: "#d1fae5" },
  };
  const badge = verificationBadge[verificationStatus] || verificationBadge.UNVERIFIED;

  if (isLoading || userLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--primary-600)" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed", top: "1.25rem", right: "1.25rem", zIndex: 999,
              padding: "0.85rem 1.25rem", borderRadius: "var(--radius-xl)",
              background: toast.type === "success" ? "#065f46" : "#991b1b",
              color: "#fff", fontWeight: 600, fontSize: "0.875rem",
              display: "flex", alignItems: "center", gap: "0.5rem",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border-color)", padding: "1rem 0", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="container-custom" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/school/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              <ChevronLeft size={16} /> Dashboard
            </Link>
            <span style={{ color: "var(--border-color)" }}>|</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 28, height: 28, borderRadius: "8px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GraduationCap size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                Edu<span style={{ color: "#4f46e5" }}>Hire</span>
              </span>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            {isSaving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="container-custom" style={{ padding: "2rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.75rem", alignItems: "start" }} className="profile-grid">

          {/* Sidebar */}
          <div style={{ position: "sticky", top: "80px" }}>
            {/* School card */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem", textAlign: "center", marginBottom: "1rem" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "18px", margin: "0 auto 1rem",
                background: form.logoUrl ? "transparent" : "linear-gradient(135deg, #0f172a, #1e293b)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2.2rem", overflow: "hidden",
                border: "2px solid var(--border-color)",
              }}>
                {form.logoUrl
                  ? <img src={form.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : "🏫"}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{form.name || "Your School"}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{form.board} · {form.city || "City"}</div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.3rem",
                marginTop: "0.65rem", padding: "0.2rem 0.65rem",
                borderRadius: "var(--radius-full)", fontSize: "0.72rem", fontWeight: 700,
                background: badge.bg, color: badge.color,
              }}>
                <Shield size={10} /> {badge.label}
              </span>

              <div style={{ marginTop: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                  <span>Profile completion</span>
                  <span style={{ fontWeight: 700, color: "var(--primary-600)" }}>{completionPct}%</span>
                </div>
                <div style={{ height: 6, background: "var(--gray-100)", borderRadius: 99, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.8 }}
                    style={{ height: "100%", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", borderRadius: 99 }}
                  />
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.25rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Checklist</div>
              {completionItems.map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.4rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    background: item.done ? "var(--success-500)" : "var(--gray-200)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {item.done && <CheckCircle size={11} color="#fff" />}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: item.done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: item.done ? "line-through" : "none" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Basic Info */}
            <SSection title="School Information" icon={<Building2 size={18} />}>
              <div className="form-grid-2">
                <Field label="School Name *">
                  <input className="input" value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Delhi Public School, Noida" />
                </Field>
                <Field label="Phone Number">
                  <input className="input" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="e.g. 0120-4567890" />
                </Field>
                <Field label="School Board *">
                  <select className="input" value={form.board} onChange={e => update("board", e.target.value)}>
                    {BOARDS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </Field>
                <Field label="School Type *">
                  <select className="input" value={form.type} onChange={e => update("type", e.target.value)}>
                    {SCHOOL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Website">
                  <input className="input" value={form.website} onChange={e => update("website", e.target.value)} placeholder="https://www.yourschool.edu.in" />
                </Field>
                <Field label="Logo URL">
                  <input className="input" value={form.logoUrl} onChange={e => update("logoUrl", e.target.value)} placeholder="https://your-logo-url.png" />
                </Field>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <Field label="About the School">
                  <textarea
                    className="input" rows={4}
                    value={form.description}
                    onChange={e => update("description", e.target.value)}
                    placeholder="Describe your school — curriculum, culture, achievements, facilities, teaching approach..."
                    style={{ resize: "vertical" }}
                  />
                </Field>
              </div>
            </SSection>

            {/* Location */}
            <SSection title="Location" icon={<MapPin size={18} />}>
              <div className="form-grid-2">
                <Field label="City *">
                  <input className="input" value={form.city} onChange={e => update("city", e.target.value)} placeholder="e.g. Noida" />
                </Field>
                <Field label="State *">
                  <select className="input" value={form.state} onChange={e => update("state", e.target.value)}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Pincode">
                  <input className="input" value={form.pincode} onChange={e => update("pincode", e.target.value)} placeholder="e.g. 201301" />
                </Field>
                <Field label="Landmark">
                  <input className="input" value={form.landmark} onChange={e => update("landmark", e.target.value)} placeholder="e.g. Near Sector 62 Metro" />
                </Field>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <Field label="Full Address">
                  <input className="input" value={form.address} onChange={e => update("address", e.target.value)} placeholder="Plot 123, Sector 45, Noida, Uttar Pradesh" />
                </Field>
              </div>
            </SSection>

            {/* Verification */}
            <SSection title="Verification Details" icon={<Shield size={18} />}>
              <div style={{ marginBottom: "1rem", padding: "0.85rem 1rem", background: "var(--primary-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--primary-200)", display: "flex", gap: "0.6rem" }}>
                <Info size={15} style={{ color: "var(--primary-600)", flexShrink: 0, marginTop: "0.1rem" }} />
                <div style={{ fontSize: "0.8rem", color: "var(--primary-800)", lineHeight: 1.6 }}>
                  Schools with <strong>UDISE code</strong> get a verified badge and appear higher in teacher searches. 
                  Your current status: <span style={{ fontWeight: 700, color: badge.color }}>{badge.label}</span>
                </div>
              </div>
              <div className="form-grid-2">
                <Field label="UDISE Code">
                  <input className="input" value={form.udiseCode} onChange={e => update("udiseCode", e.target.value)} placeholder="e.g. 09040312310" />
                </Field>
                <Field label="Registration Number">
                  <input className="input" value={form.registrationNo} onChange={e => update("registrationNo", e.target.value)} placeholder="School registration number" />
                </Field>
              </div>
            </SSection>

            {/* Save bottom */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <Link href="/school/dashboard" className="btn btn-outline">Cancel</Link>
              <button onClick={handleSave} disabled={isSaving} className="btn btn-primary btn-lg">
                {isSaving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr !important; } }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 600px) { .form-grid-2 { grid-template-columns: 1fr !important; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function SSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", overflow: "hidden" }}
    >
      <div style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ color: "var(--primary-600)" }}>{icon}</span>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h2>
      </div>
      <div style={{ padding: "1.5rem" }}>{children}</div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>{label}</label>
      {children}
    </div>
  );
}
