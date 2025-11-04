import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'body-parser';
import * as cookieParser from 'cookie-parser';

async function bootstrap(){
  const app = await NestFactory.create(AppModule);
  app.use(json({ verify: (req:any,res,buf)=>{ req.rawBody = buf; } }));
  app.use(cookieParser());
  // Accept requests from configured frontend origins and reflect allowed origin for credentialed requests.
  const allowedOrigins = [process.env.FRONTEND_ORIGIN, 'http://localhost:3000', 'http://localhost:3002'].filter(Boolean);
  app.enableCors({
    origin: (incomingOrigin, callback) => {
      // Allow if no origin (non-browser requests) or if origin is in the allowlist
      if (!incomingOrigin) return callback(null, true);
      if (allowedOrigins.includes(incomingOrigin)) return callback(null, true);
      // otherwise deny
      return callback(new Error('CORS not allowed'), false);
    },
    credentials: true,
  });
  // Expose all controllers under the /api prefix so frontend calls to /api/* match
  app.setGlobalPrefix('api');
  // Use Render's PORT env if available (required for Render deployment), otherwise default
  const port = process.env.PORT || process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`NestJS API listening on port ${port} (serving frontend static files + API under /api)`);
}
bootstrap();
