import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "crypto";

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
  method: "POST",
  handler: async (c) => {
    console.log("🚀 A2A ENDPOINT HIT - StudySync Agent");
    
    try {
      const mastra = c.get("mastra");
      const agentId = c.req.param("agentId");

      // Parse JSON-RPC 2.0 request
      const body = await c.req.json();
      const { jsonrpc, id: requestId, method, params } = body;

      console.log("📨 Received A2A Request:", { 
        agentId, 
        method, 
        requestId,
        hasParams: !!params 
      });

      // Validate JSON-RPC 2.0 format
      if (jsonrpc !== "2.0" || !requestId) {
        return c.json({
          jsonrpc: "2.0",
          id: requestId || null,
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0" and id is required'
          }
        }, 400);
      }

      // Check if method is supported
      if (method !== "message/send") {
        return c.json({
          jsonrpc: "2.0",
          id: requestId,
          error: {
            code: -32601,
            message: `Method not supported: ${method}. Only 'message/send' is supported.`
          }
        }, 400);
      }

      // Type-safe agent retrieval
      if (agentId !== "studySyncAgent") {
        return c.json({
          jsonrpc: "2.0",
          id: requestId,
          error: {
            code: -32602,
            message: `Agent '${agentId}' not found. Available agent: studySyncAgent`
          }
        }, 404);
      }

      const agent = mastra.getAgent(agentId as "studySyncAgent");

      // EXTRACT USER MESSAGE - 
      const userMessage = extractUserMessage(params);
      const contextId = params?.message?.taskId || randomUUID();
      const taskId = params?.message?.messageId || randomUUID();

      console.log("💬 Extracted user message:", userMessage);
      console.log("🔑 Context ID:", contextId, "Task ID:", taskId);

      // Handle empty message with default greeting
      if (!userMessage) {
        console.log("🤖 No user message, sending default greeting");
        return buildSuccessResponse(
          requestId,
          "Hello! I'm StudySync, your AI study accountability partner! I can help you create study schedules, track your progress, and suggest effective study techniques. What would you like to work on today?",
          contextId,
          taskId
        );
      }

      // Handle simple greetings
      if (isSimpleGreeting(userMessage)) {
        console.log("🤖 Handling greeting message");
        return buildSuccessResponse(
          requestId,
          "Hello! I'm StudySync, your AI study accountability partner! I can help you create study schedules, track your progress, and suggest effective study techniques. What would you like to work on today?",
          contextId,
          taskId
        );
      }

      console.log("🤖 Processing with StudySync agent:", userMessage);

      // Convert to Mastra format
      const mastraMessages = [{
        role: "user" as const,
        content: userMessage
      }];

      // Execute agent with tools enabled
      const response = await agent.run(mastraMessages, {
        tools: ['studySessionTool', 'studyScheduleTool', 'progressAssessmentTool'],
        enableToolUsage: true
      });

      console.log("🔧 Full agent response:", JSON.stringify(response, null, 2));

      // Extract response text
      let agentText = extractAgentResponse(response);
      
      console.log("✅ Final agent response:", agentText);

      return buildSuccessResponse(requestId, agentText, contextId, taskId);

    } catch (error: any) {
      console.error("❌ A2A Route Error:", error);
      return c.json({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message: "Internal error",
          data: { details: error.message }
        }
      }, 500);
    }
  }
});

// MESSAGE EXTRACTION FUNCTIONS (Mirroring Django logic)
function extractUserMessage(params: any): string {
  if (!params?.message?.parts) {
    console.log("❌ No message parts found in params");
    return "";
  }

  const parts = params.message.parts;
  console.log(`🔍 Found ${parts.length} parts in message`);

  let userMessages: string[] = [];

  // First, look for data parts (like Django does)
  for (const part of parts) {
    if (part.kind === "data" && part.data) {
      console.log("📊 Processing data part with", part.data.length, "items");
      
      for (const item of part.data) {
        if (item.kind === "text" && item.text) {
          const text = item.text.trim();
          if (text && !isBotResponse(text)) {
            userMessages.push(text);
            console.log("✅ Found user message in data:", text.substring(0, 100));
          }
        }
      }
    }
  }

  // If found user messages in data, take the last one
  if (userMessages.length > 0) {
    const message = userMessages[userMessages.length - 1];
    console.log("🎯 Selected most recent user message from data:", message.substring(0, 100));
    return message;
  }

  // Else, look in text parts
  let textParts: string[] = [];
  for (const part of parts) {
    if (part.kind === "text" && part.text) {
      const text = part.text.trim();
      if (text && !isBotResponse(text)) {
        textParts.push(text);
        console.log("✅ Found text part:", text.substring(0, 100));
      }
    }
  }

  if (textParts.length > 0) {
    const message = textParts[textParts.length - 1];
    console.log("🎯 Selected user message from text parts:", message.substring(0, 100));
    return message;
  }

  console.log("❌ No valid user messages found");
  return "";
}

function isBotResponse(text: string): boolean {
  const textLower = text.toLowerCase();
  
  // Bot response indicators 
  const botIndicators = [
    'here are some', 'steps you can take', 'suggestions to help',
    'advice for', 'tips that might help'
  ];

  const isBot = botIndicators.some(indicator => 
    textLower.includes(indicator.toLowerCase())
  );

  if (isBot) {
    console.log("🚫 Filtered out bot response:", text.substring(0, 100));
  }

  return isBot;
}

function isSimpleGreeting(message: string): boolean {
  const greetings = ['hi', 'hello', 'hey', 'how are you', 'whats up', "what's up", 'good morning', 'good afternoon', 'good evening'];
  return greetings.includes(message.toLowerCase().trim());
}

function extractAgentResponse(response: any): string {
  if (response.text) {
    return response.text;
  } else if (response.output?.[0]?.content) {
    return response.output[0].content;
  } else if (typeof response === 'string') {
    return response;
  } else {
    return "I'm StudySync, your AI study partner! I can help you create study schedules, track progress, and suggest effective study techniques. What would you like to work on?";
  }
}

function buildSuccessResponse(requestId: string, responseText: string, contextId: string, taskId: string) {
  const messageId = randomUUID();
  const artifactId = randomUUID();

  console.log("📤 Building success response with:", {
    requestId,
    contextId,
    taskId,
    responseLength: responseText.length
  });

  const responseMessage = {
    kind: "message",
    role: "agent",
    parts: [
      {
        kind: "text",
        text: responseText
      }
    ],
    messageId: messageId,
    taskId: taskId
  };

  const responseData = {
    jsonrpc: "2.0",
    id: requestId,
    result: {
      id: taskId,
      contextId: contextId,
      status: {
        state: "completed",
        timestamp: new Date().toISOString(),
        message: responseMessage
      },
      artifacts: [
        {
          artifactId: artifactId,
          name: "assistantResponse",
          parts: [
            {
              kind: "text",
              text: responseText
            }
          ]
        }
      ],
      history: [responseMessage],
      kind: "task"
    }
  };

  console.log("✅ Success response built");
  return Response.json(responseData);
}