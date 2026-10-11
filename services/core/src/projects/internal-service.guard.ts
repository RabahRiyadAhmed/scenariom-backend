import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import { localeFromRequest, message } from '../i18n';

export type InternalRequest = FastifyRequest & { projectUserId: string };

@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<InternalRequest>();
    const provided = String(request.headers['x-scenariom-internal-secret'] ?? '');
    const expected = this.config.getOrThrow<string>('INTERNAL_SERVICE_SECRET');
    const valid = provided.length === expected.length && timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
    const userId = String(request.headers['x-scenariom-user-id'] ?? '');
    if (!valid || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(userId)) {
      throw new UnauthorizedException(message('internalUnauthorized', localeFromRequest(request)));
    }
    request.projectUserId = userId;
    return true;
  }
}
