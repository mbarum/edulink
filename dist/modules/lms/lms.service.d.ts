import { Repository } from 'typeorm';
import { LmsConnection } from './entities/lms-connection.entity';
import { TenancyService } from 'src/core/tenancy/tenancy.service';
import { CryptoService } from 'src/shared/crypto.service';
import { ConnectLmsDto } from './dto/connect-lms.dto';
import { LmsProvider } from './providers/lms-provider.interface';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
export declare class LmsService {
    private readonly lmsConnectionRepository;
    private readonly tenancyService;
    private readonly cryptoService;
    private readonly configService;
    private readonly syncQueue;
    constructor(lmsConnectionRepository: Repository<LmsConnection>, tenancyService: TenancyService, cryptoService: CryptoService, configService: ConfigService, syncQueue: Queue);
    connect(connectLmsDto: ConnectLmsDto): Promise<LmsConnection>;
    syncStudents(): Promise<{
        message: string;
        jobId: import("bull").JobId;
    }>;
    syncCourses(): Promise<{
        message: string;
        jobId: import("bull").JobId;
    }>;
    getGrades(studentId: string): Promise<{
        message: string;
        jobId: import("bull").JobId;
    }>;
    getProviderForTenant(tenantId: string): Promise<LmsProvider>;
    private getCurrentProvider;
    private getProvider;
}
