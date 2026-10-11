import { Module } from '@nestjs/common';
import { ThemesProxyController } from './themes-proxy.controller';
import { ThemesProxyService } from './themes-proxy.service';

@Module({ controllers: [ThemesProxyController], providers: [ThemesProxyService] })
export class ThemesProxyModule {}
