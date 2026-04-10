import { Repository } from 'typeorm';
import { ReportCard } from './entities/report-card.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class ReportCardsService extends TenantAwareCrudService<ReportCard> {
    private readonly reportCardRepository;
    constructor(reportCardRepository: Repository<ReportCard>, tenancyService: TenancyService);
}
