// This script demonstrates how to use the DeepWriter MCP tools
// It lists all available projects and then creates a new test project

const { spawn } = require('child_process');
const path = require('path');

// Path to the MCP server
const serverPath = path.join(__dirname, 'dist', 'index.js');

// Spawn the MCP server process
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', process.stderr],
  env: { ...process.env, DEEPWRITER_API_KEY: process.env.DEEPWRITER_API_KEY }
});

// Track request IDs
let requestId = 0;

// Handle server output
serverProcess.stdout.on('data', (data) => {
  const responseStr = data.toString().trim();
  console.log('Received from server:', responseStr);
  
  try {
    const response = JSON.parse(responseStr);
    
    // If we received a successful initialization response, send a tool call for listProjects
    if (response.id === 0 && response.result && response.result.capabilities) {
      console.log('Initialization successful! Available tools:', 
        response.result.capabilities.tools.map(t => t.name).join(', '));
      
      // Send a tool call request for listProjects
      sendToolCall('listProjects', {
        api_key: process.env.DEEPWRITER_API_KEY
      });
    }
    
    // If we received a successful listProjects response, create a new project
    else if (response.id === 1 && response.result) {
      console.log('Projects list received. Creating a new test project...');
      
      // Send a tool call request for createProject
      sendToolCall('createProject', {
        api_key: process.env.DEEPWRITER_API_KEY,
        title: "Test Project " + new Date().toISOString()
      });
    }
    
    // If we received a successful createProject response, exit
    else if (response.id === 2 && response.result) {
      console.log('Project created successfully with ID:', response.result.id);
      console.log('Test completed successfully!');
      
      // Exit after a short delay
      setTimeout(() => {
        console.log('Terminating server process...');
        serverProcess.kill();
        process.exit(0);
      }, 1000);
    }
  } catch (error) {
    console.error('Error parsing server response:', error);
  }
});

// Function to send a tool call
function sendToolCall(toolName, args) {
  requestId++;
  const toolCallRequest = {
    jsonrpc: "2.0",
    id: requestId,
    method: "tool_call",
    params: {
      tool_name: toolName,
      arguments: args
    }
  };
  
  console.log(`Sending ${toolName} request:`, JSON.stringify(toolCallRequest));
  serverProcess.stdin.write(JSON.stringify(toolCallRequest) + '\n');
}

// Send initialization request
const initRequest = {
  jsonrpc: "2.0",
  id: 0,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "DeepWriterToolsTest",
      version: "1.0.0"
    }
  }
};

console.log('Sending initialization request:', JSON.stringify(initRequest));
serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');

// Handle process exit
process.on('SIGINT', () => {
  console.log('Terminating server process...');
  serverProcess.kill();
  process.exit();
});
