import { Repository } from 'typeorm';
import { CalendarEvent } from './entities/calendar-event.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class CalendarService extends TenantAwareCrudService<CalendarEvent> {
    private readonly calendarEventRepository;
    constructor(calendarEventRepository: Repository<CalendarEvent>, tenancyService: TenancyService);
}
