export interface LmsStudent {
    id: string;
    name: string;
    email: string;
}
export interface LmsCourse {
    id: string;
    name: string;
}
export interface LmsGrade {
    courseId: string;
    studentId: string;
    grade: number | string;
    remarks?: string;
}
export interface LmsProvider {
    authenticate(): Promise<void>;
    syncStudents(): Promise<LmsStudent[]>;
    syncCourses(): Promise<LmsCourse[]>;
    getGrades(studentId: string): Promise<LmsGrade[]>;
}
