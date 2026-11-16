import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
import { Student } from './student.entity';

@Entity({ name: 'enrollment_history' })
export class EnrollmentHistory extends TenantAwareEntity {
  @Column()
  studentId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ nullable: true })
  academicYearId: string;

  @Column({ nullable: true })
  classLevelId: string;

  @Column({ nullable: true })
  sectionId: string;

  @Column({ default: 'Promoted' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  promotedAt: Date;
}
