import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { PendingPayment } from './entities/pending-payment.entity';
import { User } from '../users/entities/user.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { SubscriptionPlan } from 'src/common/subscription.enums';
import { EmailService } from '../../shared/email.service';
export declare class PaymentsService {
    private readonly tenantRepository;
    private readonly pendingPaymentRepository;
    private readonly userRepository;
    private readonly tenancyService;
    private readonly emailService;
    constructor(tenantRepository: Repository<Tenant>, pendingPaymentRepository: Repository<PendingPayment>, userRepository: Repository<User>, tenancyService: TenancyService, emailService: EmailService);
    createBankTransferRequest(amount: number, reference: string, plan: SubscriptionPlan, billingCycle: 'monthly' | 'annual'): Promise<PendingPayment>;
    approvePayment(paymentId: string): Promise<Tenant>;
}
