import * as apiClient from '../api/deepwriterClient.js';

// Define input/output types based on schema (API key from environment)
interface FormatPromptInputArgs {
  prompt: string;
  project_id?: string;
}

// Define the MCP-compliant output structure with structured data
interface FormatPromptMcpOutput {
  content: { type: 'text'; text: string }[];
  // Include structured data for use with generateWizardWork
  _meta?: {
    enhanced_prompt: string;
    formatted_prompt?: string;
    questions?: string[];
    questions_and_answers?: string; // JSON string for generateWizardWork
  };
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

      // Prepare questions_and_answers JSON string for generateWizardWork integration
      let questionsAndAnswersJson = '';
      if (apiResponse.questions && apiResponse.questions.length > 0) {
        const questionAnswerPairs = apiResponse.questions.map((question, index) => ({
          question: question,
          answer: `This question will be addressed in the comprehensive content generation process (Question ${index + 1}).`
        }));
        questionsAndAnswersJson = JSON.stringify(questionAnswerPairs);
      }

      // Transform the API response into MCP format with structured data
      const mcpResponse: FormatPromptMcpOutput = {
        content: [
          { type: 'text', text: `✅ Successfully formatted prompt.\n\n📝 Enhanced Prompt:\n${apiResponse.enhanced_prompt}\n` },
          ...(apiResponse.questions && apiResponse.questions.length > 0
            ? [{
                type: 'text' as const,
                text: `❓ Follow-up Questions (${apiResponse.questions.length}):\n${apiResponse.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n`
              }]
            : []
          ),
          {
            type: 'text' as const,
            text: `🔗 Integration Data: This formatted prompt and questions are ready for use with generateWizardWork.`
          }
        ],
        _meta: {
          enhanced_prompt: apiResponse.enhanced_prompt,
          formatted_prompt: apiResponse.enhanced_prompt, // Legacy compatibility
          questions: apiResponse.questions,
          questions_and_answers: questionsAndAnswersJson
        }
      };

      return mcpResponse;
    } catch (error) {
      console.error(`Error executing formatPrompt tool: ${error}`);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to format prompt: ${errorMessage}`);
    }
  }
};