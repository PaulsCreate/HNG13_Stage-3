# StudySync AI 🤖📚

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Mastra](https://img.shields.io/badge/powered_by-Mastra-7C3AED)
![Gemini](https://img.shields.io/badge/LLM-Gemini_2.0_Flash-4285F4)
![Telex](https://img.shields.io/badge/integration-Telex_A2A-00D4AA)

> Your AI-powered study accountability partner. Stay motivated, track progress, and achieve your learning goals with intelligent conversation and personalized support.

## 🎯 What is StudySync?

StudySync is an intelligent AI study companion that helps learners maintain consistency, set realistic goals, and stay motivated throughout their educational journey. Built with **Mastra** and powered by **Google Gemini**, it provides contextual, memory-aware conversations tailored to each student's needs.

### Key Features
- **🎓 Personalized Study Planning** - Create adaptive study schedules based on your availability and goals
- **📊 Progress Tracking** - Monitor learning milestones and celebrate achievements
- **💡 Smart Techniques** - Get recommendations for proven study methods (Pomodoro, Active Recall, Spaced Repetition)
- **🤝 Accountability Partner** - Daily check-ins and motivation to maintain consistency
- **🧠 Contextual Memory** - Remembers your study history and preferences across conversations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Google Gemini API key ([Get one here](https://aistudio.google.com/))

### Installation & Setup

```bash
# 1. Clone and setup
git clone https://github.com/PaulsCreate/HNG13_Stage-3.git
cd HNG13_Stage-3

# 2. Install dependencies
npm install

# 3. Configure environment
# 4. Start development server
npm run dev

cp .env.example .env
# Add your GOOGLE_GENERATIVE_AI_API_KEY to .env

Your API will be running at http://localhost:4111 🎉

🔌 API Integration
Base URL
https://telext.osc-fr1.scalingo.io  # Production
http://localhost:4111               # Development

## Chat Endpoint: 
POST /a2a/agent/studySyncAgent
Content-Type: application/json

## Request: 
{
  "sender": {
    "id": "user-123",
    "name": "Student Name"
  },
  "text": "I need help studying for my computer science exam"
}

## Response:
{
  "status": "success",
  "reply": {
    "type": "message",
    "text": "Hey there! 👋 Let's create a study plan for your computer science exam. What specific topics are you covering, and when is your exam date?"
  }
}

Example Usage: 
# Test with curl
curl -X POST https://telext.osc-fr1.scalingo.io/a2a/agent/studySyncAgent \
  -H "Content-Type: application/json" \
  -d '{
    "sender": {
      "id": "test-user-001",
      "name": "Alex"
    },
    "text": "Can you help me plan my study schedule?"
  }'

#🏗️ Architecture
StudySync AI Architecture:
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Telex.im      │───▶│   Express API    │───▶│   Mastra Agent  │
│   (Frontend)    │    │   (Node.js/TS)   │    │   (Framework)   │
└─────────────────┘    └──────────────────┘    └─────────┬───────┘
                                                    │
                                           ┌─────────▼──────────┐
                                           │   Gemini 2.0 Flash │
                                           │   (Google AI)      │
                                           └───────────────────┘

🛠️ Tech Stack
Layer	Technology	Purpose
Framework	Mastra	AI Agent Orchestration
Language	TypeScript	Type Safety & Maintainability
Runtime	Node.js + Express	API Server
AI Model	Gemini 2.0 Flash	Natural Language Processing
Memory	LibSQL	Persistent Conversation Storage
Platform	Telex.im	Agent Deployment & Integration
Deployment	Scalingo	Cloud Hosting

📁 Project Structure
HNG13_Stage-3/
├── src/
│   ├── server.ts              # Express server & API routes
│   └── mastra/
│       ├── index.ts           # Mastra configuration
│       └── agents/
│           └── studySyncAgent.ts  # AI agent definition
├── package.json
├── tsconfig.json
└── .env.example

🎮 Try StudySync Live!
🌐 Production Agent:
StudySync on Telex.im

🔗 API Endpoint:
https://telext.osc-fr1.scalingo.io/a2a/agent/studySyncAgent

🚀 Deployment
Build for Production
bash
npm run build
Start Production Server
bash
npm start
Environment Variables
env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
PORT=4111
NODE_ENV=production



