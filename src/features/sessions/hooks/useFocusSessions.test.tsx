import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getFocusSessionsStorageKey,
  useFocusSessions,
} from "./useFocusSessions";

const ownerId = "user_history_test";
const getToken = vi.fn(async () => "test-token");
const sessionInput = {
  presetId: "pomodoro",
  label: "Pomodoro",
  durationSeconds: 1_500,
};
const storedSession = {
  ...sessionInput,
  id: "session-one",
  completedAt: "2026-07-16T14:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("useFocusSessions", () => {
  beforeEach(() => {
    window.localStorage.clear();
    getToken.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ sessions: [] })),
    );
  });

  it("loads the signed-in user history from the API", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ sessions: [storedSession] }),
    );
    const { result } = renderHook(() => useFocusSessions(ownerId, getToken));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.sessions).toEqual([storedSession]);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/sessions$/),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  it("loads local history without calling the API when no user token exists", async () => {
    const localGetToken = vi.fn(async () => null);
    window.localStorage.setItem(
      getFocusSessionsStorageKey("local-preview"),
      JSON.stringify([storedSession]),
    );

    const { result } = renderHook(() =>
      useFocusSessions("local-preview", localGetToken),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.sessions).toEqual([storedSession]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("records a completed session after the server confirms it", async () => {
    const { result } = renderHook(() => useFocusSessions(ownerId, getToken));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ session: storedSession }, 201),
    );

    await act(() => result.current.recordSession(sessionInput));

    expect(result.current.sessions).toEqual([storedSession]);
  });

  it("keeps a session out of the list when saving fails", async () => {
    const { result } = renderHook(() => useFocusSessions(ownerId, getToken));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ error: "failed" }, 500),
    );

    await act(() => result.current.recordSession(sessionInput));

    expect(result.current.sessions).toEqual([]);
    expect(result.current.error).toBe(
      "The completed session could not be saved.",
    );
  });

  it("imports valid local sessions once and removes them after success", async () => {
    const storageKey = getFocusSessionsStorageKey(ownerId);
    window.localStorage.setItem(storageKey, JSON.stringify([storedSession]));
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ sessions: [storedSession] }))
      .mockResolvedValueOnce(jsonResponse({ sessions: [storedSession] }));

    const { result } = renderHook(() => useFocusSessions(ownerId, getToken));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/\/api\/sessions\/import$/),
      expect.objectContaining({ method: "POST" }),
    );
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("keeps local sessions when importing fails", async () => {
    const storageKey = getFocusSessionsStorageKey(ownerId);
    window.localStorage.setItem(storageKey, JSON.stringify([storedSession]));
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ error: "failed" }, 500),
    );

    const { result } = renderHook(() => useFocusSessions(ownerId, getToken));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(window.localStorage.getItem(storageKey)).not.toBeNull();
    expect(result.current.error).not.toBeNull();
  });

  it("clears the complete server history", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ sessions: [storedSession] }),
    );
    const { result } = renderHook(() => useFocusSessions(ownerId, getToken));
    await waitFor(() => expect(result.current.sessions).toHaveLength(1));
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ sessions: [] }));

    await act(() => result.current.clearSessions());

    expect(result.current.sessions).toEqual([]);
  });
});
