import { describe, expect, it, vi } from "vitest";
import {
  createThought,
  deleteThought,
  getThoughts,
  updateThought,
} from "./thoughtsApi";

const validThought = {
  ownerId: "user-alex",
  sessionId: "session-123",
  id: "thought-123",
  text: "E-Mail später schreiben",
  createdAt: new Date().toISOString(),
  presetId: "pomodoro",
  presetLabel: "Pomodoro",
  isDone: false,
};

const getToken = async () => "test-token";

describe("thoughtsApi", () => {
  it("loads thoughts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ thoughts: [validThought] }), {
          status: 200,
        }),
      ),
    );

    const thoughts = await getThoughts(getToken);

    expect(thoughts).toEqual([validThought]);
  });

  it("creates a thought", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ thought: validThought }), {
          status: 201,
        }),
      ),
    );

    const thought = await createThought(
      {
        sessionId: "session-123",
        text: validThought.text,
        presetId: "pomodoro",
        presetLabel: "Pomodoro",
      },
      getToken,
    );

    expect(thought).toEqual(validThought);
  });

  it("updates a thought", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            thought: { ...validThought, isDone: true },
          }),
          { status: 200 },
        ),
      ),
    );

    const thought = await updateThought("thought-123", true, getToken);

    expect(thought.isDone).toBe(true);
  });

  it("deletes a thought", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );

    await expect(
      deleteThought("thought-123", getToken),
    ).resolves.toBeUndefined();
  });
});
