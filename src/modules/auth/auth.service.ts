import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../../shared/email.service';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../common/user-role.enum';

import { RegisterSchoolDto } from './dto/register-school.dto';
import { TenantsService } from '../tenants/tenants.service';
import { SubscriptionPlan } from '../../common/subscription.enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const result: Partial<User> = { ...user };
      delete result.password_hash;
      return result;
    }
    return null;
  }

  async validateOAuthLogin(profile: any, provider: 'google' | 'microsoft'): Promise<User> {
    let user: User | null = null;
    const providerId = profile.id;

    if (provider === 'google') {
      user = await this.usersService.findByGoogleId(providerId);
    } else if (provider === 'microsoft') {
      user = await this.usersService.findByMicrosoftId(providerId);
    }

    if (user) {
      if (!user.tenantId && user.role !== UserRole.SUPER_ADMIN) {
        throw new UnauthorizedException(
          'User account is not associated with an active educational institution.',
        );
      }
      return user;
    }

    // Not found by ID, look up by email
    const email = profile.emails?.[0]?.value || profile._json?.userPrincipalName;
    if (!email) {
      throw new UnauthorizedException(`No email found in ${provider} profile`);
    }

    user = await this.usersService.findByUsername(email);

    if (user) {
      if (!user.tenantId && user.role !== UserRole.SUPER_ADMIN) {
        throw new UnauthorizedException(
          'User account is not associated with an active educational institution.',
        );
      }
      // Link the new provider to existing user
      if (provider === 'google') {
        user = await this.usersService.update(user.id, { googleId: providerId });
      } else if (provider === 'microsoft') {
        user = await this.usersService.update(user.id, { microsoftId: providerId });
      }
      return user;
    }

    // SEC-012: Require prior institutional invitation or user record before OAuth access
    // Unknown identities cannot create orphaned unassociated accounts
    throw new UnauthorizedException(
      `No active educational institution account found for ${email}. Please ensure your school administrator has registered or invited your email address before signing in with ${provider}.`,
    );
  }

  login(user: User): { access_token: string } {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      tenantId: user.tenantId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByUsername(email);
    if (!user) {
      // Don't reveal that the user doesn't exist
      return;
    }

    const token = uuidv4();
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await this.usersService.setPasswordResetToken(user.id, hashedToken, expires);
    await this.emailService.sendPasswordResetEmail(user.username, token);
  }

  async resetPassword(token: string, password: string): Promise<User | null> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findOneByPasswordResetToken(hashedToken);

    if (!user || !user.password_reset_expires || user.password_reset_expires < new Date()) {
      throw new Error('Password reset token is invalid or has expired.');
    }

    return this.usersService.resetPassword(user.id, password);
  }

  async registerSchool(
    dto: RegisterSchoolDto,
  ): Promise<{ access_token: string }> {
    // 1. Create Tenant
    const tenant = await this.tenantsService.create({
      name: dto.schoolName,
      domain: dto.domain,
      plan: (dto.plan as SubscriptionPlan) || SubscriptionPlan.FREE,
    });

    // 2. Create Admin User for this tenant
    // We need to bypass the normal tenancy check during registration
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(dto.adminPassword, salt);

    const adminUser = await this.usersService.createRaw({
      username: dto.adminEmail,
      password_hash,
      role: UserRole.ADMIN,
      tenantId: tenant.id,
    });

    // 3. Login the user automatically
    return this.login(adminUser);
  }
}
