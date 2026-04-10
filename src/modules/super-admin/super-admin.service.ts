import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { SubscriptionStatus } from 'src/common/subscription.enums';
import { PendingPayment } from '../payments/entities/pending-payment.entity';
import { Student } from '../students/entities/student.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { User } from '../users/entities/user.entity';

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
    return this.tenantRepository.find();
  }

  async getTenantById(id: string) {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async getPendingPayments() {
    return this.pendingPaymentRepository.find({
      where: { isApproved: false },
      relations: ['tenant'],
    });
  }

  async updateTenantStatus(id: string, status: string) {
    const tenant = await this.getTenantById(id);
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
    const result = await this.tenantRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Tenant not found');
  }

  async getAllUsers() {
    return this.userRepository.find({
      select: ['id', 'username', 'role', 'tenantId'],
    });
  }
}
