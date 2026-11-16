import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsIn(['available', 'borrowed'])
  status?: 'available' | 'borrowed';
}
