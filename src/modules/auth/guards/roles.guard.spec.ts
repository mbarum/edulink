import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../../common/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createMockContext(userRole?: string): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userRole ? { role: userRole } : undefined,
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext(UserRole.TEACHER);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has exact required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = createMockContext(UserRole.ADMIN);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow SuperAdmin to bypass role requirements', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = createMockContext(UserRole.SUPER_ADMIN);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should DENY access to role containing substring (e.g. guest_admin)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = createMockContext('guest_admin');
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should DENY access if user role is not in required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = createMockContext(UserRole.PARENT);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should DENY access if request has no user', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = createMockContext(undefined);
    expect(guard.canActivate(context)).toBe(false);
  });
});
