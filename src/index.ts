import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables early if needed globally or by API client internally

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listProjectsTool } from './tools/listProjects';
import { getProjectDetailsTool } from './tools/getProjectDetails';
import { createProjectTool } from './tools/createProject';
import { updateProjectTool } from './tools/updateProject';
import { deleteProjectTool } from './tools/deleteProject';
import { generateWorkTool } from './tools/generateWork';
import { TextContent } from '@modelcontextprotocol/sdk/types'; // Import TextContent type

console.error("DeepWriter MCP Server starting with SDK...");

// --- Environment Variable Check (Optional - SDK doesn't mandate this, but tools might need it) ---
const apiKeyFromEnv = process.env.DEEPWRITER_API_KEY;
if (!apiKeyFromEnv) {
  // Log a warning, but let tools handle missing key if passed via args instead
  console.error("WARNING: DEEPWRITER_API_KEY environment variable not found! Tools might require it as an argument.");
} else {
  console.error("DEEPWRITER_API_KEY environment variable found (may be used by tools if not passed as arg).");
}

// --- Zod Schemas for Tool Inputs ---
// Assuming api_key is required for most tools based on listProjects example
const apiKeySchema = z.object({
  api_key: z.string().describe("The DeepWriter API key for authentication.")
});

const listProjectsInputSchema = apiKeySchema; // Only needs API key

const getProjectDetailsInputSchema = apiKeySchema.extend({
  project_id: z.string().describe("The ID of the project to retrieve details for.")
});

const createProjectInputSchema = apiKeySchema.extend({
  title: z.string().describe("The title for the new project."),
  email: z.string().email().describe("The email associated with the project.") // Added email
});

// Define the schema for the nested 'updates' object
const projectUpdatesSchema = z.object({
    author: z.string().optional().describe("Author of the work"),
    email: z.string().email().optional().describe("Email associated with the project"),
    model: z.string().optional().describe("AI model used"),
    outline_text: z.string().optional().describe("Outline text"),
    prompt: z.string().optional().describe("Main prompt for generation"),
    style_text: z.string().optional().describe("Stylistic guidance text"),
    supplemental_info: z.string().optional().describe("Supplemental information"),
    title: z.string().optional().describe("New title for the project"),
    work_description: z.string().optional().describe("Description of the work"),
    work_details: z.string().optional().describe("Detailed information about the work"),
    work_vision: z.string().optional().describe("Vision for the work")
}).describe("Object containing fields to update.");

const updateProjectInputSchema = apiKeySchema.extend({
  project_id: z.string().describe("The ID of the project to update."),
  updates: projectUpdatesSchema // Use the nested schema for updates
});

const deleteProjectInputSchema = apiKeySchema.extend({
  project_id: z.string().describe("The ID of the project to delete.")
});

const generateWorkInputSchema = apiKeySchema.extend({
  project_id: z.string().describe("The ID of the project to generate work for."),
  prompt: z.string().describe("The prompt or instructions for work generation.")
  // Add other relevant parameters for generation
});


// --- Initialize MCP Server ---
const server = new McpServer({
  name: "deepwriter-mcp",
  version: "1.0.0",
  capabilities: {
    // Declare capabilities - only tools in this case
    tools: { listChanged: false }, // Set listChanged to true if tools can change dynamically
    // resources: {}, // Declare if exposing resources
    // prompts: {}, // Declare if exposing prompts
    logging: {} // Enable logging capability
  }
});

// --- Register Tools with SDK ---

server.tool(
  listProjectsTool.name,
  listProjectsTool.description,
  {
    api_key: z.string().describe("The DeepWriter API key for authentication.")
  },
  async ({ api_key }) => {
    // The SDK wrapper handles the final response structure.
    // The tool's execute function should return the array for the 'content' field.
    // Or throw an error, which the SDK will format correctly.
    console.error(`SDK invoking ${listProjectsTool.name}...`);
    const result = await listProjectsTool.execute({ api_key });
    // Return the result in the format expected by the SDK
    return {
      content: result.content
    };
  }
);

server.tool(
  getProjectDetailsTool.name,
  getProjectDetailsTool.description,
  {
    api_key: z.string().describe("The DeepWriter API key for authentication."),
    project_id: z.string().describe("The ID of the project to retrieve details for.")
  },
  async ({ api_key, project_id }) => {
    console.error(`SDK invoking ${getProjectDetailsTool.name}...`);
    const result = await getProjectDetailsTool.execute({ api_key, project_id });
    return {
      content: result.content
    };
  }
);

server.tool(
  createProjectTool.name,
  createProjectTool.description,
  {
    api_key: z.string().describe("The DeepWriter API key for authentication."),
    title: z.string().describe("The title for the new project."),
    email: z.string().email().describe("The email associated with the project.")
  },
  async ({ api_key, title, email }) => {
    console.error(`SDK invoking ${createProjectTool.name}...`);
    const result = await createProjectTool.execute({ api_key, title, email });
    return {
      content: result.content
    };
  }
);

server.tool(
  updateProjectTool.name,
  updateProjectTool.description,
  {
    api_key: z.string().describe("The DeepWriter API key for authentication."),
    project_id: z.string().describe("The ID of the project to update."),
    updates: z.object({
      author: z.string().optional().describe("Author of the work"),
      email: z.string().email().optional().describe("Email associated with the project"),
      model: z.string().optional().describe("AI model used"),
      outline_text: z.string().optional().describe("Outline text"),
      prompt: z.string().optional().describe("Main prompt for generation"),
      style_text: z.string().optional().describe("Stylistic guidance text"),
      supplemental_info: z.string().optional().describe("Supplemental information"),
      title: z.string().optional().describe("New title for the project"),
      work_description: z.string().optional().describe("Description of the work"),
      work_details: z.string().optional().describe("Detailed information about the work"),
      work_vision: z.string().optional().describe("Vision for the work")
    }).describe("Object containing fields to update.")
  },
  async ({ api_key, project_id, updates }) => {
    console.error(`SDK invoking ${updateProjectTool.name}...`);
    const result = await updateProjectTool.execute({ api_key, project_id, updates });
    return {
      content: result.content
    };
  }
);

server.tool(
  deleteProjectTool.name,
  deleteProjectTool.description,
  {
    api_key: z.string().describe("The DeepWriter API key for authentication."),
    project_id: z.string().describe("The ID of the project to delete.")
  },
  async ({ api_key, project_id }) => {
    console.error(`SDK invoking ${deleteProjectTool.name}...`);
    const result = await deleteProjectTool.execute({ api_key, project_id });
    return {
      content: result.content
    };
  }
);

server.tool(
  generateWorkTool.name,
  generateWorkTool.description,
  {
    api_key: z.string().describe("The DeepWriter API key for authentication."),
    project_id: z.string().describe("The ID of the project to generate work for."),
    is_default: z.boolean().optional().describe("Whether to use default settings (optional, defaults to true).")
  },
  async ({ api_key, project_id, is_default }) => {
    console.error(`SDK invoking ${generateWorkTool.name}...`);
    const result = await generateWorkTool.execute({ api_key, project_id, is_default });
    return {
      content: result.content
    };
  }
);


// --- Connect Transport and Run Server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server with SDK ready. Listening via stdio transport...");

  // Keep the server running. The SDK handles the connection lifecycle.
  // No need for await transport.closed() here. The process should exit when stdin closes.
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
