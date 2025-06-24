// src/tickets/tickets.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { PrismaService } from 'src/prisma.service';
import { Role, TicketStatus } from '@prisma/client';
import { CreateTicketDto } from './decorators/ticket-decorator';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async createTicket(createTicketDto: CreateTicketDto, creatorId: string) {
    return this.prisma.ticket.create({
      data: {
        title: createTicketDto.title,
        description: createTicketDto.description,
        customerName: createTicketDto.customerName,
        status: createTicketDto.status ?? TicketStatus.OPEN,
        createdById: creatorId,
        // Создание тикета + сразу добавляем назначение
        assignments: {
          create: {
            assignedToId: creatorId,
            assignedById: creatorId, // если сам себя назначил
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        assignments: {
          select: {
            id: true,
            assignedTo: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
            assignedBy: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
            createdAt: true,
          },
        },
      },
    });
  }
  async getTickets(userId: string, userRole: Role, searchQuery?: string) {
    const filters: any[] = [];

    if (userRole !== Role.SUPERVISOR) {
      filters.push({
        OR: [
          { createdById: userId },
          {
            assignments: {
              some: {
                assignedToId: userId,
              },
            },
          },
        ],
      });
    }

    if (searchQuery) {
      filters.push({
        customerName: {
          contains: searchQuery,
          mode: 'insensitive' as const,
        },
      });
    }

    return this.prisma.ticket.findMany({
      where: filters.length ? { AND: filters } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        customerName: true,
        createdAt: true,
      },
    });
  }

  //? Альтернативный метод для более гибкого поиска
  async searchTickets(
    userId: string,
    userRole: Role,
    filters: {
      customerName?: string;
      status?: TicketStatus;
      title?: string;
    } = {},
  ) {
    // Базовые условия фильтрации по роли
    const roleConditions =
      userRole === Role.SUPERVISOR
        ? {}
        : {
            OR: [
              { createdById: userId },
              {
                assignments: {
                  some: {
                    assignedToId: userId,
                  },
                },
              },
            ],
          };

    // Условия поиска
    const searchConditions: Record<string, any>[] = [];

    if (filters.customerName) {
      searchConditions.push({
        customerName: {
          contains: filters.customerName,
          mode: 'insensitive' as const,
        },
      });
    }

    if (filters.title) {
      searchConditions.push({
        title: {
          contains: filters.title,
          mode: 'insensitive' as const,
        },
      });
    }

    if (filters.status) {
      searchConditions.push({
        status: filters.status,
      });
    }

    // Объединяем все условия
    const whereCondition = {
      AND: [
        roleConditions,
        ...(searchConditions.length > 0 ? searchConditions : [{}]),
      ].filter((condition) => Object.keys(condition).length > 0),
    };

    return this.prisma.ticket.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        customerName: true,
        createdAt: true,
        createdBy: {
          select: {
            email: true,
          },
        },
        assignments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            assignedTo: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async getTicketById(ticketId: string, userId: string, userRole: Role) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        assignments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            assignedTo: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Тикет не найден');
    }

    // 🔒 Проверка доступа для оператора
    if (userRole === Role.OPERATOR) {
      const isCreator = ticket.createdBy.id === userId;
      const isAssigned = ticket.assignments?.[0]?.assignedTo?.id === userId;

      if (!isCreator && !isAssigned) {
        throw new ForbiddenException('Недостаточно прав для просмотра тикета');
      }
    }

    return ticket;
  }

  async addComment(
    ticketId: string,
    addCommentDto: AddCommentDto,
    userId: string,
  ) {
    return this.prisma.comment.create({
      data: {
        message: addCommentDto.message,
        ticketId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getComments(ticketId: string) {
    return this.prisma.comment.findMany({
      where: { ticketId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async updateStatus(
    ticketId: string,
    newStatus: string,
    userId: string,
    userRole: Role,
  ) {
    if (!Object.values(TicketStatus).includes(newStatus as TicketStatus)) {
      throw new BadRequestException(`Недопустимый статус: ${newStatus}`);
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException('Тикет не найден');
    }

    if (userRole === Role.OPERATOR && ticket.createdById !== userId) {
      throw new ForbiddenException('Нет доступа к изменению этого тикета');
    }

    const oldStatus = ticket.status;

    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: newStatus as TicketStatus },
    });

    return updatedTicket;
  }

  async assign(ticketId: string, newOperatorId: string, supervisorId: string) {
    const operator = await this.prisma.user.findUnique({
      where: { id: newOperatorId },
    });
    if (!operator || operator.role !== Role.OPERATOR) {
      throw new NotFoundException('Оператор не найден или некорректная роль');
    }
    return this.prisma.assignment.create({
      data: {
        ticketId,
        assignedToId: newOperatorId,
        assignedById: supervisorId,
      },
      include: {
        assignedTo: true,
        assignedBy: true,
        ticket: true,
      },
    });
  }

  async delete(ticketId: string, userId: string, userRole: Role) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException('Тикет не найден');
    }

    if (userRole !== Role.SUPERVISOR) {
      throw new ForbiddenException('Нет доступа на удаление тикета');
    }

    await this.prisma.assignment.deleteMany({
      where: { ticketId },
    });

    await this.prisma.comment.deleteMany({
      where: { ticketId },
    });

    await this.prisma.ticket.delete({ where: { id: ticketId } });

    return { message: 'Тикет успешно удалён' };
  }
  async deleteComment(commentId: string, userId: string, userRole: Role) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    if (userRole === Role.OPERATOR && comment.userId !== userId) {
      throw new ForbiddenException('Нет доступа к удалению этого комментария');
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return { message: 'Комментарий удалён' };
  }
}
