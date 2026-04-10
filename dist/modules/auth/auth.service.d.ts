import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../../shared/email.service';
import { RegisterSchoolDto } from './dto/register-school.dto';
import { TenantsService } from '../tenants/tenants.service';
export declare class AuthService {
    private readonly usersService;
    private readonly tenantsService;
    private readonly jwtService;
    private readonly emailService;
    constructor(usersService: UsersService, tenantsService: TenantsService, jwtService: JwtService, emailService: EmailService);
    validateUser(username: string, pass: string): Promise<Partial<User> | null>;
    validateOAuthLogin(profile: any, provider: 'google' | 'microsoft'): Promise<User>;
    login(user: User): {
        access_token: string;
    };
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, password: string): Promise<User | null>;
    registerSchool(dto: RegisterSchoolDto): Promise<{
        access_token: string;
    }>;
}
