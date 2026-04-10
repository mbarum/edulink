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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const pending_payment_entity_1 = require("./entities/pending-payment.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_role_enum_1 = require("../../common/user-role.enum");
const tenancy_service_1 = require("../../core/tenancy/tenancy.service");
const subscription_enums_1 = require("../../common/subscription.enums");
const email_service_1 = require("../../shared/email.service");
let PaymentsService = class PaymentsService {
    constructor(tenantRepository, pendingPaymentRepository, userRepository, tenancyService, emailService) {
        this.tenantRepository = tenantRepository;
        this.pendingPaymentRepository = pendingPaymentRepository;
        this.userRepository = userRepository;
        this.tenancyService = tenancyService;
        this.emailService = emailService;
    }
    async createBankTransferRequest(amount, reference, plan, billingCycle) {
        const tenantId = this.tenancyService.getTenantId();
        const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        const pendingPayment = this.pendingPaymentRepository.create({
            tenant,
            amount,
            reference,
            method: pending_payment_entity_1.PaymentMethod.BANK_TRANSFER,
            plan,
            billingCycle,
        });
        const savedPayment = await this.pendingPaymentRepository.save(pendingPayment);
        const admins = await this.userRepository.find({
            where: { tenantId, role: user_role_enum_1.UserRole.ADMIN },
        });
        for (const admin of admins) {
            await this.emailService.sendEmail(admin.username, 'Bank Transfer Instructions - SaaSLink', `<p>Dear Admin,</p>
        <p>We have received your request to pay <strong>KES ${amount}</strong> via Bank Transfer for the <strong>${plan}</strong> plan (${billingCycle}).</p>
        <p>Please use the following reference when making the transfer:</p>
        <h3>Reference: ${reference}</h3>
        <p><strong>Bank Details:</strong></p>
        <ul>
          <li>Bank: SaaSLink Technologies Bank</li>
          <li>Account Name: SaaSLink Tech</li>
          <li>Account Number: 1234567890</li>
        </ul>
        <p>Once we receive the payment, your account will be activated automatically.</p>`);
        }
        return savedPayment;
    }
    async approvePayment(paymentId) {
        const pendingPayment = await this.pendingPaymentRepository.findOne({
            where: { id: paymentId },
            relations: ['tenant'],
        });
        if (!pendingPayment) {
            throw new common_1.NotFoundException('Pending payment not found');
        }
        pendingPayment.isApproved = true;
        await this.pendingPaymentRepository.save(pendingPayment);
        const tenant = pendingPayment.tenant;
        tenant.subscriptionStatus = subscription_enums_1.SubscriptionStatus.ACTIVE;
        if (pendingPayment.plan) {
            tenant.plan = pendingPayment.plan;
        }
        const baseDate = tenant.expiresAt && tenant.expiresAt > new Date()
            ? new Date(tenant.expiresAt)
            : new Date();
        if (pendingPayment.billingCycle === 'annual') {
            baseDate.setFullYear(baseDate.getFullYear() + 1);
        }
        else {
            baseDate.setMonth(baseDate.getMonth() + 1);
        }
        tenant.expiresAt = baseDate;
        return this.tenantRepository.save(tenant);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(1, (0, typeorm_1.InjectRepository)(pending_payment_entity_1.PendingPayment)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        tenancy_service_1.TenancyService,
        email_service_1.EmailService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map