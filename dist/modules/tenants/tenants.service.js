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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("./entities/tenant.entity");
const subscription_enums_1 = require("../../common/subscription.enums");
let TenantsService = class TenantsService {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }
    async create(createTenantDto) {
        const existing = await this.tenantRepository.findOne({
            where: [{ name: createTenantDto.name }, { domain: createTenantDto.domain }],
        });
        if (existing) {
            throw new common_1.BadRequestException('A school with this name or domain already exists.');
        }
        const tenant = this.tenantRepository.create(createTenantDto);
        if (tenant.plan && tenant.plan !== subscription_enums_1.SubscriptionPlan.FREE) {
            tenant.subscriptionStatus = subscription_enums_1.SubscriptionStatus.INACTIVE;
        }
        else {
            tenant.subscriptionStatus = subscription_enums_1.SubscriptionStatus.ACTIVE;
        }
        return this.tenantRepository.save(tenant);
    }
    async findOne(id) {
        const tenant = await this.tenantRepository.findOneBy({ id });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with id ${id} not found`);
        }
        return tenant;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map