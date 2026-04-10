export declare class AuditLog {
    id: string;
    tenantId: string;
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    oldValue: string;
    newValue: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
}
