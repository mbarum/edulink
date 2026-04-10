import { Repository } from 'typeorm';
import { Fee } from './entities/fee.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class FeesService extends TenantAwareCrudService<Fee> {
    private readonly feeRepository;
    constructor(feeRepository: Repository<Fee>, tenancyService: TenancyService);
}
