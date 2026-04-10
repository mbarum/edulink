import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class AttendanceService extends TenantAwareCrudService<Attendance> {
    private readonly attendanceRepository;
    constructor(attendanceRepository: Repository<Attendance>, tenancyService: TenancyService);
}
