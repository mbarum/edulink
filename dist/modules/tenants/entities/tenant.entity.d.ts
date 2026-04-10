import { SubscriptionPlan, SubscriptionStatus } from 'src/common/subscription.enums';
export declare class Tenant {
    id: string;
    name: string;
    domain: string;
    plan: SubscriptionPlan;
    subscriptionStatus: SubscriptionStatus;
    expiresAt: Date;
    stripeCustomerId: string;
}
