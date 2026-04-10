import { ExaminationsService } from './examinations.service';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { UpdateExaminationDto } from './dto/update-examination.dto';
export declare class ExaminationsController {
    private readonly examinationsService;
    constructor(examinationsService: ExaminationsService);
    create(createExaminationDto: CreateExaminationDto): Promise<import("./entities/examination.entity").Examination>;
    findAll(): Promise<import("./entities/examination.entity").Examination[]>;
    findOne(id: string): Promise<import("./entities/examination.entity").Examination>;
    update(id: string, updateExaminationDto: UpdateExaminationDto): Promise<import("./entities/examination.entity").Examination>;
    remove(id: string): Promise<void>;
}
