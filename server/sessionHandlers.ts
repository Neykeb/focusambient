import type { Request, Response } from "express";
import { z } from "zod";
import {
  focusSessionSchema,
  newFocusSessionSchema,
} from "../src/features/sessions/model/focusSessionSchema.js";
import type { SessionStore } from "./sessionStore.js";

const importSchema = z.object({
  sessions: z.array(focusSessionSchema).max(100),
});

type GetUserId = (request: Request) => string | null;

export function createSessionHandlers(
  store: SessionStore,
  getUserId: GetUserId,
) {
  return {
    get: async (request: Request, response: Response) => {
      const userId = getUserId(request);
      if (!userId) return response.status(401).json({ error: "Unauthorized" });

      try {
        return response.json({ sessions: await store.getAll(userId) });
      } catch {
        return response
          .status(500)
          .json({ error: "Sessions could not be loaded." });
      }
    },

    create: async (request: Request, response: Response) => {
      const userId = getUserId(request);
      if (!userId) return response.status(401).json({ error: "Unauthorized" });

      const result = newFocusSessionSchema.safeParse(request.body);
      if (!result.success)
        return response.status(400).json({ error: "Invalid session data." });

      const session = {
        ...result.data,
        id: result.data.id ?? crypto.randomUUID(),
        completedAt: new Date().toISOString(),
      };

      try {
        await store.add(userId, session);
        return response.status(201).json({ session });
      } catch {
        return response
          .status(500)
          .json({ error: "Session could not be saved." });
      }
    },

    clear: async (request: Request, response: Response) => {
      const userId = getUserId(request);
      if (!userId) return response.status(401).json({ error: "Unauthorized" });

      try {
        await store.clear(userId);
        return response.json({ sessions: [] });
      } catch {
        return response
          .status(500)
          .json({ error: "Sessions could not be deleted." });
      }
    },

    import: async (request: Request, response: Response) => {
      const userId = getUserId(request);
      if (!userId) return response.status(401).json({ error: "Unauthorized" });

      const result = importSchema.safeParse(request.body);
      if (!result.success)
        return response.status(400).json({ error: "Invalid session data." });

      try {
        const sessions = await store.import(userId, result.data.sessions);
        return response.json({ sessions });
      } catch {
        return response
          .status(500)
          .json({ error: "Sessions could not be imported." });
      }
    },
  };
}
