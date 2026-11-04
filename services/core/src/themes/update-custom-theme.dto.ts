import { IsObject } from 'class-validator';

export class UpdateCustomThemeDto {
  @IsObject()
  definition!: Record<string, unknown>;
}
