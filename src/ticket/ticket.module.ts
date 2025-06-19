import { Module } from '@nestjs/common';
import { TicketsService } from './ticket.service';
import { TicketsController } from './ticket.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, PrismaService],
})
export class TicketModule {}
