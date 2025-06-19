// src/tickets/tickets.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { TicketsService } from './ticket.service';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { OnlySuperviserGuard } from 'src/auth/guard/admin.guard';
import { CreateTicketDto } from './decorators/ticket-decorator';

interface UserPayload {
  id: string;
  email: string;
  role: Role;
}

@Controller('ticket')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}
  @Post('create')
  createTicket(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createTicketDto: CreateTicketDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.ticketsService.createTicket(createTicketDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets')
  getTickets(@CurrentUser() user: UserPayload) {
    return this.ticketsService.getTickets(user.id, user.role);
  }

  @Get('tickets/:id')
  getTicket(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.ticketsService.getTicketById(id, user.id, user.role);
  }

  @UseGuards(JwtAuthGuard, OnlySuperviserGuard) // защита — только авторизованный супервайзер
  @Patch(':id/assign')
  async assignTicket(
    @Param('id') ticketId: string,
    @Body() assignTicketDto: AssignTicketDto,
  ) {
    return this.ticketsService.assign(ticketId, assignTicketDto.operatorId);
  }
  // @Patch(':id/status')
  // @Roles(UserRole.OPERATOR, UserRole.SUPERVISOR)
  // updateTicketStatus(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateStatusDto: UpdateTicketStatusDto,
  //   @CurrentUser() user: UserPayload,
  // ) {
  //   return this.ticketsService.updateTicketStatus(
  //     id,
  //     updateStatusDto,
  //     user.id,
  //     user.role,
  //   );
  // }
  // @UseGuards(JwtAuthGuard, OnlySuperviserGuard)
  // @Patch(':id/assign')
  // assignTicket(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() assignTicketDto: AssignTicketDto,
  // ) {
  //   return this.ticketsService.assignTicket(id, assignTicketDto);
  // }

  // @Post(':id/comments')
  // @Roles(UserRole.OPERATOR, UserRole.SUPERVISOR)
  // addComment(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() addCommentDto: AddCommentDto,
  //   @CurrentUser() user: UserPayload,
  // ) {
  //   return this.ticketsService.addComment(
  //     id,
  //     addCommentDto,
  //     user.id,
  //     user.role,
  //   );
}

// @UseGuards(JwtAuthGuard, OnlySuperviserGuard)
// @Patch(':id/assign')
// async assignTicket(
//   @Param('id') ticketId: string,
//   @Body('operatorId') newOperatorId: string,
// ) {
//   return this.ticketsService.assignTicket(ticketId, newOperatorId);
// }
