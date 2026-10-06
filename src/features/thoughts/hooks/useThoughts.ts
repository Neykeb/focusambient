import { useEffect, useState } from "react";
import {
  createThought,
  deleteThought,
  getThoughts,
  updateThought,
  type GetToken,
} from "../api/thoughtsApi";
import {
  storedThoughtsSchema,
  thoughtTextSchema,
  type NewThought,
  type Thought,
} from "../model/thoughtSchema";

export const THOUGHTS_STORAGE_KEY = "focusambient.thoughts.v1";
const MAX_STORED_THOUGHTS = 100;

export function getThoughtsStorageKey(storageOwnerId: string) {
  return `${THOUGHTS_STORAGE_KEY}.${encodeURIComponent(storageOwnerId)}`;
}

function loadThoughts(storageKey: string): Thought[] {
  try {
    const storedValue = window.localStorage.getItem(storageKey);
    if (!storedValue) return [];

    const result = storedThoughtsSchema.safeParse(JSON.parse(storedValue));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function createThoughtId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `thought-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useThoughts(storageOwnerId: string, getToken?: GetToken) {
  const storageKey = getThoughtsStorageKey(storageOwnerId);
  const [thoughts, setThoughts] = useState<Thought[]>(() =>
    loadThoughts(storageKey),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken) return;

    void getToken()
      .then((token) => (token ? getThoughts(async () => token) : null))
      .then((loadedThoughts) => {
        if (!loadedThoughts) return;
        setThoughts(loadedThoughts);
        setError(null);
      })
      .catch(() => setError("Thoughts could not be loaded."));
  }, [getToken]);

  const saveThoughts = (nextThoughts: Thought[]) => {
    window.localStorage.setItem(storageKey, JSON.stringify(nextThoughts));
    setThoughts(nextThoughts);
  };

  const addThought = (input: NewThought) => {
    const textResult = thoughtTextSchema.safeParse(input.text);
    if (!textResult.success) return null;

    const thought: Thought = {
      ...input,
      id: createThoughtId(),
      text: textResult.data,
      createdAt: new Date().toISOString(),
      isDone: false,
    };

    saveThoughts([thought, ...thoughts].slice(0, MAX_STORED_THOUGHTS));

    if (getToken && input.sessionId) {
      const sessionId = input.sessionId;
      void getToken()
        .then((token) =>
          token
            ? createThought({ ...input, sessionId }, async () => token)
            : null,
        )
        .then((savedThought) => {
          if (!savedThought) return;
          const { ownerId: _ownerId, ...localThought } = savedThought;
          setThoughts((current) =>
            current.map((item) =>
              item.id === thought.id ? localThought : item,
            ),
          );
        })
        .catch(() => {
          setThoughts((current) =>
            current.filter((item) => item.id !== thought.id),
          );
          setError("Thought could not be saved.");
        });
    }

    return thought;
  };

  const toggleThought = (thoughtId: string) => {
    const nextThoughts = thoughts.map((thought) =>
      thought.id === thoughtId
        ? { ...thought, isDone: !thought.isDone }
        : thought,
    );
    saveThoughts(nextThoughts);

    if (getToken) {
      const updatedThought = nextThoughts.find(
        (thought) => thought.id === thoughtId,
      );
      if (updatedThought) {
        void getToken()
          .then((token) =>
            token
              ? updateThought(
                  thoughtId,
                  updatedThought.isDone,
                  async () => token,
                )
              : null,
          )
          .catch(() => setError("Thought could not be updated."));
      }
    }
  };

  const removeThought = (thoughtId: string) => {
    saveThoughts(thoughts.filter((thought) => thought.id !== thoughtId));

    if (getToken) {
      void getToken()
        .then((token) =>
          token ? deleteThought(thoughtId, async () => token) : null,
        )
        .catch(() => setError("Thought could not be deleted."));
    }
  };

  return { thoughts, addThought, toggleThought, removeThought, error };
}
