import { LmsProvider, LmsStudent, LmsCourse, LmsGrade } from './lms-provider.interface';
export declare class CanvasProvider implements LmsProvider {
    constructor();
    authenticate(): Promise<void>;
    syncStudents(): Promise<LmsStudent[]>;
    syncCourses(): Promise<LmsCourse[]>;
    getGrades(): Promise<LmsGrade[]>;
}
