import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    create(createAttendanceDto: CreateAttendanceDto): Promise<import("./entities/attendance.entity").Attendance>;
    bulkCreate(data: {
        records: CreateAttendanceDto[];
    }): Promise<import("./entities/attendance.entity").Attendance[]>;
    findAll(): Promise<import("./entities/attendance.entity").Attendance[]>;
    findOne(id: string): Promise<import("./entities/attendance.entity").Attendance>;
    update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<import("./entities/attendance.entity").Attendance>;
    remove(id: string): Promise<void>;
}
