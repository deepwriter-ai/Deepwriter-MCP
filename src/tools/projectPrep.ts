// projectPrep.ts
import { z } from "zod";
import * as apiClient from "../api/deepwriterClient.js";

export const projectPrepInputSchema = z.object({
  prompt: z.string().describe("The initial raw prompt from the user"),
  title: z.string().describe("The title for the new project"),
  email: z.string().email().describe("User email address")
});

export type ProjectPrepInput = z.infer<typeof projectPrepInputSchema>;

export const projectPrepTool = {
  name: "projectPrep",
  description: "Phase 1: Initializes a project and returns the Q&A block for the user to answer.",
  
  async execute(args: ProjectPrepInput) {
    const apiKey = process.env.DEEPWRITER_API_KEY;
    if (!apiKey) throw new Error("API key required");

    try {
      // 1. Create
      const createRes = await apiClient.createProject(apiKey, args.title, args.email);
      const projectId = createRes.id;

      // 2. Format
      const formatRes = await apiClient.formatPrompt(apiKey, args.prompt, projectId);
      const enhancedPrompt = formatRes.enhanced_prompt || formatRes.formatted_prompt || args.prompt;
      const questions = formatRes.questions || [];

      // Return structured data for the user (or agent) to process next
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              status: "ready_for_answers",
              projectId: projectId,
              enhancedPrompt: enhancedPrompt,
              questions: questions
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`ProjectPrep failed: ${errorMessage}`);
    }
  }
};
