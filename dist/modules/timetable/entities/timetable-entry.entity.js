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
exports.TimetableEntry = void 0;
const typeorm_1 = require("typeorm");
const tenant_aware_entity_1 = require("../../../core/tenancy/tenant-aware.entity");
let TimetableEntry = class TimetableEntry extends tenant_aware_entity_1.TenantAwareEntity {
};
exports.TimetableEntry = TimetableEntry;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TimetableEntry.prototype, "classLevel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TimetableEntry.prototype, "dayOfWeek", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TimetableEntry.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TimetableEntry.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TimetableEntry.prototype, "subjectId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TimetableEntry.prototype, "teacherId", void 0);
exports.TimetableEntry = TimetableEntry = __decorate([
    (0, typeorm_1.Entity)({ name: 'timetable_entries' })
], TimetableEntry);
//# sourceMappingURL=timetable-entry.entity.js.map