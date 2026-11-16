import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateCalendarEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  start: string;

  @IsDateString()
  end: string;

  @IsOptional()
  @IsString()
  description?: string;
}
