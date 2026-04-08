/**
 * Shared types that mirror the Prisma schema / API response shapes.
 * Import these in both API route handlers and frontend pages.
 */

// ── Enums ────────────────────────────────────────────────

export type UserRole = "TEACHER" | "SCHOOL_ADMIN";
export type ApplicationStatus = "PENDING" | "VIEWED" | "SHORTLISTED" | "INTERVIEW" | "REJECTED" | "HIRED";
export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "VISITING";
export type BoardType = "CBSE" | "ICSE" | "STATE" | "IB" | "IGCSE" | "NIOS" | "OTHER";
export type SchoolType = "PRIVATE" | "GOVERNMENT" | "AIDED" | "INTERNATIONAL";

// ── Core entities ─────────────────────────────────────────

export interface TeacherProfile {
  id: string;
  name: string;
  phone: string;
  city: string | null;
  state: string | null;
  bio: string | null;
  qualification: string | null;
  experienceYears: number;
  subjects: string[];
  grades: string[];
  profilePicUrl: string | null;
  resumeUrl: string | null;
  isVerified: boolean;
}

export interface SchoolProfile {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  city: string;
  state: string;
  board: BoardType;
  type: SchoolType;
  logoUrl: string | null;
  website: string | null;
  isVerified: boolean;
  udiseCode: string | null;
}

export interface JobVacancy {
  id: string;
  title: string;
  subject: string;
  board: BoardType;
  gradeLevel: string;
  jobType: JobType;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string | null;
  requirements: string | null;
  experience: string | null;
  perks: string | null;
  city: string;
  state: string;
  deadline: string | null;
  isActive: boolean;
  createdAt: string;
  school: Pick<SchoolProfile, "id" | "name" | "city" | "state" | "board" | "logoUrl" | "isVerified">;
  _count?: { applications: number };
}

export interface Application {
  id: string;
  jobId: string;
  teacherId: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  appliedAt: string;
  job?: Pick<JobVacancy, "id" | "title" | "school" | "salaryMin" | "salaryMax" | "city" | "state">;
  teacher?: Pick<TeacherProfile, "id" | "name" | "city" | "qualification" | "experienceYears">;
}

// ── API response wrappers ────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T = undefined> {
  message: string;
  data?: T;
}

// ── Dashboard stats ───────────────────────────────────────

export interface TeacherDashboardStats {
  totalApplications: number;
  profileViews: number;
  savedJobs: number;
  shortlisted: number;
}

export interface SchoolDashboardStats {
  activeJobs: number;
  totalApplications: number;
  shortlisted: number;
  profileViews: number;
}
