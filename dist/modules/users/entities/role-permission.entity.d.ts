import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
import { Permission } from './permission.entity';
import { UserRole } from 'src/common/user-role.enum';
export declare class RolePermission extends TenantAwareEntity {
    role: UserRole;
    permission: Permission;
    permissionId: string;
}
