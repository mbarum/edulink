import { Repository } from 'typeorm';
import { TimetableEntry } from './entities/timetable-entry.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class TimetableService extends TenantAwareCrudService<TimetableEntry> {
    private readonly timetableEntryRepository;
    constructor(timetableEntryRepository: Repository<TimetableEntry>, tenancyService: TenancyService);
}
