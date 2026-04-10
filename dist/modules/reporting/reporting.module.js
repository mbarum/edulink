"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reporting_service_1 = require("./reporting.service");
const reporting_controller_1 = require("./reporting.controller");
const tenancy_module_1 = require("../../core/tenancy/tenancy.module");
const users_module_1 = require("../users/users.module");
const fee_entity_1 = require("../fees/entities/fee.entity");
const expense_entity_1 = require("../expenses/entities/expense.entity");
const attendance_entity_1 = require("../attendance/entities/attendance.entity");
const student_entity_1 = require("../students/entities/student.entity");
const timetable_entry_entity_1 = require("../timetable/entities/timetable-entry.entity");
const report_card_entity_1 = require("../report-cards/entities/report-card.entity");
const calendar_event_entity_1 = require("../calendar/entities/calendar-event.entity");
const subject_entity_1 = require("../academics/entities/subject.entity");
const examination_entity_1 = require("../examinations/entities/examination.entity");
let ReportingModule = class ReportingModule {
};
exports.ReportingModule = ReportingModule;
exports.ReportingModule = ReportingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                fee_entity_1.Fee, expense_entity_1.Expense, attendance_entity_1.Attendance, student_entity_1.Student, timetable_entry_entity_1.TimetableEntry, report_card_entity_1.ReportCard, calendar_event_entity_1.CalendarEvent, subject_entity_1.Subject, examination_entity_1.Examination
            ]),
            tenancy_module_1.TenancyModule,
            users_module_1.UsersModule,
        ],
        controllers: [reporting_controller_1.ReportingController],
        providers: [reporting_service_1.ReportingService],
    })
], ReportingModule);
//# sourceMappingURL=reporting.module.js.map