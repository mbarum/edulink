import { PromotionService } from './promotion.service';
export declare class PromotionController {
    private readonly promotionService;
    constructor(promotionService: PromotionService);
    promote(data: {
        studentIds: string[];
        nextClassLevelId: string;
        nextSectionId: string;
        nextAcademicYearId: string;
    }): Promise<void>;
    graduate(data: {
        studentIds: string[];
    }): Promise<void>;
}
