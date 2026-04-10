import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LmsController } from './lms.controller';
import { LmsService } from './lms.service';
import { LmsConnection } from './entities/lms-connection.entity';
import { SharedModule } from 'src/shared/shared.module';
import { TenancyModule } from 'src/core/tenancy/tenancy.module';
import { BullModule } from '@nestjs/bull';
import { LmsSyncProcessor } from './processors/lms-sync.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([LmsConnection]),
    TenancyModule,
    SharedModule,
    BullModule.registerQueue({ name: 'lms-sync' }),
  ],
  controllers: [LmsController],
  providers: [LmsService, LmsSyncProcessor],
})
export class LmsModule {}
