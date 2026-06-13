import { getGeminiModel } from "../gemini";
import { SEGMENT_PROMPT } from "../prompts/segment.prompt";
import { CAMPAIGN_PROMPT } from "../prompts/campaign.prompt";
import { AISegmentResponseSchema, AISegmentResponse } from "../validators/segment.schema";
import { AICampaignResponseSchema, AICampaignResponse } from "../validators/campaign.schema";

export interface AIProvider {
  generateSegment(userInput: string): Promise<AISegmentResponse>;
  generateCampaign(userGoal: string): Promise<AICampaignResponse>;
}

export class GeminiProvider implements AIProvider {
  private model = getGeminiModel();

  async generateSegment(userInput: string): Promise<AISegmentResponse> {
    const prompt = SEGMENT_PROMPT.replace("{{USER_INPUT}}", userInput);
    let attempts = 0;
    const maxRetries = 3;

    while (attempts < maxRetries) {
      try {
        attempts++;
        const result = await this.model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const text = result.response.text();
        // Clean markdown code blocks just in case Gemini ignored the prompt rules
        const cleanedText = text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const json = JSON.parse(cleanedText);
        const parsed = AISegmentResponseSchema.parse(json);
        return parsed;
      } catch (err) {
        console.warn(`Attempt ${attempts} to generate segment failed:`, err);
        if (attempts >= maxRetries) {
          throw new Error(`Failed to generate segment after ${maxRetries} retries: ${err}`);
        }
      }
    }
    throw new Error("Failed to generate segment");
  }

  async generateCampaign(userGoal: string): Promise<AICampaignResponse> {
    const prompt = CAMPAIGN_PROMPT.replace("{{USER_GOAL}}", userGoal);
    let attempts = 0;
    const maxRetries = 3;

    while (attempts < maxRetries) {
      try {
        attempts++;
        const result = await this.model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const text = result.response.text();
        const cleanedText = text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const json = JSON.parse(cleanedText);
        const parsed = AICampaignResponseSchema.parse(json);
        return parsed;
      } catch (err) {
        console.warn(`Attempt ${attempts} to generate campaign failed:`, err);
        if (attempts >= maxRetries) {
          throw new Error(`Failed to generate campaign after ${maxRetries} retries: ${err}`);
        }
      }
    }
    throw new Error("Failed to generate campaign");
  }
}
