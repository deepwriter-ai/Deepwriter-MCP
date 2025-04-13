import * as apiClient from '../api/deepwriterClient'; // Import the API client

// Define input/output types based on schema
interface DeleteProjectInputArgs {
  api_key: string;
  project_id: string;
}

// Re-use the response type from the API client
type DeleteProjectOutput = apiClient.DeleteProjectResponse;

export const deleteProjectTool = {
  name: "deleteProject",
  description: "Delete a project",
  // TODO: Add input/output schema validation if needed
  async execute(args: DeleteProjectInputArgs): Promise<DeleteProjectOutput> {
    console.error(`Executing deleteProject tool for project ID: ${args.project_id}...`);

    if (!args.api_key) {
      throw new Error("Missing required argument: api_key");
    }
    if (!args.project_id) {
      throw new Error("Missing required argument: project_id");
    }

    try {
      // Call the actual API client function
      const response = await apiClient.deleteProject(args.api_key, args.project_id);
      console.error(`API call successful for deleteProject.`);
      return response; // Return the structure expected by the output schema ({ message: ... })
    } catch (error) {
      console.error(`Error executing deleteProject tool: ${error}`);
      // TODO: Re-throw or format error for MCP response
      throw error; // Propagate the error for now
    }
  }
};