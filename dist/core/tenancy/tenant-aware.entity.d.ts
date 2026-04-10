import { Tenant } from 'src/modules/tenants/entities/tenant.entity';
export declare abstract class TenantAwareEntity {
    id: string;
    tenantId: string;
    tenant: Tenant;
}
