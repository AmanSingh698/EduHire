"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight,
  Building2, BookOpen, CheckCircle
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [role, setRole] = useState<"teacher" | "school">("teacher");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        // CRITICAL: Required for sending/receiving cookies
        credentials: "include"
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Login failed");

      // Redirect based on role (Cookies are now handled by browser & middleware)
      if (result.user.role === "TEACHER") {
        window.location.href = "/teacher/dashboard";
      } else {
        window.location.href = "/school/dashboard";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Logo */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", marginBottom: "2.5rem" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "10px",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <GraduationCap size={18} color="#fff" />
            </div>
            {/* <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)" }}>
              Edu<span style={{ color: "#4f46e5" }}>Hire</span>
            </span> */}
            <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)" }}>
              U<span style={{ color: "#4f46e5" }}>18</span>
            </span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              Welcome back 👋
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
              Sign in to continue to your U18 account.
            </p>

            {/* Role toggle */}
            <div style={{
              display: "flex", background: "var(--gray-100)",
              borderRadius: "var(--radius-full)", padding: "0.3rem", gap: "0.25rem", marginBottom: "1.75rem",
            }}>
              {(["teacher", "school"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1, padding: "0.55rem", border: "none",
                    borderRadius: "var(--radius-full)", cursor: "pointer",
                    fontSize: "0.875rem", fontWeight: 600,
                    background: role === r ? "#fff" : "transparent",
                    color: role === r ? "var(--primary-700)" : "var(--text-muted)",
                    boxShadow: role === r ? "var(--shadow-sm)" : "none",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                  }}
                >
                  {r === "teacher" ? <BookOpen size={14} /> : <Building2 size={14} />}
                  {r === "teacher" ? "Teacher" : "School"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder={role === "teacher" ? "teacher@email.com" : "principal@school.edu.in"}
                    className="input"
                    style={{ paddingLeft: "2.5rem", borderColor: errors.email ? "var(--error-500)" : undefined }}
                  />
                </div>
                {errors.email && <p style={{ color: "var(--error-600)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.email.message}</p>}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--text-primary)" }}>Password</label>
                  <Link href="/auth/forgot-password" style={{ fontSize: "0.78rem", color: "var(--primary-600)", textDecoration: "none" }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    {...register("password")}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="input"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem", borderColor: errors.password ? "var(--error-500)" : undefined }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.2rem" }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: "var(--error-600)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.password.message}</p>}
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "var(--error-600)", fontSize: "0.85rem", textAlign: "center", padding: "0.5rem", background: "var(--error-50)", borderRadius: "var(--radius-md)" }}>
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.85rem", fontSize: "0.95rem", marginTop: "0.5rem" }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"} <ArrowRight size={16} />
              </motion.button>
            </form>

            <div className="divider" style={{ margin: "1.5rem 0" }}>or</div>

            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              Don't have an account?{" "}
              <Link
                href={role === "teacher" ? "/auth/register/teacher" : "/auth/register/school"}
                style={{ color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}
              >
                Register for free →
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          style={{
            flex: 1, display: "none",
            background: role === "teacher"
              ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
              : "linear-gradient(135deg, #0f172a, #1e293b)",
            color: "#fff",
            alignItems: "center", justifyContent: "center",
            padding: "3rem", position: "relative", overflow: "hidden",
          }}
          className="auth-right-panel"
        >
          <div style={{ position: "relative", zIndex: 1, maxWidth: 380 }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1.25rem" }}>{role === "teacher" ? "👩‍🏫" : "🏫"}</div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
              {role === "teacher" ? "Find Your Dream Teaching Job" : "Hire the Best Teachers"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "2rem" }}>
              {role === "teacher" ? "Join 12k+ teachers." : "2k+ schools trust us."}
            </p>
            {(role === "teacher" ? ["5,000+ jobs", "Free forever"] : ["Reach 12k teachers", "Free to post"]).map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                <CheckCircle size={15} style={{ color: "#86efac" }} /> {f}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <style>{`
        @media (min-width: 900px) { .auth-right-panel { display: flex !important; } }
      `}</style>
    </div>
  );
}
