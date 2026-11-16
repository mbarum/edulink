import { TenancyService } from './tenancy.service';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';

describe('TenancyService', () => {
  let tenancyService: TenancyService;

  beforeEach(() => {
    tenancyService = new TenancyService();
  });

  it('should isolate tenant context across concurrent asynchronous executions using AsyncLocalStorage', async () => {
    const tenantA = { id: 'tenant-school-a', name: 'School A' } as Tenant;
    const tenantB = { id: 'tenant-school-b', name: 'School B' } as Tenant;

    const promiseA = TenancyService.runWithTenant(tenantA, async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return tenancyService.getTenantId();
    });

    const promiseB = TenancyService.runWithTenant(tenantB, async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return tenancyService.getTenantId();
    });

    const [resolvedA, resolvedB] = await Promise.all([promiseA, promiseB]);

    expect(resolvedA).toBe('tenant-school-a');
    expect(resolvedB).toBe('tenant-school-b');
  });

  it('should fallback gracefully when outside AsyncLocalStorage run scope', () => {
    const fallbackTenant = { id: 'tenant-fallback', name: 'Fallback' } as Tenant;
    tenancyService.setTenant(fallbackTenant);

    expect(tenancyService.getTenantId()).toBe('tenant-fallback');
    expect(tenancyService.getTenant()?.name).toBe('Fallback');
  });
});
