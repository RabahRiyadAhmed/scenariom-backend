import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'validation.email' })
  @MaxLength(320)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;
}
