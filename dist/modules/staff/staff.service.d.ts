import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class StaffService extends TenantAwareCrudService<Staff> {
    private readonly staffRepository;
    constructor(staffRepository: Repository<Staff>, tenancyService: TenancyService);
}
