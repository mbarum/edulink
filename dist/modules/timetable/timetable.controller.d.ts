import { TimetableService } from './timetable.service';
import { CreateTimetableEntryDto } from './dto/create-timetable-entry.dto';
import { UpdateTimetableEntryDto } from './dto/update-timetable-entry.dto';
export declare class TimetableController {
    private readonly timetableService;
    constructor(timetableService: TimetableService);
    create(createTimetableEntryDto: CreateTimetableEntryDto): Promise<import("./entities/timetable-entry.entity").TimetableEntry>;
    findAll(): Promise<import("./entities/timetable-entry.entity").TimetableEntry[]>;
    findOne(id: string): Promise<import("./entities/timetable-entry.entity").TimetableEntry>;
    update(id: string, updateTimetableEntryDto: UpdateTimetableEntryDto): Promise<import("./entities/timetable-entry.entity").TimetableEntry>;
    remove(id: string): Promise<void>;
}
