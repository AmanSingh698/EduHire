"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Search, MapPin, BookOpen, Building2, GraduationCap,
  ArrowRight, CheckCircle, Star, TrendingUp, Sparkles,
  Users, Briefcase, Award, ChevronRight, Shield,
  Clock, Zap, Heart
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { JobVacancy } from "@/lib/types";

/* ─── Animated counter ─────────────────────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true;
        const duration = 2000;
        const start = performance.now();
        const tick = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString("en-IN")}{suffix}</span>;
}

/* ─── Job Card ──────────────────────────────────── */
function FeaturedJobCard({ job, index }: { job: JobVacancy; index: number }) {
  const salary = job.salaryMin
    ? `₹${Math.round(job.salaryMin / 1000)}k–${Math.round((job.salaryMax ?? job.salaryMin) / 1000)}k/mo`
    : "Salary not disclosed";
  const posted = new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const COLORS = [
    ["#4f46e5", "#7c3aed"], ["#0891b2", "#0e7490"], ["#059669", "#047857"],
  ];
  const [c1, c2] = COLORS[index % COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
        <div className="card" style={{ padding: "1.5rem", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
          onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-lg)"; }}
          onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{
              width: 48, height: 48, borderRadius: "12px",
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: "1.25rem", overflow: "hidden",
            }}>
              {job.school?.logoUrl
                ? <img src={job.school.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : "🏫"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.2rem" }}>
                    {job.title}
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
                    <Building2 size={12} />
                    {job.school?.name}
                    {job.school?.isVerified && (
                      <span className="verified-badge" style={{ fontSize: "0.68rem" }}>
                        <CheckCircle size={10} /> Verified
                      </span>
                    )}
                  </p>
                </div>
                <span className="badge badge-primary" style={{ flexShrink: 0, fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                  {job.jobType.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
            {job.city && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                <MapPin size={11} /> {job.city}, {job.state}
              </span>
            )}
            {job.board && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                <BookOpen size={11} /> {job.board}
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "var(--success-600)", fontWeight: 700 }}>
              {salary}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {job.gradeLevel && <span className="badge badge-gray" style={{ fontSize: "0.7rem" }}>{job.gradeLevel}</span>}
              {job.subject && <span className="badge badge-gray" style={{ fontSize: "0.7rem" }}>{job.subject}</span>}
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <Clock size={11} /> {posted}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Job Card Skeleton ─────────────────────────── */
function JobCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.08 }}
      style={{ padding: "1.5rem", background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)" }}
    >
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--gray-100)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, background: "var(--gray-100)", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 11, background: "var(--gray-100)", borderRadius: 6, width: "60%", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {[80, 60, 90].map(w => <div key={w} style={{ height: 10, width: w, background: "var(--gray-100)", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />)}
      </div>
    </motion.div>
  );
}

const STATS = [
  { icon: <Building2 size={28} />, value: 2000, suffix: "+", label: "Verified Schools", color: "#4f46e5" },
  { icon: <Users size={28} />, value: 12000, suffix: "+", label: "Teachers Registered", color: "#7c3aed" },
  { icon: <Briefcase size={28} />, value: 5400, suffix: "+", label: "Jobs Posted", color: "#0891b2" },
  { icon: <Award size={28} />, value: 1800, suffix: "+", label: "Successful Placements", color: "#059669" },
];

const HOW_IT_WORKS_TEACHER = [
  { step: "01", title: "Create Your Profile", desc: "Upload your resume, add subjects, experience, and preferred locations.", icon: <Users size={22} /> },
  { step: "02", title: "Discover Jobs", desc: "Search and filter 5000+ vacancies by subject, city, board, and salary.", icon: <Search size={22} /> },
  { step: "03", title: "Apply in One Click", desc: "Send your application with a personalised cover letter instantly.", icon: <Zap size={22} /> },
];

const HOW_IT_WORKS_SCHOOL = [
  { step: "01", title: "Register Your School", desc: "Verify your school with UDISE code and get a trusted badge.", icon: <Shield size={22} /> },
  { step: "02", title: "Post a Vacancy", desc: "Describe the role, grade, board, and salary in minutes.", icon: <Briefcase size={22} /> },
  { step: "03", title: "Review & Hire", desc: "Shortlist candidates, send interview invites, and hire the best.", icon: <CheckCircle size={22} /> },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma", role: "Mathematics Teacher", location: "New Delhi",
    text: "Found my dream school job within 2 weeks of joining EduHire! The filters made it so easy to find CBSE schools near me.", avatar: "PS", stars: 5,
  },
  {
    name: "DPS Administration", role: "School Admin", location: "Noida",
    text: "We hired 3 qualified teachers in under a month. The quality of applicants on EduHire is far better than general job portals.", avatar: "DP", stars: 5,
  },
  {
    name: "Rajiv Kumar", role: "Science Teacher", location: "Bengaluru",
    text: "As a first-time job seeker, EduHire guided me through building my profile. Got shortlisted by 5 schools!", avatar: "RK", stars: 5,
  },
];

/* ─── Page ──────────────────────────────────────── */
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"teacher" | "school">("teacher");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState<JobVacancy[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    api.get<{ jobs: JobVacancy[] }>("/api/jobs", { limit: "3", page: "1" } as any)
      .then(res => setFeaturedJobs(res.jobs ?? []))
      .catch(() => {})
      .finally(() => setJobsLoading(false));
  }, []);

  const subjects = ["Mathematics", "Science", "English", "Hindi", "Social Studies", "Computer Science", "Physics", "Chemistry"];

  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ──────────────────────────────────── */}
        <section style={{
          position: "relative", minHeight: "100vh",
          background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)",
          display: "flex", alignItems: "center",
          paddingTop: "68px", overflow: "hidden",
        }}>
          {/* Blobs */}
          <div className="blob blob-primary animate-float" style={{ width: 600, height: 600, top: -100, right: -100, opacity: 0.6 }} />
          <div className="blob blob-violet" style={{ width: 400, height: 400, bottom: -50, left: -100, opacity: 0.5, animationDelay: "2s" }} />
          <div className="blob blob-accent" style={{ width: 300, height: 300, top: "30%", right: "20%", opacity: 0.3, animationDelay: "1s" }} />

          {/* Dots grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }} />

          <div className="container-custom" style={{ position: "relative", zIndex: 1, paddingTop: "4rem", paddingBottom: "6rem" }}>
            <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>

              {/* Pill label */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ marginBottom: "1.5rem" }}
              >
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.4rem 1rem",
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.8rem", fontWeight: 600, color: "#a5b4fc",
                  letterSpacing: "0.04em",
                }}>
                  <Sparkles size={13} />
                  India's #1 Platform for Teacher Hiring
                  <Sparkles size={13} />
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1.1, marginBottom: "1.25rem",
                  letterSpacing: "-0.03em",
                }}
              >
                Find Your Perfect{" "}
                <span className="gradient-text">
                  Teaching Role
                </span>
                <br />Across India 🎓
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                style={{
                  fontSize: "1.15rem", color: "rgba(255,255,255,0.65)",
                  marginBottom: "2.5rem", maxWidth: 560, margin: "0 auto 2.5rem",
                  lineHeight: 1.7,
                }}
              >
                Connect with 2,000+ verified schools across India. Search by subject, location,
                board and salary — all in one place.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="glass"
                style={{
                  borderRadius: "var(--radius-2xl)",
                  padding: "0.5rem",
                  marginBottom: "2rem",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                  <div style={{ flex: "2 1 200px", display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem" }}>
                    <Search size={18} style={{ color: "var(--primary-400)", flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Job title, subject, school..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: "transparent", border: "none", outline: "none",
                        color: "#fff", fontSize: "0.95rem", width: "100%",
                      }}
                    />
                  </div>
                  <div style={{
                    width: "1px", background: "rgba(255,255,255,0.1)",
                    margin: "0.5rem 0", flexShrink: 0,
                  }} className="divider-vert" />
                  <div style={{ flex: "1 1 160px", display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem" }}>
                    <MapPin size={18} style={{ color: "var(--primary-400)", flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="City, State or Pincode"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      style={{
                        background: "transparent", border: "none", outline: "none",
                        color: "#fff", fontSize: "0.95rem", width: "100%",
                      }}
                    />
                  </div>
                  <Link
                    href={`/jobs?q=${searchQuery}&location=${searchLocation}`}
                    className="btn btn-primary btn-lg"
                    style={{ borderRadius: "var(--radius-xl)", flexShrink: 0, margin: "0.1rem" }}
                  >
                    <Search size={18} />
                    Search Jobs
                  </Link>
                </div>
              </motion.div>

              {/* Quick tags */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}
              >
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>Popular:</span>
                {subjects.slice(0, 6).map((s) => (
                  <Link
                    key={s}
                    href={`/jobs?subject=${s}`}
                    style={{
                      padding: "0.3rem 0.85rem",
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.78rem", color: "rgba(255,255,255,0.7)",
                      textDecoration: "none", transition: "all 0.2s",
                    }}
                    className="subject-tag"
                  >
                    {s}
                  </Link>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Wave divider */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
              <path d="M0 80L1440 80L1440 0C1440 0 1080 80 720 40C360 0 0 60 0 60L0 80Z" fill="#fff" />
            </svg>
          </div>
        </section>

        {/* ── STATS ──────────────────────────────────── */}
        <section style={{ padding: "4rem 0", background: "#fff" }}>
          <div className="container-custom">
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1.5rem",
            }}>
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{ textAlign: "center" }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: "16px", margin: "0 auto 0.75rem",
                    background: `${stat.color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: stat.color,
                  }}>
                    {stat.icon}
                  </div>
                  <div style={{
                    fontSize: "2.2rem", fontWeight: 900,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.04em",
                  }}>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DUAL CTA ──────────────────────────────── */}
        <section style={{ padding: "5rem 0", background: "var(--gray-50)" }}>
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ textAlign: "center", marginBottom: "3rem" }}
            >
              <div className="section-label" style={{ justifyContent: "center", width: "fit-content", margin: "0 auto 1rem" }}>
                <Heart size={12} /> Built for Education
              </div>
              <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "var(--text-primary)" }}>
                One Platform. Two Powerful Portals.
              </h2>
              <p style={{ color: "var(--text-secondary)", marginTop: "0.75rem", fontSize: "1rem", maxWidth: "500px", margin: "0.75rem auto 0" }}>
                Whether you're a school looking to hire or a teacher seeking opportunity —
                EduHire has you covered.
              </p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {/* Teacher CTA */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  borderRadius: "var(--radius-2xl)",
                  padding: "2.5rem",
                  color: "#fff",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                <div style={{ position: "absolute", bottom: -20, left: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👩‍🏫</div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>I'm a Teacher</h3>
                  <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                    Create your profile, showcase your qualifications, and get discovered by top schools across India.
                  </p>
                  {["Free to join", "5000+ job listings", "Apply in one click"].map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.85)" }}>
                      <CheckCircle size={14} /> {f}
                    </div>
                  ))}
                  <Link href="/auth/register/teacher" className="btn" style={{
                    marginTop: "1.5rem", background: "#fff", color: "var(--primary-700)",
                    fontWeight: 700, padding: "0.75rem 1.75rem",
                    borderRadius: "var(--radius-full)",
                  }}>
                    Find Teaching Jobs <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>

              {/* School CTA */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                style={{
                  background: "linear-gradient(135deg, #0f172a, #1e293b)",
                  borderRadius: "var(--radius-2xl)",
                  padding: "2.5rem",
                  color: "#fff",
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(79,70,229,0.08)" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏫</div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>I'm a School</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                    Register your school, post vacancies, and connect with thousands of qualified teachers in minutes.
                  </p>
                  {["UDISE verification", "Reach 12,000+ teachers", "Manage applications easily"].map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.75)" }}>
                      <CheckCircle size={14} style={{ color: "#818cf8" }} /> {f}
                    </div>
                  ))}
                  <Link href="/school/register" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
                    Post a Vacancy <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── FEATURED JOBS ─────────────────────────── */}
        <section style={{ padding: "5rem 0", background: "#fff" }}>
          <div className="container-custom">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div className="section-label">
                  <TrendingUp size={12} /> Latest Openings
                </div>
                <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: 800, color: "var(--text-primary)" }}>
                  Featured Teaching Jobs
                </h2>
              </div>
              <Link href="/jobs" className="btn btn-outline">
                View All Jobs <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
              {jobsLoading
                ? [0, 1, 2].map(i => <JobCardSkeleton key={i} index={i} />)
                : featuredJobs.length > 0
                  ? featuredJobs.map((job, i) => <FeaturedJobCard key={job.id} job={job} index={i} />)
                  : (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                      <Briefcase size={32} style={{ margin: "0 auto 0.75rem", display: "block", opacity: 0.4 }} />
                      <p style={{ marginBottom: "1rem" }}>No jobs posted yet. Be the first school to post!</p>
                      <Link href="/auth/register" className="btn btn-primary" style={{ display: "inline-flex" }}>Post a Vacancy</Link>
                    </div>
                  )
              }
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────── */}
        <section style={{ padding: "5rem 0", background: "linear-gradient(180deg, var(--gray-50) 0%, #fff 100%)" }}>
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ textAlign: "center", marginBottom: "2.5rem" }}
            >
              <div className="section-label" style={{ justifyContent: "center", width: "fit-content", margin: "0 auto 1rem" }}>
                <Zap size={12} /> Simple & Fast
              </div>
              <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: 800, color: "var(--text-primary)" }}>
                How EduHire Works
              </h2>
            </motion.div>

            {/* Tab toggle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "3rem" }}>
              <div style={{
                display: "flex", background: "var(--gray-100)",
                borderRadius: "var(--radius-full)", padding: "0.3rem", gap: "0.25rem",
              }}>
                {(["teacher", "school"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                    style={{ textTransform: "capitalize" }}
                  >
                    {tab === "teacher" ? "👩‍🏫 For Teachers" : "🏫 For Schools"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
              {(activeTab === "teacher" ? HOW_IT_WORKS_TEACHER : HOW_IT_WORKS_SCHOOL).map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  style={{
                    padding: "2rem",
                    borderRadius: "var(--radius-xl)",
                    background: "#fff",
                    border: "1px solid var(--border-color)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 1.5, right: 1.5,
                    fontSize: "4rem", fontWeight: 900,
                    color: "var(--primary-50)",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    lineHeight: 1,
                    letterSpacing: "-0.05em",
                  }}>
                    {step.step}
                  </div>
                  <div style={{
                    width: 48, height: 48, borderRadius: "14px",
                    background: "var(--primary-50)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--primary-600)", marginBottom: "1rem",
                  }}>
                    {step.icon}
                  </div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────── */}
        <section style={{ padding: "5rem 0", background: "#fff" }}>
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ textAlign: "center", marginBottom: "3rem" }}
            >
              <div className="section-label" style={{ justifyContent: "center", width: "fit-content", margin: "0 auto 1rem" }}>
                <Star size={12} /> Success Stories
              </div>
              <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: 800, color: "var(--text-primary)" }}>
                Trusted by Teachers & Schools
              </h2>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card"
                  style={{ padding: "1.75rem" }}
                >
                  <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem", fontStyle: "italic" }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="avatar" style={{ width: 38, height: 38, fontSize: "0.8rem" }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>{t.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{t.role} · {t.location}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ────────────────────────────── */}
        <section style={{ padding: "5rem 0" }}>
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0891b2 100%)",
                backgroundSize: "200% 200%",
                borderRadius: "var(--radius-2xl)",
                padding: "clamp(2.5rem, 6vw, 4rem)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
              className="animated-bg"
            >
              <div className="blob" style={{ width: 400, height: 400, top: -150, right: -100, background: "rgba(255,255,255,0.07)", filter: "blur(60px)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{
                  fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 900, color: "#fff",
                  marginBottom: "1rem", letterSpacing: "-0.03em",
                }}>
                  Ready to Transform Your Career? 🚀
                </h2>
                <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: "2rem", fontSize: "1.05rem", maxWidth: 480, margin: "0 auto 2rem" }}>
                  Join thousands of teachers and schools already using EduHire. It's completely free to get started.
                </p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/auth/register/teacher" className="btn btn-xl" style={{ background: "#fff", color: "var(--primary-700)", fontWeight: 700 }}>
                    <GraduationCap size={20} />
                    Join as Teacher
                  </Link>
                  <Link href="/school/register" className="btn btn-xl" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                    <Building2 size={20} />
                    Register School
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        .subject-tag:hover { background: rgba(255,255,255,0.15) !important; color: #fff !important; border-color: rgba(99,102,241,0.4) !important; }
        @media (max-width: 640px) { .divider-vert { display: none; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </>
  );
}
