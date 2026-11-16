export interface MonthlyActivitySummary {
  month: string[];
  applied: number[];
  alloted: number[];
  totalIpo: number[];
}

export interface MonthlyProfitSummary {
  month: string[];
  profit: number[];
}

export interface AdminCount {
  totalUsers: number;
  userPercentageGrowth: number;
  totalIpos: number;
  ipoPercentageGrowth: number;
}
