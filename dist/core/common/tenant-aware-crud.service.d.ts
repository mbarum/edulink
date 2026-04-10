import { Repository, DeepPartial, FindManyOptions } from 'typeorm';
import { TenancyService } from '../tenancy/tenancy.service';
import { TenantAwareEntity } from '../tenancy/tenant-aware.entity';
export declare abstract class TenantAwareCrudService<T extends TenantAwareEntity> {
    private readonly repository;
    protected readonly tenancyService: TenancyService;
    protected constructor(repository: Repository<T>, tenancyService: TenancyService);
    create(createDto: DeepPartial<T>): Promise<T>;
    findAll(options?: FindManyOptions<T>): Promise<T[]>;
    findOne(id: string): Promise<T>;
    update(id: string, updateDto: DeepPartial<T>): Promise<T>;
    remove(id: string): Promise<void>;
}
