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
exports.LmsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lms_connection_entity_1 = require("./entities/lms-connection.entity");
const tenancy_service_1 = require("../../core/tenancy/tenancy.service");
const crypto_service_1 = require("../../shared/crypto.service");
const moodle_provider_1 = require("./providers/moodle.provider");
const google_classroom_provider_1 = require("./providers/google-classroom.provider");
const canvas_provider_1 = require("./providers/canvas.provider");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
let LmsService = class LmsService {
    constructor(lmsConnectionRepository, tenancyService, cryptoService, configService, syncQueue) {
        this.lmsConnectionRepository = lmsConnectionRepository;
        this.tenancyService = tenancyService;
        this.cryptoService = cryptoService;
        this.configService = configService;
        this.syncQueue = syncQueue;
    }
    async connect(connectLmsDto) {
        const tenantId = this.tenancyService.getTenantId();
        const newConnection = this.lmsConnectionRepository.create({
            tenantId: tenantId,
            provider: connectLmsDto.provider,
            apiUrl: connectLmsDto.apiUrl,
            encryptedCredential1: this.cryptoService.encrypt(connectLmsDto.credential1),
            encryptedCredential2: connectLmsDto.credential2 ? this.cryptoService.encrypt(connectLmsDto.credential2) : undefined,
            isConnected: false,
        });
        const savedConnection = await this.lmsConnectionRepository.save(newConnection);
        const provider = this.getProvider(savedConnection);
        await provider.authenticate();
        savedConnection.isConnected = true;
        return this.lmsConnectionRepository.save(savedConnection);
    }
    async syncStudents() {
        const tenantId = this.tenancyService.getTenantId();
        const job = await this.syncQueue.add('sync-students', { tenantId });
        return { message: 'Sync students job enqueued', jobId: job.id };
    }
    async syncCourses() {
        const tenantId = this.tenancyService.getTenantId();
        const job = await this.syncQueue.add('sync-courses', { tenantId });
        return { message: 'Sync courses job enqueued', jobId: job.id };
    }
    async getGrades(studentId) {
        const tenantId = this.tenancyService.getTenantId();
        const job = await this.syncQueue.add('get-grades', { tenantId, studentId });
        return { message: 'Get grades job enqueued', jobId: job.id };
    }
    async getProviderForTenant(tenantId) {
        const connection = await this.lmsConnectionRepository.findOne({ where: { tenantId } });
        if (!connection) {
            throw new common_1.NotFoundException('No LMS connection found for this tenant.');
        }
        return this.getProvider(connection);
    }
    async getCurrentProvider() {
        const tenantId = this.tenancyService.getTenantId();
        const connection = await this.lmsConnectionRepository.findOne({ where: { tenantId } });
        if (!connection) {
            throw new common_1.NotFoundException('No LMS connection found for this tenant.');
        }
        return this.getProvider(connection);
    }
    getProvider(connection) {
        switch (connection.provider) {
            case lms_connection_entity_1.LmsProviderType.MOODLE:
                return new moodle_provider_1.MoodleProvider(connection, this.cryptoService);
            case lms_connection_entity_1.LmsProviderType.GOOGLE_CLASSROOM:
                return new google_classroom_provider_1.GoogleClassroomProvider(connection, this.cryptoService, this.configService);
            case lms_connection_entity_1.LmsProviderType.CANVAS:
                return new canvas_provider_1.CanvasProvider();
            default:
                throw new Error('Unsupported LMS provider.');
        }
    }
};
exports.LmsService = LmsService;
exports.LmsService = LmsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lms_connection_entity_1.LmsConnection)),
    __param(4, (0, bull_1.InjectQueue)('lms-sync')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenancy_service_1.TenancyService,
        crypto_service_1.CryptoService,
        config_1.ConfigService, Object])
], LmsService);
//# sourceMappingURL=lms.service.js.map