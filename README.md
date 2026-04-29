# 🇮🇳 AI Election Guide – India

A production-ready, full-stack AI-powered web application that helps Indian citizens understand the election process with personalized guidance powered by Google Vertex AI (Gemini).

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| AI | Google Vertex AI (Gemini 1.5 Pro) |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |
| Validation | Zod |
| Security | Helmet, Rate-limiting, CORS |
| Testing | Jest + React Testing Library |

---

## 📁 Project Structure

```
election/
├── frontend/          # React + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── ...
├── backend/           # Express + TypeScript API
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validators/
│   └── ...
├── config/            # Environment configs
├── tests/             # Unit + integration tests
└── .github/workflows/ # CI/CD pipeline
```

---

## ⚙️ Setup

### Prerequisites
- Node.js 18+
- Firebase project with Firestore + Auth enabled
- Google Cloud project with Vertex AI enabled

### Environment Variables

**Backend (`backend/.env`):**
```
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
FIREBASE_PROJECT_ID=your-firebase-project-id
PORT=4000
ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```
VITE_API_BASE_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

### Installation

```bash
# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install

# Start backend (dev)
cd ../backend && npm run dev

# Start frontend (dev)
cd ../frontend && npm run dev
```

---

## 🔒 Security Features

- ✅ All API keys server-side only
- ✅ Helmet.js security headers
- ✅ Rate limiting (50 req/15min per IP)
- ✅ Zod input validation
- ✅ Prompt injection sanitization
- ✅ Firebase Auth JWT verification
- ✅ Firestore per-user rules
- ✅ CORS whitelist

---

## 🧪 Testing

```bash
cd backend && npm test
cd frontend && npm test
```

---

## 🚢 Deploy

```bash
cd frontend && npm run build
firebase deploy
```
