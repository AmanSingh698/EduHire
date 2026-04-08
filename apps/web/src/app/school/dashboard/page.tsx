"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap, Users, Briefcase, Eye, TrendingUp,
  Bell, Plus, CheckCircle, Clock, ChevronRight,
  BarChart2, FileText, Settings, LogOut, Building2,
  Filter, Search, XCircle, Calendar, ArrowUpRight, Star, Zap
} from "lucide-react";
import { useLogout } from "@/lib/useLogout";
import { useUser } from "@/lib/useUser";
import { api } from "@/lib/api";
import { SchoolProfile, JobVacancy, Application } from "@/lib/types";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:     { bg: "#dbeafe", color: "#1e40af" },
  SHORTLISTED: { bg: "#d1fae5", color: "#065f46" },
  REJECTED:    { bg: "#fee2e2", color: "#991b1b" },
  INTERVIEW:   { bg: "#fef3c7", color: "#92400e" },
};

const NAV_ITEMS = [
  { label: "Dashboard", icon: <BarChart2 size={18} />, key: "dashboard" },
  { label: "Post a Job", icon: <Plus size={18} />, key: "post", href: "/school/post-job" },
  { label: "My Vacancies", icon: <Briefcase size={18} />, key: "vacancies" },
  { label: "Applications", icon: <Users size={18} />, key: "applications" },
  { label: "School Profile", icon: <Building2 size={18} />, key: "profile" },
  { label: "Settings", icon: <Settings size={18} />, key: "settings" },
];

