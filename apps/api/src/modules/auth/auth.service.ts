import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SignupDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('PRISMA') private prisma: PrismaClient,
    private jwtService: JwtService,
  ) { }

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new HttpException('Email already registered', HttpStatus.BAD_REQUEST);
    }

    let referredBy: string | undefined = undefined;
    if (dto.referralCode) {
      const referrer = await this.prisma.user.findUnique({ where: { referralCode: dto.referralCode } });
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        phone: dto.phone,
        referredBy
      }
    });
    const tokens = await this.getTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return { user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin, dateOfBirth: user.dateOfBirth, phone: user.phone }, ...tokens };
  }

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    const tokens = await this.getTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return { user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin }, ...tokens };
  }

  private async getTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = randomBytes(64).toString('hex');
    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    await this.prisma.refreshToken.create({ data: { tokenHash: hash, userId, expiresAt } });
  }

  async refresh(refreshToken: string) {
    // find candidate tokens that are not revoked and not expired
    const candidates = await this.prisma.refreshToken.findMany({ where: { revoked: false, expiresAt: { gt: new Date() } }, include: { user: true } });
    for (const c of candidates) {
      const match = await bcrypt.compare(refreshToken, c.tokenHash);
      if (match) {
        // revoke the used token
        await this.prisma.refreshToken.update({ where: { id: c.id }, data: { revoked: true } });
        // issue new tokens
        const tokens = await this.getTokens(c.userId, c.user.email);
        await this.saveRefreshToken(c.userId, tokens.refreshToken);
        return { user: { id: c.user.id, email: c.user.email, name: c.user.name, isAdmin: c.user.isAdmin }, ...tokens };
      }
    }
    throw new HttpException('Refresh token invalid', HttpStatus.UNAUTHORIZED);
  }

  async logout(userId: string) {
    // revoke all refresh tokens for user
    await this.prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
    return { ok: true };
  }

  async me(userId: string) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        dateOfBirth: true,
        phone: true,
        createdAt: true,
        referralCode: true // Include referral code
      }
    });

    // Count referrals
    const referralCount = await this.prisma.user.count({
      where: { referredBy: userId }
    });

    return { ...u, referralCount };
  }
}
