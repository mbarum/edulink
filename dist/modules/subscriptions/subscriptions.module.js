"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const subscriptions_controller_1 = require("./subscriptions.controller");
const subscriptions_service_1 = require("./subscriptions.service");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const user_entity_1 = require("../users/entities/user.entity");
const stripe_webhook_controller_1 = require("./stripe-webhook.controller");
const subscription_plan_entity_1 = require("./entities/subscription-plan.entity");
const tenancy_module_1 = require("../../core/tenancy/tenancy.module");
const subscription_cron_service_1 = require("./subscription-cron.service");
const shared_module_1 = require("../../shared/shared.module");
let SubscriptionsModule = class SubscriptionsModule {
};
exports.SubscriptionsModule = SubscriptionsModule;
exports.SubscriptionsModule = SubscriptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant, subscription_plan_entity_1.SubscriptionPlan, user_entity_1.User]), tenancy_module_1.TenancyModule, shared_module_1.SharedModule],
        controllers: [subscriptions_controller_1.SubscriptionsController, stripe_webhook_controller_1.StripeWebhookController],
        providers: [subscriptions_service_1.SubscriptionsService, subscription_cron_service_1.SubscriptionCronService],
    })
], SubscriptionsModule);
//# sourceMappingURL=subscriptions.module.js.map