import { IsEnum, IsNotEmpty } from 'class-validator';
import { SubscriptionStatus } from 'src/common/subscription.enums';

export class UpdateTenantStatusDto {
  @IsEnum(SubscriptionStatus)
  @IsNotEmpty()
  status: SubscriptionStatus;
}
