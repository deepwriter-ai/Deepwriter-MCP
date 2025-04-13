import * as readline from 'readline';
import * as process from 'process';
import { listProjectsTool } from './tools/listProjects';
import { getProjectDetailsTool } from './tools/getProjectDetails';
import { createProjectTool } from './tools/createProject';
import { updateProjectTool } from './tools/updateProject';
import { deleteProjectTool } from './tools/deleteProject';
import { generateWorkTool } from './tools/generateWork'; // Import generateWork tool

console.log("DeepWriter MCP Server starting...");

// --- Tool Registry ---
// Simple registry, can be expanded later
const toolRegistry: { [key: string]: { execute: (args: any) => Promise<any> } } = {
  [listProjectsTool.name]: listProjectsTool,
  [getProjectDetailsTool.name]: getProjectDetailsTool,
  [createProjectTool.name]: createProjectTool,
  [updateProjectTool.name]: updateProjectTool,
  [deleteProjectTool.name]: deleteProjectTool,
  [generateWorkTool.name]: generateWorkTool,
  // Add other tools here as they are implemented
};

// --- MCP Request/Response Types (Basic) ---
interface McpRequest {
  id: string | number; // Request identifier
  type: 'tool_call';
  tool_name: string;
  arguments: any; // Tool arguments object
}

interface McpResponse {
  id: string | number; // Should match request ID
  type: 'tool_result' | 'error';
  payload: any; // Tool result or error details
}

// --- Stdio Interface ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// --- Request Handling ---
rl.on('line', async (line) => {
  let requestId: string | number | null = null;
  try {
    const request: McpRequest = JSON.parse(line);
    requestId = request.id; // Store request ID early

    console.error(`Received request (${requestId}): ${JSON.stringify(request)}`); // Log to stderr

    if (request.type !== 'tool_call' || !request.tool_name) {
      throw new Error("Invalid request format: Must be type 'tool_call' with 'tool_name'");
    }

    const tool = toolRegistry[request.tool_name];
    if (!tool) {
      throw new Error(`Tool not found: ${request.tool_name}`);
    }

    // Execute the tool
    const result = await tool.execute(request.arguments);

    // Send success response
    const response: McpResponse = {
      id: requestId,
      type: 'tool_result',
      payload: result
    };
    process.stdout.write(JSON.stringify(response) + '\n');
    console.error(`Sent response (${requestId}): ${JSON.stringify(response)}`);

  } catch (error) {
    console.error(`Error processing request (${requestId ?? 'unknown'}): ${error}`);
    // Send error response
    const errorResponse: McpResponse = {
      id: requestId ?? 'error', // Use request ID if available, otherwise 'error'
      type: 'error',
      payload: {
        message: `Failed to execute tool or process request: ${error instanceof Error ? error.message : String(error)}`
        // Consider adding error code or type here
      }
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
});

rl.on('close', () => {
  console.error("Input stream closed. Exiting.");
  process.exit(0);
});

console.error("MCP Server ready. Listening on stdin...");