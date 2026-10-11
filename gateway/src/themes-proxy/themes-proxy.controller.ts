import { Body, Controller, Get, Param, Patch, Req, StreamableFile, UseGuards } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { localeFromAcceptLanguage } from '../i18n';
import { ThemesProxyService } from './themes-proxy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('themes')
export class ThemesProxyController {
  constructor(private readonly proxy: ThemesProxyService) {}
  @Get() list(@Req() req: FastifyRequest) { return this.proxy.forward('', localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined)); }
  @Get('assets/:theme/:file')
  async asset(@Req() req: FastifyRequest, @Param('theme') theme: string, @Param('file') file: string) {
    const asset = await this.proxy.forwardAsset(theme, file, localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined));
    return new StreamableFile(asset.buffer, { type: asset.contentType });
  }
  @Get(':slug') findOne(@Req() req: FastifyRequest, @Param('slug') slug: string) { return this.proxy.forward(`/${encodeURIComponent(slug)}`, localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined)); }
  @Patch(':slug/background-opacity')
  @UseGuards(JwtAuthGuard)
  updateBackgroundOpacity(@Req() req: FastifyRequest, @Param('slug') slug: string, @Body() body: unknown) { return this.proxy.update(`/${encodeURIComponent(slug)}/background-opacity`, body, localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined)); }
  @Patch(':slug/background-filter')
  @UseGuards(JwtAuthGuard)
  updateBackgroundFilter(@Req() req: FastifyRequest, @Param('slug') slug: string, @Body() body: unknown) { return this.proxy.update(`/${encodeURIComponent(slug)}/background-filter`, body, localeFromAcceptLanguage(req.headers['accept-language'] as string | undefined)); }
}
