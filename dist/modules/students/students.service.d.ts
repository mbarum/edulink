import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class StudentsService extends TenantAwareCrudService<Student> {
    private readonly studentRepository;
    constructor(studentRepository: Repository<Student>, tenancyService: TenancyService);
}
