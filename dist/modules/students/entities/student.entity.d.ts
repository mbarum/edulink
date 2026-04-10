import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
import { ClassLevel } from 'src/modules/academics/entities/class-level.entity';
import { Section } from 'src/modules/academics/entities/section.entity';
import { AcademicYear } from 'src/modules/academics/entities/academic-year.entity';
export declare class Student extends TenantAwareEntity {
    firstName: string;
    lastName: string;
    registrationNumber: string;
    classLevel: ClassLevel;
    classLevelId: string;
    section: Section;
    sectionId: string;
    academicYear: AcademicYear;
    academicYearId: string;
    status: string;
    parentId: string;
}
