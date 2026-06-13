import { GeminiProvider } from "../providers/gemini.provider";
import { prisma } from "@/lib/prisma";
import { AICampaignResponse } from "../validators/campaign.schema";

export class CampaignAIService {
  private provider = new GeminiProvider();

  async generateCampaign(userGoal: string): Promise<AICampaignResponse> {
    const response = await this.provider.generateCampaign(userGoal);

    // Save generation log to database
    try {
      await prisma.aIGeneration.create({
        data: {
          feature: "campaign-assistant",
          prompt: userGoal,
          response: JSON.stringify(response),
        },
      });
    } catch (err) {
      console.error("Failed to save AI generation log:", err);
    }

    return response;
  }
}

export const campaignAIService = new CampaignAIService();
