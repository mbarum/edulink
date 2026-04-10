import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class LibraryService extends TenantAwareCrudService<Book> {
    private readonly bookRepository;
    constructor(bookRepository: Repository<Book>, tenancyService: TenancyService);
}
