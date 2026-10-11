import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsProxyService } from './projects-proxy.service';
import { localeFromAcceptLanguage } from '../i18n';

type AuthenticatedRequest = FastifyRequest & { user: { id: string } };

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsProxyController {
  constructor(private readonly proxy: ProjectsProxyService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.proxy.forward(request.user.id, '', 'GET', undefined, localeFromAcceptLanguage(request.headers['accept-language'] as string | undefined));
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.proxy.forward(request.user.id, '', 'POST', body, localeFromAcceptLanguage(request.headers['accept-language'] as string | undefined));
  }

  @Get(':projectId')
  findOne(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.proxy.forward(request.user.id, `/${projectId}`, 'GET', undefined, localeFromAcceptLanguage(request.headers['accept-language'] as string | undefined));
  }

  @Patch(':projectId')
  update(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    return this.proxy.forward(request.user.id, `/${projectId}`, 'PATCH', body, localeFromAcceptLanguage(request.headers['accept-language'] as string | undefined));
  }

  @Delete(':projectId')
  remove(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.proxy.forward(request.user.id, `/${projectId}`, 'DELETE', undefined, localeFromAcceptLanguage(request.headers['accept-language'] as string | undefined));
  }

  @Post(':projectId/access')
  grantAccess(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    return this.proxy.forward(request.user.id, `/${projectId}/access`, 'POST', body, localeFromAcceptLanguage(request.headers['accept-language'] as string | undefined));
  }
}
