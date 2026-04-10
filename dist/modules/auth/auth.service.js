"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
const email_service_1 = require("../../shared/email.service");
const uuid_1 = require("uuid");
const user_role_enum_1 = require("../../common/user-role.enum");
const tenants_service_1 = require("../tenants/tenants.service");
const subscription_enums_1 = require("../../common/subscription.enums");
let AuthService = class AuthService {
    constructor(usersService, tenantsService, jwtService, emailService) {
        this.usersService = usersService;
        this.tenantsService = tenantsService;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async validateUser(username, pass) {
        const user = await this.usersService.findByUsername(username);
        if (user && (await bcrypt.compare(pass, user.password_hash))) {
            const result = { ...user };
            delete result.password_hash;
            return result;
        }
        return null;
    }
    async validateOAuthLogin(profile, provider) {
        let user = null;
        const providerId = profile.id;
        if (provider === 'google') {
            user = await this.usersService.findByGoogleId(providerId);
        }
        else if (provider === 'microsoft') {
            user = await this.usersService.findByMicrosoftId(providerId);
        }
        if (user) {
            return user;
        }
        const email = profile.emails?.[0]?.value || profile._json?.userPrincipalName;
        if (!email) {
            throw new Error(`No email found in ${provider} profile`);
        }
        user = await this.usersService.findByUsername(email);
        if (user) {
            if (provider === 'google') {
                user = await this.usersService.update(user.id, { googleId: providerId });
            }
            else if (provider === 'microsoft') {
                user = await this.usersService.update(user.id, { microsoftId: providerId });
            }
            return user;
        }
        const newUserDto = {
            username: email,
            role: user_role_enum_1.UserRole.PARENT,
            googleId: provider === 'google' ? providerId : undefined,
            microsoftId: provider === 'microsoft' ? providerId : undefined,
        };
        return this.usersService.createRaw(newUserDto);
    }
    login(user) {
        const payload = {
            username: user.username,
            sub: user.id,
            role: user.role,
            tenantId: user.tenantId,
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByUsername(email);
        if (!user) {
            return;
        }
        const token = (0, uuid_1.v4)();
        const expires = new Date(Date.now() + 3600000);
        await this.usersService.setPasswordResetToken(user.id, token, expires);
        await this.emailService.sendPasswordResetEmail(user.username, token);
    }
    async resetPassword(token, password) {
        const user = await this.usersService.findOneByPasswordResetToken(token);
        if (!user || user.password_reset_expires < new Date()) {
            throw new Error('Password reset token is invalid or has expired.');
        }
        return this.usersService.resetPassword(user.id, password);
    }
    async registerSchool(dto) {
        const tenant = await this.tenantsService.create({
            name: dto.schoolName,
            domain: dto.domain,
            plan: dto.plan || subscription_enums_1.SubscriptionPlan.FREE,
        });
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(dto.adminPassword, salt);
        const adminUser = await this.usersService.createRaw({
            username: dto.adminEmail,
            password_hash,
            role: user_role_enum_1.UserRole.ADMIN,
            tenantId: tenant.id,
        });
        return this.login(adminUser);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        tenants_service_1.TenantsService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map