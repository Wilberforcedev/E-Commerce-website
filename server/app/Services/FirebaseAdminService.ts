import { GoogleAuth } from 'google-auth-library';
import { createVerify } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export interface StoreIdentity {
  uid: string;
  email?: string;
  emailVerified: boolean;
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
const ADMIN_EMAIL = 'wilberofficial2001@gmail.com';

let firestoreAuth: Promise<Awaited<ReturnType<GoogleAuth['getClient']>>> | undefined;
let signingCerts: { keys: Record<string, string>; expiresAt: number } | undefined;

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
    timeout: 10_000,
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

async function getFirebaseSigningCerts(forceRefresh = false): Promise<Record<string, string>> {
  if (!forceRefresh && signingCerts && signingCerts.expiresAt > Date.now()) return signingCerts.keys;
  const response = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
    { signal: AbortSignal.timeout(5000) }
  );
  if (!response.ok) throw new Error('Could not verify Firebase sign-in token.');
  const keys = await response.json() as Record<string, string>;
  const maxAge = Number(/max-age=(\d+)/i.exec(response.headers.get('cache-control') || '')?.[1] || 300);
  signingCerts = { keys, expiresAt: Date.now() + Math.max(60, maxAge) * 1000 };
  return keys;
}

function decodeTokenPart(part: string): any {
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
}

export async function verifyFirebaseIdToken(token: string): Promise<StoreIdentity> {
  const segments = token.split('.');
  if (segments.length !== 3) throw new Error('Malformed Firebase token.');
  const header = decodeTokenPart(segments[0]);
  const claims = decodeTokenPart(segments[1]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error('Unsupported Firebase token.');
  const now = Math.floor(Date.now() / 1000);
  const projectId = requireProjectId();
  const validClaims =
    claims.aud === projectId &&
    claims.iss === `https://securetoken.google.com/${projectId}` &&
    typeof claims.sub === 'string' && claims.sub.length > 0 && claims.sub.length <= 128 &&
    typeof claims.exp === 'number' && claims.exp > now &&
    typeof claims.iat === 'number' && claims.iat <= now + 300 &&
    typeof claims.auth_time === 'number' && claims.auth_time <= now;
  if (!validClaims) throw new Error('Invalid or expired Firebase token claims.');

  let certs = await getFirebaseSigningCerts();
  let certificate = Object.prototype.hasOwnProperty.call(certs, header.kid) ? certs[header.kid] : undefined;
  if (!certificate) {
    certs = await getFirebaseSigningCerts(true);
    certificate = Object.prototype.hasOwnProperty.call(certs, header.kid) ? certs[header.kid] : undefined;
  }
  if (!certificate) throw new Error('Unknown Firebase token signing key.');
  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${segments[0]}.${segments[1]}`);
  verifier.end();
  if (!verifier.verify(certificate, Buffer.from(segments[2], 'base64url'))) {
    throw new Error('Invalid Firebase token signature.');
  }

  return {
    uid: claims.sub,
    email: typeof claims.email === 'string' ? claims.email.toLowerCase() : undefined,
    emailVerified: claims.email_verified === true,
    role: 'customer',
  };
}

async function loadIdentity(token: string): Promise<StoreIdentity> {
  const identity = await verifyFirebaseIdToken(token);
  // The root admin is identified by email, so only trust it once the address is verified.
  // Otherwise anyone who signs up with that unverified address would become an admin.
  if (identity.emailVerified && identity.email === ADMIN_EMAIL) {
    return { ...identity, role: 'admin' };
  }

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
