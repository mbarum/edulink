import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunicationService } from './communication.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserRole } from 'src/common/user-role.enum';

@UseGuards(JwtAuthGuard)
@Controller('communication')
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post('messages')
  create(@Body() createMessageDto: CreateMessageDto, @Req() req: any) {
    if (!createMessageDto.senderId || req.user?.role !== UserRole.ADMIN) {
      createMessageDto.senderId = req.user.userId;
    }
    return this.communicationService.create(createMessageDto);
  }

  @Get('messages')
  findAll(@Req() req: any) {
    return this.communicationService.findUserMessages(req.user.userId);
  }

  @Get('messages/:id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.communicationService.findUserMessageById(
      id,
      req.user.userId,
      req.user?.role,
    );
  }
}
