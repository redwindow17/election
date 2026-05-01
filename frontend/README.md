# AI Election Guide Frontend

React + TypeScript + Vite frontend for the AI Election Guide. Firebase services are lazy-loaded so Google OAuth, Analytics, Performance Monitoring, Firestore, and App Check are available without increasing the initial app bundle unnecessarily.

## Scripts

```bash
npm run dev
npm run build
npm test
npm run lint
```

## Google Services

- Firebase Authentication powers email/password and Google OAuth sign-in.
- Firebase Analytics records client workflow events when configured.
- Firebase Performance Monitoring wraps guide-generation timing when configured.
- Firebase App Check adds `X-Firebase-AppCheck` to API calls when a site key is present.
- API calls retain demo-safe behavior when Firebase config is absent.

Configure values in `.env` using `.env.example` as the template.
