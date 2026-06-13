import { z } from "zod";

export const AISegmentConditionSchema = z.object({
  field: z.enum(["totalSpend", "city", "gender", "orderCount", "daysSinceLastPurchase"]),
  operator: z.enum([">", "<", "=", ">=", "<=", "contains"]),
  value: z.string(),
});

export const AISegmentResponseSchema = z.object({
  segmentName: z.string().min(1, "Segment name cannot be empty"),
  description: z.string().optional(),
  conditions: z.array(AISegmentConditionSchema),
});

export type AISegmentResponse = z.infer<typeof AISegmentResponseSchema>;
