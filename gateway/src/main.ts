import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import { LocalizedValidationFilter } from './i18n.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const cookieSecret = process.env.COOKIE_SECRET;
  if (!cookieSecret || cookieSecret.length < 32)
    throw new Error('COOKIE_SECRET doit contenir au moins 32 caractères.');
  if (
    !process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_ACCESS_SECRET.length < 32
  )
    throw new Error('JWT_ACCESS_SECRET doit contenir au moins 32 caractères.');

  await app.register(fastifyCookie, { secret: cookieSecret });
  await app.register(fastifyCors, {
    origin:
      process.env.WEB_ORIGIN?.split(',').map((origin) => origin.trim()) ?? [],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });
  app.useGlobalFilters(new LocalizedValidationFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');

  await app.register(fastifyStatic, {
    root: join(process.cwd(), 'public'),
    prefix: '/public/',
  });

  await app.listen({
    port: Number(process.env.PORT) || 3000,
    host: '0.0.0.0',
  });
}

void bootstrap();
