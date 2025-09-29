import * as apiClient from '../api/deepwriterClient.js';

// Define input/output types based on schema (API key from environment)
interface FormatPromptInputArgs {
  prompt: string;
  project_id?: string;
}

// Define the MCP-compliant output structure
interface FormatPromptMcpOutput {
  content: { type: 'text'; text: string }[];
}

export const formatPromptTool = {
  name: "formatPrompt",
  description: "Format and enhance prompts using AI to improve clarity and effectiveness",
  async execute(args: FormatPromptInputArgs): Promise<FormatPromptMcpOutput> {
    console.error(`Executing formatPrompt tool...`);

    // Get API key from environment
    const apiKey = process.env.DEEPWRITER_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPWRITER_API_KEY environment variable is required");
    }
    if (!args.prompt) {
      throw new Error("Missing required argument: prompt");
    }

    try {
      // Call the actual API client function
      const apiResponse = await apiClient.formatPrompt(apiKey, args.prompt, args.project_id);
      console.error(`API call successful for formatPrompt.`);

      // Transform the API response into MCP format
      const mcpResponse: FormatPromptMcpOutput = {
        content: [
          { type: 'text', text: `Successfully formatted prompt. Enhanced prompt: ${apiResponse.formatted_prompt}` }
        ]
      };

      return mcpResponse;
    } catch (error) {
      console.error(`Error executing formatPrompt tool: ${error}`);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to format prompt: ${errorMessage}`);
    }
  }
};