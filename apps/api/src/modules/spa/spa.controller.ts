import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import { Response } from 'express';

// Catch-all controller for SPA routes. Any non-API route should render index.html
// so client-side routing (e.g., /dashboard) works when served by the API.
@Controller()
export class SpaController {
  @Get(['', 'dashboard', 'dashboard/**', '**', 'members/**'])
  renderApp(@Res() res: Response) {
    // __dirname at runtime is apps/api/dist/src/modules/spa
    // We need to serve apps/api/public/index.html for SPA fallback
    const indexPath = join(__dirname, '..', '..', '..', '..', 'public', 'index.html');
    return res.sendFile(indexPath);
  }
}
