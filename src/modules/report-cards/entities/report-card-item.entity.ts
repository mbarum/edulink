import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
import { ReportCard } from './report-card.entity';

@Entity({ name: 'report_card_items' })
export class ReportCardItem extends TenantAwareEntity {
  @Column()
  reportCardId: string;

  @ManyToOne(() => ReportCard, (rc) => rc.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportCardId' })
  reportCard: ReportCard;

  @Column()
  subjectId: string;

  @Column({ nullable: true })
  subjectName: string;

  @Column('decimal', { precision: 5, scale: 2 })
  marks: number;

  @Column({ nullable: true })
  grade: string;

  @Column({ nullable: true })
  remarks: string;

  @Column({ nullable: true })
  subjectPosition: number;
}
