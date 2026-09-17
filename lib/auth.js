import crypto from 'crypto';
import { kv } from '@vercel/kv';

const AUTH_KEY = 'admin_auth';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPasswordHash(password, stored) {
  if (!stored || !password) return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, 'hex');
  const testHash = crypto.scryptSync(password, salt, 64);
  if (testHash.length !== hashBuffer.length) return false;
  return crypto.timingSafeEqual(testHash, hashBuffer);
}

export async function getStoredAuth() {
  return (await kv.get(AUTH_KEY)) || null;
}

export async function setStoredAuth(password) {
  await kv.set(AUTH_KEY, hashPassword(password));
}

export async function checkAdminHeader(req) {
  const password = req.headers['x-admin-password'];
  if (!password) return false;
  const stored = await getStoredAuth();
  if (!stored) return false;
  return verifyPasswordHash(password, stored);
}
