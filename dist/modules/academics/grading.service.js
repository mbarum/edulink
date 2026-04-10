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
exports.GradingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const grading_scale_entity_1 = require("./entities/grading-scale.entity");
const tenancy_service_1 = require("../../core/tenancy/tenancy.service");
const tenant_aware_crud_service_1 = require("../../core/common/tenant-aware-crud.service");
let GradingService = class GradingService extends tenant_aware_crud_service_1.TenantAwareCrudService {
    constructor(gradingScaleRepository, tenancyService) {
        super(gradingScaleRepository, tenancyService);
        this.gradingScaleRepository = gradingScaleRepository;
    }
    async calculateGrade(marks) {
        const tenantId = this.tenancyService.getTenantId();
        return this.gradingScaleRepository.findOne({
            where: [
                {
                    tenantId,
                    minMark: marks,
                },
            ],
        });
    }
    async getGradeForMark(marks) {
        const tenantId = this.tenancyService.getTenantId();
        return this.gradingScaleRepository
            .createQueryBuilder('scale')
            .where('scale.tenantId = :tenantId', { tenantId })
            .andWhere('scale.minMark <= :marks', { marks })
            .andWhere('scale.maxMark >= :marks', { marks })
            .getOne();
    }
    async calculateGPA(studentMarks) {
        let totalGradePoints = 0;
        let totalSubjects = 0;
        for (const entry of studentMarks) {
            const scale = await this.getGradeForMark(entry.marks);
            if (scale) {
                totalGradePoints += Number(scale.gradePoint);
                totalSubjects++;
            }
        }
        return totalSubjects > 0 ? totalGradePoints / totalSubjects : 0;
    }
};
exports.GradingService = GradingService;
exports.GradingService = GradingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(grading_scale_entity_1.GradingScale)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenancy_service_1.TenancyService])
], GradingService);
//# sourceMappingURL=grading.service.js.map