import { createTool } from "@mastra/core";
import { z } from "zod";

export const studyScheduleTool = createTool({
  id: "create-study-schedule",
  description: "Create a weekly study schedule based on subjects and available time",
  inputSchema: z.object({
    subjects: z.array(z.string()),
    availableDays: z.array(z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])),
    dailyStudyTime: z.number().min(15).describe("Available study time per day in minutes"),
    examDate: z.string().optional().describe("Optional exam date for countdown planning"),
  }),
  outputSchema: z.object({
    schedule: z.array(z.object({
      day: z.string(),
      subject: z.string(),
      duration: z.number(),
      technique: z.string().optional(),
    })),
    totalWeeklyHours: z.number(),
  }),
  execute: async ({ subjects, availableDays, dailyStudyTime, examDate }) => {
    // Simple scheduling logic
    const schedule = availableDays.map(day => ({
      day,
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      duration: dailyStudyTime,
      technique: ["Pomodoro", "Active Recall", "Spaced Repetition"][Math.floor(Math.random() * 3)]
    }));

    return {
      schedule,
      totalWeeklyHours: Math.round((availableDays.length * dailyStudyTime) / 60 * 10) / 10,
    };
  },
});