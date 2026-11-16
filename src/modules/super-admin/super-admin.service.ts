import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { join, extname } from 'path';
import { Tenant } from '../tenants/entities/tenant.entity';
import { SubscriptionStatus } from 'src/common/subscription.enums';
import { PendingPayment } from '../payments/entities/pending-payment.entity';
import { Student } from '../students/entities/student.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { User } from '../users/entities/user.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreatePlanDto } from '../subscriptions/dto/create-plan.dto';
import { UpdatePlanDto } from '../subscriptions/dto/update-plan.dto';
import { UpdateTenantSubscriptionDto } from './dto/update-tenant-subscription.dto';
import { PlatformSetting } from './entities/platform-setting.entity';
import { UpdatePlatformBrandingDto } from './dto/update-platform-branding.dto';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(PendingPayment)
    private readonly pendingPaymentRepository: Repository<PendingPayment>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PlatformSetting)
    private readonly platformSettingRepository: Repository<PlatformSetting>,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async getDashboardAnalytics() {
    const totalTenants = await this.tenantRepository.count();
    const activeSubscriptions = await this.tenantRepository.count({
      where: { subscriptionStatus: SubscriptionStatus.ACTIVE },
    });
    const pendingApprovals = await this.pendingPaymentRepository.count({
      where: { isApproved: false },
    });

    // Calculate total revenue from approved payments directly in SQL
    const revenueResult = await this.pendingPaymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.isApproved = :isApproved', { isApproved: true })
      .getRawOne();
    const totalRevenue = Number(revenueResult?.total || 0);

    // Get total students across all tenants
    const totalStudents = await this.studentRepository.count();

    // Calculate average attendance rate
    const totalAttendanceRecords = await this.attendanceRepository.count();
    const presentAttendanceRecords = await this.attendanceRepository.count({ where: { status: 'present' } });
    const averageAttendance = totalAttendanceRecords > 0 
      ? Math.round((presentAttendanceRecords / totalAttendanceRecords) * 100) 
      : 0;

    // Group tenants natively in SQL
    const tenantsByPlanResult = await this.tenantRepository
      .createQueryBuilder('tenant')
      .select('tenant.plan', 'plan')
      .addSelect('COUNT(tenant.id)', 'count')
      .groupBy('tenant.plan')
      .getRawMany();

    const tenantsByPlanArray = tenantsByPlanResult.map(res => ({
      name: res.plan,
      value: Number(res.count),
    }));

    // Generate revenue over time sequentially querying intervals mapping straight from SQL
    const revenueOverTime = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const monthResult = await this.pendingPaymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.isApproved = :isApproved', { isApproved: true })
        .andWhere('payment.createdAt >= :monthStart AND payment.createdAt <= :monthEnd', { monthStart, monthEnd })
        .getRawOne();

      revenueOverTime.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: Number(monthResult?.total || 0),
      });
    }

    // Get recent payments
    const recentPayments = await this.pendingPaymentRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['tenant'],
    });

    return {
      totalTenants,
      activeSubscriptions,
      pendingApprovals,
      totalRevenue,
      totalStudents,
      averageAttendance,
      tenantsByPlan: tenantsByPlanArray,
      revenueOverTime,
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        tenantName: p.tenant?.name || 'Unknown',
        amount: p.amount,
        method: p.method,
        status: p.isApproved ? 'Approved' : 'Pending',
        date: p.createdAt || new Date(),
      })),
    };
  }

  async getAllTenants() {
    const tenants = await this.tenantRepository.find();
    return Promise.all(
      tenants.map(async (t) => {
        const studentCount = await this.studentRepository.count({ where: { tenantId: t.id } });
        return {
          ...t,
          studentCount,
        };
      }),
    );
  }

  async getTenantById(id: string) {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    const studentCount = await this.studentRepository.count({ where: { tenantId: id } });
    return {
      ...tenant,
      studentCount,
    };
  }

  async getPendingPayments() {
    return this.pendingPaymentRepository.find({
      where: { isApproved: false },
      relations: ['tenant'],
    });
  }

  async updateTenantStatus(id: string, status: string) {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) throw new NotFoundException('Tenant not found');
    tenant.subscriptionStatus = status as SubscriptionStatus;
    return this.tenantRepository.save(tenant);
  }

  async updatePaymentStatus(id: string, status: string) {
    const payment = await this.pendingPaymentRepository.findOne({
      where: { id },
      relations: ['tenant'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.isApproved = status === 'approved';

    if (payment.isApproved && payment.tenant) {
      payment.tenant.subscriptionStatus = SubscriptionStatus.ACTIVE;
      if (payment.plan) {
        payment.tenant.plan = payment.plan;
      }
      const days = payment.billingCycle === 'annual' ? 365 : 30;
      payment.tenant.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      await this.tenantRepository.save(payment.tenant);
    }

    return this.pendingPaymentRepository.save(payment);
  }

  async deleteTenant(id: string) {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return this.tenantRepository.remove(tenant);
  }

  async getAllUsers() {
    return this.userRepository.find({
      relations: ['tenant'],
      select: ['id', 'username', 'role', 'tenantId'],
    });
  }

  // ---------------------------------------------------------------------------
  // Superadmin Package / Plan Management (Full Control)
  // ---------------------------------------------------------------------------

  async getAllPlans() {
    return this.subscriptionsService.getAllPlans(false);
  }

  async getPlanById(id: string) {
    return this.subscriptionsService.getPlanById(id);
  }

  async createPlan(dto: CreatePlanDto) {
    return this.subscriptionsService.createPlan(dto);
  }

  async updatePlan(id: string, dto: UpdatePlanDto) {
    return this.subscriptionsService.updatePlan(id, dto);
  }

  async deletePlan(id: string) {
    return this.subscriptionsService.deletePlan(id);
  }

  async updateTenantSubscription(id: string, dto: UpdateTenantSubscriptionDto) {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (dto.plan !== undefined) tenant.plan = dto.plan;
    if (dto.planId !== undefined) tenant.planId = dto.planId;
    if (dto.billingModel !== undefined) tenant.billingModel = dto.billingModel;
    if (dto.billingInterval !== undefined) tenant.billingInterval = dto.billingInterval;
    if (dto.customRate !== undefined) tenant.customRate = dto.customRate;
    if (dto.subscriptionStatus !== undefined) tenant.subscriptionStatus = dto.subscriptionStatus;

    return this.tenantRepository.save(tenant);
  }

  // ---------------------------------------------------------------------------
  // Superadmin Branding Management (Logo & Favicon Control)
  // ---------------------------------------------------------------------------

  async getPlatformBranding(): Promise<PlatformSetting> {
    let setting = await this.platformSettingRepository.findOneBy({ id: 'global' });
    if (!setting) {
      setting = this.platformSettingRepository.create({
        id: 'global',
        platformName: 'SaaSLink',
        tagline: 'Multi-Tenant Education Management Information System',
        logoUrl: null,
        faviconUrl: null,
      });
      setting = await this.platformSettingRepository.save(setting);
    }
    return setting;
  }

  async updatePlatformBranding(dto: UpdatePlatformBrandingDto): Promise<PlatformSetting> {
    const setting = await this.getPlatformBranding();
    if (dto.platformName !== undefined) setting.platformName = dto.platformName;
    if (dto.tagline !== undefined) setting.tagline = dto.tagline;
    if (dto.logoUrl !== undefined) setting.logoUrl = dto.logoUrl;
    if (dto.faviconUrl !== undefined) setting.faviconUrl = dto.faviconUrl;
    return this.platformSettingRepository.save(setting);
  }

  async saveBrandingAsset(file: Express.Multer.File, type: 'logo' | 'favicon'): Promise<PlatformSetting> {
    if (!file) {
      throw new BadRequestException('No file provided for upload.');
    }

    // Target directory: public/uploads/branding/
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'branding');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileExt = extname(file.originalname).toLowerCase() || (type === 'favicon' ? '.ico' : '.png');
    const filename = `${type}-${Date.now()}${fileExt}`;
    const destinationPath = join(uploadsDir, filename);

    fs.writeFileSync(destinationPath, file.buffer);

    const relativeUrl = `/uploads/branding/${filename}`;
    const setting = await this.getPlatformBranding();
    if (type === 'logo') {
      setting.logoUrl = relativeUrl;
    } else {
      setting.faviconUrl = relativeUrl;
    }
    return this.platformSettingRepository.save(setting);
  }
}
