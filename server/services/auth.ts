import { db } from "../db";
import { users, emailVerificationTokens } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuffer = Buffer.from(key, "hex");
  return timingSafeEqual(derivedKey, keyBuffer);
}

export async function generateVerificationToken(): Promise<string> {
  return randomBytes(32).toString("hex");
}

export async function createUser(data: {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  const passwordHash = await hashPassword(data.password);
  
  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      username: data.username,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      emailVerified: false,
    })
    .returning();
  
  return user;
}

export async function createVerificationToken(userId: string): Promise<string> {
  const token = await generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await db.insert(emailVerificationTokens).values({
    userId,
    token,
    expiresAt,
  });
  
  return token;
}

export async function verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string }> {
  const [tokenRecord] = await db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token))
    .limit(1);
  
  if (!tokenRecord) {
    return { success: false };
  }
  
  if (new Date() > tokenRecord.expiresAt) {
    await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, tokenRecord.id));
    return { success: false };
  }
  
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, tokenRecord.userId));
  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, tokenRecord.id));
  
  return { success: true, userId: tokenRecord.userId };
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
}

export async function getUserByUsername(username: string) {
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function getUserByGoogleId(googleId: string) {
  const [user] = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
  return user;
}

export async function createOrUpdateGoogleUser(data: {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}) {
  const existingUser = await getUserByGoogleId(data.googleId);
  
  if (existingUser) {
    const [updated] = await db
      .update(users)
      .set({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: data.profileImageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id))
      .returning();
    return updated;
  }
  
  // Check if email exists
  const emailUser = await getUserByEmail(data.email);
  if (emailUser) {
    // Link Google account to existing user
    const [updated] = await db
      .update(users)
      .set({
        googleId: data.googleId,
        firstName: data.firstName || emailUser.firstName,
        lastName: data.lastName || emailUser.lastName,
        profileImageUrl: data.profileImageUrl || emailUser.profileImageUrl,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, emailUser.id))
      .returning();
    return updated;
  }
  
  // Create new user
  const username = data.email.split("@")[0] + "_" + randomBytes(4).toString("hex");
  const [user] = await db
    .insert(users)
    .values({
      googleId: data.googleId,
      email: data.email,
      username,
      firstName: data.firstName,
      lastName: data.lastName,
      profileImageUrl: data.profileImageUrl,
      emailVerified: true,
    })
    .returning();
  
  return user;
}
