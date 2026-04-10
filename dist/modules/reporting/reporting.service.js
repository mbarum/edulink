"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fee_entity_1 = require("../fees/entities/fee.entity");
const expense_entity_1 = require("../expenses/entities/expense.entity");
const attendance_entity_1 = require("../attendance/entities/attendance.entity");
const student_entity_1 = require("../students/entities/student.entity");
const timetable_entry_entity_1 = require("../timetable/entities/timetable-entry.entity");
const report_card_entity_1 = require("../report-cards/entities/report-card.entity");
const calendar_event_entity_1 = require("../calendar/entities/calendar-event.entity");
const subject_entity_1 = require("../academics/entities/subject.entity");
const examination_entity_1 = require("../examinations/entities/examination.entity");
const tenancy_service_1 = require("../../core/tenancy/tenancy.service");
const ExcelJS = __importStar(require("exceljs"));
let ReportingService = class ReportingService {
    constructor(feeRepository, expenseRepository, attendanceRepository, studentRepository, timetableRepository, reportCardRepository, calendarEventRepository, subjectRepository, examinationRepository, tenancyService) {
        this.feeRepository = feeRepository;
        this.expenseRepository = expenseRepository;
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.timetableRepository = timetableRepository;
        this.reportCardRepository = reportCardRepository;
        this.calendarEventRepository = calendarEventRepository;
        this.subjectRepository = subjectRepository;
        this.examinationRepository = examinationRepository;
        this.tenancyService = tenancyService;
    }
    async generateFinancialReport(startDate, endDate) {
        const tenantId = this.tenancyService.getTenantId();
        const fees = await this.feeRepository.find({
            where: { tenantId, dueDate: (0, typeorm_2.Between)(startDate, endDate) },
        });
        const expenses = await this.expenseRepository.find({
            where: { tenantId, date: (0, typeorm_2.Between)(startDate, endDate) },
        });
        const totalIncome = fees.reduce((sum, fee) => sum + (fee.status === 'paid' ? Number(fee.amount) : 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        return {
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            fees,
            expenses,
        };
    }
    async exportFinancialsToExcel(startDate, endDate) {
        const report = await this.generateFinancialReport(startDate, endDate);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Financial Report');
        worksheet.columns = [
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Description', key: 'description', width: 30 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Date', key: 'date', width: 20 },
        ];
        report.fees.forEach((fee) => {
            worksheet.addRow({
                type: 'Income (Fee)',
                description: `Fee for student ${fee.studentId}`,
                amount: fee.amount,
                date: fee.dueDate,
            });
        });
        report.expenses.forEach((expense) => {
            worksheet.addRow({
                type: 'Expense',
                description: expense.description,
                amount: expense.amount,
                date: expense.date,
            });
        });
        worksheet.addRow({});
        worksheet.addRow({ type: 'TOTAL INCOME', amount: report.totalIncome });
        worksheet.addRow({ type: 'TOTAL EXPENSES', amount: report.totalExpenses });
        worksheet.addRow({ type: 'NET PROFIT', amount: report.netProfit });
        return (await workbook.xlsx.writeBuffer());
    }
    async generateAttendanceReport(classLevelId) {
        const tenantId = this.tenancyService.getTenantId();
        return this.attendanceRepository.find({
            where: { tenantId, classLevelId },
            relations: ['student'],
        });
    }
    async getDashboardStats() {
        const tenantId = this.tenancyService.getTenantId();
        const totalStudents = await this.feeRepository.manager
            .query(`SELECT COUNT(*) as count FROM students WHERE tenantId = ?`, [
            tenantId,
        ])
            .then((res) => parseInt(res[0].count, 10));
        const totalStaff = await this.feeRepository.manager
            .query(`SELECT COUNT(*) as count FROM staff WHERE tenantId = ?`, [
            tenantId,
        ])
            .then((res) => parseInt(res[0].count, 10));
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const fees = await this.feeRepository.find({
            where: { tenantId, dueDate: (0, typeorm_2.Between)(startOfMonth, endOfMonth) },
        });
        const revenueThisMonth = fees.reduce((sum, fee) => sum + (fee.status === 'paid' ? Number(fee.amount) : 0), 0);
        const recentStudentsRaw = await this.studentRepository.find({
            where: { tenantId },
            order: { id: 'DESC' },
            take: 5,
        });
        const recentStudents = recentStudentsRaw.map((s) => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            email: s.registrationNumber || 'N/A',
        }));
        return {
            totalStudents,
            totalStaff,
            revenueThisMonth,
            recentStudents,
        };
    }
    async getTeacherDashboardStats(userId) {
        const tenantId = this.tenancyService.getTenantId();
        const totalStudents = await this.studentRepository.count({
            where: { tenantId },
        });
        const totalClasses = await this.feeRepository.manager
            .query(`SELECT COUNT(*) as count FROM sections WHERE tenantId = ?`, [
            tenantId,
        ])
            .then((res) => parseInt(res[0].count, 10));
        const today = new Date()
            .toLocaleDateString('en-US', { weekday: 'long' })
            .toLowerCase();
        const todaysScheduleRaw = await this.timetableRepository.find({
            where: {
                tenantId,
                teacherId: userId,
                dayOfWeek: today,
            },
            order: { startTime: 'ASC' },
        });
        const todaysSchedule = await Promise.all(todaysScheduleRaw.map(async (entry) => {
            const subject = await this.subjectRepository.findOne({
                where: { id: entry.subjectId },
            });
            return {
                id: entry.id,
                time: `${entry.startTime} - ${entry.endTime}`,
                subject: subject ? subject.name : 'Unknown Subject',
                class: entry.classLevel,
                room: 'Assigned Room',
            };
        }));
        const pendingTasks = [];
        let taskIdCounter = 1;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentExams = await this.examinationRepository.find({
            where: { tenantId, date: (0, typeorm_2.Between)(sevenDaysAgo, new Date()) },
        });
        for (const exam of recentExams) {
            const subject = await this.subjectRepository.findOne({
                where: { id: exam.subjectId, teacherId: userId },
            });
            if (subject) {
                pendingTasks.push({
                    id: taskIdCounter++,
                    title: `Grade ${exam.name} - ${subject.name}`,
                    due: 'Soon',
                    type: 'grading',
                });
            }
        }
        for (const session of todaysSchedule) {
            pendingTasks.push({
                id: taskIdCounter++,
                title: `Submit Attendance for ${session.class} - ${session.subject}`,
                due: 'Today',
                type: 'attendance',
            });
        }
        return {
            totalStudents,
            totalClasses,
            todaysSchedule,
            pendingTasks,
        };
    }
    async getParentDashboardStats(userId) {
        const tenantId = this.tenancyService.getTenantId();
        const childrenRaw = await this.studentRepository.find({
            where: { tenantId, parentId: userId },
            relations: ['classLevel', 'section'],
        });
        const children = await Promise.all(childrenRaw.map(async (child) => {
            const totalDays = await this.attendanceRepository.count({
                where: { studentId: child.id },
            });
            const presentDays = await this.attendanceRepository.count({
                where: { studentId: child.id, status: 'present' },
            });
            const attendance = totalDays > 0
                ? Math.round((presentDays / totalDays) * 100) + '%'
                : 'N/A';
            const nextFee = await this.feeRepository.findOne({
                where: { studentId: child.id, status: 'unpaid' },
                order: { dueDate: 'ASC' },
            });
            return {
                id: child.id,
                name: `${child.firstName} ${child.lastName}`,
                grade: child.classLevel ? child.classLevel.name : 'Unknown Grade',
                attendance,
                nextPaymentDue: nextFee
                    ? nextFee.dueDate.toDateString()
                    : 'No pending fees',
                nextPaymentAmount: nextFee ? Number(nextFee.amount) : 0,
            };
        }));
        const childIds = childrenRaw.map((c) => c.id);
        let recentGrades = [];
        if (childIds.length > 0) {
            const gradesRaw = await this.reportCardRepository.find({
                where: childIds.map((id) => ({ studentId: id, tenantId })),
                order: { id: 'DESC' },
                take: 5,
            });
            recentGrades = await Promise.all(gradesRaw.map(async (grade) => {
                const student = childrenRaw.find((c) => c.id === grade.studentId);
                const exam = await this.examinationRepository.findOne({
                    where: { id: grade.examinationId },
                });
                const subject = exam
                    ? await this.subjectRepository.findOne({
                        where: { id: exam.subjectId },
                    })
                    : null;
                return {
                    id: grade.id,
                    childName: student
                        ? `${student.firstName} ${student.lastName}`
                        : 'Unknown',
                    subject: subject ? subject.name : 'Unknown Subject',
                    grade: grade.grade || grade.marks.toString(),
                    date: exam ? exam.date.toDateString() : 'Unknown Date',
                };
            }));
        }
        const now = new Date();
        const upcomingEventsRaw = await this.calendarEventRepository.find({
            where: {
                tenantId,
                start: (0, typeorm_2.Between)(now, new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)),
            },
            order: { start: 'ASC' },
            take: 5,
        });
        const upcomingEvents = upcomingEventsRaw.map((event) => ({
            id: event.id,
            title: event.title,
            date: event.start.toDateString(),
            time: `${event.start.getHours()}:${event.start.getMinutes().toString().padStart(2, '0')} - ${event.end.getHours()}:${event.end.getMinutes().toString().padStart(2, '0')}`,
        }));
        return {
            children,
            recentGrades,
            upcomingEvents,
        };
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fee_entity_1.Fee)),
    __param(1, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __param(2, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(3, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(4, (0, typeorm_1.InjectRepository)(timetable_entry_entity_1.TimetableEntry)),
    __param(5, (0, typeorm_1.InjectRepository)(report_card_entity_1.ReportCard)),
    __param(6, (0, typeorm_1.InjectRepository)(calendar_event_entity_1.CalendarEvent)),
    __param(7, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __param(8, (0, typeorm_1.InjectRepository)(examination_entity_1.Examination)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        tenancy_service_1.TenancyService])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map