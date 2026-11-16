import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from 'src/common/user-role.enum';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';

@Injectable()
export class UsersService extends TenantAwareCrudService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    tenancyService: TenancyService,
  ) {
    super(userRepository, tenancyService);
  }

  async create(userDto: Partial<User>): Promise<User> {
    // Security: Prevent setting id manually
    Reflect.deleteProperty(userDto, 'id');

    if (userDto.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Cannot create Super Admin accounts from tenant endpoints',
      );
    }

    let password_hash = userDto.password_hash;
    if (password_hash) {
      const salt = await bcrypt.genSalt(12);
      password_hash = await bcrypt.hash(password_hash, salt);
    }

    const newUser = this.userRepository.create({
      ...userDto,
      password_hash,
      tenantId: this.tenancyService.getTenantId(),
    });

    const savedUser = await this.userRepository.save(newUser);
    delete (savedUser as any).password_hash;
    return savedUser;
  }

  async createRaw(userDto: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userDto);
    const savedUser = await this.userRepository.save(newUser);
    delete (savedUser as any).password_hash;
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { tenantId: this.tenancyService.getTenantId() },
    });
  }

  async update(id: string, userDto: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, tenantId: this.tenancyService.getTenantId() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Cannot modify Super Admin accounts from tenant endpoints',
      );
    }

    if (userDto.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot assign Super Admin role');
    }

    // Security: Prevent updating tenantId or id
    Reflect.deleteProperty(userDto, 'id');
    Reflect.deleteProperty(userDto, 'tenantId');

    if (userDto.password_hash) {
      const salt = await bcrypt.genSalt(12);
      userDto.password_hash = await bcrypt.hash(
        userDto.password_hash,
        salt,
      );
    }

    const updatedUser = await super.update(id, userDto as any);
    delete (updatedUser as any).password_hash;
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete({
      id,
      tenantId: this.tenancyService.getTenantId(),
    });
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.username = :username', { username })
      .getOne();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }

  async findByMicrosoftId(microsoftId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { microsoftId } });
  }

  async setPasswordResetToken(
    id: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    await this.userRepository.update(id, {
      password_reset_token: token,
      password_reset_expires: expires,
    });
  }

  async findOneByPasswordResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { password_reset_token: token },
    });
  }

  async resetPassword(id: string, password: string): Promise<User | null> {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.userRepository.update(id, {
      password_hash: hashedPassword,
      password_reset_token: null as any,
      password_reset_expires: null as any,
    });
    return this.userRepository.findOne({ where: { id } });
  }
}
