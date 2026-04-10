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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionGuard = exports.SKIP_SUBSCRIPTION_CHECK = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const tenants_service_1 = require("../../tenants/tenants.service");
const subscription_enums_1 = require("../../../common/subscription.enums");
exports.SKIP_SUBSCRIPTION_CHECK = 'skipSubscriptionCheck';
let SubscriptionGuard = class SubscriptionGuard {
    constructor(reflector, tenantsService) {
        this.reflector = reflector;
        this.tenantsService = tenantsService;
    }
    async canActivate(context) {
        const skipCheck = this.reflector.getAllAndOverride(exports.SKIP_SUBSCRIPTION_CHECK, [context.getHandler(), context.getClass()]);
        if (skipCheck) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.tenantId) {
            return true;
        }
        const tenant = await this.tenantsService.findOne(user.tenantId);
        if (!tenant) {
            throw new common_1.ForbiddenException('Tenant not found');
        }
        const now = new Date();
        const isExpired = tenant.expiresAt && tenant.expiresAt < now;
        if ((tenant.subscriptionStatus !== subscription_enums_1.SubscriptionStatus.ACTIVE || isExpired) &&
            tenant.plan !== subscription_enums_1.SubscriptionPlan.FREE) {
            throw new common_1.HttpException('Your subscription is inactive or past due. Please update your payment details to unlock your account.', common_1.HttpStatus.PAYMENT_REQUIRED);
        }
        return true;
    }
};
exports.SubscriptionGuard = SubscriptionGuard;
exports.SubscriptionGuard = SubscriptionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        tenants_service_1.TenantsService])
], SubscriptionGuard);
//# sourceMappingURL=subscription.guard.js.map