"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap, ArrowLeft, User, MapPin, Phone, BookOpen,
  Briefcase, Plus, X, CheckCircle, Save, FileText, Link2,
  AlertCircle, ChevronLeft, Loader2, Camera, Award, ToggleLeft, ToggleRight
} from "lucide-react";
import { api } from "@/lib/api";
import { useUser } from "@/lib/useUser";
import { TeacherProfile, TeacherSubject } from "@/lib/types";

const SUBJECTS = ["Mathematics", "Science", "Physics", "Chemistry", "Biology", "English", "Hindi",
  "Social Studies", "Computer Science", "Arts", "Physical Education", "Economics", "Commerce", "Sanskrit", "Geography", "History"];
const GRADE_LEVELS = ["Grade 1–5 (Primary)", "Grade 6–8 (Middle)", "Grade 9–10 (Secondary)", "Grade 11–12 (Senior Secondary)", "All Grades"];
const QUALIFICATIONS = ["B.Ed", "M.Ed", "B.A. + B.Ed", "M.A. + B.Ed", "M.Sc + B.Ed", "Ph.D", "D.El.Ed", "NTT", "TET Certified", "Other"];

type Toast = { type: "success" | "error"; message: string };

export default function TeacherProfilePage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [form, setForm] = useState({
    name: "", phone: "", city: "", state: "", bio: "",
    qualification: "", specialization: "", experienceYears: 0,
    photoUrl: "", resumeUrl: "", isAvailable: true,
  });

  const [subjects, setSubjects] = useState<{ subject: string; gradeLevel: string }[]>([]);
  const [newSubject, setNewSubject] = useState({ subject: "", gradeLevel: "" });

  useEffect(() => {
    if (userLoading) return;
    if (!user) { router.push("/auth/login"); return; }

    api.get<{ teacher: TeacherProfile }>("/api/teachers/me")
      .then((res) => {
        const t = res.teacher;
        setForm({
          name: t.name || "",
          phone: t.phone || "",
          city: t.city || "",
          state: t.state || "",
          bio: t.bio || "",
          qualification: t.qualification || "",
          specialization: t.specialization || "",
          experienceYears: t.experienceYears || 0,
          photoUrl: t.photoUrl || "",
          resumeUrl: t.resumeUrl || "",
          isAvailable: t.isAvailable ?? true,
        });
        setSubjects((t.subjects || []).map(s => ({ subject: s.subject, gradeLevel: s.gradeLevel || "" })));
      })
      .catch(() => showToast("error", "Failed to load profile"))
      .finally(() => setIsLoading(false));
  }, [user, userLoading]);

  const showToast = (type: Toast["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const addSubject = () => {
    if (!newSubject.subject) return;
    if (subjects.some(s => s.subject === newSubject.subject)) return;
    setSubjects(p => [...p, { subject: newSubject.subject, gradeLevel: newSubject.gradeLevel }]);
    setNewSubject({ subject: "", gradeLevel: "" });
  };

  const removeSubject = (idx: number) => setSubjects(p => p.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("error", "Name is required"); return; }
    setIsSaving(true);
    try {
      await api.put("/api/teachers/me", {
        ...form,
        experienceYears: Number(form.experienceYears),
        subjects,
      } as any);
      showToast("success", "Profile updated successfully! 🎉");
    } catch (err: any) {
      showToast("error", err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const completionItems = [
    { label: "Name", done: !!form.name },
    { label: "Photo", done: !!form.photoUrl },
    { label: "Bio", done: !!form.bio },
    { label: "Resume", done: !!form.resumeUrl },
    { label: "Subjects", done: subjects.length > 0 },
    { label: "Qualification", done: !!form.qualification },
  ];
  const completedCount = completionItems.filter(i => i.done).length;
  const completionPct = Math.round((completedCount / completionItems.length) * 100);

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
            <Link href="/teacher/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              <ChevronLeft size={16} /> Dashboard
            </Link>
            <span style={{ color: "var(--border-color)" }}>|</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 28, height: 28, borderRadius: "8px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GraduationCap size={14} color="#fff" />
              </div>
              {/* <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                Edu<span style={{ color: "#4f46e5" }}>Hire</span>
              </span> */}
              <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                U<span style={{ color: "#4f46e5" }}>18</span>
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
            {/* Avatar card */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem", textAlign: "center", marginBottom: "1rem" }}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%", margin: "0 auto 1rem",
                background: form.photoUrl ? "transparent" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", fontWeight: 800, color: "#fff", overflow: "hidden",
                border: "3px solid var(--primary-100)",
              }}>
                {form.photoUrl
                  ? <img src={form.photoUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (form.name.charAt(0) || "T")}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{form.name || "Your Name"}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{form.qualification || "Teacher"} {form.city ? `· ${form.city}` : ""}</div>
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
            <Section title="Basic Information" icon={<User size={18} />}>
              <div className="form-grid-2">
                <Field label="Full Name *">
                  <input className="input" value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Priya Sharma" />
                </Field>
                <Field label="Phone Number">
                  <input className="input" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="e.g. 9876543210" />
                </Field>
                <Field label="City">
                  <input className="input" value={form.city} onChange={e => update("city", e.target.value)} placeholder="e.g. New Delhi" />
                </Field>
                <Field label="State">
                  <input className="input" value={form.state} onChange={e => update("state", e.target.value)} placeholder="e.g. Delhi" />
                </Field>
                <Field label="Qualification">
                  <select className="input" value={form.qualification} onChange={e => update("qualification", e.target.value)}>
                    <option value="">Select qualification</option>
                    {QUALIFICATIONS.map(q => <option key={q}>{q}</option>)}
                  </select>
                </Field>
                <Field label="Specialization">
                  <input className="input" value={form.specialization} onChange={e => update("specialization", e.target.value)} placeholder="e.g. STEM Education" />
                </Field>
                <Field label="Years of Experience">
                  <input className="input" type="number" min={0} max={50} value={form.experienceYears} onChange={e => update("experienceYears", e.target.value)} />
                </Field>
                <Field label="Available for Hiring">
                  <button
                    type="button"
                    onClick={() => update("isAvailable", !form.isAvailable)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.65rem 1rem", borderRadius: "var(--radius-lg)",
                      border: "1.5px solid", cursor: "pointer",
                      borderColor: form.isAvailable ? "var(--success-400)" : "var(--border-color)",
                      background: form.isAvailable ? "var(--success-50)" : "var(--gray-50)",
                      fontSize: "0.875rem", fontWeight: 600,
                      color: form.isAvailable ? "var(--success-700)" : "var(--text-muted)",
                      transition: "all 0.2s",
                    }}
                  >
                    {form.isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    {form.isAvailable ? "Open to Opportunities" : "Not Currently Available"}
                  </button>
                </Field>
              </div>
            </Section>

            {/* Bio */}
            <Section title="About Me" icon={<FileText size={18} />}>
              <textarea
                className="input"
                rows={4}
                value={form.bio}
                onChange={e => update("bio", e.target.value)}
                placeholder="Write a brief introduction about your teaching style, experience, and what makes you a great educator..."
                style={{ resize: "vertical" }}
              />
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                {form.bio.length}/500 characters
              </div>
            </Section>

            {/* Subjects */}
            <Section title="Subjects I Teach" icon={<BookOpen size={18} />}>
              {/* Add subject row */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <select
                  className="input"
                  value={newSubject.subject}
                  onChange={e => setNewSubject(p => ({ ...p, subject: e.target.value }))}
                  style={{ flex: "1 1 180px" }}
                >
                  <option value="">Select subject</option>
                  {SUBJECTS.filter(s => !subjects.some(ex => ex.subject === s)).map(s => <option key={s}>{s}</option>)}
                </select>
                <select
                  className="input"
                  value={newSubject.gradeLevel}
                  onChange={e => setNewSubject(p => ({ ...p, gradeLevel: e.target.value }))}
                  style={{ flex: "1 1 160px" }}
                >
                  <option value="">Grade level (optional)</option>
                  {GRADE_LEVELS.map(g => <option key={g}>{g}</option>)}
                </select>
                <button
                  onClick={addSubject}
                  disabled={!newSubject.subject}
                  className="btn btn-primary btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {subjects.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-color)" }}>
                  <BookOpen size={24} style={{ color: "var(--text-muted)", margin: "0 auto 0.5rem", display: "block" }} />
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No subjects added yet. Add the subjects you teach above.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {subjects.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.4rem",
                        padding: "0.35rem 0.75rem", borderRadius: "var(--radius-full)",
                        background: "var(--primary-50)", border: "1px solid var(--primary-200)",
                        fontSize: "0.82rem", fontWeight: 600, color: "var(--primary-700)",
                      }}
                    >
                      {s.subject}
                      {s.gradeLevel && <span style={{ fontSize: "0.72rem", color: "var(--primary-500)" }}>({s.gradeLevel.split(" ")[0]})</span>}
                      <button
                        onClick={() => removeSubject(i)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary-400)", display: "flex", padding: 0, marginLeft: "0.1rem" }}
                      >
                        <X size={13} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </Section>

            {/* Documents */}
            <Section title="Documents & Links" icon={<Link2 size={18} />}>
              <Field label="Profile Photo URL">
                <input className="input" value={form.photoUrl} onChange={e => update("photoUrl", e.target.value)} placeholder="https://your-photo-url.com/photo.jpg" />
              </Field>
              <div style={{ marginTop: "1rem" }}>
                <Field label="Resume / CV URL">
                  <input className="input" value={form.resumeUrl} onChange={e => update("resumeUrl", e.target.value)} placeholder="https://drive.google.com/your-resume-link" />
                </Field>
              </div>
              <div style={{ marginTop: "0.75rem", padding: "0.75rem 1rem", background: "var(--primary-50)", borderRadius: "var(--radius-lg)", fontSize: "0.8rem", color: "var(--primary-700)" }}>
                💡 Tip: Upload your photo and resume to Google Drive or Dropbox and paste the shareable link here.
              </div>
            </Section>

            {/* Save button (bottom) */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <Link href="/teacher/dashboard" className="btn btn-outline">
                Cancel
              </Link>
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

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
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
