import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { Observable } from 'rxjs';

@Injectable()
export class OnlyAdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;
    if (user.role !== Role.supervisor)
      throw new ForbiddenException(
        'У вас недостаточно прав для выполнения этой операции',
      );
    return true;
  }
}
