import { TenantAwareEntity } from 'src/core/tenancy/tenant-aware.entity';
import { Section } from './section.entity';
export declare class ClassLevel extends TenantAwareEntity {
    name: string;
    description: string;
    sections: Section[];
}
