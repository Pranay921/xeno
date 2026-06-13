import { GeminiProvider } from "../providers/gemini.provider";
import { prisma } from "@/lib/prisma";
import { AISegmentResponse } from "../validators/segment.schema";

export class SegmentAIService {
  private provider = new GeminiProvider();

  async generateSegment(userInput: string): Promise<AISegmentResponse> {
    const response = await this.provider.generateSegment(userInput);

    // Save generation log to database
    try {
      await prisma.aIGeneration.create({
        data: {
          feature: "segment-builder",
          prompt: userInput,
          response: JSON.stringify(response),
        },
      });
    } catch (err) {
      console.error("Failed to save AI generation log:", err);
    }

    return response;
  }
}

export const segmentAIService = new SegmentAIService();
