import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class Subject extends TenantAwareEntity {
    name: string;
    classLevel: string;
    teacherId: string;
}
