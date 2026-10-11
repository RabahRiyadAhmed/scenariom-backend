import { Module } from '@nestjs/common';
import { ProjectsProxyController } from './projects-proxy.controller';
import { ProjectsProxyService } from './projects-proxy.service';

@Module({
  controllers: [ProjectsProxyController],
  providers: [ProjectsProxyService],
})
export class ProjectsProxyModule {}
