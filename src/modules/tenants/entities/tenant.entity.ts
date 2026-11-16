import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  BillingModel,
  BillingInterval,
} from 'src/common/subscription.enums';

@Entity({ name: 'tenants' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  domain: string;

  @Column({
    type: 'simple-enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  plan: SubscriptionPlan | string;

  @Column({ nullable: true })
  planId: string;

  @Column({
    type: 'simple-enum',
    enum: BillingModel,
    default: BillingModel.FLAT_FEE,
  })
  billingModel: BillingModel;

  @Column({
    type: 'simple-enum',
    enum: BillingInterval,
    default: BillingInterval.MONTH,
  })
  billingInterval: BillingInterval;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  customRate: number; // Custom flat rate or custom per-student rate override

  @Column({
    type: 'simple-enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  subscriptionStatus: SubscriptionStatus;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true, name: 'stripe_customer_id' })
  stripeCustomerId: string;
}
