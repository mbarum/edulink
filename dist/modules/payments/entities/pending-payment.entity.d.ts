import { Tenant } from 'src/modules/tenants/entities/tenant.entity';
import { SubscriptionPlan } from 'src/common/subscription.enums';
export declare enum PaymentMethod {
    STRIPE = "stripe",
    MPESA = "mpesa",
    BANK_TRANSFER = "bank_transfer"
}
export declare class PendingPayment {
    id: string;
    tenant: Tenant;
    amount: number;
    method: PaymentMethod;
    reference: string;
    plan: SubscriptionPlan;
    billingCycle: 'monthly' | 'annual';
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}
