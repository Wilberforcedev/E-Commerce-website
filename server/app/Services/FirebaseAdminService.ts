import { GoogleAuth } from 'google-auth-library';
import { OAuth2Client } from 'google-auth-library';
import { Request, Response, NextFunction } from 'express';

export interface StoreIdentity {
  uid: string;
  email?: string;
  role: 'customer' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      storeIdentity?: StoreIdentity;
    }
  }
}

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID?.trim();
const DATABASE_ID = process.env.FIREBASE_DATABASE_ID?.trim() || '(default)';
const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';
const ADMIN_EMAIL = (process.env.STORE_ADMIN_EMAIL || 'wilberofficial2001@gmail.com').toLowerCase();

let firestoreAuth: Promise<Awaited<ReturnType<GoogleAuth['getClient']>>> | undefined;
const tokenVerifier = new OAuth2Client();

function requireProjectId(): string {
  if (!PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID must be configured on the server.');
  }
  return PROJECT_ID;
}

function documentsBase(): string {
  return `projects/${requireProjectId()}/databases/${DATABASE_ID}/documents`;
}

async function getFirestoreAuth() {
  if (!firestoreAuth) {
    const rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    let credentials: Record<string, unknown> | undefined;
    if (rawCredentials) {
      try {
        credentials = JSON.parse(rawCredentials);
      } catch {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON.');
      }
    }

    const googleAuth = new GoogleAuth({
      projectId: requireProjectId(),
      credentials: credentials as any,
      scopes: [FIRESTORE_SCOPE],
    });
    firestoreAuth = googleAuth.getClient();
  }
  return firestoreAuth;
}

export async function firestoreRequest<T = any>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH',
  data?: unknown
): Promise<T> {
  const client = await getFirestoreAuth();
  const response = await client.request<T>({
    url: `https://firestore.googleapis.com/v1/${path}`,
    method,
    data,
  });
  return response.data;
}

export function firestoreDocumentPath(collection: string, id: string): string {
  return `${documentsBase()}/${collection}/${encodeURIComponent(id)}`;
}

export function encodeFirestoreValue(value: any): Record<string, unknown> {
  if (value === null) return { nullValue: 'NULL_VALUE' };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(encodeFirestoreValue) } };
  }
  if (typeof value === 'object') {
    const fields: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      if (child !== undefined) fields[key] = encodeFirestoreValue(child);
    }
    return { mapValue: { fields } };
  }
  throw new Error('Unsupported value in Firestore document.');
}

export function decodeFirestoreValue(value: any): any {
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('stringValue' in value) return value.stringValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeFirestoreValue);
  if ('mapValue' in value) return decodeFirestoreFields(value.mapValue.fields || {});
  return null;
}

export function decodeFirestoreFields(fields: Record<string, any> = {}): Record<string, any> {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

export async function verifyFirebaseIdToken(token: string): Promise<StoreIdentity> {
  const ticket = await tokenVerifier.verifyIdToken({ idToken: token, audience: requireProjectId() });
  const payload = ticket.getPayload();
  if (!payload?.sub || payload.firebase?.sign_in_provider === 'anonymous') {
    throw new Error('A valid Firebase user token is required.');
  }

  return {
    uid: payload.sub,
    email: payload.email?.toLowerCase(),
    role: 'customer',
  };
}

async function loadIdentity(token: string): Promise<StoreIdentity> {
  const identity = await verifyFirebaseIdToken(token);
  if (identity.email === ADMIN_EMAIL) return { ...identity, role: 'admin' };

  try {
    const doc = await firestoreRequest<any>(firestoreDocumentPath('users', identity.uid), 'GET');
    const fields = decodeFirestoreFields(doc.fields);
    if (fields.role === 'admin') return { ...identity, role: 'admin' };
  } catch (error: any) {
    if (error?.response?.status !== 404) throw error;
  }
  return identity;
}

function bearerToken(req: Request): string | null {
  const value = req.header('authorization');
  if (!value) return null;
  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  return match?.[1] || null;
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) return next();

  try {
    req.storeIdentity = await loadIdentity(token);
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired sign-in token.' });
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Sign in to continue.' });
  }
  try {
    req.storeIdentity = await loadIdentity(token);
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired sign-in token.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.storeIdentity?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Administrator access is required.' });
  }
  return next();
}

export function firestoreValue(value: any) {
  return encodeFirestoreValue(value);
}

export function firestoreFields(value: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, child]) => child !== undefined)
      .map(([key, child]) => [key, encodeFirestoreValue(child)])
  );
}

export function getProjectDatabasePath(): string {
  return documentsBase();
}
