import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CreateProjectDto, GrantProjectAccessDto, UpdateProjectDto } from './projects.dto';
import { InternalServiceGuard } from './internal-service.guard';
import type { InternalRequest } from './internal-service.guard';
import { ProjectsService } from './projects.service';
import { localeFromRequest } from '../i18n';

@Controller('projects')
@UseGuards(InternalServiceGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}
  @Get() list(@Req() req: InternalRequest) { return this.projects.list(req.projectUserId, localeFromRequest(req)); }
  @Post() create(@Req() req: InternalRequest, @Body() dto: CreateProjectDto) { return this.projects.create(req.projectUserId, dto, localeFromRequest(req)); }
  @Get(':id') findOne(@Req() req: InternalRequest, @Param('id') id: string) { return this.projects.findOne(req.projectUserId, id, localeFromRequest(req)); }
  @Patch(':id') update(@Req() req: InternalRequest, @Param('id') id: string, @Body() dto: UpdateProjectDto) { return this.projects.update(req.projectUserId, id, dto, localeFromRequest(req)); }
  @Delete(':id') remove(@Req() req: InternalRequest, @Param('id') id: string) { return this.projects.remove(req.projectUserId, id, localeFromRequest(req)); }
  @Post(':id/access') grant(@Req() req: InternalRequest, @Param('id') id: string, @Body() dto: GrantProjectAccessDto) { return this.projects.grantAccess(req.projectUserId, id, dto, localeFromRequest(req)); }
}
