import { HttpException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { message, type Locale } from '../i18n';

@Injectable()
export class ProjectsProxyService {
  constructor(private readonly config: ConfigService) {}

  async forward(userId: string, path: string, method: string, body?: unknown, locale: Locale = 'en') {
    const baseUrl = this.config.get<string>('PROJECTS_SERVICE_URL') ?? 'http://127.0.0.1:7777/api/projects';
    const secret = this.config.getOrThrow<string>('INTERNAL_SERVICE_SECRET');
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'content-type': 'application/json',
          'x-scenariom-internal-secret': secret,
          'x-scenariom-user-id': userId,
          'Accept-Language': locale,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(5_000),
      });
    } catch {
      throw new ServiceUnavailableException(message('serviceUnavailable', locale));
    }
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new HttpException(payload ?? { message: 'Erreur du service Projects.' }, response.status);
    return payload;
  }
}
