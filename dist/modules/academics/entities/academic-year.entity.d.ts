import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class AcademicYear extends TenantAwareEntity {
    name: string;
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
}
