import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class Examination extends TenantAwareEntity {
    name: string;
    subjectId: string;
    date: Date;
    totalMarks: number;
}
