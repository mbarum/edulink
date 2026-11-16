import { Entity, Column, Index } from 'typeorm';
import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';

@Entity({ name: 'fees' })
@Index(['tenantId', 'studentId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'dueDate'])
export class Fee extends TenantAwareEntity {
  @Column()
  studentId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  dueDate: Date;

  @Column({ default: 'unpaid' })
  status: 'paid' | 'unpaid' | 'overdue';
}
