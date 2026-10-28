import { z } from "zod";

export const updateIpoSchema = z.object({
  issueSize: z.object({
    fresh: z.string().min(2, "Fresh issue size is required"),
    offerForSale: z.string().min(2, "Offer For Sale is required"),
    totalIssueSize: z.string().min(2, "Total issue size is required"),
  }),

  verdict: z.enum(["STRONG_BUY", "BUY", "WAIT", "AVOID", "NOT_REVIEWED"]),
});

export type UpdateIpoFormInput = z.input<typeof updateIpoSchema>;
export type UpdateIpoFormOutput = z.output<typeof updateIpoSchema>;
