import "dotenv/config";
import { mastra } from "./mastra/index.js";

async function testFixedConfig() {
  try {
    console.log("🧪 Testing fixed configuration...");

    const agent = mastra.getAgent("studySyncAgent");
    console.log("✅ Agent retrieved");

    const response = await agent.generate([
      {
        role: "user",
        content:
          "Hello! Just say 'StudySync is working!' to confirm everything is working.",
      },
    ]);

    console.log("✅ SUCCESS!");
    console.log("Response:", response.text);

    if (response.toolResults && response.toolResults.length > 0) {
      console.log("Tools used:", response.toolResults);
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

testFixedConfig();
