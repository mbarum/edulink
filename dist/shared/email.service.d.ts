import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private getTransporter;
    sendPasswordResetEmail(to: string, token: string): Promise<void>;
    sendEmail(to: string, subject: string, html: string): Promise<void>;
}
