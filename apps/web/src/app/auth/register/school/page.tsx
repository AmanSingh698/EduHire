"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Mail, Lock, Phone, MapPin, ChevronLeft,
  CheckCircle, ArrowRight, GraduationCap, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { z } from "zod";

const STATES = ["Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"];

/* ── Validation Schemas ───────────────────────────── */

const step1Schema = z.object({
  name: z.string().min(3, "School name must be at least 3 characters"),
  email: z.string().email("Invalid work email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const step2Schema = z.object({
  phone: z.string().regex(/^[0-9+ ]{10,15}$/, "Invalid contact number"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
});

export default function SchoolRegister() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");

  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    phone: "", address: "", city: "", state: "",
    board: "CBSE", type: "PRIVATE"
  });

  const steps = [
    { label: "Account", icon: "🏫" },
    { label: "Location", icon: "📍" },
    { label: "Review", icon: "✅" },
    { label: "Phone", icon: "📱" },
    { label: "Email", icon: "📧" },
    { label: "Done", icon: "🎉" },
  ];

  const updateField = (k: string, v: string) => {
    setFormData(prev => ({ ...prev, [k]: v }));
    if (fieldErrors[k]) {
      setFieldErrors(prev => { const next = { ...prev }; delete next[k]; return next; });
    }
  };

  const validateStep = () => {
    setError("");
    try {
      if (step === 1) step1Schema.parse(formData);
      if (step === 2) step2Schema.parse(formData);
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((e) => {
          if (e.path[0]) errors[e.path[0] as string] = e.message;
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  const handleRegister = async () => {
    setIsLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:4000/api/auth/register-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setUserId(data.user.id);
      await fetch("http://localhost:4000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: formData.phone, type: "phone" }),
        credentials: "include"
      });
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally { setIsLoading(false); }
  };

  const handleVerifyPhone = async () => {
    setIsLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:4000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: formData.phone, otp, type: "phone", userId }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Phone verification failed");
      await fetch("http://localhost:4000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: formData.email, type: "email" }),
        credentials: "include"
      });
      setOtp(""); setStep(5);
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleVerifyEmail = async () => {
    setIsLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:4000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: formData.email, otp, type: "email", userId }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email verification failed");
      setStep(6);
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)", paddingBottom: "4rem" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border-color)", padding: "1rem 0" }}>
        <div className="container-custom" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: "9px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={16} color="#fff" />
            </div>
            {/* <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)" }}>
              Edu<span style={{ color: "#4f46e5" }}>Hire</span>
            </span> */}
            <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)" }}>
              U<span style={{ color: "#4f46e5" }}>18</span>
            </span>
          </Link>
          <Link href="/auth/login" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none" }}>
            Already have an account? <span style={{ color: "var(--primary-600)", fontWeight: 600 }}>Sign in</span>
          </Link>
        </div>
      </div>

      <div className="container-custom" style={{ maxWidth: 680, paddingTop: "3rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              Register Your School 🏫
            </h1>
            <p style={{ color: "var(--text-muted)" }}>List vacancies and connect with thousands of qualified teachers.</p>
          </div>

          {/* Step indicators */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "2.5rem" }}>
            {steps.map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                  <motion.div
                    animate={{
                      background: step > i + 1 ? "var(--success-500)" : step === i + 1 ? "var(--primary-600)" : "var(--gray-200)",
                      scale: step === i + 1 ? 1.1 : 1,
                    }}
                    style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", transition: "all 0.3s" }}
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

          {/* Card */}
          <div style={{ background: "#fff", borderRadius: "var(--radius-2xl)", border: "1px solid var(--border-color)", padding: "2.5rem", boxShadow: "var(--shadow-lg)" }}>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

                {/* ── Step 1: Account ── */}
                {step === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem" }}>Basic Information</h2>
                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>School Name *</label>
                      <div style={{ position: "relative" }}>
                        <Building2 size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input className="input" style={{ paddingLeft: "2.25rem", borderColor: fieldErrors.name ? "#ef4444" : undefined }} placeholder="Harmony Global School" value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
                      </div>
                      {fieldErrors.name && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.name}</p>}
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Work Email *</label>
                      <div style={{ position: "relative" }}>
                        <Mail size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input type="email" className="input" style={{ paddingLeft: "2.25rem", borderColor: fieldErrors.email ? "#ef4444" : undefined }} placeholder="admin@school.com" value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
                      </div>
                      {fieldErrors.email && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.email}</p>}
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Password *</label>
                      <div style={{ position: "relative" }}>
                        <Lock size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input type="password" className="input" style={{ paddingLeft: "2.25rem", borderColor: fieldErrors.password ? "#ef4444" : undefined }} placeholder="Min 8 characters" value={formData.password} onChange={(e) => updateField("password", e.target.value)} />
                      </div>
                      {fieldErrors.password && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.password}</p>}
                    </div>
                  </div>
                )}

                {/* ── Step 2: Location & Board ── */}
                {step === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem" }}>Contact & Location</h2>
                    <div>
                      <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Contact Number *</label>
                      <div style={{ position: "relative" }}>
                        <Phone size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input type="tel" className="input" style={{ paddingLeft: "2.25rem", borderColor: fieldErrors.phone ? "#ef4444" : undefined }} placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} />
                      </div>
                      {fieldErrors.phone && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.phone}</p>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-grid">
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>State *</label>
                        <select className="input" style={{ borderColor: fieldErrors.state ? "#ef4444" : undefined }} value={formData.state} onChange={(e) => updateField("state", e.target.value)}>
                          <option value="">Select state</option>
                          {STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                        {fieldErrors.state && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.state}</p>}
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>City *</label>
                        <div style={{ position: "relative" }}>
                          <MapPin size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                          <input className="input" style={{ paddingLeft: "2.25rem", borderColor: fieldErrors.city ? "#ef4444" : undefined }} placeholder="Your city" value={formData.city} onChange={(e) => updateField("city", e.target.value)} />
                        </div>
                        {fieldErrors.city && <p style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.2rem" }}>{fieldErrors.city}</p>}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-grid">
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Board</label>
                        <select className="input" value={formData.board} onChange={(e) => updateField("board", e.target.value)}>
                          {["CBSE", "ICSE", "STATE", "IB", "IGCSE", "NIOS", "OTHER"].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>School Type</label>
                        <select className="input" value={formData.type} onChange={(e) => updateField("type", e.target.value)}>
                          {["PRIVATE", "GOVERNMENT", "AIDED", "INTERNATIONAL"].map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Review ── */}
                {step === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ width: 56, height: 56, borderRadius: "16px", background: "var(--primary-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
                        <ShieldCheck size={28} color="var(--primary-600)" />
                      </div>
                      <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Review & Submit</h2>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Almost there! Please confirm your details.</p>
                    </div>
                    <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-xl)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {[
                        { label: "School Name", value: formData.name },
                        { label: "Email", value: formData.email },
                        { label: "Phone", value: formData.phone },
                        { label: "Location", value: `${formData.city}, ${formData.state}` },
                        { label: "Board", value: formData.board },
                        { label: "Type", value: formData.type },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                          <span style={{ color: "var(--text-muted)" }}>{label}</span>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{value || "—"}</span>
                        </div>
                      ))}
                    </div>
                    {error && <p style={{ color: "#dc2626", fontSize: "0.85rem", textAlign: "center", background: "#fef2f2", borderRadius: "var(--radius-lg)", padding: "0.6rem" }}>{error}</p>}
                  </div>
                )}

                {/* ── Step 4: Phone OTP ── */}
                {step === 4 && (
                  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ background: "var(--primary-50)", padding: "1.5rem", borderRadius: "1.5rem", display: "inline-block", alignSelf: "center" }}>
                      <Phone size={32} color="var(--primary-600)" />
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Step 1: Phone Verification</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Sent code to <strong>{formData.phone}</strong></p>
                    <input type="text" maxLength={6} placeholder="000000" style={{ fontSize: "2rem", letterSpacing: "1rem", textAlign: "center", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-xl)", outline: "none" }} value={otp} onChange={(e) => setOtp(e.target.value)} />
                    {error && <p style={{ color: "#dc2626", fontSize: "0.8rem" }}>{error}</p>}
                    <button onClick={handleVerifyPhone} className="btn btn-primary" style={{ width: "100%", padding: "1rem" }} disabled={isLoading || otp.length !== 6}>
                      {isLoading ? "Verifying..." : "Verify Phone"}
                    </button>
                  </div>
                )}

                {/* ── Step 5: Email OTP ── */}
                {step === 5 && (
                  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ background: "#fef3c7", padding: "1.5rem", borderRadius: "1.5rem", display: "inline-block", alignSelf: "center" }}>
                      <Mail size={32} color="#d97706" />
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Step 2: Email Verification</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Sent code to <strong>{formData.email}</strong></p>
                    <input type="text" maxLength={6} placeholder="000000" style={{ fontSize: "2rem", letterSpacing: "1rem", textAlign: "center", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-xl)", outline: "none" }} value={otp} onChange={(e) => setOtp(e.target.value)} />
                    {error && <p style={{ color: "#dc2626", fontSize: "0.8rem" }}>{error}</p>}
                    <button onClick={handleVerifyEmail} className="btn btn-primary" style={{ width: "100%", padding: "1rem" }} disabled={isLoading || otp.length !== 6}>
                      {isLoading ? "Verifying..." : "Verify Email"}
                    </button>
                  </div>
                )}

                {/* ── Step 6: Success ── */}
                {step === 6 && (
                  <div style={{ textAlign: "center", padding: "1rem 0" }}>
                    <div style={{ fontSize: "4.5rem", marginBottom: "1rem" }}>✨</div>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>Welcome, {formData.name.split(" ")[0]}!</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Your school account has been verified and is ready.</p>
                    <button onClick={() => window.location.href = "/school/dashboard"} className="btn btn-primary btn-xl" style={{ width: "100%" }}>
                      Go to Dashboard <ArrowRight size={18} style={{ display: "inline", marginLeft: "0.25rem" }} />
                    </button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {step < 4 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)" }}>
                {step > 1 ? (
                  <button onClick={prevStep} className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : <div />}
                <motion.button
                  onClick={step === 3 ? handleRegister : handleNext}
                  className="btn btn-primary"
                  whileTap={{ scale: 0.97 }}
                  disabled={isLoading}
                >
                  {isLoading ? "Please wait..." : step === 3 ? "Register Now" : "Continue"} <ArrowRight size={16} />
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
