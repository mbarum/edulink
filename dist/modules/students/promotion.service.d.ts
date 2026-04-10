import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
export declare class PromotionService {
    private readonly studentRepository;
    private readonly tenancyService;
    constructor(studentRepository: Repository<Student>, tenancyService: TenancyService);
    promoteStudents(studentIds: string[], nextClassLevelId: string, nextSectionId: string, nextAcademicYearId: string): Promise<void>;
    graduateStudents(studentIds: string[]): Promise<void>;
}
