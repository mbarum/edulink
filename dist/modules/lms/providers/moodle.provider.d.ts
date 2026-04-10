import { LmsProvider, LmsStudent, LmsCourse, LmsGrade } from './lms-provider.interface';
import { LmsConnection } from '../entities/lms-connection.entity';
import { CryptoService } from 'src/shared/crypto.service';
export declare class MoodleProvider implements LmsProvider {
    private readonly connection;
    private readonly cryptoService;
    private token;
    private apiUrl;
    constructor(connection: LmsConnection, cryptoService: CryptoService);
    authenticate(): Promise<void>;
    syncStudents(): Promise<LmsStudent[]>;
    syncCourses(): Promise<LmsCourse[]>;
    getGrades(studentId: string): Promise<LmsGrade[]>;
    private makeRequest;
}
