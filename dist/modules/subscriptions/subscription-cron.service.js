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
var SubscriptionCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_role_enum_1 = require("../../common/user-role.enum");
const subscription_enums_1 = require("../../common/subscription.enums");
const email_service_1 = require("../../shared/email.service");
let SubscriptionCronService = SubscriptionCronService_1 = class SubscriptionCronService {
    constructor(tenantRepository, userRepository, emailService) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.logger = new common_1.Logger(SubscriptionCronService_1.name);
    }
    async getTenantAdminEmails(tenantId) {
        const admins = await this.userRepository.find({
            where: {
                tenantId,
                role: user_role_enum_1.UserRole.ADMIN,
            },
        });
        return admins.map(admin => admin.username);
    }
    async handleSubscriptionExpirations() {
        this.logger.log('Checking for expired subscriptions...');
        const now = new Date();
        const expiredTenants = await this.tenantRepository.find({
            where: {
                expiresAt: (0, typeorm_2.LessThan)(now),
                subscriptionStatus: subscription_enums_1.SubscriptionStatus.ACTIVE,
            },
        });
        for (const tenant of expiredTenants) {
            if (tenant.plan !== subscription_enums_1.SubscriptionPlan.FREE) {
                tenant.subscriptionStatus = subscription_enums_1.SubscriptionStatus.PAST_DUE;
                await this.tenantRepository.save(tenant);
                this.logger.log(`Tenant ${tenant.name} subscription marked as PAST_DUE`);
                const adminEmails = await this.getTenantAdminEmails(tenant.id);
                for (const email of adminEmails) {
                    await this.emailService.sendEmail(email, 'Your Subscription Has Expired', `<p>Dear Admin,</p><p>Your subscription for <strong>${tenant.name}</strong> has expired. Your account is now locked.</p><p>Please log in and update your payment details to unlock your account.</p>`);
                }
            }
        }
    }
    async handleSubscriptionReminders() {
        this.logger.log('Checking for upcoming subscription renewals...');
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);
        const expiringSoonTenants = await this.tenantRepository.find({
            where: [
                {
                    expiresAt: (0, typeorm_2.Between)(new Date(threeDaysFromNow.setHours(0, 0, 0, 0)), new Date(threeDaysFromNow.setHours(23, 59, 59, 999))),
                    subscriptionStatus: subscription_enums_1.SubscriptionStatus.ACTIVE,
                },
                {
                    expiresAt: (0, typeorm_2.Between)(new Date(sevenDaysFromNow.setHours(0, 0, 0, 0)), new Date(sevenDaysFromNow.setHours(23, 59, 59, 999))),
                    subscriptionStatus: subscription_enums_1.SubscriptionStatus.ACTIVE,
                },
            ],
        });
        for (const tenant of expiringSoonTenants) {
            if (tenant.plan !== subscription_enums_1.SubscriptionPlan.FREE) {
                this.logger.log(`Sending renewal reminder to tenant ${tenant.name}`);
                const adminEmails = await this.getTenantAdminEmails(tenant.id);
                for (const email of adminEmails) {
                    await this.emailService.sendEmail(email, 'Subscription Renewal Reminder', `<p>Dear Admin,</p><p>Your subscription for <strong>${tenant.name}</strong> is expiring soon on ${tenant.expiresAt.toDateString()}.</p><p>Please ensure your payment details are up to date to avoid service interruption.</p>`);
                }
            }
        }
    }
};
exports.SubscriptionCronService = SubscriptionCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionCronService.prototype, "handleSubscriptionExpirations", null);
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionCronService.prototype, "handleSubscriptionReminders", null);
exports.SubscriptionCronService = SubscriptionCronService = SubscriptionCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], SubscriptionCronService);
//# sourceMappingURL=subscription-cron.service.js.map