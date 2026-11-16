import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Tenant } from 'src/modules/tenants/entities/tenant.entity';

export interface TenancyStore {
  tenant?: Tenant;
}

@Injectable()
export class TenancyService {
  private static readonly als = new AsyncLocalStorage<TenancyStore>();
  private fallbackTenant?: Tenant;

  static runWithTenant<R>(tenant: Tenant, fn: () => R): R {
    return TenancyService.als.run({ tenant }, fn);
  }

  setTenant(tenant: Tenant) {
    const store = TenancyService.als.getStore();
    if (store) {
      store.tenant = tenant;
    } else {
      this.fallbackTenant = tenant;
    }
  }

  getTenant(): Tenant | undefined {
    const store = TenancyService.als.getStore();
    return store?.tenant ?? this.fallbackTenant;
  }

  getTenantId(): string | undefined {
    return this.getTenant()?.id;
  }
}
