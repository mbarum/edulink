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
exports.AcademicsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const academics_service_1 = require("./academics.service");
const academic_years_service_1 = require("./academic-years.service");
const class_levels_service_1 = require("./class-levels.service");
const sections_service_1 = require("./sections.service");
const grading_service_1 = require("./grading.service");
const create_subject_dto_1 = require("./dto/create-subject.dto");
const create_academic_year_dto_1 = require("./dto/create-academic-year.dto");
const create_class_level_dto_1 = require("./dto/create-class-level.dto");
const create_section_dto_1 = require("./dto/create-section.dto");
let AcademicsController = class AcademicsController {
    constructor(academicsService, academicYearsService, classLevelsService, sectionsService, gradingService) {
        this.academicsService = academicsService;
        this.academicYearsService = academicYearsService;
        this.classLevelsService = classLevelsService;
        this.sectionsService = sectionsService;
        this.gradingService = gradingService;
    }
    createSubject(createSubjectDto) {
        return this.academicsService.create(createSubjectDto);
    }
    findAllSubjects() {
        return this.academicsService.findAll();
    }
    createAcademicYear(createDto) {
        return this.academicYearsService.create(createDto);
    }
    findAllAcademicYears() {
        return this.academicYearsService.findAll();
    }
    setCurrentAcademicYear(id) {
        return this.academicYearsService.setCurrent(id);
    }
    createClassLevel(createDto) {
        return this.classLevelsService.create(createDto);
    }
    findAllClassLevels() {
        return this.classLevelsService.findAllWithSections();
    }
    createSection(createDto) {
        return this.sectionsService.create(createDto);
    }
    findAllSections() {
        return this.sectionsService.findAll();
    }
    createGradingScale(createDto) {
        return this.gradingService.create(createDto);
    }
    findAllGradingScales() {
        return this.gradingService.findAll();
    }
};
exports.AcademicsController = AcademicsController;
__decorate([
    (0, common_1.Post)('subjects'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subject_dto_1.CreateSubjectDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Get)('subjects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "findAllSubjects", null);
__decorate([
    (0, common_1.Post)('academic-years'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_academic_year_dto_1.CreateAcademicYearDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createAcademicYear", null);
__decorate([
    (0, common_1.Get)('academic-years'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "findAllAcademicYears", null);
__decorate([
    (0, common_1.Patch)('academic-years/:id/set-current'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "setCurrentAcademicYear", null);
__decorate([
    (0, common_1.Post)('class-levels'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_class_level_dto_1.CreateClassLevelDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createClassLevel", null);
__decorate([
    (0, common_1.Get)('class-levels'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "findAllClassLevels", null);
__decorate([
    (0, common_1.Post)('sections'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_section_dto_1.CreateSectionDto]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createSection", null);
__decorate([
    (0, common_1.Get)('sections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "findAllSections", null);
__decorate([
    (0, common_1.Post)('grading-scales'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "createGradingScale", null);
__decorate([
    (0, common_1.Get)('grading-scales'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcademicsController.prototype, "findAllGradingScales", null);
exports.AcademicsController = AcademicsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('academics'),
    __metadata("design:paramtypes", [academics_service_1.AcademicsService,
        academic_years_service_1.AcademicYearsService,
        class_levels_service_1.ClassLevelsService,
        sections_service_1.SectionsService,
        grading_service_1.GradingService])
], AcademicsController);
//# sourceMappingURL=academics.controller.js.map