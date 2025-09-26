import * as dotenv from 'dotenv';
dotenv.config();

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TextContent, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from "zod";

// Define interfaces for tool responses
interface ToolResult {
  content: TextContent[];
  isError?: boolean;
}

interface ToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

// Type for tool response
interface ToolResponse {
  content: TextContent[];
  annotations?: ToolAnnotations;
}
import { listProjectsTool } from './tools/listProjects.js';
import { getProjectDetailsTool } from './tools/getProjectDetails.js';
import { createProjectTool } from './tools/createProject.js';
import { updateProjectTool } from './tools/updateProject.js';
import { deleteProjectTool } from './tools/deleteProject.js';
import { generateWizardWorkTool } from './tools/generateWork.js';
import { formatPromptTool } from './tools/formatPrompt.js';
import { uploadProjectFilesTool } from './tools/uploadProjectFiles.js';

// Define specific interfaces for each tool's parameters
interface ListProjectsParams {
  api_key: string;
}

interface GetProjectDetailsParams {
  api_key: string;
  project_id: string;
}

interface CreateProjectParams {
  api_key: string;
  title: string;
  email: string;
}

interface UpdateProjectParams {
  api_key: string;
  project_id: string;
  updates: {
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
  };
}

interface DeleteProjectParams {
  api_key: string;
  project_id: string;
}

interface GenerateWizardWorkParams {
  api_key: string;
  project_id: string;
  prompt: string;
  author: string;
  email: string;
  outline_text?: string;
  has_technical_diagrams?: 'auto' | 'on' | 'off';
  has_tableofcontents?: 'auto' | 'on' | 'off';
  use_web_research?: 'auto' | 'on' | 'off';
  page_length?: string;
  questions_and_answers?: string;
  mode?: 'deepwriter' | 'benchmark' | 'romance' | 'homework' | 'deepseek' | 'skunkworks';
  isDefault?: boolean;
  max_pages?: number;
  free_trial_mode?: 'true' | 'false';
}

interface FormatPromptParams {
  api_key: string;
  prompt: string;
  project_id?: string;
}

interface UploadProjectFilesParams {
  api_key: string;
  project_id: string;
  files: File[];
}

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

const generateWizardWorkInputSchema = apiKeySchema.extend({
  project_id: z.string().describe("The ID of the project to generate work for."),
  prompt: z.string().describe("Main generation prompt describing the content to create."),
  author: z.string().describe("Author name for the document."),
  email: z.string().email().describe("Author email address."),
  outline_text: z.string().optional().describe("Additional outline instructions or structure guidance."),
  has_technical_diagrams: z.enum(['auto', 'on', 'off']).optional().describe("Whether to include technical diagrams."),
  has_tableofcontents: z.enum(['auto', 'on', 'off']).optional().describe("Whether to include table of contents."),
  use_web_research: z.enum(['auto', 'on', 'off']).optional().describe("Whether to use web research."),
  page_length: z.string().optional().describe("Desired document length specification."),
  questions_and_answers: z.string().optional().describe("JSON string of follow-up questions and answers."),
  mode: z.enum(['deepwriter', 'benchmark', 'romance', 'homework', 'deepseek', 'skunkworks']).optional().describe("Content generation mode."),
  isDefault: z.boolean().optional().describe("Whether to use default system API key."),
  max_pages: z.number().min(1).max(350).optional().describe("Maximum pages allowed for generation."),
  free_trial_mode: z.enum(['true', 'false']).optional().describe("Whether user is on free trial.")
});

const formatPromptInputSchema = apiKeySchema.extend({
  prompt: z.string().describe("The prompt to format and enhance."),
  project_id: z.string().optional().describe("Associated project ID for file access.")
});

const uploadProjectFilesInputSchema = apiKeySchema.extend({
  project_id: z.string().describe("The ID of the project to associate files with."),
  files: z.array(z.any()).describe("Array of File objects to upload.")
});


