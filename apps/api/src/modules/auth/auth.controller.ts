import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private refreshCookieOptions(): CookieOptions {
    const isProd = process.env.NODE_ENV === 'production';
    const secure = process.env.COOKIE_SECURE
      ? process.env.COOKIE_SECURE === 'true'
      : isProd;
    const sameSite: 'lax' | 'none' = secure ? 'none' : 'lax';

    const options: CookieOptions = {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    };

    if (process.env.COOKIE_DOMAIN) {
      options.domain = process.env.COOKIE_DOMAIN;
    }

    return options;
  }

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signup(dto);
    res.cookie('refreshToken', result.refreshToken, this.refreshCookieOptions());
    const { refreshToken, ...response } = result;
    return response;
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    res.cookie('refreshToken', result.refreshToken, this.refreshCookieOptions());
    const { refreshToken, ...response } = result;
    return response;
  }

  @Post('refresh')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    const result = await this.authService.refresh(refreshToken);
    res.cookie('refreshToken', result.refreshToken, this.refreshCookieOptions());
    const { refreshToken: _, ...response } = result;
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.sub);
    const clearOptions = this.refreshCookieOptions();
    delete clearOptions.maxAge;
    res.clearCookie('refreshToken', clearOptions);
    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return this.authService.me(req.user.sub);
  }
}
