import * as apiClient from '../api/deepwriterClient'; // Import the API client

// Define input/output types based on schema (can be refined later)
interface ListProjectsInput {
  api_key: string;
}

interface Project {
  id: string;
  title: string;
  created_at: string;
}

interface ListProjectsOutput {
  projects: Project[];
}

export const listProjectsTool = {
  name: "listProjects",
  description: "List all projects for the authenticated user",
  // TODO: Add input/output schema validation if needed
  async execute(args: ListProjectsInput): Promise<ListProjectsOutput> {
    console.error(`Executing listProjects tool...`);

    if (!args.api_key) {
      // TODO: Improve error handling for MCP responses
      throw new Error("Missing required argument: api_key");
    }

    try {
      // Call the actual API client function
      const response = await apiClient.listProjects(args.api_key);
      console.error(`API call successful. Received ${response.projects.length} projects.`);
      return response; // Return the structure expected by the output schema
    } catch (error) {
      console.error(`Error executing listProjects tool: ${error}`);
      // TODO: Re-throw or format error for MCP response
      throw error; // Propagate the error for now
    }
  }
};