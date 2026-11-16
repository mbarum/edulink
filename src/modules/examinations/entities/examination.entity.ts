import { Entity, Column, Index } from 'typeorm';
import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';

@Entity({ name: 'examinations' })
@Index(['tenantId', 'subjectId'])
@Index(['tenantId', 'date'])
export class Examination extends TenantAwareEntity {
  @Column()
  name: string;

  @Column()
  subjectId: string;

  @Column()
  date: Date;

  @Column('decimal', { precision: 5, scale: 2 })
  totalMarks: number;
}
