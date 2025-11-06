import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "crypto";

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
  method: "POST",
  handler: async (c) => {
    console.log("🔍 A2A Request Received");

    try {
      const mastra = c.get("mastra");
      const agentId = c.req.param("agentId");

      // Parse JSON-RPC 2.0 request
      const body = await c.req.json();
      const { jsonrpc, id: requestId, method, params } = body;

      console.log("📨 Request Details:", {
        agentId,
        method,
        requestId,
        hasParams: !!params,
      });

      // Validate JSON-RPC 2.0 format
      if (jsonrpc !== "2.0" || !requestId) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId || null,
            error: {
              code: -32600,
              message:
                'Invalid Request: jsonrpc must be "2.0" and id is required',
            },
          },
          400
        );
      }

      // Check if method is supported
      if (method !== "message/send") {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32601,
              message: `Method not supported: ${method}. Only 'message/send' is supported.`,
            },
          },
          400
        );
      }

      // Agent validation
      if (agentId !== "studySyncAgent") {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32602,
              message: `Agent '${agentId}' not found. Available agent: studySyncAgent`,
            },
          },
          404
        );
      }

      const agent = mastra.getAgent(agentId as "studySyncAgent");

      // Extract messages from params - CRITICAL FIX HERE
      const { message, messages, contextId, taskId, configuration } =
        params || {};

      console.log("🔍 Params Analysis:", {
        hasMessage: !!message,
        hasMessages: !!messages,
        contextId,
        taskId,
      });

      let userMessage = "";

      // METHOD 1: Check if message exists with parts (Primary Telex format)
      if (message && message.parts) {
        console.log("📝 Processing message.parts structure");
        userMessage = extractUserMessageFromParts(message.parts);
      }

      // METHOD 2: Check if messages array exists (Fallback)
      if (!userMessage && messages && Array.isArray(messages)) {
        console.log("📝 Processing messages array structure");
        for (const msg of messages) {
          if (msg.parts) {
            const extracted = extractUserMessageFromParts(msg.parts);
            if (extracted) {
              userMessage = extracted;
              break;
            }
          }
        }
      }

      // METHOD 3: Direct text extraction (Last resort)
      if (!userMessage && message && message.text) {
        console.log("📝 Processing direct message.text");
        userMessage = message.text;
      }

      console.log("💬 Extracted User Message:", userMessage);

      // If no message found, use default
      if (!userMessage) {
        userMessage = "Hello";
        console.log("🤖 Using default greeting");
      }

      // Convert to Mastra format
      const mastraMessages = [
        {
          role: "user",
          content: userMessage,
        },
      ];

      console.log("🤖 Sending to Agent:", {
        messageLength: userMessage.length,
        preview: userMessage.substring(0, 100),
      });

      // Execute agent
      const response = await agent.generate(mastraMessages);
      const agentText =
        response.text ||
        "I received your message but couldn't generate a proper response.";

      console.log("✅ Agent Response:", {
        responseLength: agentText.length,
        preview: agentText.substring(0, 100),
        hasToolResults: !!(
          response.toolResults && response.toolResults.length > 0
        ),
      });

      // Build A2A-compliant response
      const responseData = buildA2AResponse(
        requestId,
        agentText,
        contextId || randomUUID(),
        taskId || randomUUID()
      );

      console.log("📤 Sending A2A Response");
      return c.json(responseData);
    } catch (error: any) {
      console.error("❌ A2A Route Error:", error);
      return c.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32603,
            message: "Internal error",
            data: { details: error.message },
          },
        },
        500
      );
    }
  },
});

// CRITICAL: Helper function to extract user message from Telex parts structure
function extractUserMessageFromParts(parts: any[]): string {
  if (!Array.isArray(parts)) return "";

  console.log(`🔍 Analyzing ${parts.length} parts`);

  const userMessages: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const partKind = part.kind;

    console.log(`📦 Part ${i}: kind=${partKind}`);

    // Handle "data" kind with nested structure (from your Python code)
    if (partKind === "data" && part.data) {
      console.log(
        `🔍 Found data part with data:`,
        Array.isArray(part.data) ? part.data.length : "non-array"
      );

      const dataItems = Array.isArray(part.data) ? part.data : [part.data];

      for (const item of dataItems) {
        if (
          item &&
          item.kind === "text" &&
          item.text &&
          typeof item.text === "string"
        ) {
          const text = item.text.trim();
          if (text && !isBotResponse(text)) {
            userMessages.push(text);
            console.log(
              `💬 Found user message in data: '${text.substring(0, 50)}...'`
            );
          }
        }
      }
    }

    // Handle direct "text" kind
    if (partKind === "text" && part.text && typeof part.text === "string") {
      const text = part.text.trim();
      if (text && !isBotResponse(text)) {
        userMessages.push(text);
        console.log(
          `💬 Found user message in text: '${text.substring(0, 50)}...'`
        );
      }
    }
  }

  // Return the most recent user message (like your Python code)
  return userMessages.length > 0 ? userMessages[userMessages.length - 1] : "";
}

// Helper to filter out bot responses (from your Python code)
function isBotResponse(text: string): boolean {
  const textLower = text.toLowerCase();
  const botIndicators = [
    "here are some",
    "steps you can take",
    "suggestions to help",
    "advice for",
    "tips that might help",
    "consider taking",
    "you can use",
    "it's essential to",
    "contact a healthcare",
    "rinse with warm salt water",
    "over-the-counter",
    "cold compress",
    "avoid irritating foods",
    "maintain oral hygiene",
    "topical anesthetics",
    "stay hydrated",
    "see a dentist",
  ];

  return botIndicators.some(
    (indicator) =>
      textLower.startsWith(indicator) || textLower.includes(indicator)
  );
}

// Build proper A2A response
function buildA2AResponse(
  requestId: string,
  agentText: string,
  contextId: string,
  taskId: string
) {
  const messageId = randomUUID();
  const artifactId = randomUUID();

  const responseMessage = {
    kind: "message" as const,
    role: "agent" as const,
    parts: [
      {
        kind: "text" as const,
        text: agentText,
      },
    ],
    messageId,
    taskId,
  };

  return {
    jsonrpc: "2.0",
    id: requestId,
    result: {
      id: taskId,
      contextId,
      status: {
        state: "completed" as const,
        timestamp: new Date().toISOString(),
        message: responseMessage,
      },
      artifacts: [
        {
          artifactId,
          name: "studySyncAgentResponse",
          parts: [
            {
              kind: "text" as const,
              text: agentText,
            },
          ],
        },
      ],
      history: [responseMessage],
      kind: "task" as const,
    },
  };
}
