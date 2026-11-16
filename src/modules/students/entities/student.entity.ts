import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
import { ClassLevel } from 'src/modules/academics/entities/class-level.entity';
import { Section } from 'src/modules/academics/entities/section.entity';
import { AcademicYear } from 'src/modules/academics/entities/academic-year.entity';

@Index(['tenantId', 'classLevelId'])
@Index(['tenantId', 'sectionId'])
@Index(['tenantId', 'academicYearId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'parentId'])
@Entity({ name: 'students' })
export class Student extends TenantAwareEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  dateOfBirth?: string;

  @Column({ type: 'boolean', default: false })
  parentalConsentVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  consentTimestamp?: Date;

  @ManyToOne(() => ClassLevel)
  classLevel: ClassLevel;

  @Column({ nullable: true })
  classLevelId: string;

  @ManyToOne(() => Section)
  section: Section;

  @Column({ nullable: true })
  sectionId: string;

  @ManyToOne(() => AcademicYear)
  academicYear: AcademicYear;

  @Column({ nullable: true })
  academicYearId: string;

  @Column({ default: 'Active' })
  status: string; // Active, Graduated, Transferred, Suspended

  @Column({ nullable: true })
  parentId: string;

  // New Comprehensive Parent Onboarding Fields
  @Column({ nullable: true })
  parentName: string;

  @Column({ nullable: true })
  parentEmail: string;

  @Column({ nullable: true })
  parentPhone: string;

  @Column({ nullable: true })
  parentEmergencyContact: string;
}
