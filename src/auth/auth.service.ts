import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundError } from 'rxjs';
import { verify } from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwt: JwtService,
  ) {}
  async register(dto: AuthDto) {
    const oldUser = await this.userService.getByEmail(dto.email);
    if (oldUser) throw new BadRequestException('Пользователь уже существует');
    const user = await this.userService.create(dto);
    const tokens = this.issueTokens(user);
    return {
      user,
      ...tokens,
    };
  }
  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);
    const tokens = this.issueTokens(user);
    return {
      user,
      ...tokens,
    };
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verify(refreshToken);
    if (!result || !result.id) {
      throw new UnauthorizedException('Невалидный refresh токен');
    }

    const user = await this.userService.getById(result.id);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const tokens = this.issueTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  // private issueTokens(userId: string) {
  //   const data = { id: userId };
  //   const accessToken = this.jwt.sign(data, {
  //     expiresIn: '1h',
  //   });
  //   const refreshToken = this.jwt.sign(data, {
  //     expiresIn: '7d',
  //   });
  //   return { accessToken, refreshToken };
  // }
  private issueTokens(user: { id: string; role: string }) {
    const payload = {
      sub: user.id, // стандартное поле для id
      role: user.role, // добавляем роль в payload
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: '1h',
    });
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.userService.getByEmail(dto.email);

    if (!user) throw new NotFoundException('Пользователь не найден');

    if (!user.password)
      throw new UnauthorizedException('Пароль пользователя отсутствует');
    const isValidPassword = await verify(user.password, dto.password);

    if (!isValidPassword) throw new UnauthorizedException('Неверный пароль');

    return user;
  }
}
