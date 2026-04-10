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
exports.PromotionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("./entities/student.entity");
const tenancy_service_1 = require("../../core/tenancy/tenancy.service");
let PromotionService = class PromotionService {
    constructor(studentRepository, tenancyService) {
        this.studentRepository = studentRepository;
        this.tenancyService = tenancyService;
    }
    async promoteStudents(studentIds, nextClassLevelId, nextSectionId, nextAcademicYearId) {
        const tenantId = this.tenancyService.getTenantId();
        const students = await this.studentRepository.find({
            where: {
                id: (0, typeorm_2.In)(studentIds),
                tenantId,
            },
        });
        if (students.length === 0) {
            throw new common_1.NotFoundException('No students found for promotion');
        }
        const updatedStudents = students.map((student) => {
            return {
                ...student,
                classLevelId: nextClassLevelId,
                sectionId: nextSectionId,
                academicYearId: nextAcademicYearId,
            };
        });
        await this.studentRepository.save(updatedStudents);
    }
    async graduateStudents(studentIds) {
        const tenantId = this.tenancyService.getTenantId();
        await this.studentRepository.update({ id: (0, typeorm_2.In)(studentIds), tenantId }, { status: 'Graduated' });
    }
};
exports.PromotionService = PromotionService;
exports.PromotionService = PromotionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenancy_service_1.TenancyService])
], PromotionService);
//# sourceMappingURL=promotion.service.js.map