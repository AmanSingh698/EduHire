import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { jobsRouter } from "./routes/jobs";
import { applicationsRouter } from "./routes/applications";
import { schoolsRouter } from "./routes/schools";
import { teachersRouter } from "./routes/teachers";
import { searchRouter } from "./routes/search";
import { savedJobsRouter } from "./routes/savedJobs";

dotenv.config();

const app: express.Express = express();
const PORT = process.env.PORT || 4000;

app.use(cookieParser());
/* ── Middleware ─────────────────────────────────── */
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ── Health check ───────────────────────────────── */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "EduHire API", version: "1.0.0", timestamp: new Date().toISOString() });
});

/* ── Routes ─────────────────────────────────────── */
app.use("/api/auth",         authRouter);
app.use("/api/jobs",         jobsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/schools",      schoolsRouter);
app.use("/api/teachers",     teachersRouter);
app.use("/api/search",       searchRouter);
app.use("/api/saved-jobs",   savedJobsRouter);

/* ── 404 handler ────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ── Error handler ──────────────────────────────── */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 EduHire API running on http://localhost:${PORT}`);
});

export default app;
