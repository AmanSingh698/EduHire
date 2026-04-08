"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Key, Bell, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useUser } from "@/lib/useUser";
import { api } from "@/lib/api";
import { useLogout } from "@/lib/useLogout";

type Toast = { type: "success" | "error"; message: string };

export default function SettingsPage() {
  const { user, isLoading: userLoading } = useUser();
  const logout = useLogout();
  const [toast, setToast] = useState<Toast | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (type: Toast["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    showToast("success", "Password updated successfully (mock)");
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure you want to delete your school account? This action is permanent and will delete all your job postings and applications.")) return;
    setIsLoading(true);
    setTimeout(() => {
      logout();
    }, 1500);
  };

  if (userLoading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><div className="spinner" /></div>;
  }

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ position: "fixed", top: "1.25rem", right: "1.25rem", zIndex: 999, padding: "0.85rem 1.25rem", borderRadius: "var(--radius-xl)", background: toast.type === "success" ? "#065f46" : "#991b1b", color: "#fff", fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "var(--shadow-xl)" }}>
            {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ background: "#fff", borderBottom: "1px solid var(--border-color)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>Account Settings</h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Manage your security and preferences</p>
        </div>
      </div>

      <div style={{ padding: "2rem", maxWidth: 800 }}>
        
        {/* Email & Contact Settings */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield size={18} className="text-primary-600" />
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Login Details</h2>
          </div>
          <div style={{ padding: "1.5rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Registered Email</label>
              <input className="input" value={user?.email || ""} disabled style={{ background: "var(--gray-50)", opacity: 0.8 }} />
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>Your email is used for login and cannot be easily changed.</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Key size={18} className="text-primary-600" />
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Change Password</h2>
          </div>
          <form style={{ padding: "1.5rem" }} onSubmit={handleUpdatePassword}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Current Password</label>
                <input type="password" required className="input" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>New Password</label>
                <input type="password" required minLength={6} className="input" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={!currentPassword || !newPassword} className="btn btn-primary" style={{ marginTop: "1rem" }}>
              Update Password
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bell size={18} className="text-primary-600" />
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Notification Preferences</h2>
          </div>
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "New Application Alerts", desc: "Get an email when a teacher applies to your jobs." },
              { label: "Weekly Account Summary", desc: "Receive a weekly summary of your job metrics." },
              { label: "Platform Announcements", desc: "Stay up to date with new features on EduHire." }
            ].map(pref => (
              <label key={pref.label} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ marginTop: "0.2rem", cursor: "pointer", width: 16, height: 16 }} />
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{pref.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{pref.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid #fecaca", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #fecaca", display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--error-50)" }}>
            <AlertCircle size={18} className="text-error-600" />
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--error-700)" }}>Danger Zone</h2>
          </div>
          <div style={{ padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.2rem" }}>Delete School Account</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>This action cannot be undone. All active jobs and application data will be permanently lost.</div>
            </div>
            <button onClick={handleDeleteAccount} disabled={isLoading} style={{ padding: "0.6rem 1.25rem", background: "#ef4444", color: "#fff", border: "none", borderRadius: "var(--radius-lg)", fontWeight: 600, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", transition: "opacity 0.2s" }} className="hover:opacity-90">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {isLoading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
