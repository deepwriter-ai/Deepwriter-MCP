import * as apiClient from '../api/deepwriterClient.js'; // Import the API client

// Define input/output types based on schema
interface GetProjectDetailsInput {
  api_key: string;
  project_id: string;
}

// Define the MCP-compliant output structure
interface GetProjectDetailsMcpOutput {
  content: { type: 'text'; text: string }[];
}

export const getProjectDetailsTool = {
  name: "getProjectDetails",
  description: "Get detailed information about a specific project",
  // TODO: Add input/output schema validation if needed
  async execute(args: GetProjectDetailsInput): Promise<GetProjectDetailsMcpOutput> {
    console.error(`Executing getProjectDetails tool for project ID: ${args.project_id}...`);

    if (!args.api_key) {
      throw new Error("Missing required argument: api_key");
    }
    if (!args.project_id) {
      throw new Error("Missing required argument: project_id");
    }

    try {
      // Call the actual API client function
      const apiResponse = await apiClient.getProjectDetails(args.api_key, args.project_id);
      console.error(`API call successful for getProjectDetails.`);

      // Transform the API response into MCP format
      const mcpResponse: GetProjectDetailsMcpOutput = {
        content: [
          { type: 'text', text: `Project ID: ${apiResponse.project.id}` },
          { type: 'text', text: `Title: ${apiResponse.project.title}` },
          { type: 'text', text: `Created At: ${apiResponse.project.created_at}` },
          { type: 'text', text: `Updated At: ${apiResponse.project.updated_at}` },
          // Include optional fields if they exist
          ...(apiResponse.project.author ? [{ type: 'text' as const, text: `Author: ${apiResponse.project.author}` }] : []),
          ...(apiResponse.project.model ? [{ type: 'text' as const, text: `Model: ${apiResponse.project.model}` }] : []),
          // Display prompt (might be large/complex)
          { type: 'text', text: `Prompt: ${JSON.stringify(apiResponse.project.prompt ?? 'N/A', null, 2)}` },
          // Add other relevant fields as needed
          ...(apiResponse.project.work_description ? [{ type: 'text' as const, text: `Work Description: ${apiResponse.project.work_description}` }] : []),
        ]
      };

      return mcpResponse; // Return the MCP-compliant structure
    } catch (error) {
      console.error(`Error executing getProjectDetails tool: ${error}`);
      // Format error for MCP response
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get project details for ID ${args.project_id}: ${errorMessage}`);
    }
  }
};
