import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Ticket O!Dengi')
    .setDescription('API documentation test project')
    .setVersion('1.0.0')
    .setContact('O! Dengi', 'https://dengi.kg/ru', 'support@help.ru')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document, {
    jsonDocumentUrl: 'swagger.json',
    customSiteTitle: 'Free Books of History Prophets | Docs',
  });

  const logger = new Logger('HTTP');
  app.use((req, res, next) => {
    logger.log(`${req.method} ${req.url}`);
    next();
  });
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(4200);
}
bootstrap();
