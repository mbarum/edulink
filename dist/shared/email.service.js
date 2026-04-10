"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.transporter = null;
    }
    getTransporter() {
        if (!this.transporter) {
            const host = this.configService.get('EMAIL_HOST') || this.configService.get('MAIL_HOST');
            const portStr = this.configService.get('EMAIL_PORT') || this.configService.get('MAIL_PORT') || '587';
            const port = parseInt(portStr, 10);
            const secureStr = this.configService.get('EMAIL_SECURE') || this.configService.get('MAIL_ENCRYPTION');
            const secure = secureStr === 'true' || secureStr === 'ssl' || secureStr === 'tls';
            const user = this.configService.get('EMAIL_USER') || this.configService.get('MAIL_USERNAME');
            const pass = this.configService.get('EMAIL_PASS') || this.configService.get('MAIL_PASSWORD');
            const rejectUnauthorizedStr = this.configService.get('EMAIL_REJECT_UNAUTHORIZED') || this.configService.get('MAIL_REJECT_UNAUTHORIZED');
            const rejectUnauthorized = rejectUnauthorizedStr === 'true';
            if (!host) {
                this.logger.warn('EMAIL_HOST or MAIL_HOST is not defined. Email service may not work correctly.');
            }
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure,
                auth: user && pass
                    ? {
                        user,
                        pass,
                    }
                    : undefined,
                tls: {
                    rejectUnauthorized,
                },
            });
        }
        return this.transporter;
    }
    async sendPasswordResetEmail(to, token) {
        const frontendUrl = this.configService.get('FRONTEND_URL') || this.configService.get('APP_URL') || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;
        const from = this.configService.get('EMAIL_FROM') || this.configService.get('MAIL_FROM_ADDRESS') || 'noreply@example.com';
        const host = this.configService.get('EMAIL_HOST') || this.configService.get('MAIL_HOST');
        if (!host) {
            this.logger.warn(`EMAIL_HOST is not configured. Mocking email to ${to}.`);
            this.logger.log(`[MOCK EMAIL] Password reset link: ${resetLink}`);
            return;
        }
        try {
            await this.getTransporter().sendMail({
                from,
                to,
                subject: 'Your Password Reset Request',
                html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, please ignore this email.</p>`,
            });
            this.logger.log(`Password reset email sent to ${to}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to send password reset email to ${to}: ${errorMessage}`);
            throw error;
        }
    }
    async sendEmail(to, subject, html) {
        const from = this.configService.get('EMAIL_FROM') || this.configService.get('MAIL_FROM_ADDRESS') || 'noreply@example.com';
        const host = this.configService.get('EMAIL_HOST') || this.configService.get('MAIL_HOST');
        if (!host) {
            this.logger.warn(`EMAIL_HOST is not configured. Mocking email to ${to}.`);
            this.logger.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Body: ${html}`);
            return;
        }
        try {
            await this.getTransporter().sendMail({
                from,
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent to ${to} with subject: ${subject}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to send email to ${to}: ${errorMessage}`);
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map