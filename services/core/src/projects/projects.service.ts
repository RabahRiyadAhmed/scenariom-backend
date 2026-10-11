import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectAction } from '../generated/prisma/enums';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto, GrantProjectAccessDto, UpdateProjectDto } from './projects.dto';
import { message, type Locale } from '../i18n';

const OWNER_ACTIONS = Object.values(ProjectAction);

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, _locale: Locale) {
    return this.prisma.project.findMany({
      where: { accesses: { some: { userId, actions: { has: ProjectAction.VIEW } } } },
      orderBy: { updatedAt: 'desc' },
      include: { accesses: { where: { userId } } },
    });
  }

  async create(userId: string, dto: CreateProjectDto, _locale: Locale) {
    return this.prisma.project.create({
      data: {
        title: dto.title,
        description: dto.description ?? '',
        ownerId: userId,
        accesses: { create: { userId, actions: OWNER_ACTIONS, note: 'Propriétaire du projet' } },
      },
      include: { accesses: true },
    });
  }

  async findOne(userId: string, projectId: string, locale: Locale) {
    await this.requireAction(userId, projectId, ProjectAction.VIEW, locale);
    return this.prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: { accesses: true } });
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto, locale: Locale) {
    await this.requireAction(userId, projectId, ProjectAction.EDIT_PROJECT, locale);
    return this.prisma.project.update({ where: { id: projectId }, data: dto });
  }

  async remove(userId: string, projectId: string, locale: Locale) {
    await this.requireAction(userId, projectId, ProjectAction.DELETE_PROJECT, locale);
    return this.prisma.project.delete({ where: { id: projectId } });
  }

  async grantAccess(userId: string, projectId: string, dto: GrantProjectAccessDto, locale: Locale) {
    await this.requireAction(userId, projectId, ProjectAction.MANAGE_ACCESS, locale);
    if (!dto.actions.includes(ProjectAction.VIEW)) dto.actions.unshift(ProjectAction.VIEW);
    return this.prisma.projectAccess.upsert({
      where: { projectId_userId: { projectId, userId: dto.userId } },
      create: { projectId, userId: dto.userId, actions: dto.actions, note: dto.note },
      update: { actions: dto.actions, note: dto.note },
    });
  }

  private async requireAction(userId: string, projectId: string, action: ProjectAction, locale: Locale) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!project) throw new NotFoundException(message('projectNotFound', locale));
    const access = await this.prisma.projectAccess.findUnique({
      where: { projectId_userId: { projectId, userId } },
      select: { actions: true },
    });
    if (!access?.actions.includes(action)) throw new ForbiddenException(message('accessDenied', locale));
  }
}
