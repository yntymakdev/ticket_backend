import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { Observable } from 'rxjs';

@Injectable()
export class OnlySuperviserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;
    if (user.role !== Role.SUPERVISOR)
      throw new ForbiddenException(
        'У вас недостаточно прав для выполнения этой операции',
      );
    return true;
  }
}
