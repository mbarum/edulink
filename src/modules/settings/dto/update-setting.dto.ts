import { IsOptional, IsString, IsEmail, IsUrl } from 'class-validator';

export class UpdateSettingDto {
  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
