"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { z } from "zod";
import {
  User, Mail, Lock, Phone, MapPin, BookOpen, Eye, EyeOff,
  GraduationCap, CheckCircle, ArrowRight, Upload, ChevronLeft
} from "lucide-react";

const SUBJECTS = ["Mathematics", "Science", "English", "Hindi", "Social Studies", "Computer Science", "Arts", "Physical Education", "Chemistry", "Physics", "Biology", "History", "Geography"];
const GRADES = ["Primary (Grade 1–5)", "Middle (Grade 6–8)", "Secondary (Grade 9–10)", "Senior Secondary (Grade 11–12)"];
const STATES = ["Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"];

/* ── Validation Schemas ───────────────────────────── */

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9+ ]{10,15}$/, "Invalid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const step2Schema = z.object({
  qualification: z.string().min(1, "Qualification is required"),
  experience: z.string().min(1, "Experience is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(2, "City is required"),
});

export default function TeacherRegisterPage() {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    state: "", city: "", experience: "", bio: "",
    qualification: "", specialization: "",
  });

  const update = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (fieldErrors[k]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
    }
  };

  const toggleSubject = (s: string) =>
    setSelectedSubjects((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const toggleGrade = (g: string) =>
    setSelectedGrades((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);

  const validateStep = () => {
    setError("");
    try {
      if (step === 1) step1Schema.parse(form);
      if (step === 2) step2Schema.parse(form);
      if (step === 3) {
        if (selectedSubjects.length === 0) throw new Error("Please select at least one subject");
        if (selectedGrades.length === 0) throw new Error("Please select at least one grade level");
      }
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((e) => {
          if (e.path[0]) errors[e.path[0] as string] = e.message;
        });
        setFieldErrors(errors);
      } else if (err instanceof Error) {
        setError(err.message);
      }
      return false;
    }
  };

  const handleNext = () => {
    setError("");
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };

  const handleRegister = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/auth/register-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subjects: selectedSubjects, grades: selectedGrades }),
        credentials: "include"
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      
      setUserId(data.user.id);
      
      await fetch("http://localhost:4000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: form.phone, type: "phone" }),
        credentials: "include"
      });
      
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: form.phone, otp, type: "phone", userId }),
        credentials: "include"
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      await fetch("http://localhost:4000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: form.email, type: "email" }),
        credentials: "include"
      });

      setOtp("");
      setStep(5);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: form.email, otp, type: "email", userId }),
        credentials: "include"
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email verification failed");

      setStep(6);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: "Account", icon: "🔐" },
    { label: "Profile", icon: "👤" },
    { label: "Subjects", icon: "📚" },
    { label: "Verify", icon: "📱" },
    { label: "Email", icon: "📧" },
    { label: "Done", icon: "✅" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)", paddingBottom: "4rem" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border-color)", padding: "1rem 0" }}>
        <div className="container-custom" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: "9px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)" }}>
              Edu<span style={{ color: "#4f46e5" }}>Hire</span>
            </span>
          </Link>
          <Link href="/auth/login" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none" }}>
            Already have an account? <span style={{ color: "var(--primary-600)", fontWeight: 600 }}>Sign in</span>
          </Link>
        </div>
      </div>

      <div className="container-custom" style={{ maxWidth: 680, paddingTop: "3rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              Join as a Teacher 👩‍🏫
            </h1>
            <p style={{ color: "var(--text-muted)" }}>Create your free profile and discover your perfect teaching role.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "2.5rem" }}>
            {steps.map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                  <motion.div
                    animate={{
                      background: step > i + 1 ? "var(--success-500)" : step === i + 1 ? "var(--primary-600)" : "var(--gray-200)",
                      scale: step === i + 1 ? 1.1 : 1,
                    }}
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem", transition: "all 0.3s",
                    }}
                  >
                    {step > i + 1 ? <CheckCircle size={20} color="#fff" /> : <span>{s.icon}</span>}
                  </motion.div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: step === i + 1 ? "var(--primary-600)" : "var(--text-muted)" }}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: "40px", height: 2, background: step > i + 1 ? "var(--success-500)" : "var(--border-color)", margin: "0 0.5rem 1.2rem", transition: "background 0.3s" }} />
                )}
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: "var(--radius-2xl)", border: "1px solid var(--border-color)", padding: "2.5rem", boxShadow: "var(--shadow-lg)" }}>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

                {step === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem" }}>Create your account</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-grid">
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Full Name *</label>
                        <div style={{ position: "relative" }}>
                          <User size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                          <input className="input" style={{ paddingLeft: "2.25rem", borderColor: fieldErrors.name ? "#ef4444" : undefined }} placeholder="Priya Sharma" value={form.name} onChange={(e) => update("name", e.target.value)} />
                        </div>
                        {fieldErrors.name && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.name}</p>}
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Mobile Number *</label>
                        <div style={{ position: "relative" }}>
                          <Phone size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                          <input className="input" style={{ paddingLeft: "2.25rem", borderColor: fieldErrors.phone ? "#ef4444" : undefined }} placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                        </div>
                        {fieldErrors.phone && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Email Address *</label>
                      <div style={{ position: "relative" }}>
                        <Mail size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input type="email" className="input" style={{ paddingLeft: "2.25rem", borderColor: fieldErrors.email ? "#ef4444" : undefined }} placeholder="priya@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                      </div>
                      {fieldErrors.email && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.email}</p>}
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Password *</label>
                      <div style={{ position: "relative" }}>
                        <Lock size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input type={showPass ? "text" : "password"} className="input" style={{ paddingLeft: "2.25rem", paddingRight: "2.5rem", borderColor: fieldErrors.password ? "#ef4444" : undefined }} placeholder="Min 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} />
                        <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {fieldErrors.password && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.password}</p>}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem" }}>Tell us about yourself</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-grid">
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Highest Qualification</label>
                        <select className="input" style={{ borderColor: fieldErrors.qualification ? "#ef4444" : undefined }} value={form.qualification} onChange={(e) => update("qualification", e.target.value)}>
                          <option value="">Select qualification</option>
                          {["B.Ed", "M.Ed", "B.Sc + B.Ed", "M.A + B.Ed", "M.Sc + B.Ed", "Ph.D", "TET Certified"].map((q) => <option key={q}>{q}</option>)}
                        </select>
                        {fieldErrors.qualification && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.qualification}</p>}
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Years of Experience</label>
                        <select className="input" style={{ borderColor: fieldErrors.experience ? "#ef4444" : undefined }} value={form.experience} onChange={(e) => update("experience", e.target.value)}>
                          <option value="">Select experience</option>
                          {["Fresher", "1 year", "2–3 years", "4–5 years", "6–10 years", "10+ years"].map((e) => <option key={e}>{e}</option>)}
                        </select>
                        {fieldErrors.experience && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.experience}</p>}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-grid">
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>State</label>
                        <select className="input" style={{ borderColor: fieldErrors.state ? "#ef4444" : undefined }} value={form.state} onChange={(e) => update("state", e.target.value)}>
                          <option value="">Select state</option>
                          {STATES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        {fieldErrors.state && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.state}</p>}
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>City</label>
                        <div style={{ position: "relative" }}>
                          <MapPin size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                          <input className="input" style={{ paddingLeft: "2.25rem", borderColor: fieldErrors.city ? "#ef4444" : undefined }} placeholder="Your city" value={form.city} onChange={(e) => update("city", e.target.value)} />
                        </div>
                        {fieldErrors.city && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.city}</p>}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Short Bio</label>
                      <textarea className="input" rows={3} placeholder="Tell schools a bit about yourself..." value={form.bio} onChange={(e) => update("bio", e.target.value)} style={{ resize: "none" }} />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem" }}>Subjects & Grade Levels</h2>
                    <div>
                      <p style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.75rem" }}>Which subjects can you teach?</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {SUBJECTS.map((s) => (
                          <button key={s} onClick={() => toggleSubject(s)} style={{ padding: "0.4rem 0.9rem", borderRadius: "var(--radius-full)", border: selectedSubjects.includes(s) ? "1.5px solid var(--primary-500)" : "1.5px solid var(--border-color)", background: selectedSubjects.includes(s) ? "var(--primary-50)" : "#fff", color: selectedSubjects.includes(s) ? "var(--primary-700)" : "var(--text-secondary)", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.15s" }}>
                            {selectedSubjects.includes(s) && <CheckCircle size={12} style={{ display: "inline", marginRight: "0.3rem" }} />}
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.75rem" }}>Grade levels you prefer to teach</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {GRADES.map((g) => (
                          <label key={g} onClick={() => toggleGrade(g)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)", border: selectedGrades.includes(g) ? "1.5px solid var(--primary-400)" : "1.5px solid var(--border-color)", background: selectedGrades.includes(g) ? "var(--primary-50)" : "#fff", cursor: "pointer" }}>
                            <div style={{ width: 18, height: 18, borderRadius: "4px", background: selectedGrades.includes(g) ? "var(--primary-600)" : "transparent", border: selectedGrades.includes(g) ? "none" : "1.5px solid var(--gray-300)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {selectedGrades.includes(g) && <CheckCircle size={11} color="#fff" />}
                            </div>
                            <span style={{ fontSize: "0.875rem", fontWeight: selectedGrades.includes(g) ? 600 : 400 }}>{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", textAlign: "center" }}>{error}</p>}
                  </div>
                )}

                {step === 4 && (
                  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ background: "var(--primary-50)", padding: "1.5rem", borderRadius: "1.5rem", display: "inline-block", alignSelf: "center" }}>
                      <Phone size={32} color="var(--primary-600)" />
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Step 1: Phone Verification</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Sent code to <strong>{form.phone}</strong></p>
                    <input type="text" maxLength={6} placeholder="000000" style={{ fontSize: "2rem", letterSpacing: "1rem", textAlign: "center", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-xl)" }} value={otp} onChange={(e) => setOtp(e.target.value)} />
                    {error && <p style={{ color: "#dc2626", fontSize: "0.8rem" }}>{error}</p>}
                    <button onClick={handleVerifyPhone} className="btn btn-primary" style={{ width: "100%", padding: "1rem" }} disabled={loading || otp.length !== 6}>
                      {loading ? "Verifying..." : "Verify Phone"}
                    </button>
                  </div>
                )}

                {step === 5 && (
                  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ background: "var(--amber-50)", padding: "1.5rem", borderRadius: "1.5rem", display: "inline-block", alignSelf: "center" }}>
                      <Mail size={32} color="var(--amber-600)" />
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Step 2: Email Verification</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Sent code to <strong>{form.email}</strong></p>
                    <input type="text" maxLength={6} placeholder="000000" style={{ fontSize: "2rem", letterSpacing: "1rem", textAlign: "center", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-xl)" }} value={otp} onChange={(e) => setOtp(e.target.value)} />
                    {error && <p style={{ color: "#dc2626", fontSize: "0.8rem" }}>{error}</p>}
                    <button onClick={handleVerifyEmail} className="btn btn-primary" style={{ width: "100%", padding: "1rem" }} disabled={loading || otp.length !== 6}>
                      {loading ? "Verifying..." : "Verify Email"}
                    </button>
                  </div>
                )}

                {step === 6 && (
                  <div style={{ textAlign: "center", padding: "1rem 0" }}>
                    <div style={{ fontSize: "4.5rem", marginBottom: "1rem" }}>✨</div>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>Welcome, {form.name.split(" ")[0]}!</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Your identity has been verified.</p>
                    <button onClick={() => window.location.href = "/teacher/dashboard"} className="btn btn-primary btn-xl" style={{ width: "100%" }}>Start Teaching →</button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {step < 4 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)" }}>
                {step > 1 ? (
                  <button onClick={() => setStep((s) => s - 1)} className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : <div />}
                <motion.button onClick={step === 3 ? handleRegister : handleNext} className="btn btn-primary" whileTap={{ scale: 0.97 }} disabled={loading}>
                  {loading ? "Please wait..." : step === 3 ? "Register Now" : "Continue"} <ArrowRight size={16} />
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
