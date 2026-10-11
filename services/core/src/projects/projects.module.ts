import { Module } from '@nestjs/common';
import { InternalServiceGuard } from './internal-service.guard';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({ controllers: [ProjectsController], providers: [ProjectsService, InternalServiceGuard] })
export class ProjectsModule {}
