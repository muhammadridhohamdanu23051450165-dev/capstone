import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db, User } from './db';

const SESSION_COOKIE_NAME = 'spk_session';

export interface AuthSession {
  userId: number;
  name: string;
  email: string;
  role: string;
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  try {
    const cleanToken = decodeURIComponent(sessionToken);
    const raw = Buffer.from(cleanToken, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed?.userId) return null;

    // Verify user exists in db
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(parsed.userId) as
      | { id: number; name: string; email: string; role: string }
      | undefined;

    if (!user) return null;

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export async function setSession(user: { id: number; name: string; email: string; role: string }) {
  const cookieStore = await cookies();
  const payload = JSON.stringify({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    time: Date.now(),
  });
  const token = Buffer.from(payload, 'utf-8').toString('base64');

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hashed: string): boolean {
  // Laravel bcrypt uses $2y$ prefix, bcryptjs supports it by converting to $2a$
  const normalizedHash = hashed.replace(/^\$2y\$/, '$2a$');
  return bcrypt.compareSync(plain, normalizedHash);
}
