# Fullstack of NGO Program — AI NGO Management & Outreach Assistant

A fullstack (backend + simple frontend) app to help NGOs:
- Volunteer management
- Donation campaign generator
- AI poster/caption generation
- Event management
- Social media content creation
- NGO chatbot
- Awareness campaign suggestions

## What’s “AI” here?
This version ships with a **no-API-key template-based AI provider** (fast, runs anywhere). The code is structured so you can later swap in an actual LLM (OpenAI / local models) behind the same API routes.

## Setup (Windows)
```bat
cd /d e:/college/AI/Fullstack of NGO program
npm install
```

## Run
In one terminal:
```bat
npm run dev
```

Then open:
- `public/index.html`

Backend listens on: http://localhost:3001

## API
Base: http://localhost:3001/api
- GET  /health
- GET  /volunteers
- POST /volunteers
- PUT  /volunteers/:id
- DELETE /volunteers/:id
- GET  /events
- POST /events
- PUT  /events/:id
- DELETE /events/:id

AI endpoints:
- POST /ai/donation-campaign
- POST /ai/poster-caption
- POST /ai/chatbot
- POST /ai/awareness
- POST /ai/social

