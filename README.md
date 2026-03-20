# 🇮🇳 JanSahayak — AI Welfare Navigator

> **Hackathon MVP** | Track: Social Impact
> Built with Kiro IDE | Deployed on AWS EC2

Multilingual AI navigator that helps Indian citizens discover government welfare schemes they qualify for — just by describing their situation in plain Hindi or English.

---

## 🌐 Live Demo

Deployed on AWS EC2 (ap-southeast-1) with HTTPS via Cloudflare Tunnel.

To run the tunnel locally:
```bash
cloudflared tunnel --url http://18.141.233.106:3001
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 AI Chat (JanSahayak) | Conversational eligibility engine in Hindi + English with streaming responses |
| 🤖 Disha Agent | Scans 4,651 schemes from myscheme.gov.in and picks top 5 using AI ranking |
| 🔍 Scheme Finder | Structured eligibility form with 6 filters (state, occupation, income, gender, category, age) |
| 📱 WhatsApp Simulation | Interactive WhatsApp bot simulation for scheme discovery |
| 📊 Analytics Dashboard | Officials dashboard with scheme usage analytics |
| 🎙️ Voice Input | Hold-to-speak voice input with Gemini transcription + TTS reply |
| ⚡ Streaming SSE | Real-time streaming responses via Server-Sent Events |
| 🌐 Bilingual | Full Hindi and English support, auto-detects user language |

---

## 🏗️ Architecture

```
jansahayak/
├── backend/
│   ├── server.js              Express API + Gemini 2.5 Flash
│   ├── data/
│   │   ├── schemes.js         38 curated schemes (local)
│   │   └── schemes_full.json  4,651 schemes from myscheme.gov.in
│   └── package.json
└── frontend/
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        ├── data/schemes.js
        └── components/
            ├── ChatPanel.jsx       JanSahayak AI chat
            ├── DishaAgent.jsx      Disha AI agent (4,651 schemes)
            ├── SchemeMatcher.jsx   Structured eligibility form
            ├── WhatsAppPanel.jsx   WhatsApp bot simulation
            └── AnalyticsPanel.jsx  Officials dashboard
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat | Streaming chat with Gemini (SSE) |
| POST | /api/voice | Audio transcription + reply |
| POST | /api/match | Structured eligibility matching |
| POST | /api/disha/search | AI-powered search across 4,651 schemes (SSE) |
| POST | /api/disha/chat | Follow-up chat about Disha results (SSE) |
| GET | /api/schemes | All 38 curated schemes |
| GET | /api/health | Backend health check |

---

## 🚀 Local Development

### 1. Get a Gemini API Key
Go to https://aistudio.google.com/app/apikey → Create API key (free)

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Add your key:
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

## ☁️ AWS Deployment

Deployed on a single **AWS EC2 t3.small** (Amazon Linux 2023, ap-southeast-1).

- Backend (Express) serves both the API and the built React frontend as static files
- HTTPS provided via Cloudflare Tunnel (no SSL cert needed)
- Backend managed by PM2 for auto-restart

### Deploy from scratch

```bash
# 1. Launch EC2 with userdata.sh (auto-installs everything)
# 2. Get public IP
aws ec2 describe-instances --instance-ids <INSTANCE_ID> \
  --query "Reservations[0].Instances[0].PublicIpAddress" --output text

# 3. Start HTTPS tunnel
cloudflared tunnel --url http://<EC2_IP>:3001
```

---

## 🗃️ Scheme Database

| Source | Count |
|--------|-------|
| Curated schemes (local) | 38 |
| myscheme.gov.in (Disha Agent) | 4,651 |

Categories covered: Agriculture, Employment, Health, Housing, Education, Women & Child, Finance, Skill Development, Social Security, Artisan, State Schemes.

---

## 📌 Data Source

All scheme data sourced from **[myscheme.gov.in](https://www.myscheme.gov.in)** — Government of India's official scheme portal.
