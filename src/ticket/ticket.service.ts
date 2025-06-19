// src/tickets/tickets.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { PrismaService } from 'src/prisma.service';
import { Role, TicketStatus } from '@prisma/client';
import { CreateTicketDto } from './decorators/ticket-decorator';

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
  async getTickets(userId: string, userRole: Role) {
    if (userRole === Role.SUPERVISOR) {
      // Супервайзер видит все тикеты без ограничений
      return this.prisma.ticket.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          customerName: true,
          createdAt: true,
        },
      });
    } else {
      // Оператор видит только свои тикеты (созданные им или назначенные)
      return this.prisma.ticket.findMany({
        where: {
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
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          customerName: true,
          createdAt: true,
          // Можно убрать или оставить комментарии, если надо
        },
      });
    }
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
          take: 1, // последняя активная назначение
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

  //   async updateTicketStatus(
  //     id: number,
  //     updateStatusDto: UpdateTicketStatusDto,
  //     userId: number,
  //     userRole: UserRole,
  //   ) {
  //     const ticket = await this.getTicketById(id, userId, userRole);

  //     // Оператор может менять статус только своих тикетов
  //     if (userRole === UserRole.OPERATOR) {
  //       const hasAccess =
  //         ticket.assignedToId === userId || ticket.createdById === userId;
  //       if (!hasAccess) {
  //         throw new ForbiddenException('Недостаточно прав для изменения тикета');
  //       }
  //     }

  //     return this.prisma.ticket.update({
  //       where: { id },
  //       data: updateStatusDto,
  //       include: {
  //         assignedTo: {
  //           select: {
  //             id: true,
  //             email: true,
  //             name: true,
  //             role: true,
  //           },
  //         },
  //         createdBy: {
  //           select: {
  //             id: true,
  //             email: true,
  //             name: true,
  //             role: true,
  //           },
  //         },
  //       },
  //     });
  //   }

  //   async assignTicket(id: number, assignTicketDto: AssignTicketDto) {
  //     const assignee = await this.prisma.user.findUnique({
  //       where: { id: assignTicketDto.assignedToId },
  //     });

  //     if (!assignee) {
  //       throw new NotFoundException('Пользователь не найден');
  //     }

  //     const ticket = await this.prisma.ticket.findUnique({ where: { id } });
  //     if (!ticket) {
  //       throw new NotFoundException('Тикет не найден');
  //     }

  //     return this.prisma.ticket.update({
  //       where: { id },
  //       data: { assignedToId: assignTicketDto.assignedToId },
  //       include: {
  //         assignedTo: {
  //           select: {
  //             id: true,
  //             email: true,
  //             name: true,
  //             role: true,
  //           },
  //         },
  //         createdBy: {
  //           select: {
  //             id: true,
  //             email: true,
  //             name: true,
  //             role: true,
  //           },
  //         },
  //       },
  //     });
  //   }

  //   async addComment(
  //     ticketId: number,
  //     addCommentDto: AddCommentDto,
  //     userId: number,
  //     userRole: UserRole,
  //   ) {
  //     // Проверяем доступ к тикету
  //     await this.getTicketById(ticketId, userId, userRole);

  //     return this.prisma.comment.create({
  //       data: {
  //         content: addCommentDto.content,
  //         ticketId,
  //         authorId: userId,
  //       },
  //       include: {
  //         author: {
  //           select: {
  //             id: true,
  //             email: true,
  //             name: true,
  //             role: true,
  //           },
  //         },
  //       },
  //     });
  //   }

  // async getOperators() {
  //   return this.prisma.user.findMany({
  //     where: {
  //       role: Role.OPERATOR,
  //     },
  //     select: {
  //       id: true,
  //       email: true,
  //       role: true,
  //     },
  //   });
  // }
}
