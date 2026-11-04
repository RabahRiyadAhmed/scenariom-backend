import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async updateCustom(definition: Record<string, unknown>, locale: Locale = 'en') {
    if (!isValidCustomTheme(definition)) throw new BadRequestException('Invalid custom theme definition.');
    const normalized = { ...definition, schemaVersion: 1, slug: 'custom', name: 'Custom' } as Prisma.InputJsonValue;
    return this.prisma.theme.upsert({
      where: { slug: 'custom' },
      create: { slug: 'custom', name: 'Custom', description: 'Shared custom theme edited from the Style Lab.', definition: normalized, extraData: { category: 'custom', type: 'custom' }, isActive: true },
      update: { definition: normalized, extraData: { category: 'custom', type: 'custom' }, isActive: true },
      select: { id: true, slug: true, name: true, description: true, definition: true, extraData: true, updatedAt: true },
    });
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

const colorKeys = ['background','surface','card','border','primary','secondary','accent','info','foreground','muted','disabled','metallic','gold','success','warning','danger','pink','purple','orange','teal'];
const hex = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;
const safeUrl = /^(https?:\/\/|\/)[^"'\\]{1,500}$/i;
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const finiteRange = (value: unknown, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

function isValidCustomTheme(value: Record<string, unknown>) {
  if (JSON.stringify(value).length > 50_000 || value.schemaVersion !== 1) return false;
  const modes = value.modes;
  const radius = value.radius;
  const motion = value.motion;
  if (!record(modes) || !record(modes.light) || !record(modes.dark) || !record(radius) || !record(motion)) return false;
  const light = modes.light;
  const dark = modes.dark;
  if (colorKeys.some(key => !hex.test(String(light[key] ?? '')) || !hex.test(String(dark[key] ?? '')))) return false;
  if (['sm','md','lg','xl'].some(key => !finiteRange(radius[key], 0, 64))) return false;
  if (['fast','normal','slow'].some(key => !finiteRange(motion[key], 0, 5_000))) return false;
  if (value.globals !== undefined) {
    if (!record(value.globals)) return false;
    const globals = value.globals;
    if (globals.borderWidth !== undefined && !finiteRange(globals.borderWidth, 0, 12)) return false;
    if (globals.density !== undefined && !['compact','normal','comfortable'].includes(String(globals.density))) return false;
    if (globals.spacing !== undefined && (!record(globals.spacing) || ['xs','sm','md','lg','xl'].some(key => !finiteRange((globals.spacing as Record<string, unknown>)[key], 0, 128)))) return false;
    if (globals.typography !== undefined) {
      if (!record(globals.typography)) return false;
      const typography = globals.typography;
      if (!finiteRange(typography.baseSize, 8, 48) || !finiteRange(typography.lineHeight, 0.8, 3) || !finiteRange(typography.scale, 1, 2)) return false;
      if (typeof typography.fontFamily !== 'string' || typography.fontFamily.length > 300 || typeof typography.monoFamily !== 'string' || typography.monoFamily.length > 300) return false;
    }
  }
  if (value.backgrounds !== undefined) {
    if (!record(value.backgrounds)) return false;
    for (const mode of ['light','dark']) {
      const background = value.backgrounds[mode];
      if (background === undefined) continue;
      if (!record(background) || !finiteRange(background.opacity, 0, 100) || !finiteRange(background.overlay, 0, 100)) return false;
      if (background.imageUrl !== undefined && (typeof background.imageUrl !== 'string' || !safeUrl.test(background.imageUrl))) return false;
      if (!['cover','contain','stretch','repeat'].includes(String(background.fit)) || !['center','top','bottom','left','right'].includes(String(background.position))) return false;
    }
  }
  return true;
}
