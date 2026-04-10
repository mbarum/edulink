import { Repository } from 'typeorm';
import { Payroll } from './entities/payroll.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class PayrollService extends TenantAwareCrudService<Payroll> {
    private readonly payrollRepository;
    constructor(payrollRepository: Repository<Payroll>, tenancyService: TenancyService);
}
