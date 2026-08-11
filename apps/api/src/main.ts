import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(){
  const app = await NestFactory.create(AppModule);
  app.use(json({ verify: (req:any,res,buf)=>{ req.rawBody = buf; } }));
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const isProd = process.env.NODE_ENV === 'production';
  const configuredOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  const allowedOrigins = isProd
    ? configuredOrigins
    : [...configuredOrigins, 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:4500'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  const port = process.env.API_PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`NestJS API listening on http://0.0.0.0:${port}`);
}
bootstrap();
