# 🇮🇳 JanSahayak — AI Welfare Navigator

> **Hackathon MVP** | Track: Social Impact  
> Team: JanSahayak | AWS Builder Center: @sraha23

Multilingual AI navigator that helps Indian citizens discover government welfare schemes they qualify for — just by describing their situation in plain Hindi or English.

---

## 🚀 Quick Start

### 1. Get a Gemini API Key
Go to → https://aistudio.google.com/app/apikey → Create API key (free)

### 2. Configure Backend
```bash
cd backend
cp ../.env.example .env
# Open .env and paste your key:
# GEMINI_API_KEY=AIza...your_key_here
```

### 3. Install & Run
```bash
# Terminal 1 — Backend (port 3001)
cd backend
npm install
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:3000
```

---

## 🏗️ Architecture

```
jansahayak/
├── backend/
│   ├── server.js           Express + Gemini 1.5 Flash API
│   ├── data/schemes.js     38 real schemes from myscheme.gov.in
│   └── package.json
└── frontend/
    ├── vite.config.js      Vite + React (automatic JSX runtime)
    └── src/
        ├── App.jsx
        ├── index.css       Tricolor design system
        ├── data/schemes.js Frontend scheme data
        └── components/
            ├── ChatPanel.jsx       AI chat with streaming + voice
            ├── SchemeMatcher.jsx   Structured eligibility form
            ├── WhatsAppPanel.jsx   WA bot simulation
            └── AnalyticsPanel.jsx  Officials dashboard
```

---

## 🔌 API Endpoints

| Method | Endpoint      | Description                          |
|--------|---------------|--------------------------------------|
| POST   | /api/chat     | Streaming chat with Gemini           |
| POST   | /api/voice    | Audio transcription + reply          |
| POST   | /api/match    | Structured eligibility matching      |
| GET    | /api/schemes  | All 38 schemes                       |
| GET    | /api/health   | Backend status check                 |

### `/api/chat` — Request
```json
{
  "messages": [
    { "role": "user", "content": "मैं UP का किसान हूँ, आय ₹1.2L" }
  ]
}
```

### `/api/match` — Request
```json
{
  "state": "Uttar Pradesh",
  "occupation": "farmer",
  "income": 120000,
  "gender": "male",
  "category": "OBC",
  "age": 42
}
```

---

## ✨ Features

| Feature | Status |
|---------|--------|
| 💬 Conversational eligibility engine (Hindi + English) | ✅ |
| 🎙️ Voice input (Web Speech API + Gemini transcription) | ✅ |
| 🔍 Structured scheme matcher with 7 filters | ✅ |
| 📱 Interactive WhatsApp bot simulation | ✅ |
| 📊 Analytics dashboard for officials | ✅ |
| 🌐 38 real schemes from myscheme.gov.in | ✅ |
| ⚡ Streaming responses (SSE) | ✅ |
| 📴 Offline fallback (client-side matching) | ✅ |

---

## 🗃️ Scheme Database

38 schemes across 11 categories:

| Category | Count |
|----------|-------|
| Agriculture | 4 |
| Employment | 3 |
| Health | 3 |
| Housing | 2 |
| Education | 4 |
| Women & Child | 5 |
| Finance | 5 |
| Skill Development | 2 |
| Social Security | 2 |
| Artisan | 1 |
| State Schemes | 8 |

---

## 🛣️ Production Roadmap (AWS)

| Component | AWS Service |
|-----------|-------------|
| AI Engine | Amazon Bedrock (Claude / Titan) |
| Vector Search | Amazon OpenSearch Serverless |
| WhatsApp Bot | Amazon Lex v2 + Twilio |
| Translation | Amazon Translate |
| Backend | AWS Lambda + API Gateway |
| Storage | Amazon S3 + DynamoDB |
| Analytics | Amazon QuickSight |
| CDN | Amazon CloudFront |

---

## 📌 Data Source
All scheme data sourced from **myscheme.gov.in** — Government of India's official scheme portal.
