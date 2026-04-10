import * as passportLocal from 'passport-local';
import { AuthService } from '../auth.service';
declare const LocalStrategy_base: new (...args: [] | [options: passportLocal.IStrategyOptionsWithRequest] | [options: passportLocal.IStrategyOptions]) => passportLocal.Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(username: string, pass: string): Promise<any>;
}
export {};
