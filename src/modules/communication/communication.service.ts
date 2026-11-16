import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { UserRole } from 'src/common/user-role.enum';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';

@Injectable()
export class CommunicationService extends TenantAwareCrudService<Message> {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    tenancyService: TenancyService,
  ) {
    super(messageRepository, tenancyService);
  }

  async findUserMessages(userId: string): Promise<Message[]> {
    const tenantId = this.tenancyService.getTenantId();
    return this.messageRepository.find({
      where: [
        { tenantId, senderId: userId },
        { tenantId, recipientId: userId },
      ],
      order: { sentAt: 'DESC' },
    });
  }

  async findUserMessageById(
    id: string,
    userId: string,
    role?: string,
  ): Promise<Message> {
    const tenantId = this.tenancyService.getTenantId();
    const message = await this.messageRepository.findOne({
      where: { id, tenantId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
      if (message.senderId !== userId && message.recipientId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to view this message',
        );
      }
    }
    return message;
  }
}
