import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class SectionsService extends TenantAwareCrudService<Section> {
    private readonly sectionRepository;
    constructor(sectionRepository: Repository<Section>, tenancyService: TenancyService);
}
