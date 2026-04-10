import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
interface RequestWithRawBody extends Request {
    rawBody?: string | Buffer;
}
export declare class StripeWebhookController {
    private readonly configService;
    private readonly tenantRepository;
    private stripe;
    constructor(configService: ConfigService, tenantRepository: Repository<Tenant>);
    private getStripe;
    handleWebhook(signature: string, req: RequestWithRawBody): Promise<{
        received: boolean;
    }>;
    private updateTenantSubscriptionStatus;
    private handleSubscriptionCanceled;
}
export {};
