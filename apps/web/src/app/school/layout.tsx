"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap, Users, Briefcase, Plus,
  CheckCircle, BarChart2, Settings, LogOut,
  Building2
} from "lucide-react";
import { useUser } from "@/lib/useUser";
import { useLogout } from "@/lib/useLogout";
import { api } from "@/lib/api";

const NAV_ITEMS = [
  { label: "Dashboard", icon: <BarChart2 size={18} />, href: "/school/dashboard" },
  { label: "Post a Job", icon: <Plus size={18} />, href: "/school/post-job" },
  { label: "My Vacancies", icon: <Briefcase size={18} />, href: "/school/vacancies" },
  { label: "Applications", icon: <Users size={18} />, href: "/school/applications" },
  { label: "School Profile", icon: <Building2 size={18} />, href: "/school/profile" },
  { label: "Settings", icon: <Settings size={18} />, href: "/school/settings" },
];

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const logout = useLogout();
  
  const [school, setSchool] = useState<any>(null);
  const [appCount, setAppCount] = useState(0);

  useEffect(() => {
    if (userLoading) return;
    if (!user || user.role !== "SCHOOL_ADMIN") {
      router.push("/auth/login");
      return;
    }

    const loadSidebarData = async () => {
      try {
        const [schoolRes, appsRes] = await Promise.all([
          api.get<any>("/api/schools/me"),
          api.get<any>("/api/applications/school")
        ]);
        setSchool(schoolRes.school);
        const pending = appsRes.applications.filter((a: any) => a.status === "PENDING").length;
        setAppCount(pending);
      } catch (err) {
        console.error("Failed to load school sidebar data", err);
      }
    };
    loadSidebarData();
  }, [user, userLoading, router, pathname]); // load when navigating to see live updates potentially

  if (userLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

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
              U<span style={{ color: "#4f46e5" }}>18</span>
            </span>
          </Link>
        </div>

        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 42, height: 42, borderRadius: "12px", background: "linear-gradient(135deg, #0f172a, #1e293b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
              {school?.logoUrl ? <img src={school.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} /> : "🏫"}
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{school?.name || "School Profile"}</div>
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
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/school/dashboard");
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${isActive ? "active" : ""}`} style={{ textDecoration: "none" }}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.label === "Applications" && appCount > 0 && pathname !== "/school/applications" && (
                  <span style={{ marginLeft: "auto", background: "var(--primary-600)", color: "#fff", borderRadius: "var(--radius-full)", padding: "0.05rem 0.45rem", fontSize: "0.7rem", fontWeight: 700 }}>
                    {appCount}
                  </span>
                )}
              </Link>
            );
          })}
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

      {/* Main Content Render Area */}
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        {children}
      </main>

      <style>{`
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
