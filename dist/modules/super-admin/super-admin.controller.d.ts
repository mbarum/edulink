import { SuperAdminService } from './super-admin.service';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
export declare class SuperAdminController {
    private readonly superAdminService;
    constructor(superAdminService: SuperAdminService);
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
    getAllTenants(): Promise<import("../tenants/entities/tenant.entity").Tenant[]>;
    getTenantById(id: string): Promise<import("../tenants/entities/tenant.entity").Tenant>;
    getPendingPayments(): Promise<import("../payments/entities/pending-payment.entity").PendingPayment[]>;
    updateTenantStatus(id: string, updateTenantStatusDto: UpdateTenantStatusDto): Promise<import("../tenants/entities/tenant.entity").Tenant>;
    updatePaymentStatus(id: string, updatePaymentStatusDto: UpdatePaymentStatusDto): Promise<import("../payments/entities/pending-payment.entity").PendingPayment>;
    deleteTenant(id: string): Promise<void>;
    getAllUsers(): Promise<import("../users/entities/user.entity").User[]>;
}
