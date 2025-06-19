import { IsInt, IsPositive } from 'class-validator';

export class AssignTicketDto {
  @IsInt()
  @IsPositive()
  assignedToId: number;
}
