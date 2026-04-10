import { LmsProvider, LmsStudent, LmsCourse, LmsGrade } from './lms-provider.interface';
import { LmsConnection } from '../entities/lms-connection.entity';
import { CryptoService } from 'src/shared/crypto.service';
import { ConfigService } from '@nestjs/config';
export declare class GoogleClassroomProvider implements LmsProvider {
    private readonly connection;
    private readonly cryptoService;
    private readonly configService;
    private oauth2Client;
    private classroom;
    constructor(connection: LmsConnection, cryptoService: CryptoService, configService: ConfigService);
    authenticate(): Promise<void>;
    syncStudents(): Promise<LmsStudent[]>;
    syncCourses(): Promise<LmsCourse[]>;
    getGrades(studentId: string): Promise<LmsGrade[]>;
}
