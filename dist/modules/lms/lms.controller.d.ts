import { LmsService } from './lms.service';
import { ConnectLmsDto } from './dto/connect-lms.dto';
export declare class LmsController {
    private readonly lmsService;
    constructor(lmsService: LmsService);
    connect(connectLmsDto: ConnectLmsDto): Promise<import("./entities/lms-connection.entity").LmsConnection>;
    syncStudents(): {
        message: string;
    };
    syncCourses(): {
        message: string;
    };
    getGrades(studentId: string): Promise<{
        message: string;
        jobId: import("bull").JobId;
    }>;
}
