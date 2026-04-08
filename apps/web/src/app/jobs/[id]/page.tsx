"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Building2, BookOpen, Clock, Calendar,
  CheckCircle, Briefcase, GraduationCap, ArrowLeft,
  Share2, Bookmark, Send, Info, Award, ShieldCheck,
  Zap, Heart, ChevronRight
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { useUser } from "@/lib/useUser";
import { JobVacancy, Application } from "@/lib/types";

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [job, setJob] = useState<JobVacancy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<{ job: JobVacancy }>(`/api/jobs/${id}`);
        setJob(data.job);

        if (user?.role === "TEACHER") {
          const appsRes = await api.get<{ applications: Application[] }>("/api/applications/me");
          const applied = appsRes.applications.some(a => a.jobId === id);
          setHasApplied(applied);
        }
      } catch (err) {
        setError("Job not found or failed to load");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/jobs/${id}`);
      return;
    }
    if (user.role !== "TEACHER") {
      alert("Only teachers can apply for jobs");
      return;
    }

    setIsApplying(true);
    try {
      await api.post("/api/applications", { jobId: id });
      setHasApplied(true);
      alert("Application submitted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <h2 style={{ color: "var(--text-primary)" }}>{error || "Job not found"}</h2>
        <button onClick={() => router.back()} className="btn btn-outline">Go Back</button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--gray-50)", minHeight: "100vh", paddingTop: "80px", paddingBottom: "4rem" }}>
        <div className="container-custom">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "none", border: "none", color: "var(--text-secondary)",
              fontWeight: 600, cursor: "pointer", marginBottom: "1.5rem",
              fontSize: "0.9rem", transition: "color 0.2s"
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--primary-600)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <ArrowLeft size={16} /> Back to Search
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2rem", alignItems: "start" }} className="job-details-grid">
            {/* Left Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Header Card */}
              <div className="card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", gap: "1.25rem" }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "16px", background: "#4f46e512",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1.5px solid #4f46e520", fontSize: "1.75rem", flexShrink: 0
                    }}>
                      {job.school?.logoUrl ? <img src={job.school.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", borderRadius: "inherit" }} /> : "🏫"}
                    </div>
                    <div>
                      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem", lineHeight: 1.2 }}>
                        {job.title}
                      </h1>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        <Link href={`/schools/${job.school?.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--primary-600)", fontWeight: 700, fontSize: "0.95rem" }}>
                          {job.school?.name}
                        </Link>
                        {job.school?.isVerified && (
                          <span className="verified-badge" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                            <ShieldCheck size={12} /> Verified
                          </span>
                        )}
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <MapPin size={14} /> {job.city}, {job.state}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-outline" style={{ padding: "0.5rem" }}><Share2 size={18} /></button>
                    <button className="btn btn-outline" style={{ padding: "0.5rem" }}><Bookmark size={18} /></button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", padding: "1.25rem", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
                  {[
                    { label: "Salary", value: job.salaryMin ? `₹${(job.salaryMin / 1000).toFixed(0)}k–${(job.salaryMax! / 1000).toFixed(0)}k` : "Not disclosed", icon: <Zap size={16} /> },
                    { label: "Experience", value: job.experience || "Any", icon: <Briefcase size={16} /> },
                    { label: "Job Type", value: job.jobType.replace("_", " "), icon: <Clock size={16} /> },
                    { label: "Posted On", value: new Date(job.createdAt).toLocaleDateString(), icon: <Calendar size={16} /> },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        {item.icon} {item.label}
                      </div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Content */}
              <div className="card" style={{ padding: "2rem" }}>
                <section style={{ marginBottom: "2.5rem" }}>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Info size={20} color="var(--primary-600)" /> Job Description
                  </h2>
                  <div style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                    {job.description}
                  </div>
                </section>

                <section style={{ marginBottom: "2.5rem" }}>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <GraduationCap size={20} color="var(--primary-600)" /> Requirements
                  </h2>
                  <div style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                    {job.requirements || "No specific requirements mentioned."}
                  </div>
                </section>

                <section>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Award size={20} color="var(--primary-600)" /> Benefits & Perks
                  </h2>
                  <div style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                    {job.perks || "No specific benefits mentioned."}
                  </div>
                </section>
              </div>
            </div>

            {/* Right Sidebar */}
            <div style={{ position: "sticky", top: "100px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Apply Card */}
              <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Want this role?</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                  Submit your application now and stand out to the school recruiters.
                </p>

                {hasApplied ? (
                  <div style={{ padding: "1rem", background: "var(--success-50)", border: "1px solid var(--success-200)", borderRadius: "var(--radius-lg)", color: "var(--success-700)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <CheckCircle size={18} /> Already Applied
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center", padding: "0.85rem" }}
                  >
                    {isApplying ? "Applying..." : "Apply Now"} <Send size={18} style={{ marginLeft: "0.5rem" }} />
                  </button>
                )}

                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "1rem" }}>
                  By applying, you agree to our terms of service.
                </p>
              </div>

              {/* School Preview */}
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>About the School</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "10px", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>🏫</div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{job.school?.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{job.school?.city}, {job.school?.state}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Board</span>
                    <span style={{ fontWeight: 600 }}>{job.board}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Type</span>
                    <span style={{ fontWeight: 600 }}>Private</span>
                  </div>
                </div>
                <Link href={`/schools/${job.school?.id}`} className="btn btn-outline" style={{ width: "100%", justifyContent: "center", marginTop: "1rem", fontSize: "0.85rem" }}>
                  View School Profile <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .job-details-grid { grid-template-columns: 1fr !important; }
        }
        .spinner {
          width: 40px; height: 40px;
          border: 4px solid var(--gray-200);
          border-top: 4px solid var(--primary-600);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
