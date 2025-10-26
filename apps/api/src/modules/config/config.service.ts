import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  getTokenContract(): string | null {
    return process.env.TRON_TOKEN_CONTRACT || null;
  }
}
