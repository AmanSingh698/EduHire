"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Filter, Eye, Search, X, Award, Briefcase, Phone, MapPin, FileText, BookOpen, MessageSquare, UserCheck, XCircle } from "lucide-react";
import { useUser } from "@/lib/useUser";
import { api } from "@/lib/api";
import { Application } from "@/lib/types";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:     { bg: "#dbeafe", color: "#1e40af" },
  VIEWED:      { bg: "#e2e8f0", color: "#475569" },
  SHORTLISTED: { bg: "#d1fae5", color: "#065f46" },
  REJECTED:    { bg: "#fee2e2", color: "#991b1b" },
  INTERVIEW:   { bg: "#fef3c7", color: "#92400e" },
};

export default function ApplicationsPage() {
  const { user, isLoading: userLoading } = useUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appFilter, setAppFilter] = useState("All");

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading || !user) return;
    const fetchApps = async () => {
      try {
        const res = await api.get<{ applications: Application[] }>("/api/applications/school");
        
        let apps = res.applications;
        if (apps.some(a => a.status === "PENDING")) {
          api.patch("/api/applications/mark-viewed", {}).catch(console.error);
          apps = apps.map(a => a.status === "PENDING" ? { ...a, status: "VIEWED" } : a);
        }
        
        setApplications(apps);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApps();
  }, [user, userLoading]);

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

  const filteredApps = applications.filter((a) => appFilter === "All" || a.status === appFilter);

  const TeacherModal = () => {
    if (!selectedApp) return null;
    const t = selectedApp.teacher;
    const s = STATUS_COLORS[selectedApp.status] || STATUS_COLORS.PENDING;
    const isUpdating = updatingId === selectedApp.id;

    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedApp(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}>
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
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>Applied on {new Date(selectedApp.createdAt).toLocaleDateString()}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {[
                  { icon: <Award size={14} />, label: "Qualification", value: t?.qualification || "Not specified" },
                  { icon: <Briefcase size={14} />, label: "Experience", value: `${t?.experienceYears ?? 0} years` },
                  { icon: <Phone size={14} />, label: "Phone", value: t?.phone || "Not provided" },
                ].map(item => (
                  <div key={item.label} style={{ padding: "0.75rem", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.3rem" }}>{item.icon} {item.label}</div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{item.value}</div>
                  </div>
                ))}
                {t?.resumeUrl && (
                  <a href={t.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "0.75rem", background: "var(--success-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--success-200)", textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--success-600)", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "0.3rem" }}><FileText size={14} /> Resume</div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--success-700)" }}>View Resume →</div>
                  </a>
                )}
              </div>

              {t?.bio && (
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.3rem" }}><MessageSquare size={13} /> About</div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>{t.bio}</p>
                </div>
              )}

              {t?.subjects && t.subjects.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}><BookOpen size={13} /> Subjects</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {t.subjects.map(s => (
                      <span key={s.id} style={{ padding: "0.25rem 0.65rem", background: "var(--primary-50)", color: "var(--primary-700)", borderRadius: "var(--radius-full)", fontSize: "0.78rem", fontWeight: 600, border: "1px solid var(--primary-100)" }}>
                        {s.subject} {s.gradeLevel ? `(${s.gradeLevel})` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedApp.coverLetter && (
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.4rem" }}>Cover Letter</div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65, background: "var(--gray-50)", padding: "0.85rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>{selectedApp.coverLetter}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", paddingTop: "0.5rem", borderTop: "1px solid var(--border-color)" }}>
                {selectedApp.status !== "SHORTLISTED" && (
                  <button onClick={() => updateStatus(selectedApp.id, "SHORTLISTED")} disabled={!!isUpdating} style={{ flex: 1, padding: "0.65rem", background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0", borderRadius: "var(--radius-lg)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                    <UserCheck size={15} /> Shortlist
                  </button>
                )}
                {selectedApp.status !== "INTERVIEW" && (
                  <button onClick={() => updateStatus(selectedApp.id, "INTERVIEW")} disabled={!!isUpdating} style={{ flex: 1, padding: "0.65rem", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", borderRadius: "var(--radius-lg)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                    <MessageSquare size={15} /> Interview
                  </button>
                )}
                {selectedApp.status !== "REJECTED" && (
                  <button onClick={() => updateStatus(selectedApp.id, "REJECTED")} disabled={!!isUpdating} style={{ flex: 1, padding: "0.65rem", background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "var(--radius-lg)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                    <XCircle size={15} /> Reject
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (isLoading || userLoading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><div className="spinner" /></div>;
  }

  return (
    <>
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border-color)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>Applications</h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Review and manage candidate applications</p>
        </div>
      </div>

      <div style={{ padding: "2rem" }}>
        
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}><Filter size={16} color="var(--text-muted)"/> Filter Status</h2>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {["All", "PENDING", "VIEWED", "SHORTLISTED", "INTERVIEW", "REJECTED"].map((f) => (
                <button
                  key={f} onClick={() => setAppFilter(f)}
                  style={{
                    padding: "0.3rem 0.75rem", borderRadius: "var(--radius-full)", border: "1.5px solid",
                    borderColor: appFilter === f ? "var(--primary-500)" : "var(--border-color)",
                    background: appFilter === f ? "var(--primary-50)" : "transparent",
                    color: appFilter === f ? "var(--primary-700)" : "var(--text-muted)",
                    fontSize: "0.7rem", fontWeight: appFilter === f ? 600 : 400,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {f === "PENDING" ? "New" : f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)" }}>
                  {["Teacher", "Applied For", "Experience", "Date", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                         <Search size={24} color="var(--gray-400)" />
                      </div>
                      No applications found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app, i) => {
                    const s = STATUS_COLORS[app.status] || STATUS_COLORS.PENDING;
                    return (
                      <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} style={{ borderBottom: "1px solid var(--border-color)" }} className="table-row">
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--primary-100)", color: "var(--primary-700)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem" }}>
                              {app.teacher?.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>{app.teacher?.name}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{app.teacher?.city} · {app.teacher?.qualification}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{app.job?.title}</span>
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.84rem", color: "var(--text-secondary)" }}>{app.teacher?.experienceYears} yrs</td>
                        <td style={{ padding: "1rem", fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "100px", background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
                            {app.status}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <button onClick={() => setSelectedApp(app)} style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, background: "var(--primary-50)", color: "var(--primary-700)", border: "none", borderRadius: "var(--radius-lg)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedApp && <TeacherModal />}
      <style>{`.table-row:hover { background: var(--gray-50); }`}</style>
    </>
  );
}
