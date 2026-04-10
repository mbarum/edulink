import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class Staff extends TenantAwareEntity {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    phone: string;
}
