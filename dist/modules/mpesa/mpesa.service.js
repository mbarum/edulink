"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const axios_2 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rxjs_1 = require("rxjs");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const pending_payment_entity_1 = require("../payments/entities/pending-payment.entity");
const tenancy_service_1 = require("../../core/tenancy/tenancy.service");
const subscription_enums_1 = require("../../common/subscription.enums");
let MpesaService = class MpesaService {
    constructor(configService, httpService, tenantRepository, pendingPaymentRepository, tenancyService) {
        this.configService = configService;
        this.httpService = httpService;
        this.tenantRepository = tenantRepository;
        this.pendingPaymentRepository = pendingPaymentRepository;
        this.tenancyService = tenancyService;
    }
    async getAccessToken() {
        const consumerKey = this.configService.get('MPESA_CONSUMER_KEY');
        const consumerSecret = this.configService.get('MPESA_CONSUMER_SECRET');
        if (!consumerKey || !consumerSecret) {
            throw new Error('M-Pesa Consumer Key or Secret is missing in environment variables.');
        }
        const auth = Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString('base64');
        try {
            const response = await axios_2.default.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
                headers: {
                    Authorization: `Basic ${auth}`,
                    Accept: 'application/json',
                },
            });
            return response.data.access_token;
        }
        catch (error) {
            let errorMessage = 'Unknown error';
            let statusCode = 500;
            if (axios_2.default.isAxiosError(error)) {
                statusCode = error.response?.status || 500;
                const errorData = error.response?.data;
                errorMessage =
                    errorData?.errorMessage ||
                        errorData?.message ||
                        errorData?.errorCode ||
                        error.message;
                console.error('M-Pesa OAuth Error Details:', {
                    status: statusCode,
                    data: error.response?.data,
                });
                if (statusCode === 400) {
                    errorMessage = `Bad Request: Check if your Consumer Key/Secret are valid for the sandbox environment. (${errorMessage})`;
                }
                else if (statusCode === 401) {
                    errorMessage = `Unauthorized: Invalid Consumer Key or Secret. (${errorMessage})`;
                }
            }
            else if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error('M-Pesa OAuth Error:', errorMessage);
            throw new Error(`M-Pesa Authentication Failed (Status ${statusCode}): ${errorMessage}`);
        }
    }
    async stkPush(phone, amount, plan, billingCycle) {
        const tenantId = this.tenancyService.getTenantId();
        if (!tenantId) {
            throw new common_1.NotFoundException('Tenant context missing. Please ensure you are logged in and have a valid tenant ID.');
        }
        const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found in database.`);
        }
        let normalizedPhone = phone.replace(/\D/g, '');
        if (normalizedPhone.startsWith('0')) {
            normalizedPhone = '254' + normalizedPhone.substring(1);
        }
        else if (normalizedPhone.startsWith('7')) {
            normalizedPhone = '254' + normalizedPhone;
        }
        const accessToken = await this.getAccessToken();
        const shortCode = this.configService.get('MPESA_SHORTCODE')?.trim();
        const passkey = this.configService.get('MPESA_PASSKEY')?.trim();
        const callbackUrl = this.configService.get('MPESA_CALLBACK_URL')?.trim();
        if (!shortCode || !passkey || !callbackUrl) {
            throw new Error('M-Pesa configuration (Shortcode, Passkey, or Callback URL) is missing.');
        }
        const timestamp = new Date()
            .toISOString()
            .replace(/[^0-9]/g, '')
            .slice(0, -3);
        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.round(amount),
                PartyA: normalizedPhone,
                PartyB: shortCode,
                PhoneNumber: normalizedPhone,
                CallBackURL: callbackUrl,
                AccountReference: 'SaasLink Subscription',
                TransactionDesc: 'Payment for subscription',
            }, { headers: { Authorization: `Bearer ${accessToken}` } }));
            if (data && data.ResponseCode === '0') {
                const pendingPayment = this.pendingPaymentRepository.create({
                    tenant,
                    amount,
                    method: pending_payment_entity_1.PaymentMethod.MPESA,
                    reference: data.CheckoutRequestID,
                    plan,
                    billingCycle,
                });
                await this.pendingPaymentRepository.save(pendingPayment);
            }
            return data;
        }
        catch (error) {
            let errorData = 'Unknown error';
            let errorMessage = 'Failed to process STK Push';
            let statusCode = 500;
            if (axios_2.default.isAxiosError(error)) {
                statusCode = error.response?.status || 500;
                errorData = error.response?.data || error.message;
                if (typeof errorData === 'object' && errorData !== null) {
                    const data = errorData;
                    errorMessage = data.errorMessage || data.message || errorMessage;
                }
                else {
                    errorMessage = error.message;
                }
            }
            else if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error('Mpesa STK Push Error:', JSON.stringify(errorData, null, 2));
            throw new Error(`M-Pesa STK Push Failed (Status ${statusCode}): ${errorMessage}`);
        }
    }
    async handleCallback(callbackData) {
        console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));
        const body = callbackData.Body;
        if (!body || !body.stkCallback) {
            console.warn('Invalid M-Pesa callback body received');
            return { ResultCode: 1, ResultDesc: 'Invalid body' };
        }
        const { ResultCode, ResultDesc, CheckoutRequestID } = body.stkCallback;
        if (ResultCode === 0) {
            console.log(`M-Pesa Payment Successful for CheckoutRequestID: ${CheckoutRequestID}`);
            const pendingPayment = await this.pendingPaymentRepository.findOne({
                where: { reference: CheckoutRequestID },
                relations: ['tenant'],
            });
            if (pendingPayment) {
                pendingPayment.isApproved = true;
                await this.pendingPaymentRepository.save(pendingPayment);
                const tenant = pendingPayment.tenant;
                tenant.subscriptionStatus = subscription_enums_1.SubscriptionStatus.ACTIVE;
                if (pendingPayment.plan) {
                    tenant.plan = pendingPayment.plan;
                }
                const baseDate = tenant.expiresAt && tenant.expiresAt > new Date() ? new Date(tenant.expiresAt) : new Date();
                if (pendingPayment.billingCycle === 'annual') {
                    baseDate.setFullYear(baseDate.getFullYear() + 1);
                }
                else {
                    baseDate.setMonth(baseDate.getMonth() + 1);
                }
                tenant.expiresAt = baseDate;
                await this.tenantRepository.save(tenant);
                console.log(`Tenant ${tenant.name} subscription activated/updated to ${tenant.plan}`);
            }
            else {
                console.error(`Pending payment not found for CheckoutRequestID: ${CheckoutRequestID}`);
            }
        }
        else {
            console.warn(`M-Pesa Payment Failed/Cancelled. ResultCode: ${ResultCode}, Description: ${ResultDesc}`);
        }
        return { ResultCode: 0, ResultDesc: 'Success' };
    }
};
exports.MpesaService = MpesaService;
exports.MpesaService = MpesaService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(3, (0, typeorm_1.InjectRepository)(pending_payment_entity_1.PendingPayment)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        tenancy_service_1.TenancyService])
], MpesaService);
//# sourceMappingURL=mpesa.service.js.map