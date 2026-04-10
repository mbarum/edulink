import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class Fee extends TenantAwareEntity {
    studentId: string;
    amount: number;
    dueDate: Date;
    status: 'paid' | 'unpaid' | 'overdue';
}
