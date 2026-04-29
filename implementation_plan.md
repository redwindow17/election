# AI Election Guide – India — Implementation Plan

## Overview

Build a production-ready full-stack AI-powered application that helps Indian citizens understand the election process. The backend (Express + TypeScript) proxies all AI and Firebase calls securely. The frontend (React + TypeScript + Vite) provides a rich, accessible, and animated UI.

---

## Proposed Changes

### Phase 1 — Backend Core

#### Backend Architecture

```
backend/src/
├── index.ts                    # Server bootstrap
├── app.ts                      # Express app setup (helmet, cors, rate-limit)
├── config/
│   └── environment.ts          # Zod-validated env config
├── middleware/
│   ├── authMiddleware.ts       # Firebase JWT verification
│   ├── errorHandler.ts         # Global error handler
│   └── rateLimiter.ts          # Rate limiting config
├── routes/
│   ├── electionRoutes.ts       # /api/election/*
│   └── healthRoutes.ts         # /api/health
├── controllers/
│   └── electionController.ts   # Request → service → response
├── services/
│   ├── vertexAiService.ts      # Vertex AI (Gemini) integration
│   ├── firebaseAdmin.ts        # Firebase Admin SDK init
│   └── firestoreService.ts     # Firestore read/write helpers
├── validators/
│   └── electionValidators.ts   # Zod schemas for all inputs
├── types/
│   └── index.ts                # Shared TypeScript interfaces
└── utils/
    ├── logger.ts               # Winston logger
    └── promptSanitizer.ts      # Prompt injection protection
```

#### [NEW] `backend/src/config/environment.ts`
- Zod schema to parse & validate all env vars at startup
- Throws descriptive error if any required var is missing

#### [NEW] `backend/src/app.ts`
- Express app with helmet, CORS (whitelist from env), JSON parser
- Mount rate limiter, routes, error handler

#### [NEW] `backend/src/index.ts`
- Load dotenv, validate env, initialize Firebase Admin, start server

#### [NEW] `backend/src/middleware/authMiddleware.ts`
- Extract `Authorization: Bearer <token>` header
- Verify Firebase ID token via `admin.auth().verifyIdToken()`
- Attach decoded user to `req.user`

#### [NEW] `backend/src/middleware/errorHandler.ts`
- Catch-all error handler, log with Winston, return safe JSON response
- Never leak stack traces in production

#### [NEW] `backend/src/middleware/rateLimiter.ts`
- `express-rate-limit` configured from env vars (default 50 req / 15 min per IP)

#### [NEW] `backend/src/services/vertexAiService.ts`
- Initialize Vertex AI SDK with project ID
- `generateElectionGuide(userProfile)` → structured prompt → Gemini 1.5 Pro
- Parse JSON response, validate shape, return typed result
- Prompt engineering: system prompt defines role + output schema; user prompt provides profile

#### [NEW] `backend/src/services/firebaseAdmin.ts`
- Singleton Firebase Admin init with Application Default Credentials

#### [NEW] `backend/src/services/firestoreService.ts`
- `saveConversation(userId, data)` — save AI response to user's subcollection
- `getConversationHistory(userId)` — fetch past conversations
- All queries scoped to authenticated user

#### [NEW] `backend/src/validators/electionValidators.ts`
- Zod schemas: `ElectionQuerySchema` (age: 18-120, state: enum of 28 states + 8 UTs, question: sanitized string max 500 chars)

#### [NEW] `backend/src/utils/promptSanitizer.ts`
- Strip injection patterns (system prompt overrides, role reassignment, ignore-previous-instructions)
- Reject inputs with suspicious patterns

#### [NEW] `backend/src/utils/logger.ts`
- Winston logger: JSON format in production, colorized in dev

#### [NEW] `backend/src/controllers/electionController.ts`
- `POST /api/election/guide` — validate input → sanitize → call Vertex AI → save to Firestore → return JSON
- `GET /api/election/history` — return user's past conversations

#### [NEW] `backend/src/routes/electionRoutes.ts`
- Wire controller methods to routes, all behind `authMiddleware`

#### [NEW] `backend/src/routes/healthRoutes.ts`
- `GET /api/health` — simple health check (no auth required)

---

### Phase 2 — Frontend Core

#### Frontend Architecture

