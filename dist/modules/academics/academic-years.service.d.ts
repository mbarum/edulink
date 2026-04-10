import { Repository } from 'typeorm';
import { AcademicYear } from './entities/academic-year.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class AcademicYearsService extends TenantAwareCrudService<AcademicYear> {
    private readonly academicYearRepository;
    constructor(academicYearRepository: Repository<AcademicYear>, tenancyService: TenancyService);
    setCurrent(id: string): Promise<void>;
}
