import { Job } from 'bull';
import { LmsService } from '../lms.service';
export declare class LmsSyncProcessor {
    private readonly lmsService;
    private readonly logger;
    constructor(lmsService: LmsService);
    handleSyncStudents(job: Job<{
        tenantId: string;
    }>): Promise<import("../providers/lms-provider.interface").LmsStudent[]>;
    handleSyncCourses(job: Job<{
        tenantId: string;
    }>): Promise<import("../providers/lms-provider.interface").LmsCourse[]>;
    handleGetGrades(job: Job<{
        tenantId: string;
        studentId: string;
    }>): Promise<import("../providers/lms-provider.interface").LmsGrade[]>;
}
