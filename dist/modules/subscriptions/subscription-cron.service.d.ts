import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../../shared/email.service';
export declare class SubscriptionCronService {
    private readonly tenantRepository;
    private readonly userRepository;
    private readonly emailService;
    private readonly logger;
    constructor(tenantRepository: Repository<Tenant>, userRepository: Repository<User>, emailService: EmailService);
    private getTenantAdminEmails;
    handleSubscriptionExpirations(): Promise<void>;
    handleSubscriptionReminders(): Promise<void>;
}
