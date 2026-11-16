import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/common/user-role.enum';
import { PromotionService } from './promotion.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students/promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post('promote')
  @Roles(UserRole.ADMIN)
  promote(
    @Body()
    data: {
      studentIds: string[];
      nextClassLevelId: string;
      nextSectionId: string;
      nextAcademicYearId: string;
    },
  ) {
    return this.promotionService.promoteStudents(
      data.studentIds,
      data.nextClassLevelId,
      data.nextSectionId,
      data.nextAcademicYearId,
    );
  }

  @Post('graduate')
  @Roles(UserRole.ADMIN)
  graduate(@Body() data: { studentIds: string[] }) {
    return this.promotionService.graduateStudents(data.studentIds);
  }

  @Get('history/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
  getHistory(@Param('studentId') studentId: string) {
    return this.promotionService.getStudentHistory(studentId);
  }
}
