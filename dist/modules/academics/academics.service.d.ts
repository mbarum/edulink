import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class AcademicsService extends TenantAwareCrudService<Subject> {
    private readonly subjectRepository;
    constructor(subjectRepository: Repository<Subject>, tenancyService: TenancyService);
}
