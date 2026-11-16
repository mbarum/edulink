import { Entity, Column, Index } from 'typeorm';
import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';

@Entity({ name: 'timetable_entries' })
@Index(['tenantId', 'classLevel'])
@Index(['tenantId', 'subjectId'])
export class TimetableEntry extends TenantAwareEntity {
  @Column()
  classLevel: string;

  @Column()
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

  @Column()
  startTime: string; // e.g., '09:00'

  @Column()
  endTime: string; // e.g., '10:00'

  @Column()
  subjectId: string;

  @Column()
  teacherId: string;
}
