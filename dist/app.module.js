"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const bull_1 = require("@nestjs/bull");
const lms_module_1 = require("./modules/lms/lms.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const mpesa_module_1 = require("./modules/mpesa/mpesa.module");
const super_admin_module_1 = require("./modules/super-admin/super-admin.module");
const tenants_module_1 = require("./modules/tenants/tenants.module");
const tenancy_module_1 = require("./core/tenancy/tenancy.module");
const students_module_1 = require("./modules/students/students.module");
const fees_module_1 = require("./modules/fees/fees.module");
const expenses_module_1 = require("./modules/expenses/expenses.module");
const staff_module_1 = require("./modules/staff/staff.module");
const payroll_module_1 = require("./modules/payroll/payroll.module");
const academics_module_1 = require("./modules/academics/academics.module");
const timetable_module_1 = require("./modules/timetable/timetable.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const calendar_module_1 = require("./modules/calendar/calendar.module");
const examinations_module_1 = require("./modules/examinations/examinations.module");
const report_cards_module_1 = require("./modules/report-cards/report-cards.module");
const library_module_1 = require("./modules/library/library.module");
const communication_module_1 = require("./modules/communication/communication.module");
const reporting_module_1 = require("./modules/reporting/reporting.module");
const shared_module_1 = require("./shared/shared.module");
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./modules/auth/auth.module");
const payments_module_1 = require("./modules/payments/payments.module");
const config_module_1 = require("./modules/config/config.module");
const jwt_1 = require("@nestjs/jwt");
const audit_module_1 = require("./modules/audit/audit.module");
const audit_interceptor_1 = require("./core/interceptors/audit.interceptor");
const core_1 = require("@nestjs/core");
const subscription_guard_1 = require("./modules/auth/guards/subscription.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 20,
                },
            ]),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            schedule_1.ScheduleModule.forRoot(),
            jwt_1.JwtModule.registerAsync({
                global: true,
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const secret = configService.get('JWT_SECRET');
                    if (!secret) {
                        throw new Error('CRITICAL: JWT_SECRET is not configured. Please set it in your environment variables.');
                    }
                    return {
                        secret,
                        signOptions: { expiresIn: '60m' },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const dbHost = configService.get('DB_HOST');
                    if (!dbHost || dbHost === 'your_production_database_host') {
                        throw new Error('CRITICAL: Database host (DB_HOST) is not configured. Please set your MySQL credentials in the environment variables.');
                    }
                    return {
                        type: 'mysql',
                        host: dbHost,
                        port: configService.get('DB_PORT') || 3306,
                        username: configService.get('DB_USERNAME'),
                        password: configService.get('DB_PASSWORD'),
                        database: configService.get('DB_DATABASE'),
                        autoLoadEntities: true,
                        synchronize: configService.get('NODE_ENV') !== 'production',
                    };
                },
                inject: [config_1.ConfigService],
            }),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    redis: {
                        host: configService.get('REDIS_HOST') || 'localhost',
                        port: configService.get('REDIS_PORT') || 6379,
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            tenancy_module_1.TenancyModule,
            audit_module_1.AuditModule,
            tenants_module_1.TenantsModule,
            lms_module_1.LmsModule,
            subscriptions_module_1.SubscriptionsModule,
            mpesa_module_1.MpesaModule,
            super_admin_module_1.SuperAdminModule,
            students_module_1.StudentsModule,
            fees_module_1.FeesModule,
            expenses_module_1.ExpensesModule,
            staff_module_1.StaffModule,
            payroll_module_1.PayrollModule,
            academics_module_1.AcademicsModule,
            timetable_module_1.TimetableModule,
            attendance_module_1.AttendanceModule,
            calendar_module_1.CalendarModule,
            examinations_module_1.ExaminationsModule,
            report_cards_module_1.ReportCardsModule,
            library_module_1.LibraryModule,
            communication_module_1.CommunicationModule,
            reporting_module_1.ReportingModule,
            shared_module_1.SharedModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            payments_module_1.PaymentsModule,
            config_module_1.AppConfigModule,
        ],
        controllers: [],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: subscription_guard_1.SubscriptionGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map