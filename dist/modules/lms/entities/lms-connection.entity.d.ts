import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare enum LmsProviderType {
    MOODLE = "moodle",
    GOOGLE_CLASSROOM = "google_classroom",
    CANVAS = "canvas"
}
export declare class LmsConnection extends TenantAwareEntity {
    provider: LmsProviderType;
    apiUrl: string;
    encryptedCredential1: string;
    encryptedCredential2: string;
    encryptedRefreshToken: string;
    isConnected: boolean;
}
