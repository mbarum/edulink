import { Entity, Column, Index } from 'typeorm';
import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';

@Entity({ name: 'messages' })
@Index(['tenantId', 'senderId'])
@Index(['tenantId', 'recipientId'])
export class Message extends TenantAwareEntity {
  @Column()
  senderId: string;

  @Column()
  recipientId: string;

  @Column('text')
  content: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;
}
