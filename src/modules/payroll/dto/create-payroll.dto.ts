import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsDateString,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreatePayrollDto {
  @IsString()
  @IsNotEmpty()
  staffId: string;

  @IsNumber()
  @IsPositive()
  salary: number;

  @IsDateString()
  payDate: string;

  @IsOptional()
  @IsIn(['paid', 'unpaid'])
  status?: 'paid' | 'unpaid';
}
