import { FeesService } from './fees.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
export declare class FeesController {
    private readonly feesService;
    constructor(feesService: FeesService);
    create(createFeeDto: CreateFeeDto): Promise<import("./entities/fee.entity").Fee>;
    findAll(): Promise<import("./entities/fee.entity").Fee[]>;
    findOne(id: string): Promise<import("./entities/fee.entity").Fee>;
    update(id: string, updateFeeDto: UpdateFeeDto): Promise<import("./entities/fee.entity").Fee>;
    remove(id: string): Promise<void>;
}
