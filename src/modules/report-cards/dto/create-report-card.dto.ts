import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReportCardItemDto {
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsOptional()
  @IsString()
  subjectName?: string;

  @IsNumber()
  @Min(0)
  marks: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsNumber()
  subjectPosition?: number;
}

export class CreateReportCardDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsOptional()
  @IsString()
  examinationId?: string;

  @IsOptional()
  @IsString()
  term?: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsOptional()
  @IsNumber()
  marks?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsNumber()
  totalMarks?: number;

  @IsOptional()
  @IsNumber()
  averageMarks?: number;

  @IsOptional()
  @IsString()
  gpa?: string;

  @IsOptional()
  @IsString()
  overallGrade?: string;

  @IsOptional()
  @IsString()
  principalRemarks?: string;

  @IsOptional()
  @IsString()
  teacherRemarks?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReportCardItemDto)
  items?: CreateReportCardItemDto[];
}
