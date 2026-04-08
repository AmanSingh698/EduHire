"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap, Search, Bookmark, Send, Bell, User,
  MapPin, BookOpen, Building2, CheckCircle, Clock, TrendingUp,
  Briefcase, ChevronRight, Eye, Star, Settings, LogOut,
  BarChart2, FileText, Heart, Zap, Award, ArrowUpRight, Trash2, Edit3, Shield
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
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync activeNav with localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem("teacherDashTab");
    if (savedTab) setActiveNav(savedTab);
  }, []);

  const handleNavClick = (key: string) => {
    setActiveNav(key);
    localStorage.setItem("teacherDashTab", key);
  };

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const loadData = async () => {
      try {
        const [profileRes, appsRes, jobsRes, savedRes] = await Promise.all([
          api.get<{ teacher: TeacherProfile }>("/api/teachers/me"),
          api.get<{ applications: Application[] }>("/api/applications/me"),
          api.get<{ jobs: JobVacancy[] }>("/api/jobs", { limit: 3 }),
          api.get<{ jobs: any[] }>("/api/saved-jobs")
        ]);
        setProfile(profileRes.teacher);
        setApplications(appsRes.applications);
        setRecommendations(jobsRes.jobs);
        setSavedJobs(savedRes.jobs);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, userLoading]);

  const removeSavedJob = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/api/saved-jobs/${id}`);
      setSavedJobs(prev => prev.filter(j => j.id !== id));
    } catch (err) {
      alert("Failed to unsave job");
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
    { label: "Total Applications", value: applications.length, icon: <Send size={20} />, color: "#4f46e5", bg: "#eef2ff" },
    { label: "Profile Views", value: profile?.id ? 12 : 0, icon: <Eye size={20} />, color: "#0891b2", bg: "#e0f2fe" }, // Mocked views
    { label: "Saved Jobs", value: savedJobs.length, icon: <Bookmark size={20} />, color: "#f59e0b", bg: "#fef3c7" },
    { label: "Shortlisted", value: applications.filter(a => a.status === "SHORTLISTED").length, icon: <Award size={20} />, color: "#059669", bg: "#d1fae5" },
  ];

  /* ---------------- RENDERING DIFFERENT TABS ---------------- */

  const renderDashboard = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }} className="dashboard-grid">
      {/* Applications */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>Recent Applications</h2>
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
                <Link key={app.id} href={`/jobs/${app.job?.id}`} style={{ textDecoration: "none" }}>
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      background: "#fff",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--border-color)",
                      padding: "1.25rem",
                      transition: "box-shadow 0.2s",
                      cursor: "pointer"
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
                </Link>
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
                    <div style={{ width: 38, height: 38, borderRadius: "10px", background: "var(--primary-50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0, overflow: "hidden" }}>
                      {job.school?.logoUrl ? <img src={job.school.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : "🏫"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.15rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.school?.name} · {job.city}</div>
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
  );

  const renderApplications = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>My Applications</h2>
      {applications.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          <Send size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>You haven't applied to any jobs yet.</p>
          <Link href="/jobs" className="btn btn-primary" style={{ marginTop: "1rem" }}>Browse Jobs</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {applications.map((app) => {
            const s = STATUS_STYLE[app.status] || STATUS_STYLE.PENDING;
            return (
              <Link key={app.id} href={`/jobs/${app.job?.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem", transition: "box-shadow 0.2s", cursor: "pointer", display: "flex", gap: "1.25rem", alignItems: "center" }} className="app-card">
                  <div style={{ width: 56, height: 56, borderRadius: "12px", background: "var(--primary-50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0, overflow: "hidden" }}>
                    {app.job?.school?.logoUrl ? <img src={app.job.school.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : "🏫"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{app.job?.title}</h3>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", background: s.bg, color: s.color }}>
                        {app.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Building2 size={14} /> {app.job?.school?.name}
                    </div>
                    <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><MapPin size={13} /> {app.job?.city}, {app.job?.state}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Clock size={13} /> Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </motion.div>
  );

  const renderSavedJobs = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>Saved Jobs</h2>
      {savedJobs.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          <Bookmark size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>You haven't saved any jobs.</p>
          <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Click the bookmark icon on jobs to save them here for later.</p>
          <Link href="/jobs" className="btn btn-outline" style={{ marginTop: "1rem" }}>Browse Jobs</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {savedJobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem", transition: "box-shadow 0.2s, transform 0.2s", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }} className="app-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "12px", background: "var(--primary-50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0, overflow: "hidden" }}>
                    {job.school?.logoUrl ? <img src={job.school.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : "🏫"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                      <div>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</h3>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Building2 size={12} /> {job.school?.name}
                        </p>
                      </div>
                      <button onClick={(e) => removeSavedJob(job.id, e)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary-600)", padding: "0.25rem" }} title="Remove saved job">
                        <Bookmark size={18} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "auto" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}><MapPin size={12} /> {job.city}</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--success-600)", fontWeight: 700 }}>{job.salaryMin ? `₹${(job.salaryMin/1000).toFixed()}k–${(job.salaryMax/1000).toFixed()}k/mo` : "Not disclosed"}</span>
                </div>
                <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--gray-100)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Saved on {new Date(job.savedAt).toLocaleDateString()}</span>
                  <span className="badge badge-primary" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>{job.jobType.replace("_", " ")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>My Profile</h2>
        <Link href="/teacher/profile" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Edit3 size={14} /> Edit Profile
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="profile-grid">
        {/* Profile Details Card */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: profile?.photoUrl ? "transparent" : "var(--primary-100)", border: "2px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 700, color: "var(--primary-600)", overflow: "hidden", flexShrink: 0 }}>
              {profile?.photoUrl ? <img src={profile.photoUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : profile?.name?.charAt(0)}
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{profile?.name}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{profile?.qualification || "Teacher"} • {profile?.experienceYears || 0} Years Exp.</p>
              <span className={`badge ${profile?.isAvailable ? "badge-primary" : "badge-gray"}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                {profile?.isAvailable ? <CheckCircle size={12} /> : <Clock size={12} />} {profile?.isAvailable ? "Available to Hire" : "Not Currently Available"}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.82rem" }}>
              <div style={{ color: "var(--text-muted)", marginBottom: "0.2rem" }}>Phone</div>
              <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>{profile?.phone || "Not added"}</div>
            </div>
            <div style={{ fontSize: "0.82rem" }}>
              <div style={{ color: "var(--text-muted)", marginBottom: "0.2rem" }}>Location</div>
              <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>{profile?.city ? `${profile.city}, ${profile.state}` : "Not added"}</div>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Subjects</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {profile?.subjects?.length ? profile.subjects.map((s: any) => (
                <span key={s.id} className="badge badge-gray" style={{ fontSize: "0.72rem" }}>{s.subject} {s.gradeLevel ? `(${s.gradeLevel.split(" ")[0]})` : ""}</span>
              )) : <span style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>No subjects added.</span>}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Bio</div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {profile?.bio || "No bio added yet. Write a professional summary to stand out."}
            </p>
          </div>
        </div>

        {/* Stats & Resume Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.25rem", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <Send size={24} style={{ color: "var(--primary-500)", marginBottom: "0.5rem" }} />
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{applications.length}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Applied Jobs</div>
            </div>
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.25rem", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <Award size={24} style={{ color: "var(--success-500)", marginBottom: "0.5rem" }} />
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{applications.filter(a => a.status === "SHORTLISTED").length}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Shortlisted</div>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem" }}>
             <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
               <FileText size={16} color="var(--primary-600)" /> My Resume
             </h3>
             {profile?.resumeUrl ? (
               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                   <div style={{ width: 36, height: 36, borderRadius: "8px", background: "var(--primary-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <FileText size={18} color="var(--primary-600)" />
                   </div>
                   <div>
                     <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>Resume_Uploaded.pdf</div>
                     <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Linked via Google Drive</div>
                   </div>
                 </div>
                 <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}>View File</a>
               </div>
             ) : (
               <div style={{ textAlign: "center", padding: "1.5rem", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-color)" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>No resume uploaded. Adding a resume increases your chances by 70%.</p>
                  <Link href="/teacher/profile" className="btn btn-outline btn-sm">Add Resume Link</Link>
               </div>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>Settings</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "800px" }}>
        {/* Account Details */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <User size={18} /> Account Details
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>Email Address</label>
              <input type="text" value={(user as any)?.email || ""} disabled className="input" style={{ width: "100%", background: "var(--gray-50)", color: "var(--text-secondary)" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>Account Role</label>
              <input type="text" value="Teacher" disabled className="input" style={{ width: "100%", background: "var(--gray-50)", color: "var(--text-secondary)" }} />
            </div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "var(--blue-50)", padding: "0.75rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--blue-100)" }}>
            <span style={{ fontWeight: 600, color: "var(--blue-800)" }}>Note:</span> To change your email address, please contact support.
          </div>
        </div>

        {/* Notification Preferences */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bell size={18} /> Notification Preferences
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>Application Updates</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Get notified when a school shortlists or reviews your application.</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "var(--primary-600)" }} />
            </div>
            <div style={{ height: "1px", background: "var(--gray-100)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>Job Recommendations</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Receive weekly emails with new jobs matching your profile.</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "var(--primary-600)" }} />
            </div>
          </div>
        </div>

        {/* Security */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield size={18} /> Security
          </h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>Change Password</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Update your account password for better security.</div>
            </div>
            <button className="btn btn-outline btn-sm">Update Password</button>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid #fecaca", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "#ef4444" }} />
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#991b1b", marginBottom: "0.5rem" }}>Danger Zone</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>Once you delete your account, there is no going back. Please be certain.</p>
          <button className="btn" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fca5a5" }}>Delete Account</button>
        </div>
      </div>
    </motion.div>
  );

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
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: profile?.photoUrl ? "transparent" : "var(--primary-100)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 700, color: "var(--primary-600)", overflow: "hidden", flexShrink: 0 }}>
              {profile?.photoUrl ? <img src={profile.photoUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : profile?.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>{profile?.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{profile?.qualification || "Teacher"}</div>
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
                onClick={() => handleNavClick(item.key)}
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
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{NAV_ITEMS.find(i => i.key === activeNav)?.label || "Dashboard"}</h1>
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
          {activeNav === "dashboard" && (
            <>
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
                      <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{getGreeting()}, {profile?.name.split(" ")[0]}!</h2>
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

              {renderDashboard()}
            </>
          )}

          {activeNav === "applications" && renderApplications()}
          {activeNav === "saved" && renderSavedJobs()}
          {activeNav === "profile" && renderProfile()}
          {activeNav === "settings" && renderSettings()}

        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid, .profile-grid { grid-template-columns: 1fr !important; }
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
