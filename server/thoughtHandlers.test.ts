// @vitest-environment node

import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createThoughtHandlers } from "./thoughtHandlers.js";
import type { ThoughtStore } from "./thoughtStore.js";

const validThought = {
  sessionId: "session-123",
  text: "E-Mail später schreiben",
  presetId: "pomodoro",
  presetLabel: "Pomodoro",
};

describe("thought handlers", () => {
  let store: ThoughtStore;
  let thoughts: Array<Record<string, unknown>>;

  beforeEach(() => {
    thoughts = [];

    store = {
      getAll: async (ownerId) =>
        thoughts.filter((thought) => thought.ownerId === ownerId) as never,

      add: async (ownerId, thought) => {
        const savedThought = {
          ...thought,
          ownerId,
        };

        thoughts.push(savedThought);
        return savedThought as never;
      },

      updateDone: async (ownerId, id, isDone) => {
        const thought = thoughts.find(
          (item) => item.ownerId === ownerId && item.id === id,
        );

        if (!thought) return null;

        thought.isDone = isDone;
        return thought as never;
      },

      remove: async (ownerId, id) => {
        const index = thoughts.findIndex(
          (thought) => thought.ownerId === ownerId && thought.id === id,
        );

        if (index === -1) return false;

        thoughts.splice(index, 1);
        return true;
      },
    };
  });

  function setup(
    userId: string | null,
    body: unknown = {},
    params: Record<string, string> = {},
  ) {
    const handlers = createThoughtHandlers(store, () => userId);
    const request = { body, params } as unknown as Request;
    const result = { status: 200, body: undefined as unknown };

    const response = {
      status: vi.fn((status: number) => {
        result.status = status;
        return response;
      }),
      json: vi.fn((value: unknown) => {
        result.body = value;
        return response;
      }),
      send: vi.fn(() => response),
    } as unknown as Response;

    return { handlers, request, response, result };
  }

  it("rejects unauthenticated requests", async () => {
    const test = setup(null);

    await test.handlers.get(test.request, test.response);

    expect(test.result.status).toBe(401);
  });

  it("creates and loads a thought for its owner", async () => {
    const creation = setup("user-alex", validThought);

    await creation.handlers.create(creation.request, creation.response);

    const loading = setup("user-alex");
    await loading.handlers.get(loading.request, loading.response);

    expect(creation.result.status).toBe(201);
    expect(loading.result.body).toMatchObject({
      thoughts: [
        {
          ownerId: "user-alex",
          text: validThought.text,
          isDone: false,
        },
      ],
    });
  });

  it("rejects invalid thought data", async () => {
    const test = setup("user-alex", {
      ...validThought,
      text: "",
    });

    await test.handlers.create(test.request, test.response);

    expect(test.result.status).toBe(400);
  });

  it("updates only the owner thought", async () => {
    const creation = setup("user-alex", validThought);

    await creation.handlers.create(creation.request, creation.response);

    const savedThought = thoughts[0];
    const update = setup(
      "user-alex",
      { isDone: true },
      { id: String(savedThought.id) },
    );

    await update.handlers.update(update.request, update.response);

    expect(update.result.status).toBe(200);
    expect(update.result.body).toMatchObject({
      thought: { isDone: true },
    });
  });

  it("does not update another users thought", async () => {
    const creation = setup("user-alex", validThought);

    await creation.handlers.create(creation.request, creation.response);

    const savedThought = thoughts[0];
    const update = setup(
      "user-sam",
      { isDone: true },
      { id: String(savedThought.id) },
    );

    await update.handlers.update(update.request, update.response);

    expect(update.result.status).toBe(404);
  });

  it("deletes an owners thought", async () => {
    const creation = setup("user-alex", validThought);

    await creation.handlers.create(creation.request, creation.response);

    const savedThought = thoughts[0];
    const deletion = setup("user-alex", {}, { id: String(savedThought.id) });

    await deletion.handlers.remove(deletion.request, deletion.response);

    expect(deletion.result.status).toBe(204);
    expect(thoughts).toHaveLength(0);
  });
});
