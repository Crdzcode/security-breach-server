import type { User } from '../types';
import { USERS_MAP } from './users';

export function findUser(codename: string, password: string): User | null {
  const user = USERS_MAP.get(codename.toLowerCase());
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}
