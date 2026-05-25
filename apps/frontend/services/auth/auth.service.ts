import { requestApi } from '../api/client';

export interface AuthUser {
  id: string;
  name?: string | null;
  email: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface SavedLocationRecord {
  id: string;
  label?: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface PasswordRecoveryResponse {
  message: string;
}

const AUTH_STORAGE_KEY = 'cityline:auth:v1';

const canUseBrowserStorage = () => typeof window !== 'undefined';

export function loadStoredAuthSession(): AuthSession | null {
  if (!canUseBrowserStorage()) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? (JSON.parse(rawValue) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAuthHeaders(token?: string): HeadersInit {
  const storedToken = loadStoredAuthSession()?.token;
  const authToken = token ?? storedToken;

  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

export async function registerWithEmail(input: { name?: string; email: string; password: string; phone?: string }) {
  const session = await requestApi<AuthSession>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    { revalidate: 0 }
  );

  saveAuthSession(session);
  return session;
}

export async function loginWithEmail(input: { email: string; password: string }) {
  const session = await requestApi<AuthSession>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    { revalidate: 0 }
  );

  saveAuthSession(session);
  return session;
}

export async function fetchCurrentUser(token?: string) {
  return requestApi<AuthUser>(
    '/auth/me',
    {
      headers: {
        ...getAuthHeaders(token),
      },
    },
    { revalidate: 0 }
  );
}

export async function saveUserLocation(input: { latitude: number; longitude: number; label?: string; token?: string }) {
  return requestApi<SavedLocationRecord>(
    '/auth/locations',
    {
      method: 'POST',
      headers: {
        ...getAuthHeaders(input.token),
      },
      body: JSON.stringify({
        latitude: input.latitude,
        longitude: input.longitude,
        label: input.label,
      }),
    },
    { revalidate: 0 }
  );
}

export async function listSavedLocations(token?: string) {
  return requestApi<SavedLocationRecord[]>(
    '/auth/locations',
    {
      headers: {
        ...getAuthHeaders(token),
      },
    },
    { revalidate: 0 }
  );
}

export async function requestPasswordRecovery(input: { email: string }) {
  return requestApi<PasswordRecoveryResponse>(
    '/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    { revalidate: 0 }
  );
}

export async function resetPassword(input: { token: string; newPassword: string }) {
  return requestApi<PasswordRecoveryResponse>(
    '/auth/reset-password',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    { revalidate: 0 }
  );
}
