import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { TenancyService } from '../../core/tenancy/tenancy.service';
import { UserRole } from '../../common/user-role.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepo: jest.Mocked<Partial<Repository<User>>>;
  let mockTenancyService: Partial<TenancyService>;

  beforeEach(() => {
    mockUserRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 } as any),
      delete: jest.fn().mockResolvedValue({ affected: 1 } as any),
    };

    mockTenancyService = {
      getTenantId: jest.fn().mockReturnValue('tenant-abc'),
    };

    service = new UsersService(
      mockUserRepo as Repository<User>,
      mockTenancyService as TenancyService,
    );
  });

  describe('create', () => {
    it('should throw ForbiddenException if attempting to create SUPER_ADMIN from tenant', async () => {
      await expect(
        service.create({
          username: 'badactor@example.com',
          role: UserRole.SUPER_ADMIN,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException if user being modified is SUPER_ADMIN', async () => {
      mockUserRepo.findOne = jest.fn().mockResolvedValue({
        id: 'user-1',
        role: UserRole.SUPER_ADMIN,
        tenantId: 'tenant-abc',
      } as User);

      await expect(
        service.update('user-1', { username: 'newname' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if attempting to elevate a user to SUPER_ADMIN', async () => {
      mockUserRepo.findOne = jest.fn().mockResolvedValue({
        id: 'user-2',
        role: UserRole.TEACHER,
        tenantId: 'tenant-abc',
      } as User);

      await expect(
        service.update('user-2', { role: UserRole.SUPER_ADMIN }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should strip id and tenantId from updates', async () => {
      mockUserRepo.findOne = jest.fn().mockResolvedValue({
        id: 'user-3',
        role: UserRole.TEACHER,
        tenantId: 'tenant-abc',
      } as User);

      const updatePayload: any = {
        id: 'hacked-id',
        tenantId: 'hacked-tenant',
        role: UserRole.ADMIN,
      };

      await service.update('user-3', updatePayload);
      expect(updatePayload.id).toBeUndefined();
      expect(updatePayload.tenantId).toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('should clear password_reset_token and expires by setting them to null', async () => {
      mockUserRepo.findOne = jest.fn().mockResolvedValue({
        id: 'user-reset',
        username: 'user@school.org',
      } as User);

      await service.resetPassword('user-reset', 'newPassword123!');

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        'user-reset',
        expect.objectContaining({
          password_reset_token: null,
          password_reset_expires: null,
        }),
      );
    });
  });
});
