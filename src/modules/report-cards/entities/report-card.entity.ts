import { Entity, Column, OneToMany, Index } from 'typeorm';
import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
import { ReportCardItem } from './report-card-item.entity';

@Entity({ name: 'report_cards' })
@Index(['tenantId', 'studentId'])
@Index(['tenantId', 'examinationId'])
export class ReportCard extends TenantAwareEntity {
  @Column()
  studentId: string;

  @Column({ nullable: true })
  examinationId: string;

  @Column({ nullable: true })
  term: string;

  @Column({ nullable: true })
  academicYearId: string;

  // Single mark for legacy/simple tests
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  marks: number;

  @Column({ nullable: true })
  grade: string;

  @Column({ nullable: true })
  remarks: string;

  // Composite multi-subject evaluation
  @Column('decimal', { precision: 7, scale: 2, nullable: true })
  totalMarks: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  averageMarks: number;

  @Column({ nullable: true })
  gpa: string;

  @Column({ nullable: true })
  overallGrade: string;

  @Column({ nullable: true })
  principalRemarks: string;

  @Column({ nullable: true })
  teacherRemarks: string;

  @OneToMany(() => ReportCardItem, (item) => item.reportCard, {
    cascade: true,
    eager: true,
  })
  items: ReportCardItem[];
}
