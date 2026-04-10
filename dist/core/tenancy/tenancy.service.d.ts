import { Tenant } from 'src/modules/tenants/entities/tenant.entity';
export declare class TenancyService {
    private tenant;
    setTenant(tenant: Tenant): void;
    getTenant(): Tenant;
    getTenantId(): string;
}
