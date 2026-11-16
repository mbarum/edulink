import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import {
  BillingModel,
  BillingInterval,
  SubscriptionStatus,
} from 'src/common/subscription.enums';

export class UpdateTenantSubscriptionDto {
  @IsString()
  @IsOptional()
  plan?: string;

  @IsString()
  @IsOptional()
  planId?: string;

  @IsEnum(BillingModel)
  @IsOptional()
  billingModel?: BillingModel;

  @IsEnum(BillingInterval)
  @IsOptional()
  billingInterval?: BillingInterval;

  @IsNumber()
  @IsOptional()
  customRate?: number;

  @IsEnum(SubscriptionStatus)
  @IsOptional()
  subscriptionStatus?: SubscriptionStatus;
}
