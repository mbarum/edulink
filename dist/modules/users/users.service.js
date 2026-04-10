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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const tenancy_service_1 = require("../../core/tenancy/tenancy.service");
const tenant_aware_crud_service_1 = require("../../core/common/tenant-aware-crud.service");
let UsersService = class UsersService extends tenant_aware_crud_service_1.TenantAwareCrudService {
    constructor(userRepository, tenancyService) {
        super(userRepository, tenancyService);
        this.userRepository = userRepository;
    }
    async create(userDto) {
        Reflect.deleteProperty(userDto, 'id');
        let password_hash = userDto.password_hash;
        if (password_hash) {
            const salt = await bcrypt.genSalt(12);
            password_hash = await bcrypt.hash(password_hash, salt);
        }
        const newUser = this.userRepository.create({
            ...userDto,
            password_hash,
            tenantId: this.tenancyService.getTenantId(),
        });
        const savedUser = await this.userRepository.save(newUser);
        delete savedUser.password_hash;
        return savedUser;
    }
    async createRaw(userDto) {
        const newUser = this.userRepository.create(userDto);
        const savedUser = await this.userRepository.save(newUser);
        delete savedUser.password_hash;
        return savedUser;
    }
    async findAll() {
        return this.userRepository.find({
            where: { tenantId: this.tenancyService.getTenantId() },
        });
    }
    async update(id, userDto) {
        const user = await this.userRepository.findOne({
            where: { id, tenantId: this.tenancyService.getTenantId() },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        Reflect.deleteProperty(userDto, 'id');
        Reflect.deleteProperty(userDto, 'tenantId');
        if (userDto.password_hash) {
            const salt = await bcrypt.genSalt(12);
            userDto.password_hash = await bcrypt.hash(userDto.password_hash, salt);
        }
        const updatedUser = await super.update(id, userDto);
        delete updatedUser.password_hash;
        return updatedUser;
    }
    async remove(id) {
        const result = await this.userRepository.delete({
            id,
            tenantId: this.tenancyService.getTenantId(),
        });
        if (result.affected === 0) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async findByUsername(username) {
        return this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password_hash')
            .where('user.username = :username', { username })
            .getOne();
    }
    async findByGoogleId(googleId) {
        return this.userRepository.findOne({ where: { googleId } });
    }
    async findByMicrosoftId(microsoftId) {
        return this.userRepository.findOne({ where: { microsoftId } });
    }
    async setPasswordResetToken(id, token, expires) {
        await this.userRepository.update(id, {
            password_reset_token: token,
            password_reset_expires: expires,
        });
    }
    async findOneByPasswordResetToken(token) {
        return this.userRepository.findOne({
            where: { password_reset_token: token },
        });
    }
    async resetPassword(id, password) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        await this.userRepository.update(id, {
            password_hash: hashedPassword,
            password_reset_token: undefined,
            password_reset_expires: undefined,
        });
        return this.userRepository.findOne({ where: { id } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenancy_service_1.TenancyService])
], UsersService);
//# sourceMappingURL=users.service.js.map