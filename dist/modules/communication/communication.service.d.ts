import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class CommunicationService extends TenantAwareCrudService<Message> {
    private readonly messageRepository;
    constructor(messageRepository: Repository<Message>, tenancyService: TenancyService);
}
