import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class ReportCard extends TenantAwareEntity {
    studentId: string;
    examinationId: string;
    marks: number;
    grade: string;
    remarks: string;
}
