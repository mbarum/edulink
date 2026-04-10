import { MpesaService } from './mpesa.service';
import { StkPushDto } from './dto/stk-push.dto';
export declare class MpesaController {
    private readonly mpesaService;
    constructor(mpesaService: MpesaService);
    stkPush(stkPushDto: StkPushDto): Promise<unknown>;
    handleCallback(body: Record<string, any>): Promise<any>;
}
