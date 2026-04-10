import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
export declare class SubscriptionsService {
    private readonly configService;
    private readonly tenantRepository;
    private readonly tenancyService;
    private stripe;
    constructor(configService: ConfigService, tenantRepository: Repository<Tenant>, tenancyService: TenancyService);
    private getStripe;
    createCheckoutSession(priceId: string): Promise<{
        sessionId: string;
    }>;
    createBillingPortalSession(): Promise<{
        url: string;
    }>;
}
