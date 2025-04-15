const { spawn } = require('child_process');
const path = require('path');

// Path to the MCP server
const serverPath = path.join(__dirname, 'build', 'index.js');

// Spawn the MCP server process
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', process.stderr]
});

// Handle server output
serverProcess.stdout.on('data', (data) => {
  const responseStr = data.toString().trim();
  console.log('Received from server:', responseStr);
  
  try {
    const response = JSON.parse(responseStr);
    
    // If we received a successful initialization response, send a tool call
    if (response.result && response.result.capabilities) {
      console.log('Initialization successful! Available tools:', 
        response.result.capabilities.tools.map(t => t.name).join(', '));
      
      // Send a tool call request for listProjects
      const toolCallRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "tool_call",
        params: {
          tool_name: "listProjects",
          arguments: {
            api_key: process.env.DEEPWRITER_API_KEY
          }
        }
      };
      
      console.log('Sending tool call request:', JSON.stringify(toolCallRequest));
      serverProcess.stdin.write(JSON.stringify(toolCallRequest) + '\n');
    }
  } catch (error) {
    console.error('Error parsing server response:', error);
  }
});

// Send initialization request
const initRequest = {
  jsonrpc: "2.0",
  id: 0,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "TestClient",
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
