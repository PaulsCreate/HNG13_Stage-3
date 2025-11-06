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
    try {
      console.log('🔧 studyScheduleTool executed with:', { 
        subjects, 
        availableDays, 
        dailyStudyTime, 
        examDate 
      });

      // SAFE ARRAY HANDLING - Add null checks and defaults
      const safeSubjects = Array.isArray(subjects) && subjects.length > 0 ? subjects : ['General Study'];
      const safeAvailableDays = Array.isArray(availableDays) && availableDays.length > 0 ? availableDays : ['monday', 'wednesday', 'friday'];
      
      console.log('🔧 Using safe arrays:', { safeSubjects, safeAvailableDays });

      // Create schedule with safe arrays
      const schedule = safeAvailableDays.map(day => {
        const randomSubject = safeSubjects[Math.floor(Math.random() * safeSubjects.length)];
        const techniques = ["Pomodoro", "Active Recall", "Spaced Repetition", "Feynman Technique"];
        const randomTechnique = techniques[Math.floor(Math.random() * techniques.length)];
        
        return {
          day,
          subject: randomSubject,
          duration: dailyStudyTime || 60, // Fallback to 60 minutes if undefined
          technique: randomTechnique
        };
      });

      const totalWeeklyHours = Math.round((safeAvailableDays.length * (dailyStudyTime || 60)) / 60 * 10) / 10;

      console.log('✅ studyScheduleTool result:', { schedule, totalWeeklyHours });

      return {
        schedule,
        totalWeeklyHours,
      };
    } catch (error) {
      console.error('❌ studyScheduleTool error:', error);
      
      // Return a fallback schedule instead of crashing
      return {
        schedule: [{
          day: 'monday',
          subject: 'General Study',
          duration: 60,
          technique: 'Pomodoro'
        }],
        totalWeeklyHours: 1.0,
        error: `Schedule creation failed: ${error.message}`
      };
    }
  },
});