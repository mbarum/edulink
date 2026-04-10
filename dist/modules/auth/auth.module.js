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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const users_module_1 = require("../users/users.module");
const tenants_module_1 = require("../tenants/tenants.module");
const local_strategy_1 = require("./strategies/local.strategy");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const google_strategy_1 = require("./strategies/google.strategy");
const microsoft_strategy_1 = require("./strategies/microsoft.strategy");
const shared_module_1 = require("../../shared/shared.module");
let AuthModule = class AuthModule {
    constructor(localStrategy) {
        this.localStrategy = localStrategy;
    }
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            shared_module_1.SharedModule,
            users_module_1.UsersModule,
            tenants_module_1.TenantsModule,
            passport_1.PassportModule.register({ session: false }),
        ],
        providers: [auth_service_1.AuthService, local_strategy_1.LocalStrategy, jwt_strategy_1.JwtStrategy, google_strategy_1.GoogleStrategy, microsoft_strategy_1.MicrosoftStrategy],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, passport_1.PassportModule, local_strategy_1.LocalStrategy],
    }),
    __metadata("design:paramtypes", [local_strategy_1.LocalStrategy])
], AuthModule);
//# sourceMappingURL=auth.module.js.map