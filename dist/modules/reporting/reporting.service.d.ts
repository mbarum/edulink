import { Repository } from 'typeorm';
import { Fee } from '../fees/entities/fee.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Student } from '../students/entities/student.entity';
import { TimetableEntry } from '../timetable/entities/timetable-entry.entity';
import { ReportCard } from '../report-cards/entities/report-card.entity';
import { CalendarEvent } from '../calendar/entities/calendar-event.entity';
import { Subject } from '../academics/entities/subject.entity';
import { Examination } from '../examinations/entities/examination.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
export declare class ReportingService {
    private readonly feeRepository;
    private readonly expenseRepository;
    private readonly attendanceRepository;
    private readonly studentRepository;
    private readonly timetableRepository;
    private readonly reportCardRepository;
    private readonly calendarEventRepository;
    private readonly subjectRepository;
    private readonly examinationRepository;
    private readonly tenancyService;
    constructor(feeRepository: Repository<Fee>, expenseRepository: Repository<Expense>, attendanceRepository: Repository<Attendance>, studentRepository: Repository<Student>, timetableRepository: Repository<TimetableEntry>, reportCardRepository: Repository<ReportCard>, calendarEventRepository: Repository<CalendarEvent>, subjectRepository: Repository<Subject>, examinationRepository: Repository<Examination>, tenancyService: TenancyService);
    generateFinancialReport(startDate: Date, endDate: Date): Promise<{
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
        fees: Fee[];
        expenses: Expense[];
    }>;
    exportFinancialsToExcel(startDate: Date, endDate: Date): Promise<Buffer>;
    generateAttendanceReport(classLevelId: string): Promise<Attendance[]>;
    getDashboardStats(): Promise<{
        totalStudents: number;
        totalStaff: number;
        revenueThisMonth: number;
        recentStudents: {
            id: string;
            name: string;
            email: string;
        }[];
    }>;
    getTeacherDashboardStats(userId: string): Promise<{
        totalStudents: number;
        totalClasses: number;
        todaysSchedule: {
            id: string;
            time: string;
            subject: string;
            class: string;
            room: string;
        }[];
        pendingTasks: any[];
    }>;
    getParentDashboardStats(userId: string): Promise<{
        children: {
            id: string;
            name: string;
            grade: string;
            attendance: string;
            nextPaymentDue: string;
            nextPaymentAmount: number;
        }[];
        recentGrades: any[];
        upcomingEvents: {
            id: string;
            title: string;
            date: string;
            time: string;
        }[];
    }>;
}
