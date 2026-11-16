import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  parentalConsentVerified?: boolean;

  @IsOptional()
  @IsUUID()
  classLevelId?: string;

  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsString()
  parentName?: string;

  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @IsOptional()
  @IsString()
  parentPhone?: string;

  @IsOptional()
  @IsString()
  parentEmergencyContact?: string;
}
