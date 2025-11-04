// src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { mastra } from "./mastra/index.js"; // Changed from .ts to .js

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4111;

// 🧠 Root health check
app.get("/", (req, res) => {
  res.json({
    status: "StudySync Agent API is running ✅",
    message: "Welcome to StudySync — your AI study accountability partner!",
  });
});

// 🎯 Main agent chat route - FIXED VERSION
app.post("/a2a/agent/studySyncAgent", async (req, res) => {
  try {
    console.log("📥 Received request:", JSON.stringify(req.body, null, 2));
    
    const { sender, text, message } = req.body;
    
    // Handle different request formats (Telex sends 'message' object)
    const messageText = text || message?.text || "";
    const userName = sender?.name || "there";
    const userId = sender?.id || `user-${Date.now()}`;

    // First interaction welcome message
    if (!messageText || messageText.trim().length === 0) {
      return res.json({
        status: "success",
        reply: {
          type: "message",
          text: `Hey ${userName}! 👋 I'm StudySync — your AI study accountability partner. 
I'm here to help you set realistic goals, stay focused, and celebrate your progress. 
What's something you'd like to achieve today?`
        }
      });
    }

    // Get agent and generate response
    const agent = mastra.getAgent("studySyncAgent");
    
    if (!agent) {
      throw new Error("StudySync agent not found");
    }

    const response = await agent.generate(
      [
        {
          role: "user",
          content: messageText,
        },
      ],
      {
        memory: {
          resource: userId,
          thread: userId,
        },
      }
    );

    console.log("🤖 Agent response:", response.text);

    // Return proper Telex A2A format
    res.json({
      status: "success",
      reply: {
        type: "message",
        text: response.text,
      },
    });

  } catch (err: any) {
    console.error("❌ Agent Error:", err);
    res.status(500).json({ 
      status: "error",
      reply: {
        type: "message",
        text: "I'm having trouble connecting right now. Please try again! 🔄"
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 StudySync API running on: http://localhost:${PORT}`);
  console.log(`📡 A2A Endpoint: http://localhost:${PORT}/a2a/agent/studySyncAgent`);
});

//Add this to your server.ts temporarily
console.log("🔧 Starting server...");
console.log("📁 Current directory:", process.cwd());
console.log("🔑 Gemini Key exists:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

