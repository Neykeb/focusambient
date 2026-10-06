import rateLimit from "express-rate-limit";
import { clerkMiddleware, getAuth } from "@clerk/express";
import cors from "cors";
import express, { type Request } from "express";
import { createSessionHandlers } from "./sessionHandlers.js";
import { MongoSessionStore, type SessionStore } from "./sessionStore.js";
import { createThoughtHandlers } from "./thoughtHandlers.js";
import { MongoThoughtStore, type ThoughtStore } from "./thoughtStore.js";

type AppOptions = {
  store?: SessionStore;
  getUserId?: (request: Request) => string | null;
  useClerkMiddleware?: boolean;
  thoughtStore?: ThoughtStore;
};

export function createApp(options: AppOptions = {}) {
  const app = express();
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "Too many requests. Please try again later.",
    },
  });
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
  const store = options.store ?? new MongoSessionStore();
  const getUserId = options.getUserId ?? getClerkUserId;
  const sessions = createSessionHandlers(store, getUserId);
  const publishableKey =
    process.env.CLERK_PUBLISHABLE_KEY ?? process.env.VITE_CLERK_PUBLISHABLE_KEY;
  const thoughtStore = options.thoughtStore ?? new MongoThoughtStore();
  const thoughts = createThoughtHandlers(thoughtStore, getUserId);

  app.use(cors({ origin: frontendUrl }));
  app.get("/", (_request, response) => {
    response.json({
      name: "FocusAmbient API",
      status: "ok",
      health: "/api/health",
    });
  });
  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });
  app.get(
    "/.well-known/appspecific/com.chrome.devtools.json",
    (_request, response) => {
      response.status(204).end();
    },
  );

  if (options.useClerkMiddleware !== false) {
    app.use(clerkMiddleware({ publishableKey }));
  }
  app.use(express.json({ limit: "100kb" }));

  app.use("/api", apiLimiter);
  app.get("/api/sessions", sessions.get);
  app.post("/api/sessions", sessions.create);
  app.delete("/api/sessions", sessions.clear);
  app.post("/api/sessions/import", sessions.import);
  app.get("/api/thoughts", thoughts.get);
  app.post("/api/thoughts", thoughts.create);
  app.patch("/api/thoughts/:id", thoughts.update);
  app.delete("/api/thoughts/:id", thoughts.remove);

  return app;
}

function getClerkUserId(request: Request) {
  const auth = getAuth(request);
  return auth.isAuthenticated ? auth.userId : null;
}
