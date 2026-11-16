import { Entity, Column, Index } from 'typeorm';
import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';

@Entity({ name: 'books' })
@Index(['tenantId', 'title'])
@Index(['tenantId', 'isbn'])
export class Book extends TenantAwareEntity {
  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ nullable: true })
  isbn: string;

  @Column({ default: 'available' })
  status: 'available' | 'borrowed';
}
