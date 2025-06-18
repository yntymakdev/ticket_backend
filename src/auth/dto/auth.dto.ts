import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthDto {
  @ApiPropertyOptional({
    description: 'Optional name of the user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password with at least 6 characters',
    example: 'securePassword123',
  })
  @MinLength(6, {
    message: 'Пароль должен содержать не менее 6 символов(правило от YNTY)',
  })
  @IsString()
  password: string;
}
