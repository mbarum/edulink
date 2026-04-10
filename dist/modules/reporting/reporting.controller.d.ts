import type { Request, Response } from 'express';
import { ReportingService } from './reporting.service';
interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        username: string;
        role: string;
        tenantId: string;
    };
}
export declare class ReportingController {
    private readonly reportingService;
    constructor(reportingService: ReportingService);
    getFinancialReport(startDate: string, endDate: string): Promise<{
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
        fees: import("../fees/entities/fee.entity").Fee[];
        expenses: import("../expenses/entities/expense.entity").Expense[];
    }>;
    exportFinancials(startDate: string, endDate: string, res: Response): Promise<void>;
    getAttendanceReport(classLevelId: string): Promise<import("../attendance/entities/attendance.entity").Attendance[]>;
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
    getTeacherDashboardStats(req: AuthenticatedRequest): Promise<{
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
    getParentDashboardStats(req: AuthenticatedRequest): Promise<{
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
export {};
