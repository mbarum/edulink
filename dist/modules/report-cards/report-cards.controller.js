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
exports.ReportCardsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const report_cards_service_1 = require("./report-cards.service");
const create_report_card_dto_1 = require("./dto/create-report-card.dto");
const update_report_card_dto_1 = require("./dto/update-report-card.dto");
let ReportCardsController = class ReportCardsController {
    constructor(reportCardsService) {
        this.reportCardsService = reportCardsService;
    }
    create(createReportCardDto) {
        return this.reportCardsService.create(createReportCardDto);
    }
    findAll() {
        return this.reportCardsService.findAll();
    }
    findOne(id) {
        return this.reportCardsService.findOne(id);
    }
    update(id, updateReportCardDto) {
        return this.reportCardsService.update(id, updateReportCardDto);
    }
    remove(id) {
        return this.reportCardsService.remove(id);
    }
};
exports.ReportCardsController = ReportCardsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_report_card_dto_1.CreateReportCardDto]),
    __metadata("design:returntype", void 0)
], ReportCardsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportCardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportCardsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_report_card_dto_1.UpdateReportCardDto]),
    __metadata("design:returntype", void 0)
], ReportCardsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportCardsController.prototype, "remove", null);
exports.ReportCardsController = ReportCardsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('report-cards'),
    __metadata("design:paramtypes", [report_cards_service_1.ReportCardsService])
], ReportCardsController);
//# sourceMappingURL=report-cards.controller.js.map