import type { Request, Response } from "express";
import { z } from "zod";
import type { ThoughtStore } from "./thoughtStore.js";

const newThoughtSchema = z.object({
  sessionId: z.string().min(1),
  text: z.string().trim().min(1).max(160),
  presetId: z.string().min(1),
  presetLabel: z.string().trim().min(1).max(32),
});

const updateThoughtSchema = z.object({
  isDone: z.boolean(),
});

type GetUserId = (request: Request) => string | null;

export function createThoughtHandlers(
  store: ThoughtStore,
  getUserId: GetUserId,
) {
  return {
    get: async (request: Request, response: Response) => {
      const userId = getUserId(request);

      if (!userId) {
        return response.status(401).json({ error: "Unauthorized" });
      }

      try {
        const thoughts = await store.getAll(userId);
        return response.json({ thoughts });
      } catch {
        return response.status(500).json({
          error: "Thoughts could not be loaded.",
        });
      }
    },

    create: async (request: Request, response: Response) => {
      const userId = getUserId(request);

      if (!userId) {
        return response.status(401).json({ error: "Unauthorized" });
      }

      const result = newThoughtSchema.safeParse(request.body);

      if (!result.success) {
        return response.status(400).json({
          error: "Invalid thought data.",
        });
      }

      const thought = {
        ...result.data,
        id: crypto.randomUUID(),
        isDone: false,
        createdAt: new Date().toISOString(),
      };

      try {
        const savedThought = await store.add(userId, thought);

        return response.status(201).json({
          thought: savedThought,
        });
      } catch {
        return response.status(500).json({
          error: "Thought could not be saved.",
        });
      }
    },

    update: async (request: Request, response: Response) => {
      const userId = getUserId(request);

      if (!userId) {
        return response.status(401).json({ error: "Unauthorized" });
      }

      const idResult = z.string().min(1).safeParse(request.params.id);
      const bodyResult = updateThoughtSchema.safeParse(request.body);

      if (!idResult.success || !bodyResult.success) {
        return response.status(400).json({
          error: "Invalid thought data.",
        });
      }

      try {
        const thought = await store.updateDone(
          userId,
          idResult.data,
          bodyResult.data.isDone,
        );

        if (!thought) {
          return response.status(404).json({
            error: "Thought not found.",
          });
        }

        return response.json({ thought });
      } catch {
        return response.status(500).json({
          error: "Thought could not be updated.",
        });
      }
    },

    remove: async (request: Request, response: Response) => {
      const userId = getUserId(request);

      if (!userId) {
        return response.status(401).json({ error: "Unauthorized" });
      }

      const idResult = z.string().min(1).safeParse(request.params.id);

      if (!idResult.success) {
        return response.status(400).json({
          error: "Invalid thought id.",
        });
      }

      try {
        const removed = await store.remove(userId, idResult.data);

        if (!removed) {
          return response.status(404).json({
            error: "Thought not found.",
          });
        }

        return response.status(204).send();
      } catch {
        return response.status(500).json({
          error: "Thought could not be deleted.",
        });
      }
    },
  };
}
