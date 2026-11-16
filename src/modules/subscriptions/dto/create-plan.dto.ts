import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { BillingModel, BillingInterval } from 'src/common/subscription.enums';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(BillingModel)
  billingModel: BillingModel;

  @IsEnum(BillingInterval)
  interval: BillingInterval;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  maxStudents?: number;

  @IsNumber()
  @IsOptional()
  trialDays?: number;

  @IsArray()
  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  stripePriceId?: string;
}
