import { IsString, IsOptional } from 'class-validator';

export class UpdatePlatformBrandingDto {
  @IsString()
  @IsOptional()
  platformName?: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  faviconUrl?: string;
}
