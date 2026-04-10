"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const fees_service_1 = require("./fees.service");
const fees_controller_1 = require("./fees.controller");
const fee_entity_1 = require("./entities/fee.entity");
const tenancy_module_1 = require("../../core/tenancy/tenancy.module");
let FeesModule = class FeesModule {
};
exports.FeesModule = FeesModule;
exports.FeesModule = FeesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([fee_entity_1.Fee]), tenancy_module_1.TenancyModule],
        controllers: [fees_controller_1.FeesController],
        providers: [fees_service_1.FeesService],
    })
], FeesModule);
//# sourceMappingURL=fees.module.js.map