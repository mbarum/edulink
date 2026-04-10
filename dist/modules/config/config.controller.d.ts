import { ConfigService } from '@nestjs/config';
export declare class ConfigController {
    private readonly configService;
    constructor(configService: ConfigService);
    getConfig(): {
        stripePublishableKey: string;
    };
    health(): {
        status: string;
        timestamp: string;
    };
}
