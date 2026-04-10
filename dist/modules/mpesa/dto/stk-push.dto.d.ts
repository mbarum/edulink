import { SubscriptionPlan } from 'src/common/subscription.enums';
export declare class StkPushDto {
    phone: string;
    amount: number;
    plan: SubscriptionPlan;
    billingCycle?: 'monthly' | 'annual';
}
