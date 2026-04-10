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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stripe_1 = __importDefault(require("stripe"));
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const subscription_enums_1 = require("../../common/subscription.enums");
let StripeWebhookController = class StripeWebhookController {
    constructor(configService, tenantRepository) {
        this.configService = configService;
        this.tenantRepository = tenantRepository;
    }
    getStripe() {
        if (!this.stripe) {
            const secretKey = this.configService.get('STRIPE_SECRET_KEY');
            if (!secretKey) {
                throw new Error('STRIPE_SECRET_KEY not found in environment variables.');
            }
            this.stripe = new stripe_1.default(secretKey);
        }
        return this.stripe;
    }
    async handleWebhook(signature, req) {
        let event;
        try {
            const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
            if (!webhookSecret) {
                throw new Error('STRIPE_WEBHOOK_SECRET not found in environment variables.');
            }
            if (!req.rawBody) {
                throw new Error('Raw body not found in request.');
            }
            event = this.getStripe().webhooks.constructEvent(req.rawBody, signature, webhookSecret);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            throw new common_1.BadRequestException(`Webhook Error: ${message}`);
        }
        switch (event.type) {
            case 'customer.subscription.updated':
            case 'customer.subscription.created': {
                const subscription = event.data.object;
                await this.updateTenantSubscriptionStatus(subscription);
                break;
            }
            case 'customer.subscription.deleted': {
                const deletedSubscription = event.data.object;
                await this.handleSubscriptionCanceled(deletedSubscription);
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        return { received: true };
    }
    async updateTenantSubscriptionStatus(subscription) {
        const stripeCustomerId = subscription.customer;
        const tenant = await this.tenantRepository.findOneBy({ stripeCustomerId });
        if (tenant) {
            tenant.subscriptionStatus = subscription.status;
            tenant.expiresAt = new Date(subscription.current_period_end * 1000);
            const priceId = subscription.items.data[0].price.id;
            if (priceId.includes('basic')) {
                tenant.plan = subscription_enums_1.SubscriptionPlan.BASIC;
            }
            else if (priceId.includes('standard')) {
                tenant.plan = subscription_enums_1.SubscriptionPlan.STANDARD;
            }
            else if (priceId.includes('premium')) {
                tenant.plan = subscription_enums_1.SubscriptionPlan.PREMIUM;
            }
            else if (priceId.includes('enterprise')) {
                tenant.plan = subscription_enums_1.SubscriptionPlan.ENTERPRISE;
            }
            await this.tenantRepository.save(tenant);
        }
    }
    async handleSubscriptionCanceled(subscription) {
        const stripeCustomerId = subscription.customer;
        const tenant = await this.tenantRepository.findOneBy({ stripeCustomerId });
        if (tenant) {
            tenant.subscriptionStatus = subscription_enums_1.SubscriptionStatus.CANCELED;
            await this.tenantRepository.save(tenant);
        }
    }
};
exports.StripeWebhookController = StripeWebhookController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StripeWebhookController.prototype, "handleWebhook", null);
exports.StripeWebhookController = StripeWebhookController = __decorate([
    (0, common_1.Controller)('stripe-webhook'),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], StripeWebhookController);
//# sourceMappingURL=stripe-webhook.controller.js.map