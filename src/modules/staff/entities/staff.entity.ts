import { Entity, Column, Index } from 'typeorm';
import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';

@Entity({ name: 'staff' })
@Index(['tenantId', 'email'])
@Index(['tenantId', 'role'])
export class Staff extends TenantAwareEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  role: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;
}
