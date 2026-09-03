import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

/* Server-only. These credentials must never reach the browser — note there is
   no NEXT_PUBLIC_ prefix on any of them, which is what keeps them server-side.

   Initialisation is lazy on purpose: doing it at module scope makes `next build`
   fail on any machine without the secrets, which would mean CI and preview
   builds need production keys. Nothing here runs until a request does. */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env.local — see .env.example for how to get it.`,
    );
  }
  return value;
}

let cached: Auth | null = null;

export function getAdminAuth(): Auth {
  if (cached) return cached;

  const app: App = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: required("FIREBASE_PROJECT_ID"),
          clientEmail: required("FIREBASE_CLIENT_EMAIL"),
          // Env files can't hold real newlines, so the key is stored with
          // literal \n sequences and unescaped here.
          privateKey: required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
        }),
      });

  cached = getAuth(app);
  return cached;
}
