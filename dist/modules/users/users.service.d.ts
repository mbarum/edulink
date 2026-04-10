import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { TenantAwareCrudService } from 'src/core/common/tenant-aware-crud.service';
export declare class UsersService extends TenantAwareCrudService<User> {
    private readonly userRepository;
    constructor(userRepository: Repository<User>, tenancyService: TenancyService);
    create(userDto: Partial<User>): Promise<User>;
    createRaw(userDto: Partial<User>): Promise<User>;
    findAll(): Promise<User[]>;
    update(id: string, userDto: Partial<User>): Promise<User>;
    remove(id: string): Promise<void>;
    findByUsername(username: string): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
    findByMicrosoftId(microsoftId: string): Promise<User | null>;
    setPasswordResetToken(id: string, token: string, expires: Date): Promise<void>;
    findOneByPasswordResetToken(token: string): Promise<User | null>;
    resetPassword(id: string, password: string): Promise<User | null>;
}
