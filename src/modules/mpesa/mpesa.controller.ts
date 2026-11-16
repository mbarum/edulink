import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { MpesaService } from './mpesa.service';
import { StkPushDto } from './dto/stk-push.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SkipSubscriptionCheck } from '../auth/decorators/skip-subscription-check.decorator';

@Controller('mpesa')
@SkipSubscriptionCheck()
export class MpesaController {
  constructor(private readonly mpesaService: MpesaService) {}

  @Post('stk-push')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  stkPush(@Body() stkPushDto: StkPushDto) {
    return this.mpesaService.stkPush(
      stkPushDto.phone,
      stkPushDto.amount,
      stkPushDto.plan,
      stkPushDto.billingCycle || 'monthly',
    );
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  handleCallback(
    @Body() body: Record<string, any>,
    @Req() req: Request,
  ) {
    return this.mpesaService.handleCallback(body, req);
  }
}
