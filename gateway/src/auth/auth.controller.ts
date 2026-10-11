import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import '@fastify/cookie';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthUser } from './auth.types';
import { UsersService } from '../users/users.service';
import { Throttle } from '@nestjs/throttler';
import { RefreshDto } from './dto/refresh.dto';
import { localeFromAcceptLanguage } from '../i18n';

type AuthRequest = FastifyRequest & { user: AuthUser };
type CookieRequest = FastifyRequest & { cookies?: Record<string, string> };
type CookieReply = FastifyReply & {
  setCookie(name: string, value: string, options: object): CookieReply;
  clearCookie(name: string, options: object): CookieReply;
};

@Controller('auth')
@Throttle({ default: { limit: 10, ttl: 60_000, blockDuration: 60_000 } })
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Post('web/register')
  async webRegister(
    @Body() dto: RegisterDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    const user = await this.auth.register(dto, localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined));
    const tokens = await this.auth.issueSession(user, this.meta(req));
    this.setCookies(reply, tokens);
    return { user };
  }

  @UseGuards(LocalAuthGuard)
  @Post('web/login')
  @HttpCode(200)
  async webLogin(
    @Body() _dto: LoginDto,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    const tokens = await this.auth.issueSession(req.user, this.meta(req));
    this.setCookies(reply, tokens);
    return { user: req.user };
  }

  @Post('web/refresh')
  @HttpCode(200)
  async webRefresh(
    @Req() req: CookieRequest,
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    const current = req.cookies?.[this.auth.refreshCookieName];
    const result = await this.auth.rotateSession(current ?? '', this.meta(req), localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined));
    this.setCookies(reply, result.tokens);
    return { user: result.user };
  }

  @Post('web/logout')
  @HttpCode(204)
  async webLogout(
    @Req() req: CookieRequest,
    @Res({ passthrough: true }) reply: CookieReply,
  ) {
    await this.auth.revokeSession(req.cookies?.[this.auth.refreshCookieName]);
    this.clearCookies(reply);
  }

  @Post('mobile/register')
  async mobileRegister(@Body() dto: RegisterDto, @Req() req: FastifyRequest) {
    const user = await this.auth.register(dto, localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined));
    return { user, ...(await this.auth.issueSession(user, this.meta(req))) };
  }

  @UseGuards(LocalAuthGuard)
  @Post('mobile/login')
  @HttpCode(200)
  async mobileLogin(@Body() _dto: LoginDto, @Req() req: AuthRequest) {
    return {
      user: req.user,
      ...(await this.auth.issueSession(req.user, this.meta(req))),
    };
  }

  @Post('mobile/refresh')
  @HttpCode(200)
  async mobileRefresh(@Body() dto: RefreshDto, @Req() req: FastifyRequest) {
    const result = await this.auth.rotateSession(
      dto.refreshToken,
      this.meta(req),
      localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined),
    );
    return { user: result.user, ...result.tokens };
  }

  @Post('mobile/logout')
  @HttpCode(204)
  async mobileLogout(@Body() dto: RefreshDto) {
    await this.auth.revokeSession(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthRequest) {
    return this.users.findPublicById(req.user.id);
  }

  private meta(req: FastifyRequest) {
    return { userAgent: req.headers['user-agent'], ipAddress: req.ip };
  }
  private cookieOptions(maxAge: number) {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge,
    };
  }
  private setCookies(
    reply: CookieReply,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    reply
      .setCookie(
        this.auth.accessCookieName,
        tokens.accessToken,
        this.cookieOptions(15 * 60),
      )
      .setCookie(
        this.auth.refreshCookieName,
        tokens.refreshToken,
        this.cookieOptions(30 * 24 * 60 * 60),
      );
  }
  private clearCookies(reply: CookieReply) {
    reply
      .clearCookie(this.auth.accessCookieName, { path: '/' })
      .clearCookie(this.auth.refreshCookieName, { path: '/' });
  }
}
