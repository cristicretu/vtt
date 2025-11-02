import type { Doc } from "~/convex/_generated/dataModel";
import type { PlanKey } from "~/convex/schema";

export type User = Doc<"users"> & {
  avatarUrl?: string;
  subscription?: Doc<"subscriptions"> & {
    planKey: PlanKey;
  };
};

export type Patient = {
  id: string;
  fullName: string;
  dateOfBirth: string;
};

export type Entry = {
  id: string;
  patientId: string;
  createdAt: Date;
  updatedAt: Date;
  recording: string; // URL or path to audio recording
  transcript: string;
  diagnostic: string | "Not set";
};
