import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
export declare class Book extends TenantAwareEntity {
    title: string;
    author: string;
    isbn: string;
    status: 'available' | 'borrowed';
}
