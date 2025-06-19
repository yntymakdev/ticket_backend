// assign-ticket.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignTicketDto {
  @IsString()
  @IsNotEmpty()
  operatorId: string; // ID оператора, на кого назначаем тикет
}
