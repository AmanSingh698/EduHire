import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, authenticateJWT, authorizeRole } from "../middlewares/auth";

export const teachersRouter: Router = Router();

/* GET /api/teachers/me — current teacher profile */
teachersRouter.get("/me", authenticateJWT, authorizeRole(["TEACHER"]), async (req: AuthRequest, res) => {
  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        subjects: true,
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!teacher) return res.status(404).json({ error: "Teacher profile not found" });

    res.json({ teacher });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/* GET /api/teachers/:id — public profile view */
teachersRouter.get("/:id", async (req, res) => {
  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: req.params.id },
      include: {
        subjects: true
      }
    });
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.json({ teacher });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teacher" });
  }
});

/* PUT /api/teachers/me — update own profile */
teachersRouter.put("/me", authenticateJWT, authorizeRole(["TEACHER"]), async (req: AuthRequest, res) => {
  try {
    const updated = await prisma.teacherProfile.update({
      where: { userId: req.user!.id },
      data: req.body
    });
    res.json({ message: "Profile updated successfully", teacher: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});
