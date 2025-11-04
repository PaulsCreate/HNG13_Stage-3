import "dotenv/config";
import { mastra } from "./mastra/index.js";

const PORT = process.env.PORT || 4111;

// Mastra handles the server automatically
console.log(`🚀 StudySync A2A Agent starting...`);
console.log(
  `📡 A2A Endpoint: http://localhost:${PORT}/a2a/agent/studySyncAgent`
);
console.log(`📚 Swagger UI: http://localhost:${PORT}/swagger`);
