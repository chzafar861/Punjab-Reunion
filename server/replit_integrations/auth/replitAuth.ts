import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";
import { storage } from "../../storage";

const ADMIN_EMAILS = ["chzafar861@gmail.com"];

const getOidcConfig = memoize(
  async () => {
    const issuerUrl = process.env.ISSUER_URL ?? "https://replit.com/oidc";
    const replId = process.env.REPL_ID;
    if (!replId) {
      throw new Error("REPL_ID environment variable is not set");
    }
    console.log(`[auth] OIDC discovery: issuer=${issuerUrl}, clientId=${replId}`);
    return await client.discovery(
      new URL(issuerUrl),
      replId
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });

  const email = claims["email"]?.toLowerCase();
  const userId = claims["sub"];
  if (email && ADMIN_EMAILS.includes(email)) {
    try {
      const existingRole = await storage.getUserRole(userId);
      if (!existingRole || existingRole.role !== "admin") {
        await storage.setUserRole(userId, "admin", true, true);
        console.log(`[auto-admin] Assigned admin role to ${email} (${userId})`);
      }
    } catch (err) {
      console.error(`[auto-admin] Failed to assign admin role to ${email}:`, err);
    }
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  const registeredStrategies = new Set<string>();

  const ensureStrategy = async (domain: string) => {
    const config = await getOidcConfig();
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const verify: VerifyFunction = async (
        tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
        verified: passport.AuthenticateCallback
      ) => {
        const user = {};
        updateUserSession(user, tokens);
        await upsertUser(tokens.claims());
        verified(null, user);
      };

      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
      console.log(`[auth] Registered OIDC strategy for domain: ${domain}`);
    }
    return strategyName;
  };

  app.get("/api/login", async (req, res, next) => {
    try {
      console.log(`[auth-login] Login initiated from hostname: ${req.hostname}, protocol: ${req.protocol}`);
      const strategyName = await ensureStrategy(req.hostname);
      passport.authenticate(strategyName, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    } catch (err) {
      console.error("[auth-login] Failed to initiate login:", err);
      res.redirect("/login?error=auth_setup_failed");
    }
  });

  app.get("/api/callback", async (req, res, next) => {
    try {
      console.log(`[auth-callback] Callback received for hostname: ${req.hostname}`);
      const strategyName = await ensureStrategy(req.hostname);
      passport.authenticate(strategyName, (err: any, user: any, info: any) => {
        if (err) {
          console.error("[auth-callback] Authentication error:", err);
          return res.redirect("/login?error=auth_failed");
        }
        if (!user) {
          console.error("[auth-callback] No user returned. Info:", info);
          return res.redirect("/login?error=no_user");
        }
        req.logIn(user, (loginErr: any) => {
          if (loginErr) {
            console.error("[auth-callback] Login error:", loginErr);
            return res.redirect("/login?error=login_failed");
          }
          console.log("[auth-callback] Login successful for user:", user.claims?.sub);
          return res.redirect("/");
        });
      })(req, res, next);
    } catch (err) {
      console.error("[auth-callback] Failed to process callback:", err);
      res.redirect("/login?error=callback_failed");
    }
  });

  app.get("/api/logout", async (req, res) => {
    try {
      const config = await getOidcConfig();
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    } catch (err) {
      console.error("[auth-logout] Failed to logout:", err);
      req.logout(() => {
        res.redirect("/");
      });
    }
  });

  try {
    await getOidcConfig();
    console.log("[auth] OIDC configuration loaded successfully");
  } catch (err) {
    console.error("[auth] Warning: OIDC configuration failed to pre-load, will retry on first login:", err);
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
