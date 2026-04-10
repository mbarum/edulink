import { CommunicationService } from './communication.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class CommunicationController {
    private readonly communicationService;
    constructor(communicationService: CommunicationService);
    create(createMessageDto: CreateMessageDto): Promise<import("./entities/message.entity").Message>;
    findAll(): Promise<import("./entities/message.entity").Message[]>;
    findOne(id: string): Promise<import("./entities/message.entity").Message>;
}
