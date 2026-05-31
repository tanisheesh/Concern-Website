/**
 * Auth.js v5 route handler.
 * Handles all /api/auth/* requests (sign-in, sign-out, session, CSRF, etc.)
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