// --- Initialize MCP Server ---
const server = new McpServer({
  name: "deepwriter-mcp",
  version: "1.0.0",
  capabilities: {
    tools: {
      listChanged: false,
      completions: true // Enable argument completion suggestions
    },
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
  async ({ api_key }: ListProjectsParams) => {
    console.error(`SDK invoking ${listProjectsTool.name}...`);
    const result = await listProjectsTool.execute({ api_key });
    return {
      content: result.content,
      annotations: {
        title: "List Projects",
        readOnlyHint: true, // This tool only reads data
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false // Only accesses DeepWriter API
      }
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
  async ({ api_key, project_id }: GetProjectDetailsParams) => {
    console.error(`SDK invoking ${getProjectDetailsTool.name}...`);
    const result = await getProjectDetailsTool.execute({ api_key, project_id });
    return {
      content: result.content,
      annotations: {
        title: "Get Project Details",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
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
  async ({ api_key, title, email }: CreateProjectParams) => {
    console.error(`SDK invoking ${createProjectTool.name}...`);
    const result = await createProjectTool.execute({ api_key, title, email });
    return {
      content: result.content,
      annotations: {
        title: "Create Project",
        readOnlyHint: false,
        destructiveHint: false, // Creates but doesn't destroy
        idempotentHint: false, // Creates new project each time
        openWorldHint: false
      }
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
  async ({ api_key, project_id, updates }: UpdateProjectParams) => {
    console.error(`SDK invoking ${updateProjectTool.name}...`);
    const result = await updateProjectTool.execute({ api_key, project_id, updates });
    return {
      content: result.content,
      annotations: {
        title: "Update Project",
        readOnlyHint: false,
        destructiveHint: false, // Modifies but doesn't destroy
        idempotentHint: true, // Same updates produce same result
        openWorldHint: false
      }
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
  async ({ api_key, project_id }: DeleteProjectParams) => {
    console.error(`SDK invoking ${deleteProjectTool.name}...`);
    const result = await deleteProjectTool.execute({ api_key, project_id });
    return {
      content: result.content,
      annotations: {
        title: "Delete Project",
        readOnlyHint: false,
        destructiveHint: true, // This is a destructive operation
        idempotentHint: true, // Deleting already deleted project is safe
        openWorldHint: false
      }
    };
  }
);

server.tool(
  generateWizardWorkTool.name,
  generateWizardWorkTool.description,
  {
    api_key: z.string().describe("The DeepWriter API key for authentication."),
    project_id: z.string().describe("The ID of the project to generate work for."),
    prompt: z.string().describe("Main generation prompt describing the content to create."),
    author: z.string().describe("Author name for the document."),
    email: z.string().email().describe("Author email address."),
    outline_text: z.string().optional().describe("Additional outline instructions or structure guidance."),
    has_technical_diagrams: z.enum(['auto', 'on', 'off']).optional().describe("Whether to include technical diagrams."),
    has_tableofcontents: z.enum(['auto', 'on', 'off']).optional().describe("Whether to include table of contents."),
    use_web_research: z.enum(['auto', 'on', 'off']).optional().describe("Whether to use web research."),
    page_length: z.string().optional().describe("Desired document length specification."),
    questions_and_answers: z.string().optional().describe("JSON string of follow-up questions and answers."),
    mode: z.enum(['deepwriter', 'benchmark', 'romance', 'homework', 'deepseek', 'skunkworks']).optional().describe("Content generation mode."),
    isDefault: z.boolean().optional().describe("Whether to use default system API key."),
    max_pages: z.number().min(1).max(350).optional().describe("Maximum pages allowed for generation."),
    free_trial_mode: z.enum(['true', 'false']).optional().describe("Whether user is on free trial.")
  },
  async (params: GenerateWizardWorkParams) => {
    console.error(`SDK invoking ${generateWizardWorkTool.name}...`);
    const result = await generateWizardWorkTool.execute(params);
    return {
      content: result.content,
      annotations: {
        title: "Generate Wizard Work",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    };
  }
);

server.tool(
  formatPromptTool.name,
  formatPromptTool.description,
  {
    api_key: z.string().describe("The DeepWriter API key for authentication."),
    prompt: z.string().describe("The prompt to format and enhance."),
    project_id: z.string().optional().describe("Associated project ID for file access.")
  },
  async ({ api_key, prompt, project_id }: FormatPromptParams) => {
    console.error(`SDK invoking ${formatPromptTool.name}...`);
    const result = await formatPromptTool.execute({ api_key, prompt, project_id });
    return {
      content: result.content,
      annotations: {
        title: "Format Prompt",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    };
  }
);

server.tool(
  uploadProjectFilesTool.name,
  uploadProjectFilesTool.description,
  {
    api_key: z.string().describe("The DeepWriter API key for authentication."),
    project_id: z.string().describe("The ID of the project to associate files with."),
    files: z.array(z.any()).describe("Array of File objects to upload.")
  },
  async ({ api_key, project_id, files }: UploadProjectFilesParams) => {
    console.error(`SDK invoking ${uploadProjectFilesTool.name}...`);
    const result = await uploadProjectFilesTool.execute({ api_key, project_id, files });
    return {
      content: result.content,
      annotations: {
        title: "Upload Project Files",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
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
