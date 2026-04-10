import { Repository } from 'typeorm';
import { Examination } from './entities/examination.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class ExaminationsService extends TenantAwareCrudService<Examination> {
    private readonly examinationRepository;
    constructor(examinationRepository: Repository<Examination>, tenancyService: TenancyService);
}
