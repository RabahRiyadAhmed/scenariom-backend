import { Controller, Get, HttpException, Param, Req, ServiceUnavailableException, StreamableFile } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { localeFromAcceptLanguage, message } from '../i18n';
import { ConfigService } from '@nestjs/config';

@Controller('assets')
export class AssetsProxyController {
  constructor(private readonly config: ConfigService) {}

  @Get('custom/:category/:file')
  async customAsset(@Req() req: FastifyRequest, @Param('category') category: string, @Param('file') file: string) {
    const locale = localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined);
    const baseUrl = this.config.get<string>('ASSETS_SERVICE_URL') ?? 'http://127.0.0.1:7777/api/assets';
    let response: globalThis.Response;
    try {
      response = await fetch(
        `${baseUrl}/custom/${encodeURIComponent(category)}/${encodeURIComponent(file)}`,
        { headers: { 'Accept-Language': locale }, signal: AbortSignal.timeout(5_000) },
      );
    } catch {
      throw new ServiceUnavailableException(message('serviceUnavailable', locale));
    }
    if (!response.ok) throw new HttpException(message('assetNotFound', locale), response.status);
    const buffer = Buffer.from(await response.arrayBuffer());
    const type = response.headers.get('content-type') ?? 'application/octet-stream';
    return new StreamableFile(buffer, { type });
  }

  @Get('fonts/:file')
  async font(@Req() req: FastifyRequest, @Param('file') file: string) {
    return this.forward(`/fonts/${encodeURIComponent(file)}`, message('assetNotFound', localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined)), localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined));
  }

  @Get('themes/:theme/:file')
  async themeAsset(@Req() req: FastifyRequest, @Param('theme') theme: string, @Param('file') file: string) {
    const locale = localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined);
    return this.forward(`/themes/${encodeURIComponent(theme)}/${encodeURIComponent(file)}`, message('assetNotFound', locale), locale);
  }

  private async forward(path: string, notFoundMessage: string, locale: import('../i18n').Locale) {
    const baseUrl = this.config.get<string>('ASSETS_SERVICE_URL') ?? 'http://127.0.0.1:7777/api/assets';
    let response: globalThis.Response;
    try {
      response = await fetch(`${baseUrl}${path}`, { headers: { 'Accept-Language': locale }, signal: AbortSignal.timeout(5_000) });
    } catch {
      throw new ServiceUnavailableException(message('serviceUnavailable', locale));
    }
    if (!response.ok) throw new HttpException(notFoundMessage, response.status);
    const buffer = Buffer.from(await response.arrayBuffer());
    return new StreamableFile(buffer, { type: response.headers.get('content-type') ?? 'application/octet-stream' });
  }
}
