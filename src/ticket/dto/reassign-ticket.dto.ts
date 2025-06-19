import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReassignTicketDto {
  @ApiProperty({ description: 'ID оператора для назначения' })
  @IsNumber()
  @IsPositive()
  operatorId: number;
}
