// @vitest-environment node

import { describe, expect, it } from "vitest";
import { ThoughtModel } from "./ThoughtModel.js";

const validThought = {
  ownerId: "user-123",
  sessionId: "session-123",
  id: "thought-123",
  text: "E-Mail später schreiben",
  presetId: "pomodoro",
  presetLabel: "Pomodoro",
  createdAt: new Date().toISOString(),
};

describe("ThoughtModel", () => {
  it("accepts a valid thought", async () => {
    const thought = new ThoughtModel(validThought);

    await expect(thought.validate()).resolves.toBeUndefined();
  });

  it("sets isDone to false by default", () => {
    const thought = new ThoughtModel(validThought);

    expect(thought.isDone).toBe(false);
  });

  it("requires ownerId and sessionId", async () => {
    const thought = new ThoughtModel({
      ...validThought,
      ownerId: undefined,
      sessionId: undefined,
    });

    await expect(thought.validate()).rejects.toThrow();
  });

  it("rejects text longer than 160 characters", async () => {
    const thought = new ThoughtModel({
      ...validThought,
      text: "a".repeat(161),
    });

    await expect(thought.validate()).rejects.toThrow();
  });
});
