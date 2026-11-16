import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BillingModel, BillingInterval } from 'src/common/subscription.enums';

export type PlanInterval = BillingInterval;
export const PlanInterval = BillingInterval;

@Entity({ name: 'subscription_plans' })
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'Starter School Plan', 'Per-Student Term Plan'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number; // Flat fee amount or rate per student

  @Column({
    type: 'simple-enum',
    enum: BillingModel,
    default: BillingModel.FLAT_FEE,
  })
  billingModel: BillingModel; // 'flat_fee' | 'per_student'

  @Column({
    type: 'simple-enum',
    enum: BillingInterval,
    default: BillingInterval.MONTH,
  })
  interval: BillingInterval; // 'month' | 'term' | 'year'

  @Column({ default: 'KES' })
  currency: string; // 'KES', 'USD', etc.

  @Column({ nullable: true })
  maxStudents: number; // null or 0 for unlimited

  @Column({ default: 0 })
  trialDays: number;

  @Column({ nullable: true })
  stripePriceId: string;

  @Column('simple-json', { nullable: true })
  features: string[];

  @Column({ default: true })
  isActive: boolean;
}
