import { ProjectAction } from '../generated/prisma/enums';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString() @MinLength(1) @MaxLength(160) title!: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
}

export class UpdateProjectDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(160) title?: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
}

export class GrantProjectAccessDto {
  @IsUUID() userId!: string;
  @IsArray() @IsEnum(ProjectAction, { each: true }) actions!: ProjectAction[];
  @IsOptional() @IsString() @MaxLength(500) note?: string;
}
