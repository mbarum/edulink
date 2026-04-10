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
exports.MpesaController = void 0;
const common_1 = require("@nestjs/common");
const mpesa_service_1 = require("./mpesa.service");
const stk_push_dto_1 = require("./dto/stk-push.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const skip_subscription_check_decorator_1 = require("../auth/decorators/skip-subscription-check.decorator");
let MpesaController = class MpesaController {
    constructor(mpesaService) {
        this.mpesaService = mpesaService;
    }
    stkPush(stkPushDto) {
        return this.mpesaService.stkPush(stkPushDto.phone, stkPushDto.amount, stkPushDto.plan, stkPushDto.billingCycle || 'monthly');
    }
    handleCallback(body) {
        return this.mpesaService.handleCallback(body);
    }
};
exports.MpesaController = MpesaController;
__decorate([
    (0, common_1.Post)('stk-push'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stk_push_dto_1.StkPushDto]),
    __metadata("design:returntype", void 0)
], MpesaController.prototype, "stkPush", null);
__decorate([
    (0, common_1.Post)('callback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MpesaController.prototype, "handleCallback", null);
exports.MpesaController = MpesaController = __decorate([
    (0, common_1.Controller)('mpesa'),
    (0, skip_subscription_check_decorator_1.SkipSubscriptionCheck)(),
    __metadata("design:paramtypes", [mpesa_service_1.MpesaService])
], MpesaController);
//# sourceMappingURL=mpesa.controller.js.map