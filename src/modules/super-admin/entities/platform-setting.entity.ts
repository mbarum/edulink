import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('platform_settings')
export class PlatformSetting {
  @PrimaryColumn({ default: 'global' })
  id: string;

  @Column({ default: 'SaaSLink' })
  platformName: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  faviconUrl: string;

  @Column({ nullable: true })
  tagline: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
