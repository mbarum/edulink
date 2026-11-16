import { Repository } from 'typeorm';
import { TenantAwareCrudService } from './tenant-aware-crud.service';
import { TenantAwareEntity } from '../tenancy/tenant-aware.entity';
import { TenancyService } from '../tenancy/tenancy.service';

class TestEntity extends TenantAwareEntity {
  name: string;
  status: string;
}

class TestCrudService extends TenantAwareCrudService<TestEntity> {
  constructor(repo: Repository<TestEntity>, tenancy: TenancyService) {
    super(repo, tenancy);
  }
}

describe('TenantAwareCrudService', () => {
  let service: TestCrudService;
  let mockRepo: jest.Mocked<Partial<Repository<TestEntity>>>;
  let mockTenancyService: Partial<TenancyService>;

  beforeEach(() => {
    mockRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      remove: jest.fn(),
    };

    mockTenancyService = {
      getTenantId: jest.fn().mockReturnValue('tenant-123'),
    };

    service = new TestCrudService(
      mockRepo as Repository<TestEntity>,
      mockTenancyService as TenancyService,
    );
  });

  it('should scope simple findAll query by tenantId', async () => {
    await service.findAll({ where: { status: 'active' } });

    expect(mockRepo.find).toHaveBeenCalledWith({
      where: {
        status: 'active',
        tenantId: 'tenant-123',
      },
    });
  });

  it('should map tenantId across array OR conditions without converting to object keys', async () => {
    await service.findAll({
      where: [{ status: 'active' }, { status: 'pending' }],
    });

    expect(mockRepo.find).toHaveBeenCalledWith({
      where: [
        { status: 'active', tenantId: 'tenant-123' },
        { status: 'pending', tenantId: 'tenant-123' },
      ],
    });
  });

  it('should supply tenantId when no where clause is passed', async () => {
    await service.findAll();

    expect(mockRepo.find).toHaveBeenCalledWith({
      where: {
        tenantId: 'tenant-123',
      },
    });
  });
});
