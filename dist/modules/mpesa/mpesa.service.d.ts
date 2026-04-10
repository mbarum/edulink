import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { PendingPayment } from '../payments/entities/pending-payment.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { SubscriptionPlan } from 'src/common/subscription.enums';
export declare class MpesaService {
    private readonly configService;
    private readonly httpService;
    private readonly tenantRepository;
    private readonly pendingPaymentRepository;
    private readonly tenancyService;
    constructor(configService: ConfigService, httpService: HttpService, tenantRepository: Repository<Tenant>, pendingPaymentRepository: Repository<PendingPayment>, tenancyService: TenancyService);
    private getAccessToken;
    stkPush(phone: string, amount: number, plan: SubscriptionPlan, billingCycle: 'monthly' | 'annual'): Promise<unknown>;
    handleCallback(callbackData: Record<string, any>): Promise<any>;
}
