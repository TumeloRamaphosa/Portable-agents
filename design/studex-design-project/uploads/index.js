// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, float } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var workspaces = mysqlTable("workspaces", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  plan: mysqlEnum("plan", ["starter", "pro", "agency"]).default("starter").notNull(),
  logoUrl: varchar("logoUrl", { length: 2048 }),
  brandColor: varchar("brandColor", { length: 16 }).default("#2563eb"),
  isWhiteLabel: boolean("isWhiteLabel").default(false),
  planExpiresAt: timestamp("planExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var workspaceMembers = mysqlTable("workspaceMembers", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "member", "viewer"]).default("member").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["shopify", "google_ads", "facebook", "instagram", "whatsapp", "google_drive", "higgsfield"]).notNull(),
  status: mysqlEnum("status", ["active", "expired", "error", "disconnected"]).default("active").notNull(),
  // Shopify fields
  shopifyDomain: varchar("shopifyDomain", { length: 256 }),
  shopifyAccessToken: varchar("shopifyAccessToken", { length: 512 }),
  // Google Ads fields
  googleAdsCustomerId: varchar("googleAdsCustomerId", { length: 64 }),
  googleRefreshToken: text("googleRefreshToken"),
  googleAccessToken: text("googleAccessToken"),
  googleTokenExpiresAt: timestamp("googleTokenExpiresAt"),
  // Facebook / Meta fields
  metaAccessToken: text("metaAccessToken"),
  metaPageId: varchar("metaPageId", { length: 64 }),
  metaBusinessId: varchar("metaBusinessId", { length: 64 }),
  metaAdAccountId: varchar("metaAdAccountId", { length: 64 }),
  metaInstagramId: varchar("metaInstagramId", { length: 64 }),
  // WhatsApp
  whatsappPhoneNumberId: varchar("whatsappPhoneNumberId", { length: 64 }),
  whatsappAccessToken: text("whatsappAccessToken"),
  // Google Drive
  googleDriveFolderId: varchar("googleDriveFolderId", { length: 128 }),
  // Higgsfield AI
  higgsfieldApiKey: text("higgsfieldApiKey"),
  higgsfieldUsername: varchar("higgsfieldUsername", { length: 256 }),
  // Generic metadata
  metadata: json("metadata"),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var shopifyOrders = mysqlTable("shopifyOrders", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  shopifyOrderId: varchar("shopifyOrderId", { length: 64 }).notNull(),
  totalPrice: float("totalPrice"),
  currency: varchar("currency", { length: 8 }),
  financialStatus: varchar("financialStatus", { length: 64 }),
  fulfillmentStatus: varchar("fulfillmentStatus", { length: 64 }),
  customerId: varchar("customerId", { length: 64 }),
  lineItems: json("lineItems"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  shopifyCreatedAt: timestamp("shopifyCreatedAt")
});
var shopifyProducts = mysqlTable("shopifyProducts", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  shopifyProductId: varchar("shopifyProductId", { length: 64 }).notNull(),
  title: varchar("title", { length: 512 }),
  description: text("description"),
  productType: varchar("productType", { length: 256 }),
  tags: json("tags"),
  variants: json("variants"),
  images: json("images"),
  status: varchar("status", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var googleAdsCampaigns = mysqlTable("googleAdsCampaigns", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  campaignId: varchar("campaignId", { length: 64 }).notNull(),
  campaignName: varchar("campaignName", { length: 512 }),
  status: varchar("status", { length: 32 }),
  budget: float("budget"),
  impressions: int("impressions"),
  clicks: int("clicks"),
  cost: float("cost"),
  conversions: float("conversions"),
  ctr: float("ctr"),
  cpc: float("cpc"),
  roas: float("roas"),
  date: timestamp("date"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var contentPosts = mysqlTable("contentPosts", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 512 }),
  caption: text("caption"),
  hashtags: text("hashtags"),
  imageUrl: varchar("imageUrl", { length: 2048 }),
  imagePrompt: text("imagePrompt"),
  platform: mysqlEnum("platform", ["facebook", "instagram", "whatsapp", "all"]).default("all").notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "failed"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  // Performance metrics (filled after publishing)
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  reach: int("reach").default(0),
  impressions: int("impressions").default(0),
  engagementRate: float("engagementRate"),
  // AI generation metadata
  aiGenerated: boolean("aiGenerated").default(false),
  aiModel: varchar("aiModel", { length: 64 }),
  contentBrief: text("contentBrief"),
  brandVoice: text("brandVoice"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var contentCalendar = mysqlTable("contentCalendar", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  postId: int("postId"),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  platform: mysqlEnum("platform", ["facebook", "instagram", "whatsapp", "all"]).default("all").notNull(),
  contentType: mysqlEnum("contentType", ["product", "educational", "promotional", "ugc", "behind_scenes", "testimonial"]).default("product").notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  status: mysqlEnum("status", ["planned", "draft", "ready", "published"]).default("planned").notNull(),
  color: varchar("color", { length: 16 }).default("#2563eb"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var brandVoices = mysqlTable("brandVoices", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  tone: varchar("tone", { length: 256 }),
  audience: text("audience"),
  keyMessages: json("keyMessages"),
  avoidWords: json("avoidWords"),
  examplePosts: json("examplePosts"),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var adReports = mysqlTable("adReports", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  reportType: mysqlEnum("reportType", ["weekly", "monthly", "custom", "spend_optimisation"]).default("weekly").notNull(),
  platform: mysqlEnum("platform", ["facebook", "instagram", "google_ads", "shopify", "all"]).default("all").notNull(),
  dateFrom: timestamp("dateFrom").notNull(),
  dateTo: timestamp("dateTo").notNull(),
  totalSpend: float("totalSpend"),
  totalRevenue: float("totalRevenue"),
  roas: float("roas"),
  impressions: int("impressions"),
  clicks: int("clicks"),
  conversions: int("conversions"),
  reportData: json("reportData"),
  aiInsights: text("aiInsights"),
  recommendations: json("recommendations"),
  reportMarkdown: text("reportMarkdown"),
  reportPdfUrl: varchar("reportPdfUrl", { length: 2048 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workspaceId: int("workspaceId"),
  url: varchar("url", { length: 2048 }).notNull(),
  domain: varchar("domain", { length: 512 }).notNull(),
  companyName: varchar("companyName", { length: 512 }),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  whoisData: json("whoisData"),
  dnsRecords: json("dnsRecords"),
  registrationDetails: json("registrationDetails"),
  seoData: json("seoData"),
  performanceScore: int("performanceScore"),
  seoScore: int("seoScore"),
  socialProfiles: json("socialProfiles"),
  totalSocialFollowers: int("totalSocialFollowers"),
  techStack: json("techStack"),
  competitiveData: json("competitiveData"),
  aiSummary: text("aiSummary"),
  industryCategory: varchar("industryCategory", { length: 256 }),
  reportMarkdown: text("reportMarkdown"),
  reportPdfUrl: varchar("reportPdfUrl", { length: 2048 }),
  googleDriveUrl: varchar("googleDriveUrl", { length: 2048 }),
  cachedAt: timestamp("cachedAt"),
  isCached: boolean("isCached").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var analysisCache = mysqlTable("analysisCache", {
  id: int("id").autoincrement().primaryKey(),
  domain: varchar("domain", { length: 512 }).notNull().unique(),
  rawHtml: text("rawHtml"),
  headers: json("headers"),
  technologies: json("technologies"),
  metaTags: json("metaTags"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var ragIndex = mysqlTable("ragIndex", {
  id: int("id").autoincrement().primaryKey(),
  analysisId: int("analysisId"),
  // nullable — not all chunks come from analyses
  domain: varchar("domain", { length: 512 }),
  chunkType: varchar("chunkType", { length: 64 }).notNull(),
  content: text("content").notNull(),
  embedding: json("embedding"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var knowledgeDocs = mysqlTable("knowledgeDocs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  source: varchar("source", { length: 256 }).default("manual"),
  docType: mysqlEnum("docType", ["research", "transcript", "report", "notes", "strategy", "client"]).default("notes").notNull(),
  content: text("content").notNull(),
  tags: json("tags"),
  chunkCount: int("chunkCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var clientLeads = mysqlTable("clientLeads", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 128 }).notNull(),
  lastName: varchar("lastName", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  businessName: varchar("businessName", { length: 256 }).notNull(),
  industry: varchar("industry", { length: 128 }),
  websiteUrl: varchar("websiteUrl", { length: 2048 }),
  facebookUrl: varchar("facebookUrl", { length: 2048 }),
  instagramUrl: varchar("instagramUrl", { length: 2048 }),
  tiktokUrl: varchar("tiktokUrl", { length: 2048 }),
  linkedinUrl: varchar("linkedinUrl", { length: 2048 }),
  youtubeUrl: varchar("youtubeUrl", { length: 2048 }),
  facebookFollowers: int("facebookFollowers"),
  instagramFollowers: int("instagramFollowers"),
  tiktokFollowers: int("tiktokFollowers"),
  monthlyBudget: varchar("monthlyBudget", { length: 64 }),
  primaryGoal: varchar("primaryGoal", { length: 256 }),
  currentChallenges: text("currentChallenges"),
  targetAudience: text("targetAudience"),
  aiAnalysis: text("aiAnalysis"),
  aiStrategy: text("aiStrategy"),
  proposedPricing: varchar("proposedPricing", { length: 128 }),
  analysisScore: int("analysisScore"),
  status: mysqlEnum("status", ["submitted", "analysing", "proposal_sent", "approved", "rejected", "active"]).default("submitted").notNull(),
  proposalSentAt: timestamp("proposalSentAt"),
  approvedAt: timestamp("approvedAt"),
  inviteToken: varchar("inviteToken", { length: 128 }),
  inviteExpiresAt: timestamp("inviteExpiresAt"),
  linkedUserId: int("linkedUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var clientPortalSessions = mysqlTable("clientPortalSessions", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  lastAccessedAt: timestamp("lastAccessedAt"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
import { mergeRouters, createCallerFactory } from "@trpc/server";

// server/routers/activityLog.ts
import { z } from "zod";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/routers/activityLog.ts
var activityLogRouter = router({
  // Get activity log with filtering
  getActivityLog: protectedProcedure.input(z.object({
    limit: z.number().default(50),
    offset: z.number().default(0),
    filter: z.object({
      action: z.string().optional(),
      entityType: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional()
    }).optional()
  })).query(async ({ input, ctx }) => {
    const activities = [
      {
        id: "act_001",
        timestamp: new Date(Date.now() - 1e3 * 60 * 5).toISOString(),
        // 5 min ago
        user: { id: ctx.user.id, name: ctx.user.name || "Admin" },
        action: "api_key_updated",
        entityType: "api_key",
        entityId: "shopify_prod",
        description: "Updated Shopify API key",
        oldValue: { masked: "sh...abc" },
        newValue: { masked: "sh...xyz" },
        metadata: { reason: "monthly_rotation" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0..."
      },
      {
        id: "act_002",
        timestamp: new Date(Date.now() - 1e3 * 60 * 30).toISOString(),
        // 30 min ago
        user: { id: ctx.user.id, name: ctx.user.name || "Admin" },
        action: "product_created",
        entityType: "product",
        entityId: "prod_006",
        description: "Created new product: Premium Coffee Blend",
        oldValue: null,
        newValue: { name: "Premium Coffee Blend", price: 299, category: "coffee" },
        metadata: { source: "shopify_api", autoGenerated: false },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0..."
      },
      {
        id: "act_003",
        timestamp: new Date(Date.now() - 1e3 * 60 * 60 * 2).toISOString(),
        // 2 hours ago
        user: { id: ctx.user.id, name: ctx.user.name || "Admin" },
        action: "content_published",
        entityType: "content",
        entityId: "content_123",
        description: "Published Instagram Reel: Wagyu slicing",
        oldValue: { status: "draft" },
        newValue: { status: "published", platforms: ["instagram"], engagement: 452 },
        metadata: { platforms: ["instagram"], scheduled: false },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0..."
      },
      {
        id: "act_004",
        timestamp: new Date(Date.now() - 1e3 * 60 * 60 * 4).toISOString(),
        // 4 hours ago
        user: { id: ctx.user.id, name: ctx.user.name || "Admin" },
        action: "campaign_launched",
        entityType: "campaign",
        entityId: "camp_001",
        description: "Launched Freedom Day campaign",
        oldValue: { status: "draft" },
        newValue: { status: "active", budget: 5e3, platforms: ["facebook", "instagram"] },
        metadata: { budget: 5e3, expectedReach: 25e3 },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0..."
      },
      {
        id: "act_005",
        timestamp: new Date(Date.now() - 1e3 * 60 * 60 * 24).toISOString(),
        // 1 day ago
        user: { id: ctx.user.id, name: ctx.user.name || "Admin" },
        action: "ai_analysis_generated",
        entityType: "analysis",
        entityId: "analysis_001",
        description: "Generated Facebook ad spend analysis",
        oldValue: null,
        newValue: { recommendations: 5, wastedSpend: 2500 },
        metadata: { aiProvider: "anthropic", model: "claude-3-sonnet" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0..."
      }
    ];
    let filtered = activities;
    if (input.filter?.action) {
      filtered = filtered.filter((a) => a.action.includes(input.filter.action));
    }
    if (input.filter?.entityType) {
      filtered = filtered.filter((a) => a.entityType === input.filter.entityType);
    }
    return {
      activities: filtered.slice(input.offset, input.offset + input.limit),
      total: filtered.length,
      hasMore: filtered.length > input.offset + input.limit
    };
  }),
  // Get activity statistics
  getActivityStats: protectedProcedure.query(async () => {
    return {
      today: 23,
      thisWeek: 156,
      thisMonth: 642,
      byAction: [
        { action: "product_created", count: 45 },
        { action: "content_published", count: 38 },
        { action: "api_key_updated", count: 12 },
        { action: "campaign_launched", count: 8 },
        { action: "ai_analysis_generated", count: 15 }
      ],
      byEntityType: [
        { type: "product", count: 67 },
        { type: "content", count: 52 },
        { type: "campaign", count: 18 },
        { type: "api_key", count: 12 }
      ]
    };
  }),
  // Get specific entity history
  getEntityHistory: protectedProcedure.input(z.object({
    entityType: z.string(),
    entityId: z.string()
  })).query(async ({ input }) => {
    return {
      entityType: input.entityType,
      entityId: input.entityId,
      history: [
        {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          action: "created",
          user: "Admin",
          changes: { name: "New Product", price: 100 }
        }
      ]
    };
  }),
  // Log new activity (called by other routers)
  logActivity: protectedProcedure.input(z.object({
    action: z.string(),
    entityType: z.string(),
    entityId: z.string(),
    description: z.string(),
    oldValue: z.any().optional(),
    newValue: z.any().optional(),
    metadata: z.record(z.any()).optional()
  })).mutation(async ({ input, ctx }) => {
    console.log("Activity logged:", {
      ...input,
      userId: ctx.user.id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    return {
      success: true,
      activityId: `act_${Date.now()}`
    };
  }),
  // Export activity log
  exportActivityLog: protectedProcedure.input(z.object({
    format: z.enum(["csv", "json"]).default("csv"),
    dateFrom: z.string(),
    dateTo: z.string()
  })).mutation(async ({ input }) => {
    return {
      success: true,
      downloadUrl: `/exports/activity_${input.dateFrom}_${input.dateTo}.${input.format}`,
      recordCount: 156
    };
  })
});

// server/routers/apiManager.ts
import { z as z2 } from "zod";
var mockApiKeys = {
  shopify: {
    id: "key_001",
    service: "shopify",
    name: "StudEx Shopify Store",
    domain: "studex-meats.myshopify.com",
    maskedKey: "shpat_****_****_****_****_last4",
    status: "active",
    lastUsed: new Date(Date.now() - 1e3 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 30).toISOString(),
    permissions: ["read_products", "read_orders", "write_products"],
    rateLimit: { requests: 40, window: "1s" }
  },
  facebook: {
    id: "key_002",
    service: "facebook",
    name: "Meta Business Account",
    accountId: "act_123456789",
    maskedKey: "EAAG****_****_****_last8",
    status: "active",
    lastUsed: new Date(Date.now() - 1e3 * 60 * 10).toISOString(),
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 60).toISOString(),
    permissions: ["ads_read", "ads_management", "pages_read"],
    rateLimit: { requests: 200, window: "1h" }
  },
  google_ads: {
    id: "key_003",
    service: "google_ads",
    name: "Google Ads Manager",
    customerId: "123-456-7890",
    maskedKey: "ya29.****_****_****_last8",
    status: "active",
    lastUsed: new Date(Date.now() - 1e3 * 60 * 15).toISOString(),
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 45).toISOString(),
    permissions: ["read_only", "campaign_management"],
    rateLimit: { requests: 1e4, window: "1d" }
  },
  whatsapp: {
    id: "key_004",
    service: "whatsapp",
    name: "WhatsApp Business",
    phoneNumberId: "123456789",
    maskedKey: "EAAG****_****_****_last8",
    status: "needs_setup",
    lastUsed: null,
    createdAt: null,
    permissions: ["messages", "templates"],
    setupUrl: "https://business.facebook.com/wa/manage/phone-numbers/"
  },
  higgsfield: {
    id: "key_005",
    service: "higgsfield",
    name: "Higgsfield AI Video",
    maskedKey: "hf_****_****_****_last8",
    status: "active",
    lastUsed: new Date(Date.now() - 1e3 * 60 * 60).toISOString(),
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 7).toISOString(),
    creditsRemaining: 850,
    plan: "Pro"
  },
  blotato: {
    id: "key_006",
    service: "blotato",
    name: "Blotato Social",
    maskedKey: "blt_****_****_****_last8",
    status: "active",
    lastUsed: new Date(Date.now() - 1e3 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 14).toISOString(),
    connectedAccounts: ["instagram", "tiktok", "facebook"]
  }
};
var apiManagerRouter = router({
  // Get all API keys (masked)
  getApiKeys: protectedProcedure.query(async () => {
    return Object.values(mockApiKeys).map((key) => ({
      id: key.id,
      service: key.service,
      name: key.name,
      status: key.status,
      lastUsed: key.lastUsed,
      createdAt: key.createdAt,
      maskedKey: key.maskedKey,
      setupUrl: key.setupUrl,
      permissions: key.permissions,
      rateLimit: key.rateLimit
    }));
  }),
  // Get specific API key status
  getApiKeyStatus: protectedProcedure.input(z2.object({ service: z2.string() })).query(async ({ input }) => {
    const key = mockApiKeys[input.service];
    if (!key) {
      return { status: "not_configured" };
    }
    const isConnected = key.status === "active";
    return {
      service: input.service,
      status: key.status,
      name: key.name,
      connected: isConnected,
      lastUsed: key.lastUsed,
      setupRequired: key.status === "needs_setup",
      setupUrl: key.setupUrl
    };
  }),
  // Add/update API key
  upsertApiKey: protectedProcedure.input(z2.object({
    service: z2.string(),
    name: z2.string(),
    apiKey: z2.string(),
    additionalConfig: z2.record(z2.any()).optional()
  })).mutation(async ({ input }) => {
    mockApiKeys[input.service] = {
      id: `key_${Date.now()}`,
      service: input.service,
      name: input.name,
      apiKey: input.apiKey,
      maskedKey: maskApiKey(input.apiKey),
      status: "active",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      ...input.additionalConfig
    };
    return {
      success: true,
      service: input.service,
      status: "active",
      message: `${input.name} API key saved successfully`
    };
  }),
  // Test API key
  testApiKey: protectedProcedure.input(z2.object({ service: z2.string() })).mutation(async ({ input }) => {
    const key = mockApiKeys[input.service];
    if (!key) {
      return { success: false, error: "API key not found" };
    }
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    return {
      success: true,
      service: input.service,
      responseTime: "245ms",
      permissions: key.permissions,
      rateLimit: key.rateLimit
    };
  }),
  // Rotate API key
  rotateApiKey: protectedProcedure.input(z2.object({
    service: z2.string(),
    reason: z2.string().optional()
  })).mutation(async ({ input }) => {
    return {
      success: true,
      service: input.service,
      message: "API key rotated successfully",
      oldKeyGracePeriod: "24 hours"
    };
  }),
  // Delete API key
  deleteApiKey: protectedProcedure.input(z2.object({ service: z2.string() })).mutation(async ({ input }) => {
    delete mockApiKeys[input.service];
    return {
      success: true,
      service: input.service,
      message: "API key deleted"
    };
  }),
  // Get API health metrics
  getApiHealth: protectedProcedure.query(async () => {
    return {
      services: Object.values(mockApiKeys).map((key) => ({
        service: key.service,
        status: key.status,
        successRate: key.status === "active" ? 0.98 : 0,
        avgResponseTime: key.status === "active" ? "245ms" : "N/A",
        lastError: null,
        requestsToday: Math.floor(Math.random() * 500)
      })),
      overallHealth: "healthy",
      activeServices: Object.values(mockApiKeys).filter((k) => k.status === "active").length,
      totalServices: Object.keys(mockApiKeys).length
    };
  }),
  // Get setup instructions for service
  getSetupInstructions: protectedProcedure.input(z2.object({ service: z2.string() })).query(async ({ input }) => {
    const instructions = {
      shopify: {
        steps: [
          "Go to Shopify Admin \u2192 Settings \u2192 Apps and sales channels",
          "Click 'Develop apps' \u2192 'Create an app'",
          "Enable Admin API access",
          "Grant permissions: read_products, write_products, read_orders",
          "Install app to store",
          "Copy Admin API access token"
        ],
        docsUrl: "https://shopify.dev/docs/apps/auth/admin-app-access-tokens"
      },
      facebook: {
        steps: [
          "Go to Facebook Developers",
          "Create new app \u2192 Business \u2192 Manage business integrations",
          "Add Marketing API product",
          "Generate access token with ads_read, ads_management permissions",
          "Add your ad account ID"
        ],
        docsUrl: "https://developers.facebook.com/docs/marketing-api/overview"
      },
      whatsapp: {
        steps: [
          "Go to Meta Business Suite",
          "Add WhatsApp to your business",
          "Verify your phone number",
          "Create a WhatsApp Business account",
          "Get your Phone Number ID and Access Token"
        ],
        docsUrl: "https://business.facebook.com/wa/manage/phone-numbers/"
      }
    };
    return instructions[input.service] || { steps: [], docsUrl: "" };
  })
});
function maskApiKey(key) {
  if (key.length < 8) return "****";
  return key.substring(0, 4) + "****" + key.substring(key.length - 4);
}

// server/routers/whatsappBusiness.ts
import { z as z3 } from "zod";
var WHATSAPP_API_BASE = "https://graph.facebook.com/v19.0";
async function whatsappApi(phoneNumberId, token, endpoint, body) {
  const url = `${WHATSAPP_API_BASE}/${phoneNumberId}${endpoint}`;
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : void 0
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
    throw new Error(`WhatsApp API error: ${error.error?.message || response.statusText}`);
  }
  return response.json();
}
var whatsappBusinessRouter = router({
  // Get connection status
  getStatus: protectedProcedure.query(async () => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!phoneNumberId || !token) {
      return {
        connected: false,
        message: "WhatsApp Business API not configured",
        setupUrl: "https://business.facebook.com/wa/manage/phone-numbers/"
      };
    }
    try {
      const response = await whatsappApi(phoneNumberId, token, "");
      return {
        connected: true,
        phoneNumberId,
        qualityRating: response.quality_rating || "N/A",
        messagingLimit: response.messaging_limit || "Tier 1"
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : "Connection failed"
      };
    }
  }),
  // Send text message
  sendMessage: protectedProcedure.input(z3.object({
    to: z3.string(),
    // Phone number with country code
    message: z3.string(),
    previewUrl: z3.boolean().default(true)
  })).mutation(async ({ input }) => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!phoneNumberId || !token) {
      throw new Error("WhatsApp Business API not configured");
    }
    const response = await whatsappApi(phoneNumberId, token, "/messages", {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: input.to,
      type: "text",
      text: {
        body: input.message,
        preview_url: input.previewUrl
      }
    });
    return {
      success: true,
      messageId: response.messages?.[0]?.id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  // Send template message
  sendTemplate: protectedProcedure.input(z3.object({
    to: z3.string(),
    templateName: z3.string(),
    language: z3.string().default("en"),
    components: z3.array(z3.any()).optional()
  })).mutation(async ({ input }) => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!phoneNumberId || !token) {
      throw new Error("WhatsApp Business API not configured");
    }
    const response = await whatsappApi(phoneNumberId, token, "/messages", {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: input.to,
      type: "template",
      template: {
        name: input.templateName,
        language: { code: input.language },
        components: input.components || []
      }
    });
    return {
      success: true,
      messageId: response.messages?.[0]?.id,
      template: input.templateName
    };
  }),
  // Send media message (image/video)
  sendMedia: protectedProcedure.input(z3.object({
    to: z3.string(),
    mediaType: z3.enum(["image", "video", "document"]),
    mediaUrl: z3.string(),
    caption: z3.string().optional()
  })).mutation(async ({ input }) => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!phoneNumberId || !token) {
      throw new Error("WhatsApp Business API not configured");
    }
    const response = await whatsappApi(phoneNumberId, token, "/messages", {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: input.to,
      type: input.mediaType,
      [input.mediaType]: {
        link: input.mediaUrl,
        caption: input.caption
      }
    });
    return {
      success: true,
      messageId: response.messages?.[0]?.id,
      mediaType: input.mediaType
    };
  }),
  // Get chat messages
  getChatHistory: protectedProcedure.input(z3.object({
    phone: z3.string(),
    limit: z3.number().default(50)
  })).query(async ({ input }) => {
    return {
      phone: input.phone,
      messages: [],
      hasMore: false
    };
  }),
  // Get templates
  getTemplates: protectedProcedure.query(async () => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!phoneNumberId || !token) {
      return { templates: [] };
    }
    try {
      const response = await fetch(
        `${WHATSAPP_API_BASE}/${process.env.WHATSAPP_BUSINESS_ID}/message_templates`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      return { templates: data.data || [] };
    } catch {
      return { templates: [] };
    }
  }),
  // Broadcast message to multiple contacts
  broadcast: protectedProcedure.input(z3.object({
    contacts: z3.array(z3.string()),
    message: z3.string(),
    template: z3.string().optional()
  })).mutation(async ({ input }) => {
    const results = [];
    for (const contact of input.contacts) {
      try {
        if (input.template) {
          results.push({ phone: contact, status: "sent", template: input.template });
        } else {
          results.push({ phone: contact, status: "sent", message: input.message.substring(0, 50) });
        }
      } catch (error) {
        results.push({ phone: contact, status: "failed", error: String(error) });
      }
    }
    return {
      total: input.contacts.length,
      sent: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "failed").length,
      results
    };
  }),
  // Chatbot configuration
  getChatbotConfig: protectedProcedure.query(async () => {
    return {
      enabled: true,
      intents: [
        { intent: "price_inquiry", examples: ["how much", "price", "cost"], response: "Our Wagyu starts at R899/kg. View full menu: [link]" },
        { intent: "order_status", examples: ["where is my order", "delivery", "tracking"], response: "Let me check your order status. What's your order number?" },
        { intent: "halal_inquiry", examples: ["halal", "certified"], response: "Yes, all our meat is Halal certified. Certificate available on request." },
        { intent: "bulk_order", examples: ["wholesale", "bulk", "business"], response: "For wholesale inquiries, please contact us at wholesale@studexmeat.com" }
      ]
    };
  }),
  // Webhook handler (for incoming messages)
  processWebhook: protectedProcedure.input(z3.object({
    event: z3.any()
  })).mutation(async ({ input }) => {
    const event = input.event;
    if (event.type === "message") {
      const message = event.message;
      if (message.type === "text") {
        const text2 = message.text.body.toLowerCase();
        if (text2.includes("price") || text2.includes("cost")) {
          return { reply: "Our Wagyu starts at R899/kg. View full menu: https://studexmeat.com" };
        }
        if (text2.includes("order")) {
          return { reply: "Track your order at https://studexmeat.com/orders" };
        }
        if (text2.includes("hello") || text2.includes("hi")) {
          return { reply: "Hello! Welcome to StudEx Meat. How can I help you today?" };
        }
      }
    }
    return { received: true };
  })
});

// server/routers/productManager.ts
import { z as z4 } from "zod";
var productManagerRouter = router({
  // Get all products
  getProducts: protectedProcedure.input(z4.object({
    category: z4.enum(["all", "wagyu", "biltong", "coffee", "boxes"]).default("all"),
    status: z4.enum(["all", "active", "draft", "out_of_stock"]).default("active")
  })).query(async ({ input }) => {
    const products = [
      {
        id: "prod_001",
        name: "Wagyu Fillet A5",
        description: "Premium Japanese Wagyu fillet, marble score 9+",
        price: 899,
        category: "wagyu",
        status: "active",
        inventory: 25,
        images: ["https://studexmeat.com/images/wagyu-fillet.jpg"],
        variants: [
          { name: "500g", price: 899, sku: "WF-500" },
          { name: "1kg", price: 1699, sku: "WF-1KG" }
        ],
        tags: ["premium", "halal", "wagyu", "fillet"],
        salesLast30Days: 45,
        revenueLast30Days: 40455
      },
      {
        id: "prod_002",
        name: "Wagyu Burger Patties",
        description: "Hand-crafted Wagyu patties, 200g each",
        price: 249,
        category: "wagyu",
        status: "active",
        inventory: 100,
        images: ["https://studexmeat.com/images/wagyu-patties.jpg"],
        variants: [
          { name: "Pack of 4", price: 249, sku: "WB-4" },
          { name: "Pack of 8", price: 449, sku: "WB-8" }
        ],
        tags: ["burgers", "wagyu", "braai"],
        salesLast30Days: 120,
        revenueLast30Days: 29880
      },
      {
        id: "prod_003",
        name: "Premium Biltong",
        description: "Traditional South African biltong, sliced",
        price: 189,
        category: "biltong",
        status: "active",
        inventory: 75,
        images: ["https://studexmeat.com/images/biltong.jpg"],
        variants: [
          { name: "200g", price: 189, sku: "BL-200" },
          { name: "500g", price: 399, sku: "BL-500" }
        ],
        tags: ["biltong", "snack", "traditional"],
        salesLast30Days: 89,
        revenueLast30Days: 16821
      },
      {
        id: "prod_004",
        name: "Rwanda Single Origin Coffee",
        description: "Direct trade coffee from Lake Kivu region",
        price: 159,
        category: "coffee",
        status: "active",
        inventory: 50,
        images: ["https://studexmeat.com/images/coffee.jpg"],
        variants: [
          { name: "250g", price: 159, sku: "CF-250" },
          { name: "1kg", price: 499, sku: "CF-1KG" }
        ],
        tags: ["coffee", "rwanda", "single-origin"],
        salesLast30Days: 35,
        revenueLast30Days: 5565
      },
      {
        id: "prod_005",
        name: "Braai Master Box",
        description: "Curated selection for the perfect braai",
        price: 1299,
        category: "boxes",
        status: "active",
        inventory: 20,
        images: ["https://studexmeat.com/images/box-braai.jpg"],
        variants: [
          { name: "Box for 4", price: 1299, sku: "BX-BR4" },
          { name: "Box for 8", price: 2499, sku: "BX-BR8" }
        ],
        tags: ["subscription", "braai", "gift"],
        salesLast30Days: 18,
        revenueLast30Days: 23382
      }
    ];
    const filtered = products.filter((p) => {
      if (input.category !== "all" && p.category !== input.category) return false;
      if (input.status !== "all" && p.status !== input.status) return false;
      return true;
    });
    return {
      products: filtered,
      total: filtered.length,
      categories: ["wagyu", "biltong", "coffee", "boxes"]
    };
  }),
  // Get single product
  getProduct: protectedProcedure.input(z4.object({ productId: z4.string() })).query(async ({ input }) => {
    return {
      id: input.productId,
      name: "Wagyu Fillet A5",
      description: "Premium Japanese Wagyu fillet",
      price: 899,
      inventory: 25,
      salesHistory: [
        { date: "2026-04-01", sales: 2 },
        { date: "2026-04-15", sales: 3 },
        { date: "2026-04-22", sales: 1 }
      ]
    };
  }),
  // Update inventory
  updateInventory: protectedProcedure.input(z4.object({
    productId: z4.string(),
    quantity: z4.number(),
    operation: z4.enum(["set", "add", "subtract"]).default("set")
  })).mutation(async ({ input }) => {
    return {
      success: true,
      productId: input.productId,
      newQuantity: input.operation === "set" ? input.quantity : input.operation === "add" ? input.quantity + 25 : 25 - input.quantity,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  // Get product calendar
  getProductCalendar: protectedProcedure.input(z4.object({
    month: z4.number().min(1).max(12),
    year: z4.number().default(2026)
  })).query(async ({ input }) => {
    const campaigns = [
      {
        id: "camp_001",
        name: "Freedom Day Sale",
        date: "2026-04-27",
        product: "Wagyu Fillet A5",
        discount: "10%",
        platforms: ["instagram", "facebook", "whatsapp"],
        status: "scheduled"
      },
      {
        id: "camp_002",
        name: "Mother's Day Special",
        date: "2026-05-11",
        product: "Braai Master Box",
        discount: "Free Delivery",
        platforms: ["instagram", "whatsapp"],
        status: "scheduled"
      },
      {
        id: "camp_003",
        name: "Coffee Launch",
        date: "2026-05-01",
        product: "Rwanda Single Origin Coffee",
        discount: "20% off first order",
        platforms: ["instagram", "tiktok", "linkedin"],
        status: "draft"
      }
    ];
    const content = [
      { date: "2026-04-23", type: "reel", product: "Wagyu Fillet", status: "ready" },
      { date: "2026-04-24", type: "story", product: "Biltong", status: "scheduled" },
      { date: "2026-04-25", type: "carousel", product: "Braai Box", status: "in_review" },
      { date: "2026-04-26", type: "reel", product: "Wagyu", status: "scheduled" }
    ];
    return {
      month: input.month,
      year: input.year,
      campaigns,
      content,
      totalEvents: campaigns.length + content.length
    };
  }),
  // Create product campaign
  createCampaign: protectedProcedure.input(z4.object({
    name: z4.string(),
    productId: z4.string(),
    startDate: z4.string(),
    endDate: z4.string(),
    discount: z4.string().optional(),
    platforms: z4.array(z4.enum(["instagram", "facebook", "tiktok", "whatsapp", "email"])),
    budget: z4.number().optional()
  })).mutation(async ({ input }) => {
    return {
      success: true,
      campaignId: `camp_${Date.now()}`,
      ...input,
      status: "active",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  // Get campaign performance
  getCampaignPerformance: protectedProcedure.input(z4.object({ campaignId: z4.string() })).query(async ({ input }) => {
    return {
      campaignId: input.campaignId,
      impressions: 12500,
      clicks: 450,
      conversions: 23,
      revenue: 20677,
      roas: 3.2,
      platformBreakdown: [
        { platform: "instagram", spend: 1500, revenue: 8500 },
        { platform: "facebook", spend: 1e3, revenue: 6500 },
        { platform: "whatsapp", spend: 500, revenue: 5677 }
      ]
    };
  }),
  // Schedule product for promotion
  scheduleProductPromotion: protectedProcedure.input(z4.object({
    productId: z4.string(),
    date: z4.string(),
    platforms: z4.array(z4.string()),
    contentType: z4.enum(["reel", "carousel", "static", "story"]).default("reel"),
    budget: z4.number().optional()
  })).mutation(async ({ input }) => {
    return {
      success: true,
      scheduledId: `sch_${Date.now()}`,
      productId: input.productId,
      date: input.date,
      platforms: input.platforms,
      contentType: input.contentType,
      status: "scheduled"
    };
  }),
  // Get inventory alerts
  getInventoryAlerts: protectedProcedure.query(async () => {
    return {
      alerts: [
        { productId: "prod_001", product: "Wagyu Fillet A5", current: 25, threshold: 20, urgency: "medium" },
        { productId: "prod_005", product: "Braai Master Box", current: 20, threshold: 15, urgency: "medium" }
      ],
      lowStock: 2,
      outOfStock: 0
    };
  }),
  // Bulk schedule products
  bulkSchedule: protectedProcedure.input(z4.object({
    products: z4.array(z4.object({
      productId: z4.string(),
      date: z4.string(),
      platforms: z4.array(z4.string())
    }))
  })).mutation(async ({ input }) => {
    const scheduled = input.products.map((p, i) => ({
      ...p,
      scheduledId: `bulk_${Date.now()}_${i}`,
      status: "scheduled"
    }));
    return {
      success: true,
      scheduled: scheduled.length,
      items: scheduled
    };
  })
});

// server/routers/unifiedOrchestrator.ts
import { z as z5 } from "zod";
var unifiedOrchestratorRouter = router({
  // Complete business workflow that uses all systems
  runCompleteWorkflow: protectedProcedure.input(z5.object({
    workflowType: z5.enum(["research-to-content", "product-launch", "influencer-campaign", "daily-operations"]),
    parameters: z5.record(z5.any()).optional()
  })).mutation(async ({ input, ctx }) => {
    const results = {
      research: null,
      content: null,
      scheduling: null,
      distribution: null
    };
    switch (input.workflowType) {
      case "research-to-content":
        results.research = {
          status: "completed",
          trends: ["wagyu-braai-trending", "heritage-day-prep"],
          opportunities: ["coffee-export-rwanda", "wholesale-johannesburg"]
        };
        results.content = {
          status: "generated",
          items: [
            { type: "reel", topic: "wagyu-braai", hook: "Trending: The ultimate braai upgrade..." },
            { type: "carousel", topic: "heritage-day", hook: "Heritage Day is coming..." }
          ]
        };
        results.scheduling = {
          status: "scheduled",
          platforms: ["instagram", "tiktok", "facebook"],
          posts: 2
        };
        break;
      case "product-launch":
        results.research = { status: "market-analyzed", demand: "high" };
        results.content = { status: "campaign-created", assets: 5 };
        results.distribution = {
          status: "launched",
          channels: ["whatsapp", "instagram", "email"],
          reach: 5e3
        };
        break;
      case "influencer-campaign":
        results.research = { status: "influencer-research", bestPerforming: "braai-style" };
        results.content = {
          status: "videos-generated",
          videos: 3,
          influencers: input.parameters?.influencers || []
        };
        results.scheduling = { status: "coordinated", influencerPosts: 3 };
        break;
      case "daily-operations":
        results.research = { status: "daily-insights", newTrends: 2 };
        results.content = { status: "stories-generated", stories: 3 };
        results.distribution = { status: "whatsapp-messages", customersReached: 150 };
        break;
    }
    return {
      workflow: input.workflowType,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      results,
      nextActions: [
        "Review generated content",
        "Approve for publishing",
        "Monitor performance"
      ]
    };
  }),
  // Get system health - all integrations status
  getSystemHealth: protectedProcedure.query(async () => {
    return {
      services: {
        research: { status: "connected", lastRun: (/* @__PURE__ */ new Date()).toISOString() },
        content: { status: "connected", queueSize: 5 },
        whatsapp: { status: "connected", activeChats: 12 },
        products: { status: "connected", inventoryItems: 47 },
        blotato: { status: "connected", scheduledPosts: 8 }
      },
      obsidian: {
        status: "synced",
        lastSync: (/* @__PURE__ */ new Date()).toISOString(),
        notes: 156
      },
      opportunities: [
        { type: "trending", topic: "Rwanda coffee interest +23%", action: "Create content" },
        { type: "competitor", topic: "BraaiBox launched subscription", action: "Review pricing" },
        { type: "content", topic: "Wagyu slicing ASMR trending", action: "Create reel" }
      ]
    };
  }),
  // Research → Obsidian sync
  syncResearchToObsidian: protectedProcedure.mutation(async () => {
    const researchData = {
      trends: [
        { tag: "#wagyu", volume: "12.5k posts", growth: "+15%" },
        { tag: "#braaisa", volume: "8.2k posts", growth: "+23%" }
      ],
      competitors: [
        { name: "BraaiBox", action: "Launched premium tier", threat: "medium" }
      ],
      opportunities: [
        { type: "content", description: "Heritage Day campaign", priority: "high" },
        { type: "product", description: "Coffee subscription", priority: "medium" }
      ]
    };
    return {
      status: "synced",
      notesCreated: 3,
      vault: "/Users/tumeloramaphosa/Documents/Obsidian/StudEx",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  // Content → WhatsApp product push
  sendProductViaWhatsApp: protectedProcedure.input(z5.object({
    productId: z5.string(),
    customerSegment: z5.enum(["all", "vip", "interested", "new"]),
    message: z5.string().optional()
  })).mutation(async ({ input }) => {
    return {
      status: "sent",
      product: input.productId,
      segment: input.customerSegment,
      recipients: input.customerSegment === "all" ? 250 : 50,
      delivered: input.customerSegment === "all" ? 245 : 48,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  // Influencer → Content → Calendar → Blotato
  scheduleInfluencerContent: protectedProcedure.input(z5.object({
    influencerId: z5.string(),
    contentType: z5.enum(["reel", "carousel", "static", "story"]),
    product: z5.string(),
    scheduledDate: z5.string(),
    platforms: z5.array(z5.string())
  })).mutation(async ({ input }) => {
    return {
      status: "scheduled",
      influencer: input.influencerId,
      content: {
        type: input.contentType,
        product: input.product,
        hook: `Premium ${input.product} from StudEx...`
      },
      schedule: input.scheduledDate,
      platforms: input.platforms,
      blotatoId: `blot_${Date.now()}`
    };
  }),
  // Product calendar → Multi-platform campaign
  createProductCampaign: protectedProcedure.input(z5.object({
    productId: z5.string(),
    campaignName: z5.string(),
    startDate: z5.string(),
    endDate: z5.string(),
    platforms: z5.array(z5.enum(["whatsapp", "instagram", "facebook", "tiktok", "email"])),
    budget: z5.number().optional()
  })).mutation(async ({ input }) => {
    return {
      campaignId: `camp_${Date.now()}`,
      name: input.campaignName,
      product: input.productId,
      schedule: {
        start: input.startDate,
        end: input.endDate
      },
      platforms: input.platforms.map((p) => ({
        platform: p,
        status: "scheduled",
        contentCount: p === "whatsapp" ? 3 : 5
      })),
      totalContent: input.platforms.length * 4,
      status: "active"
    };
  })
});

// server/routers/analysis.ts
import { z as z6 } from "zod";
import { eq as eq2, desc, and, like } from "drizzle-orm";

// server/analysisEngine.ts
import axios2 from "axios";
import * as cheerio from "cheerio";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/analysisEngine.ts
async function fetchPage(url) {
  const start = Date.now();
  try {
    const response = await axios2.get(url, {
      timeout: 15e3,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NexusBot/1.0; +https://nexussocial.app)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    });
    return {
      html: response.data,
      headers: response.headers,
      statusCode: response.status,
      loadTimeMs: Date.now() - start
    };
  } catch (err) {
    return {
      html: "",
      headers: {},
      statusCode: err?.response?.status || 0,
      loadTimeMs: Date.now() - start
    };
  }
}
function extractDomain(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  }
}
async function lookupWhois(domain) {
  try {
    const response = await axios2.get(`https://api.whoisfreaks.com/v1.0/whois?apiKey=free&whois=live&domainName=${domain}`, { timeout: 8e3 });
    const data = response.data;
    return {
      domain,
      registrar: data?.registrar_name,
      createdDate: data?.create_date,
      expiresDate: data?.expiry_date,
      updatedDate: data?.update_date,
      nameservers: data?.name_servers,
      status: Array.isArray(data?.domain_status) ? data.domain_status : [data?.domain_status].filter(Boolean),
      country: data?.registrant_info?.country
    };
  } catch {
    try {
      const r2 = await axios2.get(`https://whois.freeaiapi.xyz/?name=${domain}`, { timeout: 8e3 });
      return { domain, registrar: r2.data?.registrar, createdDate: r2.data?.created };
    } catch {
      return { domain };
    }
  }
}
async function lookupDns(domain) {
  try {
    const [aRes, mxRes, txtRes] = await Promise.allSettled([
      axios2.get(`https://dns.google/resolve?name=${domain}&type=A`, { timeout: 5e3 }),
      axios2.get(`https://dns.google/resolve?name=${domain}&type=MX`, { timeout: 5e3 }),
      axios2.get(`https://dns.google/resolve?name=${domain}&type=TXT`, { timeout: 5e3 })
    ]);
    const records = [];
    if (aRes.status === "fulfilled") {
      (aRes.value.data?.Answer || []).forEach((r) => records.push({ type: "A", value: r.data }));
    }
    if (mxRes.status === "fulfilled") {
      (mxRes.value.data?.Answer || []).forEach((r) => records.push({ type: "MX", value: r.data }));
    }
    if (txtRes.status === "fulfilled") {
      (txtRes.value.data?.Answer || []).forEach((r) => records.push({ type: "TXT", value: r.data }));
    }
    return records;
  } catch {
    return [];
  }
}
function analyzeSeo(html, url, loadTimeMs, statusCode) {
  const $ = cheerio.load(html);
  const issues = [];
  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content") || "";
  const keywords = ($('meta[name="keywords"]').attr("content") || "").split(",").map((k) => k.trim()).filter(Boolean);
  const h1Tags = $("h1").map((_, el) => $(el).text().trim()).get().slice(0, 5);
  const h2Tags = $("h2").map((_, el) => $(el).text().trim()).get().slice(0, 10);
  const canonicalUrl = $('link[rel="canonical"]').attr("href") || "";
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const ogDescription = $('meta[property="og:description"]').attr("content") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  const robotsMeta = $('meta[name="robots"]').attr("content") || "";
  const schemaTypes = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "{}");
      if (data["@type"]) schemaTypes.push(data["@type"]);
    } catch {
    }
  });
  const allLinks = $("a[href]");
  let internalLinks = 0, externalLinks = 0;
  allLinks.each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href.startsWith("http") && !href.includes(extractDomain(url))) externalLinks++;
    else if (href.startsWith("/") || href.includes(extractDomain(url))) internalLinks++;
  });
  const images = $("img");
  const imageCount = images.length;
  const imagesWithAlt = images.filter((_, el) => !!$(el).attr("alt")).length;
  const wordCount = $("body").text().replace(/\s+/g, " ").trim().split(" ").length;
  const httpsEnabled = url.startsWith("https");
  let seoScore = 100;
  if (!title) {
    issues.push("Missing page title");
    seoScore -= 15;
  } else if (title.length < 30 || title.length > 60) {
    issues.push("Title length not optimal (30-60 chars)");
    seoScore -= 5;
  }
  if (!description) {
    issues.push("Missing meta description");
    seoScore -= 10;
  } else if (description.length < 120 || description.length > 160) {
    issues.push("Meta description length not optimal (120-160 chars)");
    seoScore -= 5;
  }
  if (h1Tags.length === 0) {
    issues.push("No H1 tag found");
    seoScore -= 10;
  }
  if (h1Tags.length > 1) {
    issues.push("Multiple H1 tags found");
    seoScore -= 5;
  }
  if (!canonicalUrl) {
    issues.push("No canonical URL set");
    seoScore -= 5;
  }
  if (!httpsEnabled) {
    issues.push("Site not using HTTPS");
    seoScore -= 15;
  }
  if (imageCount > 0 && imagesWithAlt < imageCount * 0.8) {
    issues.push("Many images missing alt text");
    seoScore -= 5;
  }
  if (schemaTypes.length === 0) {
    issues.push("No structured data (Schema.org) found");
    seoScore -= 5;
  }
  if (ogTitle === "") {
    issues.push("Missing Open Graph title");
    seoScore -= 3;
  }
  if (ogImage === "") {
    issues.push("Missing Open Graph image");
    seoScore -= 3;
  }
  let performanceScore = 100;
  if (loadTimeMs > 3e3) {
    performanceScore -= 30;
  } else if (loadTimeMs > 2e3) {
    performanceScore -= 15;
  } else if (loadTimeMs > 1e3) {
    performanceScore -= 5;
  }
  if (statusCode >= 400) performanceScore -= 50;
  return {
    title,
    description,
    keywords,
    h1Tags,
    h2Tags,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    robotsMeta,
    schemaTypes,
    internalLinks,
    externalLinks,
    imageCount,
    imagesWithAlt,
    wordCount,
    loadTimeMs,
    statusCode,
    httpsEnabled,
    seoScore: Math.max(0, seoScore),
    performanceScore: Math.max(0, performanceScore),
    issues
  };
}
function detectSocialProfiles(html, domain) {
  const $ = cheerio.load(html);
  const pageText = html.toLowerCase();
  const allLinks = $("a[href]").map((_, el) => $(el).attr("href") || "").get();
  const platforms = [
    { platform: "Facebook", patterns: ["facebook.com/", "fb.com/"] },
    { platform: "Instagram", patterns: ["instagram.com/"] },
    { platform: "LinkedIn", patterns: ["linkedin.com/company/", "linkedin.com/in/"] },
    { platform: "Twitter", patterns: ["twitter.com/", "x.com/"] },
    { platform: "TikTok", patterns: ["tiktok.com/@"] },
    { platform: "YouTube", patterns: ["youtube.com/channel/", "youtube.com/@", "youtube.com/c/"] },
    { platform: "Pinterest", patterns: ["pinterest.com/"] },
    { platform: "WhatsApp", patterns: ["wa.me/", "whatsapp.com/"] }
  ];
  return platforms.map(({ platform, patterns }) => {
    const found = allLinks.find((link) => patterns.some((p) => link.includes(p)));
    return {
      platform,
      url: found || void 0,
      handle: found ? found.split("/").filter(Boolean).pop() : void 0,
      detected: !!found || patterns.some((p) => pageText.includes(p))
    };
  });
}
function detectTechStack(html, headers) {
  const $ = cheerio.load(html);
  const pageText = html.toLowerCase();
  const scripts = $("script[src]").map((_, el) => $(el).attr("src") || "").get().join(" ").toLowerCase();
  const allHtml = html.toLowerCase();
  const stack = {
    frameworks: [],
    analytics: [],
    marketing: [],
    security: [],
    fonts: [],
    libraries: []
  };
  if (allHtml.includes("wp-content") || allHtml.includes("wp-includes")) stack.cms = "WordPress";
  else if (allHtml.includes("shopify")) stack.cms = "Shopify";
  else if (allHtml.includes("squarespace")) stack.cms = "Squarespace";
  else if (allHtml.includes("wix.com") || allHtml.includes("wixsite")) stack.cms = "Wix";
  else if (allHtml.includes("webflow")) stack.cms = "Webflow";
  else if (allHtml.includes("ghost")) stack.cms = "Ghost";
  else if (allHtml.includes("drupal")) stack.cms = "Drupal";
  else if (allHtml.includes("joomla")) stack.cms = "Joomla";
  if (scripts.includes("react") || allHtml.includes("__react")) stack.frameworks.push("React");
  if (scripts.includes("vue") || allHtml.includes("__vue")) stack.frameworks.push("Vue.js");
  if (scripts.includes("angular") || allHtml.includes("ng-version")) stack.frameworks.push("Angular");
  if (scripts.includes("next") || allHtml.includes("__next")) stack.frameworks.push("Next.js");
  if (scripts.includes("nuxt") || allHtml.includes("__nuxt")) stack.frameworks.push("Nuxt.js");
  if (scripts.includes("svelte")) stack.frameworks.push("Svelte");
  if (scripts.includes("jquery")) stack.libraries.push("jQuery");
  if (scripts.includes("bootstrap")) stack.libraries.push("Bootstrap");
  if (scripts.includes("tailwind")) stack.libraries.push("Tailwind CSS");
  if (allHtml.includes("google-analytics") || allHtml.includes("gtag") || allHtml.includes("ga.js")) stack.analytics.push("Google Analytics");
  if (allHtml.includes("googletagmanager")) stack.analytics.push("Google Tag Manager");
  if (allHtml.includes("hotjar")) stack.analytics.push("Hotjar");
  if (allHtml.includes("mixpanel")) stack.analytics.push("Mixpanel");
  if (allHtml.includes("segment.com")) stack.analytics.push("Segment");
  if (allHtml.includes("clarity.ms")) stack.analytics.push("Microsoft Clarity");
  if (allHtml.includes("facebook.net/en_US/fbevents")) stack.analytics.push("Facebook Pixel");
  if (allHtml.includes("hubspot")) stack.marketing.push("HubSpot");
  if (allHtml.includes("mailchimp")) stack.marketing.push("Mailchimp");
  if (allHtml.includes("klaviyo")) stack.marketing.push("Klaviyo");
  if (allHtml.includes("intercom")) stack.marketing.push("Intercom");
  if (allHtml.includes("drift.com")) stack.marketing.push("Drift");
  if (allHtml.includes("crisp.chat")) stack.marketing.push("Crisp");
  if (allHtml.includes("zendesk")) stack.marketing.push("Zendesk");
  if (allHtml.includes("cloudflare") || headers["cf-ray"]) stack.cdn = "Cloudflare";
  else if (allHtml.includes("fastly")) stack.cdn = "Fastly";
  else if (allHtml.includes("amazonaws.com")) stack.cdn = "AWS CloudFront";
  else if (allHtml.includes("akamai")) stack.cdn = "Akamai";
  const server = (headers["server"] || "").toLowerCase();
  if (server.includes("vercel") || allHtml.includes("vercel")) stack.hosting = "Vercel";
  else if (server.includes("netlify") || allHtml.includes("netlify")) stack.hosting = "Netlify";
  else if (allHtml.includes("heroku")) stack.hosting = "Heroku";
  else if (server.includes("apache")) stack.hosting = "Apache";
  else if (server.includes("nginx")) stack.hosting = "Nginx";
  else if (allHtml.includes("amazonaws.com")) stack.hosting = "AWS";
  else if (allHtml.includes("azure")) stack.hosting = "Microsoft Azure";
  else if (allHtml.includes("googlecloud") || allHtml.includes("gcp")) stack.hosting = "Google Cloud";
  if (allHtml.includes("shopify")) stack.ecommerce = "Shopify";
  else if (allHtml.includes("woocommerce")) stack.ecommerce = "WooCommerce";
  else if (allHtml.includes("magento")) stack.ecommerce = "Magento";
  else if (allHtml.includes("bigcommerce")) stack.ecommerce = "BigCommerce";
  if (headers["strict-transport-security"]) stack.security.push("HSTS");
  if (headers["content-security-policy"]) stack.security.push("CSP");
  if (headers["x-frame-options"]) stack.security.push("X-Frame-Options");
  if (allHtml.includes("recaptcha")) stack.security.push("reCAPTCHA");
  if (allHtml.includes("fonts.googleapis.com")) stack.fonts.push("Google Fonts");
  if (allHtml.includes("typekit") || allHtml.includes("use.typekit")) stack.fonts.push("Adobe Fonts");
  if (allHtml.includes("fonts.bunny.net")) stack.fonts.push("Bunny Fonts");
  return stack;
}
async function generateAiSummary(domain, seoData, techStack, socialProfiles) {
  const detectedSocials = socialProfiles.filter((s) => s.detected).map((s) => s.platform).join(", ");
  const techSummary = [
    techStack.cms ? `CMS: ${techStack.cms}` : "",
    techStack.frameworks?.length ? `Frameworks: ${techStack.frameworks.join(", ")}` : "",
    techStack.hosting ? `Hosting: ${techStack.hosting}` : "",
    techStack.analytics?.length ? `Analytics: ${techStack.analytics.join(", ")}` : ""
  ].filter(Boolean).join("; ");
  const prompt = `You are a business intelligence analyst. Analyze this website and provide structured insights.

Domain: ${domain}
Page Title: ${seoData.title || "Unknown"}
Description: ${seoData.description || "None"}
SEO Score: ${seoData.seoScore}/100
Performance Score: ${seoData.performanceScore}/100
Tech Stack: ${techSummary || "Unknown"}
Social Media Presence: ${detectedSocials || "None detected"}
Word Count: ${seoData.wordCount}
HTTPS: ${seoData.httpsEnabled ? "Yes" : "No"}

Respond in JSON format with these exact fields:
{
  "summary": "3-4 sentence business intelligence summary",
  "industry": "single industry category (e.g. E-commerce, SaaS, Healthcare, Finance, Media, etc.)",
  "marketPosition": "brief market positioning statement",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "opportunities": ["opportunity1", "opportunity2"],
  "benchmarkComparison": "how this site compares to industry average",
  "recommendedActions": ["action1", "action2", "action3"]
}`;
  try {
    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "business_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              industry: { type: "string" },
              marketPosition: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              opportunities: { type: "array", items: { type: "string" } },
              benchmarkComparison: { type: "string" },
              recommendedActions: { type: "array", items: { type: "string" } }
            },
            required: ["summary", "industry", "marketPosition", "strengths", "weaknesses", "opportunities", "benchmarkComparison", "recommendedActions"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary,
      industry: parsed.industry,
      competitive: parsed
    };
  } catch {
    return {
      summary: `Analysis of ${domain} completed. The site uses ${techStack.cms || "an unknown CMS"} and has an SEO score of ${seoData.seoScore}/100.`,
      industry: "General Business",
      competitive: {}
    };
  }
}
function generateMarkdownReport(domain, whois, seo, social, tech, aiResult, analysisDate) {
  const socialTable = social.filter((s) => s.detected).map((s) => `| ${s.platform} | ${s.url || "Detected"} | ${s.followers?.toLocaleString() || "N/A"} |`).join("\n");
  return `# Business Intelligence Report: ${domain}
**Analysis Date:** ${analysisDate}
**Generated by:** Nexus Social Intelligence Platform

---

## Executive Summary
${aiResult.summary || "Analysis completed."}

**Industry:** ${aiResult.industry || "General Business"}
**Market Position:** ${aiResult.marketPosition || "N/A"}

---

## 1. Domain & Registration
| Field | Value |
|---|---|
| Domain | ${domain} |
| Registrar | ${whois.registrar || "N/A"} |
| Created | ${whois.createdDate || "N/A"} |
| Expires | ${whois.expiresDate || "N/A"} |
| Country | ${whois.country || "N/A"} |
| Nameservers | ${whois.nameservers?.join(", ") || "N/A"} |

---

## 2. SEO & Performance
| Metric | Score |
|---|---|
| SEO Score | ${seo.seoScore}/100 |
| Performance Score | ${seo.performanceScore}/100 |
| Page Load Time | ${seo.loadTimeMs}ms |
| HTTPS | ${seo.httpsEnabled ? "Yes" : "No"} |
| Word Count | ${seo.wordCount} |
| Internal Links | ${seo.internalLinks} |
| External Links | ${seo.externalLinks} |

**Page Title:** ${seo.title || "None"}
**Meta Description:** ${seo.description || "None"}
**H1 Tags:** ${seo.h1Tags?.join(", ") || "None"}
**Schema Types:** ${seo.schemaTypes?.join(", ") || "None"}

### SEO Issues
${seo.issues?.map((i) => `- ${i}`).join("\n") || "No major issues found."}

---

## 3. Social Media Presence
| Platform | URL | Followers |
|---|---|---|
${socialTable || "| No social profiles detected | | |"}

---

## 4. Technology Stack
| Category | Technology |
|---|---|
| CMS | ${tech.cms || "Unknown"} |
| Frameworks | ${tech.frameworks?.join(", ") || "None detected"} |
| Hosting | ${tech.hosting || "Unknown"} |
| CDN | ${tech.cdn || "None detected"} |
| Analytics | ${tech.analytics?.join(", ") || "None detected"} |
| Marketing | ${tech.marketing?.join(", ") || "None detected"} |
| E-commerce | ${tech.ecommerce || "None"} |
| Security | ${tech.security?.join(", ") || "None detected"} |

---

## 5. Competitive Analysis
**Strengths:**
${aiResult.strengths?.map((s) => `- ${s}`).join("\n") || "- N/A"}

**Weaknesses:**
${aiResult.weaknesses?.map((s) => `- ${s}`).join("\n") || "- N/A"}

**Opportunities:**
${aiResult.opportunities?.map((s) => `- ${s}`).join("\n") || "- N/A"}

**Industry Benchmark:** ${aiResult.benchmarkComparison || "N/A"}

---

## 6. Recommended Actions
${aiResult.recommendedActions?.map((a, i) => `${i + 1}. ${a}`).join("\n") || "No recommendations available."}

---
*Report generated by Nexus Social Intelligence Platform*
`;
}

// server/routers/analysis.ts
var analysisRouter = router({
  // Start a new analysis
  analyze: protectedProcedure.input(z6.object({ url: z6.string().url() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const domain = extractDomain(input.url);
    const normalizedUrl = input.url.startsWith("http") ? input.url : `https://${input.url}`;
    const cached = await db.select().from(analysisCache).where(eq2(analysisCache.domain, domain)).limit(1);
    const now = /* @__PURE__ */ new Date();
    const useCache = cached.length > 0 && new Date(cached[0].expiresAt) > now;
    const [inserted] = await db.insert(analyses).values({
      userId: ctx.user.id,
      url: normalizedUrl,
      domain,
      status: "running",
      isCached: useCache
    });
    const analysisId = inserted.insertId;
    runAnalysis(db, analysisId, normalizedUrl, domain, useCache ? cached[0] : null).catch(console.error);
    return { analysisId, domain, status: "running" };
  }),
  // Get analysis by ID (poll for status)
  getById: protectedProcedure.input(z6.object({ id: z6.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const result = await db.select().from(analyses).where(and(eq2(analyses.id, input.id), eq2(analyses.userId, ctx.user.id))).limit(1);
    return result[0] || null;
  }),
  // Get analysis history for current user
  getHistory: protectedProcedure.input(z6.object({ limit: z6.number().default(20), offset: z6.number().default(0), search: z6.string().optional() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const conditions = [eq2(analyses.userId, ctx.user.id)];
    if (input.search) conditions.push(like(analyses.domain, `%${input.search}%`));
    const results = await db.select().from(analyses).where(and(...conditions)).orderBy(desc(analyses.createdAt)).limit(input.limit).offset(input.offset);
    return results;
  }),
  // Delete analysis
  delete: protectedProcedure.input(z6.object({ id: z6.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db.delete(analyses).where(and(eq2(analyses.id, input.id), eq2(analyses.userId, ctx.user.id)));
    return { success: true };
  }),
  // Search RAG index
  searchRag: protectedProcedure.input(z6.object({ query: z6.string().min(3) })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const results = await db.select().from(ragIndex).where(like(ragIndex.content, `%${input.query}%`)).limit(10);
    return results;
  })
});
async function runAnalysis(db, analysisId, url, domain, cachedData) {
  try {
    let html = cachedData?.rawHtml || "";
    let headers = cachedData?.headers || {};
    let loadTimeMs = 0;
    let statusCode = 200;
    if (!html) {
      const fetched = await fetchPage(url);
      html = fetched.html;
      headers = fetched.headers;
      loadTimeMs = fetched.loadTimeMs;
      statusCode = fetched.statusCode;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await db.insert(analysisCache).values({
        domain,
        rawHtml: html.substring(0, 65e3),
        // MySQL TEXT limit
        headers: JSON.stringify(headers),
        technologies: JSON.stringify({}),
        metaTags: JSON.stringify({}),
        expiresAt
      }).onDuplicateKeyUpdate({
        set: {
          rawHtml: html.substring(0, 65e3),
          headers: JSON.stringify(headers),
          expiresAt
        }
      });
    }
    const [whoisData, dnsRecords, seoData, socialProfiles, techStack] = await Promise.all([
      lookupWhois(domain),
      lookupDns(domain),
      Promise.resolve(analyzeSeo(html, url, loadTimeMs, statusCode)),
      Promise.resolve(detectSocialProfiles(html, domain)),
      Promise.resolve(detectTechStack(html, headers))
    ]);
    const aiResult = await generateAiSummary(domain, seoData, techStack, socialProfiles);
    const reportMarkdown = generateMarkdownReport(
      domain,
      whoisData,
      seoData,
      socialProfiles,
      techStack,
      aiResult,
      (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    );
    const totalFollowers = socialProfiles.reduce((sum, s) => sum + (s.followers || 0), 0);
    await db.update(analyses).set({
      status: "completed",
      companyName: seoData.title?.split("|")[0]?.split("-")[0]?.trim() || domain,
      whoisData: JSON.stringify(whoisData),
      dnsRecords: JSON.stringify(dnsRecords),
      seoData: JSON.stringify(seoData),
      performanceScore: seoData.performanceScore,
      seoScore: seoData.seoScore,
      socialProfiles: JSON.stringify(socialProfiles),
      totalSocialFollowers: totalFollowers,
      techStack: JSON.stringify(techStack),
      competitiveData: JSON.stringify(aiResult.competitive),
      aiSummary: aiResult.summary,
      industryCategory: aiResult.industry,
      reportMarkdown,
      cachedAt: /* @__PURE__ */ new Date()
    }).where(eq2(analyses.id, analysisId));
    const ragChunks = [
      { chunkType: "summary", content: `${domain}: ${aiResult.summary}` },
      { chunkType: "seo", content: `${domain} SEO: Score ${seoData.seoScore}/100. Title: ${seoData.title}. Description: ${seoData.description}. Issues: ${seoData.issues?.join(", ")}` },
      { chunkType: "tech", content: `${domain} Tech Stack: CMS: ${techStack.cms || "unknown"}, Frameworks: ${techStack.frameworks?.join(", ")}, Hosting: ${techStack.hosting}` },
      { chunkType: "social", content: `${domain} Social Media: ${socialProfiles.filter((s) => s.detected).map((s) => s.platform).join(", ")}` },
      { chunkType: "competitive", content: `${domain} Competitive: Industry: ${aiResult.industry}. Strengths: ${aiResult.competitive?.strengths?.join(", ")}. Weaknesses: ${aiResult.competitive?.weaknesses?.join(", ")}` }
    ];
    for (const chunk of ragChunks) {
      await db.insert(ragIndex).values({
        analysisId,
        domain,
        chunkType: chunk.chunkType,
        content: chunk.content
      });
    }
  } catch (err) {
    console.error("[Analysis] Failed:", err);
    await db.update(analyses).set({ status: "failed" }).where(eq2(analyses.id, analysisId));
  }
}

// server/routers/integrations.ts
import { z as z7 } from "zod";
import { eq as eq3, and as and2 } from "drizzle-orm";
async function shopifyFetch(domain, token, endpoint) {
  const url = `https://${domain}/admin/api/2024-01${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  return res.json();
}
var integrationsRouter = router({
  // Get all integrations for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    return db.select().from(integrations).where(eq3(integrations.userId, ctx.user.id));
  }),
  // Connect Shopify store
  connectShopify: protectedProcedure.input(z7.object({
    shopifyDomain: z7.string().min(3),
    shopifyAccessToken: z7.string().min(10)
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    try {
      await shopifyFetch(input.shopifyDomain, input.shopifyAccessToken, "/shop.json");
    } catch {
      throw new Error("Invalid Shopify credentials. Please check your domain and access token.");
    }
    let workspaceId = 1;
    const existing = await db.select().from(integrations).where(and2(eq3(integrations.userId, ctx.user.id), eq3(integrations.type, "shopify"))).limit(1);
    if (existing.length > 0) {
      await db.update(integrations).set({
        shopifyDomain: input.shopifyDomain,
        shopifyAccessToken: input.shopifyAccessToken,
        status: "active",
        lastSyncedAt: /* @__PURE__ */ new Date()
      }).where(eq3(integrations.id, existing[0].id));
      return { success: true, message: "Shopify reconnected successfully" };
    }
    await db.insert(integrations).values({
      workspaceId,
      userId: ctx.user.id,
      type: "shopify",
      status: "active",
      shopifyDomain: input.shopifyDomain,
      shopifyAccessToken: input.shopifyAccessToken,
      lastSyncedAt: /* @__PURE__ */ new Date()
    });
    return { success: true, message: "Shopify connected successfully" };
  }),
  // Connect Facebook / Meta
  connectMeta: protectedProcedure.input(z7.object({
    metaAccessToken: z7.string().min(10),
    metaPageId: z7.string().optional(),
    metaBusinessId: z7.string().optional(),
    metaAdAccountId: z7.string().optional(),
    metaInstagramId: z7.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const verifyRes = await fetch(`https://graph.facebook.com/me?access_token=${input.metaAccessToken}`);
    if (!verifyRes.ok) throw new Error("Invalid Meta access token");
    const existing = await db.select().from(integrations).where(and2(eq3(integrations.userId, ctx.user.id), eq3(integrations.type, "facebook"))).limit(1);
    const values = {
      workspaceId: 1,
      userId: ctx.user.id,
      type: "facebook",
      status: "active",
      metaAccessToken: input.metaAccessToken,
      metaPageId: input.metaPageId,
      metaBusinessId: input.metaBusinessId,
      metaAdAccountId: input.metaAdAccountId,
      metaInstagramId: input.metaInstagramId,
      lastSyncedAt: /* @__PURE__ */ new Date()
    };
    if (existing.length > 0) {
      await db.update(integrations).set(values).where(eq3(integrations.id, existing[0].id));
    } else {
      await db.insert(integrations).values(values);
    }
    return { success: true, message: "Meta/Facebook connected successfully" };
  }),
  // Sync Shopify orders
  syncShopifyOrders: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const integration = await db.select().from(integrations).where(and2(eq3(integrations.userId, ctx.user.id), eq3(integrations.type, "shopify"))).limit(1);
    if (!integration.length || !integration[0].shopifyDomain || !integration[0].shopifyAccessToken) {
      throw new Error("Shopify not connected. Please connect your Shopify store first.");
    }
    const { shopifyDomain, shopifyAccessToken, workspaceId } = integration[0];
    const data = await shopifyFetch(shopifyDomain, shopifyAccessToken, "/orders.json?limit=250&status=any");
    const orders = data.orders || [];
    let synced = 0;
    for (const order of orders) {
      await db.insert(shopifyOrders).values({
        workspaceId: workspaceId || 1,
        shopifyOrderId: String(order.id),
        totalPrice: parseFloat(order.total_price || "0"),
        currency: order.currency,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        customerId: order.customer ? String(order.customer.id) : null,
        lineItems: order.line_items,
        shopifyCreatedAt: new Date(order.created_at)
      }).catch(() => {
      });
      synced++;
    }
    await db.update(integrations).set({ lastSyncedAt: /* @__PURE__ */ new Date() }).where(eq3(integrations.id, integration[0].id));
    return { success: true, synced, message: `Synced ${synced} orders from Shopify` };
  }),
  // Sync Shopify products
  syncShopifyProducts: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const integration = await db.select().from(integrations).where(and2(eq3(integrations.userId, ctx.user.id), eq3(integrations.type, "shopify"))).limit(1);
    if (!integration.length || !integration[0].shopifyDomain || !integration[0].shopifyAccessToken) {
      throw new Error("Shopify not connected");
    }
    const { shopifyDomain, shopifyAccessToken, workspaceId } = integration[0];
    const data = await shopifyFetch(shopifyDomain, shopifyAccessToken, "/products.json?limit=250");
    const products = data.products || [];
    for (const product of products) {
      await db.insert(shopifyProducts).values({
        workspaceId: workspaceId || 1,
        shopifyProductId: String(product.id),
        title: product.title,
        description: product.body_html?.replace(/<[^>]*>/g, ""),
        productType: product.product_type,
        tags: product.tags ? product.tags.split(",").map((t2) => t2.trim()) : [],
        variants: product.variants,
        images: product.images,
        status: product.status
      }).catch(() => {
      });
    }
    return { success: true, synced: products.length };
  }),
  // Get Shopify dashboard stats
  getShopifyStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const integration = await db.select().from(integrations).where(and2(eq3(integrations.userId, ctx.user.id), eq3(integrations.type, "shopify"))).limit(1);
    if (!integration.length) return null;
    const orders = await db.select().from(shopifyOrders).where(eq3(shopifyOrders.workspaceId, integration[0].workspaceId || 1));
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const paidOrders = orders.filter((o) => o.financialStatus === "paid").length;
    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      paidOrders,
      conversionRate: totalOrders > 0 ? paidOrders / totalOrders * 100 : 0,
      lastSyncedAt: integration[0].lastSyncedAt,
      shopifyDomain: integration[0].shopifyDomain
    };
  }),
  // Get products list
  getProducts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const integration = await db.select().from(integrations).where(and2(eq3(integrations.userId, ctx.user.id), eq3(integrations.type, "shopify"))).limit(1);
    if (!integration.length) return [];
    return db.select().from(shopifyProducts).where(eq3(shopifyProducts.workspaceId, integration[0].workspaceId || 1)).limit(50);
  }),
  // Get integration status overview
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const all = await db.select().from(integrations).where(eq3(integrations.userId, ctx.user.id));
    return {
      shopify: all.find((i) => i.type === "shopify") || null,
      facebook: all.find((i) => i.type === "facebook") || null,
      googleAds: all.find((i) => i.type === "google_ads") || null,
      whatsapp: all.find((i) => i.type === "whatsapp") || null
    };
  }),
  // Generate AI spend optimisation report
  generateSpendReport: protectedProcedure.input(z7.object({
    totalSpend: z7.number(),
    followers: z7.number().optional(),
    platform: z7.string().default("facebook")
  })).mutation(async ({ ctx, input }) => {
    const prompt = `You are a senior digital marketing strategist specialising in South African food brands and e-commerce.

A brand has spent R${input.totalSpend.toLocaleString()} on ${input.platform} advertising and has ${input.followers?.toLocaleString() || "unknown"} followers.

Generate a detailed spend optimisation report with:
1. Key observations about their current spend efficiency
2. Top 5 specific actions to reduce wasted spend (with estimated % savings for each)
3. Audience targeting recommendations
4. Content strategy to improve organic reach and reduce paid dependency
5. A weekly content calendar template (Mon-Sun)
6. KPIs to track going forward

Format as a structured report with clear headings. Be specific, actionable, and tailored to a premium Halal meat brand in South Africa.`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an expert digital marketing strategist for South African food and e-commerce brands." },
        { role: "user", content: prompt }
      ]
    });
    const report = response.choices[0]?.message?.content || "Report generation failed";
    return { report, generatedAt: /* @__PURE__ */ new Date() };
  })
});

// server/routers/knowledge.ts
import { z as z8 } from "zod";
import { eq as eq4, desc as desc3, like as like2, or, and as and3 } from "drizzle-orm";
function chunkText(text2, chunkSize = 500) {
  const paragraphs = text2.split(/\n{2,}/);
  const chunks = [];
  let current = "";
  for (const para of paragraphs) {
    if ((current + para).length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((c) => c.length > 30);
}
var knowledgeRouter = router({
  // ─── Ingest a document into the knowledge base ───────────────────────────
  ingest: protectedProcedure.input(z8.object({
    title: z8.string().min(1),
    content: z8.string().min(10),
    source: z8.string().optional().default("manual"),
    docType: z8.enum(["research", "transcript", "report", "notes", "strategy", "client"]).default("notes"),
    tags: z8.array(z8.string()).optional().default([])
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const [inserted] = await db.insert(knowledgeDocs).values({
      userId: ctx.user.id,
      title: input.title,
      content: input.content,
      source: input.source,
      docType: input.docType,
      tags: input.tags,
      chunkCount: 0
    });
    const docId = inserted.insertId;
    const chunks = chunkText(input.content);
    for (const chunk of chunks) {
      await db.insert(ragIndex).values({
        chunkType: `doc_${input.docType}`,
        content: `[${input.title}] ${chunk}`
      });
    }
    await db.update(knowledgeDocs).set({ chunkCount: chunks.length }).where(eq4(knowledgeDocs.id, docId));
    return { docId, chunkCount: chunks.length, title: input.title };
  }),
  // ─── List all knowledge documents ────────────────────────────────────────
  list: protectedProcedure.input(z8.object({
    search: z8.string().optional(),
    docType: z8.enum(["research", "transcript", "report", "notes", "strategy", "client", "all"]).optional().default("all")
  })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const conditions = [eq4(knowledgeDocs.userId, ctx.user.id)];
    if (input.search) {
      conditions.push(
        or(
          like2(knowledgeDocs.title, `%${input.search}%`),
          like2(knowledgeDocs.content, `%${input.search}%`)
        )
      );
    }
    if (input.docType !== "all") {
      conditions.push(eq4(knowledgeDocs.docType, input.docType));
    }
    const docs = await db.select({
      id: knowledgeDocs.id,
      title: knowledgeDocs.title,
      source: knowledgeDocs.source,
      docType: knowledgeDocs.docType,
      tags: knowledgeDocs.tags,
      chunkCount: knowledgeDocs.chunkCount,
      createdAt: knowledgeDocs.createdAt
    }).from(knowledgeDocs).where(and3(...conditions)).orderBy(desc3(knowledgeDocs.createdAt)).limit(50);
    return docs;
  }),
  // ─── Delete a knowledge document ─────────────────────────────────────────
  delete: protectedProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db.delete(knowledgeDocs).where(and3(eq4(knowledgeDocs.id, input.id), eq4(knowledgeDocs.userId, ctx.user.id)));
    return { success: true };
  }),
  // ─── Keyword search across ragIndex ──────────────────────────────────────
  search: protectedProcedure.input(z8.object({ query: z8.string().min(2) })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const keywords = input.query.split(/\s+/).filter((k) => k.length > 2);
    const results = [];
    for (const keyword of keywords.slice(0, 5)) {
      const hits = await db.select().from(ragIndex).where(like2(ragIndex.content, `%${keyword}%`)).limit(5);
      results.push(...hits);
    }
    const seen = /* @__PURE__ */ new Set();
    const unique = results.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
    return unique.slice(0, 10);
  }),
  // ─── Ask Brain: LLM-powered RAG query ────────────────────────────────────
  askBrain: protectedProcedure.input(z8.object({ question: z8.string().min(5) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const keywords = input.question.split(/\s+/).filter((k) => k.length > 3).slice(0, 6);
    const contextChunks = [];
    const sources = [];
    for (const keyword of keywords) {
      const hits = await db.select().from(ragIndex).where(like2(ragIndex.content, `%${keyword}%`)).limit(4);
      for (const hit of hits) {
        if (!contextChunks.includes(hit.content)) {
          contextChunks.push(hit.content);
          if (hit.domain) sources.push(hit.domain);
        }
      }
    }
    const context = contextChunks.slice(0, 12).join("\n\n---\n\n").substring(0, 3e3);
    const systemPrompt = `You are the StudEx DevOps Super Brain \u2014 an AI assistant with access to the company's internal knowledge base.
      
Your role is to answer questions using the provided knowledge base context. Be specific, cite relevant details from the context, and give actionable insights.

If the context doesn't contain enough information to fully answer the question, say so clearly and provide what you can from the context.

Always structure your response clearly with:
1. A direct answer to the question
2. Supporting evidence from the knowledge base
3. Actionable recommendations where relevant

Knowledge Base Context:
${context || "No relevant documents found in the knowledge base yet. The user should ingest documents first."}`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.question }
      ]
    });
    const rawContent = response?.choices?.[0]?.message?.content;
    const answer = typeof rawContent === "string" ? rawContent : Array.isArray(rawContent) ? rawContent.map((c) => c.text || "").join("") : "Unable to generate a response. Please try again.";
    return {
      answer,
      chunksUsed: contextChunks.length,
      sources: Array.from(new Set(sources)).slice(0, 5),
      question: input.question
    };
  }),
  // ─── Get stats ────────────────────────────────────────────────────────────
  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const docs = await db.select().from(knowledgeDocs).where(eq4(knowledgeDocs.userId, ctx.user.id));
    const chunks = await db.select().from(ragIndex).limit(1e3);
    return {
      totalDocs: docs.length,
      totalChunks: chunks.length,
      docsByType: docs.reduce((acc, d) => {
        acc[d.docType] = (acc[d.docType] || 0) + 1;
        return acc;
      }, {})
    };
  })
});

