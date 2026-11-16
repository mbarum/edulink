import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  classLevel: string;

  @IsOptional()
  @IsString()
  teacherId?: string;
}
