import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, authenticateJWT, authorizeRole } from "../middlewares/auth";
import { Board, JobType, JobStatus } from "@prisma/client";

export const jobsRouter: Router = Router();

/* GET /api/jobs — list with filters */
jobsRouter.get("/", async (req, res) => {
  try {
    const { 
      subject, board, city, state, type, salaryMin, 
      page = 1, limit = 10, q 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build the filters
    const where: any = {
      status: JobStatus.ACTIVE,
    };

    if (subject) where.subject = { in: String(subject).split(",") };
    if (board) where.board = { in: String(board).split(",") as Board[] };
    if (type) where.jobType = { in: String(type).split(",") as JobType[] };
    if (salaryMin) where.salaryMin = { gte: Number(salaryMin) };

    // Location: match city OR state so "Delhi" finds both city and state records
    if (city) {
      const locationTerm = String(city);
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { city: { contains: locationTerm, mode: "insensitive" } },
            { state: { contains: locationTerm, mode: "insensitive" } },
          ],
        },
      ];
    }

    // Sidebar state filter (exact checkbox values)
    if (state) {
      const stateList = String(state).split(",").map((s) => s.trim());
      where.AND = [
        ...(where.AND || []),
        { state: { in: stateList } },
      ];
    }

    // Keyword search: title, subject, school name (NOT description — avoids false matches)
    if (q) {
      where.OR = [
        { title: { contains: String(q), mode: "insensitive" } },
        { subject: { contains: String(q), mode: "insensitive" } },
        { school: { name: { contains: String(q), mode: "insensitive" } } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.jobVacancy.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              logoUrl: true,
              board: true,
              verificationStatus: true,
            }
          },
          _count: { select: { applications: true } }
        }
      }).then(jobs => jobs.map(job => ({
        ...job,
        school: job.school ? { ...job.school, isVerified: job.school.verificationStatus === 'FULLY_VERIFIED' } : null
      }))),
      prisma.jobVacancy.count({ where })
    ]);

    res.json({ 
      jobs, 
      total, 
      page: Number(page), 
      limit: Number(limit),
      totalPages: Math.ceil(total / take)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch jobs" });
  }
});

/* GET /api/jobs/my-jobs — school's own jobs */
jobsRouter.get("/my-jobs", authenticateJWT, authorizeRole(["SCHOOL_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    const jobs = await prisma.jobVacancy.findMany({
      where: { school: { userId: req.user!.id } },
      include: {
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your jobs" });
  }
});

/* POST /api/jobs — create (school only) */
jobsRouter.post("/", authenticateJWT, authorizeRole(["SCHOOL_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    const { 
      title, subject, board, gradeLevel, jobType, 
      salaryMin, salaryMax, description, requirements, 
      perks, experience, qualification,
      deadline, city, state, openings 
    } = req.body;

    // 1. Find the school linked to this user
    const school = await prisma.school.findUnique({
      where: { userId: req.user!.id }
    });

    if (!school) {
      return res.status(404).json({ error: "School profile not found for this user" });
    }

    // 2. Create the job vacancy
    const job = await prisma.jobVacancy.create({
      data: {
        schoolId: school.id,
        title,
        subject,
        board: board as Board,
        gradeLevel,
        jobType: jobType as JobType,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        description,
        requirements,
        perks,
        experience,
        qualification,
        city: city || school.city,
        state: state || school.state,
        deadline: deadline ? new Date(deadline) : null,
        openings: openings ? Number(openings) : 1,
      }
    });

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to post job" });
  }
});

/* GET /api/jobs/:id — single job */
jobsRouter.get("/:id", async (req, res) => {
  try {
    const job = await prisma.jobVacancy.findUnique({
      where: { id: req.params.id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            board: true,
            type: true,
            city: true,
            state: true,
            description: true,
            website: true,
            verificationStatus: true,
          }
        },
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!job) return res.status(404).json({ error: "Job not found" });
    
    // Map verificationStatus → isVerified for frontend
    const jobWithVerified = {
      ...job,
      school: job.school ? { ...job.school, isVerified: job.school.verificationStatus === 'FULLY_VERIFIED' } : null
    };
    res.json({ job: jobWithVerified });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch job details" });
  }
});

/* PUT /api/jobs/:id — update */
jobsRouter.put("/:id", authenticateJWT, authorizeRole(["SCHOOL_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    // Ensure the school owns this job
    const job = await prisma.jobVacancy.findFirst({
      where: { 
        id: req.params.id,
        school: { userId: req.user!.id }
      }
    });

    if (!job) return res.status(403).json({ error: "Not authorized to update this job" });

    const updatedJob = await prisma.jobVacancy.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({ message: "Job updated", job: updatedJob });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update job" });
  }
});

/* DELETE /api/jobs/:id — delete */
jobsRouter.delete("/:id", authenticateJWT, authorizeRole(["SCHOOL_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    // Ensure the school owns this job
    const job = await prisma.jobVacancy.findFirst({
      where: { 
        id: req.params.id,
        school: { userId: req.user!.id }
      }
    });

    if (!job) return res.status(403).json({ error: "Not authorized to delete this job" });

    await prisma.jobVacancy.delete({
      where: { id: req.params.id }
    });

    res.json({ message: "Job deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete job" });
  }
});
