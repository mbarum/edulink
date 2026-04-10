import { SubscriptionPlan } from 'src/common/subscription.enums';
export declare class CreateTenantDto {
    name: string;
    domain: string;
    plan?: SubscriptionPlan;
}
