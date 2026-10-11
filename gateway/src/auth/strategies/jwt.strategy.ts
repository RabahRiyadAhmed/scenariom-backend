import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import '@fastify/cookie';
import type { FastifyRequest } from 'fastify';
import { AccessPayload } from '../auth.types';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly redis: RedisService,
  ) {
    const production = config.get('NODE_ENV') === 'production';
    const cookieName = production ? '__Host-sc_access' : 'sc_access';
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: FastifyRequest) =>
          (request as FastifyRequest & { cookies?: Record<string, string> })
            .cookies?.[cookieName] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      issuer: 'scenariom-api',
      audience: 'scenariom',
    });
  }
  async validate(payload: AccessPayload) {
    if (
      payload.type !== 'access' ||
      !payload.sid ||
      !(await this.redis.isSessionActive(payload.sid, payload.sub))
    )
      return false;
    return { id: payload.sub, email: payload.email, sessionId: payload.sid };
  }
}
