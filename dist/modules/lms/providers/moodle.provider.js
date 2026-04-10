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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodleProvider = void 0;
const common_1 = require("@nestjs/common");
const lms_connection_entity_1 = require("../entities/lms-connection.entity");
const crypto_service_1 = require("../../../shared/crypto.service");
const axios_1 = __importDefault(require("axios"));
let MoodleProvider = class MoodleProvider {
    constructor(connection, cryptoService) {
        this.connection = connection;
        this.cryptoService = cryptoService;
        this.apiUrl = this.connection.apiUrl;
        this.token = this.cryptoService.decrypt(this.connection.encryptedCredential1);
    }
    async authenticate() {
        try {
            const response = await this.makeRequest('core_webservice_get_site_info');
            if (!response.sitename) {
                throw new Error('Invalid Moodle token or API URL.');
            }
            console.log(`Successfully connected to Moodle site: ${response.sitename}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Moodle authentication failed:', message);
            throw new Error('Moodle authentication failed.');
        }
    }
    async syncStudents() {
        const response = await this.makeRequest('core_user_get_users', {
            criteria: [{ key: 'email', value: '%' }],
        });
        return response.users.map((user) => ({
            id: user.id.toString(),
            name: user.fullname,
            email: user.email,
        }));
    }
    async syncCourses() {
        const response = await this.makeRequest('core_course_get_courses');
        return response.map((course) => ({
            id: course.id.toString(),
            name: course.fullname,
        }));
    }
    async getGrades(studentId) {
        console.warn('getGrades for Moodle is a complex operation and this is a placeholder.');
        return (await Promise.resolve([]));
    }
    async makeRequest(wsfunction, args = {}) {
        const response = await axios_1.default.post(this.apiUrl, null, {
            params: {
                wstoken: this.token,
                wsfunction,
                moodlewsrestformat: 'json',
                ...args,
            },
        });
        const data = response.data;
        if (data.exception) {
            throw new Error(`Moodle API Error: ${data.message}`);
        }
        return response.data;
    }
};
exports.MoodleProvider = MoodleProvider;
exports.MoodleProvider = MoodleProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [lms_connection_entity_1.LmsConnection,
        crypto_service_1.CryptoService])
], MoodleProvider);
//# sourceMappingURL=moodle.provider.js.map