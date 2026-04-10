import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
import { Student } from 'src/modules/students/entities/student.entity';
export declare class Attendance extends TenantAwareEntity {
    studentId: string;
    student: Student;
    classLevelId: string;
    date: Date;
    status: 'present' | 'absent' | 'late';
}
