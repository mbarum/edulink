import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Student } from './entities/student.entity';
import { EnrollmentHistory } from './entities/enrollment-history.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(EnrollmentHistory)
    private readonly enrollmentHistoryRepository: Repository<EnrollmentHistory>,
    private readonly tenancyService: TenancyService,
  ) {}

  async promoteStudents(
    studentIds: string[],
    nextClassLevelId: string,
    nextSectionId: string,
    nextAcademicYearId: string,
  ): Promise<void> {
    const tenantId = this.tenancyService.getTenantId();

    const students = await this.studentRepository.find({
      where: {
        id: In(studentIds),
        tenantId,
      },
    });

    if (students.length === 0) {
      throw new NotFoundException('No students found for promotion');
    }

    // Preserve historical enrollment records before promoting
    const historyRecords = students.map((student) => {
      return this.enrollmentHistoryRepository.create({
        tenantId,
        studentId: student.id,
        academicYearId: student.academicYearId,
        classLevelId: student.classLevelId,
        sectionId: student.sectionId,
        status: 'Promoted',
        promotedAt: new Date(),
      });
    });
    await this.enrollmentHistoryRepository.save(historyRecords);

    const updatedStudents = students.map((student) => {
      return {
        ...student,
        classLevelId: nextClassLevelId,
        sectionId: nextSectionId,
        academicYearId: nextAcademicYearId,
      };
    });

    await this.studentRepository.save(updatedStudents);
  }

  async graduateStudents(studentIds: string[]): Promise<void> {
    const tenantId = this.tenancyService.getTenantId();

    const students = await this.studentRepository.find({
      where: { id: In(studentIds), tenantId },
    });

    if (students.length > 0) {
      const historyRecords = students.map((student) => {
        return this.enrollmentHistoryRepository.create({
          tenantId,
          studentId: student.id,
          academicYearId: student.academicYearId,
          classLevelId: student.classLevelId,
          sectionId: student.sectionId,
          status: 'Graduated',
          promotedAt: new Date(),
        });
      });
      await this.enrollmentHistoryRepository.save(historyRecords);
    }

    await this.studentRepository.update(
      { id: In(studentIds), tenantId },
      { status: 'Graduated' },
    );
  }

  async getStudentHistory(studentId: string): Promise<EnrollmentHistory[]> {
    const tenantId = this.tenancyService.getTenantId();
    return this.enrollmentHistoryRepository.find({
      where: { studentId, tenantId },
      order: { promotedAt: 'DESC' },
    });
  }
}
