import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    sub: string;
    tenantId: string;
  };
}

const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'adminpassword',
  'currentpassword',
  'newpassword',
  'token',
  'refreshtoken',
  'secret',
  'jwt_secret',
  'encryption_key',
  'credential1',
  'credential2',
  'cardnumber',
  'cvv',
  'cvc',
  'authorization',
  'passkey',
  'consumersecret',
]);

/**
 * @description Recursively masks sensitive fields such as passwords, tokens, and payment details
 * before persisting payload into audit log storage.
 */
function sanitizeForAudit(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForAudit(item));
  }
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (SENSITIVE_KEYS.has(normalizedKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeForAudit(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { method, url, user, ip, headers } = request;
    const body = request.body as Record<string, any>;

    // We only care about mutations
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data: { id?: string }) => {
        // Extract entity name from URL (simplified)
        const entity = url.split('/')[2] || 'unknown';

        const tenantId =
          user?.tenantId || (headers['x-tenant-id'] as string) || 'global';
        const userId = user?.sub || 'system';
        const entityId = (data?.id ||
          (body as { id?: string })?.id ||
          request.params?.id) as string;

        const sanitizedBody = sanitizeForAudit(body);

        this.auditService
          .log({
            tenantId,
            userId,
            action: method,
            entity,
            entityId,
            newValue: sanitizedBody ? JSON.stringify(sanitizedBody) : undefined,
            ipAddress: ip,
            userAgent: headers['user-agent'],
          })
          .catch((err) => console.error('Audit logging failed', err));
      }),
    );
  }
}
