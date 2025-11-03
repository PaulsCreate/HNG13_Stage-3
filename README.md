# StudySync Agent API

Welcome to StudySync — your AI-powered study accountability partner! This project provides a robust backend API for a conversational agent designed to help users set realistic goals, stay focused, and celebrate their progress.

![Health Check](https://img.shields.io/badge/API_Status-Running-green)
![Framework](https://img.shields.io/badge/Framework-Mastra-blue)
![Language](https://img.shields.io/badge/Language-TypeScript-blue)

---

## ✨ Features

- **Conversational AI Agent**: A smart, interactive agent powered by Google's Gemini model.
- **Persistent Memory**: Remembers conversation history for each user, providing a personalized experience using LibSQL.
- **Goal-Oriented Dialogue**: Designed to guide users through setting and achieving study goals.
- **Scalable Architecture**: Built with Express.js and Mastra for a clean and maintainable structure.
- **Easy Integration**: A simple RESTful API for seamless integration with any frontend application.

## 🛠️ Tech Stack

- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Framework**: [Mastra](https://mastra.io/)
- **LLM**: [Google Gemini](https://deepmind.google/technologies/gemini/)
- **Database**: [LibSQL](https://turso.tech/libsql) (for agent memory)
- **Environment Management**: [dotenv](https://www.npmjs.com/package/dotenv)

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v18 or later recommended)
- [npm](https://www.npmjs.com/get-npm) or any other package manager

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd HNG13_Stage-3
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project and add the following variables. You will need to obtain an API key from Google AI Studio.

```env
# .env

# Server configuration
PORT=4111

# Google Gemini API Key
GOOGLE_GENERATIVE_AI_API_KEY="your_google_api_key_here"
```

### 4. Run the Application

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:4111`.

## 📡 API Endpoints

### Health Check

- **Endpoint**: `GET /`
- **Description**: Checks if the API is running.
- **Success Response**:
  ```json
  {
    "status": "StudySync Agent API is running ✅",
    "message": "Welcome to StudySync — your AI study accountability partner!"
  }
  ```

### Chat with the Agent

- **Endpoint**: `POST /a2a/agent/studySyncAgent`
- **Description**: Send a message to the StudySync agent and get a response.
- **Request Body**:
  ```json
  {
    "sender": {
      "id": "user-123",
      "name": "Alex"
    },
    "text": "I want to prepare for my math exam."
  }
  ```
- **Example `curl` Request**:
  ```bash
  curl -X POST http://localhost:4111/a2a/agent/studySyncAgent \
  -H "Content-Type: application/json" \
  -d '{
    "sender": { "id": "user-123", "name": "Alex" },
    "text": "I want to prepare for my math exam."
  }'
  ```
- **Success Response**:
  ```json
  {
    "reply": "That's a great goal, Alex! To start, what specific topics in math will you be focusing on for the exam?"
  }
  ```
