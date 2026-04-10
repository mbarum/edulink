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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stripe_1 = __importDefault(require("stripe"));
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const tenancy_service_1 = require("../../core/tenancy/tenancy.service");
let SubscriptionsService = class SubscriptionsService {
    constructor(configService, tenantRepository, tenancyService) {
        this.configService = configService;
        this.tenantRepository = tenantRepository;
        this.tenancyService = tenancyService;
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
    async createCheckoutSession(priceId) {
        const tenantId = this.tenancyService.getTenantId();
        const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
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
    async createBillingPortalSession() {
        const tenantId = this.tenancyService.getTenantId();
        const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
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
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        tenancy_service_1.TenancyService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map