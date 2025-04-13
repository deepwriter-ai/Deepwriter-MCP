import * as apiClient from '../api/deepwriterClient'; // Import the API client

// Define input/output types based on schema
interface CreateProjectInputArgs {
  api_key: string;
  title: string;
}

// Re-use the response type from the API client
type CreateProjectOutput = apiClient.CreateProjectResponse;

export const createProjectTool = {
  name: "createProject",
  description: "Create a new project",
  // TODO: Add input/output schema validation if needed
  async execute(args: CreateProjectInputArgs): Promise<CreateProjectOutput> {
    console.error(`Executing createProject tool with title: ${args.title}...`);

    if (!args.api_key) {
      throw new Error("Missing required argument: api_key");
    }
    if (!args.title) {
      throw new Error("Missing required argument: title");
    }

    try {
      // Call the actual API client function
      const response = await apiClient.createProject(args.api_key, args.title);
      console.error(`API call successful for createProject. New project ID: ${response.id}`);
      return response; // Return the structure expected by the output schema
    } catch (error) {
      console.error(`Error executing createProject tool: ${error}`);
      // TODO: Re-throw or format error for MCP response
      throw error; // Propagate the error for now
    }
  }
};