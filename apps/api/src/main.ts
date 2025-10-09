import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'body-parser';

async function bootstrap(){
  const app = await NestFactory.create(AppModule);
  app.use(json({ verify: (req:any,res,buf)=>{ req.rawBody = buf; } }));
  app.enableCors();
  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`NestJS API listening on http://localhost:${port}`);
}
bootstrap();
