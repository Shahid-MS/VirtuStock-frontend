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
  listingReturn: number;
  listingReturnPercent: number;
  subscriptionLastUpdated: string;
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
