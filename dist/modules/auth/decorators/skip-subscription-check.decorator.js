"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipSubscriptionCheck = void 0;
const common_1 = require("@nestjs/common");
const subscription_guard_1 = require("../guards/subscription.guard");
const SkipSubscriptionCheck = () => (0, common_1.SetMetadata)(subscription_guard_1.SKIP_SUBSCRIPTION_CHECK, true);
exports.SkipSubscriptionCheck = SkipSubscriptionCheck;
//# sourceMappingURL=skip-subscription-check.decorator.js.map