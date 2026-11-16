import { Repository } from 'typeorm';
import { PromotionService } from './promotion.service';
import { Student } from './entities/student.entity';
import { EnrollmentHistory } from './entities/enrollment-history.entity';
import { TenancyService } from '../../core/tenancy/tenancy.service';

describe('PromotionService', () => {
  let service: PromotionService;
  let mockStudentRepo: jest.Mocked<Partial<Repository<Student>>>;
  let mockHistoryRepo: jest.Mocked<Partial<Repository<EnrollmentHistory>>>;
  let mockTenancyService: Partial<TenancyService>;

  beforeEach(() => {
    mockStudentRepo = {
      find: jest.fn(),
      save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
      update: jest.fn().mockResolvedValue({ affected: 1 } as any),
    };

    mockHistoryRepo = {
      create: jest.fn().mockImplementation((val) => val),
      save: jest.fn().mockImplementation((val) => Promise.resolve(val)),
      find: jest.fn(),
    };

    mockTenancyService = {
      getTenantId: jest.fn().mockReturnValue('tenant-promo'),
    };

    service = new PromotionService(
      mockStudentRepo as Repository<Student>,
      mockHistoryRepo as Repository<EnrollmentHistory>,
      mockTenancyService as TenancyService,
    );
  });

  it('should create immutable EnrollmentHistory records before updating student grade pointers', async () => {
    const existingStudents: Student[] = [
      {
        id: 'student-101',
        tenantId: 'tenant-promo',
        classLevelId: 'grade-10',
        sectionId: 'sec-a',
        academicYearId: '2025-2026',
      } as Student,
    ];

    mockStudentRepo.find = jest.fn().mockResolvedValue(existingStudents);

    await service.promoteStudents(
      ['student-101'],
      'grade-11',
      'sec-b',
      '2026-2027',
    );

    // Verify history was archived with PREVIOUS grade level
    expect(mockHistoryRepo.save).toHaveBeenCalledWith([
      expect.objectContaining({
        studentId: 'student-101',
        classLevelId: 'grade-10',
        sectionId: 'sec-a',
        academicYearId: '2025-2026',
        status: 'Promoted',
      }),
    ]);

    // Verify student was updated to NEXT grade level
    expect(mockStudentRepo.save).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'student-101',
        classLevelId: 'grade-11',
        sectionId: 'sec-b',
        academicYearId: '2026-2027',
      }),
    ]);
  });
});
