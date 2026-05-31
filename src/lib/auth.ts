/**
 * Auth.js v5 (next-auth@beta) configuration.
 *
 * Uses the Credentials provider with email + bcrypt password verification
 * against the SQLite `admin_users` table.
 *
 * Exports:
 *   handlers  — GET/POST route handlers for /api/auth/[...nextauth]
 *   auth      — universal session accessor (server components, API routes, proxy)
 *   signIn    — programmatic sign-in
 *   signOut   — programmatic sign-out
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import type { AdminUser, AdminSessionUser } from '@/types/admin';

// ---------------------------------------------------------------------------
// Input validation schema
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

// ---------------------------------------------------------------------------
// User lookup
// ---------------------------------------------------------------------------

function getUserByEmail(email: string): AdminUser | null {
  try {
    const db = getDb();
    const row = db
      .prepare(
        `SELECT id, name, email, password_hash, role, created_at, updated_at
         FROM admin_users
         WHERE email = ? COLLATE NOCASE
         LIMIT 1`
      )
      .get(email.toLowerCase().trim()) as
      | {
          id: number;
          name: string;
          email: string;
          password_hash: string;
          role: string;
          created_at: string;
          updated_at: string | null;
        }
      | undefined;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role as AdminUser['role'],
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? undefined,
    };
  } catch (error) {
    console.error('[auth] getUserByEmail error:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// NextAuth configuration
// ---------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { type: 'email', label: 'Email' },
        password: { type: 'password', label: 'Password' },
      },

      async authorize(credentials) {
        // 1. Validate input shape
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. Look up user in SQLite
        const user = getUserByEmail(email);
        if (!user) return null;

        // 3. Verify password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        // 4. Return safe user object (no passwordHash)
        const sessionUser: AdminSessionUser = {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };

        return sessionUser;
      },
    }),
  ],

  // ---------------------------------------------------------------------------
  // Custom pages — we build our own login UI
  // ---------------------------------------------------------------------------
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  // ---------------------------------------------------------------------------
  // Callbacks — persist role in JWT and session
  // ---------------------------------------------------------------------------
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on initial sign-in
      if (user) {
        const adminUser = user as AdminSessionUser;
        token.id = adminUser.id;
        token.role = adminUser.role;
        token.name = adminUser.name;
        token.email = adminUser.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as AdminSessionUser).role =
          token.role as AdminSessionUser['role'];
      }
      return session;
    },
  },

  // ---------------------------------------------------------------------------
  // Session strategy — JWT (no database adapter needed for sessions)
  // ---------------------------------------------------------------------------
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },

  // ---------------------------------------------------------------------------
  // Security
  // ---------------------------------------------------------------------------
  secret: process.env.NEXTAUTH_SECRET,

  // Prevent CSRF issues on Firebase App Hosting / Cloud Run
  trustHost: true,
});
