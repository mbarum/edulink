export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
}

export enum BillingModel {
  FLAT_FEE = 'flat_fee',
  PER_STUDENT = 'per_student',
}

export enum BillingInterval {
  MONTH = 'month',
  TERM = 'term',
  YEAR = 'year',
}
