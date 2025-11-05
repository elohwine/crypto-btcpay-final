import { Controller, Get } from '@nestjs/common';

@Controller('api/health')
export class HealthController {
  @Get()
  get() {
    return {
      ok: true,
      uptime: process.uptime(),
      now: new Date().toISOString(),
    };
  }
}
