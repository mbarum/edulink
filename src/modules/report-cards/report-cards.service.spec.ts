import { Repository } from 'typeorm';
import { ReportCardsService } from './report-cards.service';
import { ReportCard } from './entities/report-card.entity';
import { ReportCardItem } from './entities/report-card-item.entity';
import { TenancyService } from '../../core/tenancy/tenancy.service';

describe('ReportCardsService', () => {
  let service: ReportCardsService;
  let mockReportCardRepo: jest.Mocked<Partial<Repository<ReportCard>>>;
  let mockReportCardItemRepo: jest.Mocked<Partial<Repository<ReportCardItem>>>;
  let mockTenancyService: Partial<TenancyService>;

  beforeEach(() => {
    mockReportCardRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    mockReportCardItemRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
    };

    mockTenancyService = {
      getTenantId: jest.fn().mockReturnValue('tenant-reports-1'),
    };

    service = new ReportCardsService(
      mockReportCardRepo as Repository<ReportCard>,
      mockReportCardItemRepo as Repository<ReportCardItem>,
      mockTenancyService as TenancyService,
    );
  });

  it('should compute totalMarks, averageMarks, gpa, and overallGrade for multi-subject report cards', async () => {
    const inputPayload = {
      studentId: 'student-42',
      examinationId: 'exam-term-1',
      term: 'Term 1',
      items: [
        { subjectId: 'math', subjectName: 'Mathematics', marks: 88 }, // A (4.0)
        { subjectId: 'eng', subjectName: 'English', marks: 74 }, // B (3.0)
        { subjectId: 'sci', subjectName: 'Science', marks: 62 }, // C (2.0)
        { subjectId: 'hist', subjectName: 'History', marks: 96 }, // A (4.0)
      ],
    };

    const result = await service.create(inputPayload as any);

    // Total: 88 + 74 + 62 + 96 = 320
    expect(result.totalMarks).toBe(320);
    // Average: 320 / 4 = 80
    expect(result.averageMarks).toBe(80);
    // Overall grade for 80 average is 'A'
    expect(result.overallGrade).toBe('A');
    // GPA: (4.0 + 3.0 + 2.0 + 4.0) / 4 = 13.0 / 4 = 3.25
    expect(result.gpa).toBe('3.25');
    expect(result.items).toHaveLength(4);
  });
});
