import { Router } from "express";
import { prisma } from "../lib/prisma";
import { Board, JobType } from "@prisma/client";

export const searchRouter: Router = Router();

/* GET /api/search/jobs?q=math&city=delhi&board=cbse */
searchRouter.get("/jobs", async (req, res) => {
  try {
    const { q, city, state, board, subject, type, salaryMin } = req.query;

    const where: any = { status: "ACTIVE" };

    if (q) {
      where.OR = [
        { title: { contains: String(q), mode: "insensitive" } },
        { subject: { contains: String(q), mode: "insensitive" } },
        { description: { contains: String(q), mode: "insensitive" } },
      ];
    }

    if (city) where.city = { contains: String(city), mode: "insensitive" };
    if (state) where.state = { contains: String(state), mode: "insensitive" };
    if (board) where.board = board as Board;
    if (subject) where.subject = { contains: String(subject), mode: "insensitive" };
    if (type) where.jobType = type as JobType;
    if (salaryMin) where.salaryMin = { gte: Number(salaryMin) };

    const results = await prisma.jobVacancy.findMany({
      where,
      include: {
        school: {
          select: { name: true, logoUrl: true, city: true, state: true, verificationStatus: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    res.json({ jobs: results, total: results.length });
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

/* GET /api/search/teachers?subject=math&state=delhi */
searchRouter.get("/teachers", async (req, res) => {
  try {
    const { subject, state, city, qualification } = req.query;

    const where: any = { isAvailable: true };

    if (subject) {
      where.subjects = {
        some: { subject: { contains: String(subject), mode: "insensitive" } }
      };
    }

    if (state) where.state = { contains: String(state), mode: "insensitive" };
    if (city) where.city = { contains: String(city), mode: "insensitive" };
    if (qualification) where.qualification = { contains: String(qualification), mode: "insensitive" };

    const results = await prisma.teacherProfile.findMany({
      where,
      include: { subjects: true },
      take: 50
    });

    res.json({ results, total: results.length });
  } catch (err) {
    res.status(500).json({ error: "Teacher search failed" });
  }
});
