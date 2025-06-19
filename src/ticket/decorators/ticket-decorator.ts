import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'Имя клиента обязательно для заполнения' })
  @MaxLength(100)
  customerName: string;

  @IsString()
  @IsNotEmpty({ message: 'Тема тикета обязательна' })
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Описание проблемы обязательно' })
  description: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