```
frontend/src/
├── main.tsx                    # React entry
├── App.tsx                     # Router + AuthProvider
├── index.css                   # Global styles + design system tokens
├── config/
│   └── firebase.ts             # Firebase client SDK init
├── types/
│   └── index.ts                # Shared types
├── hooks/
│   ├── useAuth.ts              # Auth context hook
│   └── useElectionGuide.ts     # API call hook with caching
├── services/
│   └── apiService.ts           # Axios/fetch wrapper with auth token
├── context/
│   └── AuthContext.tsx          # Firebase auth state provider
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── guide/
│   │   ├── GuideForm.tsx        # User profile input form
│   │   ├── GuideResult.tsx      # AI response display
│   │   └── StepCard.tsx         # Individual election step card
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Spinner.tsx
│       └── ErrorBoundary.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── GuidePage.tsx
│   ├── HistoryPage.tsx
│   └── NotFoundPage.tsx
└── utils/
    └── constants.ts            # Indian states list, etc.
```

#### Design System
- **Colors**: Deep indigo/navy primary (#1e1b4b → #312e81), saffron accent (#f97316), white card surfaces with glassmorphism
- **Typography**: Inter (Google Fonts), fluid scale
- **Dark mode**: CSS custom properties toggled via data attribute
- **Animations**: CSS keyframes for fade-in, slide-up, card entrance; CSS transitions on hover/focus
- **Indian theme**: Tricolor accents (saffron, white, green), Ashoka Chakra–inspired circular loader

#### Key UI Pages

1. **HomePage** — Hero section with animated gradient, CTA to "Get Your Personalized Guide", feature cards with hover effects
2. **GuidePage** — Two-column layout: form (left) + results (right), animated step-by-step cards that appear sequentially
3. **HistoryPage** — Timeline of past AI conversations, expandable cards
4. **Login** — Modal/page with email + OTP sign-in via Firebase Auth

#### Accessibility
- All form inputs have associated `<label>` elements
- ARIA roles on dynamic content (`role="alert"`, `aria-live="polite"`)
- Keyboard navigation for all interactive elements
- Focus management on route changes
- Color contrast ≥ 4.5:1 (WCAG AA)
- Skip-to-content link

---

### Phase 3 — Firebase Integration

#### [NEW] `firestore.rules`
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### [NEW] `firebase.json`
- Hosting config pointing to `frontend/dist`
- Rewrites for SPA routing

---

### Phase 4 — Testing

#### Backend Tests (`tests/backend/`)
- `electionController.test.ts` — Mock Vertex AI + Firestore, test valid/invalid/malicious inputs
- `promptSanitizer.test.ts` — Test injection pattern detection
- `electionValidators.test.ts` — Test Zod schemas with edge cases
- `authMiddleware.test.ts` — Test valid/invalid/missing tokens

#### Frontend Tests (`tests/frontend/`)
- `GuideForm.test.tsx` — Form validation, submission, accessibility
- `LoginForm.test.tsx` — Auth flow
- `apiService.test.ts` — Token attachment, error handling

#### Frontend Jest Config
- `frontend/jest.config.js` — ts-jest + jsdom environment

---

### Phase 5 — CI/CD

#### [NEW] `.github/workflows/ci.yml`
- Node 18 matrix
- Install → Lint → Test (backend + frontend) → Build
- Upload coverage artifacts

---

### Phase 6 — Config & Misc

#### [NEW] `config/` directory
- `config/.env.example` — combined env reference
- Place service account JSON here (gitignored)

#### [NEW] `.gitignore`
- node_modules, dist, .env, coverage, service-account.json

---

## User Review Required

> [!IMPORTANT]
> **Firebase Project**: You need a Firebase project with Auth + Firestore enabled and a Google Cloud project with Vertex AI API enabled. Do you already have these set up, or should I add setup instructions?

> [!IMPORTANT]
> **Auth Method**: The plan uses **email/password + email link (OTP)** authentication. Firebase phone OTP requires a Blaze plan. Which auth methods do you want?

> [!IMPORTANT]
> **Vertex AI Model**: Plan uses `gemini-1.5-pro`. Should I use `gemini-2.0-flash` instead for faster/cheaper responses?

## Open Questions

1. **Deployment target**: Firebase Hosting (static frontend only) or Cloud Run (full backend)? The plan currently assumes Firebase Hosting for frontend + a separate backend server.
2. **Scope for v1**: Should history page be included in v1, or is the core guide sufficient?
3. **Phone OTP**: Do you want Firebase Phone Authentication (requires Blaze plan)?

## Verification Plan

### Automated Tests
```bash
cd backend && npm test      # Jest with coverage
cd frontend && npm test     # Jest + RTL with coverage
```

### Manual Verification
1. Start backend (`npm run dev`) → hit `GET /api/health` → expect `200 OK`
2. Start frontend (`npm run dev`) → verify homepage renders, login works
3. Submit a guide query → verify AI response renders step-by-step
4. Check browser DevTools → no API keys in network requests
5. Verify ARIA labels with axe-core browser extension
6. Run Lighthouse audit → target ≥90 on all categories
