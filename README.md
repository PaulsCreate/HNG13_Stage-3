# StudySync AI 🤖📚

![version](https://img.shields.io/badge/version-1.0.0-blue)
![powered_by](https://img.shields.io/badge/powered_by-Mastra-7C3AED)
![LLM](https://img.shields.io/badge/LLM-Gemini_2.0_Flash-4285F4)
![integration](https://img.shields.io/badge/integration-Telex_A2A-00D4AA)

StudySync is your AI-powered study accountability partner. Stay motivated, track progress, and achieve your learning goals with intelligent conversation and personalized support.

🎯 What is StudySync?
StudySync is an intelligent AI study companion that helps learners maintain consistency, set realistic goals, and stay motivated throughout their educational journey. Built with Mastra and powered by Google Gemini, it provides contextual, memory-aware conversations tailored to each student's needs.

Key Features
🎓 Personalized Study Planning - Create adaptive study schedules based on your availability and goals

📊 Progress Assessment - Evaluate learning progress and get personalized recommendations

📝 Session Tracking - Log and monitor study sessions for accountability

💡 Smart Techniques - Get recommendations for proven study methods (Pomodoro, Active Recall, Spaced Repetition)

🤝 Accountability Partner - Daily check-ins and motivation to maintain consistency

🧠 Contextual Memory - Remembers your study history and preferences across conversations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Google Gemini API key ([Get one here](https://aistudio.google.com/))

### Installation & Setup

````bash
# 1. Clone and setup
git clone https://github.com/PaulsCreate/HNG13_Stage-3.git
cd HNG13_Stage-3

# 2. Install dependencies
npm install

# 3. Configure environment
# 4. Start development server
npm run dev


Live A2A Endpoint
> https://study-agent-hng13.mastra.cloud/a2a/agent/studySyncAgent

Test with cURL
```bash
curl -X POST "https://study-agent-hng13.mastra.cloud/a2a/agent/studySyncAgent" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-001",
    "method": "message/send",
    "params": {
      "message": {
        "kind": "message",
        "role": "user",
        "parts": [
          {
            "kind": "text",
            "text": "Can you help me create a study schedule for my exams?"
          }
        ],
        "messageId": "msg-001",
        "taskId": "task-001"
      },
      "configuration": {
        "blocking": true
      }
    }
  }'
````

🔌 API Integration
A2A Protocol Endpoint
POST /a2a/agent/studySyncAgent

Example Request

```json
{
  "jsonrpc": "2.0",
  "id": "request-001",
  "method": "message/send",
  "params": {
    "message": {
      "kind": "message",
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "I need help studying for my computer science exam"
        }
      ],
      "messageId": "msg-001",
      "taskId": "task-001"
    },
    "configuration": {
      "blocking": true
    }
  }
}
```

Example Response

```json
{
  "jsonrpc": "2.0",
  "id": "request-001",
  "result": {
    "id": "task-001",
    "contextId": "context-uuid",
    "status": {
      "state": "completed",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "message": {
        "messageId": "response-uuid",
        "role": "agent",
        "parts": [
          {
            "kind": "text",
            "text": "Hey there! 👋 Let's create a study plan for your computer science exam. What specific topics are you covering, and when is your exam date?"
          }
        ],
        "kind": "message"
      }
    },
    "artifacts": [...],
    "history": [...]
  }
}
```

🛠️ Core Tools
StudySync AI includes three specialized tools for comprehensive learning support:

1. Progress Assessment Tool
   Evaluates confidence levels (1-10 scale)

Analyzes mastered vs. struggling topics

Provides personalized recommendations

Suggests evidence-based next steps

2. Study Schedule Tool
   Creates weekly study plans

Distributes subjects across available days

Recommends study techniques

Calculates total weekly study hours

3. Study Session Tool
   Logs study duration and topics

Tracks difficulty levels

Maintains session history

Provides accountability tracking

🏗️ Architecture

```text
StudySync AI Architecture:
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Telex.im      │───▶│   Mastra A2A     │───▶│   StudySync     │
│   (Platform)    │    │   Endpoint       │    │   AI Agent      │
└─────────────────┘    └──────────────────┘    └─────────┬───────┘
                                                    │
                                           ┌─────────▼──────────┐
                                           │   Gemini 2.0 Flash │
                                           │   + Mastra Tools   │
                                           └────────────────────┘
```

🛠️ Tech Stack
Layer Technology Purpose
Framework Mastra AI Agent Orchestration
Language TypeScript Type Safety & Maintainability
LLM Gemini 2.0 Flash Natural Language Processing
Tools Custom Study Tools Progress assessment, scheduling, tracking
Memory LibSQL Persistent Conversation Storage
Integration A2A Protocol Standardized agent communication
Deployment Mastra Cloud Reliable Hosting

```text

📁 Project Structure
HNG13_Stage-3/
├── src/
│   ├── agents/
│   │   └── study-sync-agent.ts     # Main StudySync agent definition
│   ├── tools/
│   │   ├── progressAssessmenTool.ts
│   │   ├── studyScheduleTool.ts
│   │   └── studySessionTool.ts
│   ├── routes/
│   │   └── a2aRouteHandler.ts      # A2A protocol route handler
│   └── index.ts            # Mastra configuration
├── package.json
└── tsconfig.json
```

💡 Usage Examples
Progress Assessment

> "Can you assess my progress in physics? I rate my confidence 6/10, mastered kinematics but struggling with electromagnetism"

Study Planning

> "I have 2 hours daily to study math, physics, and chemistry for my finals next month"

Session Logging

> "Just finished 45 minutes studying organic chemistry reaction mechanisms"

🔧 Local Development Setup
To run StudySync AI on your local machine, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/HNG13_Stage-3.git
    cd HNG13_Stage-3
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your API keys.

    ```env
    GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
    MASTRA_AGENT_ID=studySyncAgent
    ```

4.  **Run the application:**
    ```bash
    npm start
    ```

🚀 Deployment
Mastra Cloud Deployment

```bash
# Build the project
npm run build

# Deploy to Mastra Cloud
mastra deploy
```

🎮 Try StudySync Live!
🌐 Production Agent:
StudySync on Telex.im

🔗 Live A2A Endpoint:

> https://study-agent-hng13.mastra.cloud/a2a/agent/studySyncAgent

📈 Benefits
Comprehensive Support: Three-tool approach covers assessment, planning, and tracking

Personalized Learning: Adapts to individual learning styles and progress

Evidence-Based: Uses proven learning techniques and methods

Accountability: Tracks consistency and celebrates milestones

Collaborative: Works within team learning environments on Telex

Standardized: A2A protocol ensures interoperability across platforms

🔗 Links
Live API: https://study-agent-hng13.mastra.cloud/a2a/agent/studySyncAgent

Telex Platform: https://telex.im

Mastra Docs: https://docs.mastra.ai

A2A Protocol: Agent-to-Agent communication standard

🤝 Contributing
StudySync AI demonstrates the power of tool-based AI agents in education. The architecture can be extended for various learning domains including language learning, coding tutorials, math assistance, and research support.

Built with ❤️ using Mastra, Gemini, and the A2A protocol for transformative educational experiences.
