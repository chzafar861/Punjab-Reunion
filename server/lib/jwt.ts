import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";
const JWT_ISSUER = "47dapunjab-auth";
const JWT_AUDIENCE = "47dapunjab-app";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

export interface JWTPayload {
  userId: number;
  email: string;
  username: string | null;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}
