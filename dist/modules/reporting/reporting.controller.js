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
exports.ReportingController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/user-role.enum");
const reporting_service_1 = require("./reporting.service");
let ReportingController = class ReportingController {
    constructor(reportingService) {
        this.reportingService = reportingService;
    }
    getFinancialReport(startDate, endDate) {
        return this.reportingService.generateFinancialReport(new Date(startDate), new Date(endDate));
    }
    async exportFinancials(startDate, endDate, res) {
        const buffer = await this.reportingService.exportFinancialsToExcel(new Date(startDate), new Date(endDate));
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="financial-report.xlsx"',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
    getAttendanceReport(classLevelId) {
        return this.reportingService.generateAttendanceReport(classLevelId);
    }
    getDashboardStats() {
        return this.reportingService.getDashboardStats();
    }
    getTeacherDashboardStats(req) {
        return this.reportingService.getTeacherDashboardStats(req.user.userId);
    }
    getParentDashboardStats(req) {
        return this.reportingService.getParentDashboardStats(req.user.userId);
    }
};
exports.ReportingController = ReportingController;
__decorate([
    (0, common_1.Get)('financials'),
    (0, permissions_decorator_1.Permissions)('reporting.financials'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportingController.prototype, "getFinancialReport", null);
__decorate([
    (0, common_1.Get)('financials/excel'),
    (0, permissions_decorator_1.Permissions)('reporting.financials.export'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "exportFinancials", null);
__decorate([
    (0, common_1.Get)('attendance'),
    (0, permissions_decorator_1.Permissions)('reporting.attendance'),
    __param(0, (0, common_1.Query)('classLevelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportingController.prototype, "getAttendanceReport", null);
__decorate([
    (0, common_1.Get)('dashboard-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportingController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('teacher-dashboard-stats'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportingController.prototype, "getTeacherDashboardStats", null);
__decorate([
    (0, common_1.Get)('parent-dashboard-stats'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.PARENT),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportingController.prototype, "getParentDashboardStats", null);
exports.ReportingController = ReportingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('reporting'),
    __metadata("design:paramtypes", [reporting_service_1.ReportingService])
], ReportingController);
//# sourceMappingURL=reporting.controller.js.map