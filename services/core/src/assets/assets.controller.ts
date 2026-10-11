import { Controller, Get, NotFoundException, Param, Req, StreamableFile } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { localeFromRequest, message } from '../i18n';
import { createReadStream, existsSync } from 'node:fs';
import { extname, join } from 'node:path';

const allowedCategories = ['button', 'gradients'];
const allowedThemeFiles = ['background.jpg','background.png','background.webp','background.avif','background-dark.jpg','background-dark.png','background-dark.webp','background-dark.avif','slide.jpg','slide.png','slide.webp','slide.avif'];
const contentTypes: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

@Controller('assets')
export class AssetsController {
  @Get('fonts/:file')
  font(@Req() req: FastifyRequest, @Param('file') file: string) {
    const locale = localeFromRequest(req);
    const extension = extname(file).toLowerCase();
    if (!/^[a-z0-9._-]{1,120}$/i.test(file) || !['.ttf', '.otf', '.woff', '.woff2'].includes(extension))
      throw new NotFoundException(message('fontAssetNotFound', locale));
    const path = join(process.cwd(), 'public', 'assets', 'fonts', 'runtime', file);
    if (!existsSync(path)) throw new NotFoundException(message('fontAssetNotFound', locale));
    return new StreamableFile(createReadStream(path), { type: contentTypes[extension] });
  }

  @Get('custom/:category/:file')
  customAsset(@Req() req: FastifyRequest, @Param('category') category: string, @Param('file') file: string) {
    const locale = localeFromRequest(req);
    const extension = extname(file).toLowerCase();
    if (
      !allowedCategories.includes(category) ||
      !/^[a-z0-9._-]{1,120}$/i.test(file) ||
      !contentTypes[extension]
    )
      throw new NotFoundException(message('customAssetNotFound', locale));
    const path = join(process.cwd(), 'public', 'assets', 'images', 'custom', category, file);
    if (!existsSync(path)) throw new NotFoundException(message('customAssetNotFound', locale));
    return new StreamableFile(createReadStream(path), { type: contentTypes[extension] });
  }

  @Get('themes/:theme/:file')
  themeAsset(@Req() req: FastifyRequest, @Param('theme') theme: string, @Param('file') file: string) {
    const locale = localeFromRequest(req);
    const extension = extname(file).toLowerCase();
    if (!/^[a-z0-9_-]{1,50}$/i.test(theme) || !allowedThemeFiles.includes(file.toLowerCase()) || !contentTypes[extension])
      throw new NotFoundException(message('themeAssetNotFound', locale));
    const path = join(process.cwd(), 'public', 'assets', 'images', 'theme', theme, file);
    if (!existsSync(path)) throw new NotFoundException(message('themeAssetNotFound', locale));
    return new StreamableFile(createReadStream(path), { type: contentTypes[extension] });
  }
}
