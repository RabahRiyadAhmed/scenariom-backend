import { Body, Controller, Get, NotFoundException, Param, Patch, Req, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { ThemesService } from './themes.service';
import { UpdateThemeOpacityDto } from './update-theme-opacity.dto';
import { UpdateThemeFilterDto } from './update-theme-filter.dto';
import { UpdateCustomThemeDto } from './update-custom-theme.dto';
import { localeFromRequest, message } from '../i18n';
import type { FastifyRequest } from 'fastify';

const themeAssetContentTypes: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

@Controller('themes')
export class ThemesController {
  constructor(private readonly themes: ThemesService) {}
  @Get() list() { return this.themes.list(); }
  @Get('assets/:theme/:file')
  asset(@Req() req: FastifyRequest, @Param('theme') theme: string, @Param('file') file: string) {
    const locale = localeFromRequest(req);
    const extension = extname(file).toLowerCase();
    if (!/^[a-z0-9-]{2,50}$/i.test(theme) || !/^[a-z0-9._-]{1,100}$/i.test(file) || !themeAssetContentTypes[extension]) throw new NotFoundException(message('themeAssetNotFound', locale));
    const path=join(process.cwd(),'public','assets','images','theme',theme,file);if(!existsSync(path))throw new NotFoundException(message('themeAssetNotFound', locale));return new StreamableFile(createReadStream(path), { type: themeAssetContentTypes[extension] });
  }
  @Get(':slug') findOne(@Req() req: FastifyRequest, @Param('slug') slug: string) { return this.themes.findOne(slug, localeFromRequest(req)); }
  @Patch('custom')
  updateCustom(@Req() req: FastifyRequest, @Body() body: UpdateCustomThemeDto) { return this.themes.updateCustom(body.definition, localeFromRequest(req)); }
  @Patch(':slug/background-opacity')
  updateBackgroundOpacity(@Req() req: FastifyRequest, @Param('slug') slug: string, @Body() body: UpdateThemeOpacityDto) { return this.themes.updateBackgroundOpacity(slug, body.mode, body.opacity, localeFromRequest(req)); }
  @Patch(':slug/background-filter')
  updateBackgroundFilter(@Req() req: FastifyRequest, @Param('slug') slug: string, @Body() body: UpdateThemeFilterDto) { return this.themes.updateBackgroundFilter(slug, body.mode, body.filter, localeFromRequest(req)); }
}
