"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, Plus, Users, MapPin, Eye, Edit2, Trash2 } from "lucide-react";
import { useUser } from "@/lib/useUser";
import { api } from "@/lib/api";
import { JobVacancy } from "@/lib/types";

export default function VacanciesPage() {
  const { user, isLoading: userLoading } = useUser();
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobVacancy | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingJob, setDeletingJob] = useState<{id: string, title: string} | null>(null);

  useEffect(() => {
    if (userLoading || !user) return;
    const fetchJobs = async () => {
      try {
        const res = await api.get<{ jobs: JobVacancy[] }>("/api/jobs/my-jobs");
        setJobs(res.jobs);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [user, userLoading]);

  const executeDelete = async () => {
    if (!deletingJob) return;
    try {
      await api.delete(`/api/jobs/${deletingJob.id}`);
      setJobs(prev => prev.filter(j => j.id !== deletingJob.id));
      setDeletingJob(null);
    } catch (err: any) {
      alert("Failed to delete job posting.");
    }
  };

  const handleUpdateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingJob) return;
    
    setIsUpdating(true);
    try {
      const { id, title, salaryMin, salaryMax, status, openings, description, perks } = editingJob;
      await api.put(`/api/jobs/${id}`, {
        title, salaryMin, salaryMax, status, openings, description, perks
      });
      setJobs(prev => prev.map(job => (job.id === id ? editingJob : job)));
      setEditingJob(null);
    } catch (err: any) {
      alert("Failed to update job.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || userLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border-color)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>My Vacancies</h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Manage your posted jobs and job statuses</p>
        </div>
        <Link href="/school/post-job" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Plus size={16} /> Post New Job
        </Link>
      </div>

      <div style={{ padding: "2rem" }}>
        {jobs.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", padding: "4rem 2rem", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary-50)", color: "var(--primary-600)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <Briefcase size={28} />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>No Active Vacancies</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", maxWidth: 400, margin: "0 auto 1.5rem" }}>You haven't posted any job vacancies yet. Start finding great teachers by posting your first job today.</p>
            <Link href="/school/post-job" className="btn btn-primary">Post Your First Job</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <div style={{ padding: "1.25rem 1.25rem 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "100px", background: job.status === "ACTIVE" ? "#d1fae5" : "#fee2e2", color: job.status === "ACTIVE" ? "#065f46" : "#991b1b" }}>
                      {job.status === "ACTIVE" ? "Active" : "Closed"}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem", lineHeight: 1.3 }}>{job.title}</h3>
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem" }}><MapPin size={13} /> {job.city}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Briefcase size={13} /> {job.jobType.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div style={{ background: "var(--gray-50)", padding: "1rem 1.25rem", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Applications</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Users size={16} className="text-primary-600" /> {job._count?.applications || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Views</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Eye size={16} className="text-secondary" /> {Math.floor(Math.random() * 80) + 12}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", marginTop: "auto" }}>
                  <Link href={`/school/applications?job=${job.id}`} style={{ flex: 1, padding: "0.5rem", textAlign: "center", background: "var(--primary-50)", color: "var(--primary-700)", borderRadius: "var(--radius-lg)", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none" }}>
                    View Applications
                  </Link>
                  <button onClick={() => setEditingJob(job)} style={{ padding: "0.5rem 0.75rem", background: "#fff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDeletingJob({ id: job.id, title: job.title })} style={{ padding: "0.5rem 0.75rem", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "var(--radius-lg)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Job Modal */}
      {editingJob && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }} onClick={() => setEditingJob(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "var(--radius-2xl)", width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "auto", boxShadow: "var(--shadow-xl)" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>Edit Vacancy</h2>
              <button onClick={() => setEditingJob(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            
            <form onSubmit={handleUpdateJob} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Job Title</label>
                <input required className="input" value={editingJob.title} onChange={e => setEditingJob({ ...editingJob, title: e.target.value })} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Status</label>
                  <select className="input" value={editingJob.status} onChange={e => setEditingJob({ ...editingJob, status: e.target.value as any })}>
                    <option value="ACTIVE">Active (Visible)</option>
                    <option value="CLOSED">Closed (Hidden)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Openings</label>
                  <input type="number" min={1} required className="input" value={editingJob.openings || 1} onChange={e => setEditingJob({ ...editingJob, openings: Number(e.target.value) })} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Min Salary (₹)</label>
                  <input type="number" className="input" value={editingJob.salaryMin || ""} onChange={e => setEditingJob({ ...editingJob, salaryMin: Number(e.target.value) || null })} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Max Salary (₹)</label>
                  <input type="number" className="input" value={editingJob.salaryMax || ""} onChange={e => setEditingJob({ ...editingJob, salaryMax: Number(e.target.value) || null })} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Description</label>
                <textarea required rows={4} className="input" style={{ resize: "vertical" }} value={editingJob.description || ""} onChange={e => setEditingJob({ ...editingJob, description: e.target.value })} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-primary)" }}>Perks & Benefits</label>
                <textarea rows={3} className="input" style={{ resize: "vertical" }} placeholder="e.g. Free meals, Medical Insurance..." value={editingJob.perks || ""} onChange={e => setEditingJob({ ...editingJob, perks: e.target.value })} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setEditingJob(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={isUpdating} className="btn btn-primary">
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deletingJob && (
        <div style={{ position: "fixed", inset: 0, zIndex: 110, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }} onClick={() => setDeletingJob(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "var(--radius-2xl)", width: "100%", maxWidth: 400, padding: "2rem", boxShadow: "var(--shadow-xl)", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <Trash2 size={28} />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Delete Job Posting?</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "1.75rem" }}>
              Are you sure you want to permanently delete <strong>"{deletingJob.title}"</strong>? This action cannot be undone and will remove it from the job board.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setDeletingJob(null)} className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }}>
                Cancel
              </button>
              <button onClick={executeDelete} className="btn" style={{ flex: 1, justifyContent: "center", background: "#ef4444", color: "#fff", border: "none" }}>
                Yes, Delete It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
