import { User } from '@prisma/client';

export type SafeUser = Omit<User, 'passwordHash'>;

export function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}