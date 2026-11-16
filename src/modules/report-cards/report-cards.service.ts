import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { ReportCard } from './entities/report-card.entity';
import { ReportCardItem } from './entities/report-card-item.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';

@Injectable()
export class ReportCardsService extends TenantAwareCrudService<ReportCard> {
  constructor(
    @InjectRepository(ReportCard)
    private readonly reportCardRepository: Repository<ReportCard>,
    @InjectRepository(ReportCardItem)
    private readonly reportCardItemRepository: Repository<ReportCardItem>,
    tenancyService: TenancyService,
  ) {
    super(reportCardRepository, tenancyService);
  }

  private calculateGrade(marks: number): { grade: string; gpaPoint: number } {
    if (marks >= 80) return { grade: 'A', gpaPoint: 4.0 };
    if (marks >= 70) return { grade: 'B', gpaPoint: 3.0 };
    if (marks >= 60) return { grade: 'C', gpaPoint: 2.0 };
    if (marks >= 50) return { grade: 'D', gpaPoint: 1.0 };
    return { grade: 'E', gpaPoint: 0.0 };
  }

  async create(createDto: DeepPartial<ReportCard>): Promise<ReportCard> {
    const tenantId = this.tenancyService.getTenantId() as string;
    const items = (createDto as any).items as any[];

    if (items && items.length > 0) {
      let totalMarks = 0;
      let totalPoints = 0;

      const preparedItems = items.map((item) => {
        const itemMarks = Number(item.marks) || 0;
        totalMarks += itemMarks;
        const evaluation = this.calculateGrade(itemMarks);
        totalPoints += evaluation.gpaPoint;

        return this.reportCardItemRepository.create({
          ...item,
          marks: itemMarks,
          grade: item.grade || evaluation.grade,
          tenantId,
        });
      });

      const averageMarks = totalMarks / items.length;
      const gpa = (totalPoints / items.length).toFixed(2);
      const overallGrade = this.calculateGrade(averageMarks).grade;

      const reportCard = this.reportCardRepository.create({
        ...createDto,
        tenantId,
        totalMarks,
        averageMarks,
        gpa,
        overallGrade,
        marks: averageMarks,
        grade: overallGrade,
        items: preparedItems,
      } as DeepPartial<ReportCard>);

      return this.reportCardRepository.save(reportCard);
    }

    // Fallback for single mark without items
    if (createDto.marks !== undefined && !createDto.grade) {
      createDto.grade = this.calculateGrade(Number(createDto.marks)).grade;
    }
    return super.create(createDto);
  }
}
