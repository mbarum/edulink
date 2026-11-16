import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

/**
 * @description Tenant-aware cache interceptor that scopes Redis cache keys by tenant ID.
 * Prevents cross-tenant cache contamination and sensitive data disclosure.
 */
@Injectable()
export class TenantAwareCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const defaultKey = super.trackBy(context);
    if (!defaultKey) {
      return undefined;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId =
      request.user?.tenantId ||
      (request.headers['x-tenant-id'] as string) ||
      'global';

    return `${tenantId}:${defaultKey}`;
  }
}
