// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import { Role } from '@prisma/client';
import { UpdateUserDto } from './decorators/dto/update-user.dto';
import { returnUserObject } from './return-user.object';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  /* Запросы для админа */
  // async getAll(searchTerm?: string) {
  //   if (searchTerm) return this.search(searchTerm);

  //   return this.prisma.user.findMany({
  //     select: returnUserObject,
  //     orderBy: {
  //       createdAt: 'desc',
  //     },
  //   });
  // }
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
      role: dto.role || Role.OPERATOR,
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
      where: { role: Role.OPERATOR },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }
  async findAllByRole(role: Role) {
    return this.prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        email: true,
      },
    });
  }

  async getOperatorById(id: string) {
    const operator = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!operator) {
      throw new NotFoundException(`Оператор с id ${id} не найден`);
    }

    return operator;
  }
  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: dto,
    });
  }
  async delete(id: string) {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
  private async search(searchTerm: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          {
            email: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  }
  // async getAll(searchTerm?: string) {
  //   if (searchTerm) this.search(searchTerm);
  //   return this.prisma.user.findMany({
  //     select:,
  //     orderBy: {
  //       createdAt: 'desc',
  //     },
  //   });
  // }
}