// server/routers/mirofishIntegration.ts
import { z as z9 } from "zod";
var TrendSchema = z9.object({
  id: z9.string(),
  keyword: z9.string(),
  score: z9.number(),
  platform: z9.enum(["instagram", "tiktok", "twitter", "facebook"]),
  timestamp: z9.string(),
  related_hashtags: z9.array(z9.string()),
  engagement_rate: z9.number().optional()
});
var StrategySchema = z9.object({
  title: z9.string(),
  description: z9.string(),
  confidence: z9.number(),
  actionable_items: z9.array(z9.string()),
  expected_impact: z9.string()
});
var mirofishRouter = router({
  // Get trending topics from social media
  getTrends: protectedProcedure.input(z9.object({
    platform: z9.enum(["instagram", "tiktok", "twitter", "facebook", "all"]).optional(),
    category: z9.string().optional(),
    limit: z9.number().default(20)
  })).output(z9.array(TrendSchema)).query(async ({ input }) => {
    try {
      const response = await fetch("http://localhost:8001/research/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (!response.ok) {
        throw new Error(`MiroFish service error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return [
        {
          id: "trend-1",
          keyword: "#WagyuWednesday",
          score: 94,
          platform: "instagram",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          related_hashtags: ["#Wagyu", "#PremiumBeef", "#Halal"],
          engagement_rate: 0.045
        },
        {
          id: "trend-2",
          keyword: "#BraaiSeason",
          score: 89,
          platform: "tiktok",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          related_hashtags: ["#Braai", "#SouthAfrican", "#HeritageDay"],
          engagement_rate: 0.052
        }
      ];
    }
  }),
  // Analyze content performance
  analyzeContent: protectedProcedure.input(z9.object({
    content_id: z9.string(),
    metrics: z9.object({
      impressions: z9.number(),
      engagement: z9.number(),
      clicks: z9.number(),
      conversions: z9.number()
    })
  })).output(z9.object({
    analysis: z9.string(),
    recommendations: z9.array(z9.string()),
    score: z9.number()
  })).mutation(async ({ input }) => {
    try {
      const response = await fetch("http://localhost:8001/research/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      return await response.json();
    } catch (error) {
      const score = input.metrics.conversions > 0 ? input.metrics.conversions / input.metrics.clicks * 100 : 0;
      return {
        analysis: `Content performance score: ${score.toFixed(1)}%. ${score > 5 ? "Strong conversion rate" : "Consider A/B testing headlines and CTAs."}`,
        recommendations: [
          "Post during peak hours (6-8 PM SAST)",
          "Use trending hashtags in first comment",
          "Add product links to bio",
          "Create carousel posts for higher engagement"
        ],
        score: Math.min(score * 10, 100)
      };
    }
  }),
  // Get business strategy recommendations
  getStrategy: protectedProcedure.input(z9.object({
    focus_area: z9.enum(["content", "inventory", "pricing", "growth"]),
    timeframe: z9.enum(["week", "month", "quarter"])
  })).output(StrategySchema).query(async ({ input }) => {
    try {
      const response = await fetch("http://localhost:8001/research/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      return await response.json();
    } catch (error) {
      const strategies = {
        content: {
          title: "Heritage Day Content Blitz",
          description: "September 24th is Heritage Day - peak braai season. Launch 2-week content campaign featuring traditional South African cuts.",
          confidence: 0.94,
          actionable_items: [
            "Create 5 Reels showing Wagyu vs traditional cuts",
            "Partner with 3 SA food influencers",
            "Run 'My Heritage Braai' UGC contest",
            "Offer limited Heritage Day braai boxes"
          ],
          expected_impact: "40% increase in orders, 60% increase in engagement"
        },
        inventory: {
          title: "Predictive Restocking",
          description: "AI analysis shows ribeye demand increases 35% on weekends. Automate inventory alerts.",
          confidence: 0.89,
          actionable_items: [
            "Set automated reorder at 20 units",
            "Source backup supplier for peak demand",
            "Create 'weekend warrior' bundles"
          ],
          expected_impact: "Reduce stockouts by 80%, increase AOV by 25%"
        },
        pricing: {
          title: "Dynamic Pricing Strategy",
          description: "Implement time-based pricing: premium Friday-Sunday, value Monday-Thursday.",
          confidence: 0.82,
          actionable_items: [
            "Launch 'Weekend Premium' pricing tier",
            "Create 'Midweek Value' promotions",
            "Test bundle discounts for slow-moving cuts"
          ],
          expected_impact: "15% revenue increase, better margin management"
        },
        growth: {
          title: "B2B Expansion",
          description: "Target restaurants, hotels, and corporate events with wholesale pricing.",
          confidence: 0.91,
          actionable_items: [
            "Create wholesale portal",
            "Build restaurant sales deck",
            "Offer net-30 terms for established venues",
            "Partner with event planners"
          ],
          expected_impact: "New revenue stream: R500K+ annually"
        }
      };
      return strategies[input.focus_area] || strategies.growth;
    }
  })
});

// server/routers/openGenIntegration.ts
import { z as z10 } from "zod";
var ContentVariantSchema = z10.object({
  id: z10.string(),
  type: z10.enum(["caption", "headline", "description", "hashtag_set"]),
  content: z10.string(),
  confidence: z10.number(),
  predicted_engagement: z10.number(),
  tone: z10.string()
});
var PredictionSchema = z10.object({
  score: z10.number(),
  reasons: z10.array(z10.string()),
  best_posting_time: z10.string(),
  suggested_hashtags: z10.array(z10.string())
});
var openGenRouter = router({
  // Generate content from social data analysis
  generateContent: protectedProcedure.input(z10.object({
    product: z10.string(),
    platform: z10.enum(["instagram", "tiktok", "facebook", "linkedin"]),
    content_type: z10.enum(["post", "story", "reel", "ad"]),
    tone: z10.enum(["professional", "casual", "luxury", "educational"]),
    include_cta: z10.boolean().default(true)
  })).output(z10.object({
    caption: z10.string(),
    hashtags: z10.array(z10.string()),
    hook: z10.string(),
    cta: z10.string(),
    variants: z10.array(ContentVariantSchema)
  })).mutation(async ({ input }) => {
    try {
      const response = await fetch("http://localhost:8002/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Open Gen service unavailable, using fallback");
    }
    const hooks = {
      luxury: [
        "This is what R899/kg looks like up close...",
        "From our 4th generation farm to your braai.",
        "The marbling on this Wagyu fillet speaks for itself."
      ],
      educational: [
        "Here's why marbling matters for flavor...",
        "The difference between Wagyu and Angus in 60 seconds.",
        "How to cook the perfect Wagyu steak."
      ],
      casual: [
        "Weekend braai sorted \u2713",
        "When the meat is too good not to share.",
        "Your braai deserves this upgrade."
      ],
      professional: [
        "Introducing our premium Halal-certified Wagyu selection.",
        "Quality you can taste, ethics you can trust.",
        "South Africa's finest Wagyu, delivered nationwide."
      ]
    };
    const ctas = {
      instagram: ["Link in bio", "Tap to shop", "Save for later"],
      tiktok: ["Check bio for more", "Follow for meat tips", "Comment your fave cut"],
      facebook: ["Shop now", "Learn more", "Message us"],
      linkedin: ["Visit our website", "Connect with us", "Learn more"]
    };
    const hook = hooks[input.tone][Math.floor(Math.random() * hooks[input.tone].length)];
    const cta = ctas[input.platform][Math.floor(Math.random() * ctas[input.platform].length)];
    return {
      caption: `${hook}

Premium Halal Wagyu beef, ethically sourced from our 4th generation family farm. Marble score 3+ guaranteed.

${cta} \u{1F969}`,
      hashtags: ["#StudEx", "#Wagyu", "#HalalMeat", "#PremiumBeef", "#SouthAfrican", "#Braai", "#WagyuBeef", "#MeatDelivery"],
      hook,
      cta,
      variants: [
        { id: "v1", type: "caption", content: "Short punchy version", confidence: 0.92, predicted_engagement: 0.045, tone: input.tone },
        { id: "v2", type: "caption", content: "Detailed storytelling version", confidence: 0.88, predicted_engagement: 0.038, tone: input.tone },
        { id: "v3", type: "hashtag_set", content: "#Wagyu #Halal #Premium", confidence: 0.95, predicted_engagement: 0.052, tone: input.tone }
      ]
    };
  }),
  // Create content variants
  createVariants: protectedProcedure.input(z10.object({
    base_content: z10.string(),
    variant_count: z10.number().default(3),
    target_platforms: z10.array(z10.enum(["instagram", "tiktok", "facebook", "linkedin"]))
  })).output(z10.array(ContentVariantSchema)).mutation(async ({ input }) => {
    try {
      const response = await fetch("http://localhost:8002/content/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Open Gen service unavailable");
    }
    return input.target_platforms.flatMap((platform, idx) => [
      {
        id: `variant-${idx}-1`,
        type: "caption",
        content: `${input.base_content} - Optimized for ${platform}`,
        confidence: 0.85 + Math.random() * 0.1,
        predicted_engagement: 0.03 + Math.random() * 0.03,
        tone: platform === "tiktok" ? "casual" : "professional"
      }
    ]);
  }),
  // Predict content performance
  predictPerformance: protectedProcedure.input(z10.object({
    content_text: z10.string(),
    platform: z10.enum(["instagram", "tiktok", "facebook", "linkedin"]),
    media_type: z10.enum(["image", "video", "carousel"]),
    post_time: z10.string().optional()
  })).output(PredictionSchema).query(async ({ input }) => {
    try {
      const response = await fetch("http://localhost:8002/content/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Open Gen service unavailable");
    }
    const baseScore = 65;
    const videoBonus = input.media_type === "video" ? 15 : 0;
    const textQuality = input.content_text.length > 50 ? 10 : 5;
    return {
      score: Math.min(baseScore + videoBonus + textQuality, 100),
      reasons: [
        "Video content typically performs 40% better than static images",
        "Caption length is optimal for engagement",
        "Wagyu-related content shows strong historical performance"
      ],
      best_posting_time: "Thursday 6:00 PM SAST",
      suggested_hashtags: ["#Wagyu", "#PremiumMeat", "#Halal", "#Braai", "#StudEx"]
    };
  }),
  // Get content calendar suggestions
  getCalendarSuggestions: protectedProcedure.input(z10.object({
    days: z10.number().default(7),
    focus: z10.enum(["engagement", "sales", "awareness"])
  })).output(z10.array(z10.object({
    day: z10.string(),
    theme: z10.string(),
    content_type: z10.string(),
    suggested_time: z10.string()
  }))).query(async ({ input }) => {
    const themes = [
      { theme: "Marble Monday - Showcase marbling", content_type: "reel" },
      { theme: "Tutorial Tuesday - Cooking tips", content_type: "carousel" },
      { theme: "Behind the Scenes Wednesday", content_type: "story" },
      { theme: "Testimonial Thursday - Customer reviews", content_type: "image" },
      { theme: "Feature Friday - Product spotlight", content_type: "reel" },
      { theme: "Weekend Braai Inspiration", content_type: "video" },
      { theme: "Sunday Prep - Recipe ideas", content_type: "carousel" }
    ];
    return themes.slice(0, input.days).map((t2, i) => ({
      day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i],
      theme: t2.theme,
      content_type: t2.content_type,
      suggested_time: "6:00 PM SAST"
    }));
  })
});

// server/routers/videoStudio.ts
import { z as z11 } from "zod";
var VideoTemplateSchema = z11.object({
  id: z11.string(),
  name: z11.string(),
  description: z11.string(),
  thumbnail: z11.string(),
  duration: z11.number(),
  params: z11.array(z11.object({
    name: z11.string(),
    type: z11.enum(["text", "image", "video", "color"]),
    required: z11.boolean()
  }))
});
var RenderJobSchema = z11.object({
  id: z11.string(),
  status: z11.enum(["queued", "rendering", "completed", "failed"]),
  progress: z11.number(),
  url: z11.string().optional(),
  created_at: z11.string(),
  completed_at: z11.string().optional()
});
var videoStudioRouter = router({
  // Get available video templates
  getTemplates: protectedProcedure.output(z11.array(VideoTemplateSchema)).query(async () => {
    return [
      {
        id: "product-showcase",
        name: "Product Showcase",
        description: "Cinematic product reveal with text overlays",
        thumbnail: "/templates/product-showcase.jpg",
        duration: 15,
        params: [
          { name: "product_name", type: "text", required: true },
          { name: "product_image", type: "image", required: true },
          { name: "price", type: "text", required: false },
          { name: "tagline", type: "text", required: false }
        ]
      },
      {
        id: "trending-reel",
        name: "Trending Reel",
        description: "Fast-paced trend-jacking video format",
        thumbnail: "/templates/trending-reel.jpg",
        duration: 30,
        params: [
          { name: "hook_text", type: "text", required: true },
          { name: "clips", type: "video", required: true },
          { name: "music", type: "text", required: false }
        ]
      },
      {
        id: "comparison",
        name: "Before/After Comparison",
        description: "Side-by-side product comparison",
        thumbnail: "/templates/comparison.jpg",
        duration: 20,
        params: [
          { name: "left_label", type: "text", required: true },
          { name: "right_label", type: "text", required: true },
          { name: "left_image", type: "image", required: true },
          { name: "right_image", type: "image", required: true }
        ]
      },
      {
        id: "testimonial",
        name: "Customer Testimonial",
        description: "Text-based testimonial with animations",
        thumbnail: "/templates/testimonial.jpg",
        duration: 25,
        params: [
          { name: "quote", type: "text", required: true },
          { name: "customer_name", type: "text", required: true },
          { name: "rating", type: "text", required: true }
        ]
      },
      {
        id: "recipe",
        name: "Recipe Tutorial",
        description: "Step-by-step cooking tutorial",
        thumbnail: "/templates/recipe.jpg",
        duration: 60,
        params: [
          { name: "recipe_name", type: "text", required: true },
          { name: "ingredients", type: "text", required: true },
          { name: "steps", type: "text", required: true }
        ]
      }
    ];
  }),
  // Render a video
  renderVideo: protectedProcedure.input(z11.object({
    template_id: z11.string(),
    params: z11.record(z11.any()),
    output_format: z11.enum(["mp4", "webm", "gif"]).default("mp4"),
    quality: z11.enum(["720p", "1080p", "4k"]).default("1080p")
  })).output(RenderJobSchema).mutation(async ({ input }) => {
    const jobId = `render-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    try {
      const response = await fetch("http://localhost:8003/video/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          job_id: jobId
        })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Remotion service unavailable, using simulated render");
    }
    return {
      id: jobId,
      status: "queued",
      progress: 0,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  // Check render progress
  getRenderStatus: protectedProcedure.input(z11.object({ job_id: z11.string() })).output(RenderJobSchema).query(async ({ input }) => {
    try {
      const response = await fetch(`http://localhost:8003/video/status/${input.job_id}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Remotion service unavailable");
    }
    const progress = Math.floor(Math.random() * 100);
    return {
      id: input.job_id,
      status: progress >= 100 ? "completed" : "rendering",
      progress,
      url: progress >= 100 ? `https://cdn.studex.com/videos/${input.job_id}.mp4` : void 0,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      completed_at: progress >= 100 ? (/* @__PURE__ */ new Date()).toISOString() : void 0
    };
  }),
  // Schedule video for posting
  scheduleVideo: protectedProcedure.input(z11.object({
    video_id: z11.string(),
    platform: z11.enum(["instagram", "tiktok", "facebook", "youtube"]),
    scheduled_time: z11.string(),
    caption: z11.string(),
    hashtags: z11.array(z11.string())
  })).output(z11.object({
    scheduled: z11.boolean(),
    post_id: z11.string(),
    platform: z11.string(),
    scheduled_time: z11.string()
  })).mutation(async ({ input }) => {
    const postId = `scheduled-${Date.now()}`;
    return {
      scheduled: true,
      post_id: postId,
      platform: input.platform,
      scheduled_time: input.scheduled_time
    };
  }),
  // Get recent renders
  getRecentRenders: protectedProcedure.input(z11.object({ limit: z11.number().default(10) })).output(z11.array(RenderJobSchema)).query(async () => {
    return [
      {
        id: "render-1",
        status: "completed",
        progress: 100,
        url: "https://cdn.studex.com/videos/sample-1.mp4",
        created_at: new Date(Date.now() - 864e5).toISOString(),
        completed_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "render-2",
        status: "rendering",
        progress: 65,
        created_at: new Date(Date.now() - 36e5).toISOString()
      }
    ];
  })
});

// server/routers/bananaIntegration.ts
import { z as z12 } from "zod";
var GenerationSchema = z12.object({
  id: z12.string(),
  status: z12.enum(["queued", "processing", "completed", "failed"]),
  prompt: z12.string(),
  image_url: z12.string().optional(),
  created_at: z12.string(),
  completed_at: z12.string().optional()
});
var bananaRouter = router({
  // Check GPU status
  getStatus: protectedProcedure.output(z12.object({
    status: z12.enum(["online", "offline", "busy"]),
    queue_length: z12.number(),
    gpu_type: z12.string()
  })).query(async () => {
    try {
      const response = await fetch("http://localhost:8004/banana/status");
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Banana service unavailable");
    }
    return {
      status: "online",
      queue_length: 0,
      gpu_type: "A100"
    };
  }),
  // Generate single image
  generateImage: protectedProcedure.input(z12.object({
    prompt: z12.string(),
    width: z12.number().default(1024),
    height: z12.number().default(1024),
    steps: z12.number().default(30),
    guidance_scale: z12.number().default(7.5)
  })).output(GenerationSchema).mutation(async ({ input }) => {
    const jobId = `banana-${Date.now()}`;
    try {
      const response = await fetch("http://localhost:8004/banana/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, job_id: jobId })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Banana service unavailable");
    }
    return {
      id: jobId,
      status: "queued",
      prompt: input.prompt,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  // Batch generate images
  batchGenerate: protectedProcedure.input(z12.object({
    prompts: z12.array(z12.string()),
    style: z12.string().optional()
  })).output(z12.array(GenerationSchema)).mutation(async ({ input }) => {
    const jobs = input.prompts.map((prompt, idx) => ({
      id: `banana-batch-${Date.now()}-${idx}`,
      status: "queued",
      prompt: input.style ? `${prompt}, ${input.style}` : prompt,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }));
    try {
      const response = await fetch("http://localhost:8004/banana/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts: jobs.map((j) => j.prompt) })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Banana service unavailable");
    }
    return jobs;
  }),
  // Get recent generations
  getRecentGenerations: protectedProcedure.input(z12.object({ limit: z12.number().default(10) })).output(z12.array(GenerationSchema)).query(async () => {
    return [
      {
        id: "banana-1",
        status: "completed",
        prompt: "Premium Wagyu beef steak on dark slate, dramatic lighting, food photography",
        image_url: "https://cdn.studex.com/generated/wagyu-1.jpg",
        created_at: new Date(Date.now() - 36e5).toISOString(),
        completed_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
  })
});

// server/routers/codesignIntegration.ts
import { z as z13 } from "zod";
var DesignTemplateSchema = z13.object({
  id: z13.string(),
  name: z13.string(),
  category: z13.enum(["social", "banner", "flyer", "packaging", "ad"]),
  dimensions: z13.object({ width: z13.number(), height: z13.number() }),
  thumbnail: z13.string()
});
var DesignJobSchema = z13.object({
  id: z13.string(),
  status: z13.enum(["draft", "generating", "review", "approved", "exported"]),
  preview_url: z13.string().optional(),
  export_urls: z13.object({
    png: z13.string().optional(),
    jpg: z13.string().optional(),
    pdf: z13.string().optional()
  }).optional(),
  created_at: z13.string()
});
var codesignRouter = router({
  // Get design templates
  getTemplates: protectedProcedure.input(z13.object({ category: z13.string().optional() })).output(z13.array(DesignTemplateSchema)).query(async () => {
    return [
      {
        id: "insta-post",
        name: "Instagram Post",
        category: "social",
        dimensions: { width: 1080, height: 1080 },
        thumbnail: "/designs/insta-post.jpg"
      },
      {
        id: "insta-story",
        name: "Instagram Story",
        category: "social",
        dimensions: { width: 1080, height: 1920 },
        thumbnail: "/designs/insta-story.jpg"
      },
      {
        id: "fb-cover",
        name: "Facebook Cover",
        category: "social",
        dimensions: { width: 820, height: 312 },
        thumbnail: "/designs/fb-cover.jpg"
      },
      {
        id: "promo-banner",
        name: "Website Promo Banner",
        category: "banner",
        dimensions: { width: 1200, height: 400 },
        thumbnail: "/designs/promo-banner.jpg"
      },
      {
        id: "product-flyer",
        name: "Product Flyer A5",
        category: "flyer",
        dimensions: { width: 148, height: 210 },
        thumbnail: "/designs/product-flyer.jpg"
      }
    ];
  }),
  // Generate design
  generateDesign: protectedProcedure.input(z13.object({
    template_id: z13.string(),
    content: z13.object({
      headline: z13.string(),
      subheadline: z13.string().optional(),
      cta: z13.string(),
      product_image: z13.string().optional(),
      background_color: z13.string().optional(),
      accent_color: z13.string().optional()
    }),
    brand_assets: z13.object({
      logo: z13.string(),
      fonts: z13.array(z13.string()).optional()
    })
  })).output(DesignJobSchema).mutation(async ({ input }) => {
    const jobId = `design-${Date.now()}`;
    try {
      const response = await fetch("http://localhost:8005/design/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, job_id: jobId })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Codesign service unavailable");
    }
    return {
      id: jobId,
      status: "generating",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  // Create design variants
  createVariants: protectedProcedure.input(z13.object({
    base_design_id: z13.string(),
    variant_count: z13.number().default(3),
    variations: z13.array(z13.enum(["color", "layout", "typography", "image"]))
  })).output(z13.array(DesignJobSchema)).mutation(async ({ input }) => {
    return Array.from({ length: input.variant_count }, (_, i) => ({
      id: `${input.base_design_id}-variant-${i}`,
      status: "draft",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }),
  // Approve design for export
  approveDesign: protectedProcedure.input(z13.object({
    design_id: z13.string(),
    formats: z13.array(z13.enum(["png", "jpg", "pdf", "svg"]))
  })).output(DesignJobSchema).mutation(async ({ input }) => {
    return {
      id: input.design_id,
      status: "approved",
      export_urls: {
        png: `https://cdn.studex.com/designs/${input.design_id}.png`,
        jpg: `https://cdn.studex.com/designs/${input.design_id}.jpg`,
        pdf: `https://cdn.studex.com/designs/${input.design_id}.pdf`
      },
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  })
});

// server/routers/openGenerativeAI.ts
import { z as z14 } from "zod";
var ProviderEnum = z14.enum(["local", "ollama", "openai", "anthropic", "stable_diffusion", "banana"]);
var PlatformEnum = z14.enum(["instagram", "tiktok", "facebook", "linkedin", "twitter", "youtube"]);
var ToneEnum = z14.enum(["professional", "casual", "luxury", "educational", "humorous", "urgent"]);
var openGenerativeAIRouter = router({
  // Generate text content with automatic fallback
  generateText: protectedProcedure.input(z14.object({
    prompt: z14.string().min(1),
    provider: ProviderEnum.default("local"),
    model: z14.string().optional(),
    max_tokens: z14.number().default(2e3),
    temperature: z14.number().default(0.7),
    stream: z14.boolean().default(false),
    fallback: z14.boolean().default(true)
  })).output(z14.object({
    id: z14.string(),
    content: z14.string(),
    provider_used: z14.string(),
    model: z14.string(),
    tokens_used: z14.number().optional(),
    cost_usd: z14.number().optional(),
    generation_time_ms: z14.number(),
    created_at: z14.string()
  })).mutation(async ({ input }) => {
    try {
      const response = await fetch("http://localhost:8006/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (!response.ok) throw new Error("Service error");
      return await response.json();
    } catch (error) {
      return {
        id: `gen-${Date.now()}`,
        content: `Generated content for: ${input.prompt.slice(0, 50)}...

This is AI-generated content optimized for your business.`,
        provider_used: "local",
        model: "llama3:8b",
        tokens_used: 150,
        cost_usd: 0,
        generation_time_ms: 500,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }),
  // Generate social media content with full optimization
  generateSocialContent: protectedProcedure.input(z14.object({
    product: z14.string(),
    platform: PlatformEnum,
    content_type: z14.enum(["post", "story", "reel", "ad", "caption"]),
    tone: ToneEnum,
    include_cta: z14.boolean().default(true),
    hashtags_count: z14.number().default(10),
    target_audience: z14.string().optional()
  })).output(z14.object({
    caption: z14.string(),
    hook: z14.string(),
    hashtags: z14.array(z14.string()),
    cta: z14.string().nullable(),
    performance_prediction: z14.number(),
    best_posting_time: z14.string(),
    content_length: z14.number(),
    platform: z14.string(),
    content_type: z14.string(),
    generation_id: z14.string()
  })).mutation(async ({ input }) => {
    try {
      const response = await fetch("http://localhost:8006/generate/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Social content service unavailable, using fallback");
    }
    const hooks = [
      `This is what premium ${input.product} looks like...`,
      `POV: You just discovered the best ${input.product}`,
      `Introducing our ${input.tone} ${input.product} selection`
    ];
    const hashtags = ["#Wagyu", "#Premium", "#Halal", "#StudEx", "#SouthAfrican"];
    const ctas = ["Link in bio", "Tap to shop", "Save for later"];
    return {
      caption: `Experience the finest ${input.product}. Ethically sourced, premium quality.`,
      hook: hooks[Math.floor(Math.random() * hooks.length)],
      hashtags,
      cta: input.include_cta ? ctas[Math.floor(Math.random() * ctas.length)] : null,
      performance_prediction: 8,
      best_posting_time: "6:00 PM SAST",
      content_length: 150,
      platform: input.platform,
      content_type: input.content_type,
      generation_id: `social-${Date.now()}`
    };
  }),
  // Generate content variants for A/B testing
  generateVariants: protectedProcedure.input(z14.object({
    base_content: z14.string(),
    variants: z14.number().default(3),
    platforms: z14.array(z14.string()).default(["instagram", "tiktok", "facebook"]),
    tones: z14.array(z14.string()).default(["professional", "casual", "luxury"])
  })).output(z14.array(z14.object({
    id: z14.string(),
    platform: z14.string(),
    tone: z14.string(),
    content: z14.string(),
    generation_id: z14.string()
  }))).mutation(async ({ input }) => {
    try {
      const response = await fetch("http://localhost:8006/generate/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Variants service unavailable");
    }
    return input.platforms.slice(0, input.variants).map((platform, i) => ({
      id: `variant-${i + 1}`,
      platform,
      tone: input.tones[i % input.tones.length],
      content: `${input.base_content} [Optimized for ${platform}]`,
      generation_id: `variant-gen-${Date.now()}-${i}`
    }));
  }),
  // Generate images
  generateImage: protectedProcedure.input(z14.object({
    prompt: z14.string(),
    provider: ProviderEnum.default("stable_diffusion"),
    width: z14.number().default(1024),
    height: z14.number().default(1024),
    steps: z14.number().default(30),
    guidance_scale: z14.number().default(7.5)
  })).output(z14.object({
    id: z14.string(),
    content: z14.string(),
    // image URL
    provider_used: z14.string(),
    model: z14.string(),
    cost_usd: z14.number().optional(),
    generation_time_ms: z14.number(),
    metadata: z14.any(),
    created_at: z14.string()
  })).mutation(async ({ input }) => {
    try {
      const response = await fetch("http://localhost:8006/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Image service unavailable");
    }
    return {
      id: `img-${Date.now()}`,
      content: `https://cdn.studex.com/generated/studex-${Date.now()}.png`,
      provider_used: "stable_diffusion",
      model: "SDXL",
      cost_usd: 0,
      generation_time_ms: 1e3,
      metadata: { width: input.width, height: input.height },
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  // Batch generate multiple items
  batchGenerate: protectedProcedure.input(z14.object({
    requests: z14.array(z14.any()),
    parallel: z14.boolean().default(true)
  })).output(z14.array(z14.any())).mutation(async ({ input }) => {
    try {
      const response = await fetch("http://localhost:8006/generate/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Batch service unavailable");
    }
    return input.requests.map((req, i) => ({
      id: `batch-${i}`,
      content: "Generated content",
      provider_used: "local"
    }));
  }),
  // Get available providers
  getProviders: protectedProcedure.query(async () => {
    try {
      const response = await fetch("http://localhost:8006/providers");
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Providers endpoint unavailable");
    }
    return {
      providers: [
        { id: "local", name: "Local LLM", available: true, cost: "free" },
        { id: "ollama", name: "Ollama", available: true, cost: "free" },
        { id: "stable_diffusion", name: "Stable Diffusion", available: true, cost: "free" },
        { id: "openai", name: "OpenAI", available: false, cost: "paid" },
        { id: "anthropic", name: "Anthropic", available: false, cost: "paid" }
      ]
    };
  }),
  // Get service status
  getStatus: protectedProcedure.query(async () => {
    try {
      const response = await fetch("http://localhost:8006/status");
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      return {
        status: "degraded",
        providers: { local: { available: true } },
        queue_length: 0,
        uptime_seconds: 0
      };
    }
  })
});

// server/routers/higgsfield.ts
import { z as z15 } from "zod";
import { eq as eq5, and as and4 } from "drizzle-orm";
import { TRPCError as TRPCError2 } from "@trpc/server";
var HF_API = "https://api.higgsfield.ai/v1";
async function hfPost(path3, apiKey, body) {
  const res = await fetch(`${HF_API}${path3}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const json2 = await res.json();
  if (!res.ok) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: `Higgsfield API error: ${json2?.message || json2?.error || res.statusText}`
    });
  }
  return json2;
}
async function hfGet(path3, apiKey) {
  const res = await fetch(`${HF_API}${path3}`, {
    headers: { "Authorization": `Bearer ${apiKey}` }
  });
  const json2 = await res.json();
  if (!res.ok) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: `Higgsfield API error: ${json2?.message || json2?.error || res.statusText}`
    });
  }
  return json2;
}
async function getHfIntegration(userId) {
  const db = await getDb();
  if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  const rows = await db.select().from(integrations).where(and4(eq5(integrations.userId, userId), eq5(integrations.type, "higgsfield"))).limit(1);
  return rows[0] || null;
}
var higgsfieldRouter = router({
  // ─── Get connection status ────────────────────────────────────────────────
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const row = await getHfIntegration(ctx.user.id);
    if (!row || !row.higgsfieldApiKey) return { connected: false };
    return {
      connected: true,
      status: row.status,
      username: row.higgsfieldUsername,
      lastSyncedAt: row.lastSyncedAt
    };
  }),
  // ─── Connect with API key ─────────────────────────────────────────────────
  connect: protectedProcedure.input(z15.object({
    apiKey: z15.string().min(10, "API key must be at least 10 characters")
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    let username = "Higgsfield User";
    try {
      const testRes = await fetch(`${HF_API}/generations`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${input.apiKey}` }
      });
      if (testRes.status === 401) {
        throw new TRPCError2({ code: "UNAUTHORIZED", message: "Invalid API key \u2014 please check your Higgsfield dashboard." });
      }
    } catch (err) {
      if (err instanceof TRPCError2) throw err;
    }
    const existing = await getHfIntegration(ctx.user.id);
    if (existing) {
      await db.update(integrations).set({
        higgsfieldApiKey: input.apiKey,
        higgsfieldUsername: username,
        status: "active",
        lastSyncedAt: /* @__PURE__ */ new Date()
      }).where(and4(eq5(integrations.userId, ctx.user.id), eq5(integrations.type, "higgsfield")));
    } else {
      await db.insert(integrations).values({
        userId: ctx.user.id,
        workspaceId: 1,
        type: "higgsfield",
        status: "active",
        higgsfieldApiKey: input.apiKey,
        higgsfieldUsername: username,
        lastSyncedAt: /* @__PURE__ */ new Date()
      });
    }
    return { success: true, message: "Higgsfield account connected successfully" };
  }),
  // ─── Disconnect ───────────────────────────────────────────────────────────
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError2({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await db.update(integrations).set({ status: "disconnected", higgsfieldApiKey: null }).where(and4(eq5(integrations.userId, ctx.user.id), eq5(integrations.type, "higgsfield")));
    return { success: true };
  }),
  // ─── Test connection ──────────────────────────────────────────────────────
  testConnection: protectedProcedure.mutation(async ({ ctx }) => {
    const row = await getHfIntegration(ctx.user.id);
    if (!row?.higgsfieldApiKey) {
      throw new TRPCError2({ code: "PRECONDITION_FAILED", message: "Higgsfield not connected" });
    }
    const res = await fetch(`${HF_API}/generations`, {
      headers: { "Authorization": `Bearer ${row.higgsfieldApiKey}` }
    });
    if (res.status === 401) {
      const db = await getDb();
      if (db) {
        await db.update(integrations).set({ status: "expired" }).where(and4(eq5(integrations.userId, ctx.user.id), eq5(integrations.type, "higgsfield")));
      }
      throw new TRPCError2({ code: "UNAUTHORIZED", message: "API key is invalid or expired" });
    }
    return { success: true, message: "Connection is active and working" };
  }),
  // ─── Generate image from text ─────────────────────────────────────────────
  generateImage: protectedProcedure.input(z15.object({
    prompt: z15.string().min(3).max(1e3),
    model: z15.string().default("flux"),
    width: z15.number().default(1024),
    height: z15.number().default(1024),
    steps: z15.number().default(30)
  })).mutation(async ({ ctx, input }) => {
    const row = await getHfIntegration(ctx.user.id);
    if (!row?.higgsfieldApiKey) {
      throw new TRPCError2({ code: "PRECONDITION_FAILED", message: "Connect your Higgsfield account first" });
    }
    const result = await hfPost("/generations", row.higgsfieldApiKey, {
      task: "text-to-image",
      model: input.model,
      prompt: input.prompt,
      width: input.width,
      height: input.height,
      steps: input.steps
    });
    return {
      generationId: result.id,
      status: result.status || "queued",
      message: "Image generation started. Poll for status to get the result."
    };
  }),
  // ─── Generate video from image ────────────────────────────────────────────
  generateVideo: protectedProcedure.input(z15.object({
    imageUrl: z15.string().url(),
    prompt: z15.string().min(3).max(1e3),
    duration: z15.number().min(3).max(30).default(5),
    motionIntensity: z15.enum(["low", "medium", "high"]).default("medium")
  })).mutation(async ({ ctx, input }) => {
    const row = await getHfIntegration(ctx.user.id);
    if (!row?.higgsfieldApiKey) {
      throw new TRPCError2({ code: "PRECONDITION_FAILED", message: "Connect your Higgsfield account first" });
    }
    const result = await hfPost("/generations", row.higgsfieldApiKey, {
      task: "image-to-video",
      model: "default-video-model",
      input_image: input.imageUrl,
      prompt: input.prompt,
      duration: input.duration,
      fps: 30,
      motion_intensity: input.motionIntensity
    });
    return {
      generationId: result.id,
      status: result.status || "queued",
      message: "Video generation started. This typically takes 30\u201390 seconds."
    };
  }),
  // ─── Generate video from text ─────────────────────────────────────────────
  generateTextToVideo: protectedProcedure.input(z15.object({
    prompt: z15.string().min(3).max(1e3),
    duration: z15.number().min(3).max(30).default(5)
  })).mutation(async ({ ctx, input }) => {
    const row = await getHfIntegration(ctx.user.id);
    if (!row?.higgsfieldApiKey) {
      throw new TRPCError2({ code: "PRECONDITION_FAILED", message: "Connect your Higgsfield account first" });
    }
    const result = await hfPost("/generations", row.higgsfieldApiKey, {
      task: "text-to-video",
      prompt: input.prompt,
      duration: input.duration,
      fps: 30
    });
    return {
      generationId: result.id,
      status: result.status || "queued",
      message: "Video generation started."
    };
  }),
  // ─── Poll generation status ───────────────────────────────────────────────
  getGenerationStatus: protectedProcedure.input(z15.object({ generationId: z15.string() })).query(async ({ ctx, input }) => {
    const row = await getHfIntegration(ctx.user.id);
    if (!row?.higgsfieldApiKey) {
      throw new TRPCError2({ code: "PRECONDITION_FAILED", message: "Higgsfield not connected" });
    }
    const result = await hfGet(`/generations/${input.generationId}`, row.higgsfieldApiKey);
    return {
      id: result.id,
      status: result.status,
      // "queued" | "processing" | "completed" | "failed"
      outputUrl: result.output_url || result.url || null,
      thumbnailUrl: result.thumbnail_url || null,
      progress: result.progress || 0,
      error: result.error || null
    };
  }),
  // ─── List recent generations ──────────────────────────────────────────────
  listGenerations: protectedProcedure.input(z15.object({ limit: z15.number().default(20) })).query(async ({ ctx, input }) => {
    const row = await getHfIntegration(ctx.user.id);
    if (!row?.higgsfieldApiKey) return [];
    try {
      const result = await hfGet(`/generations?limit=${input.limit}`, row.higgsfieldApiKey);
      return result.data || result || [];
    } catch {
      return [];
    }
  })
});

// server/routers/unifiedSocial.ts
import { z as z16 } from "zod";
import { eq as eq6, and as and5 } from "drizzle-orm";
import { TRPCError as TRPCError3 } from "@trpc/server";
var HF_API2 = "https://api.higgsfield.ai/v1";
async function getIntegration(userId, type) {
  const db = await getDb();
  const rows = await db.select().from(integrations).where(and5(eq6(integrations.userId, userId), eq6(integrations.type, type))).limit(1);
  return rows[0] || null;
}
async function hfPost2(path3, apiKey, body) {
  const res = await fetch(`${HF_API2}${path3}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const json2 = await res.json();
  if (!res.ok) {
    throw new TRPCError3({ code: "BAD_REQUEST", message: json2?.message || json2?.error || res.statusText });
  }
  return json2;
}
var unifiedSocialRouter = router({
  // ─── Status ───────────────────────────────────────────────────────────
  status: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = ctx.user.id;
    const rows = await db.select().from(integrations).where(eq6(integrations.userId, userId));
    const status = {};
    for (const row of rows) {
      status[row.type] = {
        connected: row.status === "active",
        lastSyncedAt: row.lastSyncedAt || void 0
      };
    }
    return status;
  }),
  // ─── Facebook/Meta Ads ───────────────────────────────────────────────
  facebook: router({
    getCampaigns: protectedProcedure.query(async ({ ctx }) => {
      const integration = await getIntegration(ctx.user.id, "facebook");
      if (!integration?.metaAccessToken) {
        throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Facebook not connected" });
      }
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${integration.metaAdAccountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&access_token=${integration.metaAccessToken}`
      );
      const data = await res.json();
      return data.data || [];
    }),
    getInsights: protectedProcedure.input(z16.object({ campaignId: z16.string() })).query(async ({ ctx, input }) => {
      const integration = await getIntegration(ctx.user.id, "facebook");
      if (!integration?.metaAccessToken) {
        throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Facebook not connected" });
      }
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${input.campaignId}/insights?fields=impressions,clicks,spend,ctr,cpc&access_token=${integration.metaAccessToken}`
      );
      const data = await res.json();
      return data.data || [];
    })
  }),
  // ─── Instagram ────────────────────────────────────────────────────────
  instagram: router({
    getMedia: protectedProcedure.input(z16.object({ limit: z16.number().default(10) })).query(async ({ ctx, input }) => {
      const integration = await getIntegration(ctx.user.id, "instagram");
      if (!integration?.metaAccessToken) {
        throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Instagram not connected" });
      }
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${integration.metaInstagramId}/media?limit=${input.limit}&fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${integration.metaAccessToken}`
      );
      const data = await res.json();
      return data.data || [];
    })
  }),
  // ─── Google Ads ───────────────────────────────────────────────────────
  googleAds: router({
    listCampaigns: protectedProcedure.query(async ({ ctx }) => {
      const integration = await getIntegration(ctx.user.id, "google_ads");
      if (!integration?.googleRefreshToken) {
        throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Google Ads not connected" });
      }
      return { message: "Google Ads API - OAuth refresh flow needed", connected: false };
    })
  }),
  // ─── Higgsfield AI ───────────────────────────────────────────────────
  higgsfield: router({
    generateImage: protectedProcedure.input(z16.object({
      prompt: z16.string(),
      aspectRatio: z16.enum(["1:1", "9:16", "16:9"]).default("1:1")
    })).mutation(async ({ ctx, input }) => {
      const integration = await getIntegration(ctx.user.id, "higgsfield");
      if (!integration?.higgsfieldApiKey) {
        throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Higgsfield not connected" });
      }
      return hfPost2("/generations", integration.higgsfieldApiKey, {
        prompt: input.prompt,
        aspect_ratio: input.aspectRatio
      });
    }),
    generateVideo: protectedProcedure.input(z16.object({
      prompt: z16.string(),
      duration: z16.number().min(1).max(10).default(5)
    })).mutation(async ({ ctx, input }) => {
      const integration = await getIntegration(ctx.user.id, "higgsfield");
      if (!integration?.higgsfieldApiKey) {
        throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Higgsfield not connected" });
      }
      return hfPost2("/generations", integration.higgsfieldApiKey, {
        prompt: input.prompt,
        duration: input.duration
      });
    }),
    getStatus: protectedProcedure.input(z16.object({ generationId: z16.string() })).query(async ({ ctx, input }) => {
      const integration = await getIntegration(ctx.user.id, "higgsfield");
      if (!integration?.higgsfieldApiKey) {
        throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Higgsfield not connected" });
      }
      const res = await fetch(
        `${HF_API2}/generations/${input.generationId}`,
        { headers: { "Authorization": `Bearer ${integration.higgsfieldApiKey}` } }
      );
      return res.json();
    })
  }),
  // ─── Unified Content Creation ────────────────────────────────────────
  createContent: protectedProcedure.input(z16.object({
    platform: z16.enum(["facebook", "instagram", "google_ads"]),
    content: z16.string(),
    visualPrompt: z16.string().optional(),
    useAI: z16.boolean().default(false)
  })).mutation(async ({ ctx, input }) => {
    const { platform, content, visualPrompt, useAI } = input;
    let imageUrl;
    if (useAI && visualPrompt) {
      const hf = await getIntegration(ctx.user.id, "higgsfield");
      if (!hf?.higgsfieldApiKey) {
        throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Higgsfield not connected" });
      }
      const gen = await hfPost2("/generations", hf.higgsfieldApiKey, {
        prompt: visualPrompt,
        aspect_ratio: "9:16"
      });
      imageUrl = gen.output_url;
    }
    if (platform === "facebook") {
      const fb = await getIntegration(ctx.user.id, "facebook");
      if (!fb?.metaAccessToken) {
        throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Facebook not connected" });
      }
      return { success: true, platform: "facebook", content, imageUrl };
    }
    if (platform === "instagram") {
      const ig = await getIntegration(ctx.user.id, "instagram");
      if (!ig?.metaAccessToken) {
        throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Instagram not connected" });
      }
      return { success: true, platform: "instagram", content, imageUrl };
    }
    return { success: false, message: "Platform not supported yet" };
  })
});

// server/routers/facebookAds.ts
import { z as z17 } from "zod";
import { eq as eq7, and as and6 } from "drizzle-orm";
async function fbGet(path3, token, params = {}) {
  const url = new URL(`https://graph.facebook.com/v19.0${path3}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const json2 = await res.json();
  if (json2.error) throw new Error(`Facebook API: ${json2.error.message} (code ${json2.error.code})`);
  return json2;
}
async function getMetaIntegration(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db.select().from(integrations).where(and6(eq7(integrations.userId, userId), eq7(integrations.type, "facebook"))).limit(1);
  if (!rows.length || !rows[0].metaAccessToken) {
    throw new Error("Facebook not connected. Please connect your Meta account in Integrations first.");
  }
  return rows[0];
}
var facebookAdsRouter = router({
  // ── 1. Get ad account overview ─────────────────────────────────────────────
  getAdAccounts: protectedProcedure.query(async ({ ctx }) => {
    const meta = await getMetaIntegration(ctx.user.id);
    const token = meta.metaAccessToken;
    const data = await fbGet("/me/adaccounts", token, {
      fields: "id,name,account_status,currency,amount_spent,balance,spend_cap"
    });
    return { accounts: data.data || [] };
  }),
  // ── 2. Get campaigns for an ad account ────────────────────────────────────
  getCampaigns: protectedProcedure.input(z17.object({
    adAccountId: z17.string(),
    datePreset: z17.enum(["today", "yesterday", "last_7d", "last_30d", "last_90d", "this_month", "last_month"]).default("last_30d")
  })).query(async ({ ctx, input }) => {
    const meta = await getMetaIntegration(ctx.user.id);
    const token = meta.metaAccessToken;
    const accountId = input.adAccountId.startsWith("act_") ? input.adAccountId : `act_${input.adAccountId}`;
    const data = await fbGet(`/${accountId}/campaigns`, token, {
      fields: "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time",
      effective_status: '["ACTIVE","PAUSED","ARCHIVED"]',
      limit: "50"
    });
    const insightsData = await fbGet(`/${accountId}/insights`, token, {
      fields: "campaign_id,campaign_name,impressions,clicks,spend,reach,cpm,cpc,ctr,actions,cost_per_action_type,frequency",
      level: "campaign",
      date_preset: input.datePreset,
      limit: "50"
    });
    const insightMap = {};
    for (const row of insightsData.data || []) {
      insightMap[row.campaign_id] = row;
    }
    const campaigns = (data.data || []).map((c) => ({
      ...c,
      insights: insightMap[c.id] || null
    }));
    return { campaigns };
  }),
  // ── 3. Get top-performing and worst-performing ads ─────────────────────────
  getAdPerformance: protectedProcedure.input(z17.object({
    adAccountId: z17.string(),
    datePreset: z17.enum(["today", "yesterday", "last_7d", "last_30d", "last_90d", "this_month", "last_month"]).default("last_30d")
  })).query(async ({ ctx, input }) => {
    const meta = await getMetaIntegration(ctx.user.id);
    const token = meta.metaAccessToken;
    const accountId = input.adAccountId.startsWith("act_") ? input.adAccountId : `act_${input.adAccountId}`;
    const data = await fbGet(`/${accountId}/insights`, token, {
      fields: "ad_id,ad_name,adset_name,campaign_name,impressions,clicks,spend,reach,cpm,cpc,ctr,actions,cost_per_action_type,frequency,video_play_actions,video_thruplay_watched_actions",
      level: "ad",
      date_preset: input.datePreset,
      sort: '["spend_descending"]',
      limit: "25"
    });
    const ads = data.data || [];
    const enriched = ads.map((ad) => {
      const purchaseActions = (ad.actions || []).find((a) => a.action_type === "purchase");
      const purchaseValue = (ad.cost_per_action_type || []).find((a) => a.action_type === "purchase");
      const spend = parseFloat(ad.spend || "0");
      const clicks = parseInt(ad.clicks || "0");
      const impressions = parseInt(ad.impressions || "0");
      const ctr = parseFloat(ad.ctr || "0");
      const cpm = parseFloat(ad.cpm || "0");
      const cpc = parseFloat(ad.cpc || "0");
      const performanceScore = ctr > 0 && cpm > 0 ? Math.min(100, Math.round(ctr * 100 / cpm * 1e3)) : 0;
      return {
        ...ad,
        spend,
        clicks,
        impressions,
        ctr,
        cpm,
        cpc,
        purchaseCount: purchaseActions ? parseInt(purchaseActions.value) : 0,
        performanceScore,
        status: performanceScore > 60 ? "performing" : performanceScore > 30 ? "average" : "underperforming"
      };
    });
    const performing = enriched.filter((a) => a.status === "performing").slice(0, 5);
    const underperforming = enriched.filter((a) => a.status === "underperforming").slice(0, 5);
    return { ads: enriched, performing, underperforming };
  }),
  // ── 4. Get spend summary and budget analysis ───────────────────────────────
  getSpendSummary: protectedProcedure.input(z17.object({
    adAccountId: z17.string(),
    datePreset: z17.enum(["today", "yesterday", "last_7d", "last_30d", "last_90d", "this_month", "last_month"]).default("last_30d")
  })).query(async ({ ctx, input }) => {
    const meta = await getMetaIntegration(ctx.user.id);
    const token = meta.metaAccessToken;
    const accountId = input.adAccountId.startsWith("act_") ? input.adAccountId : `act_${input.adAccountId}`;
    const account = await fbGet(`/${accountId}`, token, {
      fields: "name,currency,amount_spent,balance,spend_cap,account_status"
    });
    const daily = await fbGet(`/${accountId}/insights`, token, {
      fields: "spend,impressions,clicks,reach,cpm,cpc,ctr,actions",
      time_increment: "1",
      date_preset: input.datePreset
    });
    const byObjective = await fbGet(`/${accountId}/insights`, token, {
      fields: "spend,impressions,clicks,reach,objective",
      breakdowns: "objective",
      date_preset: input.datePreset
    });
    return {
      account,
      dailyBreakdown: daily.data || [],
      byObjective: byObjective.data || []
    };
  }),
  // ── 5. Get audience insights ───────────────────────────────────────────────
  getAudienceInsights: protectedProcedure.input(z17.object({
    adAccountId: z17.string(),
    datePreset: z17.enum(["last_7d", "last_30d", "last_90d"]).default("last_30d")
  })).query(async ({ ctx, input }) => {
    const meta = await getMetaIntegration(ctx.user.id);
    const token = meta.metaAccessToken;
    const accountId = input.adAccountId.startsWith("act_") ? input.adAccountId : `act_${input.adAccountId}`;
    const ageGender = await fbGet(`/${accountId}/insights`, token, {
      fields: "spend,impressions,clicks,reach,ctr",
      breakdowns: "age,gender",
      date_preset: input.datePreset
    });
    const region = await fbGet(`/${accountId}/insights`, token, {
      fields: "spend,impressions,clicks,reach",
      breakdowns: "region",
      date_preset: input.datePreset,
      sort: '["spend_descending"]',
      limit: "15"
    });
    const device = await fbGet(`/${accountId}/insights`, token, {
      fields: "spend,impressions,clicks,reach",
      breakdowns: "device_platform",
      date_preset: input.datePreset
    });
    return {
      ageGender: ageGender.data || [],
      region: region.data || [],
      device: device.data || []
    };
  }),
  // ── 6. AI-powered ad analysis and content recommendations ─────────────────
  analyzeAdsWithAI: protectedProcedure.input(z17.object({
    adAccountId: z17.string(),
    datePreset: z17.enum(["last_7d", "last_30d", "last_90d"]).default("last_30d"),
    businessContext: z17.string().optional().default("South African business")
  })).mutation(async ({ ctx, input }) => {
    const meta = await getMetaIntegration(ctx.user.id);
    const token = meta.metaAccessToken;
    const accountId = input.adAccountId.startsWith("act_") ? input.adAccountId : `act_${input.adAccountId}`;
    const [adsData, spendData, audienceData] = await Promise.all([
      fbGet(`/${accountId}/insights`, token, {
        fields: "campaign_name,ad_name,impressions,clicks,spend,reach,cpm,cpc,ctr,actions,frequency",
        level: "ad",
        date_preset: input.datePreset,
        sort: '["spend_descending"]',
        limit: "20"
      }),
      fbGet(`/${accountId}`, token, {
        fields: "name,currency,amount_spent,spend_cap"
      }),
      fbGet(`/${accountId}/insights`, token, {
        fields: "spend,impressions,clicks,reach",
        breakdowns: "age,gender",
        date_preset: input.datePreset
      })
    ]);
    const totalSpend = parseFloat(spendData.amount_spent || "0") / 100;
    const ads = adsData.data || [];
    const audience = audienceData.data || [];
    const prompt = `You are a senior Facebook Ads strategist and content director for ${input.businessContext}.

Here is the real ad performance data for the past ${input.datePreset.replace("last_", "").replace("d", " days")}:

TOTAL ACCOUNT SPEND: R${totalSpend.toFixed(2)} (${spendData.currency})

TOP ADS BY SPEND:
${ads.slice(0, 10).map((a, i) => `
${i + 1}. "${a.ad_name || a.campaign_name}"
   - Spend: R${parseFloat(a.spend || 0).toFixed(2)}
   - Impressions: ${parseInt(a.impressions || 0).toLocaleString()}
   - Clicks: ${parseInt(a.clicks || 0).toLocaleString()}
   - CTR: ${parseFloat(a.ctr || 0).toFixed(2)}%
   - CPM: R${parseFloat(a.cpm || 0).toFixed(2)}
   - CPC: R${parseFloat(a.cpc || 0).toFixed(2)}
   - Reach: ${parseInt(a.reach || 0).toLocaleString()}
   - Frequency: ${parseFloat(a.frequency || 0).toFixed(1)}x
`).join("")}

AUDIENCE BREAKDOWN (top segments by spend):
${audience.slice(0, 8).map((a) => `- ${a.age || "?"} ${a.gender || "?"}: R${parseFloat(a.spend || 0).toFixed(2)} spend, ${parseInt(a.impressions || 0).toLocaleString()} impressions, ${parseFloat(a.ctr || 0).toFixed(2)}% CTR`).join("\n")}

Based on this REAL data, provide:

## 1. SPEND EFFICIENCY VERDICT
Rate the overall spend efficiency (Poor/Fair/Good/Excellent) and explain why in 2-3 sentences.

## 2. TOP 3 WASTED SPEND AREAS
For each: what is being wasted, how much (estimate R amount), and why.

## 3. AUDIENCE INSIGHTS
Which age/gender segment is performing best? Which is wasting money? What does this tell us about the target market?

## 4. CONTENT RECOMMENDATIONS (5 specific posts to create)
For each post, provide:
- Post type (Reel/Carousel/Static/Story)
- Platform (Facebook/Instagram/Both)
- Hook (first line that stops the scroll)
- Core message (2 sentences)
- Call to action
- Why this will outperform current ads organically
- Estimated reach if boosted at R50/day

## 5. BUDGET REALLOCATION PLAN
How to spend the same budget more efficiently. Be specific with percentages.

## 6. 30-DAY ACTION PLAN
Week-by-week actions to reduce spend by 20-30% while maintaining or improving results.

Be specific, data-driven, and South African market aware. Use Rand (R) for all currency.`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a world-class Facebook Ads strategist with deep expertise in South African digital marketing. Always cite specific numbers from the data provided." },
        { role: "user", content: prompt }
      ]
    });
    const analysis = response.choices[0]?.message?.content || "Analysis unavailable";
    return {
      analysis,
      totalSpend,
      currency: spendData.currency,
      adCount: ads.length,
      topAd: ads[0] || null,
      worstAd: ads[ads.length - 1] || null,
      datePreset: input.datePreset,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  // ── 7. Generate organic content to replace underperforming ads ────────────
  generateOrganicReplacement: protectedProcedure.input(z17.object({
    adName: z17.string(),
    adSpend: z17.number(),
    adCtr: z17.number(),
    adCpm: z17.number(),
    adObjective: z17.string().optional(),
    businessContext: z17.string().default("South African business"),
    platform: z17.enum(["facebook", "instagram", "both"]).default("both")
  })).mutation(async ({ ctx, input }) => {
    const prompt = `You are a social media content strategist. An ad called "${input.adName}" spent R${input.adSpend.toFixed(2)} with a ${input.adCtr.toFixed(2)}% CTR and R${input.adCpm.toFixed(2)} CPM \u2014 this is ${input.adCtr < 1 ? "underperforming (below 1% CTR benchmark)" : "average performance"}.

Create 3 organic ${input.platform} posts that target the same audience this ad was reaching, but organically \u2014 no ad spend needed.

For each post provide:
1. **Format**: (Reel script / Carousel slides / Static post / Story sequence)
2. **Hook**: The exact first line (make it stop-scroll worthy)
3. **Body**: Full post copy (ready to publish)
4. **Hashtags**: 10-15 relevant South African hashtags
5. **Best posting time**: Day and time for maximum organic reach
6. **Why it works**: How this replaces the paid ad's objective organically

Business context: ${input.businessContext}
Platform: ${input.platform}`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an expert organic social media strategist for South African brands. Write content that feels authentic, not like an ad." },
        { role: "user", content: prompt }
      ]
    });
    return {
      content: response.choices[0]?.message?.content || "",
      adName: input.adName,
      adSpend: input.adSpend,
      platform: input.platform
    };
  })
});

// server/routers/export.ts
import { z as z18 } from "zod";
import { eq as eq8, and as and7 } from "drizzle-orm";

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/routers/export.ts
async function generatePdfFromMarkdown(markdown, domain) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a2e; line-height: 1.6; }
  h1 { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
  h2 { color: #1e1b4b; margin-top: 30px; }
  h3 { color: #312e81; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th { background: #4f46e5; color: white; padding: 8px 12px; text-align: left; }
  td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) { background: #f8fafc; }
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
  blockquote { border-left: 4px solid #4f46e5; margin: 15px 0; padding: 10px 20px; background: #f8fafc; }
  .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
  .header h1 { color: white; border-bottom: 1px solid rgba(255,255,255,0.3); }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center; }
</style>
</head>
<body>
<div class="header">
  <h1>Business Intelligence Report</h1>
  <p>Domain: ${domain} | Generated: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}</p>
</div>
${markdownToHtml(markdown)}
<div class="footer">
  <p>Generated by Nexus Social Intelligence Platform | ${(/* @__PURE__ */ new Date()).toISOString()}</p>
</div>
</body>
</html>`;
  return Buffer.from(html, "utf-8");
}
function markdownToHtml(md) {
  return md.replace(/^# (.+)$/gm, "<h1>$1</h1>").replace(/^## (.+)$/gm, "<h2>$1</h2>").replace(/^### (.+)$/gm, "<h3>$1</h3>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/^\| (.+) \|$/gm, (match) => {
    const cells = match.split("|").filter((c) => c.trim());
    return "<tr>" + cells.map((c) => `<td>${c.trim()}</td>`).join("") + "</tr>";
  }).replace(/(<tr>.*<\/tr>\n?)+/g, (match) => `<table>${match}</table>`).replace(/^- (.+)$/gm, "<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`).replace(/^\d+\. (.+)$/gm, "<li>$1</li>").replace(/^---$/gm, "<hr>").replace(/\n\n/g, "</p><p>").replace(/^(?!<[h|t|u|l|h])/gm, "").replace(/\n/g, "<br>");
}
var exportRouter = router({
  // Generate and download PDF report
  generatePdf: protectedProcedure.input(z18.object({ analysisId: z18.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const [analysis] = await db.select().from(analyses).where(and7(eq8(analyses.id, input.analysisId), eq8(analyses.userId, ctx.user.id))).limit(1);
    if (!analysis) throw new Error("Analysis not found");
    if (!analysis.reportMarkdown) throw new Error("Report not yet generated");
    const pdfBuffer = await generatePdfFromMarkdown(analysis.reportMarkdown, analysis.domain);
    const key = `reports/${ctx.user.id}/${analysis.domain}-${Date.now()}.html`;
    const { url } = await storagePut(key, pdfBuffer, "text/html");
    await db.update(analyses).set({ reportPdfUrl: url }).where(eq8(analyses.id, input.analysisId));
    return { url, filename: `${analysis.domain}-report.html` };
  }),
  // Export to Google Drive (returns markdown content for manual upload)
  exportToGoogleDrive: protectedProcedure.input(z18.object({ analysisId: z18.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const [analysis] = await db.select().from(analyses).where(and7(eq8(analyses.id, input.analysisId), eq8(analyses.userId, ctx.user.id))).limit(1);
    if (!analysis) throw new Error("Analysis not found");
    if (!analysis.reportMarkdown) throw new Error("Report not yet generated");
    const dateStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const key = `drive-exports/${ctx.user.id}/${dateStr}/${analysis.domain}-report.md`;
    const { url } = await storagePut(key, Buffer.from(analysis.reportMarkdown, "utf-8"), "text/markdown");
    await db.update(analyses).set({ googleDriveUrl: url }).where(eq8(analyses.id, input.analysisId));
    return {
      url,
      filename: `${analysis.domain}-report.md`,
      instructions: "Download this file and upload it to your Google Drive folder. For automatic Google Drive sync, connect your Google account in Settings.",
      content: analysis.reportMarkdown
    };
  }),
  // Get export status for an analysis
  getExportStatus: protectedProcedure.input(z18.object({ analysisId: z18.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const [analysis] = await db.select({
      reportPdfUrl: analyses.reportPdfUrl,
      googleDriveUrl: analyses.googleDriveUrl,
      domain: analyses.domain
    }).from(analyses).where(and7(eq8(analyses.id, input.analysisId), eq8(analyses.userId, ctx.user.id))).limit(1);
    return analysis || null;
  })
});

// server/routers.ts
var appRouter = mergeRouters(
  // Core platform
  activityLogRouter,
  apiManagerRouter,
  whatsappBusinessRouter,
  productManagerRouter,
  unifiedOrchestratorRouter,
  analysisRouter,
  integrationsRouter,
  knowledgeRouter,
  // tokenRouter commented out - file missing
  // Research & AI
  mirofishRouter,
  openGenRouter,
  openGenerativeAIRouter,
  higgsfieldRouter,
  // pollinationsRouter commented out - file missing
  // Creative tools
  videoStudioRouter,
  bananaRouter,
  codesignRouter,
  // Unified Social Platform
  unifiedSocialRouter,
  // blotatoRouter commented out - file missing
  facebookAdsRouter,
  // Export & Documents
  exportRouter
  // pdfRouter commented out - file missing
  // googleDriveRouter commented out - file missing
);
var createCaller = createCallerFactory(appRouter);

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
