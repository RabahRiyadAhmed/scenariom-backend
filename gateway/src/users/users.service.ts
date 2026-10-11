import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { message, type Locale } from '../i18n';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }
  findPublicById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });
  }

  async create(input: {
    email: string;
    displayName: string;
    passwordHash: string;
  }, locale: Locale) {
    try {
      return await this.prisma.user.create({
        data: { ...input, email: input.email.toLowerCase() },
        select: { id: true, email: true, displayName: true, createdAt: true },
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      )
        throw new ConflictException(
          message('duplicateEmail', locale),
        );
      throw error;
    }
  }
}
