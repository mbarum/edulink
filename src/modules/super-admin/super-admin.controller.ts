import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Patch,
  Body,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuperAdminService } from './super-admin.service';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { CreatePlanDto } from '../subscriptions/dto/create-plan.dto';
import { UpdatePlanDto } from '../subscriptions/dto/update-plan.dto';
import { UpdateTenantSubscriptionDto } from './dto/update-tenant-subscription.dto';
import { UpdatePlatformBrandingDto } from './dto/update-platform-branding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { UserRole } from 'src/common/user-role.enum';
import { SkipSubscriptionCheck } from '../auth/decorators/skip-subscription-check.decorator';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@SkipSubscriptionCheck()
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('analytics')
  getDashboardAnalytics() {
    return this.superAdminService.getDashboardAnalytics();
  }

  @Get('tenants')
  getAllTenants() {
    return this.superAdminService.getAllTenants();
  }

  @Get('tenants/:id')
  getTenantById(@Param('id') id: string) {
    return this.superAdminService.getTenantById(id);
  }

  @Get('payments/pending')
  getPendingPayments() {
    return this.superAdminService.getPendingPayments();
  }

  @Patch('tenants/:id/status')
  updateTenantStatus(
    @Param('id') id: string,
    @Body() updateTenantStatusDto: UpdateTenantStatusDto,
  ) {
    return this.superAdminService.updateTenantStatus(id, updateTenantStatusDto.status);
  }

  @Patch('tenants/:id/subscription')
  updateTenantSubscription(
    @Param('id') id: string,
    @Body() updateTenantSubscriptionDto: UpdateTenantSubscriptionDto,
  ) {
    return this.superAdminService.updateTenantSubscription(id, updateTenantSubscriptionDto);
  }

  @Patch('payments/:id/status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ) {
    return this.superAdminService.updatePaymentStatus(id, updatePaymentStatusDto.status);
  }

  @Delete('tenants/:id')
  deleteTenant(@Param('id') id: string) {
    return this.superAdminService.deleteTenant(id);
  }

  @Get('users')
  getAllUsers() {
    return this.superAdminService.getAllUsers();
  }

  // ---------------------------------------------------------------------------
  // Superadmin Package / Plan CRUD
  // ---------------------------------------------------------------------------

  @Get('plans')
  getAllPlans() {
    return this.superAdminService.getAllPlans();
  }

  @Get('plans/:id')
  getPlanById(@Param('id') id: string) {
    return this.superAdminService.getPlanById(id);
  }

  @Post('plans')
  createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.superAdminService.createPlan(createPlanDto);
  }

  @Patch('plans/:id')
  updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.superAdminService.updatePlan(id, updatePlanDto);
  }

  @Delete('plans/:id')
  deletePlan(@Param('id') id: string) {
    return this.superAdminService.deletePlan(id);
  }

  // ---------------------------------------------------------------------------
  // Superadmin Platform Branding (Logo & Favicon)
  // ---------------------------------------------------------------------------

  @Get('branding')
  getPlatformBranding() {
    return this.superAdminService.getPlatformBranding();
  }

  @Patch('branding')
  updatePlatformBranding(@Body() dto: UpdatePlatformBrandingDto) {
    return this.superAdminService.updatePlatformBranding(dto);
  }

  @Post('branding/logo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(png|jpeg|jpg|svg\+xml|webp)$/)) {
          return cb(
            new BadRequestException('Only image files (PNG, JPG, SVG, WebP) are allowed for logo.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No logo file provided.');
    }
    return this.superAdminService.saveBrandingAsset(file, 'logo');
  }

  @Post('branding/favicon')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(x-icon|vnd\.microsoft\.icon|png|svg\+xml|ico)$/)) {
          return cb(
            new BadRequestException('Only icon files (.ico, .png, .svg) are allowed for favicon.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadFavicon(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No favicon file provided.');
    }
    return this.superAdminService.saveBrandingAsset(file, 'favicon');
  }
}
