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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleClassroomProvider = void 0;
const common_1 = require("@nestjs/common");
const lms_connection_entity_1 = require("../entities/lms-connection.entity");
const crypto_service_1 = require("../../../shared/crypto.service");
const googleapis_1 = require("googleapis");
const config_1 = require("@nestjs/config");
let GoogleClassroomProvider = class GoogleClassroomProvider {
    constructor(connection, cryptoService, configService) {
        this.connection = connection;
        this.cryptoService = cryptoService;
        this.configService = configService;
        const clientId = this.cryptoService.decrypt(this.connection.encryptedCredential1);
        const clientSecret = this.cryptoService.decrypt(this.connection.encryptedCredential2);
        const refreshToken = this.cryptoService.decrypt(this.connection.encryptedRefreshToken);
        this.oauth2Client = new googleapis_1.google.auth.OAuth2(clientId, clientSecret);
        this.oauth2Client.setCredentials({ refresh_token: refreshToken });
        this.classroom = googleapis_1.google.classroom({
            version: 'v1',
            auth: this.oauth2Client,
        });
    }
    async authenticate() {
        try {
            await this.classroom.courses.list({ pageSize: 1 });
            console.log('Successfully authenticated with Google Classroom.');
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Google Classroom authentication failed:', message);
            throw new Error('Google Classroom authentication failed. Please reconnect.');
        }
    }
    async syncStudents() {
        const courses = await this.syncCourses();
        const allStudents = [];
        for (const course of courses) {
            const response = await this.classroom.courses.students.list({
                courseId: course.id,
            });
            const students = response.data.students || [];
            students.forEach((s) => {
                allStudents.push({
                    id: s.userId || '',
                    name: s.profile?.name?.fullName || '',
                    email: s.profile?.emailAddress || '',
                });
            });
        }
        return allStudents;
    }
    async syncCourses() {
        const response = await this.classroom.courses.list({
            pageSize: 100,
        });
        const courses = response.data.courses || [];
        return courses.map((course) => ({
            id: course.id || '',
            name: course.name || '',
        }));
    }
    async getGrades(studentId) {
        const courses = await this.syncCourses();
        const allGrades = [];
        for (const course of courses) {
            const response = await this.classroom.courses.courseWork.studentSubmissions.list({
                courseId: course.id,
                userId: studentId,
            });
            const submissions = response.data.studentSubmissions || [];
            submissions.forEach((sub) => {
                if (sub.assignedGrade) {
                    allGrades.push({
                        courseId: course.id,
                        studentId,
                        grade: sub.assignedGrade.toString(),
                        remarks: sub.draftGrade ? `Draft: ${sub.draftGrade}` : '',
                    });
                }
            });
        }
        return allGrades;
    }
};
exports.GoogleClassroomProvider = GoogleClassroomProvider;
exports.GoogleClassroomProvider = GoogleClassroomProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [lms_connection_entity_1.LmsConnection,
        crypto_service_1.CryptoService,
        config_1.ConfigService])
], GoogleClassroomProvider);
//# sourceMappingURL=google-classroom.provider.js.map