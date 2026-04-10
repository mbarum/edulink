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
exports.LmsConnection = exports.LmsProviderType = void 0;
const typeorm_1 = require("typeorm");
const tenant_aware_entity_1 = require("../../../core/tenancy/tenant-aware.entity");
var LmsProviderType;
(function (LmsProviderType) {
    LmsProviderType["MOODLE"] = "moodle";
    LmsProviderType["GOOGLE_CLASSROOM"] = "google_classroom";
    LmsProviderType["CANVAS"] = "canvas";
})(LmsProviderType || (exports.LmsProviderType = LmsProviderType = {}));
let LmsConnection = class LmsConnection extends tenant_aware_entity_1.TenantAwareEntity {
};
exports.LmsConnection = LmsConnection;
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: LmsProviderType }),
    __metadata("design:type", String)
], LmsConnection.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LmsConnection.prototype, "apiUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encrypted_credential_1' }),
    __metadata("design:type", String)
], LmsConnection.prototype, "encryptedCredential1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encrypted_credential_2', nullable: true }),
    __metadata("design:type", String)
], LmsConnection.prototype, "encryptedCredential2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encrypted_refresh_token', nullable: true }),
    __metadata("design:type", String)
], LmsConnection.prototype, "encryptedRefreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LmsConnection.prototype, "isConnected", void 0);
exports.LmsConnection = LmsConnection = __decorate([
    (0, typeorm_1.Entity)({ name: 'lms_connections' }),
    (0, typeorm_1.Index)(['tenantId', 'provider'], { unique: true })
], LmsConnection);
//# sourceMappingURL=lms-connection.entity.js.map