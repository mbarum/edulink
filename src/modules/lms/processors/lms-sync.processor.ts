import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { LmsService } from '../lms.service';
import { Logger } from '@nestjs/common';

@Processor('lms-sync')
export class LmsSyncProcessor {
  private readonly logger = new Logger(LmsSyncProcessor.name);

  constructor(private readonly lmsService: LmsService) {}

  @Process('sync-students')
  async handleSyncStudents(job: Job<{ tenantId: string }>) {
    this.logger.log(`Processing sync-students for tenant ${job.data.tenantId}...`);
    try {
      const provider = await this.lmsService.getProviderForTenant(job.data.tenantId);
      const students = await provider.syncStudents();
      this.logger.log(`Successfully synced ${students?.length || 0} students for tenant ${job.data.tenantId}`);
      // In a real system, you would save "students" to the DB here.
      return students;
    } catch (error: any) {
      this.logger.error(`Failed to sync students for tenant ${job.data.tenantId}: ${error.message}`);
      throw error;
    }
  }

  @Process('sync-courses')
  async handleSyncCourses(job: Job<{ tenantId: string }>) {
    this.logger.log(`Processing sync-courses for tenant ${job.data.tenantId}...`);
    try {
      const provider = await this.lmsService.getProviderForTenant(job.data.tenantId);
      const courses = await provider.syncCourses();
      this.logger.log(`Successfully synced ${courses?.length || 0} courses for tenant ${job.data.tenantId}`);
      return courses;
    } catch (error: any) {
      this.logger.error(`Failed to sync courses for tenant ${job.data.tenantId}: ${error.message}`);
      throw error;
    }
  }

  @Process('get-grades')
  async handleGetGrades(job: Job<{ tenantId: string; studentId: string }>) {
    this.logger.log(`Processing get-grades for student ${job.data.studentId}...`);
    try {
      const provider = await this.lmsService.getProviderForTenant(job.data.tenantId);
      const grades = await provider.getGrades(job.data.studentId);
      this.logger.log(`Successfully fetched grades for student ${job.data.studentId}`);
      return grades;
    } catch (error: any) {
      this.logger.error(`Failed to get grades for student ${job.data.studentId}: ${error.message}`);
      throw error;
    }
  }
}
