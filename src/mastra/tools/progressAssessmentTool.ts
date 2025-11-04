import { createTool } from "@mastra/core";
import { z } from "zod";

export const progressAssessmentTool = createTool({
  id: "assess-progress",
  description: "Assess study progress and provide recommendations",
  inputSchema: z.object({
    subject: z.string(),
    confidence: z.number().min(1).max(10).describe("Self-rated confidence level 1-10"),
    topicsMastered: z.array(z.string()),
    topicsStruggling: z.array(z.string()),
  }),
  outputSchema: z.object({
    assessment: z.string(),
    recommendation: z.string(),
    nextSteps: z.array(z.string()),
  }),
  execute: async ({ subject, confidence, topicsMastered, topicsStruggling }) => {
    let assessment = "";
    if (confidence >= 8) assessment = "Excellent progress!";
    else if (confidence >= 6) assessment = "Good progress, keep going!";
    else assessment = "Needs more focus and practice.";

    return {
      assessment,
      recommendation: `Focus on ${topicsStruggling.length > 0 ? topicsStruggling.join(", ") : "reviewing mastered topics"}`,
      nextSteps: [
        "Review difficult topics using Feynman technique",
        "Create flashcards for key concepts",
        "Practice with past papers or exercises"
      ],
    };
  },
});