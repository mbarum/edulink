import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { PromotionService } from './promotion.service';
import { StudentsController } from './students.controller';
import { PromotionController } from './promotion.controller';
import { Student } from './entities/student.entity';
import { TenancyModule } from 'src/core/tenancy/tenancy.module';
import { ClassLevel } from '../academics/entities/class-level.entity';
import { Section } from '../academics/entities/section.entity';
import { AcademicYear } from '../academics/entities/academic-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, ClassLevel, Section, AcademicYear]), TenancyModule],
  controllers: [StudentsController, PromotionController],
  providers: [StudentsService, PromotionService],
  exports: [StudentsService, PromotionService],
})
export class StudentsModule {}
