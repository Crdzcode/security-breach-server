import type { User } from '../types';
import { USERS, USERS_MAP } from './users';

export type FindUserResult =
  | { user: User; error: null }
  | { user: null; error: 'not_found' | 'wrong_password' };

export function findUser(codename: string, password: string): FindUserResult {
  const user = USERS_MAP.get(codename.toLowerCase());
  if (!user) return { user: null, error: 'not_found' };
  if (user.password !== password) return { user: null, error: 'wrong_password' };
  return { user, error: null };
}

export function availableLogins(): string[] {
  return USERS.filter((u) => u.role === 'player').map((u) => u.codename);
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}
