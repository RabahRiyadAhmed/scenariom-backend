import { HttpException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { message, type Locale } from '../i18n';

@Injectable()
export class ThemesProxyService {
  constructor(private readonly config: ConfigService) {}
  async forward(path = '', locale: Locale = 'en') {
    const baseUrl = this.config.get<string>('THEMES_SERVICE_URL') ?? 'http://127.0.0.1:7777/api/themes';
    try {
      const response = await fetch(`${baseUrl}${path}`, { headers: { 'Accept-Language': locale }, signal: AbortSignal.timeout(5_000) });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new HttpException(payload ?? { message: message('themeServiceError', locale) }, response.status);
      return payload;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException(message('serviceUnavailable', locale));
    }
  }
  async update(path: string, body: unknown, locale: Locale = 'en') {
    const baseUrl = this.config.get<string>('THEMES_SERVICE_URL') ?? 'http://127.0.0.1:7777/api/themes';
    try {
      const response = await fetch(`${baseUrl}${path}`, { method: 'PATCH', headers: { 'content-type': 'application/json', 'Accept-Language': locale }, body: JSON.stringify(body), signal: AbortSignal.timeout(5_000) });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new HttpException(payload ?? { message: message('themeServiceError', locale) }, response.status);
      return payload;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException(message('serviceUnavailable', locale));
    }
  }
  async forwardAsset(theme: string, file: string, locale: Locale = 'en') {
    const baseUrl = this.config.get<string>('THEMES_SERVICE_URL') ?? 'http://127.0.0.1:7777/api/themes';
    try {
      const response = await fetch(`${baseUrl}/assets/${encodeURIComponent(theme)}/${encodeURIComponent(file)}`, { headers: { 'Accept-Language': locale }, signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new NotFoundException(message('assetNotFound', locale));
      return {
        buffer: Buffer.from(await response.arrayBuffer()),
        contentType: response.headers.get('content-type') ?? 'application/octet-stream',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException(message('serviceUnavailable', locale));
    }
  }
}
