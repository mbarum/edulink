import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from '../../modules/tenants/tenants.service';
import { TenancyService } from './tenancy.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../common/user-role.enum';
export interface JwtPayload {
    tenantId?: string;
    role?: UserRole;
    sub?: string;
    username?: string;
}
export declare class TenantMiddleware implements NestMiddleware {
    private readonly tenantsService;
    private readonly tenancyService;
    private readonly jwtService;
    constructor(tenantsService: TenantsService, tenancyService: TenancyService, jwtService: JwtService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
