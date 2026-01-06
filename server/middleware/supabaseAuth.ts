import type { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface SupabaseAuthUser {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
}

declare global {
  namespace Express {
    interface Request {
      supabaseUser?: SupabaseAuthUser;
    }
  }
}

export const requireSupabaseUser: RequestHandler = async (req, res, next) => {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase environment variables not configured");
      return res.status(500).json({ message: "Authentication service not configured" });
    }

    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const metadata = user.user_metadata || {};
    
    req.supabaseUser = {
      id: user.id,
      email: user.email || null,
      username: metadata.username || null,
      firstName: metadata.first_name || metadata.firstName || null,
      lastName: metadata.last_name || metadata.lastName || null,
    };

    next();
  } catch (err) {
    console.error("Supabase auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const optionalSupabaseUser: RequestHandler = async (req, res, next) => {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return next();
    }

    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return next();
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      const metadata = user.user_metadata || {};
      req.supabaseUser = {
        id: user.id,
        email: user.email || null,
        username: metadata.username || null,
        firstName: metadata.first_name || metadata.firstName || null,
        lastName: metadata.last_name || metadata.lastName || null,
      };
    }

    next();
  } catch (err) {
    next();
  }
};
