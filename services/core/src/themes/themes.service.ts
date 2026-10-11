import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { Prisma } from '../generated/prisma/client';
import { message, type Locale } from '../i18n';

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.theme.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, slug: true, name: true, description: true, definition: true, extraData: true, updatedAt: true } });
  }

  async findOne(slug: string, locale: Locale) {
    const theme = await this.prisma.theme.findFirst({ where: { slug, isActive: true }, select: { id: true, slug: true, name: true, description: true, definition: true, extraData: true, updatedAt: true } });
    if (!theme) throw new NotFoundException(message('themeNotFound', locale));
    return theme;
  }

  async updateBackgroundOpacity(slug: string, mode: 'light'|'dark', opacity: number, locale: Locale = 'en') {
    const theme = await this.prisma.theme.findFirst({ where: { slug, isActive: true }, select: { id: true, extraData: true } });
    if (!theme) throw new NotFoundException(message('themeNotFound', locale));
    const extraData = theme.extraData && typeof theme.extraData === 'object' && !Array.isArray(theme.extraData) ? theme.extraData as Record<string, unknown> : {};
    const current = extraData.backgroundOpacity && typeof extraData.backgroundOpacity === 'object' && !Array.isArray(extraData.backgroundOpacity) ? extraData.backgroundOpacity as Record<string, unknown> : {};
    const nextExtraData = { ...extraData, backgroundOpacity: { ...current, [mode]: opacity } } as Prisma.InputJsonValue;
    return this.prisma.theme.update({ where: { id: theme.id }, data: { extraData: nextExtraData }, select: { id: true, slug: true, name: true, description: true, definition: true, extraData: true, updatedAt: true } });
  }

  async updateBackgroundFilter(slug: string, mode: 'light'|'dark', filter: number, locale: Locale = 'en') {
    const theme = await this.prisma.theme.findFirst({ where: { slug, isActive: true }, select: { id: true, extraData: true } });
    if (!theme) throw new NotFoundException(message('themeNotFound', locale));
    const extraData = theme.extraData && typeof theme.extraData === 'object' && !Array.isArray(theme.extraData) ? theme.extraData as Record<string, unknown> : {};
    const current = extraData.backgroundFilter && typeof extraData.backgroundFilter === 'object' && !Array.isArray(extraData.backgroundFilter) ? extraData.backgroundFilter as Record<string, unknown> : {};
    const nextExtraData = { ...extraData, backgroundFilter: { ...current, [mode]: filter } } as Prisma.InputJsonValue;
    return this.prisma.theme.update({ where: { id: theme.id }, data: { extraData: nextExtraData }, select: { id: true, slug: true, name: true, description: true, definition: true, extraData: true, updatedAt: true } });
  }
}
