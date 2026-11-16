export interface GMP {
  gmp: number;
  gmpDate: string;
  lastUpdated?: string;
}

export interface issueSize {
  fresh: string;
  offerForSale: string;
  totalIssueSize: string;
}

type Subscriptions = Record<string, string>;

export interface Registrar {
  id?: number;
  name?: string | null;
  slug?: string | null;
  /** Page where applicants check their allotment status. */
  url?: string | null;
  /** Logo image URL; initials are shown when missing or broken. */
  logo?: string | null;
}

/** metric name -> value, e.g. { "Total Income": 2839.67 } */
export type FinancialPeriod = Record<string, number | null>;

export interface IPOFinancials {
  id?: number;
  /** ISO period-end date (e.g. "2026-03-31") -> metrics for that period. */
  financials?: Record<string, FinancialPeriod> | null;
  /** e.g. "Rs. Crore" */
  unit?: string | null;
}

export interface IPOInterface {
  id: string;
  name: string;
  symbol: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  listingDate: string;
  minPrice: number;
  maxPrice: number;
  minQty: number;
  logo: string;
  issueSize: issueSize;
  about: string;
  strengths: string[];
  risks: string[];
  subscriptions: Subscriptions;
  gmp: GMP[];
  listedPrice: number;
  verdict: string;
  /** Admin star rating, 1 to 5 (decimals allowed). Absent until set. */
  rating?: number | null;
  listingReturn: number;
  listingReturnPercent: number;
  subscriptionLastUpdated: string;
  registrar?: Registrar | null;
  allotmentDate?: string | null;
  financials?: IPOFinancials | null;
  /** Optional: direct application link, if the backend provides one. */
  applicationUrl?: string;
}

export interface IPOsProps {
  ipos: IPOInterface[];
}

export interface IPOProps {
  ipo: IPOInterface;
}

export interface SubscriptionProps {
  subscription: Subscriptions;
}

export interface AppliedIPOInterface {
  id: string;
  ipo: IPOInterface;
  appliedLot: number;
  allotment: string;
  appliedDate: Date;
  allotedIpo: AllotedInterface;
}

export interface AllotedInterface {
  id: string;
  allotedDate: Date;
  allotedLot: number;
  netReturn: number;
  netReturnPercent: number;
  sellPrice: number;
}

export interface UserInterface {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  phone: string;
  instagramUrl: string;
  linkedinUrl: string;
  profilePicUrl?: string;
}
