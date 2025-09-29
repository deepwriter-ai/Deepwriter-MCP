import * as apiClient from '../api/deepwriterClient.js';

// Define input/output types based on schema (API key from environment)
interface GenerateWizardWorkInputArgs {
  project_id: string;
  prompt: string;
  author: string;
  email: string;
  outline_text?: string;
  has_technical_diagrams?: 'auto' | 'on' | 'off';
  has_tableofcontents?: 'auto' | 'on' | 'off';
  use_web_research?: 'auto' | 'on' | 'off';
  page_length?: string;
  questions_and_answers?: string; // JSON string
  mode?: 'deepwriter' | 'benchmark' | 'romance' | 'homework' | 'deepseek' | 'skunkworks';
  isDefault?: boolean;
  max_pages?: number;
  free_trial_mode?: 'true' | 'false';
}

// Define the MCP-compliant output structure
interface GenerateWizardWorkMcpOutput {
  content: { type: 'text'; text: string }[];
}

export const generateWizardWorkTool = {
  name: "generateWizardWork",
  description: "Generate content using the enhanced wizard workflow with comprehensive parameter support",
  async execute(args: GenerateWizardWorkInputArgs): Promise<GenerateWizardWorkMcpOutput> {
    console.error(`Executing generateWizardWork tool for project ID: ${args.project_id}...`);

    // Get API key from environment
    const apiKey = process.env.DEEPWRITER_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPWRITER_API_KEY environment variable is required");
    }
    if (!args.project_id) {
      throw new Error("Missing required argument: project_id");
    }
    if (!args.prompt) {
      throw new Error("Missing required argument: prompt");
    }
    if (!args.author) {
      throw new Error("Missing required argument: author");
    }
    if (!args.email) {
      throw new Error("Missing required argument: email");
    }

    try {
      // Prepare the parameters for the API client (API expects projectId not project_id)
      const wizardParams = {
        projectId: args.project_id,  // Convert project_id to projectId for API
        prompt: args.prompt,
        author: args.author,
        email: args.email,
        outline_text: args.outline_text,
        has_technical_diagrams: args.has_technical_diagrams,
        has_tableofcontents: args.has_tableofcontents,
        use_web_research: args.use_web_research,
        page_length: args.page_length,
        questions_and_answers: args.questions_and_answers,
        mode: args.mode,
        isDefault: args.isDefault,
        max_pages: args.max_pages,
        free_trial_mode: args.free_trial_mode
      };

      // Call the actual API client function
      const apiResponse = await apiClient.generateWizardWork(apiKey, wizardParams);
      console.error(`API call successful for generateWizardWork. Job ID: ${apiResponse.jobId}`);

      // Transform the API response into MCP format
      const mcpResponse: GenerateWizardWorkMcpOutput = {
        content: [
          { type: 'text', text: `Successfully started wizard work generation for project ID ${args.project_id}. Job ID: ${apiResponse.jobId}. Message: ${apiResponse.message}` }
        ]
      };

      return mcpResponse;
    } catch (error) {
      console.error(`Error executing generateWizardWork tool: ${error}`);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate wizard work for project ID ${args.project_id}: ${errorMessage}`);
    }
  }
};
