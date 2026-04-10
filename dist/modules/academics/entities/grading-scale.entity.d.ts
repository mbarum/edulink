import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class GradingScale extends TenantAwareEntity {
    grade: string;
    minMark: number;
    maxMark: number;
    gradePoint: number;
    remarks: string;
}
