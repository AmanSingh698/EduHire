import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, authenticateJWT, authorizeRole } from "../middlewares/auth";
import { ApplicationStatus } from "@prisma/client";

export const applicationsRouter: Router = Router();

/* POST /api/applications — teacher applies */
applicationsRouter.post("/", authenticateJWT, authorizeRole(["TEACHER"]), async (req: AuthRequest, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    // 1. Get teacher profile
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher profile not found" });
    }

    // 2. Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        jobId_teacherId: { jobId, teacherId: teacher.id }
      }
    });

    if (existing) {
      return res.status(400).json({ error: "You have already applied for this job" });
    }

    // 3. Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        teacherId: teacher.id,
        coverLetter,
        status: ApplicationStatus.PENDING
      }
    });

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to submit application" });
  }
});

/* GET /api/applications/me — teacher's own applications */
applicationsRouter.get("/me", authenticateJWT, authorizeRole(["TEACHER"]), async (req: AuthRequest, res) => {
  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!teacher) return res.status(404).json({ error: "Teacher info not found" });

    const applications = await prisma.application.findMany({
      where: { teacherId: teacher.id },
      include: {
        job: {
          include: {
            school: {
              select: {
                name: true,
                logoUrl: true,
                city: true,
                state: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

/* GET /api/applications/job/:jobId — school sees applications for their job */
applicationsRouter.get("/job/:jobId", authenticateJWT, authorizeRole(["SCHOOL_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    // 1. Verify school owns the job
    const job = await prisma.jobVacancy.findFirst({
      where: {
        id: req.params.jobId,
        school: { userId: req.user!.id }
      }
    });

    if (!job) return res.status(403).json({ error: "Unauthorized access to these applications" });

    // 2. Fetch applications
    const applications = await prisma.application.findMany({
      where: { jobId: req.params.jobId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            phone: true,
            city: true,
            state: true,
            qualification: true,
            experienceYears: true,
            resumeUrl: true,
            photoUrl: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

/* PATCH /api/applications/mark-viewed — marks all pending apps as viewed for the school */
applicationsRouter.patch("/mark-viewed", authenticateJWT, authorizeRole(["SCHOOL_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    const school = await prisma.school.findUnique({ where: { userId: req.user!.id } });
    if (!school) return res.status(404).json({ error: "School not found" });

    const result = await prisma.application.updateMany({
      where: {
        job: { schoolId: school.id },
        status: "PENDING"
      },
      data: { status: "VIEWED" }
    });

    res.json({ message: "Applications marked as viewed", count: result.count });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark applications as viewed" });
  }
});

/* PATCH /api/applications/:id/status — school updates status */
applicationsRouter.patch("/:id/status", authenticateJWT, authorizeRole(["SCHOOL_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;

    // 1. Verify school owns the application's job
    const application = await prisma.application.findFirst({
      where: {
        id: req.params.id,
        job: { school: { userId: req.user!.id } }
      }
    });

    if (!application) return res.status(403).json({ error: "Unauthorized to update this application" });

    // 2. Update status
    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { 
        status: status as ApplicationStatus,
        reviewedAt: new Date()
      }
    });

    res.json({ message: `Application updated to ${status}`, application: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update application status" });
  }
});

/* GET /api/applications/school — all applications for this school's jobs */
applicationsRouter.get("/school", authenticateJWT, authorizeRole(["SCHOOL_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        job: { school: { userId: req.user!.id } }
      },
      include: {
        job: { select: { title: true } },
        teacher: {
          select: {
            id: true,
            name: true,
            city: true,
            qualification: true,
            experienceYears: true,
            photoUrl: true,
            bio: true,
            resumeUrl: true,
            phone: true,
            subjects: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch school applications" });
  }
});
