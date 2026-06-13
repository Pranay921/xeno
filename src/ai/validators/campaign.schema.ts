import { z } from "zod";

export const AICampaignResponseSchema = z.object({
  campaignName: z.string().min(1, "Campaign name cannot be empty"),
  segmentDescription: z.string().min(1, "Segment description is required"),
  channel: z.enum(["Email", "SMS", "WhatsApp"]),
  message: z.string().min(1, "Message content is required"),
  reasoning: z.string().min(1, "Reasoning is required"),
});

export type AICampaignResponse = z.infer<typeof AICampaignResponseSchema>;
export type AICampaignReasoningParsed = {
  whyAudience: string;
  whyChannel: string;
  whyMessage: string;
};
export function parseCampaignReasoning(reasoning: string): AICampaignReasoningParsed {
  // Try to parse reasoning into components if formatted, or supply fallbacks
  const lines = reasoning.split("\n");
  let whyAudience = "This audience was selected based on your segment criteria.";
  let whyChannel = "This channel was selected based on historical response rates.";
  let whyMessage = "This copy structure historically converts well for this target segment.";

  lines.forEach((line) => {
    if (line.toLowerCase().includes("audience:") || line.toLowerCase().includes("why audience?")) {
      whyAudience = line.replace(/^(why )?audience:?/i, "").trim();
    } else if (line.toLowerCase().includes("channel:") || line.toLowerCase().includes("why channel?")) {
      whyChannel = line.replace(/^(why )?channel:?/i, "").trim();
    } else if (line.toLowerCase().includes("message:") || line.toLowerCase().includes("why message?")) {
      whyMessage = line.replace(/^(why )?message:?/i, "").trim();
    }
  });

  return { whyAudience, whyChannel, whyMessage };
}
