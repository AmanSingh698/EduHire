import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "TEACHER" | "SCHOOL_ADMIN" | "SUPER_ADMIN";
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. You do not have permission." });
    }
    next();
  };
};
