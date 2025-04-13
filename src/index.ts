import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import * as readline from 'readline';
import * as process from 'process';
import { listProjectsTool } from './tools/listProjects';
import { getProjectDetailsTool } from './tools/getProjectDetails';
import { createProjectTool } from './tools/createProject';
import { updateProjectTool } from './tools/updateProject';
import { deleteProjectTool } from './tools/deleteProject';
import { generateWorkTool } from './tools/generateWork';

console.error("DeepWriter MCP Server starting..."); // Log to stderr

// --- Environment Variable Check ---
const apiKey = process.env.DEEPWRITER_API_KEY;
if (!apiKey) {
  console.error("FATAL ERROR: DEEPWRITER_API_KEY environment variable not found!");
  // Optionally exit if the key is absolutely required for the server to function
  // process.exit(1);
} else {
  console.error("DEEPWRITER_API_KEY environment variable found.");
}

// --- Tool Registry ---
// Simple registry, can be expanded later
const toolRegistry: { [key: string]: { execute: (args: any) => Promise<any>, description?: string } } = {
  [listProjectsTool.name]: listProjectsTool,
  [getProjectDetailsTool.name]: getProjectDetailsTool,
  [createProjectTool.name]: createProjectTool,
  [updateProjectTool.name]: updateProjectTool,
  [deleteProjectTool.name]: deleteProjectTool,
  [generateWorkTool.name]: generateWorkTool,
  // Add other tools here as they are implemented
};

// --- MCP Request/Response Types (JSON-RPC 2.0) ---
interface JsonRpcRequest {
  jsonrpc: string; // Should be "2.0"
  id: string | number; // Request identifier
  method: string; // Method name (e.g., "initialize", "tool_call")
  params: any; // Method parameters
}

interface JsonRpcResponse {
  jsonrpc: string; // Should be "2.0"
  id: string | number; // Should match request ID
  result?: any; // Result object (for success)
  error?: { // Error object (for failure)
    code: number;
    message: string;
    data?: any;
  };
}

// Tool call specific types
interface ToolCallParams {
  tool_name: string;
  arguments: any; // Tool arguments object
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
    const request: JsonRpcRequest = JSON.parse(line);
    requestId = request.id; // Store request ID early

    console.error(`Received request (${requestId}): ${JSON.stringify(request)}`); // Log to stderr

    // Handle different methods
    if (request.method === 'initialize') {
      // Handle initialization request
      const response: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: requestId,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "deepwriter-mcp",
            version: "1.0.0"
          },
          capabilities: {
            tools: Object.keys(toolRegistry).reduce((acc, toolName) => {
              acc[toolName] = {
                description: toolRegistry[toolName].description || `DeepWriter ${toolName} tool`
              };
              return acc;
            }, {} as Record<string, { description: string }>)
          }
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      console.error(`Sent initialization response (${requestId})`);
    } 
    else if (request.method === 'notifications/initialized') {
      // Handle the initialized notification (no response needed)
      console.error(`Received initialized notification`);
      // This is a notification, so no response is needed
    }
    else if (request.method === 'tools/list') {
      // Handle tools list request
      const toolsList = Object.keys(toolRegistry).reduce((acc, toolName) => {
        acc[toolName] = {
          description: toolRegistry[toolName].description || `DeepWriter ${toolName} tool`
        };
        return acc;
      }, {} as Record<string, { description: string }>);
      
      const response: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: requestId,
        result: toolsList
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      console.error(`Sent tools list response (${requestId})`);
    }
    else if (request.method === 'resources/list' || request.method === 'resources/templates/list') {
      // Handle resources list request (we don't have any resources yet)
      const response: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: requestId,
        result: {} // Empty object as we don't have any resources yet
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      console.error(`Sent empty resources list response (${requestId})`);
    }
    else if (request.method === 'tool_call' || request.method === 'tools/call') {
      // Handle tool call
      let toolName: string;
      let toolArgs: any;
      
      // Handle different formats for tool_call vs tools/call
      if (request.method === 'tool_call') {
        const params = request.params as ToolCallParams;
        if (!params.tool_name) {
          throw new Error("Missing tool_name in tool_call params");
        }
        toolName = params.tool_name;
        toolArgs = params.arguments;
      } else { // tools/call
        if (!request.params || !request.params.name) {
          throw new Error("Missing tool name in tools/call params");
        }
        toolName = request.params.name;
        toolArgs = request.params.arguments || {};
      }
      
      console.error(`Executing tool: ${toolName}`);
      
      const tool = toolRegistry[toolName];
      if (!tool) {
        throw new Error(`Tool not found: ${toolName}`);
      }

      // Execute the tool
      const result = await tool.execute(toolArgs);

      // Transform the result to match Claude's expected format
      let transformedResult: any;
      
      // For listProjects, transform projects array to content array
      if (toolName === 'listProjects' && result.projects) {
        transformedResult = {
          content: result.projects.map((project: any) => ({
            id: project.id,
            title: project.title,
            created_at: project.created_at
          }))
        };
      } 
      // For other tools, keep the original result
      else {
        transformedResult = result;
      }

      // Send success response
      const response: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: requestId,
        result: transformedResult
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      console.error(`Sent tool result response (${requestId})`);
    }
    else {
      console.error(`Unsupported method: ${request.method}`);
      // Send error response for unsupported method
      const errorResponse: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: requestId,
        error: {
          code: -32601, // Method not found error code
          message: `Method not supported: ${request.method}`
        }
      };
      process.stdout.write(JSON.stringify(errorResponse) + '\n');
    }

  } catch (error) {
    console.error(`Error processing request (${requestId ?? 'unknown'}): ${error}`);
    // Send error response in JSON-RPC 2.0 format
    const errorResponse: JsonRpcResponse = {
      jsonrpc: "2.0",
      id: requestId ?? 'error', // Use request ID if available, otherwise 'error'
      error: {
        code: -32000, // Server error code
        message: `Failed to execute tool or process request: ${error instanceof Error ? error.message : String(error)}`
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
