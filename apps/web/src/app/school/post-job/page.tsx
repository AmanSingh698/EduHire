"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap, Briefcase, BookOpen, MapPin, DollarSign,
  Calendar, FileText, CheckCircle, ArrowRight, ChevronLeft, Info
} from "lucide-react";
import { api } from "@/lib/api";

const SUBJECTS = ["Mathematics", "Science", "Physics", "Chemistry", "Biology", "English", "Hindi", "Social Studies", "Computer Science", "Arts", "Physical Education", "Economics", "Commerce", "Sanskrit"];
// Mapping actual Board enum names to UI display names
const BOARDS = [
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE" },
  { value: "STATE", label: "State Board" },
  { value: "IB", label: "IB" },
  { value: "IGCSE", label: "IGCSE" },
  { value: "NIOS", label: "NIOS" },
  { value: "OTHER", label: "Other" }
];
const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full-time", desc: "Regular school hours, 5-6 days/week" },
  { value: "PART_TIME", label: "Part-time", desc: "Flexible hours, fewer days" },
  { value: "CONTRACT", label: "Contract", desc: "Fixed-term engagement" },
  { value: "VISITING", label: "Visiting", desc: "Guest lecturer or subject specialist" },
];
const GRADE_LEVELS = ["Primary (1–5)", "Middle School (6–8)", "Secondary (9–10)", "Senior Secondary (Grade 11–12)", "All Grades"];

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", subject: "", board: "", gradeLevel: "",
    jobType: "FULL_TIME", salaryMin: "", salaryMax: "",
    experience: "", qualification: "", city: "", state: "",
    deadline: "", description: "", requirements: "", perks: "",
    openings: "1",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handlePost = async () => {
    setError(null);
    if (!form.title || !form.subject || !form.board || !form.description || !form.deadline) {
      setError("Please fill all required fields marked with *");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/jobs", {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        openings: Number(form.openings),
      });
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to publish job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border-color)", padding: "1rem 0" }}>
        <div className="container-custom" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/school/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              <ChevronLeft size={16} /> Dashboard
            </Link>
            <span style={{ color: "var(--border-color)" }}>|</span>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
              <div style={{ width: 30, height: 30, borderRadius: "8px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GraduationCap size={15} color="#fff" />
              </div>
              {/* <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, color: "var(--text-primary)" }}>
                Edu<span style={{ color: "#4f46e5" }}>Hire</span>
              </span> */}
              <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, color: "var(--text-primary)" }}>
                U<span style={{ color: "#4f46e5" }}>18</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container-custom" style={{ maxWidth: 740, paddingTop: "3rem", paddingBottom: "4rem" }}>
        {step < 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                Post a Teaching Vacancy 📋
              </h1>
              <p style={{ color: "var(--text-muted)" }}>Fill in the details below to reach qualified teachers across India.</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: "var(--error-50)", color: "var(--error-700)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--error-200)", marginBottom: "1.5rem", fontSize: "0.875rem", fontWeight: 600, textAlign: "center" }}>
                {error}
              </motion.div>
            )}

            {/* Steps */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "2.5rem" }}>
              {["Job Details", "Description", "Preview"].map((label, i) => (
                <div key={label} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <motion.div
                      animate={{ background: step > i + 1 ? "var(--success-500)" : step === i + 1 ? "var(--primary-600)" : "var(--gray-200)" }}
                      style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.35rem", fontSize: "0.85rem", fontWeight: 700, color: step >= i + 1 ? "#fff" : "var(--text-muted)" }}
                    >
                      {step > i + 1 ? <CheckCircle size={17} /> : i + 1}
                    </motion.div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: step === i + 1 ? "var(--primary-600)" : "var(--text-muted)" }}>{label}</span>
                  </div>
                  {i < 2 && <div style={{ width: 60, height: 2, background: step > i + 1 ? "var(--success-500)" : "var(--border-color)", margin: "0 0.5rem 1.2rem", transition: "background 0.3s" }} />}
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: "var(--radius-2xl)", border: "1px solid var(--border-color)", padding: "2.5rem", boxShadow: "var(--shadow-lg)" }}>
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>

                {/* STEP 1: Job Details */}
                {step === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>Basic Job Information</h2>

                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Job Title *</label>
                      <input className="input" placeholder="e.g. Mathematics Teacher (Grade 9–12)" value={form.title} onChange={(e) => update("title", e.target.value)} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-grid">
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Subject *</label>
                        <select className="input" value={form.subject} onChange={(e) => update("subject", e.target.value)}>
                          <option value="">Select subject</option>
                          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>School Board *</label>
                        <select className="input" value={form.board} onChange={(e) => update("board", e.target.value)}>
                          <option value="">Select board</option>
                          {BOARDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-primary)" }}>Job Type *</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }} className="form-grid">
                        {JOB_TYPES.map((jt) => (
                          <button
                            key={jt.value}
                            type="button"
                            onClick={() => update("jobType", jt.value)}
                            style={{
                              padding: "0.85rem",
                              borderRadius: "var(--radius-lg)",
                              border: form.jobType === jt.value ? "2px solid var(--primary-500)" : "1.5px solid var(--border-color)",
                              background: form.jobType === jt.value ? "var(--primary-50)" : "#fff",
                              textAlign: "left", cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: form.jobType === jt.value ? "var(--primary-700)" : "var(--text-primary)", marginBottom: "0.15rem" }}>{jt.label}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{jt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-grid">
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Grade Level *</label>
                        <select className="input" value={form.gradeLevel} onChange={(e) => update("gradeLevel", e.target.value)}>
                          <option value="">Select grade</option>
                          {GRADE_LEVELS.map((g) => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Number of Openings</label>
                        <select className="input" value={form.openings} onChange={(e) => update("openings", e.target.value)}>
                          {["1", "2", "3", "4", "5", "5+"].map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Monthly Salary Range (₹)</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600 }}>₹</span>
                          <input className="input" style={{ paddingLeft: "1.75rem" }} placeholder="Min (e.g. 30000)" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} />
                        </div>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600 }}>₹</span>
                          <input className="input" style={{ paddingLeft: "1.75rem" }} placeholder="Max (e.g. 50000)" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-grid">
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Experience Required</label>
                        <input className="input" placeholder="e.g. 2+ years" value={form.experience} onChange={(e) => update("experience", e.target.value)} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Application Deadline *</label>
                        <input type="date" className="input" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-grid">
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>City *</label>
                        <input className="input" placeholder="e.g. Noida" value={form.city} onChange={(e) => update("city", e.target.value)} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>State *</label>
                        <input className="input" placeholder="e.g. Uttar Pradesh" value={form.state} onChange={(e) => update("state", e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Description */}
                {step === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>Job Description</h2>

                    <div style={{ padding: "0.85rem 1rem", background: "var(--primary-50)", border: "1px solid var(--primary-200)", borderRadius: "var(--radius-lg)", display: "flex", gap: "0.6rem" }}>
                      <Info size={15} style={{ color: "var(--primary-600)", flexShrink: 0, marginTop: "0.15rem" }} />
                      <p style={{ fontSize: "0.82rem", color: "var(--primary-800)", lineHeight: 1.6 }}>
                        A detailed description gets <strong>2x more applications</strong>. Include responsibilities, classroom size, school culture, and what makes your school special.
                      </p>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Job Description *</label>
                      <textarea
                        className="input" rows={6}
                        placeholder="Describe the role, responsibilities, teaching approach expected, class sizes, etc..."
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        style={{ resize: "vertical" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Requirements & Qualifications</label>
                      <textarea
                        className="input" rows={4}
                        placeholder="e.g. B.Ed required, minimum 2 years experience, CBSE curriculum knowledge, TET certified..."
                        value={form.requirements}
                        onChange={(e) => update("requirements", e.target.value)}
                        style={{ resize: "vertical" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Benefits & Perks</label>
                      <textarea
                        className="input" rows={3}
                        placeholder="e.g. Provident Fund, medical insurance, transport facility, performance bonus, summer breaks..."
                        value={form.perks}
                        onChange={(e) => update("perks", e.target.value)}
                        style={{ resize: "vertical" }}
                      />
                    </div>

                    {/* Preview card */}
                    {form.title && (
                      <div style={{ padding: "1.25rem", background: "var(--gray-50)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)" }}>
                        <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>Preview</p>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.4rem" }}>{form.title}</h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                          {form.board && <span className="badge badge-primary">{form.board}</span>}
                          {form.jobType && <span className="badge badge-gray" style={{ textTransform: "capitalize" }}>{form.jobType.toLowerCase().replace("_", " ")}</span>}
                          {form.salaryMin && form.salaryMax && <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--success-600)" }}>₹{Number(form.salaryMin).toLocaleString("en-IN")}–{Number(form.salaryMax).toLocaleString("en-IN")}/mo</span>}
                          {form.city && <span className="badge badge-gray"><MapPin size={10} /> {form.city}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)" }}>
                {step > 1 ? (
                  <button onClick={() => setStep((s) => s - 1)} className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : <div />}
                {step === 1 ? (
                  <motion.button onClick={() => setStep(2)} className="btn btn-primary" whileTap={{ scale: 0.97 }}>
                    Continue <ArrowRight size={16} />
                  </motion.button>
                ) : (
                  <motion.button onClick={handlePost} className="btn btn-primary btn-lg" whileTap={{ scale: 0.97 }} disabled={loading}>
                    {loading ? "Publishing..." : "🚀 Publish Job"}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* SUCCESS */}
        {step === 3 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", borderRadius: "var(--radius-2xl)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-xl)" }}>
            <div style={{ fontSize: "5rem", marginBottom: "1.25rem" }}>🎉</div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Job Posted Successfully!</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "0.75rem", maxWidth: 440, margin: "0 auto 2rem" }}>
              Your vacancy is now live and visible to qualified teachers across India.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setStep(1)} className="btn btn-outline">
                Post Another Job
              </button>
              <Link href="/school/dashboard" className="btn btn-primary">
                View Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
