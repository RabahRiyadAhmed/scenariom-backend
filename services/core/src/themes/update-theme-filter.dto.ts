import { IsIn, IsInt, Max, Min } from 'class-validator';

export class UpdateThemeFilterDto {
  @IsIn(['light', 'dark'])
  mode!: 'light' | 'dark';

  @IsInt()
  @Min(0)
  @Max(100)
  filter!: number;
}
