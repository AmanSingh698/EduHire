"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, Briefcase, Eye, Bell, Plus, CheckCircle,
  Building2, ArrowUpRight, Zap, Award, Phone, MapPin,
  BookOpen, FileText, UserCheck, XCircle, MessageSquare, X
} from "lucide-react";
import { useUser } from "@/lib/useUser";
import { api } from "@/lib/api";
import { SchoolProfile, JobVacancy, Application } from "@/lib/types";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:     { bg: "#dbeafe", color: "#1e40af" },
  SHORTLISTED: { bg: "#d1fae5", color: "#065f46" },
  REJECTED:    { bg: "#fee2e2", color: "#991b1b" },
  INTERVIEW:   { bg: "#fef3c7", color: "#92400e" },
};

export default function SchoolDashboard() {
  const { user, isLoading: userLoading } = useUser();
  const [statsData, setStatsData] = useState({ totalJobs: 0, totalApplications: 0 });
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading || !user) return;
    const loadData = async () => {
      try {
        const [schoolRes, jobsRes, appsRes] = await Promise.all([
          api.get<{ stats: any }>("/api/schools/me"),
          api.get<{ jobs: JobVacancy[] }>("/api/jobs/my-jobs"),
          api.get<{ applications: Application[] }>("/api/applications/school")
        ]);
        setStatsData(schoolRes.stats);
        setJobs(jobsRes.jobs);
        setApplications(appsRes.applications);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user, userLoading]);

  // Update application status
  const updateStatus = async (appId: string, status: string) => {
    setUpdatingId(appId);
    try {
      await api.patch(`/api/applications/${appId}/status`, { status });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: status as any } : a));
      if (selectedApp?.id === appId) setSelectedApp(prev => prev ? { ...prev, status: status as any } : null);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

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
    { label: "Profile Views", value: 42, icon: <Eye size={20} />, color: "#0891b2", bg: "#e0f2fe" }, // Mocked
  ];

  const TeacherModal = () => {
    if (!selectedApp) return null;
    const t = selectedApp.teacher;
    const s = STATUS_COLORS[selectedApp.status] || STATUS_COLORS.PENDING;
    const isUpdating = updatingId === selectedApp.id;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setSelectedApp(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}
        >
          <motion.div initial={{ scale: 0.94, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }} transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "var(--radius-2xl)", width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto", boxShadow: "var(--shadow-xl)" }}>
            <div style={{ padding: "1.5rem", background: "linear-gradient(135deg, #0f172a, #1e1b4b)", borderRadius: "var(--radius-2xl) var(--radius-2xl) 0 0", position: "relative" }}>
              <button onClick={() => setSelectedApp(null)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <X size={16} />
              </button>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "16px", background: t?.photoUrl ? "transparent" : "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: "#fff", flexShrink: 0, overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)" }}>
                  {t?.photoUrl ? <img src={t.photoUrl} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : t?.name?.charAt(0) ?? "T"}
                </div>
                <div>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", marginBottom: "0.25rem" }}>{t?.name}</h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                    {t?.city && <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "0.25rem" }}><MapPin size={12} />{t.city}</span>}
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.6rem", borderRadius: "var(--radius-full)", background: s.bg, color: s.color }}>{selectedApp.status}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ padding: "0.85rem 1rem", background: "var(--primary-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--primary-100)" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Applied For</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--primary-800)" }}>{selectedApp.job?.title}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {[ { icon: <Award size={14} />, label: "Qualification", value: t?.qualification || "Not specified" }, { icon: <Briefcase size={14} />, label: "Experience", value: `${t?.experienceYears ?? 0} years` }, { icon: <Phone size={14} />, label: "Phone", value: t?.phone || "Not provided" } ].map(item => (
                  <div key={item.label} style={{ padding: "0.75rem", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.3rem" }}>{item.icon} {item.label}</div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", paddingTop: "0.5rem", borderTop: "1px solid var(--border-color)" }}>
                {selectedApp.status !== "SHORTLISTED" && ( <button onClick={() => updateStatus(selectedApp.id, "SHORTLISTED")} disabled={!!isUpdating} style={{ flex: 1, padding: "0.65rem", background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0", borderRadius: "var(--radius-lg)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}> <UserCheck size={15} /> Shortlist </button> )}
                {selectedApp.status !== "REJECTED" && ( <button onClick={() => updateStatus(selectedApp.id, "REJECTED")} disabled={!!isUpdating} style={{ flex: 1, padding: "0.65rem", background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "var(--radius-lg)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}> <XCircle size={15} /> Reject </button> )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <>
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border-color)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>Dashboard Overview</h1>
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
        
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: "var(--radius-xl)", padding: "1.75rem", color: "#fff", marginBottom: "1.75rem", position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: -30, right: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{getGreeting()}!</h2>
                <p style={{ color: "rgba(255,255,255,0.75)", marginTop: "0.4rem", fontSize: "0.9rem" }}>
                  You have <strong style={{color:"#a78bfa"}}>{applications.filter(a => a.status === "PENDING").length} pending</strong> applications to review.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{ width: 38, height: 38, borderRadius: "10px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>{stat.icon}</div>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "-0.04em" }}>{stat.value}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }} className="school-dashboard-grid">
          
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                 <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>Recent Applications</h2>
                 <Link href="/school/applications" style={{ fontSize: "0.8rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}>View all records →</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {applications.slice(0, 4).length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>No applications yet.</p>
                ) : (
                  applications.slice(0, 4).map(app => {
                    const s = STATUS_COLORS[app.status] || STATUS_COLORS.PENDING;
                    return (
                      <div key={app.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary-100)", color: "var(--primary-700)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem" }}>
                            {app.teacher?.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>{app.teacher?.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Applied for {app.job?.title}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                           <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "100px", background: s.bg, color: s.color }}>{app.status}</span>
                           <button onClick={() => setSelectedApp(app)} style={{ background: "none", border: "none", color: "var(--primary-600)", cursor: "pointer" }}><Eye size={16} /></button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                 <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>Active Postings</h2>
                 <Link href="/school/vacancies" style={{ fontSize: "0.8rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}>Manage all →</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {jobs.slice(0, 3).length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>No active jobs.</p>
                ) : (
                  jobs.slice(0, 3).map(job => (
                    <div key={job.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
                       <div>
                         <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.2rem" }}>{job.title}</div>
                         <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{job._count?.applications || 0} applications • Posted {new Date(job.createdAt).toLocaleDateString()}</div>
                       </div>
                       <Link href={`/school/vacancies`} className="btn btn-outline btn-sm">Edit</Link>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.25rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.85rem", color: "var(--text-primary)" }}>Quick Actions</h3>
              {[
                { label: "Post New Job", icon: <Plus size={16} />, href: "/school/post-job", primary: true },
                { label: "View All Applications", icon: <Users size={16} />, href: "/school/applications", primary: false },
                { label: "Update School Profile", icon: <Building2 size={16} />, href: "/school/profile", primary: false },
              ].map((action) => (
                <Link key={action.label} href={action.href} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.7rem 0.85rem", marginBottom: "0.4rem", borderRadius: "var(--radius-lg)", background: action.primary ? "var(--primary-600)" : "var(--gray-50)", color: action.primary ? "#fff" : "var(--text-secondary)", transition: "all 0.15s", fontSize: "0.875rem", fontWeight: 600 }} className="quick-action">
                    {action.icon} {action.label}
                  </div>
                </Link>
              ))}
            </div>

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
      {selectedApp && <TeacherModal />}
      <style>{`
        @media (max-width: 900px) { .school-dashboard-grid { grid-template-columns: 1fr !important; } }
        .quick-action:hover { opacity: 0.85; transform: translateX(2px); }
      `}</style>
    </>
  );
}
