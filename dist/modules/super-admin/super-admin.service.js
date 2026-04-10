"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const subscription_enums_1 = require("../../common/subscription.enums");
const pending_payment_entity_1 = require("../payments/entities/pending-payment.entity");
const student_entity_1 = require("../students/entities/student.entity");
const attendance_entity_1 = require("../attendance/entities/attendance.entity");
const user_entity_1 = require("../users/entities/user.entity");
let SuperAdminService = class SuperAdminService {
    constructor(tenantRepository, pendingPaymentRepository, studentRepository, attendanceRepository, userRepository) {
        this.tenantRepository = tenantRepository;
        this.pendingPaymentRepository = pendingPaymentRepository;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }
    async getDashboardAnalytics() {
        const totalTenants = await this.tenantRepository.count();
        const activeSubscriptions = await this.tenantRepository.count({
            where: { subscriptionStatus: subscription_enums_1.SubscriptionStatus.ACTIVE },
        });
        const pendingApprovals = await this.pendingPaymentRepository.count({
            where: { isApproved: false },
        });
        const revenueResult = await this.pendingPaymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.isApproved = :isApproved', { isApproved: true })
            .getRawOne();
        const totalRevenue = Number(revenueResult?.total || 0);
        const totalStudents = await this.studentRepository.count();
        const totalAttendanceRecords = await this.attendanceRepository.count();
        const presentAttendanceRecords = await this.attendanceRepository.count({ where: { status: 'present' } });
        const averageAttendance = totalAttendanceRecords > 0
            ? Math.round((presentAttendanceRecords / totalAttendanceRecords) * 100)
            : 0;
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
    async getTenantById(id) {
        const tenant = await this.tenantRepository.findOneBy({ id });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant;
    }
    async getPendingPayments() {
        return this.pendingPaymentRepository.find({
            where: { isApproved: false },
            relations: ['tenant'],
        });
    }
    async updateTenantStatus(id, status) {
        const tenant = await this.getTenantById(id);
        tenant.subscriptionStatus = status;
        return this.tenantRepository.save(tenant);
    }
    async updatePaymentStatus(id, status) {
        const payment = await this.pendingPaymentRepository.findOneBy({ id });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        payment.isApproved = status === 'approved';
        return this.pendingPaymentRepository.save(payment);
    }
    async deleteTenant(id) {
        const result = await this.tenantRepository.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Tenant not found');
    }
    async getAllUsers() {
        return this.userRepository.find({
            select: ['id', 'username', 'role', 'tenantId'],
        });
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(1, (0, typeorm_1.InjectRepository)(pending_payment_entity_1.PendingPayment)),
    __param(2, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(3, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map