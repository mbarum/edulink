import {
  IsString,
  IsNotEmpty,
  IsIn,
} from 'class-validator';

export class CreateTimetableEntryDto {
  @IsString()
  @IsNotEmpty()
  classLevel: string;

  @IsIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;
}
