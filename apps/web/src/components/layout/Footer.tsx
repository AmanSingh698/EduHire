"use client";
import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const XIcon = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const LinkedinIcon = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const FacebookIcon = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;

export default function Footer() {
  const links = {
    "For Teachers": [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Create Profile", href: "/teacher/register" },
      { label: "My Applications", href: "/teacher/dashboard" },
      { label: "Job Alerts", href: "/teacher/dashboard#alerts" },
    ],
    "For Schools": [
      { label: "Post a Vacancy", href: "/school/post-job" },
      { label: "Register School", href: "/school/register" },
      { label: "School Dashboard", href: "/school/dashboard" },
      { label: "Verification", href: "/school/register#verify" },
    ],
    "Explore": [
      { label: "Jobs by Subject", href: "/jobs?filter=subject" },
      { label: "Jobs by Location", href: "/jobs?filter=location" },
      { label: "CBSE Schools", href: "/jobs?board=cbse" },
      { label: "ICSE Schools", href: "/jobs?board=icse" },
    ],
    "Company": [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  const socials = [
    { Icon: XIcon, href: "#", label: "X (Twitter)" },
    { Icon: LinkedinIcon, href: "#", label: "LinkedIn" },
    { Icon: FacebookIcon, href: "#", label: "Facebook" },
    { Icon: InstagramIcon, href: "#", label: "Instagram" },
  ];

  return (
    <footer style={{ background: "var(--gray-950)", color: "var(--gray-400)" }}>
      {/* Newsletter strip */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary-600), #7c3aed)",
        padding: "3rem 0",
      }}>
        <div className="container-custom">
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between", gap: "1.5rem",
          }}>
            <div>
              <h3 style={{
                color: "#fff", fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.4rem",
              }}>
                Get job alerts in your inbox 📩
              </h3>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>
                Be the first to know about new teaching vacancies near you.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  padding: "0.7rem 1.25rem",
                  borderRadius: "var(--radius-full)",
                  border: "none",
                  fontSize: "0.9rem",
                  minWidth: "260px",
                  outline: "none",
                }}
              />
              <button className="btn" style={{
                background: "#fff", color: "var(--primary-700)",
                padding: "0.7rem 1.5rem", borderRadius: "var(--radius-full)",
                fontWeight: 700,
                display: "flex", alignItems: "center", gap: "0.4rem",
              }}>
                Subscribe <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom" style={{ padding: "4rem 1.5rem 2rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "3rem",
          marginBottom: "3rem",
        }}>
          {/* Brand */}
          <div style={{ gridColumn: "span 1" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.55rem", textDecoration: "none", marginBottom: "1rem" }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <GraduationCap size={18} color="#fff" />
              </div>
              <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#fff" }}>
                Edu<span style={{ color: "#818cf8" }}>Hire</span>
              </span>
            </Link>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "1.25rem", color: "var(--gray-500)" }}>
              India's dedicated platform connecting qualified teachers with the right schools.
            </p>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: 34, height: 34,
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--gray-400)",
                    transition: "all 0.2s",
                    textDecoration: "none",
                  }}
                  className="social-link"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 style={{
                fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", color: "#fff", marginBottom: "1rem",
              }}>
                {category}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} style={{
                      fontSize: "0.875rem", color: "var(--gray-500)",
                      textDecoration: "none", transition: "color 0.15s",
                    }}
                    className="footer-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact row */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "2rem",
          display: "flex", flexWrap: "wrap",
          alignItems: "center", justifyContent: "space-between",
          gap: "1rem",
        }}>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {[
              { icon: <Mail size={14} />, text: "hello@eduhire.in" },
              { icon: <Phone size={14} />, text: "+91 98765 43210" },
              { icon: <MapPin size={14} />, text: "New Delhi, India" },
            ].map(({ icon, text }) => (
              <span key={text} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "var(--gray-600)" }}>
                <span style={{ color: "var(--primary-400)" }}>{icon}</span>
                {text}
              </span>
            ))}
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--gray-700)" }}>
            © {new Date().getFullYear()} EduHire. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        .social-link:hover { background: rgba(99,102,241,0.2) !important; color: var(--primary-400) !important; border-color: var(--primary-600) !important; }
        .footer-link:hover { color: var(--primary-400) !important; }
      `}</style>
    </footer>
  );
}
