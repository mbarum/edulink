import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeepPartial } from 'typeorm';
import { Student } from './entities/student.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
import * as ExcelJS from 'exceljs';
import { ClassLevel } from '../academics/entities/class-level.entity';
import { Section } from '../academics/entities/section.entity';
import { AcademicYear } from '../academics/entities/academic-year.entity';

@Injectable()
export class StudentsService extends TenantAwareCrudService<Student> {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(ClassLevel)
    private readonly classLevelRepository: Repository<ClassLevel>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
    private readonly dataSource: DataSource,
    tenancyService: TenancyService,
  ) {
    super(studentRepository, tenancyService);
  }

  async create(createDto: DeepPartial<Student>): Promise<Student> {
    if (createDto.parentalConsentVerified) {
      createDto.consentTimestamp = new Date();
    }
    return super.create(createDto);
  }

  async bulkUpload(file: Express.Multer.File): Promise<{ success: number; failed: number; errors: any[] }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const tenantId = this.tenancyService.getTenantId();
    const workbook = new ExcelJS.Workbook();
    
    // Support both Xslx and CSV based on mimetype or extension
    if (file.originalname.match(/\.csv$/)) {
      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);
      await workbook.csv.read(bufferStream);
    } else {
      await workbook.xlsx.load(file.buffer as any);
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('File is empty or invalid format');
    }

    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values as any[];
    // headers array is 1-indexed in ExcelJS, mapping index to header name
    const headerMap: { [key: string]: number } = {};
    headers.forEach((h, index) => {
      if (h) headerMap[h.toString().trim().toLowerCase()] = index;
    });

    const expectedHeaders = ['firstname', 'lastname'];
    for (const h of expectedHeaders) {
      if (!headerMap[h]) {
        throw new BadRequestException(`Missing required column: ${h}`);
      }
    }

    // Cache entities to avoid repeated DB lookups
    const classes = await this.classLevelRepository.find({ where: { tenantId } });
    const classMap = new Map(classes.map(c => [c.name.trim().toLowerCase(), c.id]));

    const sections = await this.sectionRepository.find({ where: { tenantId } });
    const sectionMap = new Map(sections.map(s => [s.name.trim().toLowerCase(), s.id]));

    const academicYears = await this.academicYearRepository.find({ where: { tenantId } });
    const yearMap = new Map(academicYears.map(y => [y.name.trim().toLowerCase(), y.id]));

    let successCount = 0;
    const errors = [];
    const studentsToSave: Student[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip headers

      const rowValues = row.values as any[];
      const getVal = (col: string) => {
         const idx = headerMap[col.toLowerCase()];
         const val = idx ? rowValues[idx] : null;
         return val?.text ? val.text : val?.toString()?.trim(); // Handle rich text
      };

      const firstName = getVal('firstName');
      const lastName = getVal('lastName');
      const registrationNumber = getVal('registrationNumber');
      const className = getVal('class');
      const sectionName = getVal('section');
      const academicYearName = getVal('academicYear');

      if (!firstName || !lastName) {
        errors.push({ row: rowNumber, error: 'Missing first name or last name' });
        return;
      }

      const student = new Student();
      student.firstName = firstName;
      student.lastName = lastName;
      student.registrationNumber = registrationNumber;
      student.tenantId = tenantId;
      
      if (className && classMap.has(className.toLowerCase())) {
        student.classLevelId = classMap.get(className.toLowerCase());
      } else if (className) {
        errors.push({ row: rowNumber, error: `Class not found: ${className}` });
        return;
      }

      if (sectionName && sectionMap.has(sectionName.toLowerCase())) {
        student.sectionId = sectionMap.get(sectionName.toLowerCase());
      } else if (sectionName) {
        errors.push({ row: rowNumber, error: `Section not found: ${sectionName}` });
        return;
      }

      if (academicYearName && yearMap.has(academicYearName.toLowerCase())) {
        student.academicYearId = yearMap.get(academicYearName.toLowerCase());
      } else if (academicYearName) {
        errors.push({ row: rowNumber, error: `Academic Year not found: ${academicYearName}` });
        return;
      }

      studentsToSave.push(student);
      successCount++;
    });

    if (studentsToSave.length > 0) {
      await this.dataSource.transaction(async (manager) => {
        await manager.getRepository(Student).save(studentsToSave, { chunk: 100 });
      });
    }

    return {
      success: successCount,
      failed: errors.length,
      errors
    };
  }
}
