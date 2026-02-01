// autoprompter.ts
import { z } from "zod";
import * as apiClient from "../api/deepwriterClient.js";

// Define the input schema for the tool
export const autoprompterInputSchema = z.object({
  prompt: z.string().describe("The initial raw prompt from the user"),
  title: z.string().describe("The title for the new project"),
  email: z.string().email().describe("User email address for the job"),
  author: z.string().optional().default("DeepWriter User").describe("Author name for the job"),
  // Optional tuning parameters
  mode: z.enum(['deepwriter', 'benchmark', 'romance', 'homework', 'deepseek', 'skunkworks']).optional().default('deepwriter'),
});

export type AutoprompterInput = z.infer<typeof autoprompterInputSchema>;

export const autoprompterTool = {
  name: "autoprompter",
  description: "One-shot command to create a project, enhance the prompt, auto-answer questions, and start generation. Use for fully automated workflows.",
  
  async execute(args: AutoprompterInput) {
    console.error(`Executing autoprompter flow for project: ${args.title}`);
    
    const apiKey = process.env.DEEPWRITER_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPWRITER_API_KEY environment variable is required");
    }

    try {
      // Step 1: Create Project
      console.error("Step 1: Creating Project...");
      const createRes = await apiClient.createProject(apiKey, args.title, args.email);
      const projectId = createRes.id;
      console.error(`Project created with ID: ${projectId}`);

      // Step 2: Format (Enhance) Prompt
      console.error("Step 2: Formatting Prompt...");
      const formatRes = await apiClient.formatPrompt(apiKey, args.prompt, projectId);
      const enhancedPrompt = formatRes.enhanced_prompt || formatRes.formatted_prompt || args.prompt;
      const questions = formatRes.questions || [];
      console.error(`Prompt formatted. Received ${questions.length} questions.`);

      // Step 3: Auto-Answer Questions (Heuristic Strategy)
      // Since this is an automated tool, we assume 'generic affirmative' or 'context-aware' answers 
      // are better than blocking. For V1, we will provide a standard set of "intelligent defaults".
      console.error("Step 3: Generating Auto-Answers...");
      const answers = questions.map((q) => {
        return {
          question: q,
          answer: "Proceed with the optimal choice based on the enhanced prompt context."
        };
      });
      const answersJson = JSON.stringify(answers);

      // Step 4: Update Project with Prompt & Answers
      console.error("Step 4: Updating Project...");
      await apiClient.updateProject(apiKey, projectId, {
        prompt: enhancedPrompt,
        // The API expects this field in the generate call usually, but we sync it here if needed.
        // Actually, updateProject usually handles metadata. 
        // We will pass the specific run params to generateWizardWork.
      });

      // Step 5: Launch Job
      console.error("Step 5: Launching Generation Work...");
      const generateRes = await apiClient.generateWizardWork(apiKey, {
        projectId,
        prompt: enhancedPrompt,
        email: args.email,
        author: args.author,
        questions_and_answers: answersJson,
        mode: args.mode,
        // Default high-quality settings
        has_tableofcontents: 'auto',
        use_web_research: 'auto', 
        has_technical_diagrams: 'auto',
        free_trial_mode: 'false'
      });

      console.error(`Job launched successfully! Job ID: ${generateRes.jobId}`);

      return {
        content: [
          {
            type: "text" as const,
            text: `Autoprompter Complete. Job Queued.\nProject ID: ${projectId}\nJob ID: ${generateRes.jobId}\nStatus: ${generateRes.message}`
          }
        ]
      };

    } catch (error) {
      console.error("Autoprompter failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Autoprompter workflow failed: ${errorMessage}`);
    }
  }
};
