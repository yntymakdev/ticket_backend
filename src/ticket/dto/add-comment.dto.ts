import { Role, TicketStatus } from '@prisma/client';

export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export class CommentResponseDto {
  id: number;
  content: string;
  createdAt: Date;
  author: UserResponseDto;
}

export class TicketResponseDto {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: UserResponseDto;
  createdBy: UserResponseDto;
  comments?: CommentResponseDto[];
}
