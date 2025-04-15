import * as apiClient from '../api/deepwriterClient.js'; // Import the API client

// Define input/output types based on schema
interface GenerateWorkInputArgs {
  api_key: string;
  projectId?: string;
  project_id?: string; // Support both naming conventions
  is_default?: boolean; // Optional, defaults to true in API client
}

// Define the MCP-compliant output structure
interface GenerateWorkMcpOutput {
  content: { type: 'text'; text: string }[];
}

export const generateWorkTool = {
  name: "generateWork",
  description: "Generate content for a project",
  // TODO: Add input/output schema validation if needed
  async execute(args: GenerateWorkInputArgs): Promise<GenerateWorkMcpOutput> {
    // Support both projectId and project_id
    const projectId = args.projectId || args.project_id;
    
    console.error(`Executing generateWork tool for project ID: ${projectId}...`);

    if (!args.api_key) {
      throw new Error("Missing required argument: api_key");
    }
    if (!projectId) {
      throw new Error("Missing required argument: projectId or project_id");
    }

    // Use provided is_default or let the API client handle the default (true)
    const isDefault = args.is_default !== undefined ? args.is_default : true;

    try {
      // Call the actual API client function
      const apiResponse = await apiClient.generateWork(args.api_key, projectId, isDefault);
      console.error(`API call successful for generateWork. Job ID: ${apiResponse.jobId}`);

      // Transform the API response into MCP format
      const mcpResponse: GenerateWorkMcpOutput = {
        content: [
          { type: 'text', text: `Successfully started generation job for project ID ${projectId}. Job ID: ${apiResponse.jobId ?? 'N/A'}` }
        ]
      };

      return mcpResponse; // Return the MCP-compliant structure
    } catch (error) {
      console.error(`Error executing generateWork tool: ${error}`);
      // Format error for MCP response
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate work for project ID ${projectId}: ${errorMessage}`);
    }
  }
};
