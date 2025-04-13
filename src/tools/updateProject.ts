import * as apiClient from '../api/deepwriterClient'; // Import the API client

// Define input/output types based on schema
// Re-use ProjectUpdates from API client if possible, or redefine if tool schema differs slightly
interface ProjectUpdatesArgs {
  author?: string;
  email?: string;
  model?: string;
  outline_text?: string;
  prompt?: string;
  style_text?: string;
  supplemental_info?: string;
  title?: string;
  work_description?: string;
  work_details?: string;
  work_vision?: string;
}

interface UpdateProjectInputArgs {
  api_key: string;
  project_id: string;
  updates: ProjectUpdatesArgs;
}

// Re-use the response type from the API client
type UpdateProjectOutput = apiClient.UpdateProjectResponse;

export const updateProjectTool = {
  name: "updateProject",
  description: "Update an existing project",
  // TODO: Add input/output schema validation if needed
  async execute(args: UpdateProjectInputArgs): Promise<UpdateProjectOutput> {
    console.error(`Executing updateProject tool for project ID: ${args.project_id}...`);

    if (!args.api_key) {
      throw new Error("Missing required argument: api_key");
    }
    if (!args.project_id) {
      throw new Error("Missing required argument: project_id");
    }
    if (!args.updates || Object.keys(args.updates).length === 0) {
      throw new Error("Missing required argument: updates (must be a non-empty object)");
    }

    try {
      // Call the actual API client function
      // Note: The API client expects ProjectUpdates type, which matches ProjectUpdatesArgs here
      const response = await apiClient.updateProject(args.api_key, args.project_id, args.updates);
      console.error(`API call successful for updateProject. Updated project ID: ${response.id}`);
      return response; // Return the structure expected by the output schema
    } catch (error) {
      console.error(`Error executing updateProject tool: ${error}`);
      // TODO: Re-throw or format error for MCP response
      throw error; // Propagate the error for now
    }
  }
};