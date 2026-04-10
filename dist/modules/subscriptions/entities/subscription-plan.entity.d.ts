export declare enum PlanInterval {
    MONTH = "month",
    YEAR = "year"
}
export declare class SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    interval: PlanInterval;
    stripePriceId: string;
    features: string[];
    isActive: boolean;
}
