import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsDateString,
} from 'class-validator';

export class CreateExaminationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  @IsPositive()
  totalMarks: number;
}
