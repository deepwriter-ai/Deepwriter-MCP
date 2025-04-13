import * as apiClient from '../api/deepwriterClient'; // Import the API client

// Define input/output types based on schema
interface CreateProjectInputArgs {
  api_key: string;
  title: string;
  email: string;
}

// Define the MCP-compliant output structure
interface CreateProjectMcpOutput {
  content: { type: 'text'; text: string }[];
}

export const createProjectTool = {
  name: "createProject",
  description: "Create a new project",
  // TODO: Add input/output schema validation if needed
  async execute(args: CreateProjectInputArgs): Promise<CreateProjectMcpOutput> {
    console.error(`Executing createProject tool with title: ${args.title}...`);

    if (!args.api_key) {
      throw new Error("Missing required argument: api_key");
    }
    if (!args.title || args.title.trim() === '') {
      throw new Error("Missing required argument: title (cannot be empty)");
    }
    if (!args.email) {
      throw new Error("Missing required argument: email");
    }

    try {
      // Call the actual API client function
      const apiResponse = await apiClient.createProject(args.api_key, args.title, args.email);
      console.error(`API call successful for createProject. New project ID: ${apiResponse.id}`);

      // Transform the API response into MCP format
      const mcpResponse: CreateProjectMcpOutput = {
        content: [
          { type: 'text', text: `Successfully created project '${args.title}' with ID: ${apiResponse.id}` }
        ]
      };

      return mcpResponse; // Return the MCP-compliant structure
    } catch (error) {
      console.error(`Error executing createProject tool: ${error}`);
      // Format error for MCP response
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create project: ${errorMessage}`);
    }
  }
};
