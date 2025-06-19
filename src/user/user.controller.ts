import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { OnlySuperviserGuard } from 'src/auth/guard/admin.guard';
import { Role } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('profile')
  @Auth()
  async getProfile() {}
  @UseGuards(JwtAuthGuard, OnlySuperviserGuard)
  @Get('operators')
  async getOperators() {
    return this.userService.findAllByRole(Role.OPERATOR);
  }
  @Get('operators/:id')
  @UseGuards(JwtAuthGuard, OnlySuperviserGuard)
  getOperatorById(@Param('id') id: string) {
    return this.userService.getOperatorById(id);
  }
}
