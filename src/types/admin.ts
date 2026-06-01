export type AdminRole = 'super_admin' | 'staff';

export interface AdminSessionUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}
