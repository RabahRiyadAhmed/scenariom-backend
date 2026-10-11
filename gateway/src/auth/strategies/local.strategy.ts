import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import type { FastifyRequest } from 'fastify';
import { localeFromAcceptLanguage, message } from '../../i18n';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly auth: AuthService) {
    super({ usernameField: 'email', passReqToCallback: true });
  }
  async validate(req: FastifyRequest, email: string, password: string) {
    const user = await this.auth.validateCredentials(email, password);
    if (!user)
      throw new UnauthorizedException(
        message('authInvalidCredentials', localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined)),
      );
    return user;
  }
}
