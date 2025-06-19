import { Prisma } from '@prisma/client';

export const returnUserObject: Prisma.UserSelect = {
  id: true,
  email: true,
  role: true,
  password: true,
};
