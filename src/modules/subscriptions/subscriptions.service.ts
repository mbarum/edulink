import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { BillingModel, BillingInterval } from 'src/common/subscription.enums';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
    private readonly tenancyService: TenancyService,
  ) {}

  private getStripe(): Stripe {
    if (!this.stripe) {
      const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
      if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY not found in environment variables.');
      }
      this.stripe = new Stripe(secretKey);
    }
    return this.stripe;
  }

  // ---------------------------------------------------------------------------
  // Plan Management & Discovery
  // ---------------------------------------------------------------------------

  async getAllPlans(activeOnly = false): Promise<SubscriptionPlan[]> {
    let whereCondition: Record<string, any> = {};
    if (activeOnly) {
      whereCondition = { isActive: true };
    }

    let plans = await this.planRepository.find({
      where: whereCondition,
      order: { price: 'ASC' },
    });

    // Auto-seed baseline packages if table is currently empty
    if (plans.length === 0) {
      const seedPlans: Partial<SubscriptionPlan>[] = [
        {
          name: 'Basic School Plan',
          description: 'Designed for early-stage schools managing foundational records and daily registers.',
          price: 1000,
          billingModel: BillingModel.FLAT_FEE,
          interval: BillingInterval.MONTH,
          currency: 'KES',
          maxStudents: 150,
          trialDays: 14,
          features: [
            'Student Records & Profiles',
            'Fee Management & Invoicing',
            'Basic Accounting & Expenses',
            'Daily Attendance Tracking',
          ],
          isActive: true,
        },
        {
          name: 'Standard Term Plan',
          description: 'Comprehensive package billed per school term for growing primary & secondary institutions.',
          price: 5500,
          billingModel: BillingModel.FLAT_FEE,
          interval: BillingInterval.TERM,
          currency: 'KES',
          maxStudents: 500,
          trialDays: 0,
          features: [
            'All Basic Features',
            'LMS & Learning Modules',
            'Parent Portal & Results',
            'SMS & WhatsApp Notifications',
            'Examination Marks & Term GPA',
            'Class Timetabling',
          ],
          isActive: true,
        },
        {
          name: 'Per-Student Term Plan',
          description: 'Dynamic billing scaled to exact active student enrollment per term. Pay only for who attends.',
          price: 150,
          billingModel: BillingModel.PER_STUDENT,
          interval: BillingInterval.TERM,
          currency: 'KES',
          maxStudents: 0, // unlimited
          trialDays: 0,
          features: [
            'All Standard Features',
            'Dynamic Enrollment-Based Invoicing',
            'Pay-As-You-Grow Flexibility',
            'Termly Automated Student Count Reconciliation',
            'Staff Payroll & Human Resources',
            'Advanced Multi-Subject Report Cards',
          ],
          isActive: true,
        },
        {
          name: 'Enterprise Premium',
          description: 'Full-featured enterprise suite with unlimited capacity, multi-campus, and SLA support.',
          price: 15000,
          billingModel: BillingModel.FLAT_FEE,
          interval: BillingInterval.TERM,
          currency: 'KES',
          maxStudents: 0, // unlimited
          trialDays: 0,
          features: [
            'All System Modules Included',
            'Unlimited Students & Staff',
            'Multi-Campus / Multi-Branch Oversight',
            'Advanced Analytics & Longitudinal EMIS Reporting',
            'Dedicated 24/7 Account Manager & Priority SLA',
          ],
          isActive: true,
        },
      ];

      for (const p of seedPlans) {
        await this.planRepository.save(this.planRepository.create(p));
      }

      plans = await this.planRepository.find({
        where: whereCondition,
        order: { price: 'ASC' },
      });
    }

    return plans;
  }

  async getPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOneBy({ id });
    if (!plan) {
      throw new NotFoundException(`Subscription plan ${id} not found`);
    }
    return plan;
  }

  async createPlan(dto: CreatePlanDto): Promise<SubscriptionPlan> {
    const plan = this.planRepository.create({
      ...dto,
      currency: dto.currency || 'KES',
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
    return this.planRepository.save(plan);
  }

  async updatePlan(id: string, dto: UpdatePlanDto): Promise<SubscriptionPlan> {
    const plan = await this.getPlanById(id);
    Object.assign(plan, dto);
    return this.planRepository.save(plan);
  }

  async deletePlan(id: string): Promise<{ success: boolean; message: string }> {
    const plan = await this.getPlanById(id);
    await this.planRepository.remove(plan);
    return { success: true, message: `Package ${plan.name} removed successfully.` };
  }

  // ---------------------------------------------------------------------------
  // Stripe Checkout & Billing Portal
  // ---------------------------------------------------------------------------

  async createCheckoutSession(priceId: string): Promise<{ sessionId: string }> {
    const tenantId = this.tenancyService.getTenantId();
    const tenant = await this.tenantRepository.findOneBy({ id: tenantId });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    let stripeCustomerId = tenant.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.getStripe().customers.create({
        name: tenant.name,
        metadata: {
          tenantId: tenant.id,
        },
      });
      stripeCustomerId = customer.id;
      await this.tenantRepository.update(tenant.id, { stripeCustomerId });
    }

    const session = await this.getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      customer: stripeCustomerId,
      success_url: `${this.configService.get('FRONTEND_URL')}/dashboard?payment_success=true`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/pricing?payment_canceled=true`,
    });

    return { sessionId: session.id };
  }

  async createBillingPortalSession(): Promise<{ url: string }> {
    const tenantId = this.tenancyService.getTenantId();
    const tenant = await this.tenantRepository.findOneBy({ id: tenantId });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!tenant.stripeCustomerId) {
      throw new Error('Tenant does not have a Stripe customer ID.');
    }

    const portalSession = await this.getStripe().billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${this.configService.get('FRONTEND_URL')}/dashboard`,
    });

    return { url: portalSession.url };
  }
}
