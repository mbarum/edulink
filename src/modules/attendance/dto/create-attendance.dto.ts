import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  classLevelId: string;

  @IsDateString()
  date: string;

  @IsIn(['present', 'absent', 'late'])
  status: 'present' | 'absent' | 'late';
}
