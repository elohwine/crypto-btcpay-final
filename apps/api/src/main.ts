import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'body-parser';
import * as cookieParser from 'cookie-parser';

async function bootstrap(){
  const app = await NestFactory.create(AppModule);
  app.use(json({ verify: (req:any,res,buf)=>{ req.rawBody = buf; } }));
  app.use(cookieParser());
  app.enableCors({ origin: [process.env.FRONTEND_ORIGIN,'http://localhost:3000', 'http://localhost:3002'], credentials: true });
  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`NestJS API listening on http://localhost:${port}`);
}
bootstrap();
