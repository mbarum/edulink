import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class ExpensesService extends TenantAwareCrudService<Expense> {
    private readonly expenseRepository;
    constructor(expenseRepository: Repository<Expense>, tenancyService: TenancyService);
}
