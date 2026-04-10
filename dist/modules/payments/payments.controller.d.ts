import { PaymentsService } from './payments.service';
import { SubscriptionPlan } from 'src/common/subscription.enums';
declare class BankTransferRequestDto {
    amount: number;
    reference: string;
    plan: SubscriptionPlan;
    billingCycle: 'monthly' | 'annual';
}
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createBankTransferRequest(body: BankTransferRequestDto): Promise<import("./entities/pending-payment.entity").PendingPayment>;
    approvePayment(id: string): Promise<import("../tenants/entities/tenant.entity").Tenant>;
}
export {};
