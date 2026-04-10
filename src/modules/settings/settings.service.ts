import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSettings } from './entities/setting.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { TenancyService } from 'src/core/tenancy/tenancy.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(TenantSettings)
    private readonly settingsRepository: Repository<TenantSettings>,
    private readonly tenancyService: TenancyService,
  ) {}

  async getSettings(): Promise<TenantSettings> {
    const tenantId = this.tenancyService.getTenantId();
    let settings = await this.settingsRepository.findOne({ where: { tenantId } });

    if (!settings) {
      // Auto-initialize default singleton if missing
      const newSettings = this.settingsRepository.create({ tenantId });
      settings = await this.settingsRepository.save(newSettings);
    }

    return settings;
  }

  async updateSettings(updateDto: UpdateSettingDto): Promise<TenantSettings> {
    const settings = await this.getSettings(); // Implicitly strict fetches only identical tenant scopes
    Object.assign(settings, updateDto);
    return this.settingsRepository.save(settings);
  }
}
