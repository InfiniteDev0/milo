import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  inMemoryPersistence,
  signOut as firebaseSignOut,
  type ActionCodeSettings,
  type User,
} from "firebase/auth";

import { auth } from "./firebase";

const PENDING_EMAIL_KEY = "milo:pending-signin-email";

/** Thrown when the sign-in link is opened on a device that never requested it,
 *  so the UI can ask for the address with a real form instead of a prompt(). */
export class EmailNeededError extends Error {
  constructor() {
    super("Confirm the email this link was sent to");
    this.name = "EmailNeededError";
  }
}

/**
 * The httpOnly session cookie is the durable credential, so the client SDK
 * keeps nothing on disk. A token sitting in IndexedDB is one more thing an XSS
 * bug could walk off with.
 */
async function ephemeral() {
  await setPersistence(auth, inMemoryPersistence);
}

/** Trade a fresh sign-in for the server session cookie. Until this resolves,
 *  the user is signed in to the browser but not to Milo. */
async function startSession(user: User) {
  const idToken = await user.getIdToken(/* forceRefresh */ true);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    await firebaseSignOut(auth);
    throw new Error("Could not start your session. Please try again.");
  }
  return user;
}

function actionCodeSettings(): ActionCodeSettings {
  // Same-origin only. Never build this from a query parameter — a redirect
  // target taken from the URL is how open-redirect bugs get in.
  return { url: `${window.location.origin}/auth`, handleCodeInApp: true };
}

export async function sendLoginLink(email: string) {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings());
  window.localStorage.setItem(PENDING_EMAIL_KEY, email);
}

export function isLoginLink(url: string) {
  return isSignInWithEmailLink(auth, url);
}

export async function completeLoginLink(url: string, emailFallback?: string) {
  const email = window.localStorage.getItem(PENDING_EMAIL_KEY) ?? emailFallback;
  if (!email) throw new EmailNeededError();

  await ephemeral();
  const { user } = await signInWithEmailLink(auth, email, url);
  window.localStorage.removeItem(PENDING_EMAIL_KEY);
  return startSession(user);
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  await ephemeral();
  const { user } = await signInWithPopup(auth, googleProvider);
  return startSession(user);
}

export async function signOut() {
  // Server first: it revokes refresh tokens, which kills every other session
  // for this account, not just this browser.
  await fetch("/api/auth/session", { method: "DELETE" });
  await firebaseSignOut(auth);
}
