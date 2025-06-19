import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guard/jwt.guard';
import { OnlySuperviserGuard } from '../guard/admin.guard';
import { TypeRole } from '../auth.interface';

export function Auth(role: TypeRole = 'operator') {
  return applyDecorators(
    role === 'supervisor'
      ? UseGuards(JwtAuthGuard, OnlySuperviserGuard)
      : UseGuards(JwtAuthGuard),
  );
}
