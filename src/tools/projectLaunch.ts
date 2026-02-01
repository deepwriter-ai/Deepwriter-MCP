// projectLaunch.ts
import { z } from "zod";
import * as apiClient from "../api/deepwriterClient.js";

export const projectLaunchInputSchema = z.object({
  projectId: z.string().describe("The ID of the project prepared in Phase 1"),
  answers: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).describe("The Q&A pairs provided by the user"),
  email: z.string().email(),
  author: z.string().default("DeepWriter User"),
  enhancedPrompt: z.string().describe("The formatted prompt from Phase 1")
});

export type ProjectLaunchInput = z.infer<typeof projectLaunchInputSchema>;

export const projectLaunchTool = {
  name: "projectLaunch",
  description: "Phase 2: Submits the user's answers and launches the generation job.",
  
  async execute(args: ProjectLaunchInput) {
    const apiKey = process.env.DEEPWRITER_API_KEY;
    if (!apiKey) throw new Error("API key required");

    try {
      const answersJson = JSON.stringify(args.answers);

      // Launch
      const generateRes = await apiClient.generateWizardWork(apiKey, {
        projectId: args.projectId,
        prompt: args.enhancedPrompt,
        email: args.email,
        author: args.author,
        questions_and_answers: answersJson,
        isDefault: true,
        // High quality defaults
        has_tableofcontents: 'auto',
        use_web_research: 'auto',
        has_technical_diagrams: 'auto',
        mode: 'deepwriter'
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Project Launched. Job ID: ${generateRes.jobId}`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`ProjectLaunch failed: ${errorMessage}`);
    }
  }
};
