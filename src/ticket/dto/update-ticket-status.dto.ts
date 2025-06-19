import { IsEnum } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus, { message: 'Недопустимый статус' })
  status: TicketStatus;
}
