import {
  IsString,
  IsNumber,
  IsPositive,
  IsDateString,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateFeeDto {
  @IsString()
  studentId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsIn(['paid', 'unpaid', 'overdue'])
  status?: 'paid' | 'unpaid' | 'overdue';
}
