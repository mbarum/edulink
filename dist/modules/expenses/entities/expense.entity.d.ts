import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class Expense extends TenantAwareEntity {
    category: string;
    amount: number;
    date: Date;
    description: string;
}
