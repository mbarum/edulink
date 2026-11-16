import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService extends TenantAwareCrudService<Attendance> {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly dataSource: DataSource,
    tenancyService: TenancyService,
  ) {
    super(attendanceRepository, tenancyService);
  }

  async bulkCreate(records: CreateAttendanceDto[]): Promise<Attendance[]> {
    const tenantId = this.tenancyService.getTenantId();
    return this.dataSource.transaction(async (manager) => {
      const attendanceEntities = records.map((record) => {
        return manager.getRepository(Attendance).create({
          ...record,
          date: record.date ? new Date(record.date) : new Date(),
          tenantId,
        });
      });
      return manager.getRepository(Attendance).save(attendanceEntities);
    });
  }
}
