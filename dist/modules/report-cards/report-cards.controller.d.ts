import { ReportCardsService } from './report-cards.service';
import { CreateReportCardDto } from './dto/create-report-card.dto';
import { UpdateReportCardDto } from './dto/update-report-card.dto';
export declare class ReportCardsController {
    private readonly reportCardsService;
    constructor(reportCardsService: ReportCardsService);
    create(createReportCardDto: CreateReportCardDto): Promise<import("./entities/report-card.entity").ReportCard>;
    findAll(): Promise<import("./entities/report-card.entity").ReportCard[]>;
    findOne(id: string): Promise<import("./entities/report-card.entity").ReportCard>;
    update(id: string, updateReportCardDto: UpdateReportCardDto): Promise<import("./entities/report-card.entity").ReportCard>;
    remove(id: string): Promise<void>;
}
