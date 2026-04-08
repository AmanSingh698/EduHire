"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Menu, X, ChevronDown, Bell, User, Search,
  BookOpen, Building2, LogIn, UserPlus, LogOut
} from "lucide-react";
import { useLogout } from "@/lib/useLogout";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const logout = useLogout();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check if user cookie exists (set by login/register flow)
    const userCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user="));
    setIsLoggedIn(!!userCookie);
  }, []);

  const navLinks = [
    {
      label: "Find Jobs",
      href: "/jobs",
      icon: <Search size={15} />,
      dropdown: [
        { label: "Browse All Jobs", href: "/jobs", desc: "Search from 5000+ vacancies" },
        { label: "Jobs by Subject", href: "/jobs?filter=subject", desc: "Math, Science, English & more" },
        { label: "Jobs by Location", href: "/jobs?filter=location", desc: "City, state or pincode" },
        { label: "Jobs by Board", href: "/jobs?filter=board", desc: "CBSE, ICSE, State Board" },
      ],
    },
    {
      label: "For Schools",
      href: "/school/register",
      icon: <Building2 size={15} />,
      dropdown: [
        { label: "Post a Vacancy", href: "/school/post-job", desc: "Reach 10,000+ qualified teachers" },
        { label: "School Dashboard", href: "/school/dashboard", desc: "Manage your listings" },
        { label: "Register School", href: "/school/register", desc: "Free school registration" },
      ],
    },
    {
      label: "For Teachers",
      href: "/teacher/register",
      icon: <BookOpen size={15} />,
      dropdown: [
        { label: "Create Profile", href: "/teacher/register", desc: "Get discovered by top schools" },
        { label: "Teacher Dashboard", href: "/teacher/dashboard", desc: "Track your applications" },
      ],
    },
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "glass border-b border-gray-200 shadow-sm"
            : "bg-transparent"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="container-custom">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>

            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
              <motion.div
                style={{
                  width: 38, height: 38,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(79,70,229,0.4)",
                }}
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <GraduationCap size={20} color="#fff" />
              </motion.div>
              <span style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                fontSize: "1.3rem",
                color: isScrolled ? "#0f172a" : "#fff",
                letterSpacing: "-0.03em",
              }}>
                {/* Edu<span style={{ color: "#818cf8" }}>Hire</span> */}
                U<span style={{ color: "#818cf8" }}>18</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="hidden-mobile">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  style={{ position: "relative" }}
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    style={{
                      display: "flex", alignItems: "center", gap: "0.35rem",
                      padding: "0.5rem 0.9rem",
                      background: "transparent", border: "none",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.875rem", fontWeight: 500,
                      color: isScrolled ? "var(--text-secondary)" : "rgba(255,255,255,0.85)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    className="nav-hoverable"
                  >
                    {link.label}
                    <ChevronDown size={13}
                      style={{
                        transition: "transform 0.2s",
                        transform: activeDropdown === link.label ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          position: "absolute", top: "calc(100% + 8px)", left: "50%",
                          transform: "translateX(-50%)",
                          background: "#fff",
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-xl)",
                          padding: "0.5rem",
                          minWidth: "240px",
                          boxShadow: "var(--shadow-xl)",
                          zIndex: 100,
                        }}
                      >
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            style={{
                              display: "flex", flexDirection: "column", gap: "0.15rem",
                              padding: "0.65rem 0.85rem",
                              borderRadius: "var(--radius-lg)",
                              textDecoration: "none",
                              transition: "background 0.15s",
                            }}
                            className="dropdown-item"
                          >
                            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                              {item.label}
                            </span>
                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                              {item.desc}
                            </span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} className="hidden-mobile">
              {isLoggedIn ? (
                <button
                  onClick={logout}
                  className="btn btn-ghost btn-sm"
                  style={{ color: isScrolled ? "#dc2626" : "rgba(255,160,160,0.95)", display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              ) : (
                <>
                  <Link href="/auth/login" className="btn btn-ghost btn-sm"
                    style={{ color: isScrolled ? "var(--text-secondary)" : "rgba(255,255,255,0.85)" }}>
                    <LogIn size={15} />
                    Sign In
                  </Link>
                  <Link href="/auth/register/teacher" className="btn btn-primary btn-sm">
                    <UserPlus size={15} />
                    Join Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="show-mobile"
              style={{
                background: "transparent", border: "none",
                color: isScrolled ? "var(--text-primary)" : "#fff",
                cursor: "pointer", padding: "0.4rem",
              }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed", inset: 0, zIndex: 40,
              background: "#fff",
              padding: "5rem 1.5rem 2rem",
              display: "flex", flexDirection: "column", gap: "0.5rem",
              overflowY: "auto",
            }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "1rem",
                    borderRadius: "var(--radius-lg)",
                    textDecoration: "none",
                    fontSize: "1rem", fontWeight: 600,
                    color: "var(--text-primary)",
                    background: "var(--gray-50)",
                    marginBottom: "0.25rem",
                  }}
                >
                  <span style={{ color: "var(--primary-600)" }}>{link.icon}</span>
                  {link.label}
                </Link>
                {link.dropdown.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "block", padding: "0.6rem 1rem 0.6rem 2.75rem",
                      textDecoration: "none",
                      fontSize: "0.875rem", color: "var(--text-secondary)",
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </motion.div>
            ))}

            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {isLoggedIn ? (
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="btn btn-outline"
                  style={{ justifyContent: "center", color: "#dc2626", borderColor: "#dc2626" }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn btn-outline" style={{ justifyContent: "center" }}>
                    Sign In
                  </Link>
                  <Link href="/auth/register/teacher" onClick={() => setMobileOpen(false)} className="btn btn-primary" style={{ justifyContent: "center" }}>
                    Join Free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
        .dropdown-item:hover { background: var(--gray-50); }
        .nav-hoverable:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </>
  );
}
