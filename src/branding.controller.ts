import { Controller, Get } from '@nestjs/common';
import { SuperAdminService } from './modules/super-admin/super-admin.service';
import { SkipSubscriptionCheck } from './modules/auth/decorators/skip-subscription-check.decorator';

@Controller('branding')
@SkipSubscriptionCheck()
export class BrandingController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get()
  getPublicBranding() {
    return this.superAdminService.getPlatformBranding();
  }
}
