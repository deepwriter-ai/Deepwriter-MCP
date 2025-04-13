import * as apiClient from '../api/deepwriterClient'; // Import the API client

// Define input/output types based on schema
interface GetProjectDetailsInput {
  api_key: string;
  project_id: string;
}

// Re-use the response type from the API client
type GetProjectDetailsOutput = apiClient.GetProjectDetailsResponse;

export const getProjectDetailsTool = {
  name: "getProjectDetails",
  description: "Get detailed information about a specific project",
  // TODO: Add input/output schema validation if needed
  async execute(args: GetProjectDetailsInput): Promise<GetProjectDetailsOutput> {
    console.error(`Executing getProjectDetails tool for project ID: ${args.project_id}...`);

    if (!args.api_key) {
      throw new Error("Missing required argument: api_key");
    }
    if (!args.project_id) {
      throw new Error("Missing required argument: project_id");
    }

    try {
      // Call the actual API client function
      const response = await apiClient.getProjectDetails(args.api_key, args.project_id);
      console.error(`API call successful for getProjectDetails.`);
      return response; // Return the structure expected by the output schema
    } catch (error) {
      console.error(`Error executing getProjectDetails tool: ${error}`);
      // TODO: Re-throw or format error for MCP response
      throw error; // Propagate the error for now
    }
  }
};