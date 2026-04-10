import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    create(createPayrollDto: CreatePayrollDto): Promise<import("./entities/payroll.entity").Payroll>;
    findAll(): Promise<import("./entities/payroll.entity").Payroll[]>;
    findOne(id: string): Promise<import("./entities/payroll.entity").Payroll>;
    update(id: string, updatePayrollDto: UpdatePayrollDto): Promise<import("./entities/payroll.entity").Payroll>;
    remove(id: string): Promise<void>;
}
