/*
 * Shared frontend tasks:
 * Authentication, Firebase sessions, role claims, and bearer tokens used by all members.
 */
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCEzABDHTQw8VagEz2YMliLgmr5-7WmsAg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'scentify-513806.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'scentify-513806',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'scentify-513806.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '595105589462',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:595105589462:web:826cecc4406b61e63ac177',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

type AuthEvent = 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT';
type Listener = (event: AuthEvent, session: Session | null) => void;

export interface User {
  id: string;
  email?: string;
  user_metadata?: { display_name?: string; full_name?: string };
  app_metadata?: { role?: string };
}

interface Session {
  user: User;
  access_token: string;
}

function mapUser(user: FirebaseUser, claims: Record<string, unknown> = {}): User {
  return {
    id: user.uid,
    email: user.email ?? undefined,
    user_metadata: { display_name: user.displayName ?? undefined, full_name: user.displayName ?? undefined },
    app_metadata: { role: typeof claims.role === 'string' ? claims.role : 'customer' },
  };
}

async function toSession(user: FirebaseUser | null): Promise<Session | null> {
  if (!user) return null;
  const token = await user.getIdTokenResult();
  return { user: mapUser(user, token.claims), access_token: token.token };
}

const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const auth = firebaseApp ? getAuth(firebaseApp) : null;
if (auth) void setPersistence(auth, browserLocalPersistence);

const listeners: Listener[] = [];
let currentSession: Session | null = null;
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    currentSession = await toSession(user);
    for (const listener of listeners) {
      listener(user ? 'SIGNED_IN' : 'SIGNED_OUT', currentSession);
    }
  });
}

function requireAuth() {
  if (!auth) throw new Error('Google Identity Platform is not configured. Add the VITE_FIREBASE_* variables.');
  return auth;
}

async function credentialResult(credential: UserCredential) {
  const session = await toSession(credential.user);
  currentSession = session;
  return { data: { user: session?.user ?? null, session }, error: null };
}

export const firebaseAuth = {
  auth: {
    async getSession() {
      return { data: { session: currentSession }, error: null };
    },
    async getUser() {
      return { data: { user: currentSession?.user ?? null }, error: null };
    },
    onAuthStateChange(callback: Listener) {
      listeners.push(callback);
      void Promise.resolve().then(() => callback('INITIAL_SESSION', currentSession));
      return { data: { subscription: { unsubscribe: () => {
        const index = listeners.indexOf(callback);
        if (index >= 0) listeners.splice(index, 1);
      } } } };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      return credentialResult(await signInWithEmailAndPassword(requireAuth(), email.trim(), password));
    },
    async signUp({ email, password, options }: {
      email: string;
      password: string;
      options?: { data?: { display_name?: string } };
    }) {
      const credential = await createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
      const displayName = options?.data?.display_name?.trim();
      if (displayName) await updateProfile(credential.user, { displayName });
      return credentialResult(credential);
    },
    async signInWithOAuth({ provider }: { provider: string; options?: { redirectTo?: string } }) {
      if (provider !== 'google') throw new Error('Only Google sign-in is supported.');
      return credentialResult(await signInWithPopup(requireAuth(), new GoogleAuthProvider()));
    },
    async signOut() {
      await signOut(requireAuth());
      currentSession = null;
      return { error: null };
    },
    async resetPasswordForEmail(email: string, _options?: { redirectTo?: string }) {
      await sendPasswordResetEmail(requireAuth(), email.trim());
      return { data: {}, error: null };
    },
  },
};

export async function updateShippingAddress(address: Record<string, string>) {
  const { data } = await firebaseAuth.auth.getSession();
  if (!data.session) throw new Error('You must be signed in to save a shipping address.');
  const apiBaseUrl = import.meta.env.VITE_API_URL
    || (import.meta.env.PROD
      ? 'https://scentify-backend-595105589462.asia-southeast1.run.app'
      : 'http://localhost:8080');
  const response = await fetch(`${apiBaseUrl}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session.access_token}`,
    },
    body: JSON.stringify({
      displayName: data.session.user.user_metadata?.display_name || 'Studio Member',
      shippingAddress: address,
    }),
  });
  if (!response.ok) throw new Error((await response.text()) || 'Unable to save shipping address.');
}
