import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, authenticateJWT, authorizeRole } from "../middlewares/auth";

export const schoolsRouter: Router = Router();

/* GET /api/schools/me — current school profile + stats */
schoolsRouter.get("/me", authenticateJWT, authorizeRole(["SCHOOL_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    const school = await prisma.school.findUnique({
      where: { userId: req.user!.id },
      include: {
        _count: {
          select: { 
            jobs: true,
            // We can't directly count applications here easily without nested selects or separate queries
          }
        }
      }
    });

    if (!school) return res.status(404).json({ error: "School profile not found" });

    // Get total applications count across all jobs
    const applicationsCount = await prisma.application.count({
      where: { job: { schoolId: school.id } }
    });

    res.json({ 
      school: {
        ...school,
        isVerified: school.verificationStatus === 'FULLY_VERIFIED'
      }, 
      stats: {
        totalJobs: school._count.jobs,
        totalApplications: applicationsCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch school profile" });
  }
});

/* GET /api/schools/:id — public school profile */
schoolsRouter.get("/:id", async (req, res) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: req.params.id },
      include: {
        jobs: {
          where: { status: "ACTIVE" },
          take: 5,
          orderBy: { createdAt: "desc" }
        }
      }
    });
    if (!school) return res.status(404).json({ error: "School not found" });
    res.json({ school });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch school" });
  }
});

/* PUT /api/schools/me — update own profile */
schoolsRouter.put("/me", authenticateJWT, authorizeRole(["SCHOOL_ADMIN"]), async (req: AuthRequest, res) => {
  try {
    const updated = await prisma.school.update({
      where: { userId: req.user!.id },
      data: req.body
    });
    res.json({ message: "School profile updated successfully", school: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update school profile" });
  }
});
