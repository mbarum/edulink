import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class Payroll extends TenantAwareEntity {
    staffId: string;
    salary: number;
    payDate: Date;
    status: 'paid' | 'unpaid';
}
