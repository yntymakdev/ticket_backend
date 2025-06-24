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
  Delete,
  Query,
} from '@nestjs/common';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { Role, TicketStatus, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { TicketsService } from './ticket.service';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { OnlySuperviserGuard } from 'src/auth/guard/admin.guard';
import { CreateTicketDto } from './decorators/ticket-decorator';
import { AddCommentDto } from './dto/add-comment.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

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
  @UseGuards(JwtAuthGuard)
  createTicket(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createTicketDto: CreateTicketDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.ticketsService.createTicket(createTicketDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets')
  // В контроллере
  async getTickets(
    @CurrentUser() user: User,
    @Query('searchQuery') searchQuery?: string,
  ) {
    return this.ticketsService.getTickets(
      user.id,
      user.role as Role,
      searchQuery,
    );
  }

  // Или для более гибкого поиска
  async searchTickets(
    @CurrentUser() user: User,
    @Query('customerName') customerName?: string,
    @Query('status') status?: TicketStatus,
    @Query('title') title?: string,
  ) {
    return this.ticketsService.searchTickets(user.id, user.role, {
      customerName,
      status,
      title,
    });
  }
  @Get('tickets/:id')
  getTicket(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.ticketsService.getTicketById(id, user.id, user.role);
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, OnlySuperviserGuard)
  async assignTicket(
    @Param('id') ticketId: string,
    @Body() assignTicketDto: AssignTicketDto,
    @CurrentUser() user: UserPayload,
  ) {
    console.log(user);
    return this.ticketsService.assign(
      ticketId,
      assignTicketDto.operatorId,
      user.id,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  addComment(
    @Param('id') ticketId: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.ticketsService.addComment(ticketId, dto, user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id/comments')
  getComments(@Param('id') ticketId: string) {
    return this.ticketsService.getComments(ticketId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') ticketId: string,
    @Body() dto: UpdateTicketStatusDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.ticketsService.updateStatus(
      ticketId,
      dto.status,
      user.id,
      user.role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, OnlySuperviserGuard)
  async deleteTicket(
    @Param('id') ticketId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.ticketsService.delete(ticketId, user.id, user.role);
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
