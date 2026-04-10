import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { PendingPayment } from '../payments/entities/pending-payment.entity';
import { Student } from '../students/entities/student.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { User } from '../users/entities/user.entity';
export declare class SuperAdminService {
    private readonly tenantRepository;
    private readonly pendingPaymentRepository;
    private readonly studentRepository;
    private readonly attendanceRepository;
    private readonly userRepository;
    constructor(tenantRepository: Repository<Tenant>, pendingPaymentRepository: Repository<PendingPayment>, studentRepository: Repository<Student>, attendanceRepository: Repository<Attendance>, userRepository: Repository<User>);
    getDashboardAnalytics(): Promise<{
        totalTenants: number;
        activeSubscriptions: number;
        pendingApprovals: number;
        totalRevenue: number;
        totalStudents: number;
        averageAttendance: number;
        tenantsByPlan: {
            name: any;
            value: number;
        }[];
        revenueOverTime: any[];
        recentPayments: {
            id: string;
            tenantName: string;
            amount: number;
            method: import("../payments/entities/pending-payment.entity").PaymentMethod;
            status: string;
            date: Date;
        }[];
    }>;
    getAllTenants(): Promise<Tenant[]>;
    getTenantById(id: string): Promise<Tenant>;
    getPendingPayments(): Promise<PendingPayment[]>;
    updateTenantStatus(id: string, status: string): Promise<Tenant>;
    updatePaymentStatus(id: string, status: string): Promise<PendingPayment>;
    deleteTenant(id: string): Promise<void>;
    getAllUsers(): Promise<User[]>;
}
