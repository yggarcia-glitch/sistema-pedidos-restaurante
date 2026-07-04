import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // Lanza error 400 si hay propiedades extra
      transform: true,            // Transforma tipos automáticamente (string → number, etc.)
    }),
  );

  app.enableCors();
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Servidor corriendo en: http://localhost:${port}/api`);
}

bootstrap();
