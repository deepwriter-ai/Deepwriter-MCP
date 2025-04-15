import * as apiClient from '../api/deepwriterClient.js'; // Import the API client

// Define input/output types based on schema
interface DeleteProjectInputArgs {
  api_key: string;
  project_id: string;
}

// Define the MCP-compliant output structure
interface DeleteProjectMcpOutput {
  content: { type: 'text'; text: string }[];
}

export const deleteProjectTool = {
  name: "deleteProject",
  description: "Delete a project",
  // TODO: Add input/output schema validation if needed
  async execute(args: DeleteProjectInputArgs): Promise<DeleteProjectMcpOutput> {
    console.error(`Executing deleteProject tool for project ID: ${args.project_id}...`);

    if (!args.api_key) {
      throw new Error("Missing required argument: api_key");
    }
    if (!args.project_id) {
      throw new Error("Missing required argument: project_id");
    }

    try {
      // Call the actual API client function
      const apiResponse = await apiClient.deleteProject(args.api_key, args.project_id);
      console.error(`API call successful for deleteProject.`);

      // Transform the API response into MCP format
      const mcpResponse: DeleteProjectMcpOutput = {
        content: [
          // Use the message from the API response
          { type: 'text', text: apiResponse.message }
        ]
      };

      return mcpResponse; // Return the MCP-compliant structure
    } catch (error) {
      console.error(`Error executing deleteProject tool: ${error}`);
      // Format error for MCP response
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete project ID ${args.project_id}: ${errorMessage}`);
    }
  }
};
