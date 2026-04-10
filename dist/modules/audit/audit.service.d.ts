import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
export declare class AuditService {
    private readonly auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    log(data: Partial<AuditLog>): Promise<void>;
    findByTenant(tenantId: string): Promise<AuditLog[]>;
}
