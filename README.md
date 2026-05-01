# AI Election Guide - India

A production-ready full-stack civic guidance app for Indian voters. The app combines a React/Vite frontend, an Express/TypeScript backend, Firebase Auth, Firestore, Vertex AI, Cloud Storage exports, BigQuery analytics, Firebase Hosting, Firebase App Check, Firebase Analytics, Performance Monitoring, and Firebase Cloud Functions.

## Google Services

| Workflow | Google service |
| --- | --- |
| Google sign-in and protected sessions | Firebase Authentication |
| User guide history and feedback | Cloud Firestore |
| Personalized election guidance | Vertex AI with Gemini |
| Private guide export files | Cloud Storage signed URLs |
| Sanitized usage metrics | BigQuery |
| Conversation analytics and daily rollups | Firebase Cloud Functions |
| Static frontend deployment | Firebase Hosting |
| Client analytics and load/performance traces | Firebase Analytics + Performance Monitoring |
| API abuse hardening | Firebase App Check |

The app is demo-safe: if Google credentials are not configured, it falls back to local demo auth, in-memory history, inline JSON exports, and demo analytics counts.

## Project Structure

```text
election/
  backend/      Express + TypeScript API
  frontend/     React + TypeScript + Vite SPA
  functions/    Firebase Cloud Functions analytics workers
  firebase.json Root Firebase Hosting/Firestore/Functions config
```

## Backend Setup

```bash
cd backend
npm install
npm run build
npm test
npm run dev
```

Important backend environment variables are documented in `backend/.env.example`, including optional `GCS_EXPORT_BUCKET`, `BIGQUERY_DATASET`, `BIGQUERY_EVENTS_TABLE`, `BIGQUERY_ROLLUPS_TABLE`, `GCS_SIGNED_URL_TTL_MINUTES`, `ANALYTICS_SALT`, and `FIREBASE_APPCHECK_REQUIRED`.

## Frontend Setup

```bash
cd frontend
npm install
npm run build
npm test
npm run dev
```

Frontend Firebase variables are documented in `frontend/.env.example`, including the App Check site key, Storage bucket, and Analytics measurement ID.

## API Highlights

- `POST /api/election/guide` generates a Vertex AI guide, saves it to Firestore or demo memory, and records sanitized telemetry.
- `GET /api/election/history` returns user-scoped guide history.
- `POST /api/election/conversations/:id/export` exports a guide to Cloud Storage or returns an inline demo export.
- `POST /api/election/conversations/:id/feedback` saves per-guide feedback and records sanitized analytics.
- `GET /api/election/insights` returns aggregate counts from BigQuery, Firestore, or demo memory.
- `GET /api/health/google-services` reports enabled/demo status without exposing secrets.

## Deployment

Build the frontend before deploying Firebase Hosting:

```bash
cd frontend
npm run build
cd ..
firebase deploy
```

Deploy Functions after installing function dependencies:

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```
