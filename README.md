# Project Overview
AI Chatbot Pro is an AI chatbot application featuring a modern React frontend (built with Vite and TailwindCSS) and a high-performance Python FastAPI backend. It utilizes SQLAlchemy for database interactions, allowing users to converse with AI, personalize their settings, and manage chat sessions and file uploads.

## Folder Structure
```text
ai_chatbot_pro/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── static/
│   │   ├── utils/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   ├── test_pdf_upload.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── docs/
├── tests/
├── uploads/
├── requirements.txt
├── pyrightconfig.json
└── README.md
```
*(Note: Excluded `node_modules`, `venv`, `__pycache__`, `.git`, `dist` directories and `.env` files for security and brevity.)*

## Frontend Breakdown
- **components/**: Reusable React UI components, likely organized by features (e.g., chat, ui, library, projects).
- **context/**: React Context providers for global state management.
- **hooks/**: Custom React hooks for abstracting logic.
- **layouts/**: Layout wrapper components for pages.
- **pages/**: Page-level React components representing main application views (e.g., Login, Chat, Projects, Settings).
- **routes/**: Application routing configuration files (e.g., `AppRoutes.jsx`).
- **services/**: API integration and external service logic (e.g., `api.js`).
- **utils/**: Helper functions and utility constants.

### Context Files
- **`ChatContext.jsx`**: Manages the global state for chat sessions, messages, and AI interactions.
- **`SettingsContext.jsx`**: Manages application personalization settings, including UI themes (dark/light), font sizes, contrast, accent colors, and response speeds.

## Backend Breakdown
- **api/**: FastAPI route definitions and endpoints (e.g., auth, chat, users).
- **core/**: Core configuration, application settings, and shared resources.
- **database/**: Database connection setup, SQLAlchemy engine, and session management.
- **models/**: SQLAlchemy ORM database models (e.g., User, ChatSession).
- **schemas/**: Pydantic models for data validation, serialization, and API request/response structures.
- **services/**: Business logic, AI integration services, and background task processing.
- **static/**: Static file serving, mainly used for user uploads and avatars.
- **utils/**: Helper functions (e.g., file utils, text extraction).

### API Routes
- **`auth.py`**: Endpoints handling user authentication (e.g., login, tokens).
- **`chat.py`**: Endpoints for sending messages, uploading attachments, interacting with the AI model, and retrieving chat history.
- **`users.py`**: Endpoints for user registration, retrieving user profiles, updating personal information (nickname, occupation, custom instructions), and uploading avatars.
- **`projects.py`**: Endpoints exposing project management functionality.
- **`library.py`**: Endpoints for library features and resources.
- **`scheduled_tasks.py`**: Endpoints for managing and creating scheduled background tasks.
- **`health.py`**: API health check endpoint.
- **`deps.py`**: FastAPI dependency injection functions (e.g., getting current user, database session).

## Key Features
- **AI Chat Interactions**: Conversational interface with AI models supporting custom prompt effort levels.
- **Settings & Personalization**: Extensive UI customization including theme (light/dark), font size, contrast modes, accent colors, and AI response speed settings.
- **User Profiles**: Nickname, occupation, and custom AI instructions for personalized chat responses, along with avatar uploading.
- **File Uploads & Attachments**: Support for image and document uploads during chat sessions, including text extraction.
- **Projects & Library**: Organizing chats into projects and maintaining a resource library.
- **Scheduled Tasks**: Background task scheduling and execution logging.

## How to Run

### Frontend
1. Navigate to the `frontend/` directory.
2. Install dependencies (e.g., `npm install`).
3. Start the Vite development server by running:
   ```bash
   npm run dev
   ```

### Backend
1. Navigate to the `backend/` directory (or use the root if applicable).
2. Ensure you have activated your Python virtual environment.
3. Install Python dependencies using:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` file based on `.env.example`.
5. Run the FastAPI server (e.g., via `uvicorn app.main:app --reload`).

*(Note: Exact backend run commands may vary based on exact `uvicorn` setup in the repository.)*
