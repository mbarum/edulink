"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const academics_service_1 = require("./academics.service");
const academic_years_service_1 = require("./academic-years.service");
const class_levels_service_1 = require("./class-levels.service");
const sections_service_1 = require("./sections.service");
const grading_service_1 = require("./grading.service");
const academics_controller_1 = require("./academics.controller");
const subject_entity_1 = require("./entities/subject.entity");
const academic_year_entity_1 = require("./entities/academic-year.entity");
const class_level_entity_1 = require("./entities/class-level.entity");
const section_entity_1 = require("./entities/section.entity");
const grading_scale_entity_1 = require("./entities/grading-scale.entity");
const tenancy_module_1 = require("../../core/tenancy/tenancy.module");
let AcademicsModule = class AcademicsModule {
};
exports.AcademicsModule = AcademicsModule;
exports.AcademicsModule = AcademicsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                subject_entity_1.Subject,
                academic_year_entity_1.AcademicYear,
                class_level_entity_1.ClassLevel,
                section_entity_1.Section,
                grading_scale_entity_1.GradingScale,
            ]),
            tenancy_module_1.TenancyModule,
        ],
        controllers: [academics_controller_1.AcademicsController],
        providers: [
            academics_service_1.AcademicsService,
            academic_years_service_1.AcademicYearsService,
            class_levels_service_1.ClassLevelsService,
            sections_service_1.SectionsService,
            grading_service_1.GradingService,
        ],
    })
], AcademicsModule);
//# sourceMappingURL=academics.module.js.map