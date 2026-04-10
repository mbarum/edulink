import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class Message extends TenantAwareEntity {
    senderId: string;
    recipientId: string;
    content: string;
    sentAt: Date;
}
