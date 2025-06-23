import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: jwtSecret,
    });
  }

  // async validate({ id }: { id: string }) {
  //   return this.userService.getById(id);
  async validate(payload: { sub: string; role: string }) {
    // Проверяем, что sub есть
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload: missing sub');
    }
    // Возвращаем объект пользователя, обязательно с id
    return this.userService.getById(payload.sub);
  }
}
