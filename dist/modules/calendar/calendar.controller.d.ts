import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
export declare class CalendarController {
    private readonly calendarService;
    constructor(calendarService: CalendarService);
    create(createCalendarEventDto: CreateCalendarEventDto): Promise<import("./entities/calendar-event.entity").CalendarEvent>;
    findAll(): Promise<import("./entities/calendar-event.entity").CalendarEvent[]>;
    findOne(id: string): Promise<import("./entities/calendar-event.entity").CalendarEvent>;
    update(id: string, updateCalendarEventDto: UpdateCalendarEventDto): Promise<import("./entities/calendar-event.entity").CalendarEvent>;
    remove(id: string): Promise<void>;
}
