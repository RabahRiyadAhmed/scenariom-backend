import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { AuthUser, RequestMeta } from './auth.types';
import { RedisService } from '../redis/redis.service';
import { message, type Locale } from '../i18n';

const REFRESH_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await this.users.findByEmail(email);
    if (!user || !(await argon2.verify(user.passwordHash, password)))
      return null;
    return { id: user.id, email: user.email, displayName: user.displayName };
  }

  async register(dto: RegisterDto, locale: Locale = 'en'): Promise<AuthUser> {
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });
    return this.users.create({
      email: dto.email,
      displayName: dto.displayName,
      passwordHash,
    }, locale);
  }

  async issueSession(user: AuthUser, meta: RequestMeta) {
    const refreshToken = randomBytes(48).toString('base64url');
    const session = await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_DAYS * 86_400_000),
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      },
    });
    await this.redis.createSession(session.id, user.id, REFRESH_DAYS * 86_400);
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      sid: session.id,
      type: 'access',
    });
    return { accessToken, refreshToken, expiresIn: 900 };
  }

  async rotateSession(refreshToken: string, meta: RequestMeta, locale: Locale = 'en') {
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
      include: { user: true },
    });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !(await this.redis.isSessionActive(session.id, session.userId))
    )
      throw new UnauthorizedException(message('sessionInvalid', locale));
    const revoked = await this.prisma.refreshSession.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (revoked.count !== 1)
      throw new UnauthorizedException(message('sessionInvalid', locale));
    await this.redis.revokeSession(session.id);
    const user = {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
    };
    return { user, tokens: await this.issueSession(user, meta) };
  }

  async revokeSession(refreshToken?: string) {
    if (!refreshToken) return;
    const sessions = await this.prisma.refreshSession.findMany({
      where: { tokenHash: this.hashToken(refreshToken), revokedAt: null },
      select: { id: true },
    });
    await this.prisma.refreshSession.updateMany({
      where: { tokenHash: this.hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await Promise.all(
      sessions.map((session) => this.redis.revokeSession(session.id)),
    );
  }

  get accessCookieName() {
    return this.config.get('NODE_ENV') === 'production'
      ? '__Host-sc_access'
      : 'sc_access';
  }
  get refreshCookieName() {
    return this.config.get('NODE_ENV') === 'production'
      ? '__Host-sc_refresh'
      : 'sc_refresh';
  }
  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
