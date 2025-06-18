// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        tickets: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        assigned: {
          include: {
            ticket: {
              select: {
                id: true,
                title: true,
                status: true,
                customerName: true,
              },
            },
          },
        },
      },
    });
  }

  async getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
      },
    });
  }

  async create(dto: AuthDto) {
    const user = {
      email: dto.email,
      password: await hash(dto.password),
      role: dto.role || Role.operator,
    };

    return this.prisma.user.create({
      data: user,
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }

  async getOperators() {
    return this.prisma.user.findMany({
      where: { role: Role.operator },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }
}
