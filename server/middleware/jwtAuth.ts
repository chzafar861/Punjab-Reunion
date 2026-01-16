import type { RequestHandler } from "express";
import { verifyToken, JWTPayload } from "../lib/jwt";
import { getUserById } from "../services/auth";

declare global {
  namespace Express {
    interface Request {
      jwtUser?: {
        id: string;
        email: string;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        emailVerified: boolean;
        profileImageUrl: string | null;
      };
    }
  }
}

export const requireJWTAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.jwtUser = {
      id: user.id,
      email: user.email!,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified ?? false,
      profileImageUrl: user.profileImageUrl,
    };

    next();
  } catch (err) {
    console.error("JWT auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const optionalJWTAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return next();
    }

    const payload = verifyToken(token);
    if (!payload) {
      return next();
    }

    const user = await getUserById(payload.userId);
    if (user) {
      req.jwtUser = {
        id: user.id,
        email: user.email!,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified ?? false,
        profileImageUrl: user.profileImageUrl,
      };
    }

    next();
  } catch {
    next();
  }
};
