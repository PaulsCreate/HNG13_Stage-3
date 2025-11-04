import { createTool } from "@mastra/core";
import { z } from "zod";

export const studySessionTool = createTool({
  id: "log-study-session",
  description: "Log a study session with duration, subject, and topics covered",
  inputSchema: z.object({
    subject: z.string(),
    duration: z.number().min(1).describe("Study duration in minutes"),
    topics: z.array(z.string()),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    sessionId: z.string(),
    message: z.string(),
  }),
  execute: async ({ subject, duration, topics, difficulty }) => {
    // Store in database or memory
    const sessionId = Math.random().toString(36).substring(7);
    
    return {
      success: true,
      sessionId,
      message: `Study session logged: ${duration} minutes on ${subject}`
    };
  },
});