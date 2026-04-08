import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, authenticateJWT, authorizeRole } from "../middlewares/auth";

export const savedJobsRouter: Router = Router();

const JOB_SELECT = {
  id: true, title: true, subject: true, board: true, gradeLevel: true,
  jobType: true, salaryMin: true, salaryMax: true, city: true, state: true,
  createdAt: true, deadline: true, openings: true,
  school: {
    select: { id: true, name: true, logoUrl: true, board: true, city: true, state: true, verificationStatus: true }
  },
  _count: { select: { applications: true } }
};

/* GET /api/saved-jobs — teacher's saved jobs */
savedJobsRouter.get("/", authenticateJWT, authorizeRole(["TEACHER"]), async (req: AuthRequest, res) => {
  try {
    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: req.user!.id } });
    if (!teacher) return res.status(404).json({ error: "Teacher profile not found" });

    const saved = await prisma.savedJob.findMany({
      where: { teacherId: teacher.id },
      include: { job: { select: JOB_SELECT } },
      orderBy: { createdAt: "desc" },
    });

    const jobs = saved.map(s => ({
      ...s.job,
      savedAt: s.createdAt,
      school: s.job.school
        ? { ...s.job.school, isVerified: s.job.school.verificationStatus === "FULLY_VERIFIED" }
        : null,
    }));

    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch saved jobs" });
  }
});

/* POST /api/saved-jobs — save a job */
savedJobsRouter.post("/", authenticateJWT, authorizeRole(["TEACHER"]), async (req: AuthRequest, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ error: "jobId is required" });

    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: req.user!.id } });
    if (!teacher) return res.status(404).json({ error: "Teacher profile not found" });

    const saved = await prisma.savedJob.upsert({
      where: { teacherId_jobId: { teacherId: teacher.id, jobId } },
      create: { teacherId: teacher.id, jobId },
      update: {},
    });

    res.status(201).json({ message: "Job saved", saved });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save job" });
  }
});

/* DELETE /api/saved-jobs/:jobId — unsave a job */
savedJobsRouter.delete("/:jobId", authenticateJWT, authorizeRole(["TEACHER"]), async (req: AuthRequest, res) => {
  try {
    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: req.user!.id } });
    if (!teacher) return res.status(404).json({ error: "Teacher profile not found" });

    await prisma.savedJob.deleteMany({
      where: { teacherId: teacher.id, jobId: req.params.jobId },
    });

    res.json({ message: "Job removed from saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to unsave job" });
  }
});

/* GET /api/saved-jobs/ids — just the saved job IDs */
savedJobsRouter.get("/ids", authenticateJWT, authorizeRole(["TEACHER"]), async (req: AuthRequest, res) => {
  try {
    const teacher = await prisma.teacherProfile.findUnique({ where: { userId: req.user!.id } });
    if (!teacher) return res.json({ ids: [] });

    const saved = await prisma.savedJob.findMany({
      where: { teacherId: teacher.id },
      select: { jobId: true },
    });

    res.json({ ids: saved.map(s => s.jobId) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch saved job IDs" });
  }
});
