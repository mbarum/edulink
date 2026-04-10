import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class CalendarEvent extends TenantAwareEntity {
    title: string;
    start: Date;
    end: Date;
    description: string;
}
