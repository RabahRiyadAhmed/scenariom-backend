import { Module } from '@nestjs/common';
import { AssetsProxyController } from './assets-proxy.controller';

@Module({ controllers: [AssetsProxyController] })
export class AssetsProxyModule {}
