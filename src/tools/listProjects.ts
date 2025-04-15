import * as apiClient from '../api/deepwriterClient.js'; // Import the API client

// Define input/output types based on schema (can be refined later)
interface ListProjectsInput {
  api_key: string;
}

interface Project {
  id: string;
  title: string;
  created_at: string;
  // Add other relevant fields if needed
}

// Define the MCP-compliant output structure
interface ListProjectsOutput {
  content: { type: 'text'; text: string }[];
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
      const apiResponse = await apiClient.listProjects(args.api_key);
      console.error(`API call successful. Received ${apiResponse.projects.length} projects.`);

      // Transform the API response into MCP format
      const mcpResponse: ListProjectsOutput = {
        content: apiResponse.projects.map(project => ({
          type: 'text',
          text: `Project ID: ${project.id}, Title: ${project.title}, Created: ${project.created_at}`
        }))
      };

      if (mcpResponse.content.length === 0) {
        mcpResponse.content.push({ type: 'text', text: 'No projects found.' });
      }

      return mcpResponse; // Return the MCP-compliant structure
    } catch (error) {
      console.error(`Error executing listProjects tool: ${error}`);
      // Format error for MCP response
      // Ensure error is an instance of Error before accessing message
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list projects: ${errorMessage}`);
    }
  }
};
