
export enum Tone {
  FORMAL = 'Formal',
  FIRM = 'Firm & Legalistic',
  FRIENDLY = 'Polite & Friendly',
  DIRECT = 'Direct & Concise'
}

export interface UserDetails {
  fullName: string;
  email: string;
  address: string;
  phone: string;
}

export interface SubscriptionDetails {
  serviceName: string;
  accountNumber: string;
  subscriptionPlan: string;
  cancellationReason: string;
  effectiveDate: string;
}

export interface LetterData {
  user: UserDetails;
  subscription: SubscriptionDetails;
  tone: Tone;
}
