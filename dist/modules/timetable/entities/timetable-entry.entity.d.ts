import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class TimetableEntry extends TenantAwareEntity {
    classLevel: string;
    dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    startTime: string;
    endTime: string;
    subjectId: string;
    teacherId: string;
}
