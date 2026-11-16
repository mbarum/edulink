import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportCardsService } from './report-cards.service';
import { ReportCardsController } from './report-cards.controller';
import { ReportCard } from './entities/report-card.entity';
import { ReportCardItem } from './entities/report-card-item.entity';
import { TenancyModule } from 'src/core/tenancy/tenancy.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReportCard, ReportCardItem]), TenancyModule],
  controllers: [ReportCardsController],
  providers: [ReportCardsService],
})
export class ReportCardsModule {}
