import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { PendingPayment } from '../payments/entities/pending-payment.entity';
import { Student } from '../students/entities/student.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { User } from '../users/entities/user.entity';
import { SubscriptionPlan } from '../subscriptions/entities/subscription-plan.entity';
import { PlatformSetting } from './entities/platform-setting.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      PendingPayment,
      Student,
      Attendance,
      User,
      SubscriptionPlan,
      PlatformSetting,
    ]),
    SubscriptionsModule,
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
