import { Repository } from 'typeorm';
import { GradingScale } from './entities/grading-scale.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class GradingService extends TenantAwareCrudService<GradingScale> {
    private readonly gradingScaleRepository;
    constructor(gradingScaleRepository: Repository<GradingScale>, tenancyService: TenancyService);
    calculateGrade(marks: number): Promise<GradingScale | null>;
    getGradeForMark(marks: number): Promise<GradingScale | null>;
    calculateGPA(studentMarks: {
        subjectId: string;
        marks: number;
    }[]): Promise<number>;
}
