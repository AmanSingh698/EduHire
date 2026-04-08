"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap, Search, Bookmark, Send, Bell, User,
  MapPin, BookOpen, Building2, CheckCircle, Clock, TrendingUp,
  Briefcase, ChevronRight, Eye, Star, Settings, LogOut,
  BarChart2, FileText, Heart, Zap, Award, ArrowUpRight
} from "lucide-react";
import { useLogout } from "@/lib/useLogout";
import { useUser } from "@/lib/useUser";
import { api } from "@/lib/api";
import { TeacherProfile, JobVacancy, Application } from "@/lib/types";

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  PENDING:     { color: "#92400e", bg: "#fef3c7" },
  VIEWED:      { color: "#1e40af", bg: "#dbeafe" },
  SHORTLISTED: { color: "#065f46", bg: "#d1fae5" },
  REJECTED:    { color: "#991b1b", bg: "#fee2e2" },
  INTERVIEW:   { color: "#7c3aed", bg: "#f5f3ff" },
  HIRED:       { color: "#059669", bg: "#ecfdf5" },
};

const NAV_ITEMS = [
  { label: "Dashboard", icon: <BarChart2 size={18} />, key: "dashboard" },
  { label: "Browse Jobs", icon: <Search size={18} />, key: "jobs", href: "/jobs" },
  { label: "My Applications", icon: <Send size={18} />, key: "applications" },
  { label: "Saved Jobs", icon: <Bookmark size={18} />, key: "saved" },
  { label: "My Profile", icon: <User size={18} />, key: "profile" },
  { label: "Settings", icon: <Settings size={18} />, key: "settings" },
];

