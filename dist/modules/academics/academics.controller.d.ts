import { AcademicsService } from './academics.service';
import { AcademicYearsService } from './academic-years.service';
import { ClassLevelsService } from './class-levels.service';
import { SectionsService } from './sections.service';
import { GradingService } from './grading.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { CreateClassLevelDto } from './dto/create-class-level.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { GradingScale } from './entities/grading-scale.entity';
export declare class AcademicsController {
    private readonly academicsService;
    private readonly academicYearsService;
    private readonly classLevelsService;
    private readonly sectionsService;
    private readonly gradingService;
    constructor(academicsService: AcademicsService, academicYearsService: AcademicYearsService, classLevelsService: ClassLevelsService, sectionsService: SectionsService, gradingService: GradingService);
    createSubject(createSubjectDto: CreateSubjectDto): Promise<import("./entities/subject.entity").Subject>;
    findAllSubjects(): Promise<import("./entities/subject.entity").Subject[]>;
    createAcademicYear(createDto: CreateAcademicYearDto): Promise<import("./entities/academic-year.entity").AcademicYear>;
    findAllAcademicYears(): Promise<import("./entities/academic-year.entity").AcademicYear[]>;
    setCurrentAcademicYear(id: string): Promise<void>;
    createClassLevel(createDto: CreateClassLevelDto): Promise<import("./entities/class-level.entity").ClassLevel>;
    findAllClassLevels(): Promise<import("./entities/class-level.entity").ClassLevel[]>;
    createSection(createDto: CreateSectionDto): Promise<import("./entities/section.entity").Section>;
    findAllSections(): Promise<import("./entities/section.entity").Section[]>;
    createGradingScale(createDto: Partial<GradingScale>): Promise<GradingScale>;
    findAllGradingScales(): Promise<GradingScale[]>;
}
