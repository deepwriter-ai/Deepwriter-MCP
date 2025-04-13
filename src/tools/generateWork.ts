import * as apiClient from '../api/deepwriterClient'; // Import the API client

// Define input/output types based on schema
interface GenerateWorkInputArgs {
  api_key: string;
  project_id: string;
  is_default?: boolean; // Optional, defaults to true in API client
}

// Re-use the response type from the API client
type GenerateWorkOutput = apiClient.GenerateWorkResponse;

export const generateWorkTool = {
  name: "generateWork",
  description: "Generate content for a project",
  // TODO: Add input/output schema validation if needed
  async execute(args: GenerateWorkInputArgs): Promise<GenerateWorkOutput> {
    console.error(`Executing generateWork tool for project ID: ${args.project_id}...`);

    if (!args.api_key) {
      throw new Error("Missing required argument: api_key");
    }
    if (!args.project_id) {
      throw new Error("Missing required argument: project_id");
    }

    // Use provided is_default or let the API client handle the default (true)
    const isDefault = args.is_default !== undefined ? args.is_default : true;

    try {
      // Call the actual API client function
      const response = await apiClient.generateWork(args.api_key, args.project_id, isDefault);
      console.error(`API call successful for generateWork. Job ID: ${response.job_id}`);
      return response; // Return the structure expected by the output schema ({ job_id: ... })
    } catch (error) {
      console.error(`Error executing generateWork tool: ${error}`);
      // TODO: Re-throw or format error for MCP response
      throw error; // Propagate the error for now
    }
  }
};