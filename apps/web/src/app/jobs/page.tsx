"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search, MapPin, SlidersHorizontal, BookOpen, Building2,
  CheckCircle, Clock, Bookmark, BookmarkCheck, ChevronRight,
  X, Filter, TrendingUp, ArrowUpDown, Star
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { JobVacancy, BoardType, JobType } from "@/lib/types";

const SUBJECTS = ["Mathematics", "Science", "English", "Hindi", "Social Studies", "Computer Science", "Arts", "Physical Education"];
const BOARDS: BoardType[]   = ["CBSE", "ICSE", "STATE", "IB", "IGCSE"];
const JOB_TYPES: JobType[] = ["FULL_TIME", "PART_TIME", "CONTRACT", "VISITING"];
const STATES   = ["Delhi", "Maharashtra", "Karnataka", "Uttar Pradesh", "Rajasthan", "Telangana", "Himachal Pradesh"];

/* ── Job Card ────────────────────────────────────── */
function JobCard({ job, saved, onSave }: { job: JobVacancy; saved: boolean; onSave: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          {/* Avatar / Placeholder */}
          <div style={{
            width: 52, height: 52, borderRadius: "14px", flexShrink: 0,
            background: "#4f46e518",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", border: "1.5px solid #4f46e525",
          }}>
            {job.school?.logoUrl ? <img src={job.school.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", borderRadius: "inherit" }} /> : "🏫"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <Link href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
                <h3 style={{
                  fontSize: "1.02rem", fontWeight: 700, color: "var(--text-primary)",
                  transition: "color 0.15s", lineHeight: 1.3,
                }}
                  className="job-title-link">
                  {job.title}
                </h3>
              </Link>
              <button
                onClick={onSave}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: saved ? "var(--primary-600)" : "var(--text-muted)",
                  padding: "0.2rem", flexShrink: 0, transition: "color 0.2s",
                }}
              >
                {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Building2 size={13} /> {job.school?.name}
              </span>
              {job.school?.isVerified && (
                <span className="verified-badge" style={{ fontSize: "0.68rem" }}>
                  <CheckCircle size={10} /> Verified
                </span>
              )}
            </div>

            {/* Meta row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.85rem" }}>
              {[
                { icon: <MapPin size={12} />, text: `${job.city}, ${job.state}` },
                { icon: <BookOpen size={12} />, text: job.board },
                { icon: <span style={{ fontSize: "0.75rem" }}>🎓</span>, text: job.gradeLevel },
              ].map(({ icon, text }) => (
                <span key={text} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {icon} {text}
                </span>
              ))}
              <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--success-600)" }}>
                {job.salaryMin ? `₹${(job.salaryMin / 1000).toFixed(0)}k–${(job.salaryMax! / 1000).toFixed(0)}k / mo` : "Salary not disclosed"}
              </span>
            </div>

            {/* Bottom row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                <span className={`badge ${job.jobType === "FULL_TIME" ? "badge-primary" : "badge-gray"}`} style={{ fontSize: "0.72rem" }}>
                  {job.jobType.replace("_", " ")}
                </span>
                <span className="badge badge-gray" style={{ fontSize: "0.72rem" }}>{job.subject}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Clock size={11} /> Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {job._count?.applications || 0} applied
                </span>
                <Link href={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
                  Apply Now <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Filter Checkbox ─────────────────────────────── */
function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="filter-checkbox" onClick={onChange} style={{ userSelect: "none", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", padding: "0.25rem 0" }}>
      <input type="checkbox" checked={checked} onChange={() => {}} style={{ display: "none" }} />
      <div style={{
        width: 16, height: 16, borderRadius: "4px", flexShrink: 0,
        border: checked ? "none" : "1.5px solid var(--gray-300)",
        background: checked ? "var(--primary-600)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {checked && <CheckCircle size={10} color="#fff" strokeWidth={3} />}
      </div>
      {label}
    </label>
  );
}

/* ── Page ────────────────────────────────────────── */
export default function JobsPage() {
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "salary">("newest");

  const [filters, setFilters] = useState({
    subjects: [] as string[],
    boards: [] as string[],
    types: [] as string[],
    states: [] as string[],
    salaryMin: 0,
  });

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        q: search || undefined,
        city: locationSearch || undefined,
        subject: filters.subjects.length ? filters.subjects.join(",") : undefined,
        board: filters.boards.length ? filters.boards.join(",") : undefined,
        type: filters.types.length ? filters.types.join(",") : undefined,
        state: filters.states.length ? filters.states.join(",") : undefined,
      };
      const res = await api.get<{ jobs: JobVacancy[] }>("/api/search/jobs", params);
      
      let sorted = res.jobs;
      if (sortBy === "salary") {
        sorted = [...sorted].sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
      }
      setJobs(sorted);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadJobs(), 300);
    return () => clearTimeout(timer);
  }, [search, locationSearch, filters, sortBy]);

  const toggleFilter = (key: keyof typeof filters, value: string | number) => {
    setFilters((prev: any) => {
      const arr = prev[key];
      if (Array.isArray(arr)) {
        return {
          ...prev,
          [key]: arr.includes(value) ? arr.filter((v: any) => v !== value) : [...arr, value],
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const activeFilterCount =
    filters.subjects.length + filters.boards.length + filters.types.length + filters.states.length;

  const clearFilters = () => setFilters({ subjects: [], boards: [], types: [], states: [], salaryMin: 0 });

  const FilterSidebar = () => (
    <div style={{
      width: "100%",
      background: "#fff",
      borderRadius: "var(--radius-xl)",
      border: "1px solid var(--border-color)",
      overflow: "hidden",
    }}>
      <div style={{ padding: "1.25rem 1.25rem 0.75rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Filter size={15} /> Filters
          {activeFilterCount > 0 && (
            <span style={{ background: "var(--primary-600)", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>
              {activeFilterCount}
            </span>
          )}
        </span>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} style={{ background: "none", border: "none", fontSize: "0.78rem", color: "var(--primary-600)", cursor: "pointer", fontWeight: 600 }}>
            Clear all
          </button>
        )}
      </div>

      <div style={{ padding: "0.5rem 1.25rem 1.25rem" }}>
        {[
          { title: "Subject", key: "subjects" as const, items: SUBJECTS },
          { title: "School Board", key: "boards" as const, items: BOARDS },
          { title: "Job Type", key: "types" as const, items: JOB_TYPES },
          { title: "State", key: "states" as const, items: STATES },
        ].map(({ title, key, items }) => (
          <div key={title} style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "0.6rem" }}>{title}</div>
            {items.map((item) => (
              <FilterCheckbox
                key={item} label={item.replace("_", " ")}
                checked={(filters[key] as string[]).includes(item)}
                onChange={() => toggleFilter(key, item)}
              />
            ))}
          </div>
        ))}

        {/* Salary */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "0.6rem" }}>Min. Salary</div>
          {[0, 20000, 30000, 40000, 50000].map((val) => (
            <FilterCheckbox
              key={val}
              label={val === 0 ? "Any" : `₹${(val / 1000).toFixed(0)}k+`}
              checked={filters.salaryMin === val}
              onChange={() => setFilters((p) => ({ ...p, salaryMin: val }))}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--gray-50)", minHeight: "100vh", paddingTop: "68px" }}>

        {/* Search header */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
          padding: "2.5rem 0",
        }}>
          <div className="container-custom">
            <motion.h1
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 2rem)", marginBottom: "1.25rem" }}
            >
              Teaching Jobs Across India 📚
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                display: "flex", flexWrap: "wrap", gap: "0.5rem",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-xl)",
                padding: "0.4rem",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ flex: "2 1 200px", display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.6rem 0.85rem" }}>
                <Search size={16} style={{ color: "var(--primary-400)", flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title, subject, school..."
                  style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "0.9rem", width: "100%" }}
                />
              </div>
              <div style={{ flex: "1 1 140px", display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.6rem 0.85rem", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
                <MapPin size={16} style={{ color: "var(--primary-400)", flexShrink: 0 }} />
                <input
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="City, state..."
                  style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "0.9rem", width: "100%" }}
                />
              </div>
              <button onClick={loadJobs} className="btn btn-primary" style={{ borderRadius: "var(--radius-lg)" }}>
                <Search size={16} /> Search
              </button>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="container-custom" style={{ padding: "2rem 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem", alignItems: "start" }} className="jobs-grid">

            {/* Sidebar — desktop */}
            <div className="sidebar-desktop">
              <FilterSidebar />
            </div>

            {/* Main content */}
            <div>
              {/* Toolbar */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                    <strong style={{ color: "var(--text-primary)" }}>{jobs.length}</strong> jobs found
                  </span>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="btn btn-secondary btn-sm show-mobile"
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    <SlidersHorizontal size={14} />
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{
                      padding: "0.4rem 0.75rem",
                      borderRadius: "var(--radius-lg)",
                      border: "1.5px solid var(--border-color)",
                      fontSize: "0.85rem",
                      color: "var(--text-primary)",
                      background: "#fff",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="salary">Highest Salary</option>
                  </select>
                </div>
              </div>

              {/* Job List */}
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <div style={{ padding: "5rem", textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
                ) : jobs.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id} job={job}
                        saved={savedJobs.has(job.id)}
                        onSave={() => setSavedJobs((prev) => {
                          const next = new Set(prev);
                          next.has(job.id) ? next.delete(job.id) : next.add(job.id);
                          return next;
                        })}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ textAlign: "center", padding: "5rem 2rem" }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>No jobs found</h3>
                    <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Try adjusting your search or filters.</p>
                    <button onClick={clearFilters} className="btn btn-outline">Clear Filters</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: "fixed", top: 0, left: 0, bottom: 0,
                width: "min(360px, 90vw)", background: "#fff",
                zIndex: 51, overflowY: "auto", padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>Filters</h3>
                <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>
              <FilterSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />

      <style>{`
        .job-title-link:hover { color: var(--primary-600) !important; }
        @media (max-width: 900px) {
          .jobs-grid { grid-template-columns: 1fr !important; }
          .sidebar-desktop { display: none; }
        }
        @media (min-width: 901px) {
          .show-mobile { display: none !important; }
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
