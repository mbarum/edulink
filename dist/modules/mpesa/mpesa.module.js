"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const mpesa_controller_1 = require("./mpesa.controller");
const mpesa_service_1 = require("./mpesa.service");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const pending_payment_entity_1 = require("../payments/entities/pending-payment.entity");
const tenancy_module_1 = require("../../core/tenancy/tenancy.module");
let MpesaModule = class MpesaModule {
};
exports.MpesaModule = MpesaModule;
exports.MpesaModule = MpesaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant, pending_payment_entity_1.PendingPayment]),
            tenancy_module_1.TenancyModule,
        ],
        controllers: [mpesa_controller_1.MpesaController],
        providers: [mpesa_service_1.MpesaService],
    })
], MpesaModule);
//# sourceMappingURL=mpesa.module.js.map