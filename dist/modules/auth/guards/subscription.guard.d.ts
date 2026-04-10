import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantsService } from '../../tenants/tenants.service';
export declare const SKIP_SUBSCRIPTION_CHECK = "skipSubscriptionCheck";
export declare class SubscriptionGuard implements CanActivate {
    private reflector;
    private tenantsService;
    constructor(reflector: Reflector, tenantsService: TenantsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
