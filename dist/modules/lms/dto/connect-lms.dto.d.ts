import { LmsProviderType } from '../entities/lms-connection.entity';
export declare class ConnectLmsDto {
    provider: LmsProviderType;
    apiUrl: string;
    credential1: string;
    credential2?: string;
}
