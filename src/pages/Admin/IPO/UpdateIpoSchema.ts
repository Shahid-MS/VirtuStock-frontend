import { z } from "zod";

export const updateIpoSchema = z.object({
  issueSize: z.object({
    // Optional: not every IPO has a fresh issue or an offer for sale.
    fresh: z.string().nullish(),
    offerForSale: z.string().nullish(),
    totalIssueSize: z.string().min(2, "Total issue size is required"),
  }),

  verdict: z.enum(["STRONG_BUY", "BUY", "WAIT", "AVOID", "NOT_REVIEWED"]),

  // 1 to 5 stars, decimals allowed (BigDecimal on the backend). Optional so
  // IPOs without a rating can still be saved.
  rating: z.number().min(1).max(5).nullish(),
});

export type UpdateIpoFormInput = z.input<typeof updateIpoSchema>;
export type UpdateIpoFormOutput = z.output<typeof updateIpoSchema>;
