import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, TicketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
