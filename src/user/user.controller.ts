import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { OnlySuperviserGuard } from 'src/auth/guard/admin.guard';
import { Role } from '@prisma/client';
import { UpdateUserDto } from './decorators/dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('profile')
  @Auth()
  async getProfile() {}
  // @UseGuards(JwtAuthGuard, OnlySuperviserGuard)
  // @Get()
  // @Auth('supervisor')
  // async getAll(@Query('searchterm') searchTerm?: string) {
  //   return this.userService.getAll(searchTerm);
  // }
  @Get('by-id/:id')
  @Auth('supervisor')
  async getById(@Param('id') id: string) {
    return this.userService.getById(id);
  }
  @UsePipes(new ValidationPipe())
  @Put(':id')
  @HttpCode(200)
  @Auth('supervisor')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const updateUser = await this.userService.update(id, dto);
    if (!updateUser) throw new NotFoundException('Пользователь не найден');
    return updateUser;
  }
  @UsePipes(new ValidationPipe())
  @Delete(':id')
  @Auth('supervisor')
  async delete(@Param('id') id: string) {
    const deletedUser = await this.userService.delete(id);
    if (!deletedUser) throw new NotFoundException('Пользователь не найден');
    return deletedUser;
  }
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
