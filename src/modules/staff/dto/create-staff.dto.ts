import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;
}
