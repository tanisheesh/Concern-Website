/**
 * Module augmentation for next-auth.
 * Extends the built-in Session and JWT types to include our custom fields
 * (id, role) so TypeScript knows about them everywhere.
 */

import type { AdminRole } from '@/types/admin';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: AdminRole;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: AdminRole;
  }
}
