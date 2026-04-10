import { Repository } from 'typeorm';
import { ClassLevel } from './entities/class-level.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class ClassLevelsService extends TenantAwareCrudService<ClassLevel> {
    private readonly classLevelRepository;
    constructor(classLevelRepository: Repository<ClassLevel>, tenancyService: TenancyService);
    findAllWithSections(): Promise<ClassLevel[]>;
}
