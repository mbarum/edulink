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
var LmsSyncProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LmsSyncProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const lms_service_1 = require("../lms.service");
const common_1 = require("@nestjs/common");
let LmsSyncProcessor = LmsSyncProcessor_1 = class LmsSyncProcessor {
    constructor(lmsService) {
        this.lmsService = lmsService;
        this.logger = new common_1.Logger(LmsSyncProcessor_1.name);
    }
    async handleSyncStudents(job) {
        this.logger.log(`Processing sync-students for tenant ${job.data.tenantId}...`);
        try {
            const provider = await this.lmsService.getProviderForTenant(job.data.tenantId);
            const students = await provider.syncStudents();
            this.logger.log(`Successfully synced ${students?.length || 0} students for tenant ${job.data.tenantId}`);
            return students;
        }
        catch (error) {
            this.logger.error(`Failed to sync students for tenant ${job.data.tenantId}: ${error.message}`);
            throw error;
        }
    }
    async handleSyncCourses(job) {
        this.logger.log(`Processing sync-courses for tenant ${job.data.tenantId}...`);
        try {
            const provider = await this.lmsService.getProviderForTenant(job.data.tenantId);
            const courses = await provider.syncCourses();
            this.logger.log(`Successfully synced ${courses?.length || 0} courses for tenant ${job.data.tenantId}`);
            return courses;
        }
        catch (error) {
            this.logger.error(`Failed to sync courses for tenant ${job.data.tenantId}: ${error.message}`);
            throw error;
        }
    }
    async handleGetGrades(job) {
        this.logger.log(`Processing get-grades for student ${job.data.studentId}...`);
        try {
            const provider = await this.lmsService.getProviderForTenant(job.data.tenantId);
            const grades = await provider.getGrades(job.data.studentId);
            this.logger.log(`Successfully fetched grades for student ${job.data.studentId}`);
            return grades;
        }
        catch (error) {
            this.logger.error(`Failed to get grades for student ${job.data.studentId}: ${error.message}`);
            throw error;
        }
    }
};
exports.LmsSyncProcessor = LmsSyncProcessor;
__decorate([
    (0, bull_1.Process)('sync-students'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LmsSyncProcessor.prototype, "handleSyncStudents", null);
__decorate([
    (0, bull_1.Process)('sync-courses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LmsSyncProcessor.prototype, "handleSyncCourses", null);
__decorate([
    (0, bull_1.Process)('get-grades'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LmsSyncProcessor.prototype, "handleGetGrades", null);
exports.LmsSyncProcessor = LmsSyncProcessor = LmsSyncProcessor_1 = __decorate([
    (0, bull_1.Processor)('lms-sync'),
    __metadata("design:paramtypes", [lms_service_1.LmsService])
], LmsSyncProcessor);
//# sourceMappingURL=lms-sync.processor.js.map