export default function TeacherDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const { user, isLoading: userLoading } = useUser();
  const logout = useLogout();

  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendations, setRecommendations] = useState<JobVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const loadData = async () => {
      try {
        const [profileRes, appsRes, jobsRes] = await Promise.all([
          api.get<{ teacher: TeacherProfile }>("/api/teachers/me"),
          api.get<{ applications: Application[] }>("/api/applications/me"),
          api.get<{ jobs: JobVacancy[] }>("/api/jobs", { limit: 3 })
        ]);
        setProfile(profileRes.teacher);
        setApplications(appsRes.applications);
        setRecommendations(jobsRes.jobs);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, userLoading]);

  if (isLoading || userLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  const stats = [
    { label: "Total Applications", value: applications.length, icon: <Send size={20} />, color: "#4f46e5", bg: "#eef2ff" },
    { label: "Profile Views", value: 0, icon: <Eye size={20} />, color: "#0891b2", bg: "#e0f2fe" },
    { label: "Saved Jobs", value: 0, icon: <Bookmark size={20} />, color: "#f59e0b", bg: "#fef3c7" },
    { label: "Shortlisted", value: applications.filter(a => a.status === "SHORTLISTED").length, icon: <Award size={20} />, color: "#059669", bg: "#d1fae5" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-50)" }}>

      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: "#fff",
        borderRight: "1px solid var(--border-color)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: "9px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={16} color="#fff" />
            </div>
            {/* <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--text-primary)" }}>
              Edu<span style={{ color: "#4f46e5" }}>Hire</span>
            </span> */}
            <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--text-primary)" }}>
              U<span style={{ color: "#4f46e5" }}>18</span>
            </span>
          </Link>
        </div>

        {/* Teacher mini-profile */}
        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="avatar" style={{ width: 42, height: 42, fontSize: "0.9rem" }}>
              {profile?.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>{profile?.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{profile?.qualification || "Teacher"} · {profile?.city}</div>
            </div>
          </div>
          <div style={{ marginTop: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
              <span>Profile completion</span>
              <span style={{ fontWeight: 600, color: "var(--primary-600)" }}>
                {profile?.resumeUrl ? "100%" : "70%"}
              </span>
            </div>
            <div className="progress-bar">
              <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: profile?.resumeUrl ? "100%" : "70%" }} transition={{ duration: 1, delay: 0.5 }} />
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ padding: "0.75rem", flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            item.href ? (
              <Link key={item.key} href={item.href} className="nav-item" style={{ textDecoration: "none" }}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ) : (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                className={`nav-item ${activeNav === item.key ? "active" : ""}`}
                style={{ width: "100%", border: "none", background: "none", textAlign: "left" }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            )
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border-color)" }}>
          <button
            onClick={logout}
            className="nav-item"
            style={{ width: "100%", border: "none", background: "none", color: "#ef4444", textAlign: "left", cursor: "pointer" }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>

        {/* Top header */}
        <div style={{
          background: "#fff", borderBottom: "1px solid var(--border-color)",
          padding: "1rem 2rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>My Dashboard</h1>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/jobs" className="btn btn-primary btn-sm">
              <Search size={14} /> Find Jobs
            </Link>
            <div style={{ position: "relative" }}>
              <button style={{ background: "var(--gray-100)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Bell size={16} color="var(--text-secondary)" />
              </button>
              <div className="notif-dot" />
            </div>
          </div>
        </div>

        <div style={{ padding: "2rem" }}>
          {/* Welcome banner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              borderRadius: "var(--radius-xl)",
              padding: "1.75rem",
              color: "#fff",
              marginBottom: "1.75rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -30, right: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Welcome back 👋</p>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Good morning, {profile?.name.split(" ")[0]}!</h2>
                  <p style={{ color: "rgba(255,255,255,0.75)", marginTop: "0.4rem", fontSize: "0.9rem" }}>
                    You have <strong>{applications.filter(a => a.status === "SHORTLISTED").length} shortlisted</strong> applications.
                  </p>
                </div>
                <Link href="/jobs" className="btn" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
                  <Zap size={15} /> Explore Jobs
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: "#fff", borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--border-color)",
                  padding: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "10px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "-0.04em" }}>{stat.value}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* 2-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }} className="dashboard-grid">

            {/* Applications */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>My Applications</h2>
                <button onClick={() => setActiveNav("applications")} style={{ fontSize: "0.8rem", color: "var(--primary-600)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  View all <ChevronRight size={14} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {applications.length === 0 ? (
                  <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <Briefcase size={32} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                    <p>No applications yet. Start your journey today!</p>
                  </div>
                ) : (
                  applications.slice(0, 4).map((app, i) => {
                    const s = STATUS_STYLE[app.status] || STATUS_STYLE.PENDING;
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        style={{
                          background: "#fff",
                          borderRadius: "var(--radius-xl)",
                          border: "1px solid var(--border-color)",
                          padding: "1.25rem",
                          transition: "box-shadow 0.2s",
                        }}
                        className="app-card"
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                          <div>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{app.job?.title}</h3>
                            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.15rem" }}>
                              <Building2 size={12} /> {app.job?.school?.name}
                            </p>
                          </div>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
                            {app.status}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Clock size={11} /> Applied {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                          <span style={{ fontSize: "0.78rem", color: "var(--success-600)", fontWeight: 600 }}>
                            {app.job?.salaryMin ? `₹${(app.job.salaryMin / 1000).toFixed(0)}k–${(app.job.salaryMax! / 1000).toFixed(0)}k` : "Salary not disclosed"}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Profile completion card */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.25rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-primary)" }}>
                  Complete your profile
                </h3>
                {[
                  { label: "Email verification", done: true },
                  { label: "Add profile photo", done: !!profile?.photoUrl },
                  { label: "Upload resume", done: !!profile?.resumeUrl },
                  { label: "Add subjects", done: (profile?.subjects?.length || 0) > 0 },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex", alignItems: "center", gap: "0.6rem",
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--gray-100)",
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      background: item.done ? "var(--success-500)" : "var(--gray-200)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {item.done && <CheckCircle size={12} color="#fff" />}
                    </div>
                    <span style={{ fontSize: "0.82rem", color: item.done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: item.done ? "line-through" : "none" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
                <Link href="/teacher/profile" className="btn btn-outline" style={{ width: "100%", justifyContent: "center", marginTop: "0.85rem", fontSize: "0.825rem" }}>
                  Edit Profile
                </Link>
              </div>

              {/* Recommended jobs */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.25rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Zap size={15} color="var(--primary-600)" /> New for You
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {recommendations.length === 0 ? (
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>No recommendations yet.</p>
                  ) : (
                    recommendations.map((job) => (
                      <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
                        <div style={{
                          display: "flex", gap: "0.75rem", padding: "0.75rem",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--border-color)",
                          transition: "all 0.15s", cursor: "pointer",
                        }}
                          className="rec-job-card">
                          <div style={{ width: 38, height: 38, borderRadius: "10px", background: "var(--primary-50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                            🏫
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.15rem" }}>{job.title}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{job.school?.name} · {job.city}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem", alignItems: "center" }}>
                              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--success-600)" }}>
                                {job.salaryMin ? `₹${(job.salaryMin / 1000).toFixed(0)}k+` : "Best in industry"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                <Link href="/jobs" className="btn btn-outline" style={{ width: "100%", justifyContent: "center", marginTop: "0.85rem", fontSize: "0.825rem" }}>
                  Browse All Jobs <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
        .app-card:hover { box-shadow: var(--shadow-lg) !important; }
        .rec-job-card:hover { background: var(--gray-50) !important; border-color: var(--primary-200) !important; }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--gray-200);
          border-top: 4px solid var(--primary-600);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
