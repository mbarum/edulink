import { SubscriptionsService } from './subscriptions.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    createCheckoutSession(createCheckoutSessionDto: CreateCheckoutSessionDto): Promise<{
        sessionId: string;
    }>;
    createBillingPortalSession(): Promise<{
        url: string;
    }>;
}
