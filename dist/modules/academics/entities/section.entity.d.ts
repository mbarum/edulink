import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
import { ClassLevel } from './class-level.entity';
export declare class Section extends TenantAwareEntity {
    name: string;
    classLevel: ClassLevel;
    classLevelId: string;
    room: string;
}
