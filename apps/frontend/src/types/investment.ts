// Investment plan types and data structures

export interface InvestmentPlan {
  id: string;
  name: string;
  badge?: string;
  minInvest: number;
  maxInvest: number;
  ror: number; // daily rate of return as percentage
  duration: number; // days
  features: string[];
  popular?: boolean;
  limited?: boolean;
}

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: "trial",
    name: "NEW MEMBER TRIAL PLAN",
    badge: "LIMITED PLACES",
    minInvest: 50,
    maxInvest: 100,
    ror: 5,
    duration: 14,
    limited: true,
    features: [
      "Perfect for beginners",
      "5% daily returns",
      "14 days investment period",
      "Instant 24hr withdrawal",
      "10% referral bonus",
    ],
  },
  {
    id: "professional",
    name: "PROFESSIONAL PLAN",
    minInvest: 150,
    maxInvest: 500,
    ror: 4,
    duration: 14,
    features: [
      "Balanced risk/reward",
      "4% daily returns",
      "14 days investment period",
      "Instant 24hr withdrawal",
      "10% referral bonus",
      "Priority support",
    ],
  },
  {
    id: "executive",
    name: "EXECUTIVE PLAN",
    badge: "POPULAR",
    minInvest: 550,
    maxInvest: 1000,
    ror: 5,
    duration: 14,
    popular: true,
    features: [
      "Higher returns",
      "5% daily returns",
      "14 days investment period",
      "Instant 24hr withdrawal",
      "10% referral bonus",
      "Dedicated account manager",
      "Advanced analytics",
    ],
  },
  {
    id: "vvip",
    name: "VVIP PLAN",
    badge: "LIMITED SPOTS",
    minInvest: 1100,
    maxInvest: 5000,
    ror: 5.5,
    duration: 14,
    limited: true,
    features: [
      "Maximum returns",
      "5.5% daily returns",
      "14 days investment period",
      "Instant 24hr withdrawal",
      "10% referral bonus",
      "VIP support 24/7",
      "Exclusive trading insights",
      "Portfolio diversification",
    ],
  },
];

// Calculate total return for a plan
export function calculateTotalReturn(
  amount: number,
  ror: number,
  duration: number
): number {
  return amount * (ror / 100) * duration;
}

// Calculate total payout (principal + returns)
export function calculateTotalPayout(
  amount: number,
  ror: number,
  duration: number
): number {
  return amount + calculateTotalReturn(amount, ror, duration);
}
