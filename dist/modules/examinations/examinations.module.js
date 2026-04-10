"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExaminationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const examinations_service_1 = require("./examinations.service");
const examinations_controller_1 = require("./examinations.controller");
const examination_entity_1 = require("./entities/examination.entity");
const tenancy_module_1 = require("../../core/tenancy/tenancy.module");
let ExaminationsModule = class ExaminationsModule {
};
exports.ExaminationsModule = ExaminationsModule;
exports.ExaminationsModule = ExaminationsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([examination_entity_1.Examination]), tenancy_module_1.TenancyModule],
        controllers: [examinations_controller_1.ExaminationsController],
        providers: [examinations_service_1.ExaminationsService],
    })
], ExaminationsModule);
//# sourceMappingURL=examinations.module.js.map