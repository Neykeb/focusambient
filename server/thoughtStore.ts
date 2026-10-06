import { ThoughtModel } from "./models/ThoughtModel.js";

type ThoughtData = {
  ownerId: string;
  sessionId: string;
  id: string;
  text: string;
  isDone: boolean;
  presetId: string;
  presetLabel: string;
  createdAt: string;
};

export type ThoughtStore = {
  getAll: (ownerId: string) => Promise<ThoughtData[]>;
  add: (
    ownerId: string,
    thought: Omit<ThoughtData, "ownerId">,
  ) => Promise<ThoughtData>;
  updateDone: (
    ownerId: string,
    id: string,
    isDone: boolean,
  ) => Promise<ThoughtData | null>;
  remove: (ownerId: string, id: string) => Promise<boolean>;
};

export class MongoThoughtStore implements ThoughtStore {
  async getAll(ownerId: string) {
    const thoughts = await ThoughtModel.find({ ownerId })
      .sort({ createdAt: -1 })
      .limit(100)
      .select(
        "-_id ownerId sessionId id text isDone presetId presetLabel createdAt",
      )
      .lean();

    return thoughts as ThoughtData[];
  }

  async add(ownerId: string, thought: Omit<ThoughtData, "ownerId">) {
    const savedThought = await ThoughtModel.create({
      ownerId,
      ...thought,
    });

    return savedThought.toObject() as ThoughtData;
  }

  async updateDone(ownerId: string, id: string, isDone: boolean) {
    const thought = await ThoughtModel.findOneAndUpdate(
      { ownerId, id },
      { $set: { isDone } },
      { new: true },
    ).lean();

    return thought as ThoughtData | null;
  }

  async remove(ownerId: string, id: string) {
    const result = await ThoughtModel.deleteOne({ ownerId, id });
    return result.deletedCount === 1;
  }
}
