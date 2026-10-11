import { BadRequestException, Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { localeFromAcceptLanguage, message } from './i18n';

@Catch(BadRequestException)
export class LocalizedValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<FastifyRequest>();
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const response = exception.getResponse() as { message?: string | string[] };
    const locale = localeFromAcceptLanguage(request.headers['accept-language'] as string | undefined);
    const messages = Array.isArray(response.message) ? response.message : [response.message ?? ''];
    const localized = messages.map((item) => message(item || 'validation.badRequest', locale));
    reply.status(exception.getStatus()).send({ statusCode: exception.getStatus(), message: localized });
  }
}
