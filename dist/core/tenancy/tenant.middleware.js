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
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("../../modules/tenants/tenants.service");
const tenancy_service_1 = require("./tenancy.service");
const jwt_1 = require("@nestjs/jwt");
const user_role_enum_1 = require("../../common/user-role.enum");
let TenantMiddleware = class TenantMiddleware {
    constructor(tenantsService, tenancyService, jwtService) {
        this.tenantsService = tenantsService;
        this.tenancyService = tenancyService;
        this.jwtService = jwtService;
    }
    async use(req, res, next) {
        if (req.originalUrl.includes('/api/auth/')) {
            return next();
        }
        let tenantId;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const payload = this.jwtService.verify(token);
                if (payload && payload.tenantId) {
                    tenantId = payload.tenantId;
                    const headerTenantId = req.headers['x-tenant-id'];
                    if (headerTenantId && headerTenantId !== tenantId) {
                        if (payload.role === user_role_enum_1.UserRole.SUPER_ADMIN) {
                            tenantId = headerTenantId;
                        }
                        else {
                            throw new common_1.ForbiddenException('Security Violation: Provided Tenant ID does not match authenticated session');
                        }
                    }
                }
                else if (payload && payload.role === user_role_enum_1.UserRole.SUPER_ADMIN) {
                    const headerTenantId = req.headers['x-tenant-id'];
                    if (headerTenantId) {
                        tenantId = headerTenantId;
                    }
                }
            }
            catch (error) {
                if (error instanceof common_1.ForbiddenException) {
                    throw error;
                }
            }
        }
        if (!tenantId) {
            tenantId = req.headers['x-tenant-id'];
        }
        if (!tenantId) {
            if (req.originalUrl.includes('/api/health')) {
                return next();
            }
            if (req.originalUrl.includes('/api/super-admin')) {
                return next();
            }
            throw new common_1.NotFoundException('Tenant ID not provided');
        }
        try {
            const tenant = await this.tenantsService.findOne(tenantId);
            if (!tenant) {
                throw new common_1.NotFoundException('Tenant not found');
            }
            this.tenancyService.setTenant(tenant);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.NotFoundException('Invalid Tenant ID');
        }
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService,
        tenancy_service_1.TenancyService,
        jwt_1.JwtService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map