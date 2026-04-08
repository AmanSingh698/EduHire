import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";

export const authRouter: Router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "eduhire-dev-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "eduhire-refresh-dev-secret";

/* ── Zod Schemas ──────────────────────────────────── */

const registerTeacherSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name is too short"),
  phone: z.string().regex(/^[0-9+ ]{10,15}$/, "Invalid phone number"),
  city: z.string().optional(),
  state: z.string().optional(),
});

const registerSchoolSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().regex(/^[0-9+ ]{10,15}$/),
  city: z.string(),
  state: z.string(),
  address: z.string().optional(),
  board: z.enum(["CBSE", "ICSE", "STATE", "IB", "IGCSE", "NIOS", "OTHER"]),
  type: z.enum(["GOVERNMENT", "PRIVATE", "AIDED", "INTERNATIONAL"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/* ── Token Helpers ─────────────────────────────────── */

const generateTokens = async (res: Response, userId: string, role: string) => {
  const accessToken = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: "7d" });

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Set Cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 mins
  res.cookie("refreshToken", refreshToken, cookieOptions);

  // Set Non-httpOnly user cookie for frontend role/id access
  res.cookie("user", JSON.stringify({ id: userId, role }), { 
    ...cookieOptions, 
    httpOnly: false,
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });

  return { accessToken, refreshToken };
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ── Routes ────────────────────────────────────────── */

authRouter.post("/register-teacher", async (req, res) => {
  try {
    const data = registerTeacherSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { teacherProfile: { phone: data.phone } }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email or Phone already registered" });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: "TEACHER",
        teacherProfile: {
          create: { 
            name: data.name, 
            phone: data.phone, 
            city: data.city, 
            state: data.state 
          }
        }
      },
      include: { teacherProfile: true }
    });

    await generateTokens(res, user.id, user.role);

    res.status(201).json({
      message: "Registration successful",
      user: { id: user.id, email: user.email, role: user.role, name: user.teacherProfile?.name }
    });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    console.error(err);
    res.status(500).json({ error: "Teacher registration failed" });
  }
});

authRouter.post("/register-school", async (req, res) => {
  try {
    const data = registerSchoolSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { school: { phone: data.phone } }
        ]
      }
    });

    if (existingUser) return res.status(400).json({ error: "Email or Phone already registered" });

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: "SCHOOL_ADMIN",
        school: {
          create: { 
            name: data.name, 
            phone: data.phone, 
            address: data.address, 
            city: data.city, 
            state: data.state, 
            board: data.board, 
            type: data.type 
          }
        }
      },
      include: { school: true }
    });

    await generateTokens(res, user.id, user.role);

    res.status(201).json({
      message: "School registration successful",
      user: { id: user.id, email: user.email, role: user.role, name: user.school?.name }
    });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: "School registration failed" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { teacherProfile: true, school: true }
    });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    await generateTokens(res, user.id, user.role);

    const name = user.role === "TEACHER" ? user.teacherProfile?.name : user.school?.name;

    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role, name }
    });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: "Login failed" });
  }
});

authRouter.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as any;
    
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    // Rotate token
    await prisma.refreshToken.delete({ where: { id: dbToken.id } });
    await generateTokens(res, dbToken.userId, dbToken.user.role);

    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

authRouter.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
});

/* ── OTP Routes ────────── */

authRouter.post("/send-otp", async (req, res) => {
  try {
    const { identifier, type } = req.body;
    if (!identifier) return res.status(400).json({ error: "Missing identifier" });

    const otp = generateOtp();
    const redisKey = `otp:${type}:${identifier}`;
    await redis.set(redisKey, otp, "EX", 300);

    console.log("\x1b[33m%s\x1b[0m", "\n==============================================");
    console.log("\x1b[35m%s\x1b[0m", ` 🔐 EDUHIRE ${type.toUpperCase()} VERIFICATION`);
    console.log("\x1b[33m%s\x1b[0m", "----------------------------------------------");
    console.log(`  Recipient:  ${identifier}`);
    console.log("\x1b[32m%s\x1b[0m \x1b[1m\x1b[32m%s\x1b[0m", "  Your OTP:", otp);
    console.log("\x1b[33m%s\x1b[0m", "==============================================\n");

    res.json({ message: `OTP sent successfully.` });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

authRouter.post("/verify-otp", async (req, res) => {
  try {
    const { identifier, otp, type, userId } = req.body;
    const redisKey = `otp:${type}:${identifier}`;
    const storedOtp = await redis.get(redisKey);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { [type === "phone" ? "isPhoneVerified" : "isEmailVerified"]: true }
    });

    await redis.del(redisKey);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});
