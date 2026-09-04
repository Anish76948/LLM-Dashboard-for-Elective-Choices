import { z } from "zod";

export const choiceCreateSchema = z.object({
  electiveId: z.string().min(1, "Elective ID is required"),
  preference: z.number().int().positive("Preference must be a positive integer"),
});

export const advisorRequestSchema = z.object({
  goal: z.string().min(2, "Career goal must be at least 2 characters").max(500, "Goal is too long"),
  interests: z.array(z.string()).default([]),
});

export const electiveQuerySchema = z.object({
  dept: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  search: z.string().optional(),
});
