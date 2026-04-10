"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LmsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lms_controller_1 = require("./lms.controller");
const lms_service_1 = require("./lms.service");
const lms_connection_entity_1 = require("./entities/lms-connection.entity");
const shared_module_1 = require("../../shared/shared.module");
const tenancy_module_1 = require("../../core/tenancy/tenancy.module");
const bull_1 = require("@nestjs/bull");
const lms_sync_processor_1 = require("./processors/lms-sync.processor");
let LmsModule = class LmsModule {
};
exports.LmsModule = LmsModule;
exports.LmsModule = LmsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([lms_connection_entity_1.LmsConnection]),
            tenancy_module_1.TenancyModule,
            shared_module_1.SharedModule,
            bull_1.BullModule.registerQueue({ name: 'lms-sync' }),
        ],
        controllers: [lms_controller_1.LmsController],
        providers: [lms_service_1.LmsService, lms_sync_processor_1.LmsSyncProcessor],
    })
], LmsModule);
//# sourceMappingURL=lms.module.js.map