import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1774374830744 implements MigrationInterface {
  name = 'InitialMigration1774374830744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tenants
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`tenants\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`domain\` varchar(255) NOT NULL,
        \`plan\` varchar(50) NOT NULL DEFAULT 'free',
        \`subscriptionStatus\` varchar(50) NOT NULL DEFAULT 'active',
        \`expiresAt\` datetime DEFAULT NULL,
        \`stripe_customer_id\` varchar(255) DEFAULT NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_tenants_name\` (\`name\`),
        UNIQUE KEY \`UQ_tenants_domain\` (\`domain\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`username\` varchar(255) NOT NULL,
        \`password_hash\` varchar(255) DEFAULT NULL,
        \`googleId\` varchar(255) DEFAULT NULL,
        \`microsoftId\` varchar(255) DEFAULT NULL,
        \`password_reset_token\` varchar(255) DEFAULT NULL,
        \`password_reset_expires\` datetime DEFAULT NULL,
        \`role\` varchar(50) NOT NULL DEFAULT 'parent',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_users_username\` (\`username\`),
        KEY \`IDX_users_tenantId\` (\`tenantId\`),
        CONSTRAINT \`FK_users_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Permissions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`permissions\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` varchar(255) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_permissions_tenantId\` (\`tenantId\`),
        CONSTRAINT \`FK_permissions_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Role Permissions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`role_permissions\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`role\` varchar(50) NOT NULL,
        \`permissionId\` varchar(36) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_role_permissions_tenantId\` (\`tenantId\`),
        KEY \`IDX_role_permissions_permissionId\` (\`permissionId\`),
        CONSTRAINT \`FK_role_permissions_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_role_permissions_permissions\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permissions\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Class Levels
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`class_levels\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` varchar(255) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_class_levels_tenantId\` (\`tenantId\`),
        CONSTRAINT \`FK_class_levels_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Sections
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sections\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`classLevelId\` varchar(36) NOT NULL,
        \`room\` varchar(255) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_sections_tenantId\` (\`tenantId\`),
        KEY \`IDX_sections_classLevelId\` (\`classLevelId\`),
        CONSTRAINT \`FK_sections_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_sections_class_levels\` FOREIGN KEY (\`classLevelId\`) REFERENCES \`class_levels\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Academic Years
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`academic_years\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`startDate\` date NOT NULL,
        \`endDate\` date NOT NULL,
        \`isCurrent\` tinyint(1) NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_academic_years_tenantId\` (\`tenantId\`),
        CONSTRAINT \`FK_academic_years_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Students
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`students\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`firstName\` varchar(255) NOT NULL,
        \`lastName\` varchar(255) NOT NULL,
        \`registrationNumber\` varchar(255) DEFAULT NULL,
        \`classLevelId\` varchar(36) DEFAULT NULL,
        \`sectionId\` varchar(36) DEFAULT NULL,
        \`academicYearId\` varchar(36) DEFAULT NULL,
        \`status\` varchar(50) NOT NULL DEFAULT 'Active',
        \`parentId\` varchar(36) DEFAULT NULL,
        \`parentName\` varchar(255) DEFAULT NULL,
        \`parentEmail\` varchar(255) DEFAULT NULL,
        \`parentPhone\` varchar(255) DEFAULT NULL,
        \`parentEmergencyContact\` varchar(255) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_students_tenantId\` (\`tenantId\`),
        KEY \`IDX_students_classLevelId\` (\`classLevelId\`),
        KEY \`IDX_students_sectionId\` (\`sectionId\`),
        KEY \`IDX_students_academicYearId\` (\`academicYearId\`),
        CONSTRAINT \`FK_students_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_students_class_levels\` FOREIGN KEY (\`classLevelId\`) REFERENCES \`class_levels\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_students_sections\` FOREIGN KEY (\`sectionId\`) REFERENCES \`sections\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_students_academic_years\` FOREIGN KEY (\`academicYearId\`) REFERENCES \`academic_years\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. Staff
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`staff\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`firstName\` varchar(255) NOT NULL,
        \`lastName\` varchar(255) NOT NULL,
        \`role\` varchar(100) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`phone\` varchar(50) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_staff_email\` (\`email\`),
        KEY \`IDX_staff_tenantId\` (\`tenantId\`),
        CONSTRAINT \`FK_staff_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. Subjects
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`subjects\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`classLevel\` varchar(255) NOT NULL,
        \`teacherId\` varchar(36) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_subjects_tenantId\` (\`tenantId\`),
        CONSTRAINT \`FK_subjects_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 11. Grading Scales
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`grading_scales\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`grade\` varchar(20) NOT NULL,
        \`minMark\` decimal(5,2) NOT NULL,
        \`maxMark\` decimal(5,2) NOT NULL,
        \`gradePoint\` decimal(5,2) NOT NULL,
        \`remarks\` varchar(255) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_grading_scales_tenantId\` (\`tenantId\`),
        CONSTRAINT \`FK_grading_scales_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 12. Timetable Entries
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`timetable_entries\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`classLevel\` varchar(255) NOT NULL,
        \`dayOfWeek\` varchar(50) NOT NULL,
        \`startTime\` varchar(20) NOT NULL,
        \`endTime\` varchar(20) NOT NULL,
        \`subjectId\` varchar(36) NOT NULL,
        \`teacherId\` varchar(36) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_timetable_entries_tenantId\` (\`tenantId\`),
        CONSTRAINT \`FK_timetable_entries_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 13. Subscription Plans
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`subscription_plans\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` varchar(500) NOT NULL,
        \`price\` int NOT NULL,
        \`interval\` varchar(20) NOT NULL DEFAULT 'month',
        \`stripePriceId\` varchar(255) NOT NULL,
        \`features\` text NOT NULL,
        \`isActive\` tinyint(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_subscription_plans_name\` (\`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 14. Pending Payments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`pending_payments\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) DEFAULT NULL,
        \`amount\` int NOT NULL,
        \`method\` varchar(50) NOT NULL,
        \`reference\` varchar(255) NOT NULL,
        \`plan\` varchar(50) DEFAULT NULL,
        \`billingCycle\` varchar(20) NOT NULL DEFAULT 'monthly',
        \`isApproved\` tinyint(1) NOT NULL DEFAULT 0,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_pending_payments_tenantId\` (\`tenantId\`),
        KEY \`IDX_pending_payments_reference\` (\`reference\`),
        CONSTRAINT \`FK_pending_payments_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 15. LMS Connections
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`lms_connections\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`provider\` varchar(50) NOT NULL,
        \`apiUrl\` varchar(255) NOT NULL,
        \`encrypted_credential_1\` text NOT NULL,
        \`encrypted_credential_2\` text DEFAULT NULL,
        \`encrypted_refresh_token\` text DEFAULT NULL,
        \`isConnected\` tinyint(1) NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_lms_tenant_provider\` (\`tenantId\`, \`provider\`),
        CONSTRAINT \`FK_lms_connections_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 16. Books (Library)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`books\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`author\` varchar(255) NOT NULL,
        \`isbn\` varchar(100) DEFAULT NULL,
        \`status\` varchar(50) NOT NULL DEFAULT 'available',
        PRIMARY KEY (\`id\`),
        KEY \`IDX_books_tenantId\` (\`tenantId\`),
        CONSTRAINT \`FK_books_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 17. Fees
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`fees\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`studentId\` varchar(36) NOT NULL,
        \`amount\` decimal(10,2) NOT NULL,
        \`dueDate\` datetime NOT NULL,
        \`status\` varchar(20) NOT NULL DEFAULT 'unpaid',
        PRIMARY KEY (\`id\`),
        KEY \`IDX_fees_tenantId\` (\`tenantId\`),
        KEY \`IDX_fees_studentId\` (\`studentId\`),
        CONSTRAINT \`FK_fees_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 18. Expenses
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`expenses\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`category\` varchar(100) NOT NULL,
        \`amount\` decimal(10,2) NOT NULL,
        \`date\` datetime NOT NULL,
        \`description\` varchar(500) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_expenses_tenantId\` (\`tenantId\`),
        CONSTRAINT \`FK_expenses_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 19. Payrolls
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`payrolls\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`staffId\` varchar(36) NOT NULL,
        \`salary\` decimal(10,2) NOT NULL,
        \`payDate\` datetime NOT NULL,
        \`status\` varchar(20) NOT NULL DEFAULT 'unpaid',
        PRIMARY KEY (\`id\`),
        KEY \`IDX_payrolls_tenantId\` (\`tenantId\`),
        KEY \`IDX_payrolls_staffId\` (\`staffId\`),
        CONSTRAINT \`FK_payrolls_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 20. Examinations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`examinations\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`subjectId\` varchar(36) NOT NULL,
        \`date\` datetime NOT NULL,
        \`totalMarks\` decimal(5,2) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_examinations_tenantId\` (\`tenantId\`),
        KEY \`IDX_examinations_subjectId\` (\`subjectId\`),
        CONSTRAINT \`FK_examinations_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 21. Report Cards
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`report_cards\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`studentId\` varchar(36) NOT NULL,
        \`examinationId\` varchar(36) NOT NULL,
        \`marks\` decimal(5,2) NOT NULL,
        \`grade\` varchar(20) DEFAULT NULL,
        \`remarks\` varchar(500) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_report_cards_tenantId\` (\`tenantId\`),
        KEY \`IDX_report_cards_studentId\` (\`studentId\`),
        KEY \`IDX_report_cards_examinationId\` (\`examinationId\`),
        CONSTRAINT \`FK_report_cards_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 22. Messages (Communication)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`messages\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`senderId\` varchar(36) NOT NULL,
        \`recipientId\` varchar(36) NOT NULL,
        \`content\` text NOT NULL,
        \`sentAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_messages_tenantId\` (\`tenantId\`),
        KEY \`IDX_messages_senderId\` (\`senderId\`),
        KEY \`IDX_messages_recipientId\` (\`recipientId\`),
        CONSTRAINT \`FK_messages_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 23. Calendar Events
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`calendar_events\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`start\` datetime NOT NULL,
        \`end\` datetime NOT NULL,
        \`description\` varchar(500) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_calendar_events_tenantId\` (\`tenantId\`),
        CONSTRAINT \`FK_calendar_events_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 24. Audit Logs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) DEFAULT NULL,
        \`userId\` varchar(36) NOT NULL,
        \`action\` varchar(50) NOT NULL,
        \`entity\` varchar(100) NOT NULL,
        \`entityId\` varchar(36) DEFAULT NULL,
        \`oldValue\` text DEFAULT NULL,
        \`newValue\` text DEFAULT NULL,
        \`ipAddress\` varchar(100) DEFAULT NULL,
        \`userAgent\` varchar(500) DEFAULT NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_audit_logs_tenantId\` (\`tenantId\`),
        KEY \`IDX_audit_logs_createdAt\` (\`createdAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 25. Attendance
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`attendance\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`studentId\` varchar(36) NOT NULL,
        \`classLevelId\` varchar(36) NOT NULL,
        \`date\` datetime NOT NULL,
        \`status\` varchar(50) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_attendance_tenantId\` (\`tenantId\`),
        KEY \`IDX_attendance_studentId\` (\`studentId\`),
        KEY \`IDX_attendance_date\` (\`date\`),
        CONSTRAINT \`FK_attendance_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 26. Tenant Settings
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`tenant_settings\` (
        \`id\` varchar(36) NOT NULL,
        \`tenantId\` varchar(36) NOT NULL,
        \`schoolName\` varchar(255) DEFAULT NULL,
        \`contactEmail\` varchar(255) DEFAULT NULL,
        \`contactPhone\` varchar(50) DEFAULT NULL,
        \`address\` varchar(500) DEFAULT NULL,
        \`timezone\` varchar(50) DEFAULT 'UTC',
        \`logoUrl\` varchar(500) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_tenant_settings_tenantId\` (\`tenantId\`),
        CONSTRAINT \`FK_tenant_settings_tenants\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0;`);
    const tables = [
      'tenant_settings',
      'attendance',
      'audit_logs',
      'calendar_events',
      'messages',
      'report_cards',
      'examinations',
      'payrolls',
      'expenses',
      'fees',
      'books',
      'lms_connections',
      'pending_payments',
      'subscription_plans',
      'timetable_entries',
      'grading_scales',
      'subjects',
      'staff',
      'students',
      'academic_years',
      'sections',
      'class_levels',
      'role_permissions',
      'permissions',
      'users',
      'tenants',
    ];

    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS \`${table}\`;`);
    }
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1;`);
  }
}
