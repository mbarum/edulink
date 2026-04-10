import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
import { UserRole } from 'src/common/user-role.enum';
export declare class User extends TenantAwareEntity {
    username: string;
    password_hash: string;
    googleId: string;
    microsoftId: string;
    password_reset_token: string;
    password_reset_expires: Date;
    role: UserRole;
}
