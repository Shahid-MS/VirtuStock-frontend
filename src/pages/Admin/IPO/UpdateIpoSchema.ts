import { z } from "zod";

export const updateIpoSchema = z.object({
  issueSize: z.object({
    // Optional: not every IPO has a fresh issue or an offer for sale.
    fresh: z.string().nullish(),
    offerForSale: z.string().nullish(),
    totalIssueSize: z.string().min(2, "Total issue size is required"),
  }),

  verdict: z.enum(["STRONG_BUY", "BUY", "WAIT", "AVOID", "NOT_REVIEWED"]),
});

export type UpdateIpoFormInput = z.input<typeof updateIpoSchema>;
export type UpdateIpoFormOutput = z.output<typeof updateIpoSchema>;