export default function SchoolDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [appFilter, setAppFilter] = useState("All");
  const { user, isLoading: userLoading } = useUser();
  const logout = useLogout();

  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [statsData, setStatsData] = useState({ totalJobs: 0, totalApplications: 0 });
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const loadData = async () => {
      try {
        const [schoolRes, jobsRes, appsRes] = await Promise.all([
          api.get<{ school: SchoolProfile; stats: any }>("/api/schools/me"),
          api.get<{ jobs: JobVacancy[] }>("/api/jobs/my-jobs"),
          api.get<{ applications: Application[] }>("/api/applications/school")
        ]);
        setSchool(schoolRes.school);
        setStatsData(schoolRes.stats);
        setJobs(jobsRes.jobs);
        setApplications(appsRes.applications);
      } catch (err) {
        console.error("Failed to load school dashboard data", err);
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
    { label: "Active Jobs", value: statsData.totalJobs, icon: <Briefcase size={20} />, color: "#4f46e5", bg: "#eef2ff" },
    { label: "Total Applications", value: statsData.totalApplications, icon: <Users size={20} />, color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Shortlisted", value: applications.filter(a => a.status === "SHORTLISTED").length, icon: <CheckCircle size={20} />, color: "#059669", bg: "#d1fae5" },
    { label: "Profile Views", value: 0, icon: <Eye size={20} />, color: "#0891b2", bg: "#e0f2fe" },
  ];

  const filteredApps = applications.filter((a) => appFilter === "All" || a.status === appFilter);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--gray-50)" }}>

      {/* Sidebar */}
      <aside style={{ width: 240, flexShrink: 0, background: "#fff", borderRight: "1px solid var(--border-color)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: "9px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--text-primary)" }}>
              Edu<span style={{ color: "#4f46e5" }}>Hire</span>
            </span>
          </Link>
        </div>

        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 42, height: 42, borderRadius: "12px", background: "linear-gradient(135deg, #0f172a, #1e293b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
              {school?.logoUrl ? <img src={school.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", borderRadius: "inherit" }} /> : "🏫"}
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{school?.name}</div>
              {school?.isVerified && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.2rem" }}>
                  <span className="verified-badge" style={{ fontSize: "0.65rem" }}>
                    <CheckCircle size={9} /> Verified School
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

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
                {item.key === "applications" && applications.length > 0 && (
                  <span style={{ marginLeft: "auto", background: "var(--primary-600)", color: "#fff", borderRadius: "var(--radius-full)", padding: "0.05rem 0.45rem", fontSize: "0.7rem", fontWeight: 700 }}>
                    {applications.length}
                  </span>
                )}
              </button>
            )
          ))}
        </nav>

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

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>

        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "1px solid var(--border-color)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>School Dashboard</h1>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/school/post-job" className="btn btn-primary btn-sm">
              <Plus size={14} /> Post a Job
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
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.25rem" }}
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }} className="school-dashboard-grid">

            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Applications table */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                  <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Recent Applications</h2>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {["All", "PENDING", "SHORTLISTED", "INTERVIEW"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setAppFilter(f)}
                        style={{
                          padding: "0.3rem 0.75rem", borderRadius: "var(--radius-full)",
                          border: "1.5px solid",
                          borderColor: appFilter === f ? "var(--primary-500)" : "var(--border-color)",
                          background: appFilter === f ? "var(--primary-50)" : "transparent",
                          color: appFilter === f ? "var(--primary-700)" : "var(--text-muted)",
                          fontSize: "0.7rem", fontWeight: appFilter === f ? 600 : 400,
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--gray-50)" }}>
                        {["Teacher", "Applied For", "Experience", "Date", "Status", "Actions"].map((h) => (
                          <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No applications found.</td>
                        </tr>
                      ) : (
                        filteredApps.map((app, i) => {
                          const s = STATUS_COLORS[app.status] || STATUS_COLORS.PENDING;
                          return (
                            <motion.tr
                              key={app.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.05 }}
                              style={{ borderBottom: "1px solid var(--border-color)" }}
                              className="table-row"
                            >
                              <td style={{ padding: "1rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                  <div className="avatar" style={{ width: 34, height: 34, fontSize: "0.75rem" }}>
                                    {app.teacher?.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{app.teacher?.name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{app.teacher?.city} · {app.teacher?.qualification}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "1rem", fontSize: "0.84rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{app.job?.title}</td>
                              <td style={{ padding: "1rem", fontSize: "0.84rem", color: "var(--text-secondary)" }}>{app.teacher?.experienceYears} yrs</td>
                              <td style={{ padding: "1rem", fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                              <td style={{ padding: "1rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "var(--radius-full)", background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
                                  {app.status}
                                </span>
                              </td>
                              <td style={{ padding: "1rem" }}>
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                  <button style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem", fontWeight: 600, background: "var(--primary-50)", color: "var(--primary-700)", border: "none", borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                                    View
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Active Jobs */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Active Job Postings</h2>
                  <Link href="/school/post-job" className="btn btn-primary btn-sm">
                    <Plus size={13} /> New Job
                  </Link>
                </div>
                <div style={{ padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {jobs.length === 0 ? (
                    <p style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No jobs posted yet.</p>
                  ) : (
                    jobs.map((job, i) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                          <div>
                            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{job.title}</h3>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span style={{
                            fontSize: "0.72rem", fontWeight: 700,
                            padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)",
                            background: "#d1fae5",
                            color: "#065f46",
                          }}>
                            Active
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Users size={12} /> {job._count?.applications || 0} applicants
                          </span>
                          <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
                            <button style={{ padding: "0.3rem 0.7rem", fontSize: "0.75rem", fontWeight: 600, background: "#fff", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                              Edit
                            </button>
                            <button style={{ padding: "0.3rem 0.7rem", fontSize: "0.75rem", fontWeight: 600, background: "var(--primary-50)", color: "var(--primary-700)", border: "none", borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                              Details
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Quick actions */}
              <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.25rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.85rem", color: "var(--text-primary)" }}>Quick Actions</h3>
                {[
                  { label: "Post New Job", icon: <Plus size={16} />, href: "/school/post-job", primary: true },
                  { label: "View All Applications", icon: <Users size={16} />, href: "#", primary: false },
                  { label: "Update School Profile", icon: <Building2 size={16} />, href: "/school/profile", primary: false },
                ].map((action) => (
                  <Link key={action.label} href={action.href} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.7rem 0.85rem", marginBottom: "0.4rem",
                      borderRadius: "var(--radius-lg)",
                      background: action.primary ? "var(--primary-600)" : "var(--gray-50)",
                      color: action.primary ? "#fff" : "var(--text-secondary)",
                      transition: "all 0.15s",
                      fontSize: "0.875rem", fontWeight: 600,
                    }}
                      className="quick-action">
                      {action.icon} {action.label}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Tip card */}
              <div style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", borderRadius: "var(--radius-xl)", border: "1px solid #ddd6fe", padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <Zap size={15} color="var(--primary-600)" />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary-700)" }}>Pro Tip</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "0.85rem" }}>
                  Schools with a complete profile get <strong>3x more applications</strong>. Add your school logo and board affiliation.
                </p>
                <Link href="/school/profile" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--primary-600)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  Complete Profile <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) { .school-dashboard-grid { grid-template-columns: 1fr !important; } }
        .table-row:hover { background: var(--gray-50); }
        .quick-action:hover { opacity: 0.85; transform: translateX(2px); }
        .spinner {
          width: 40px; height: 40px;
          border: 4px solid var(--gray-200);
          border-top: 4px solid var(--primary-600);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
