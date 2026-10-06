import { z } from "zod";
import {
  thoughtSchema,
  type NewThought,
} from "../model/thoughtSchema";

const apiUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

type GetToken = () => Promise<string | null>;

const apiThoughtSchema = thoughtSchema.extend({
  ownerId: z.string().min(1),
  sessionId: z.string().min(1),
});

type ApiThought = z.infer<typeof apiThoughtSchema>;

async function apiRequest(
  path: string,
  getToken: GetToken,
  init?: RequestInit,
) {
  const token = await getToken();

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error("The thoughts service is unavailable.");
  }

  if (response.status === 204) return null;

  return response.json() as Promise<unknown>;
}

export async function getThoughts(getToken: GetToken) {
  const data = await apiRequest("/api/thoughts", getToken);

  const result = z
    .object({
      thoughts: z.array(apiThoughtSchema).max(100),
    })
    .parse(data);

  return result.thoughts;
}

export async function createThought(
  input: NewThought & { sessionId: string },
  getToken: GetToken,
) {
  const data = await apiRequest("/api/thoughts", getToken, {
    method: "POST",
    body: JSON.stringify(input),
  });

  return z.object({ thought: apiThoughtSchema }).parse(data).thought;
}

export async function updateThought(
  id: string,
  isDone: boolean,
  getToken: GetToken,
) {
  const data = await apiRequest(
    `/api/thoughts/${encodeURIComponent(id)}`,
    getToken,
    {
      method: "PATCH",
      body: JSON.stringify({ isDone }),
    },
  );

  return z.object({ thought: apiThoughtSchema }).parse(data).thought;
}

export async function deleteThought(id: string, getToken: GetToken) {
  await apiRequest(`/api/thoughts/${encodeURIComponent(id)}`, getToken, {
    method: "DELETE",
  });
}

export type { ApiThought, GetToken };
